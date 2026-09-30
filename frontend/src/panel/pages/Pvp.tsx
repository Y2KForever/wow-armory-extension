import { motion } from 'framer-motion';
import React, { useMemo, useState } from 'react';
import { ApiCharacter } from '@/types/Characters';
import { Swords } from '@/assets/icons/Swords';
import { BracketKind, buildBracketRows, formatKills, pvpSeasonLabel } from '@/lib/pvp';

const Stat = ({ value, label, color, divider }: { value: string; label: string; color: string; divider: boolean }) => (
  <div
    className={`flex flex-col items-center flex-1 gap-[2px] pt-[10px] pb-[9px] ${
      divider ? 'border-r border-[rgba(138,109,20,.22)]' : ''
    }`}
  >
    <span className="text-[23px] font-bold leading-none" style={{ color, textShadow: '0 1px 3px #000' }}>
      {value}
    </span>
    <span className="text-[7.5px] font-medium tracking-[.18em] whitespace-nowrap text-blizzard-gold-mute">{label}</span>
  </div>
);

const PvpViewComponent = ({ character }: { character: ApiCharacter }) => {
  const [hovered, setHovered] = useState<BracketKind | null>(null);
  const pvp = character.pvp;
  const rows = useMemo(() => (pvp ? buildBracketRows(pvp) : []), [pvp]);
  const top = rows[0];
  const detail = rows.find((row) => row.kind === hovered);

  if (!pvp) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center flex-1 gap-[8px] px-[30px] text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Swords className="w-[26px] h-[26px] text-[#3f3a2c]" />
        <span className="text-[12px] leading-[1.5] text-[#6a6455]">No PvP data recorded for {character.name}.</span>
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
        <span className="font-friz text-[13.5px] truncate text-blizzard-yellow" style={{ textShadow: '0 1px 2px #000' }}>
          {pvpSeasonLabel(pvp)}
        </span>
      </div>

      <div className="flex flex-none border-b border-[rgba(138,109,20,.35)]">
        <Stat
          value={top && top.rating > 0 ? String(top.rating) : '—'}
          label="TOP RATING"
          color={top?.color ?? '#5a5445'}
          divider
        />
        <Stat value={String(pvp.honor_level)} label="HONOR LEVEL" color="#ddac00" divider />
        <Stat value={formatKills(pvp.honorable_kills)} label="HONORABLE KILLS" color="#d8d3c6" divider={false} />
      </div>

      <div
        className="flex items-center flex-none gap-[7px] h-[19px] px-[11px]"
        style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.22),rgba(0,0,0,0) 72%)' }}
      >
        <span className="text-[8.5px] font-semibold tracking-[.16em] whitespace-nowrap text-blizzard-gold-mid">
          RATED BRACKETS
        </span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.5),transparent)' }} />
        <span className="text-[8px] font-medium whitespace-nowrap text-[#6f6141]">by rating</span>
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden" onMouseLeave={() => setHovered(null)}>
        {rows.map((row) => (
          <div
            key={row.kind}
            onMouseEnter={() => setHovered(row.kind)}
            className="flex flex-col justify-center flex-1 min-h-0 gap-[6px] px-[11px] py-[7px] border-b border-[rgba(138,109,20,.14)] hover:cursor-pointer hover:bg-[rgba(221,172,0,.14)]"
            style={{ opacity: row.rating > 0 ? 1 : 0.55 }}
          >
            <div className="flex items-baseline gap-[7px]">
              <span className="min-w-0 text-[12px] leading-none truncate text-[#d8d3c6]">{row.label}</span>
              {row.note && (
                <span className="flex-none text-[9px] leading-none whitespace-nowrap text-[#6f6141]">{row.note}</span>
              )}
              <span
                className="flex-none ml-auto text-[19px] font-bold leading-none"
                style={{ color: row.color, textShadow: '0 1px 2px #000' }}
              >
                {row.rating > 0 ? row.rating : '—'}
              </span>
            </div>
            <div className="flex items-center gap-[8px]">
              <span
                className="flex-none text-[8px] font-semibold leading-none tracking-[.14em] whitespace-nowrap"
                style={{ color: row.color }}
              >
                {row.tier.toUpperCase()}
              </span>
              <div className="flex-1 h-[3px] min-w-[26px] bg-[rgba(138,109,20,.2)]">
                <div className="h-[3px]" style={{ width: `${row.winPct}%`, background: row.color }} />
              </div>
              <span className="flex-none font-mono text-[9.5px] leading-none whitespace-nowrap text-[#9c9484]">
                {row.record}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="flex items-center flex-none gap-[8px] h-[26px] px-[11px] border-t border-[rgba(138,109,20,.4)]"
        style={{ background: 'linear-gradient(180deg,#0d0c08,#08090c)' }}
      >
        {detail ? (
          <>
            <span className="min-w-0 text-[10px] font-medium truncate text-[#9c9484]">{detail.label}</span>
            <span className="flex-none ml-auto text-[9.5px] whitespace-nowrap text-[#6f6141]">{detail.detail}</span>
          </>
        ) : (
          <span className="text-[10.5px] whitespace-nowrap text-[#5f5744]">Hover a bracket for its season record</span>
        )}
      </div>
    </motion.div>
  );
};

export const PvpView = React.memo(PvpViewComponent);
