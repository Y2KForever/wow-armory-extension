import { ReactNode } from 'react';

interface IFrameProps {
  header: ReactNode;
  children: ReactNode;
}

export const Frame = ({ header, children }: IFrameProps) => {
  return (
    <div
      className="flex flex-col w-full h-[500px] overflow-hidden border border-blizzard-bezel font-semplicita text-[#e8e4da]"
      style={{
        background: 'radial-gradient(130% 70% at 50% 0%, #171a22 0%, #08090c 72%)',
        boxShadow: 'inset 0 0 0 1px #0a0b0e, inset 0 0 34px rgba(0,0,0,.85)',
      }}
    >
      <div
        className="flex items-center flex-none h-[32px] border-b border-blizzard-bezel"
        style={{ background: 'linear-gradient(180deg,#2a2210,#141108)' }}
      >
        {header}
      </div>
      <div
        className="flex-none h-[2px] opacity-55"
        style={{
          background: 'linear-gradient(90deg,transparent,#8a6d14 18%,#ddac00 50%,#8a6d14 82%,transparent)',
        }}
      />
      <div className="flex flex-col flex-1 min-h-0">{children}</div>
    </div>
  );
};
