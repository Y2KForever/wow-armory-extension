import { simplifyDynamoDBResponse } from '../utils/utils';
import { ApiCharacter } from '../types/Api';
import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
  ScanCommand,
  ScanCommandInput,
  TransactWriteItemsCommand,
  TransactWriteItemsInput,
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { middyCore } from '../utils/middyWrapper';
import BattleNetApi from '../BattleNetApi';
import { ddbProfile, DynamoCharacter } from '../types/DynamoDb';
import { getClientCredentials } from '../utils/secretsManager';
import { ClientCredentials } from '../types/SecretManager';
import { TokenResponse } from '../types/BattleNet';

const ddbClient = new DynamoDBClient();
const BattleNetApiManager = BattleNetApi.getInstance();

const processCharacter = async (
  character: DynamoCharacter,
  baseUrl: string,
  token: any,
): Promise<DynamoCharacter | null> => {
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
    const isValid = await BattleNetApiManager.fetchCharacterStatus(apiChar, character.region, baseUrl, token);

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
      BattleNetApiManager.fetchCharacterMedia(apiChar, character.region, baseUrl, token),
      BattleNetApiManager.fetchCharacterItems(apiChar, character.region, baseUrl, token),
      BattleNetApiManager.fetchCharacterSummary(apiChar, character.region, baseUrl, token),
      BattleNetApiManager.fetchCharacterSpecializations(apiChar, character.region, baseUrl, token),
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

const lambdaHandler = async (): Promise<void> => {
  const baseUrl = process.env['API_BASE_URL'];
  const secret = process.env['CLIENT_CREDENTAILS_SECRET'];
  if (!baseUrl) {
    throw new Error(`BaseURL not set.`);
  }

  if (!secret) {
    throw new Error(`CLIENT_CREDENTAILS_SECRET not set.`);
  }

  const clientSecret = await getClientCredentials();

  const buffer = Buffer.from(`${clientSecret.client_id}:${clientSecret.client_secret}`).toString('base64');

  const tokenFetch = await fetch(`https://oauth.battle.net/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${buffer}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const token = (await tokenFetch.json()) as TokenResponse;

  const scanParams: ScanCommandInput = {
    TableName: 'wow-extension-profiles',
    ProjectionExpression: 'user_id',
  };

  const res = await ddbClient.send(new ScanCommand(scanParams));
  if (!res.Count || !res.Items) {
    console.info('No profiles found');
    return;
  }

  const simplifiedScanRes = simplifyDynamoDBResponse(res.Items) as ddbProfile[];
  const userIds = simplifiedScanRes.map((profile) => profile.user_id);

  const characterFetchPromises = userIds.map(getCharactersForUser);
  const charactersPerUser = await Promise.all(characterFetchPromises);

  const allCharacters = charactersPerUser.flat();

  if (allCharacters.length === 0) {
    throw new Error(`No characters found.`);
  }

  const processedCharacters = await Promise.all(
    allCharacters.map((character) => processCharacter(character, baseUrl, token.access_token)),
  );

  const validCharacters = processedCharacters.filter((character): character is DynamoCharacter => character !== null);

  const now = new Date().toISOString();

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
    return;
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
};

export const handler = middyCore(lambdaHandler);
