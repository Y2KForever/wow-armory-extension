import { motion } from 'framer-motion';
import { useAppSelect } from '@/store/store';
import { selectSelectedTalents } from '@/store/selectors/selectTalents';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiCharacter, Talent } from '@/types/Characters';
import { CopyIcon } from '@/assets/icons/Copy';
import SimpleBar from 'simplebar-react';
import { buildTalentTree } from '@/lib/talentTree';

const TREE_WIDTH = 300;

interface ITalentsProps {
  character: ApiCharacter;
}

type TreeKey = 'class' | 'spec' | 'hero';

const TREES: { key: TreeKey; label: string }[] = [
  { key: 'class', label: 'CLASS' },
  { key: 'spec', label: 'SPEC' },
  { key: 'hero', label: 'HERO' },
];

export const Talents = ({ character }: ITalentsProps) => {
  const [isCopiedVisible, setIsCopiedVisible] = useState(false);
  const [tree, setTree] = useState<TreeKey>('spec');
  const [hovered, setHovered] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const selectTalents = useAppSelect(selectSelectedTalents);

  const heroTree = useMemo(
    () => selectTalents?.hero_talents?.find((hero) => hero.id === character?.talents?.hero_id),
    [selectTalents, character],
  );

  const heroNodeIds = useMemo(
    () => new Set((selectTalents?.hero_talents ?? []).flatMap((hero) => (hero.talents ?? []).map((t) => t.id))),
    [selectTalents],
  );

  const sources: Record<TreeKey, { talents: Talent[]; selected: number[] }> = useMemo(
    () => ({
      class: { talents: selectTalents?.class_talents ?? [], selected: character?.talents?.class_talents ?? [] },
      spec: { talents: selectTalents?.spec_talents ?? [], selected: character?.talents?.spec_talents ?? [] },
      hero: { talents: heroTree?.talents ?? [], selected: character?.talents?.hero_talents ?? [] },
    }),
    [selectTalents, heroTree, character],
  );

  const layouts = useMemo(
    () =>
      TREES.reduce(
        (acc, { key }) => {
          acc[key] = buildTalentTree(
            sources[key].talents,
            sources[key].selected,
            TREE_WIDTH,
            key === 'hero' ? undefined : heroNodeIds,
          );
          return acc;
        },
        {} as Record<TreeKey, ReturnType<typeof buildTalentTree>>,
      ),
    [sources, heroNodeIds],
  );

  const layout = layouts[tree];
  const hoveredNode = hovered === null ? null : layout.nodes.find((node) => node.id === hovered);

  const copyLoadout = async () => {
    if (!character?.talents?.loadout_code) return;
    await navigator.clipboard.writeText(character.talents.loadout_code);
    setIsCopiedVisible(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsCopiedVisible(false), 1500);
  };

  return (
    <motion.div
      className="flex flex-col flex-1 min-h-0 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="flex items-center flex-none gap-[8px] h-[30px] px-[10px] border-b border-[rgba(138,109,20,.4)]"
        style={{ background: 'linear-gradient(180deg,#14120c,#0a0b0d)' }}
      >
        <span className="font-friz text-[14.5px] text-blizzard-yellow" style={{ textShadow: '0 1px 2px #000' }}>
          {`${character.spec ?? ''} ${character.class ?? ''}`.trim()}
        </span>
        {heroTree?.name && (
          <span className="text-[10px] font-semibold tracking-[.1em] text-blizzard-gold-mid truncate">
            {heroTree.name}
          </span>
        )}
        {character?.talents?.loadout_code && (
          <div
            onClick={copyLoadout}
            title="Copy loadout code"
            className="flex items-center flex-none gap-[4px] ml-auto hover:cursor-pointer group"
          >
            <CopyIcon className="w-[12px] h-[12px] fill-blizzard-gold-mute group-hover:fill-blizzard-yellow" />
            <span className="text-[9.5px] text-blizzard-gold-mute group-hover:text-blizzard-yellow">
              {isCopiedVisible ? 'Copied' : 'Copy'}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-none h-[28px] border-b border-[rgba(138,109,20,.4)]">
        {TREES.map(({ key, label }) => {
          const active = key === tree;
          return (
            <div
              key={key}
              onClick={() => {
                setTree(key);
                setHovered(null);
              }}
              className="flex items-center justify-center flex-1 gap-[5px] hover:cursor-pointer hover:bg-[rgba(221,172,0,.12)]"
              style={{
                background: active ? 'linear-gradient(180deg,rgba(221,172,0,.16),rgba(0,0,0,.4))' : 'transparent',
                borderBottom: `2px solid ${active ? '#ddac00' : 'transparent'}`,
              }}
            >
              <span
                className={`text-[10px] font-semibold tracking-[.14em] ${
                  active ? 'text-blizzard-yellow' : 'text-blizzard-gold-mute'
                }`}
              >
                {label}
              </span>
              <span className={`text-[11px] font-bold ${active ? 'text-blizzard-yellow' : 'text-blizzard-gold-mute'}`}>
                {layouts[key].selectedCount}
              </span>
            </div>
          );
        })}
      </div>

      <SimpleBar className="flex-1 min-h-0" style={{ width: '100%' }}>
        {layout.nodes.length === 0 ? (
          <div className="flex items-center justify-center h-[120px] px-[30px] text-center">
            <span className="text-[11.5px] leading-[1.5] text-[#6a6455]">
              No {tree} talents available for this character.
            </span>
          </div>
        ) : (
          <div
            className="relative mx-auto"
            style={{ width: TREE_WIDTH, height: layout.height }}
            onMouseLeave={() => setHovered(null)}
          >
            <svg width={TREE_WIDTH} height={layout.height} className="absolute left-0 top-0">
              {layout.edges.map((edge, index) => (
                <line
                  key={index}
                  x1={edge.x1}
                  y1={edge.y1}
                  x2={edge.x2}
                  y2={edge.y2}
                  stroke={edge.active ? 'rgba(221,172,0,.5)' : 'rgba(255,255,255,.07)'}
                  strokeWidth={edge.active ? 1.5 : 1}
                />
              ))}
            </svg>

            {layout.nodes.map((node) => (
              <div
                key={node.id}
                onMouseEnter={() => setHovered(node.id)}
                className="absolute hover:cursor-pointer hover:opacity-100"
                style={{
                  left: node.x,
                  top: node.y,
                  width: layout.nodeSize,
                  height: layout.nodeSize,
                  opacity: node.taken ? 1 : 0.32,
                  filter: node.taken ? 'none' : 'grayscale(1)',
                  border: `1px solid ${node.taken ? '#ddac00' : '#2c2f38'}`,
                  boxShadow: node.taken
                    ? 'inset 0 0 0 1px rgba(0,0,0,.8),0 0 6px rgba(221,172,0,.28)'
                    : 'inset 0 0 0 1px rgba(0,0,0,.8)',
                }}
              >
                {node.icons.map((spellId, index) => (
                  <div
                    key={spellId}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(https://cdn.y2kforever.com/talents/${spellId}.jpg)`,
                      clipPath:
                        node.icons.length > 1
                          ? `inset(0 ${index === 0 ? 50 : 0}% 0 ${index === 1 ? 50 : 0}%)`
                          : undefined,
                    }}
                  />
                ))}
                {node.maxRank > 1 && (
                  <span
                    className="absolute -right-[3px] -bottom-[5px] px-[3px] font-bold bg-[#08090c]"
                    style={{
                      fontSize: Math.max(6.5, layout.nodeSize * 0.25),
                      lineHeight: 1.3,
                      color: node.takenRank === node.maxRank ? '#ddac00' : node.takenRank > 0 ? '#c3bdad' : '#6a6455',
                      boxShadow: '0 0 0 1px rgba(138,109,20,.6)',
                    }}
                  >
                    {node.takenRank}/{node.maxRank}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </SimpleBar>

      <div
        className="flex items-center flex-none gap-[7px] h-[26px] px-[10px] border-t border-[rgba(138,109,20,.4)]"
        style={{ background: 'linear-gradient(180deg,#0d0c08,#08090c)' }}
      >
        {hoveredNode ? (
          <>
            <span className="text-[11px] font-medium truncate text-[#d8d3c6]">{hoveredNode.name}</span>
            <span
              className="flex-none ml-auto text-[11px] font-bold"
              style={{ color: hoveredNode.taken ? '#ddac00' : '#6a6455' }}
            >
              {hoveredNode.takenRank}/{hoveredNode.maxRank}
            </span>
          </>
        ) : (
          <span className="text-[10.5px] text-[#5f5744]">Hover a talent for its name and rank</span>
        )}
      </div>
    </motion.div>
  );
};
