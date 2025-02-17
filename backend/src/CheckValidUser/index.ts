import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandInput,
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
  BatchWriteItemCommandOutput,
} from '@aws-sdk/client-dynamodb';
import { middyCore } from '../utils/middyWrapper';
import { simplifyDynamoDBResponse } from '../utils/utils';

const ddbClient = new DynamoDBClient();
const BATCH_SIZE = 25;
const MAX_CONCURRENT_REQUESTS = 5;

const lambdaHandler = async (): Promise<void> => {
  try {
    const limit = new Date();
    limit.setDate(limit.getDate() - 30);
    const isoDate = limit.toISOString();

    const scanParams: ScanCommandInput = {
      TableName: 'wow-extension-profiles',
      FilterExpression: 'updated_at < :threshold',
      ProjectionExpression: 'user_id',
      ExpressionAttributeValues: {
        ':threshold': { S: isoDate },
      },
    };

    const res = await ddbClient.send(new ScanCommand(scanParams));

    const outdatedProfiles = simplifyDynamoDBResponse(res.Items) as { user_id: string }[];

    if (outdatedProfiles.length === 0) {
      console.info('No outdated profiles found.');
      return;
    }

    console.info(`Deleting ${outdatedProfiles.length} outdated profiles...`);

    const deleteRequests = outdatedProfiles.map((profile) => ({
      DeleteRequest: {
        Key: {
          user_id: { S: profile.user_id },
        },
      },
    }));

    const batchDeletes: Promise<BatchWriteItemCommandOutput>[] = [];
    for (let i = 0; i < deleteRequests.length; i += BATCH_SIZE) {
      const batch: BatchWriteItemCommandInput = {
        RequestItems: {
          'wow-extension-profiles': deleteRequests.slice(i, i + BATCH_SIZE),
        },
      };
      batchDeletes.push(ddbClient.send(new BatchWriteItemCommand(batch)));
      if (batchDeletes.length >= MAX_CONCURRENT_REQUESTS) {
        await Promise.race(batchDeletes);
      }
    }

    await Promise.all(batchDeletes);
  } catch (err) {
    console.error('Error deleting outdated profiles:', err);
    throw err;
  }
};

export const handler = middyCore(lambdaHandler);
