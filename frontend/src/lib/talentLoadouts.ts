import { ApiCharacter, ApiTalents, Talent } from '@/types/Characters';

export type TreeKey = 'class' | 'spec' | 'hero';

export interface SheetTalent {
  id: number;
  name: string;
  spellId: number | null;
  rank: number;
  maxRank: number;
}

export interface SheetGroup {
  key: TreeKey;
  label: string;
  points: number;
  items: SheetTalent[];
}

export interface Loadout {
  index: number;
  label: string;
  active: boolean;
  code: string;
  hero: string;
  groups: SheetGroup[];
  spread: { key: TreeKey; label: string; points: number }[];
}

export interface LoadoutDiff {
  added: SheetTalent[];
  dropped: SheetTalent[];
}

const TREES: { key: TreeKey; label: string }[] = [
  { key: 'class', label: 'CLASS' },
  { key: 'spec', label: 'SPEC' },
  { key: 'hero', label: 'HERO' },
];

type Selected = { id: number; rank: number };

const indexTalents = (nodes: Talent[]) => {
  const byTalentId = new Map<number, { node: Talent; name: string; spellId: number | null }>();

  for (const node of nodes ?? []) {
    for (const rank of node.ranks ?? []) {
      const tooltips = rank.tooltip?.choice_of_tooltips?.length
        ? rank.tooltip.choice_of_tooltips
        : rank.tooltip
          ? [rank.tooltip]
          : [];

      for (const tooltip of tooltips) {
        const talentId = tooltip.spell_tooltip?.talent?.id;
        if (talentId === undefined || byTalentId.has(talentId)) continue;
        byTalentId.set(talentId, {
          node,
          name: tooltip.spell_tooltip?.spell?.name ?? node.name ?? '',
          spellId: tooltip.spell_tooltip?.spell?.id ?? null,
        });
      }
    }
  }

  return byTalentId;
};

const maxRankOf = (node: Talent) => Math.max(1, ...(node.ranks ?? []).map((rank) => rank.rank));

const resolve = (selected: Selected[], nodes: Talent[]): SheetTalent[] => {
  const index = indexTalents(nodes);

  return (selected ?? [])
    .map((pick) => {
      const found = index.get(pick.id);
      if (!found) return null;
      return {
        id: pick.id,
        name: found.name,
        spellId: found.spellId,
        rank: pick.rank,
        maxRank: maxRankOf(found.node),
      };
    })
    .filter((talent): talent is SheetTalent => talent !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const buildLoadouts = (character: ApiCharacter, talents: ApiTalents | null | undefined): Loadout[] => {
  if (!talents) return [];

  const stored = character.talents?.loadouts;
  const legacy = character.talents;

  const raw: { active: boolean; code: string; picks: Record<TreeKey, Selected[]> }[] = stored?.length
    ? stored.map((loadout) => ({
        active: loadout.active,
        code: loadout.code,
        picks: {
          class: loadout.class_talents ?? [],
          spec: loadout.spec_talents ?? [],
          hero: loadout.hero_talents ?? [],
        },
      }))
    : [
        {
          active: true,
          code: legacy?.loadout_code ?? '',
          picks: {
            class: (legacy?.class_talents ?? []).map((id) => ({ id, rank: 1 })),
            spec: (legacy?.spec_talents ?? []).map((id) => ({ id, rank: 1 })),
            hero: (legacy?.hero_talents ?? []).map((id) => ({ id, rank: 1 })),
          },
        },
      ];

  const heroTrees = talents.hero_talents ?? [];

  return raw.map((loadout, index) => {
    const heroTree = heroTrees.find((tree) =>
      (tree.talents ?? []).some((node) =>
        (node.ranks ?? []).some((rank) =>
          [rank.tooltip, ...(rank.tooltip?.choice_of_tooltips ?? [])].some((tooltip) => {
            const talentId = tooltip?.spell_tooltip?.talent?.id;
            return talentId !== undefined && loadout.picks.hero.some((pick) => pick.id === talentId);
          }),
        ),
      ),
    );

    const nodesFor: Record<TreeKey, Talent[]> = {
      class: talents.class_talents ?? [],
      spec: talents.spec_talents ?? [],
      hero: heroTree?.talents ?? [],
    };

    const groups: SheetGroup[] = TREES.map(({ key, label }) => {
      const items = resolve(loadout.picks[key], nodesFor[key]);
      return { key, label, points: items.reduce((total, item) => total + item.rank, 0), items };
    });

    return {
      index,
      label: `Loadout ${index + 1}`,
      active: loadout.active,
      code: loadout.code,
      hero: heroTree?.name ?? '',
      groups,
      spread: groups.map(({ key, label, points }) => ({ key, label, points })),
    };
  });
};

export const diffLoadouts = (shown: Loadout | undefined, active: Loadout | undefined): LoadoutDiff => {
  if (!shown || !active || shown.index === active.index) {
    return { added: [], dropped: [] };
  }

  const flatten = (loadout: Loadout) => loadout.groups.flatMap((group) => group.items);
  const shownItems = flatten(shown);
  const activeItems = flatten(active);
  const activeIds = new Set(activeItems.map((item) => item.id));
  const shownIds = new Set(shownItems.map((item) => item.id));

  return {
    added: shownItems.filter((item) => !activeIds.has(item.id)),
    dropped: activeItems.filter((item) => !shownIds.has(item.id)),
  };
};
