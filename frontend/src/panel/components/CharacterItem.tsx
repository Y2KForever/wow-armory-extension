import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Capitalize } from '@/lib/utils';
import { ApiCharacter, typeMap } from '@/types/Characters';
import { useMemo } from 'react';

interface ICharacterItemProps {
  character: ApiCharacter;
  type: string;
  className?: string;
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
}

export const CharacterItem = ({ character, type, className, tooltipSide }: ICharacterItemProps) => {
  const fixedType = useMemo(() => type.replace('-', '_'), [type]);
  const currentItem = useMemo(() => character[fixedType], [character, fixedType]);
  return (
    <div
      key={`${character.name}-${character.realm}`}
      className={`w-[47px] h-[47px] ${className ? className : ''} border border-[rgb(51,51,51)]`}
      style={{
        backgroundImage: `url(https://cdn.y2kforever.com/items/${typeMap[type] || type}-slot.png)`,
      }}
    >
      {currentItem?.image && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <img
                className={`border border-rarity-${currentItem.quality?.toLowerCase()}`}
                src={`https://cdn.y2kforever.com/items/${currentItem.image}`}
              />
            </TooltipTrigger>
            <TooltipContent side={tooltipSide} className="text-xs max-w-[230px] pt-3 pb-3 bg-primary/95">
              <p className={`text-rarity-${currentItem.quality?.toLowerCase()}`}>{currentItem.name}</p>
              <p className="text-blizzard-yellow">Item level {currentItem.level}</p>
              {currentItem.transmog && (
                <div className="">
                  <p className="text-blizzard-transmog">Transmogified to:</p>
                  <p className="text-blizzard-transmog">{currentItem.transmog}</p>
                </div>
              )}
              <div className="">
                {currentItem.stats?.map((stat, idx) => (
                  <p className="" key={`stat-${idx}`} style={{ color: stat.color }}>
                    +{stat.value} {stat.name}
                  </p>
                ))}
              </div>
              <div className="mt-2 mb-2">
                {currentItem.sockets?.map((socket, idx) => (
                  <div className="" key={`${socket}-${idx}`}>
                    {socket.item?.value ? (
                      <div>
                        <p className="text-white">{socket.item.value}</p>
                      </div>
                    ) : (
                      <div className="flex">
                        <img
                          className="mr-1"
                          src={`https://cdn.y2kforever.com/characters/${socket.type.toLowerCase()}-socket.png`}
                        />
                        <p className="text-blizzard-unselectedGray">{Capitalize(socket.type.toLowerCase())} Socket</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {currentItem.setBonus && (
                <div className="" key={currentItem.setBonus.name}>
                  <p className="text-blizzard-yellow">{currentItem.setBonus.amount}</p>
                  {currentItem.setBonus.effects.map((effect) => (
                    <p
                      className={`mt-1 mb-1 ${
                        effect.is_active ? `text-blizzard-green` : 'text-blizzard-unselectedGray'
                      }`}
                    >
                      {effect.display_string}
                    </p>
                  ))}
                </div>
              )}
              {currentItem.spells?.map((spell) => (
                <p key={spell.name} className="text-blizzard-green text-xs mt-1">
                  {spell.description}
                </p>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};
