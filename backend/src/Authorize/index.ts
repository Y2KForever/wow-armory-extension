import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiResult, generateRandomState } from '../utils/utils';
import { middyCore } from '../utils/middyWrapper';
import { getClientCredentials } from '../utils/secretsManager';

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const baseUrl = process.env['OAUTH_BASE_URL'];
  const redirectUri = process.env['REDIRECT_URL'];
  if (!baseUrl) {
    return ApiResult(500, JSON.stringify({ error: 'Server error. Try again later' }));
  }

  if (!redirectUri) {
    return ApiResult(500, JSON.stringify({ error: 'Server error. Try again later' }));
  }

  const clientCredentialsSecret = await getClientCredentials();
  const state = generateRandomState();
  const redirectUrl = `https://eu.${baseUrl}/authorize?response_type=code&client_id=${clientCredentialsSecret.client_id}&redirect_uri=${redirectUri}&state=${state}`;

  return {
    statusCode: 302,
    headers: {
      Location: redirectUrl,
    },
    body: "",
  };
};

export const handler = middyCore(lambdaHandler);
