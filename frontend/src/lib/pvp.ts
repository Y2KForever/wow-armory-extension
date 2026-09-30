import { ApiCharacter } from '@/types/Characters';

type Pvp = NonNullable<ApiCharacter['pvp']>;
type Bracket = Pvp['brackets'][number];
export type BracketKind = Bracket['kind'];

const LABELS: Record<BracketKind, string> = {
  '2v2': '2v2 Arena',
  '3v3': '3v3 Arena',
  rbg: 'Rated Battlegrounds',
  shuffle: 'Solo Shuffle',
  blitz: 'Battleground Blitz',
};

const KINDS: BracketKind[] = ['3v3', '2v2', 'shuffle', 'blitz', 'rbg'];

const TIER_THRESHOLDS: [number, string][] = [
  [2400, 'Elite'],
  [2100, 'Duelist'],
  [1950, 'Rival II'],
  [1800, 'Rival I'],
  [1600, 'Challenger II'],
  [1400, 'Challenger I'],
  [1200, 'Combatant II'],
  [1000, 'Combatant I'],
];

export const tierFor = (rating: number, tier: string | null) =>
  tier || TIER_THRESHOLDS.find(([min]) => rating >= min)?.[1] || 'Unranked';

export const tierColor = (tier: string, rating: number) => {
  if (rating <= 0) return '#5a5445';
  const name = tier.toLowerCase();
  if (name.includes('gladiator') || name.includes('elite')) return '#ff8000';
  if (name.includes('duelist')) return '#c600ff';
  if (name.includes('rival')) return '#0081ff';
  if (name.includes('challenger')) return '#1eff00';
  if (name.includes('combatant')) return '#d8d3c6';
  return '#9c9484';
};

export interface BracketRow {
  kind: BracketKind;
  label: string;
  note: string | null;
  rating: number;
  tier: string;
  color: string;
  winPct: number;
  record: string;
  detail: string;
}

export const buildBracketRows = (pvp: Pvp): BracketRow[] =>
  KINDS.map((kind) => {
    const bracket = pvp.brackets.find((entry) => entry.kind === kind);
    const rating = bracket?.rating ?? 0;
    const tier = bracket && rating > 0 ? tierFor(rating, bracket.tier) : 'Unrated';
    const played = bracket?.played ?? 0;
    const winPct = played ? Math.round(((bracket?.won ?? 0) / played) * 100) : 0;
    return {
      kind,
      label: LABELS[kind],
      note: bracket?.spec ?? null,
      rating,
      tier,
      color: tierColor(tier, rating),
      winPct,
      record: played ? `${bracket!.won}–${bracket!.lost}` : '—',
      detail: played
        ? `${played} played · ${winPct}% won · week ${bracket!.weekly_won}–${bracket!.weekly_lost}`
        : 'No rated games this season',
    };
  }).sort((a, b) => b.rating - a.rating);

export const formatKills = (kills: number) =>
  kills >= 100_000 ? `${(kills / 1000).toFixed(1)}k` : kills.toLocaleString();

export const pvpSeasonLabel = (pvp: Pvp) =>
  pvp.season_name || (pvp.season_id ? `PvP Season ${pvp.season_id}` : 'Rated PvP');
