import { AnimatePresence, motion } from 'framer-motion';
import { useAppSelect } from '@/store/store';
import { selectSelectedTalents } from '@/store/selectors/selectTalents';
import { readableSpec, removeSpace } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ApiCharacter, Talent, TalentType, Tooltip as TooltipWoW, UniqueTalent } from '@/types/Characters';
import { Separator } from '@/components/ui/separator';
import { TalentGroup } from './TalentGroup';
import { CopyIcon } from '@/assets/icons/Copy';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SimpleBar from 'simplebar-react';

interface ITalentsProps {
  character: ApiCharacter;
}

function getAllTalents(talentEntries: Talent[]): UniqueTalent[] {
  const talentMap = new Map<string, UniqueTalent>();

  for (const entry of talentEntries) {
    for (const rank of entry.ranks) {
      const processTooltip = (tooltip: TooltipWoW) => {
        const key = entry.id.toString();
        const spellData = {
          spell: tooltip.spell_tooltip.spell,
          description: tooltip.spell_tooltip.description,
          castTime: tooltip.spell_tooltip.cast_time,
          cooldown: tooltip.spell_tooltip.cooldown,
          powercost: tooltip.spell_tooltip.power_cost,
          range: tooltip.spell_tooltip.range,
          talent_id: tooltip.spell_tooltip.talent.id,
          rank: rank.rank,
        };

        if (talentMap.has(key)) {
          talentMap.get(key)!.spells.push(spellData);
        } else {
          talentMap.set(key, {
            col: entry.col,
            row: entry.row,
            spells: [spellData],
          });
        }
      };

      if (rank.tooltip?.choice_of_tooltips && entry.type === 'CHOICE') {
        rank.tooltip.choice_of_tooltips.forEach(processTooltip);
      } else if ((entry.type === 'PASSIVE' || entry.type === 'ACTIVE') && rank.tooltip) {
        processTooltip(rank.tooltip);
      }
    }
  }

  return Array.from(talentMap.values()).sort((a, b) => a.row - b.row || a.col - b.col);
}

const copyLoadoutCode = async (character: ApiCharacter | null) => {
  if (character) {
    await navigator.clipboard.writeText(character.talents.loadout_code);
  }
};

export const Talents = ({ character }: ITalentsProps) => {
  const [isCopiedVisible, setIsCopiedVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const selectTalents = useAppSelect(selectSelectedTalents);
  const heroTalents = useMemo(
    () => selectTalents?.hero_talents.find((hero) => hero.id === character?.talents.hero_id),
    [selectTalents, character],
  );

  if (!heroTalents) {
    return <></>;
  }

  const allSpecTalents = useMemo(() => getAllTalents(selectTalents?.spec_talents ?? []), [selectTalents?.spec_talents]);

  const allClassTalents = useMemo(
    () => getAllTalents(selectTalents?.class_talents ?? []),
    [selectTalents?.class_talents],
  );

  const allHeroTalents = useMemo(() => getAllTalents(heroTalents.talents ?? []), [heroTalents.talents]);

  return (
    <div key={'item'} className="flex flex-col flex-1 justify-center w-full h-full no-scrollbar">
      <motion.div
        className="no-scrollbar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SimpleBar style={{ width: '100%', maxHeight: 467 }}>
          <div className="flex flex-col items-center w-full">
            <div className="ml-auto mr-3 flex items-center">
              <AnimatePresence>
                {isCopiedVisible && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                    style={{ fontSize: 'smaller' }}
                    className="text-blizzard-green"
                  >
                    Copied!
                  </motion.p>
                )}
              </AnimatePresence>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipContent side="left">Copy loadout code</TooltipContent>
                  <TooltipTrigger asChild>
                    <Button
                      className="group hover:bg-transparent bg-transparent"
                      onClick={() => {
                        copyLoadoutCode(character);
                        setIsCopiedVisible(true);
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        timeoutRef.current = setTimeout(() => {
                          setIsCopiedVisible(false);
                        }, 1500);
                      }}
                      variant="default"
                      size="icon"
                    >
                      <CopyIcon className="fill-secondary/25 group-hover:fill-secondary" />
                    </Button>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Separator className="bg-white/15" />
            <p className="text-blizzard-yellow m-2">{heroTalents.name}</p>
            <div className="relative w-[38px] h-[38px] mb-2">
              <div
                className="w-[32px] h-[32px] absolute bg-center bg-no-repeat bg-contain top-[3px] left-[3px]"
                style={{
                  backgroundImage: `url(https://cdn.y2kforever.com/hero_talents/${removeSpace(
                    heroTalents.name.toLowerCase(),
                  )}.webp)`,
                }}
              />
              <div
                className="w-[38px] h-[38px] absolute"
                style={{ backgroundImage: `url(https://cdn.y2kforever.com/hero_talents/border.png)` }}
              />
            </div>
            <TalentGroup talents={allHeroTalents} type={TalentType.HERO} character={character} />
          </div>
          <Separator className="bg-white/15 mt-4" />
          <div className="mt-3 items-center flex flex-col">
            <p className="text-blizzard-yellow mb-2">
              {selectTalents?.spec ? readableSpec(selectTalents.spec) : undefined}
            </p>
            <TalentGroup talents={allSpecTalents} type={TalentType.SPEC} character={character} />
          </div>
          <Separator className="bg-white/15 mt-4" />
          <div className="items-center flex flex-col mb-3">
            <p className={`text-class-${removeSpace(selectTalents?.class ?? '')} mt-2 mb-2`}>{selectTalents?.class}</p>
            <TalentGroup talents={allClassTalents} type={TalentType.CLASS} character={character} />
          </div>
        </SimpleBar>
      </motion.div>
    </div>
  );
};
