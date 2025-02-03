import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiResult, authorizeUser, simplifyDynamoDBResponse } from '../utils/utils';
import { middyCore } from '../utils/middyWrapper';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { CharactersResponse } from '../types/BattleNet';
import { PostFetchCharacters } from '../types/Api';

const ddbClient = new DynamoDBClient({});

const requiredHeaders = ['x-token', 'x-user-id'];

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const apiBaseUrl = process.env['API_BASE_URL'];

  const body = event.body;

  if (!body) {
    return ApiResult(400, JSON.stringify({ error: 'Body is missing' }));
  }

  const jsonBody = JSON.parse(body) as PostFetchCharacters;

  if (!apiBaseUrl) {
    return ApiResult(500, JSON.stringify({ error: 'Server error. Try again later' }));
  }

  if (!jsonBody.region) {
    return ApiResult(400, JSON.stringify({ error: 'No region set' }));
  }

  if (jsonBody.namespaces.length === 0) {
    return ApiResult(400, JSON.stringify({ error: 'No namespace set' }));
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
      user_id: { N: userId },
    },
  });

  const { Item } = await ddbClient.send(getUserCommand);

  if (!Item) {
    return ApiResult(400, JSON.stringify(`Failed to fetch user`));
  }

  const simplifiedResponse = simplifyDynamoDBResponse(Item);

  const promises = jsonBody.namespaces.map(async (namespace) => {
    const response = await fetch(`https://${jsonBody.region}.${apiBaseUrl}/profile/user/wow?locale=en_US`, {
      headers: {
        Authorization: `Bearer ${simplifiedResponse.state}`,
        'Battlenet-Namespace':
          namespace === 'retail' ? `profile-${jsonBody.region}` : `profile-${namespace}-${jsonBody.region}`,
      },
    });
    if (!response.ok) {
      const resp = await response.text();
      console.log('resp', resp);
      throw new Error(`Error from Battle.net API for namespace: ${namespace}`);
    }

    const respJSON = (await response.json()) as CharactersResponse;

    return respJSON.wow_accounts.flatMap((account) =>
      account.characters.map((character) => ({
        id: character.id,
        name: character.name,
        realm: character.realm,
        class: character.playable_class.name,
        race: character.playable_race.name,
        gender: character.gender.name,
        faction: character.faction.name,
        level: character.level,
        namespace: namespace,
      })),
    );
  });

  try {
    const res = (await Promise.all(promises)).flat();
    return ApiResult(200, JSON.stringify(res));
  } catch (err) {
    console.log(err);
    return ApiResult(500, JSON.stringify({ error: 'Something went wrong' }));
  }
};

export const handler = middyCore(lambdaHandler);
