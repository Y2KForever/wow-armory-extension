import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiResult, authorizeUser, simplifyDynamoDBResponse } from '../utils/utils';
import { middyCore } from '../utils/middyWrapper';
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { PostFetchCharacters } from '../types/Api';
import BattleNetApi from '../BattleNetApi';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { ddbProfile } from '../types/DynamoDb';

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

  const battleNetApiManager = BattleNetApi.getInstance();

  const user = unmarshall(Item) as ddbProfile;

  try {
    const namespacePromises = jsonBody.namespaces.map(async (namespace) => {
      const resp = await battleNetApiManager.fetchCharacters(
        jsonBody.region,
        apiBaseUrl,
        namespace,
        user.state,
      );

      const allCharacters = resp.wow_accounts.flatMap((account) => account.characters);

      const apiCharacter = allCharacters.map((wowChar) => ({
        id: wowChar.id,
        name: wowChar.name,
        realm: { name: wowChar.realm.name, id: wowChar.realm.id },
        class: wowChar.playable_class.name,
        race: wowChar.playable_race.name,
        gender: wowChar.gender.name,
        faction: wowChar.faction.name,
        level: wowChar.level,
        namespace,
      }));

      const statusPromises = apiCharacter.map(async (char) =>
        battleNetApiManager.fetchCharacterStatus(char, jsonBody.region, apiBaseUrl, user.state),
      );
      const statuses = await Promise.all(statusPromises);

      return allCharacters.map((character, index) => ({
        id: character.id,
        name: character.name,
        realm: character.realm,
        class: character.playable_class.name,
        race: character.playable_race.name,
        gender: character.gender.name,
        faction: character.faction.name,
        level: character.level,
        namespace: namespace,
        is_valid: statuses[index].is_valid,
      }));
    });

    const results = await Promise.all(namespacePromises);
    const flattenedResults = results.flat();
    return ApiResult(200, JSON.stringify(flattenedResults));
  } catch (err) {
    console.error('Error processing namespaces:', err);
    return ApiResult(500, JSON.stringify({ error: 'Something went wrong' }));
  }
};

export const handler = middyCore(lambdaHandler);
