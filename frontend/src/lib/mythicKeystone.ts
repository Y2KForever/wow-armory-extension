import { ApiCharacter } from '@/types/Characters';

export type KeystoneRun = NonNullable<NonNullable<ApiCharacter['mythic_keystone']>>['runs'][number];

export interface AffixRun {
  level: number;
  date: string;
  time: string;
  timed: boolean;
  upgrades: number;
  rating: number;
}

export interface DungeonRow {
  dungeonId: number;
  name: string;
  best: AffixRun | null;
  total: number;
}

export interface KeystoneSummary {
  rating: number;
  bestKey: number;
  timed: number;
  totalRuns: number;
  rows: DungeonRow[];
}

export const FIRST_SEASON_OF_EXPANSION = 17;

export const seasonLabel = (seasonId: number | undefined): string => {
  if (seasonId === undefined) return 'Season';
  const relative = seasonId - FIRST_SEASON_OF_EXPANSION + 1;
  return relative >= 1 ? `Season ${relative}` : `Season ${seasonId}`;
};

export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const formatDate = (ms: number): string =>
  new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

const toAffixRun = (run: KeystoneRun): AffixRun => ({
  level: run.level,
  date: formatDate(run.completed_at),
  time: formatDuration(run.duration),
  timed: run.timed,
  upgrades: run.upgrades,
  rating: run.rating,
});

export const summariseKeystone = (keystone: ApiCharacter['mythic_keystone']): KeystoneSummary | null => {
  if (!keystone || !keystone.runs?.length) return null;

  const byDungeon = new Map<number, KeystoneRun[]>();
  for (const run of keystone.runs) {
    const runs = byDungeon.get(run.dungeon_id);
    if (runs) {
      runs.push(run);
    } else {
      byDungeon.set(run.dungeon_id, [run]);
    }
  }

  const rows: DungeonRow[] = [...byDungeon.entries()].map(([dungeonId, runs]) => {
    const best = runs.reduce((top, run) => (run.rating > top.rating ? run : top));
    return {
      dungeonId,
      name: best.dungeon,
      best: toAffixRun(best),
      total: Math.round(best.rating),
    };
  });

  rows.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  return {
    rating: keystone.rating,
    bestKey: Math.max(0, ...keystone.runs.map((run) => run.level)),
    timed: keystone.runs.filter((run) => run.timed).length,
    totalRuns: keystone.runs.length,
    rows,
  };
};

export const ratingClass = (rating: number): string => {
  if (rating <= 0) return 'text-[#5a5445]';
  if (rating >= 2500) return 'text-rarity-legendary';
  if (rating >= 2000) return 'text-rarity-epic';
  if (rating >= 1500) return 'text-rarity-rare';
  if (rating >= 1000) return 'text-rarity-uncommon';
  return 'text-[#d8d3c6]';
};

export const dungeonTotalClass = (total: number): string => {
  if (total >= 320) return 'text-blizzard-yellow';
  return total > 0 ? 'text-[#c3bdad]' : 'text-[#5a5445]';
};

export const keyLevelClass = (run: AffixRun | null): string => {
  if (!run) return 'text-[#5a5445]';
  return run.timed ? 'text-blizzard-yellow' : 'text-[#c41e3b]';
};

export const timeClass = (run: AffixRun | null): string =>
  !run ? 'text-[#5a5445]' : run.timed ? 'text-[#9c9484]' : 'text-[#c41e3b]';
