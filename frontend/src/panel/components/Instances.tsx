import { useFetchInstancesQuery } from '@/store/api/characters';
import { ApiCharacter, ApiInstance, InstanceType, RaidsByExpansion } from '@/types/Characters';
import { motion } from 'framer-motion';
import { useCallback, useMemo, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { Skull } from '@/assets/icons/Skull';
import {
  DIFFICULTY_BG,
  DIFFICULTY_TEXT,
  Difficulty,
  RaidProgress,
  difficultiesFor,
  expansionSummary,
  findCharacterInstance,
  modeOrderFor,
  raidProgress,
} from '@/lib/raidProgress';

interface IInstanceProps {
  character: ApiCharacter;
  type: InstanceType;
}

export const Instances = ({ character, type }: IInstanceProps) => {
  const { data: groups } = useFetchInstancesQuery({ type, character });
  const [expansionIndex, setExpansionIndex] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hoveredBoss, setHoveredBoss] = useState<{ raid: number; boss: number } | null>(null);
  const modeOrder = useMemo(() => modeOrderFor(type), [type]);

  const progressFor = useCallback(
    (raid: ApiInstance): RaidProgress =>
      raidProgress(raid, findCharacterInstance(character, raid.expansion.id, raid.id, type), difficultiesFor(type)),
    [character, type],
  );

  const summaries = useMemo(
    () => (groups ?? []).map((group) => expansionSummary(group.raids ?? [], progressFor, type)),
    [groups, progressFor, type],
  );

  if (!groups?.length) return <></>;

  const selectedIndex = Math.min(expansionIndex, groups.length - 1);
  const selected: RaidsByExpansion = groups[selectedIndex];
  const selectedSummary = summaries[selectedIndex];
  const raids = selected.raids ?? [];

  return (
    <motion.div
      className="flex flex-col flex-1 min-h-0 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        onClick={() => setPickerOpen((open) => !open)}
        className="flex items-center flex-none gap-[8px] h-[30px] px-[10px] border-b border-[rgba(138,109,20,.45)] hover:cursor-pointer"
        style={{ background: 'linear-gradient(180deg,rgba(221,172,0,.1),rgba(0,0,0,.35))' }}
      >
        <span className="font-friz text-[14.5px] text-blizzard-yellow" style={{ textShadow: '0 1px 2px #000' }}>
          {selected.expansion}
        </span>
        <span className="text-[10px] font-medium text-blizzard-gold-mute">{selectedSummary.text}</span>
        <svg
          viewBox="0 0 24 24"
          className={`flex-none w-[12px] h-[12px] ml-auto fill-none stroke-blizzard-yellow transition-transform ${
            pickerOpen ? 'rotate-180' : ''
          }`}
          style={{ strokeWidth: 2.4 }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {pickerOpen ? (
        <SimpleBar
          className="flex-1 min-h-0"
          style={{ width: '100%', background: 'linear-gradient(180deg,#0d0e12,#08090c)' }}
        >
          <div className="flex flex-col py-[4px]">
            {groups.map((group, index) => {
              const summary = summaries[index];
              const active = index === selectedIndex;
              return (
                <div
                  key={group.expansion}
                  onClick={() => {
                    setExpansionIndex(index);
                    setPickerOpen(false);
                    setHoveredBoss(null);
                  }}
                  className="flex items-center flex-none gap-[8px] h-[29px] pr-[10px] hover:cursor-pointer hover:bg-[rgba(221,172,0,.16)]"
                  style={{ background: active ? 'rgba(221,172,0,.1)' : 'transparent' }}
                >
                  <div className={`flex-none w-[3px] h-[29px] ${active ? 'bg-blizzard-yellow' : 'bg-transparent'}`} />
                  <span
                    className={`font-friz text-[13.5px] truncate ${
                      active ? 'text-blizzard-yellow' : summary.hasRaids ? 'text-[#d8d3c6]' : 'text-[#6a6455]'
                    }`}
                  >
                    {group.expansion}
                  </span>
                  <span
                    className={`ml-auto flex-none text-[9.5px] font-semibold ${
                      DIFFICULTY_TEXT[summary.token ?? 'none']
                    }`}
                  >
                    {summary.text}
                  </span>
                </div>
              );
            })}
          </div>
        </SimpleBar>
      ) : (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center flex-none gap-[9px] h-[20px] px-[9px] border-b border-[rgba(138,109,20,.22)]">
            {modeOrder.map((difficulty) => (
              <div key={difficulty.token} className="flex items-center gap-[4px]">
                <div className={`w-[7px] h-[7px] ${DIFFICULTY_BG[difficulty.token]}`} />
                <span className="text-[9px] font-medium tracking-[.08em] text-[#7b7360]">{difficulty.label}</span>
              </div>
            ))}
          </div>

          {raids.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-[6px] px-[30px] text-center">
              <Skull className="w-[26px] h-[26px] fill-[#3f3a2c]" />
              <span className="text-[12px] leading-[1.5] text-[#6a6455]">
                No boss kills recorded in {selected.expansion}.
              </span>
            </div>
          ) : (
            <SimpleBar className="flex-1 min-h-0" style={{ width: '100%' }}>
              <div className="flex flex-col gap-[7px] p-[8px]">
                {raids.map((raid, raidIndex) => (
                  <RaidCard
                    key={raid.id}
                    raid={raid}
                    progress={progressFor(raid)}
                    modeOrder={modeOrder}
                    hoveredBoss={hoveredBoss?.raid === raidIndex ? hoveredBoss.boss : null}
                    onHoverBoss={(boss) => setHoveredBoss(boss === null ? null : { raid: raidIndex, boss })}
                  />
                ))}
              </div>
            </SimpleBar>
          )}
        </div>
      )}
    </motion.div>
  );
};

