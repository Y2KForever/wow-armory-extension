import { ApiResult, controlHeaders, simplifyDynamoDBResponse, verifyJwt } from '../utils/utils';
import { ApiCharacter } from '../types/Api';
import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  QueryCommand,
  QueryCommandInput,
  TransactWriteItemsCommand,
  TransactWriteItemsInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { middyCore } from '../utils/middyWrapper';
import BattleNetApi from '../BattleNetApi';
import { ddbProfile, DynamoCharacter } from '../types/DynamoDb';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getTwitchExtensionSecret } from '../utils/secretsManager';
import * as jwt from 'jsonwebtoken';
import { JWT } from '../types/Twitch';

const ddbClient = new DynamoDBClient();
const BattleNetApiManager = BattleNetApi.getInstance();

const processCharacter = async (character: DynamoCharacter, baseUrl: string): Promise<DynamoCharacter | null> => {
  const apiChar: ApiCharacter = {
    class: character.class,
    faction: character.faction,
    gender: character.gender,
    id: character.character_id,
    level: character.level,
    name: character.name,
    namespace: character.namespace,
    race: character.race,
    realm: {
      id: character.realm,
      name: character.realm_name,
    },
  };

  try {
    const isValid = await BattleNetApiManager.fetchCharacterStatus(apiChar, character.region, baseUrl);

    if (!isValid) {
      const deleteParams: DeleteItemCommandInput = {
        TableName: 'wow-extension-characters',
        Key: {
          character_id: { N: character.character_id.toString() },
        },
      };
      await ddbClient.send(new DeleteItemCommand(deleteParams));
      return null;
    }

    const [mediaData, items, summary, talents] = await Promise.all([
      BattleNetApiManager.fetchCharacterMedia(apiChar, character.region, baseUrl),
      BattleNetApiManager.fetchCharacterItems(apiChar, character.region, baseUrl),
      BattleNetApiManager.fetchCharacterSummary(apiChar, character.region, baseUrl),
      BattleNetApiManager.fetchCharacterSpecializations(apiChar, character.region, baseUrl),
    ]);

    return { ...character, ...mediaData, ...items, ...summary, is_valid: isValid.is_valid, ...talents };
  } catch (err) {
    console.error(`Error processing character ${character.character_id}:`, err);
    throw err;
  }
};

const getCharactersForUser = async (userId: number): Promise<DynamoCharacter[]> => {
  const queryParams: QueryCommandInput = {
    TableName: 'wow-extension-characters',
    IndexName: 'user_id-index',
    KeyConditionExpression: 'user_id = :user_id',
    ExpressionAttributeValues: {
      ':user_id': { N: userId.toString() },
    },
  };

  try {
    const queryResult = await ddbClient.send(new QueryCommand(queryParams));
    return queryResult.Items ? (simplifyDynamoDBResponse(queryResult.Items) as DynamoCharacter[]) : [];
  } catch (err) {
    console.error(`Error querying characters for user ${userId}:`, err);
    throw err;
  }
};

const requiredHeaders = ['x-token', 'x-user-id'];

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const baseUrl = process.env['API_BASE_URL'];
  if (!baseUrl) {
    throw new Error(`BaseURL not set.`);
  }

  const controlledHeaders = controlHeaders(event.headers, requiredHeaders);

  if (!controlledHeaders) {
    return ApiResult(400, JSON.stringify({ error: 'Not a valid request' }));
  }

  const twitchSecret = Buffer.from((await getTwitchExtensionSecret()).secret, 'base64');
  verifyJwt(event, twitchSecret);

  const decoded = jwt.decode(event.headers['x-token']!) as JWT;

  if (!decoded) {
    console.log('Could not verify user');
    return ApiResult(403, JSON.stringify({ error: 'Could not verify user' }));
  }

  const userId = event.headers['x-user-id'];

  if (!userId) {
    return ApiResult(400, JSON.stringify({ error: 'No userId supplied' }));
  }

  const now = new Date().toISOString();

  const getUserParams: GetItemCommandInput = {
    TableName: 'wow-extension-profiles',
    Key: {
      user_id: { N: userId.toString() },
    },
  };

  const fetchUser = await ddbClient.send(new GetItemCommand(getUserParams));

  if (!fetchUser.Item) {
    return ApiResult(400, JSON.stringify({ error: `could not find user with user id: ${userId}` }));
  }

  const user = unmarshall(fetchUser.Item) as ddbProfile;

  if (user.forced_update > now) {
    return ApiResult(400, JSON.stringify({ error: 'Not allowed to force update yet' }));
  }

  const characterFetchPromise = getCharactersForUser(parseInt(userId));
  const charactersPerUser = await Promise.all([characterFetchPromise]);

  const allCharacters = charactersPerUser.flat();

  if (allCharacters.length === 0) {
    throw new Error(`No characters found.`);
  }

  const processedCharacters = await Promise.all(allCharacters.map((character) => processCharacter(character, baseUrl)));

  const validCharacters = processedCharacters.filter((character): character is DynamoCharacter => character !== null);

  const uniqueUserIds = Array.from(new Set(validCharacters.map((character) => character.user_id)));

  const profileTransactItems = uniqueUserIds.map((userId) => ({
    Update: {
      TableName: 'wow-extension-profiles',
      Key: {
        user_id: { N: userId.toString() },
      },
      UpdateExpression: 'SET updated_at = :now',
      ExpressionAttributeValues: {
        ':now': { S: now },
      },
    },
  }));

  const characterTransactItems = validCharacters.map((character) => ({
    Put: {
      TableName: 'wow-extension-characters',
      Item: {
        ...marshall(character, { removeUndefinedValues: true }),
        character_id: { N: character.character_id.toString() },
        realm: { N: character.realm.toString() },
        realm_name: { S: character.realm_name.toLowerCase() },
        user_id: { N: character.user_id.toString() },
        region: { S: character.region },
        updated_at: { S: now },
      },
    },
  }));

  const allTransactItems = [...characterTransactItems, ...profileTransactItems];

  if (allTransactItems.length === 0) {
    console.info('No valid transactions to process.');
    return ApiResult(500, JSON.stringify({ error: 'no valid transactions to process.' }));
  }

  const params: TransactWriteItemsInput = {
    TransactItems: allTransactItems,
  };

  try {
    await ddbClient.send(new TransactWriteItemsCommand(params));
  } catch (err) {
    console.error('Error writing transaction:', err);
    throw err;
  }

  try {
    const updateUserParams: UpdateItemCommandInput = {
      TableName: 'wow-extension-profiles',
      Key: {
        user_id: { N: userId },
      },
      UpdateExpression: `SET forced_update = :new`,
      ExpressionAttributeValues: {
        ':new': { S: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString() },
      },
      ReturnValues: 'ALL_NEW',
    };

    const { Attributes } = await ddbClient.send(new UpdateItemCommand(updateUserParams));

    if (!Attributes) {
      return ApiResult(500, JSON.stringify({ error: 'something went wrong' }));
    }

    return ApiResult(200, JSON.stringify(unmarshall(Attributes)));
  } catch (err) {
    console.log(`error: ${err}`);
    return ApiResult(500, JSON.stringify({ error: 'Something went wrong' }));
  }
};

export const handler = middyCore(lambdaHandler);
