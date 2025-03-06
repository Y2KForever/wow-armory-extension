import { DynamoDBClient, GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiResult, controlHeaders, simplifyDynamoDBResponse, verifyJwt } from '../utils/utils';
import { middyCore } from '../utils/middyWrapper';
import { getTwitchExtensionSecret } from '../utils/secretsManager';
import jwt from 'jsonwebtoken';
import { JWT } from '../types/Twitch';
import { Talents } from '../types/DynamoDb';

const ddbClient = new DynamoDBClient();

const requiredHeaders = ['x-token'];

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const controlledHeaders = controlHeaders(event.headers, requiredHeaders);
  const spec = event.queryStringParameters?.spec;

  if (!spec) {
    return ApiResult(400, JSON.stringify({ error: 'Not a valid request' }));
  }

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

  const params: GetItemCommandInput = {
    TableName: 'wow-extension-talents',
    Key: {
      spec: {
        S: spec,
      },
    },
  };

  const getCommand = new GetItemCommand(params);

  try {
    const { Item } = await ddbClient.send(getCommand);
    const response = simplifyDynamoDBResponse(Item) as Talents;

    if (response === null) {
      return ApiResult(404, JSON.stringify({ error: 'Spec does not exist.' }));
    }
    return ApiResult(200, JSON.stringify(response));
  } catch (err) {
    console.error(err);
    return ApiResult(500, JSON.stringify({ error: 'Failed to get user' }));
  }
};

export const handler = middyCore(lambdaHandler);
