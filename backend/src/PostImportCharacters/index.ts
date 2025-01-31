import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiResult, authorizeUser, chunkArray, omit, verifyJwt } from '../utils/utils';
import { getTwitchExtensionSecret } from '../utils/secretsManager';
import { PostImportCharactersBody } from '../types/Api';
import { DynamoDBClient, TransactWriteItemsCommand, TransactWriteItemsInput } from '@aws-sdk/client-dynamodb';

import { marshall } from '@aws-sdk/util-dynamodb';
import { middyCore } from '../utils/middyWrapper';

const requiredHeaders = ['x-token', 'x-user-id'];

const ddbClient = new DynamoDBClient();

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
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
    const params: TransactWriteItemsInput = {
      TransactItems: chunk.map((character) => ({
        Put: {
          TableName: 'wow-extension-characters',
          Item: {
            ...marshall(omit(character, ['id'])),
            character_id: { N: character.id.toString() },
            realm: { N: character.realm.id.toString() },
            user_id: { S: userId },
            region: { S: body.region },
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
