import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiResult, controlHeaders, verifyJwt } from '../utils/utils';
import { middyCore } from '../utils/middyWrapper';
import { getTwitchExtensionSecret } from '../utils/secretsManager';
import jwt from 'jsonwebtoken';
import { JWT } from '../types/twitch';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const ddbClient = new DynamoDBClient();

const requiredHeaders = ['x-token'];

const TABLE = 'wow-extension-achievements';

const SUMMARY_ID = '0';

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
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

  const categoryId = event.queryStringParameters?.categoryId;

  if (categoryId === SUMMARY_ID) {
    return ApiResult(400, JSON.stringify({ error: 'Not a valid request' }));
  }

  try {
    const { Item } = await ddbClient.send(
      new GetItemCommand({ TableName: TABLE, Key: { category_id: { N: categoryId ?? SUMMARY_ID } } }),
    );

    if (!Item) {
      return ApiResult(404, JSON.stringify({ error: 'Achievements have not been indexed yet.' }));
    }

    return ApiResult(200, JSON.stringify(unmarshall(Item)));
  } catch (err) {
    console.error(err);
    return ApiResult(500, JSON.stringify({ error: 'Failed to get achievements' }));
  }
};

export const handler = middyCore(lambdaHandler);
