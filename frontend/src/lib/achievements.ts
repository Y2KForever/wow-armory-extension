import { AchievementDefinition, AchievementTreeCategory } from '@/types/Characters';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic';

export const rarityForPoints = (points: number): Rarity => {
  if (points >= 50) return 'epic';
  if (points >= 25) return 'rare';
  if (points >= 15) return 'uncommon';
  return 'common';
};

export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#e8e4da',
  uncommon: '#1eff00',
  rare: '#0081ff',
  epic: '#c600ff',
};

export const rarityColor = (points: number) => RARITY_COLOR[rarityForPoints(points)];

export const progressFill = (pct: number) =>
  pct >= 100 ? 'linear-gradient(90deg,#2f8f3f,#7fd18f)' : 'linear-gradient(90deg,#8a6d14,#ddac00)';

export const countColor = (pct: number) => (pct >= 100 ? '#7fd18f' : '#d8d3c6');

export const percent = (have: number, total: number) => (total === 0 ? 0 : Math.round((have / total) * 100));

export interface CategoryProgress {
  id: number;
  name: string;
  displayOrder: number;
  have: number;
  total: number;
  pct: number;
  subcategoryCount: number;
}

const countEarned = (ids: number[], earned: Set<number>) => ids.reduce((n, id) => (earned.has(id) ? n + 1 : n), 0);

export const buildCategoryProgress = (categories: AchievementTreeCategory[], earned: Set<number>): CategoryProgress[] =>
  categories
    .map((category) => {
      const ids = [...category.ids, ...category.subcategories.flatMap((sub) => sub.ids)];
      const have = countEarned(ids, earned);
      return {
        id: category.category_id,
        name: category.name,
        displayOrder: category.display_order,
        have,
        total: ids.length,
        pct: percent(have, ids.length),
        subcategoryCount: category.subcategories.length,
      };
    })
    .filter((category) => category.total > 0)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));

export const overallProgress = (categories: AchievementTreeCategory[], earned: Set<number>) => {
  const all = new Set(categories.flatMap((c) => [...c.ids, ...c.subcategories.flatMap((s) => s.ids)]));
  const have = countEarned([...all], earned);
  return { have, total: all.size, pct: percent(have, all.size) };
};

export const sortAchievements = (achievements: AchievementDefinition[], earned: Set<number>) =>
  [...achievements].sort((a, b) => {
    const gap = Number(earned.has(b.id)) - Number(earned.has(a.id));
    return gap !== 0 ? gap : b.points - a.points || a.name.localeCompare(b.name);
  });

export const formatEarnedDate = (completed: number) =>
  new Date(completed).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
