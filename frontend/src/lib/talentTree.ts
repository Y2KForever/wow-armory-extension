import { Talent } from '@/types/Characters';

const SIZE = 34;
const COL_PITCH = 40;
const ROW_PITCH = 46;
const TOP_PAD = 12;
const MIN_SIZE = 20;

export interface TreeNode {
  id: number;
  name: string;
  x: number;
  y: number;
  icons: number[];
  taken: boolean;
  maxRank: number;
  takenRank: number;
}

export interface TreeEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
}

export interface TalentTreeLayout {
  nodes: TreeNode[];
  edges: TreeEdge[];
  height: number;
  nodeSize: number;
  selectedCount: number;
}

interface NodeSpell {
  spellId: number | null;
  talentId: number | null;
  rank: number;
  name: string;
}

const spellsOf = (entry: Talent): NodeSpell[] => {
  const spells: NodeSpell[] = [];

  for (const rank of entry.ranks ?? []) {
    const tooltips =
      entry.type === 'CHOICE' && rank.tooltip?.choice_of_tooltips
        ? rank.tooltip.choice_of_tooltips
        : rank.tooltip
          ? [rank.tooltip]
          : [];

    for (const tooltip of tooltips) {
      spells.push({
        spellId: tooltip.spell_tooltip?.spell?.id ?? null,
        talentId: tooltip.spell_tooltip?.talent?.id ?? null,
        rank: rank.rank,
        name: tooltip.spell_tooltip?.spell?.name ?? entry.name ?? '',
      });
    }
  }

  return spells;
};

export const buildTalentTree = (
  input: Talent[],
  selectedIds: number[],
  availableWidth: number,
  excludeIds?: Set<number>,
): TalentTreeLayout => {
  const empty: TalentTreeLayout = { nodes: [], edges: [], height: TOP_PAD, nodeSize: SIZE, selectedCount: 0 };
  if (!input?.length) return empty;

  const entries = input
    .filter((entry) => !excludeIds?.has(entry.id))
    .map((entry) => ({ entry, spells: spellsOf(entry) }))
    .filter(({ spells }) => spells.length > 0);

  if (!entries.length) return empty;

  const talents = entries.map(({ entry }) => entry);
  const selected = new Set(selectedIds ?? []);

  const minRow = Math.min(...talents.map((t) => t.row));
  const minCol = Math.min(...talents.map((t) => t.col));
  const maxCol = Math.max(...talents.map((t) => t.col)) - minCol;
  const maxRow = Math.max(...talents.map((t) => t.row)) - minRow;

  const naturalWidth = (maxCol + 1) * COL_PITCH - (COL_PITCH - SIZE);
  const scale = Math.min(1, availableWidth / naturalWidth);

  let size = SIZE * scale;
  let colPitch = COL_PITCH * scale;

  if (size < MIN_SIZE) {
    size = MIN_SIZE;
    colPitch = maxCol > 0 ? (availableWidth - size) / maxCol : COL_PITCH;
    if (colPitch < size) {
      size = availableWidth / (maxCol + 1);
      colPitch = size;
    }
  }

  const rowPitch = ROW_PITCH * (size / SIZE);

  const scaledWidth = maxCol * colPitch + size;
  const originX = Math.max(0, (availableWidth - scaledWidth) / 2);

  const positions = talents.map((entry) => ({
    x: originX + (entry.col - minCol) * colPitch,
    y: TOP_PAD + (entry.row - minRow) * rowPitch,
  }));

  const nodes: TreeNode[] = entries.map(({ entry, spells }, index) => {
    const takenSpells = spells.filter((s) => s.talentId !== null && selected.has(s.talentId));
    const taken = takenSpells.length > 0;
    const maxRank = Math.max(1, ...spells.map((s) => s.rank));

    const shown = taken ? takenSpells : spells;
    const icons = [...new Set(shown.map((s) => s.spellId).filter((id): id is number => id !== null))];

    return {
      id: entry.id,
      name: (taken ? takenSpells[0]?.name : spells[0]?.name) || entry.name || '',
      x: positions[index].x,
      y: positions[index].y,
      icons,
      taken,
      maxRank,
      takenRank: taken ? maxRank : 0,
    };
  });

  const byId = new Map(talents.map((entry, index) => [entry.id, index]));
  const seen = new Set<string>();
  const edges: TreeEdge[] = [];

  const addEdge = (a: number, b: number) => {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (seen.has(key)) return;
    seen.add(key);
    const [top, bottom] = positions[a].y <= positions[b].y ? [a, b] : [b, a];
    edges.push({
      x1: positions[top].x + size / 2,
      y1: positions[top].y + size,
      x2: positions[bottom].x + size / 2,
      y2: positions[bottom].y,
      active: nodes[top].taken && nodes[bottom].taken,
    });
  };

  const hasRelationships = talents.some((entry) => entry.unlocks?.length || entry.locked_by?.length);

  if (hasRelationships) {
    talents.forEach((entry, index) => {
      for (const other of [...(entry.unlocks ?? []), ...(entry.locked_by ?? [])]) {
        const target = byId.get(other);
        if (target !== undefined) addEdge(index, target);
      }
    });
  } else {
    talents.forEach((a, ai) => {
      talents.forEach((b, bi) => {
        if (b.row === a.row + 1 && Math.abs(b.col - a.col) <= 1.5) addEdge(ai, bi);
      });
    });
  }

  return {
    nodes,
    edges,
    height: TOP_PAD + maxRow * rowPitch + size + TOP_PAD,
    nodeSize: size,
    selectedCount: nodes.filter((node) => node.taken).length,
  };
};
