import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ApiResult, controlHeaders, verifyJwt } from '../utils/utils';
import { middyCore } from '../utils/middyWrapper';
import { getTwitchExtensionSecret } from '../utils/secretsManager';
import jwt from 'jsonwebtoken';
import { JWT } from '../types/Twitch';
import { ApiInstance } from '../types/Api';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const ddbClient = new DynamoDBClient();

const requiredHeaders = ['x-token'];

const lambdaHandler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const controlledHeaders = controlHeaders(event.headers, requiredHeaders);
  const type = event.queryStringParameters?.type;

  if (!type) {
    return ApiResult(400, JSON.stringify({ error: 'Not a valid request' }));
  }

  if (!controlledHeaders) {
    return ApiResult(400, JSON.stringify({ error: 'Not a valid request' }));
  }

  const twitchSecret = Buffer.from((await getTwitchExtensionSecret()).secret, 'base64');

  verifyJwt(event, twitchSecret);

  const decoded = jwt.decode(event.headers['x-token']!) as JWT;

  if (!decoded) {
    console.log('Could not verify user');
    return ApiResult(403, JSON.stringify({ error: 'Could not verify user' }));
  }

  const instanceQueryCommand = new QueryCommand({
    TableName: 'wow-extension-raids',
    IndexName: 'category_index',
    KeyConditionExpression: '#type = :categoryVal',
    ExpressionAttributeNames: {
      '#type': 'type',
    },
    ExpressionAttributeValues: {
      ':categoryVal': { S: type },
    },
    ConsistentRead: false,
  });

  const groupedRaids = new Map<string, ApiInstance[]>();
  const expansionOrder = [
    'Classic',
    'Burning Crusade',
    'Wrath of the Lich King',
    'Cataclysm',
    'Mists of Pandaria',
    'Warlords of Draenor',
    'Legion',
    'Battle for Azeroth',
    'Shadowlands',
    'Dragonflight',
    'The War Within',
  ];

  try {
    const { Items } = await ddbClient.send(instanceQueryCommand);

    Items?.forEach((item) => {
      const unmarshalled = unmarshall(item) as ApiInstance;

      if (!unmarshalled.modes.some((mode) => mode.is_tracked)) {
        return;
      }

      const name = unmarshalled.expansion.name;

      if (!groupedRaids.has(name)) {
        groupedRaids.set(name, []);
      }
      groupedRaids.get(name)?.push(unmarshalled);
    });

    const sortedGroupedRaids = expansionOrder
      .filter((expansionName) => groupedRaids.has(expansionName))
      .map((expansionName) => ({
        expansion: expansionName,
        raids: groupedRaids.get(expansionName)?.toReversed(),
      }))
      .toReversed();

    return ApiResult(200, JSON.stringify(sortedGroupedRaids));
  } catch (err) {
    console.error(err);
    return ApiResult(500, JSON.stringify({ error: 'Failed to get instances' }));
  }
};

export const handler = middyCore(lambdaHandler);
