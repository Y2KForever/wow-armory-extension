import { DoubleArrowLeft } from '@/assets/icons/DoubleArrowLeft';
import { Views } from '@/types/User';
import { useEffect, useMemo } from 'react';
import { Update } from '@/assets/icons/Update';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useGetForceUpdateMutation } from '@/store/api/profile';
import { motion, useAnimation } from 'framer-motion';
import { useCountdown } from '@/hooks/useCountdown';
import { useTwitchAuth } from '@/hooks/useTwitchAuth';
import { useFetchInstancesQuery, useFetchTalentsQuery } from '@/store/api/characters';
import { ApiCharacter, InstanceType } from '@/types/Characters';
import { toUnderscores } from '@/lib/utils';
import { Skull } from '@/assets/icons/Skull';
// Re-enable with the PvP tab below.
// import { Swords } from '@/assets/icons/Swords';
// Re-enable with the Dungeon tab below.
// import { Dungeon } from '@/assets/icons/Dungeon';
import { Hourglass } from '@/assets/icons/Hourglass';
import { Helmet } from '@/assets/icons/Helmet';
import { Star } from '@/assets/icons/Star';

interface IMenuHeaderProps {
  setView: React.Dispatch<React.SetStateAction<Views>>;
  view: Views;
  selectedCharacter: ApiCharacter | null;
}

const ACTIVE_PLATE = 'linear-gradient(180deg,#0a0906,#1d1809)';
const ACTIVE_INNER = 'inset 0 2px 6px rgba(0,0,0,.9),inset 0 -2px 0 #ddac00';
const ACTIVE_GLOW = 'drop-shadow(0 0 3px rgba(221,172,0,.55))';

export const MenuHeader = ({ setView, view, selectedCharacter }: IMenuHeaderProps) => {
  if (!selectedCharacter) return null;

  const twitchAuth = useTwitchAuth();
  const isStreamer = useMemo(() => `U${twitchAuth.channelId}` === twitchAuth.userId, [twitchAuth]);
  const controls = useAnimation();
  const countdown = useCountdown(selectedCharacter?.forced_update ?? new Date(0).toISOString());
  const [getForceUpdate, { isLoading: isLoadingforceUpdate }] = useGetForceUpdateMutation();
  const classSpec = `${selectedCharacter?.spec?.toLowerCase()}-${toUnderscores(selectedCharacter?.class.toLowerCase())}`;

  const { isLoading: isTalentsLoading } = useFetchTalentsQuery(
    {
      spec: classSpec,
      character: selectedCharacter,
    },
    {
      skip: !selectedCharacter,
    },
  );

  const { isLoading: isRaidsLoading } = useFetchInstancesQuery(
    {
      type: InstanceType.RAID,
      character: selectedCharacter,
    },
    {
      skip: !selectedCharacter,
    },
  );

  useEffect(() => {
    if (isLoadingforceUpdate) {
      controls.start({
        rotate: 360,
        transition: {
          duration: 1,
          ease: 'linear',
          repeat: Infinity,
        },
      });
    } else {
      controls.stop();
      controls.set({ rotate: 0 });
    }
  }, [isLoadingforceUpdate, controls]);

  const forceUpdate = async () => {
    try {
      await getForceUpdate(selectedCharacter.character_id).unwrap();
    } catch (err) {
      console.log(err);
    }
  };

  const tabs = [
    { key: Views.CHARACTER, Icon: Helmet, blocked: false },
    { key: Views.TALENTS, Icon: Star, blocked: isTalentsLoading },
    { key: Views.RAIDS, Icon: Skull, blocked: isRaidsLoading },
    { key: Views.MPLUS, Icon: Hourglass, blocked: false },
    // { key: Views.PVP, Icon: Swords, blocked: isRaidsLoading },
  ];

  return (
    <div className="flex items-center w-full h-full">
      <div
        className="flex items-center justify-center flex-none w-[30px] h-[32px] text-blizzard-gold-dim hover:text-blizzard-yellow hover:cursor-pointer"
        onClick={() => setView(Views.LIST)}
      >
        <DoubleArrowLeft className="w-[15px] h-[15px] stroke-current fill-none" />
      </div>

      <div className="flex mx-auto">
        {tabs.map(({ key, Icon, blocked }) => {
          const active = view === key;
          return (
            <div
              key={key}
              onClick={() => {
                if (!blocked) {
                  setView(key);
                }
              }}
              className="flex items-center justify-center w-[34px] h-[32px] hover:cursor-pointer"
              style={{
                background: active ? ACTIVE_PLATE : 'transparent',
                boxShadow: active ? ACTIVE_INNER : 'none',
                filter: active ? ACTIVE_GLOW : 'none',
              }}
            >
              <Icon
                className={`w-[15px] h-[15px] ${
                  active
                    ? 'fill-blizzard-yellow text-blizzard-yellow'
                    : 'fill-[#6f6141] text-[#6f6141] hover:fill-blizzard-gold-mid hover:text-blizzard-gold-mid'
                }`}
              />
            </div>
          );
        })}
      </div>

      {!countdown.invalid && isStreamer ? (
        <div className="flex items-center justify-center flex-none w-[30px] h-[32px]">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipContent>
                {countdown.expired
                  ? `Update character info`
                  : `Update available in: ${countdown.hours}:${countdown.minutes}:${countdown.seconds}`}
              </TooltipContent>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    onClick={forceUpdate}
                    disabled={!countdown.expired}
                    className="p-0 bg-transparent group hover:bg-transparent h-[32px] w-[30px]"
                  >
                    <motion.div animate={controls}>
                      <Update className="w-[14px] h-[14px] fill-none stroke-[#5c4d24] group-hover:stroke-blizzard-yellow" />
                    </motion.div>
                  </Button>
                </div>
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <div className="flex-none w-[30px] h-[32px]" />
      )}
    </div>
  );
};