interface IRaidCardProps {
  raid: ApiInstance;
  progress: RaidProgress;
  modeOrder: Difficulty[];
  hoveredBoss: number | null;
  onHoverBoss: (boss: number | null) => void;
}

const RaidCard = ({ raid, progress, modeOrder, hoveredBoss, onHoverBoss }: IRaidCardProps) => {
  const boss = hoveredBoss !== null ? progress.bosses[hoveredBoss] : undefined;

  return (
    <div
      className="flex flex-col flex-none border border-[rgba(138,109,20,.35)]"
      style={{ background: 'linear-gradient(180deg,rgba(23,21,14,.9),rgba(8,9,12,.9))' }}
    >
      <div
        className="flex items-center gap-[7px] h-[25px] px-[7px] border-b border-[rgba(138,109,20,.3)]"
        style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.28),rgba(0,0,0,0) 78%)' }}
      >
        <span
          className="font-friz text-[13.5px] truncate text-blizzard-yellow"
          style={{ textShadow: '0 1px 2px #000' }}
        >
          {raid.name}
        </span>
        <span
          className={`ml-auto flex-none text-[9.5px] font-semibold tracking-[.05em] ${
            DIFFICULTY_TEXT[progress.best.token ?? 'none']
          }`}
        >
          {progress.best.text}
        </span>
      </div>

      <div className="flex gap-[2px] pt-[6px] px-[7px] pb-[5px]" onMouseLeave={() => onHoverBoss(null)}>
        {progress.bosses.map((b, index) => (
          <div
            key={b.id}
            onMouseEnter={() => onHoverBoss(index)}
            className={`flex-1 h-[9px] hover:cursor-pointer ${DIFFICULTY_BG[b.best ?? 'none']}`}
            style={{
              boxShadow:
                index === hoveredBoss
                  ? 'inset 0 0 0 1px rgba(0,0,0,.5),0 0 0 1.5px #ddac00'
                  : 'inset 0 0 0 1px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.14)',
            }}
          />
        ))}
      </div>

      <div className="flex-none h-[19px] px-[7px] pb-[6px]">
        {boss ? (
          <div className="flex items-center gap-[7px]">
            <span className="text-[10.5px] font-medium truncate text-[#e8e4da]">{boss.name}</span>
            <div className="flex flex-none gap-[5px] ml-auto">
              {modeOrder.map((difficulty) => (
                <span
                  key={difficulty.token}
                  className={`text-[9px] tracking-[.06em] ${
                    boss.killedOn[difficulty.token]
                      ? `font-semibold ${DIFFICULTY_TEXT[difficulty.token]}`
                      : 'font-normal text-[#6a6455]'
                  }`}
                >
                  {difficulty.label}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex gap-[8px]">
            {modeOrder.map((difficulty) => {
              const killed = progress.counts[difficulty.token];
              const complete = killed === progress.total && progress.total > 0;
              return (
                <div key={difficulty.token} className="flex items-baseline flex-1 gap-[3px]">
                  <span
                    className={`text-[9px] font-semibold tracking-[.06em] ${
                      killed > 0 ? DIFFICULTY_TEXT[difficulty.token] : 'text-[#6a6455]'
                    }`}
                  >
                    {difficulty.label}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      complete ? 'text-white' : killed > 0 ? 'text-[#c3bdad]' : 'text-[#6a6455]'
                    }`}
                  >
                    {killed}/{progress.total}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
