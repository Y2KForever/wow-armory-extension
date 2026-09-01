import { ReactNode } from 'react';

export type ConfigStep = 'connect' | 'fetch' | 'choose';

const STEPS: { key: ConfigStep; label: string }[] = [
  { key: 'connect', label: 'Connect Battle.net' },
  { key: 'fetch', label: 'Fetch characters' },
  { key: 'choose', label: 'Choose what to import' },
];

const ORDER: ConfigStep[] = ['connect', 'fetch', 'choose'];

export const ConfigShell = ({ step, children }: { step: ConfigStep; children: ReactNode }) => {
  const current = ORDER.indexOf(step);

  return (
    <div
      className="relative flex flex-col w-full max-w-[660px] overflow-hidden border border-blizzard-bezel font-semplicita text-[#e8e4da]"
      style={{
        background: 'radial-gradient(120% 60% at 50% 0%,#171a22 0%,#08090c 70%)',
        boxShadow: 'inset 0 0 0 1px #0a0b0e',
      }}
    >
      <div
        className="flex items-center flex-none gap-[10px] h-[46px] px-[18px] border-b border-blizzard-bezel"
        style={{ background: 'linear-gradient(180deg,#2a2210,#141108)' }}
      >
        <span className="font-friz text-[19px] text-blizzard-yellow" style={{ textShadow: '0 1px 2px #000' }}>
          Armory Setup
        </span>
        <span className="flex-1" />
        <span className="text-[10px] font-medium tracking-[.12em] uppercase text-blizzard-gold-mute">
          Twitch panel extension
        </span>
      </div>
      <div
        className="flex-none h-[2px] opacity-55"
        style={{ background: 'linear-gradient(90deg,transparent,#8a6d14 14%,#ddac00 50%,#8a6d14 86%,transparent)' }}
      />

      <div
        className="flex items-center flex-none gap-[10px] h-[44px] px-[18px] border-b border-[rgba(138,109,20,.32)]"
        style={{ background: 'linear-gradient(180deg,rgba(138,109,20,.1),rgba(0,0,0,.3))' }}
      >
        {STEPS.map(({ key, label }, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <div key={key} className="flex items-center flex-1 gap-[9px] min-w-0">
              <div
                className="flex items-center justify-center flex-none w-[18px] h-[18px] text-[10px] font-semibold"
                style={{
                  background: active ? '#ddac00' : done ? 'rgba(221,172,0,.18)' : 'transparent',
                  border: `1px solid ${active || done ? '#8a6d14' : '#332b18'}`,
                  color: active ? '#231a02' : done ? '#c9a53c' : '#5a5445',
                }}
              >
                {index + 1}
              </div>
              <span
                className="text-[11.5px] font-medium whitespace-nowrap"
                style={{ color: active ? '#e8e4da' : done ? '#9c8c5f' : '#5a5445' }}
              >
                {label}
              </span>
              <div
                className="flex-1 h-px min-w-[12px]"
                style={{ background: done ? 'rgba(138,109,20,.5)' : 'rgba(138,109,20,.18)' }}
              />
            </div>
          );
        })}
      </div>

      {children}
    </div>
  );
};

export const GoldButton = ({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) => (
  <div
    className="flex-none p-px"
    style={{ background: disabled ? '#2a2418' : 'linear-gradient(180deg,#f2ce4e,#6b5420)' }}
  >
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-[9px] py-[11px] px-[20px] text-[13px] font-semibold disabled:cursor-not-allowed hover:cursor-pointer"
      style={{
        background: disabled ? '#15130d' : 'linear-gradient(180deg,#f2ce4e,#a8790a)',
        border: `1px solid ${disabled ? '#2a2418' : '#f2ce4e'}`,
        color: disabled ? '#5a5445' : '#231a02',
      }}
    >
      {children}
    </button>
  </div>
);

export const Pill = ({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) => (
  <div
    onClick={onClick}
    className="flex items-center gap-[7px] py-[6px] px-[13px] text-[11.5px] font-medium hover:cursor-pointer"
    style={{
      color: on ? '#231a02' : '#9c8c5f',
      background: on ? 'linear-gradient(180deg,#f2ce4e,#a8790a)' : 'linear-gradient(180deg,#1b1810,#100e09)',
      border: `1px solid ${on ? '#f2ce4e' : '#332b18'}`,
    }}
  >
    {children}
  </div>
);
