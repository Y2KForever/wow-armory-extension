import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiResult, authorizeUser, chunkArray, omit, verifyJwt } from '../utils/utils';
import { getTwitchExtensionSecret } from '../utils/secretsManager';
import { PostImportCharactersBody } from '../types/Api';
import { DynamoDBClient, TransactWriteItemsCommand, TransactWriteItemsInput } from '@aws-sdk/client-dynamodb';

import { marshall } from '@aws-sdk/util-dynamodb';
import { middyCore } from '../utils/middyWrapper';
import BattleNetApi from '../BattleNetApi';

const requiredHeaders = ['x-token', 'x-user-id'];

const ddbClient = new DynamoDBClient();
const BattleNetApiManager = BattleNetApi.getInstance();

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const baseUrl = process.env['API_BASE_URL'];

  if (!baseUrl) {
    return ApiResult(500, JSON.stringify({ error: 'Server error. Please try again later.' }));
  }

  const authorizedUser = await authorizeUser(event, requiredHeaders);
  const twitchSecret = Buffer.from((await getTwitchExtensionSecret()).secret, 'base64');

  if (authorizedUser !== undefined) {
    return ApiResult(authorizedUser.status, JSON.stringify(authorizedUser.error));
  }

  const userId = event.headers['x-user-id'];

  if (!userId) {
    return ApiResult(400, JSON.stringify({ error: 'User is missing' }));
  }

  verifyJwt(event, twitchSecret);

  if (!event.body) {
    return ApiResult(400, JSON.stringify({ error: 'Body is missing' }));
  }

  const body = JSON.parse(event.body) as PostImportCharactersBody;

  const chunks = chunkArray(body.characters, 100);

  for (const chunk of chunks) {
    const enrichedCharacter = await Promise.all(
      chunk.map(async (character) => {
        try {
          const isValid = await BattleNetApiManager.fetchCharacterStatus(character, body.region, baseUrl);
          if (!isValid) {
            return { ...character, ...{ is_valid: false } };
          }
          const mediaData = await BattleNetApiManager.fetchCharacterMedia(character, body.region, baseUrl);
          const items = await BattleNetApiManager.fetchCharacterItems(character, body.region, baseUrl);
          const summary = await BattleNetApiManager.fetchCharacterSummary(character, body.region, baseUrl);
          const talents = await BattleNetApiManager.fetchCharacterSpecializations(character, body.region, baseUrl);
          return { ...character, ...mediaData, ...items, ...summary, ...isValid, ...talents };
        } catch (err) {
          console.log(err);
          return character;
        }
      }),
    );

    const now = new Date().toISOString();

    const params: TransactWriteItemsInput = {
      TransactItems: enrichedCharacter.map((character) => ({
        Put: {
          TableName: 'wow-extension-characters',
          Item: {
            ...marshall(omit(character, ['id']), { removeUndefinedValues: true }),
            character_id: { N: character.id.toString() },
            realm: { N: character.realm.id.toString() },
            realm_name: { S: character.realm.name.toLowerCase() },
            user_id: { N: userId },
            region: { S: body.region },
            updated_at: { S: now },
            created_at: { S: now },
          },
        },
      })),
    };

    try {
      await ddbClient.send(new TransactWriteItemsCommand(params));
    } catch (err) {
      console.log(`error: ${err}`);
      return ApiResult(500, JSON.stringify({ error: 'Something went wrong' }));
    }
  }
  return ApiResult(200, JSON.stringify({ success: 'Character import successfull' }));
};
export const handler = middyCore(lambdaHandler);
