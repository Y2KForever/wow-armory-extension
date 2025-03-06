import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TalentType, UniqueTalent } from '@/types/Characters';
import { IViewProps } from '../pages/Panel';

interface ITalentGroupProps {
  talents: UniqueTalent[];
  view: IViewProps;
  type: TalentType;
}

export const TalentGroup = ({ talents, view, type }: ITalentGroupProps) => {
  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="grid max-w-[290px] p-3 rounded-md bg-black justify-center">
        <TooltipProvider delayDuration={0}>
          {talents.map((talentGroup, idx) => {
            const speccedSpells = talentGroup.spells.filter((spell) =>
              view.character?.talents[`${type}_talents`].includes(spell.talent_id),
            );

            return (
              <Tooltip key={`${talentGroup}-${idx}`}>
                <div className={`m-1 row-start-${talentGroup.row} col-start-${talentGroup.col}`}>
                  <TooltipContent className="max-w-[200px] p-2">
                    <div className="flex items-center flex-col">
                      {speccedSpells.length > 0 || talentGroup.spells.length !== 2
                        ? (speccedSpells.length > 0
                            ? speccedSpells.filter((spell, index, arr) => {
                                const name = spell.spell?.name;
                                const firstIndex = arr.findIndex((s) => s.spell?.name === name);
                                return index === firstIndex;
                              })
                            : talentGroup.spells.filter((spell, index, arr) => {
                                const name = spell.spell?.name;
                                const firstIndex = arr.findIndex((s) => s.spell?.name === name);
                                return index === firstIndex;
                              })
                          ).map((spell) => (
                            <div key={spell.talent_id} className="font-bold">
                              {spell.spell?.name}
                            </div>
                          ))
                        : talentGroup.spells
                            .filter((spell, index, arr) => {
                              const name = spell.spell?.name;
                              const firstIndex = arr.findIndex((s) => s.spell?.name === name);
                              return index === firstIndex;
                            })
                            .map((spell) => (
                              <div data-talent={spell.talent_id} key={spell.talent_id} className="font-bold">
                                {spell.spell?.name}
                              </div>
                            ))}
                    </div>
                  </TooltipContent>
                  <TooltipTrigger asChild>
                    <div className="relative w-[32px] h-[32px]">
                      {talentGroup.spells.map((spell, idx) => {
                        const isSpecced = speccedSpells.some((s) => s.talent_id === spell.talent_id);
                        const shouldSplit = speccedSpells.length === 0 && talentGroup.spells.length >= 2;

                        return (
                          <>
                            <div
                              key={`${spell.spell?.name}-${idx}`}
                              className={`absolute inset-0 w-full h-full ${!isSpecced ? 'grayscale' : ''}`}
                              style={{
                                backgroundImage: `url(https://cdn.y2kforever.com/talents/${spell.spell?.id}.jpg)`,
                                backgroundSize: 'cover',
                                borderRadius: '5px',
                                clipPath: shouldSplit
                                  ? `inset(0 ${idx === 0 ? 50 : 0}% 0 ${idx === 1 ? 50 : 0}%)`
                                  : 'inset(0)',
                                display: speccedSpells.length > 0 && !isSpecced ? 'none' : 'inital',
                              }}
                            />
                            <div
                              style={{ fontSize: 'xx-small', bottom: 0, right: 0 }}
                              className="font-semplicita text-center absolute bg-primary/90 text-white w-full"
                            >{`${speccedSpells.length} / ${spell.rank}`}</div>
                          </>
                        );
                      })}
                    </div>
                  </TooltipTrigger>
                </div>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
};
