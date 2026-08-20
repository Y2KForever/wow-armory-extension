import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { selectSelectedInstances } from '@/store/selectors/selectInstances';
import { useAppSelect } from '@/store/store';
import { ApiCharacter, ApiInstance, RaidsByExpansion } from '@/types/Characters';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import SimpleBar from 'simplebar-react';

interface IInstanceProps {
  character: ApiCharacter;
}

type ModeProgress = {
  kill_count: number;
  status: string;
  encounters: {
    [id: number]: number;
  };
};

const getApiRaid = (selectInstances: RaidsByExpansion[] | undefined, instanceId: number): ApiInstance | undefined => {
  const allRaids = selectInstances?.flatMap((expansion) => expansion.raids) || [];
  return allRaids.find((raid) => raid.id === instanceId);
};

const getCharacterInstance = (character: ApiCharacter, raidId: number, instanceId: number) => {
  const charRaid = character.raids.find((raid) => raid.id === raidId);
  return charRaid?.instances.find((instance) => instance.id === instanceId);
};

const getModeData = (instance: NonNullable<ReturnType<typeof getCharacterInstance>>, modeKey: string) => {
  return instance.modes.find((mode) => mode[modeKey])?.[modeKey];
};

export const Instances = ({ character }: IInstanceProps) => {
  const selectInstances = useAppSelect(selectSelectedInstances);

  const extractBosses = useCallback(
    (raidId: number, instanceId: number, modeKey: string) => {
      const apiRaid = getApiRaid(selectInstances ?? [], instanceId);
      if (!apiRaid) return undefined;
      const apiEncounters = apiRaid.encounters;

      const charInstance = getCharacterInstance(character, raidId, instanceId);
      const modeData = charInstance ? getModeData(charInstance, modeKey) : undefined;
      const encounterProgress: { [encounterId: number]: number } = modeData?.encounters || {};

      return apiEncounters.map((encounter) => ({
        name: encounter.name,
        finished: encounterProgress[encounter.id] || 0,
      }));
    },
    [selectInstances, character],
  );

  const extractModeProgress = useCallback(
    (raidId: number, instanceId: number, modeKey: string): ModeProgress | undefined => {
      const charInstance = getCharacterInstance(character, raidId, instanceId);
      if (!charInstance) return undefined;
      const modeData = getModeData(charInstance, modeKey);
      if (!modeData) return undefined;

      const { status, progress, encounters } = modeData;
      return {
        status,
        kill_count: progress.completed,
        encounters,
      };
    },
    [character],
  );

  if (!selectInstances) {
    return <></>;
  }

  return (
    <div key={'item'} className="flex flex-col flex-1 w-full h-full no-scrollbar font-semplicita">
      <motion.div
        className="no-scrollbar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SimpleBar style={{ width: '100%', maxHeight: 467 }}>
          {selectInstances?.map((expansion, idx) => (
            <div key={expansion.expansion} className="flex flex-col items-center w-full">
              {idx !== 0 && <Separator className="bg-white/15 mt-4" />}
              <p className="text-white font-semibold mb-4 mt-4" key={expansion.expansion}>
                {expansion.expansion}
              </p>
              {expansion.raids.map((raid) => (
                <div key={raid.name} className="w-[290px] max-h-[400px] mb-4 border border-instance-border">
                  <div
                    className={`bg-center bg-cover items-center min-h-[100px] border-b border-instance-border`}
                    style={{
                      backgroundImage: `url(https://cdn.y2kforever.com/instance/${raid.image})`,
                    }}
                  >
                    <p className="text-blizzard-yellow text-xs pt-1 pl-1 pb-1 bg-black/50 ">{raid.name}</p>
                  </div>
                  <div className="flex flex-col w-full">
                    {raid.modes.map((mode, indx) => {
                      const progress = extractModeProgress(raid.expansion.id, raid.id, mode.mode.type);
                      const bosses = extractBosses(raid.expansion.id, raid.id, mode.mode.type);

                      const width = progress?.kill_count ? (progress.kill_count / raid.encounters.length) * 100 : 0;
                      return (
                        <TooltipProvider key={mode.mode.type} delayDuration={0}>
                          <Tooltip>
                            <TooltipContent sideOffset={15} className="border border-instance-border">
                              <div className="p-2">
                                {bosses?.map((boss) => (
                                  <div className="" key={boss.name}>
                                    <p
                                      className={`${boss.finished > 0 ? 'text-blizzard-green' : 'text-blizzard-gray'}`}
                                    >
                                      {boss.finished} x {boss.name}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                            <TooltipTrigger>
                              <div
                                className={`mt-2 group hover:cursor-pointer flex pl-2 pr-2 ${indx === raid.modes.length - 1 ? ` mb-2` : ''}`}
                              >
                                <p
                                  className="w-[45%] text-left text-sm text-blizzard-yellow group-hover:text-white font-semibold mr-4"
                                  style={{ fontSize: 'small' }}
                                >
                                  {mode.mode.name}
                                </p>

                                <div className="w-[55%]">
                                  <div
                                    className="flex align-center bg-instance-empty-background relative min-h-[28px]"
                                    style={{ boxShadow: 'inset 0 0 16px #000000' }}
                                  >
                                    <div
                                      style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
                                      className="absolute bg-transparent top-0 left-0 bottom-0 right-0 w-full h-[28px] z-10"
                                    ></div>
                                    <div
                                      style={{ width: `${width}%` }}
                                      className={`z-0 border-none absolute h-[28px] top-0 left-0 right-0 bottom-0 ${progress?.status === 'COMPLETE' ? 'bg-full-background' : progress?.status === 'IN_PROGRESS' ? 'bg-partial-background' : ''}`}
                                    ></div>
                                    <div className="flex flex-col justify-center z-10">
                                      <p className="text-white text-xs pl-4 z-auto">{`${progress?.kill_count || 0}/${raid.encounters.length}`}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TooltipTrigger>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </SimpleBar>
      </motion.div>
    </div>
  );
};
