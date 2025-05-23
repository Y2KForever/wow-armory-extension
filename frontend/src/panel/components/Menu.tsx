import { DoubleArrowLeft } from '@/assets/icons/DoubleArrowLeft';
import { Separator } from '@/components/ui/separator';
import { CharacterIcon } from '@/assets/icons/CharacterIcon';
import { Views } from '@/types/User';
import { Star } from '@/assets/icons/Star';
import { useEffect, useMemo } from 'react';
import { Update } from '@/assets/icons/Update';
import { Button } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useGetForceUpdateMutation } from '@/store/api/profile';
import { motion, useAnimation } from 'framer-motion';
import { useCountdown } from '@/hooks/useCountdown';
import { useAppSelect } from '@/store/store';
import { selectSelectedProfile } from '@/store/selectors/selectProfile';
import { useTwitchAuth } from '@/hooks/useTwitchAuth';
import { useFetchInstancesQuery, useFetchTalentsQuery } from '@/store/api/characters';
import { ApiCharacter, InstanceType } from '@/types/Characters';
import { toUnderscores } from '@/lib/utils';
import { Skull } from '@/assets/icons/Skull';

interface IMenuHeaderProps {
  setView: React.Dispatch<React.SetStateAction<Views>>;
  view: Views;
  selectedCharacter: ApiCharacter | null;
}

export const MenuHeader = ({ setView, view, selectedCharacter }: IMenuHeaderProps) => {
  if (!selectedCharacter) return null;

  const twitchAuth = useTwitchAuth();
  const isStreamer = useMemo(() => `U${twitchAuth.channelId}` === twitchAuth.userId, [twitchAuth]);
  const selectedUser = useAppSelect(selectSelectedProfile);
  const controls = useAnimation();
  const countdown = useCountdown(selectedUser?.forcedUpdate ?? '');
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
      await getForceUpdate(undefined).unwrap();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row w-full h-[32px] items-center bg-backgroundBlizzard-light space-between">
        <div className="w-[28px] flex flex-col justify-center" onClick={() => setView(Views.LIST)}>
          <DoubleArrowLeft width={24} height={24} className="stroke-white hover:cursor-pointer" />
        </div>
        <div
          data-active={`${view === Views.CHARACTER ? true : false}`}
          className={`w-[32px] h-[32px] flex flex-col justify-center items-center data-[active=true]:bg-backgroundBlizzard ml-3 [&>svg]:data-[active=true]:fill-indigo-500`}
          onClick={() => setView(Views.CHARACTER)}
        >
          <CharacterIcon className="fill-white hover:cursor-pointer hover:fill-indigo-500" />
        </div>
        {selectedCharacter.namespace === 'retail' && (
          <div
            data-active={`${view === Views.TALENTS ? true : false}`}
            className={`w-[32px] h-[32px] flex flex-col justify-center items-center data-[active=true]:bg-backgroundBlizzard ml-3 [&>svg]:data-[active=true]:fill-yellow-500`}
            onClick={() => {
              if (!isTalentsLoading && selectedCharacter) {
                setView(Views.TALENTS);
              }
            }}
          >
            <Star className={`fill-white hover:cursor-pointer hover:fill-yellow-400`} />
          </div>
        )}
        <div
          data-active={`${view === Views.RAIDS ? true : false}`}
          className={`w-[32px] h-[32px] flex flex-col justify-center items-center data-[active=true]:bg-backgroundBlizzard ml-3 [&>svg]:data-[active=true]:fill-yellow-500`}
          onClick={() => {
            if (!isRaidsLoading && selectedCharacter) {
              setView(Views.RAIDS);
            }
          }}
        >
          <Skull className={`fill-white hover:cursor-pointer hover:fill-yellow-400`} />
        </div>
        {!countdown.invalid && isStreamer && (
          <div className="w-[24px] h-[24px] flex flex-col justify-center items-center ml-auto mr-1">
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
                      className="group hover:bg-transparent bg-transparent"
                    >
                      <motion.div animate={controls}>
                        <Update className={`fill-none stroke-secondary/25 group-hover:stroke-secondary`} />
                      </motion.div>
                    </Button>
                  </div>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      <Separator className="bg-white/15" />
    </div>
  );
};
