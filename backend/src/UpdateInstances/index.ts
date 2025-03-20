import { DynamoDBClient, TransactWriteItemsInput } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { middyCore } from '../utils/middyWrapper';
import BattleNetApi from '../BattleNetApi';
import { getClientCredentials } from '../utils/secretsManager';
import { TokenResponse } from '../types/BattleNet';
import { chunkArray, executeTransaction } from '../utils/utils';

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

  const [instances] = await Promise.all([BattleNetApiManager.fetchInstances('eu', baseUrl, token.access_token)]);

  const now = new Date().toISOString();

  const instanceTransactionItems = instances.map((instance) => ({
    Put: {
      TableName: 'wow-extension-raids',
      Item: {
        ...marshall(instance, { removeUndefinedValues: true }),
        updated_at: { S: now },
      },
    },
  }));

  const transactionItems = [...instanceTransactionItems];

  if (transactionItems.length === 0) {
    console.info('No valid transactions to process.');
    return;
  }

  const transactionBatches = chunkArray(instanceTransactionItems, 25);

  for (const batch of transactionBatches) {
    const params: TransactWriteItemsInput = {
      TransactItems: batch,
    };

    try {
      await executeTransaction(ddbClient, params);
    } catch (err) {
      console.error('Error writing transaction:', err);
      throw err;
    }
  }
};

export const handler = middyCore(lambdaHandler);
