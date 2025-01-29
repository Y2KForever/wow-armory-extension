import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiResult, authorizeUser, simplifyDynamoDBResponse } from '../utils/utils';
import { middyCore } from '../utils/middyWrapper';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { CharactersResponse } from '../types/battleNet';

const ddbClient = new DynamoDBClient({});

const requiredHeaders = ['x-token', 'x-user-id'];

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const apiBaseUrl = process.env['API_BASE_URL'];

  if (!apiBaseUrl) {
    return ApiResult(500, JSON.stringify({ error: 'Server error. Try again later' }));
  }

  const region = event.queryStringParameters?.region;

  if (!region) {
    return ApiResult(500, JSON.stringify({ error: 'No region set' }));
  }

  const authorizedUser = await authorizeUser(event, requiredHeaders);

  if (authorizedUser !== undefined) {
    return ApiResult(authorizedUser.status, JSON.stringify(authorizedUser.error));
  }

  const userId = event.headers['x-user-id'];

  if (!userId) {
    return ApiResult(500, JSON.stringify({ error: 'Something went wrong' }));
  }

  const getUserCommand = new GetItemCommand({
    TableName: 'wow-extension-profiles',
    Key: {
      user_id: { S: userId },
    },
  });

  const { Item } = await ddbClient.send(getUserCommand);

  if (!Item) {
    return ApiResult(400, JSON.stringify(`Failed to fetch user`));
  }

  const simplifiedResponse = simplifyDynamoDBResponse(Item);

  const response = await fetch(
    `https://${region}.${apiBaseUrl}/profile/user/wow?namespace=profile-${region}&locale=en_US`,
    {
      headers: {
        Authorization: `Bearer ${simplifiedResponse.state}`,
      },
    },
  );

  if (!response.ok) {
    return ApiResult(500, JSON.stringify({ error: 'Error from Battle.net API' }));
  }

  const respJSON = (await response.json()) as CharactersResponse;

  return ApiResult(
    200,
    JSON.stringify(
      respJSON.wow_accounts.flatMap((account) =>
        account.characters.map((character) => ({
          id: character.id,
          name: character.name,
          realm: character.realm.name,
          class: character.playable_class.name,
          race: character.playable_race.name,
          gender: character.gender.name,
          faction: character.faction.name,
          level: character.level,
        })),
      ),
    ),
  );
};

export const handler = middyCore(lambdaHandler);
