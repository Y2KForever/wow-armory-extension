import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiResult, simplifyDynamoDBResponse } from '../utils/utils';
import { middyCore } from '../utils/middyWrapper';
import { getClientCredentials } from '../utils/secretsManager';
import { TokenResponse } from '../types/BattleNet';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

const ddbClient = new DynamoDBClient({});

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const code = event.queryStringParameters?.code;
  const state = event.queryStringParameters?.state;
  const userId = event.queryStringParameters?.userId;

  if (!code || !state) {
    ApiResult(400, JSON.stringify({ error: 'Code or state missing' }));
  }

  if (!userId) {
    return ApiResult(400, JSON.stringify({ error: 'UserId missing' }));
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

  const getCommand = new GetItemCommand({
    TableName: 'wow-extension-profiles',
    Key: {
      user_id: { N: userId },
    },
  });

  const { Item } = await ddbClient.send(getCommand);

  const simplifiedResponse = simplifyDynamoDBResponse(Item);

  if (simplifiedResponse.state !== state) {
    console.log('db state', simplifiedResponse.state);
    console.log('request state', state);
    return ApiResult(500, JSON.stringify({ error: 'Server error. Please try again later.' }));
  }

  const b64 = Buffer.from(`${clientCredentialsSecret.client_id}:${clientCredentialsSecret.client_secret}`).toString(
    'base64',
  );

  try {
    const tokenResponse = await fetch(`https://${baseUrl}/token`, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${b64}`,
      },
      body: `redirect_uri=${redirectUri}?userId=${userId}&grant_type=authorization_code&code=${code}`,
    });

    if (!tokenResponse.ok) {
      const respBody = await tokenResponse.text();
      console.log(respBody);
      return ApiResult(500, JSON.stringify({ error: 'Bad token response' }));
    }

    const respJSON = (await tokenResponse.json()) as TokenResponse;

    const now = new Date().toISOString();

    const updateItemParams = new UpdateItemCommand({
      TableName: 'wow-extension-profiles',
      Key: {
        user_id: { N: userId },
      },
      UpdateExpression: `
              SET
              #st = :st,
              updated_at = :updated_at,
              expires_in = :expires_in,
              ${'created_at = if_not_exists(created_at, :created_at)'}
         `,
      ExpressionAttributeNames: {
        '#st': 'state',
      },
      ExpressionAttributeValues: {
        ':st': { S: respJSON.access_token },
        ':expires_in': { N: (Math.floor(Date.now() / 1000) + respJSON.expires_in).toString() },
        ':updated_at': { S: now },
        ':created_at': { S: now },
      },
    });

    await ddbClient.send(updateItemParams);

    return {
      statusCode: 302,
      headers: {
        Location: `https://landing.y2kforever.com?state=success`,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 302,
      headers: {
        Location: `https://landing.y2kforever.com?state=error`,
      },
    };
  }
};

export const handler = middyCore(lambdaHandler);
