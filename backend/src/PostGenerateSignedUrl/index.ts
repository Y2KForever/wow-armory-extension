import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import crypto from 'crypto';
import { ApiResult, authorizeUser, verifyJwt } from '../utils/utils';
import { getTwitchExtensionSecret } from '../utils/secretsManager';
import jwt from 'jsonwebtoken';
import { middyCore } from '../utils/middyWrapper';

const requiredHeaders = ['x-token', 'x-user-id', 'x-region'];

export const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const authorizedUser = await authorizeUser(event, requiredHeaders);
  const twitchSecret = Buffer.from((await getTwitchExtensionSecret()).secret, 'base64');

  verifyJwt(event, twitchSecret);

  if (authorizedUser !== undefined) {
    return ApiResult(authorizedUser.status, JSON.stringify(authorizedUser.error));
  }

  const exp = Math.floor(Date.now() / 1000) + 300;
  const data = `${event.headers['x-token']}|${event.headers['x-user-id']}|${exp}`;

  try {
    const sig = crypto.createHmac('sha256', '123').update(data).digest('base64url');

    return ApiResult(
      200,
      JSON.stringify(
        `https://wow.y2kforever.com/authorize?region=${event.headers['x-region']}&userId=${event.headers['x-user-id']}&exp=${exp}&sig=${sig}&token=${event.headers['x-token']}`,
      ),
    );
  } catch (err) {
    console.log('err', err);
    return ApiResult(500, JSON.stringify({ error: 'Something went wrong.' }));
  }
};

export const handler = middyCore(lambdaHandler);
