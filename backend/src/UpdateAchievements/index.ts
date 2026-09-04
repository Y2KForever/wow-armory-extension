import { DynamoDBClient, PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { middyCore } from '../utils/middyWrapper';
import BattleNetApi from '../BattleNetApi';
import { getBlizzardAppToken } from '../utils/utils';
import { AchievementCategory, AchievementDefinition } from '../types/Api';

const ddbClient = new DynamoDBClient({
  retryMode: 'adaptive',
  maxAttempts: 100,
});
const BattleNetApiManager = BattleNetApi.getInstance();

const TABLE = 'wow-extension-achievements';

const SUMMARY_ID = 0;

const SIZE_WARN_BYTES = 300_000;

const readKnownDefinitions = async (): Promise<Map<number, AchievementDefinition>> => {
  const known = new Map<number, AchievementDefinition>();
  let startKey: Record<string, never> | undefined;

  do {
    const { Items, LastEvaluatedKey } = await ddbClient.send(
      new ScanCommand({ TableName: TABLE, ExclusiveStartKey: startKey }),
    );

    for (const item of Items ?? []) {
      const category = unmarshall(item) as AchievementCategory;
      if (category.category_id === SUMMARY_ID) continue;
      const all = [
        ...(category.achievements ?? []),
        ...(category.subcategories ?? []).flatMap((s) => s.achievements ?? []),
      ];
      for (const achievement of all) {
        known.set(achievement.id, achievement);
      }
    }

    startKey = LastEvaluatedKey as typeof startKey;
  } while (startKey);

  return known;
};

const lambdaHandler = async (): Promise<void> => {
  const baseUrl = process.env['API_BASE_URL'];

  if (!baseUrl) {
    throw new Error(`BaseURL not set.`);
  }

  const token = await getBlizzardAppToken();
  const known = await readKnownDefinitions();

  const categories = await BattleNetApiManager.fetchAchievementTree('eu', baseUrl, token, known);

  if (categories.length === 0) {
    throw new Error('No achievement categories returned, refusing to continue.');
  }

  const now = new Date().toISOString();
  let written = 0;

  for (const category of categories) {
    const total =
      category.achievements.length + category.subcategories.reduce((sum, sub) => sum + sub.achievements.length, 0);

    if (total === 0) continue;

    const size = Buffer.byteLength(JSON.stringify(category));
    if (size > SIZE_WARN_BYTES) {
      console.warn(`Achievement category ${category.name} is ${size} bytes — approaching the 400KB item limit.`);
    }

    try {
      await ddbClient.send(
        new PutItemCommand({
          TableName: TABLE,
          Item: {
            ...marshall({ ...category, total }, { removeUndefinedValues: true }),
            updated_at: { S: now },
          },
        }),
      );
      written += 1;
    } catch (err) {
      console.error(`Failed to write achievement category ${category.name}:`, err);
    }
  }

  console.info(`Wrote ${written} of ${categories.length} achievement categories.`);

  if (written === 0) {
    throw new Error('Failed to write any achievement categories.');
  }

  await ddbClient.send(
    new PutItemCommand({
      TableName: TABLE,
      Item: marshall(
        {
          category_id: SUMMARY_ID,
          updated_at: now,
          categories: categories
            .filter((category) => category.achievements.length + category.subcategories.length > 0)
            .map((category) => ({
              category_id: category.category_id,
              name: category.name,
              display_order: category.display_order,
              ids: category.achievements.map((achievement) => achievement.id),
              subcategories: category.subcategories.map((sub) => ({
                id: sub.id,
                name: sub.name,
                ids: sub.achievements.map((achievement) => achievement.id),
              })),
            })),
        },
        { removeUndefinedValues: true },
      ),
    }),
  );
};

export const handler = middyCore(lambdaHandler);
