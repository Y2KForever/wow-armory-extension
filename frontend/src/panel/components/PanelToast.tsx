export type ToastKind = 'done' | 'error';

type PanelToastProps = {
  kind: ToastKind;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
};

const TONES = {
  done: { seam: '#2f8f3f', fg: '#7fd18f', bg: 'rgba(24,48,28,.55)', d: 'M5 13l4 4L19 7' },
  error: { seam: '#c41e3b', fg: '#e8867c', bg: 'rgba(60,14,20,.6)', d: 'M12 6v7M12 17v.01' },
} as const;

export const PanelToast = ({ kind, text, actionLabel, onAction }: PanelToastProps) => {
  const tone = TONES[kind];

  return (
    <div className="flex flex-col flex-none">
      <div
        className="flex-none h-[2px]"
        style={{ background: `linear-gradient(90deg,transparent,${tone.seam} 30%,${tone.seam} 70%,transparent)` }}
      />
      <div
        className="flex items-center gap-[8px] min-h-[36px] pl-[10px] pr-[8px] py-[7px]"
        style={{ background: `linear-gradient(180deg,${tone.bg},#08090c)` }}
      >
        <div
          className="flex items-center justify-center flex-none w-[16px] h-[16px] border"
          style={{ borderColor: tone.seam, color: tone.fg }}
        >
          <svg
            viewBox="0 0 24 24"
            width="10"
            height="10"
            className="fill-none stroke-current"
            strokeWidth={2.4}
            strokeLinecap="round"
          >
            <path d={tone.d} />
          </svg>
        </div>
        <span className="min-w-0 text-[10.5px] leading-[1.35] text-[#d8d3c6]">{text}</span>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="flex-none ml-auto px-[8px] py-[5px] border border-[rgba(138,109,20,.6)] bg-black/45 hover:border-blizzard-yellow hover:cursor-pointer"
          >
            <span className="text-[8.5px] font-semibold leading-none tracking-[.16em] whitespace-nowrap text-blizzard-yellow">
              {actionLabel}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
