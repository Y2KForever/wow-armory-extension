import { useEffect, useMemo, useState } from 'react';

const useQueryParams = () => {
  const [params, setParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => setParams(new URLSearchParams(window.location.search));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return params;
};

const Check = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-none stroke-blizzard-yellow" strokeWidth={2.4}>
    <path d="M4.5 12.5l5 5L20 6.5" />
  </svg>
);

const Cross = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" className="fill-none stroke-[#c14b4b]" strokeWidth={2.4}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const App = () => {
  const queryParams = useQueryParams();

  const { ok, region, battletag } = useMemo(
    () => ({
      ok: queryParams.get('state') !== null,
      region: queryParams.get('region'),
      battletag: queryParams.get('battletag'),
    }),
    [queryParams],
  );

  return (
    <div
      className="flex flex-col items-center justify-center w-full min-h-screen font-semplicita text-[#e8e4da]"
      style={{ background: 'radial-gradient(115% 65% at 50% 12%,#1b1f28 0%,#08090c 72%)' }}
    >
      <div
        className="flex-none w-full max-w-[620px] h-[2px] opacity-55"
        style={{ background: 'linear-gradient(90deg,transparent,#8a6d14 14%,#ddac00 50%,#8a6d14 86%,transparent)' }}
      />
      <div className="flex flex-col items-center justify-center flex-1 gap-[15px] px-[56px] py-[64px] w-full max-w-[620px] border border-t-0 border-blizzard-bezel">
        <div
          className="flex items-center justify-center flex-none w-[52px] h-[52px] border border-blizzard-bezel"
          style={{
            background: 'linear-gradient(180deg,#2a2210,#141108)',
            boxShadow: 'inset 0 1px 0 rgba(242,206,78,.25), 0 0 22px rgba(221,172,0,.14)',
          }}
        >
          {ok ? <Check /> : <Cross />}
        </div>

        <div className="flex flex-col items-center gap-[7px]">
          <span
            className={`font-friz text-[24px] ${ok ? 'text-blizzard-yellow' : 'text-[#c14b4b]'}`}
            style={{ textShadow: '0 1px 3px #000' }}
          >
            {ok ? 'Account linked' : 'Something went wrong'}
          </span>
          <span className="text-center text-[13px] leading-[1.65] text-[#8b8371]">
            {ok
              ? 'Your Battle.net account is connected to the armory extension. You can close this window and carry on in the extension config.'
              : 'We could not link your Battle.net account. Close this window and try connecting again from the extension config.'}
          </span>
        </div>

        {ok && (battletag || region) && (
          <div
            className="flex items-center gap-[8px] py-[7px] px-[12px] border border-[rgba(138,109,20,.35)]"
            style={{ background: 'rgba(0,0,0,.4)' }}
          >
            <div
              className="flex-none w-[7px] h-[7px] rounded-full bg-[#4ac26b]"
              style={{ boxShadow: '0 0 6px rgba(74,194,107,.7)' }}
            />
            <span className="text-[12px] font-semibold text-[#e8e4da]">{battletag || 'Battle.net'}</span>
            {region && <span className="text-[11.5px] text-[#6f6752] uppercase">{region}</span>}
          </div>
        )}

        <div className="flex-none p-px mt-[2px]" style={{ background: 'linear-gradient(180deg,#f2ce4e,#6b5420)' }}>
          <button
            onClick={() => window.close()}
            className="py-[10px] px-[22px] border border-[#f2ce4e] text-[12.5px] font-semibold text-[#231a02] hover:cursor-pointer"
            style={{ background: 'linear-gradient(180deg,#f2ce4e,#a8790a)' }}
          >
            Close this window
          </button>
        </div>

        <span className="text-[11px] text-[#5a5445]">
          Nothing was posted to your account. Revoke access any time from Battle.net.
        </span>
      </div>
    </div>
  );
};

export default App;
