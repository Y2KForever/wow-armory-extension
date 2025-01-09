import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiResult } from '../utils/utils';
import { middyCore } from '../utils/middyWrapper';
import { getClientCredentials } from '../utils/secretsManager';
import { TokenResponse } from '../types/battleNet';

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const baseUrl = process.env['OAUTH_BASE_URL'];
  const clientCredentialsSecret = await getClientCredentials();
  if (!baseUrl) {
    return ApiResult(500, JSON.stringify({ error: 'Server error. Try again later' }));
  }
  const code = event.queryStringParameters?.code;
  const state = event.queryStringParameters?.state;

  if (!code || !state) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Something went wrong',
      }),
    };
  }

  try {
    const tokenResponse = await fetch(
      `https://eu.${baseUrl}?grant_type=authorization_code&code=${code}&redirect_uri=http://localhost&client_id=${clientCredentialsSecret.client_id}`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (!tokenResponse.ok) {
      return ApiResult(500, JSON.stringify({ error: 'something went wrong' }));
    }

    const respJSON = (await tokenResponse.json()) as TokenResponse;

    console.log('respJson', JSON.stringify(respJSON));

    return ApiResult(200, JSON.stringify(''));
  } catch (err) {
    console.log(err);
    throw new Error(err as string);
  }
};

export const handler = middyCore(lambdaHandler);
