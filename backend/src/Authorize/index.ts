import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiResult, generateRandomState } from '../utils/utils';
import { middyCore } from '../utils/middyWrapper';
import { getClientCredentials } from '../utils/secretsManager';

const ddbClient = new DynamoDBClient({});

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const headers = event.headers;
  let xUserId = headers['x-user-id'];
  if (process.env['NODE_ENV'] !== 'development') {
    if (!xUserId) {
      return ApiResult(400, JSON.stringify({ error: 'No user id' }));
    }
  } else {
    xUserId = '72606078';
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
        user_id: { S: xUserId },
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
    console.log(`Error trying to create user. UserId: ${xUserId}`);
    throw new Error(err as string);
  }

  const redirectUrl = `https://eu.${baseUrl}/authorize?response_type=code&client_id=${clientCredentialsSecret.client_id}&redirect_uri=${redirectUri}&state=${state}&scope=wow.profile`;

  return {
    statusCode: 302,
    headers: {
      Location: redirectUrl,
    },
    body: '',
  };
};

export const handler = middyCore(lambdaHandler);
