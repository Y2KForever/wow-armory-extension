import { motion } from 'framer-motion';
import { useAppSelect } from '@/store/store';
import { selectSelectedTalents } from '@/store/selectors/selectTalents';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiCharacter } from '@/types/Characters';
import { CopyIcon } from '@/assets/icons/Copy';
import { SheetTalent, buildLoadouts, diffLoadouts } from '@/lib/talentLoadouts';

interface ITalentsProps {
  character: ApiCharacter;
}

const iconUrl = (spellId: number | null) =>
  spellId === null ? undefined : `url(https://cdn.y2kforever.com/talents/${spellId}.jpg)`;

export const Talents = ({ character }: ITalentsProps) => {
  const [shownIndex, setShownIndex] = useState<number | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const talents = useAppSelect(selectSelectedTalents);
  const loadouts = useMemo(() => buildLoadouts(character, talents), [character, talents]);

  const active = loadouts.find((loadout) => loadout.active) ?? loadouts[0];
  const shown = loadouts.find((loadout) => loadout.index === shownIndex) ?? active;
  const diff = useMemo(() => diffLoadouts(shown, active), [shown, active]);

  if (!shown) return <></>;

  const copyLoadout = async () => {
    if (!shown.code) return;
    await navigator.clipboard.writeText(shown.code);
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      className="relative flex flex-col flex-1 min-h-0 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        onClick={() => setListOpen((open) => !open)}
        className="flex items-center flex-none gap-[7px] h-[26px] px-[9px] border-b border-[rgba(138,109,20,.45)] hover:cursor-pointer hover:bg-[linear-gradient(180deg,rgba(221,172,0,.24),rgba(0,0,0,.4))]"
        style={{ background: 'linear-gradient(180deg,rgba(221,172,0,.12),rgba(0,0,0,.4))' }}
      >
        {shown.active && (
          <div
            className="flex-none w-[6px] h-[6px] rounded-full bg-[#4ac26b]"
            style={{ boxShadow: '0 0 5px rgba(74,194,107,.8)' }}
          />
        )}
        <span className="text-[10px] font-semibold tracking-[.03em] truncate text-[#f2ce4e]">{shown.label}</span>
        <span className="flex-none text-[8.5px] text-[#6f6141]">
          {shown.index + 1} of {loadouts.length}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`flex-none w-[11px] h-[11px] ml-auto fill-none stroke-[#c9a53c] transition-transform ${
            listOpen ? 'rotate-180' : ''
          }`}
          style={{ strokeWidth: 2.4 }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      <div
        className="flex items-center flex-none gap-[9px] h-[44px] px-[10px] border-b border-[rgba(138,109,20,.35)]"
        style={{ background: 'linear-gradient(180deg,#14120c,#0a0b0d)' }}
      >
        <div className="flex-none p-px" style={{ background: 'linear-gradient(145deg,#ddac00,#4a3a10)' }}>
          <div
            className="w-[28px] h-[28px] bg-cover bg-center"
            style={{
              backgroundImage: iconUrl(shown.groups.find((g) => g.key === 'hero')?.items[0]?.spellId ?? null),
            }}
          />
        </div>
        <div className="flex flex-col min-w-0 gap-px">
          <span
            className="font-friz text-[14px] leading-[1.05] truncate text-blizzard-yellow"
            style={{ textShadow: '0 1px 2px #000' }}
          >
            {shown.hero || character.spec}
          </span>
          <span className="text-[9px] text-[#9c9484] truncate">
            {shown.active ? 'Active in game' : `${diff.added.length + diff.dropped.length} changes from active`}
          </span>
        </div>
        {shown.code && (
          <div
            onClick={copyLoadout}
            className="flex items-center flex-none gap-[5px] ml-auto h-[22px] px-[8px] hover:cursor-pointer group"
            style={{
              background: 'linear-gradient(180deg,#1e1a10,#100e09)',
              boxShadow: 'inset 0 0 0 1px rgba(138,109,20,.55)',
            }}
          >
            <CopyIcon className="w-[11px] h-[11px] fill-none stroke-blizzard-gold-mute group-hover:stroke-blizzard-yellow" />
            <span className="text-[9.5px] text-blizzard-gold-mute group-hover:text-blizzard-yellow whitespace-nowrap">
              {copied ? 'Copied' : 'Copy'}
            </span>
          </div>
        )}
      </div>

      <div
        className="grid flex-none h-[30px] grid-cols-3 border-b border-[rgba(138,109,20,.3)]"
        style={{ background: 'linear-gradient(180deg,rgba(138,109,20,.14),rgba(0,0,0,.3))' }}
      >
        {shown.spread.map((entry) => (
          <div
            key={entry.key}
            className="flex items-center justify-center gap-[5px]"
            style={{ boxShadow: 'inset 1px 0 0 rgba(138,109,20,.18)' }}
          >
            <span className="text-[8px] font-semibold tracking-[.11em] truncate text-blizzard-gold-mute">
              {entry.label}
            </span>
            <span className="flex-none text-[11px] font-bold text-blizzard-yellow">{entry.points}</span>
          </div>
        ))}
      </div>

      <div className="relative flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {shown.groups
          .filter((group) => group.items.length > 0)
          .map((group) => (
            <div key={group.key} className="flex flex-col flex-none">
              <div
                className="flex items-center h-[19px] gap-[7px] px-[9px]"
                style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.22),rgba(0,0,0,0) 72%)' }}
              >
                <span className="text-[8.5px] font-semibold tracking-[.16em] whitespace-nowrap text-blizzard-gold-mid">
                  {group.label}
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.5),transparent)' }}
                />
                <span className="text-[8px] font-medium whitespace-nowrap text-[#6f6141]">{group.points} pts</span>
              </div>
              <div className="flex flex-wrap pt-[3px] px-[6px] pb-[5px] gap-x-[6px] gap-y-px">
                {group.items.map((talent) => (
                  <SheetRow key={talent.id} talent={talent} />
                ))}
              </div>
            </div>
          ))}

        {(diff.added.length > 0 || diff.dropped.length > 0) && (
          <div className="flex flex-col flex-none">
            <div
              className="flex items-center h-[19px] gap-[7px] px-[9px]"
              style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.22),rgba(0,0,0,0) 72%)' }}
            >
              <span className="text-[8.5px] font-semibold tracking-[.16em] whitespace-nowrap text-blizzard-gold-mid">
                CHANGES FROM ACTIVE
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.5),transparent)' }}
              />
              <span className="text-[8px] font-medium whitespace-nowrap text-[#6f6141]">
                +{diff.added.length} / &minus;{diff.dropped.length}
              </span>
            </div>
            <div className="flex flex-col gap-[3px] pt-[5px] px-[9px] pb-[10px]">
              {diff.added.map((talent) => (
                <DiffRow key={`add-${talent.id}`} talent={talent} added />
              ))}
              {diff.dropped.map((talent) => (
                <DiffRow key={`drop-${talent.id}`} talent={talent} added={false} />
              ))}
            </div>
          </div>
        )}

        <div
          className="sticky bottom-0 flex-none h-[24px] pointer-events-none"
          style={{ background: 'linear-gradient(180deg,rgba(8,9,12,0),rgba(8,9,12,.95))' }}
        />
      </div>

      {listOpen && (
        <div className="absolute inset-x-0 top-[28px] bottom-0 flex flex-col bg-[rgba(6,7,9,.72)]">
          <div
            className="flex flex-col flex-none border-b border-blizzard-bezel"
            style={{ background: 'linear-gradient(180deg,#16140d,#0d0d10)', boxShadow: '0 10px 22px rgba(0,0,0,.7)' }}
          >
            {loadouts.map((loadout) => (
              <div
                key={loadout.index}
                onClick={() => {
                  setShownIndex(loadout.index);
                  setListOpen(false);
                }}
                className="flex items-center flex-none gap-[8px] h-[46px] px-[9px] border-b border-[rgba(255,255,255,.045)] hover:cursor-pointer hover:bg-[rgba(221,172,0,.1)]"
                style={{ background: loadout.index === shown.index ? 'rgba(221,172,0,.1)' : 'transparent' }}
              >
                <div
                  className="flex-none p-px"
                  style={{
                    background: loadout.active
                      ? 'linear-gradient(145deg,#ddac00,#4a3a10)'
                      : 'linear-gradient(145deg,#4a3f22,#241f13)',
                  }}
                >
                  <div
                    className="w-[26px] h-[26px] bg-cover bg-center"
                    style={{
                      backgroundImage: iconUrl(
                        loadout.groups.find((g) => g.key === 'hero')?.items[0]?.spellId ?? null,
                      ),
                    }}
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0 gap-[2px]">
                  <div className="flex items-center gap-[5px] min-w-0">
                    {loadout.active && (
                      <div
                        className="flex-none w-[5px] h-[5px] rounded-full bg-[#4ac26b]"
                        style={{ boxShadow: '0 0 5px rgba(74,194,107,.8)' }}
                      />
                    )}
                    <span
                      className={`text-[10.5px] font-semibold truncate ${
                        loadout.active ? 'text-[#f2ce4e]' : 'text-[#d8d3c6]'
                      }`}
                    >
                      {loadout.label}
                    </span>
                  </div>
                  <span className="text-[8.5px] whitespace-nowrap text-[#7b6a45]">
                    {loadout.hero || character.spec} &middot; {loadout.spread.reduce((a, s) => a + s.points, 0)} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 hover:cursor-pointer" onClick={() => setListOpen(false)} />
        </div>
      )}
    </motion.div>
  );
};

const SheetRow = ({ talent }: { talent: SheetTalent }) => (
  <div className="flex items-center gap-[5px] h-[20px] min-w-0" style={{ flex: '0 0 calc(50% - 3px)' }}>
    <div
      className="flex-none w-[16px] h-[16px] bg-cover bg-center"
      style={{
        backgroundImage: iconUrl(talent.spellId),
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.8), 0 0 0 1px rgba(138,109,20,.45)',
      }}
    />
    <span className="text-[9px] truncate text-[#d8d3c6]">{talent.name}</span>
    {talent.maxRank > 1 && (
      <span className="flex-none ml-auto text-[8px] font-semibold text-blizzard-yellow">
        {talent.rank}/{talent.maxRank}
      </span>
    )}
  </div>
);

const DiffRow = ({ talent, added }: { talent: SheetTalent; added: boolean }) => (
  <div className="flex items-center gap-[6px] h-[19px] min-w-0">
    <span
      className={`flex-none w-[8px] text-center text-[10px] font-bold ${added ? 'text-[#7fc994]' : 'text-[#a35c4a]'}`}
    >
      {added ? '+' : '−'}
    </span>
    <div
      className="flex-none w-[15px] h-[15px] bg-cover bg-center"
      style={{
        backgroundImage: iconUrl(talent.spellId),
        filter: added ? undefined : 'grayscale(1)',
        opacity: added ? 1 : 0.5,
        boxShadow: `inset 0 0 0 1px rgba(0,0,0,.8), 0 0 0 1px ${
          added ? 'rgba(127,201,148,.4)' : 'rgba(163,92,74,.4)'
        }`,
      }}
    />
    <span className={`text-[9px] truncate ${added ? 'text-[#c3d6c6]' : 'text-[#8d8377]'}`}>{talent.name}</span>
  </div>
);
