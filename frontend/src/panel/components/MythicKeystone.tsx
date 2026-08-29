import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { ApiCharacter } from '@/types/Characters';
import { Hourglass } from '@/assets/icons/Hourglass';
import {
  AffixRun,
  dungeonTotalClass,
  keyLevelClass,
  ratingClass,
  seasonLabel,
  summariseKeystone,
  timeClass,
} from '@/lib/mythicKeystone';

interface IMythicKeystoneProps {
  character: ApiCharacter;
}

const BestRun = ({ run, runCount }: { run: AffixRun | null; runCount: number }) => (
  <div className="flex items-center gap-[6px] min-w-0">
    <span className={`flex-none text-[12px] font-bold ${keyLevelClass(run)}`}>{run ? `+${run.level}` : '—'}</span>
    <span className={`flex-none text-[10px] font-mono ${timeClass(run)}`}>{run ? run.time : 'no run'}</span>
    <div className="flex gap-[2px]">
      {run &&
        [0, 1, 2].map((slot) => (
          <div
            key={slot}
            className="w-[4px] h-[4px]"
            style={{ background: slot < run.upgrades ? '#ddac00' : 'rgba(138,109,20,.25)' }}
          />
        ))}
    </div>
    {runCount > 1 && <span className="flex-none ml-auto text-[9px] text-[#6f6141]">{runCount} runs</span>}
  </div>
);

export const MythicKeystone = ({ character }: IMythicKeystoneProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const summary = useMemo(() => summariseKeystone(character.mythic_keystone), [character.mythic_keystone]);
  const detail = summary?.rows.find((row) => row.dungeonId === hovered);

  if (!summary) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center flex-1 gap-[8px] px-[30px] text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Hourglass className="w-[26px] h-[26px] text-[#3f3a2c]" />
        <span className="text-[12px] leading-[1.5] text-[#6a6455]">
          No Mythic Keystone runs recorded for {character.name}.
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col flex-1 min-h-0 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="flex items-center flex-none gap-[8px] h-[30px] px-[11px] border-b border-[rgba(138,109,20,.4)]"
        style={{ background: 'linear-gradient(180deg,#14120c,#0a0b0d)' }}
      >
        <span className="font-friz text-[14.5px] text-blizzard-yellow" style={{ textShadow: '0 1px 2px #000' }}>
          {seasonLabel(character.mythic_keystone?.season_id)}
        </span>
      </div>

      <div className="flex flex-none border-b border-[rgba(138,109,20,.35)]">
        {[
          { value: summary.rating, label: 'RATING', className: ratingClass(summary.rating) },
          {
            value: summary.bestKey ? `+${summary.bestKey}` : '—',
            label: 'BEST KEY',
            className: 'text-blizzard-yellow',
          },
          { value: `${summary.timed}/${summary.totalRuns}`, label: 'TIMED', className: 'text-[#d8d3c6]' },
        ].map((stat, index) => (
          <div
            key={stat.label}
            className={`flex flex-col items-center flex-1 gap-[2px] pt-[10px] pb-[9px] ${
              index < 2 ? 'border-r border-[rgba(138,109,20,.22)]' : ''
            }`}
          >
            <span
              className={`text-[23px] font-bold leading-none ${stat.className}`}
              style={{ textShadow: '0 1px 3px #000' }}
            >
              {stat.value}
            </span>
            <span className="text-[8.5px] font-medium tracking-[.18em] text-blizzard-gold-mute">{stat.label}</span>
          </div>
        ))}
      </div>

      <div
        className="flex items-center flex-none gap-[7px] h-[19px] px-[11px]"
        style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.22),rgba(0,0,0,0) 72%)' }}
      >
        <span className="text-[9.5px] font-semibold tracking-[.16em] text-blizzard-gold-mid whitespace-nowrap">
          SEASON BEST RUNS
        </span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.5),transparent)' }} />
        <span className="text-[9px] font-medium text-[#6f6141] whitespace-nowrap">best run per dungeon</span>
      </div>

      <SimpleBar className="flex-1 min-h-0" style={{ width: '100%' }}>
        <div className="flex flex-col" onMouseLeave={() => setHovered(null)}>
          {summary.rows.map((row) => (
            <div
              key={row.dungeonId}
              onMouseEnter={() => setHovered(row.dungeonId)}
              className="flex flex-col justify-center flex-none gap-[3px] h-[40px] px-[11px] border-b border-[rgba(138,109,20,.14)] hover:cursor-pointer hover:bg-[rgba(221,172,0,.14)]"
            >
              <div className="flex items-baseline gap-[7px]">
                <span className="min-w-0 text-[11px] truncate text-[#d8d3c6]">{row.name}</span>
                <span className={`flex-none ml-auto text-[12px] font-bold ${dungeonTotalClass(row.total)}`}>
                  {row.total}
                </span>
              </div>
              <BestRun run={row.best} runCount={row.runCount} />
            </div>
          ))}
        </div>
      </SimpleBar>

      <div
        className="flex items-center flex-none gap-[8px] h-[26px] px-[11px] border-t border-[rgba(138,109,20,.4)]"
        style={{ background: 'linear-gradient(180deg,#0d0c08,#08090c)' }}
      >
        {detail ? (
          <>
            <span className="min-w-0 text-[10px] font-medium truncate text-[#9c9484]">{detail.name}</span>
            <span className="flex-none ml-auto text-[9.5px] text-[#6f6141] whitespace-nowrap">{detail.dates}</span>
          </>
        ) : (
          <span className="text-[10.5px] text-[#5f5744]">Hover a dungeon for its run dates</span>
        )}
      </div>
    </motion.div>
  );
};
