import * as bg from '../../assets/bg.jpg';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TwitchAuthContext } from '../App';
import { useGetProfileQuery, useLazyGetGenerateSignedUrlQuery } from '@/store/api/profile';
import { Spinner } from '@/assets/icons/Spinner';
import { isFetchBaseQueryError } from '@/lib/utils';
import { useLazyPostFetchCharactersQuery, useImportCharactersMutation } from '@/store/api/characters';
import { toast } from 'sonner';
import { useAppSelect } from '@/store/store';
import { selectSelectedCharacters } from '@/store/selectors/selectCharacters';
import { BattleNet } from '@/assets/icons/BattleNet';
import { ConfigShell, ConfigStep, GoldButton, Pill } from '../components/ConfigShell';
import { CharacterPicker } from '../components/CharacterPicker';

const REGIONS = ['eu', 'us', 'kr', 'tw'];
const VERSIONS = [
  { value: 'retail', label: 'Retail' },
  { value: 'classic', label: 'Classic' },
  { value: 'classic1x', label: 'Classic Era' },
];

export const Config = () => {
  const characters = useAppSelect(selectSelectedCharacters);
  const twitchAuth = useContext(TwitchAuthContext);
  const isAuthLoading = !twitchAuth.authorized || !twitchAuth.channelId;

  const { isLoading: isProfileLoading, error, data } = useGetProfileQuery(undefined, { skip: isAuthLoading });
  const [getCharacters, { isLoading: isFetching }] = useLazyPostFetchCharactersQuery();
  const [importCharacters, { isLoading: isImporting }] = useImportCharactersMutation();
  const [getSignedUrl] = useLazyGetGenerateSignedUrlQuery();

  const [region, setRegion] = useState<string | undefined>(undefined);
  const [namespaces, setNamespaces] = useState<string[]>(['retail']);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [waitingForBattleNet, setWaitingForBattleNet] = useState(false);
  const [imported, setImported] = useState(false);
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    if (data?.region) setRegion(data.region);
  }, [data]);

  useEffect(() => {
    if (data?.authorized) setWaitingForBattleNet(false);
  }, [data?.authorized]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (popupRef.current?.closed) {
        popupRef.current = null;
        setWaitingForBattleNet(false);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const step: ConfigStep = useMemo(() => {
    if (!data?.authorized) return 'connect';
    return characters.length > 0 ? 'choose' : 'fetch';
  }, [data?.authorized, characters.length]);

  const versionText = namespaces.length
    ? VERSIONS.filter((v) => namespaces.includes(v.value))
        .map((v) => v.label)
        .join(' and ')
    : 'no versions selected';

  const openPopup = async () => {
    if (!region) return;
    const { data: url, error: urlError } = await getSignedUrl({ region: region.toLowerCase() });
    if (urlError) {
      toast.error('Error', { description: 'Failed to create a secure url, please try again later.' });
      return;
    }
    popupRef.current = window.open(url, '_blank', 'width=800,height=600,noopener,noreferrer');
    setWaitingForBattleNet(true);
  };

  const fetchCharacters = async () => {
    if (!region) {
      toast.error('Error', { description: 'Please select a region' });
      return;
    }
    try {
      await getCharacters({ region, namespaces }).unwrap();
    } catch (err) {
      toast.error('Error', {
        description:
          isFetchBaseQueryError(err) && err.data.error ? err.data.error : 'Something went wrong. Please try again later.',
      });
    }
  };

  const importSelected = async () => {
    if (!region || selected.size === 0) return;
    try {
      await importCharacters({
        characters: characters.filter((character) => selected.has(character.id)),
        region,
      }).unwrap();
      setImported(true);
    } catch (err) {
      toast.error('Failed to import', {
        description: isFetchBaseQueryError(err) ? err.data.error : 'Something went wrong, try again later.',
      });
    }
  };

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const setMany = (ids: number[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });

  if (isAuthLoading || isProfileLoading) {
    return (
      <Backdrop>
        <div className="flex items-center justify-center flex-1">
          <Spinner className="animate-spin fill-current" />
        </div>
      </Backdrop>
    );
  }

  if (error && isFetchBaseQueryError(error) && error.status !== 404) {
    return (
      <Backdrop>
        <div className="flex flex-col p-5 mt-5 rounded-lg bg-backgroundBlizzard">
          <p className="text-sm text-white">Something went wrong. Please try again later.</p>
        </div>
      </Backdrop>
    );
  }

  return (
    <Backdrop>
      <ConfigShell step={step}>
        {step === 'connect' && !waitingForBattleNet && (
          <div className="flex flex-col justify-center flex-1 gap-[16px] px-[40px] py-[36px]">
            <div className="flex flex-col gap-[6px]">
              <span className="font-friz text-[22px] text-blizzard-yellow" style={{ textShadow: '0 1px 3px #000' }}>
                Connect your Battle.net account
              </span>
              <span className="max-w-[440px] text-[12.5px] leading-[1.6] text-[#8b8371]">
                We read your character list and profile progress only. Nothing is posted to your account, and you can
                revoke access from Battle.net at any time.
              </span>
            </div>
            <div className="flex items-center gap-[12px]">
              <span className="text-[10.5px] font-medium tracking-[.1em] text-blizzard-gold-mute">REGION</span>
              <div className="flex gap-[6px]">
                {REGIONS.map((value) => (
                  <Pill key={value} on={region === value} onClick={() => setRegion(value)}>
                    {value.toUpperCase()}
                  </Pill>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-[14px] mt-[2px]">
              <GoldButton onClick={openPopup} disabled={!region}>
                <BattleNet className="w-[15px] h-[15px] fill-current" />
                Connect Battle.net
              </GoldButton>
              <span className="text-[11.5px] text-[#6f6752]">Opens a Battle.net login in a new window.</span>
            </div>
          </div>
        )}

        {step === 'connect' && waitingForBattleNet && (
          <div className="flex flex-col justify-center flex-1 gap-[15px] px-[40px] py-[36px]">
            <div className="flex items-center gap-[11px]">
              <div className="flex gap-[4px]">
                {[1, 0.5, 0.2].map((opacity) => (
                  <div
                    key={opacity}
                    className="w-[6px] h-[6px] rotate-45"
                    style={{ background: `rgba(221,172,0,${opacity})` }}
                  />
                ))}
              </div>
              <span className="font-friz text-[20px] text-blizzard-yellow" style={{ textShadow: '0 1px 3px #000' }}>
                Waiting for Battle.net
              </span>
            </div>
            <span className="max-w-[430px] text-[12.5px] leading-[1.7] text-[#8b8371]">
              Sign in in the window that just opened. When it tells you the account is linked and that you may close the
              window, close it — this page picks up from there on its own.
            </span>
            <div className="flex items-center gap-[10px] max-w-[430px] py-[11px] px-[13px] bg-black/35 border border-[rgba(138,109,20,.3)]">
              <svg viewBox="0 0 24 24" width="14" height="14" className="flex-none fill-none stroke-blizzard-gold-mute" strokeWidth={2}>
                <path d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
              </svg>
              <span className="text-[11.5px] text-[#8b8371]">landing.y2kforever.com</span>
              <span className="flex-1" />
              <span onClick={openPopup} className="text-[11.5px] font-medium text-blizzard-gold-mid hover:text-[#f2ce4e] hover:cursor-pointer">
                Open again
              </span>
            </div>
          </div>
        )}

        {step === 'fetch' && !isFetching && (
          <div className="flex flex-col justify-center flex-1 gap-[16px] px-[40px] py-[36px]">
            <div
              className="flex items-center gap-[9px] py-[11px] px-[13px] border border-[rgba(74,194,107,.32)]"
              style={{ background: 'linear-gradient(90deg,rgba(74,194,107,.1),rgba(0,0,0,.2))' }}
            >
              <div
                className="flex-none w-[7px] h-[7px] rounded-full bg-[#4ac26b]"
                style={{ boxShadow: '0 0 6px rgba(74,194,107,.7)' }}
              />
              <span className="text-[12.5px] font-semibold text-[#e8e4da]">{data?.battletag || 'Battle.net'}</span>
              <span className="text-[11.5px] text-[#6f6752]">linked &middot; {region?.toUpperCase()}</span>
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="font-friz text-[20px] text-blizzard-yellow" style={{ textShadow: '0 1px 3px #000' }}>
                Fetch your characters
              </span>
              <span className="max-w-[440px] text-[12.5px] leading-[1.6] text-[#8b8371]">
                Pick which game versions to pull. Fetching is manual, so you can run it again after you level, transfer,
                or roll something new.
              </span>
            </div>
            <div className="flex items-center gap-[12px]">
              <span className="text-[10.5px] font-medium tracking-[.1em] text-blizzard-gold-mute">VERSION</span>
              <div className="flex gap-[6px]">
                {VERSIONS.map((version) => {
                  const on = namespaces.includes(version.value);
                  return (
                    <Pill
                      key={version.value}
                      on={on}
                      onClick={() =>
                        setNamespaces((prev) =>
                          prev.includes(version.value)
                            ? prev.filter((value) => value !== version.value)
                            : [...prev, version.value],
                        )
                      }
                    >
                      <div
                        className="w-[6px] h-[6px] flex-none rotate-45"
                        style={{ background: on ? '#231a02' : '#4a3f22' }}
                      />
                      {version.label}
                    </Pill>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-[14px] mt-[2px]">
              <GoldButton onClick={fetchCharacters} disabled={namespaces.length === 0}>
                Fetch characters
              </GoldButton>
              <span className="text-[11.5px] text-[#6f6752]">{versionText}</span>
            </div>
          </div>
        )}

        {isFetching && (
          <div className="flex flex-col justify-center flex-1 gap-[14px] px-[40px] py-[36px]">
            <span className="font-friz text-[20px] text-blizzard-yellow" style={{ textShadow: '0 1px 3px #000' }}>
              Fetching characters
            </span>
            <div className="max-w-[440px] h-[4px] bg-black/50 border border-[rgba(138,109,20,.3)] overflow-hidden">
              <div
                className="h-full w-1/3 animate-pulse"
                style={{ background: 'linear-gradient(90deg,#8a6d14,#f2ce4e)' }}
              />
            </div>
            <span className="text-[12px] text-[#8b8371]">
              Asking Blizzard for {versionText}. Large accounts take a few seconds.
            </span>
          </div>
        )}

        {step === 'choose' && !isFetching && (
          <>
            <CharacterPicker characters={characters} selected={selected} onToggle={toggle} onSetMany={setMany} />
            <div
              className="flex items-center flex-none gap-[14px] h-[62px] px-[18px] border-t border-[rgba(138,109,20,.45)]"
              style={{ background: 'linear-gradient(180deg,#0d0c08,#08090c)' }}
            >
              <span className="text-[12px]" style={{ color: selected.size ? '#e8e4da' : '#6f6752' }}>
                {selected.size ? `${selected.size} selected` : 'Nothing selected'}
              </span>
              <span className="flex-1" />
              <div
                onClick={fetchCharacters}
                className="flex-none py-[9px] px-[15px] border border-[#2a2418] text-[12px] font-medium text-blizzard-gold-mute hover:text-blizzard-gold-mid hover:border-[#5c4c22] hover:cursor-pointer"
              >
                Fetch again
              </div>
              <GoldButton onClick={importSelected} disabled={selected.size === 0 || isImporting}>
                {isImporting ? 'Importing…' : `Import ${selected.size || ''}`.trim()}
              </GoldButton>
            </div>
          </>
        )}

        {imported && (
          <div
            className="absolute left-[18px] right-[18px] top-[104px] flex items-center gap-[11px] py-[13px] px-[14px] border border-[rgba(74,194,107,.45)]"
            style={{
              background: 'linear-gradient(90deg,rgba(74,194,107,.14),rgba(10,11,14,.96) 60%), #0a0b0e',
              boxShadow: '0 8px 24px rgba(0,0,0,.6)',
            }}
          >
            <div className="flex items-center justify-center flex-none w-[20px] h-[20px] rounded-full bg-[rgba(74,194,107,.18)] border border-[rgba(74,194,107,.6)]">
              <svg viewBox="0 0 24 24" width="12" height="12" className="fill-none stroke-[#4ac26b]" strokeWidth={3}>
                <path d="M5 13l4.5 4.5L19 7" />
              </svg>
            </div>
            <div className="flex flex-col gap-[2px] min-w-0">
              <span className="text-[12.5px] font-semibold text-[#e8e4da]">Import complete</span>
              <span className="text-[11.5px] text-[#8b8371]">
                {selected.size} character{selected.size === 1 ? '' : 's'} are now in your panel.
              </span>
            </div>
            <span className="flex-1" />
            <div
              onClick={() => setImported(false)}
              className="flex flex-none text-[#6f6752] hover:text-[#e8e4da] hover:cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" className="fill-none stroke-current" strokeWidth={2}>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </div>
          </div>
        )}
      </ConfigShell>
    </Backdrop>
  );
};

const Backdrop = ({ children }: { children: React.ReactNode }) => (
  <div
    className="flex flex-col items-center w-full h-full text-white bg-cover"
    style={{ backgroundImage: `url(${bg.default})` }}
  >
    <div className="flex flex-col items-center w-full h-full py-[28px] px-4 overflow-y-auto backdrop-brightness-50">
      {children}
    </div>
  </div>
);
