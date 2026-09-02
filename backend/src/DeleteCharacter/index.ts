import { DeleteItemCommand, DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { ApiResult, authorizeUser } from '../utils/utils';
import { middyCore } from '../utils/middyWrapper';
import { DynamoCharacter } from '../types/DynamoDb';

const ddbClient = new DynamoDBClient();

const requiredHeaders = ['x-token', 'x-user-id'];

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const authorized = await authorizeUser(event, requiredHeaders);
  if (authorized) {
    return ApiResult(authorized.status, JSON.stringify({ error: authorized.error }));
  }

  const userId = event.headers['x-user-id'];
  const characterId = event.queryStringParameters?.characterId;

  if (!userId) {
    return ApiResult(400, JSON.stringify({ error: 'No userId supplied' }));
  }

  if (!characterId) {
    return ApiResult(400, JSON.stringify({ error: 'No characterId supplied' }));
  }

  const queryParams: QueryCommandInput = {
    TableName: 'wow-extension-characters',
    IndexName: 'user_id-index',
    KeyConditionExpression: 'user_id = :user_id',
    ExpressionAttributeValues: { ':user_id': { N: userId } },
  };

  try {
    const { Items } = await ddbClient.send(new QueryCommand(queryParams));
    const owned = (Items ?? [])
      .map((item) => unmarshall(item) as DynamoCharacter)
      .some((character) => character.character_id.toString() === characterId);

    if (!owned) {
      return ApiResult(404, JSON.stringify({ error: `No character found with character id: ${characterId}` }));
    }

    await ddbClient.send(
      new DeleteItemCommand({
        TableName: 'wow-extension-characters',
        Key: { character_id: { N: characterId } },
      }),
    );

    return ApiResult(200, JSON.stringify({ characterId: Number(characterId) }));
  } catch (err) {
    console.error(`Failed to delete character ${characterId}:`, err);
    return ApiResult(500, JSON.stringify({ error: 'Failed to remove character' }));
  }
};

export const handler = middyCore(lambdaHandler);
