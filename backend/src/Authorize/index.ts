import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiResult, generateRandomState } from '../utils/utils';
import { middyCore } from '../utils/middyWrapper';
import { getClientCredentials } from '../utils/secretsManager';
import crypto from 'crypto';

const ddbClient = new DynamoDBClient({});

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const region = event.queryStringParameters?.region?.toLowerCase();
  const userId = event.queryStringParameters?.userId;
  const exp = event.queryStringParameters?.exp;
  const sig = event.queryStringParameters?.sig;
  const token = event.queryStringParameters?.token;

  const data = `${token}|${userId}|${exp}`;

  const expectedSig = crypto.createHmac('sha256', '123').update(data).digest('base64url');

  if (expectedSig !== sig || Math.floor(Date.now() / 1000) >= Number(exp)) {
    return ApiResult(400, JSON.stringify({ error: 'Not a valid signature' }));
  }

  if (!region) {
    return ApiResult(400, JSON.stringify({ error: 'No region selected' }));
  }

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
        user_id: { N: userId },
      },
      UpdateExpression: `
          SET
          #st = :st,
          #rg = :rg,
          updated_at = :updated_at,
          ${'created_at = if_not_exists(created_at, :created_at)'}
     `,
      ExpressionAttributeNames: {
        '#st': 'state',
        '#rg': 'region',
      },
      ExpressionAttributeValues: {
        ':st': { S: state },
        ':rg': { S: region },
        ':updated_at': { S: now },
        ':created_at': { S: now },
      },
    });

    await ddbClient.send(createParams);
  } catch (err) {
    console.log(`Error trying to create user. UserId: ${userId}`);
    throw new Error(err as string);
  }

  const redirectUrl = `https://${region}.${baseUrl}/authorize?response_type=code&client_id=${clientCredentialsSecret.client_id}&redirect_uri=${redirectUri}?userId=${userId}&state=${state}&scope=wow.profile`;

  return {
    statusCode: 302,
    headers: {
      Location: redirectUrl,
    },
    body: '',
  };
};

export const handler = middyCore(lambdaHandler);
