import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiResult, authorizeUser, controlHeaders, generateRandomState } from '../utils/utils';
import { middyCore } from '../utils/middyWrapper';
import { getClientCredentials } from '../utils/secretsManager';

const ddbClient = new DynamoDBClient({});

const requiredHeaders = ['x-token', 'x-user-id'];

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const region = event.queryStringParameters?.region?.toLowerCase();

  if (!region) {
    return ApiResult(400, JSON.stringify({ error: 'No region selected' }));
  }

  const authorizedUser = await authorizeUser(event, requiredHeaders);

  if (authorizedUser !== undefined) {
    return ApiResult(authorizedUser.status, JSON.stringify(authorizedUser.error));
  }

  const userId = event.headers['x-user-id'];

  if (!userId) {
    return ApiResult(500, JSON.stringify({ error: 'Something went wrong' }));
  }

  const baseUrl = process.env['OAUTH_BASE_URL'];
  const redirectUri = process.env['REDIRECT_URI'];
  if (!baseUrl) {
    return ApiResult(500, JSON.stringify({ error: 'Server error. Try again later' }));
  }

  if (!redirectUri) {
    return ApiResult(500, JSON.stringify({ error: 'Server error. Try again later' }));
  }

  const clientCredentialsSecret = await getClientCredentials();
  const state = generateRandomState();

  const now = new Date().toISOString();

  try {
    const createParams = new UpdateItemCommand({
      TableName: 'wow-extension-profiles',
      Key: {
        user_id: { S: userId },
      },
      UpdateExpression: `
          SET
          #st = :st,
          updated_at = :updated_at,
          ${'created_at = if_not_exists(created_at, :created_at)'}
     `,
      ExpressionAttributeNames: {
        '#st': 'state',
      },
      ExpressionAttributeValues: {
        ':st': { S: state },
        ':updated_at': { S: now },
        ':created_at': { S: now },
      },
    });

    await ddbClient.send(createParams);
  } catch (err) {
    console.log(`Error trying to create user. UserId: ${userId}`);
    throw new Error(err as string);
  }

  const redirectUrl = `https://${region}.${baseUrl}/authorize?response_type=code&client_id=${clientCredentialsSecret.client_id}&redirect_uri=${redirectUri}&state=${state}&scope=wow.profile`;

  return {
    statusCode: 302,
    headers: {
      Location: redirectUrl,
    },
    body: '',
  };
};

export const handler = middyCore(lambdaHandler);
