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
              <div className="mt-2 mb-2">
                {currentItem.stats?.map((stat, idx) => (
                  <p className="text-xs" key={`stat-${idx}`} style={{ color: stat.color }}>
                    +{stat.value} {stat.name}
                  </p>
                ))}
              </div>
              <div className="mt-2 mb-2">
                {currentItem.sockets?.map((socket, idx) => (
                  <div className="text-xs" key={`${socket}-${idx}`}>
                    {socket.item?.value ? (
                      <div className="flex flex-row items-start">
                        <div className="flex flex-row relative">
                          <div
                            className="w-[15px] h-[15px] absolute"
                            style={{
                              backgroundImage: `url(https://cdn.y2kforever.com/sockets/${socket.image})`,
                              top: 0,
                              right: 0,
                              left: 0,
                              bottom: 0,
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: 'contain',
                            }}
                          />
                          <div
                            className="absolute"
                            style={{
                              width: 15,
                              height: 15,
                              backgroundImage: `url(https://cdn.y2kforever.com/characters/${socket.type.toLowerCase()}-socket.png)`,
                            }}
                          />
                        </div>
                        <p className="text-white ml-5" style={{ fontSize: 'smaller' }}>
                          {socket.item.value}
                        </p>
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
              <div className="mt-2 mb-2">
                {currentItem.enchantments?.map((enchantment) => {
                  return (
                    <p key={`${currentItem.name}-${enchantment}`} className="text-xs text-blizzard-green">
                      {enchantment}
                    </p>
                  );
                })}
              </div>
              {currentItem.setBonus && (
                <div className="" key={currentItem.setBonus.name}>
                  <p className="text-blizzard-yellow">{currentItem.setBonus.amount}</p>
                  {currentItem.setBonus.effects.map((effect, idx) => (
                    <p
                      key={`${effect.display_string}`}
                      className={`mt-1 mb-1 ${
                        effect.is_active ? `text-blizzard-green` : 'text-blizzard-unselectedGray'
                      }`}
                    >
                      {effect.display_string}
                    </p>
                  ))}
                </div>
              )}
              {currentItem.spells?.map((spell, idx) => (
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
