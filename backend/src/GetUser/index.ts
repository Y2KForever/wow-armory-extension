import { DynamoDBClient, GetItemCommand, GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiResult, controlHeaders, simplifyDynamoDBResponse } from '../utils/utils';
import { middyCore } from '../utils/middyWrapper';
import { getTwitchExtensionSecret } from '../utils/secretsManager';
import jwt from 'jsonwebtoken';
import { JWT } from '../types/twitch';

const ddbClient = new DynamoDBClient();

const requiredHeaders = ['x-token', 'x-user-id'];

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const controlledHeaders = controlHeaders(event.headers, requiredHeaders);

  if (!controlledHeaders) {
    return ApiResult(400, JSON.stringify({ error: 'Not a valid request' }));
  }

  const twitchSecret = Buffer.from((await getTwitchExtensionSecret()).secret, 'base64');

  try {
    jwt.verify(event.headers['x-token']!, twitchSecret, {
      algorithms: ['HS256'],
    });
  } catch (err) {
    console.log(`Could not verify token: ${event.headers['x-token']}`);
    return ApiResult(500, JSON.stringify({ error: 'Could not verify request' }));
  }

  const decoded = jwt.decode(event.headers['x-token']!) as JWT;

  if (!decoded) {
    console.log('Could not verify user');
    return ApiResult(403, JSON.stringify({ error: 'Could not verify user' }));
  }

  const userId = event.headers['x-user-id'];

  if (!userId) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'No user id supplied' }),
    };
  }

  const params: GetItemCommandInput = {
    TableName: 'wow-extension-profiles',
    Key: {
      user_id: {
        S: userId,
      },
    },
  };

  const getCommand = new GetItemCommand(params);

  try {
    const { Item } = await ddbClient.send(getCommand);
    const response = simplifyDynamoDBResponse(Item);

    if (response === null) {
      return ApiResult(404, JSON.stringify({ error: 'User does not exist' }));
    }

    return ApiResult(
      200,
      JSON.stringify({
        userId: response.user_id,
        createdAt: response.created_at,
        updated_at: response.updated_at,
        region: response.region,
      }),
    );
  } catch (err) {
    console.error(err);
    return ApiResult(500, JSON.stringify({ error: 'Failed to get user' }));
  }
};

export const handler = middyCore(lambdaHandler);
