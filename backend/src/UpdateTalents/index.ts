import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { middyCore } from '../utils/middyWrapper';
import BattleNetApi from '../BattleNetApi';
import { getClientCredentials } from '../utils/secretsManager';
import { TokenResponse } from '../types/BattleNet';

const ddbClient = new DynamoDBClient({
  retryMode: 'adaptive',
  maxAttempts: 100,
});
const BattleNetApiManager = BattleNetApi.getInstance();

const lambdaHandler = async (): Promise<void> => {
  const baseUrl = process.env['API_BASE_URL'];
  const secret = process.env['CLIENT_CREDENTAILS_SECRET'];

  if (!baseUrl) {
    throw new Error(`BaseURL not set.`);
  }

  if (!secret) {
    throw new Error(`CLIENT_CREDENTAILS_SECRET not set.`);
  }

  const clientSecret = await getClientCredentials();

  const buffer = Buffer.from(`${clientSecret.client_id}:${clientSecret.client_secret}`).toString('base64');

  const tokenFetch = await fetch(`https://oauth.battle.net/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${buffer}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const token = (await tokenFetch.json()) as TokenResponse;

  const specs = await BattleNetApiManager.fetchTalents('eu', baseUrl, token.access_token);

  if (specs.length === 0) {
    throw new Error('No talent trees returned, refusing to continue.');
  }

  const now = new Date().toISOString();

  // Written one spec at a time rather than as a transaction: each row is
  // independent, and a spec that lands is worth keeping even if a later one
  // fails or the lambda runs out of time.
  let written = 0;

  for (const spec of specs) {
    try {
      await ddbClient.send(
        new PutItemCommand({
          TableName: 'wow-extension-talents',
          Item: {
            ...marshall(spec, { removeUndefinedValues: true }),
            updated_at: { S: now },
          },
        }),
      );
      written += 1;
    } catch (err) {
      console.error(`Failed to write talents for spec ${spec.spec}:`, err);
    }
  }

  console.info(`Wrote talents for ${written} of ${specs.length} specs.`);

  if (written === 0) {
    throw new Error('Failed to write any talent specs.');
  }
};

export const handler = middyCore(lambdaHandler);
