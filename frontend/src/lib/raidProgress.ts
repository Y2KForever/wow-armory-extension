import { ApiCharacter, ApiInstance, InstanceType } from '@/types/Characters';

export const DIFFICULTIES = [
  { key: 'MYTHIC', label: 'M', token: 'mythic' },
  { key: 'HEROIC', label: 'H', token: 'heroic' },
  { key: 'NORMAL', label: 'N', token: 'normal' },
  { key: 'LFR', label: 'LFR', token: 'lfr' },
] as const;

export type DifficultyToken = (typeof DIFFICULTIES)[number]['token'];
export type Difficulty = (typeof DIFFICULTIES)[number];

export const difficultiesFor = (type: InstanceType): readonly Difficulty[] =>
  type === InstanceType.DUNGEON ? DIFFICULTIES.filter((d) => d.token !== 'lfr') : DIFFICULTIES;

export const modeOrderFor = (type: InstanceType): Difficulty[] => [...difficultiesFor(type)].reverse();

export const instanceNoun = (type: InstanceType, count: number): string =>
  type === InstanceType.DUNGEON ? `dungeon${count === 1 ? '' : 's'}` : `raid${count === 1 ? '' : 's'}`;

export interface BossProgress {
  id: number;
  name: string;
  best: DifficultyToken | null;
  killedOn: Record<DifficultyToken, boolean>;
}

export interface RaidProgress {
  bosses: BossProgress[];
  total: number;
  counts: Record<DifficultyToken, number>;
  best: { text: string; token: DifficultyToken | null };
}

type CharacterInstance = NonNullable<ReturnType<typeof findCharacterInstance>>;

export const findCharacterInstance = (
  character: ApiCharacter,
  expansionId: number,
  instanceId: number,
  type: InstanceType,
) => {
  const source = type === InstanceType.DUNGEON ? character.dungeons : character.raids;
  return source?.find((entry) => entry.id === expansionId)?.instances?.find((i) => i.id === instanceId);
};

const encountersFor = (charInstance: CharacterInstance | undefined, difficultyKey: string) =>
  charInstance?.modes?.find((mode) => mode[difficultyKey])?.[difficultyKey]?.encounters ?? {};

export const raidProgress = (
  apiRaid: ApiInstance,
  charInstance: CharacterInstance | undefined,
  difficulties: readonly Difficulty[] = DIFFICULTIES,
): RaidProgress => {
  const encounters = apiRaid.encounters ?? [];

  const byDifficulty = difficulties.map((difficulty) => ({
    ...difficulty,
    kills: encountersFor(charInstance, difficulty.key),
  }));

  const bosses: BossProgress[] = encounters.map((encounter) => {
    const killedOn = {} as Record<DifficultyToken, boolean>;
    let best: DifficultyToken | null = null;

    for (const difficulty of byDifficulty) {
      const killed = (difficulty.kills[encounter.id] ?? 0) > 0;
      killedOn[difficulty.token] = killed;
      if (killed && best === null) {
        best = difficulty.token;
      }
    }

    return { id: encounter.id, name: encounter.name, best, killedOn };
  });

  const counts = {} as Record<DifficultyToken, number>;
  for (const difficulty of difficulties) {
    counts[difficulty.token] = bosses.filter((boss) => boss.killedOn[difficulty.token]).length;
  }

  const total = bosses.length;
  let best: RaidProgress['best'] = { text: 'Not started', token: null };
  for (const difficulty of difficulties) {
    const killed = counts[difficulty.token];
    if (killed > 0) {
      const cleared = killed === total && total > 0;
      best = { text: `${cleared ? 'CLEARED ' : ''}${difficulty.label} ${killed}/${total}`, token: difficulty.token };
      break;
    }
  }

  return { bosses, total, counts, best };
};

export interface ExpansionSummary {
  text: string;
  token: DifficultyToken | null;
  hasRaids: boolean;
}

export const expansionSummary = (
  raids: ApiInstance[],
  progressFor: (raid: ApiInstance) => RaidProgress,
  type: InstanceType,
): ExpansionSummary => {
  if (raids.length === 0) {
    return { text: '—', token: null, hasRaids: false };
  }

  const difficulties = difficultiesFor(type);

  let killed = 0;
  let total = 0;
  let topIndex: number | null = null;

  for (const raid of raids) {
    const progress = progressFor(raid);
    total += progress.total;
    killed += Math.max(...difficulties.map((d) => progress.counts[d.token] ?? 0), 0);

    const index = difficulties.findIndex((d) => (progress.counts[d.token] ?? 0) > 0);
    if (index >= 0 && (topIndex === null || index < topIndex)) {
      topIndex = index;
    }
  }

  return {
    text: `${raids.length} ${instanceNoun(type, raids.length)} · ${killed}/${total}`,
    token: topIndex === null ? null : difficulties[topIndex].token,
    hasRaids: true,
  };
};

export const DIFFICULTY_BG: Record<DifficultyToken | 'none', string> = {
  mythic: 'bg-difficulty-mythic',
  heroic: 'bg-difficulty-heroic',
  normal: 'bg-difficulty-normal',
  lfr: 'bg-difficulty-lfr',
  none: 'bg-difficulty-none',
};

export const DIFFICULTY_TEXT: Record<DifficultyToken | 'none', string> = {
  mythic: 'text-difficulty-mythic',
  heroic: 'text-difficulty-heroic',
  normal: 'text-difficulty-normal',
  lfr: 'text-difficulty-lfr',
  none: 'text-[#6a6455]',
};
