import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { CharacterItem } from './CharacterItem';
import { ItemTooltip } from './ItemTooltip';
import { ApiCharacter, slotsOrderBottom, slotsOrderLeft, slotsOrderRight } from '@/types/Characters';
import { Capitalize, removeSpace } from '@/lib/utils';
import { ItemLevel } from '@/assets/icons/ItemLevel';
import { SlotColumn, tooltipGeometry } from '@/lib/gearTooltip';

interface ICharacterProps {
  character: ApiCharacter;
}

export const Character = ({ character }: ICharacterProps) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const classToken = removeSpace(character.class);
  const position = useMemo((): { column: SlotColumn; index: number } | null => {
    if (!hovered) return null;
    const columns: [SlotColumn, string[]][] = [
      ['L', slotsOrderLeft],
      ['R', slotsOrderRight],
      ['B', slotsOrderBottom],
    ];
    for (const [column, slots] of columns) {
      const index = slots.indexOf(hovered);
      if (index >= 0) return { column, index };
    }
    return null;
  }, [hovered]);

  return (
    <motion.div
      key={'item'}
      className="flex flex-col flex-1 min-h-0 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="flex items-center flex-none gap-[9px] h-[48px] px-[10px] border-b border-[rgba(138,109,20,.45)]"
        style={{ background: 'linear-gradient(180deg,#14120c,#0a0b0d)' }}
      >
        <div className="flex-none p-px" style={{ background: 'linear-gradient(145deg,#ddac00,#4a3a10)' }}>
          <div
            className="w-[32px] h-[32px] bg-cover bg-center"
            style={{
              backgroundImage: `url(https://cdn.y2kforever.com/characters/${
                character.dead ? 'dead.jpg' : character.avatar
              })`,
            }}
          />
        </div>
        <div className="flex flex-col min-w-0 gap-px">
          <span
            className={`font-friz text-[16.5px] leading-[1.1] truncate text-class-${classToken}`}
            style={{ textShadow: '0 1px 2px #000' }}
          >
            {Capitalize(character.name)}
          </span>
          <span className="text-[10.5px] text-[#9c9484] truncate">
            {character.level} {character.race} {character.class}
            {character.spec && <span className="text-blizzard-yellow"> &middot; {character.spec}</span>}
          </span>
        </div>
        <div
          className="flex items-center flex-none gap-[5px] ml-auto py-[4px] px-[8px] border border-[rgba(221,172,0,.5)]"
          style={{ background: 'linear-gradient(180deg,rgba(221,172,0,.14),rgba(0,0,0,.5))' }}
        >
          <ItemLevel className="w-[11px] h-[11px] fill-blizzard-yellow" />
          <span className="text-[18px] font-bold leading-none text-blizzard-yellow">{character.equip_item_level}</span>
        </div>
      </div>

      <div
        className="relative flex-1 min-h-0 bg-cover bg-center"
        style={{ backgroundImage: `url(https://cdn.y2kforever.com/class/${classToken}.webp)` }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(68% 52% at 50% 42%,rgba(0,0,0,0) 0%,rgba(3,4,6,.88) 100%)' }}
        />

        <div className="absolute inset-0 flex gap-[8px] p-[8px]">
          <div className="flex flex-col gap-[4px]">
            {slotsOrderLeft.map((slot) => (
              <CharacterItem key={slot} character={character} type={slot} onHover={setHovered} />
            ))}
          </div>

          <div className="flex flex-col items-center justify-end flex-1 min-w-0">
            {character['main-raw'] && (
              <div
                className="absolute top-[34px] left-[64px] right-[64px] bottom-[66px] bg-center"
                style={{
                  backgroundSize: '400%',
                  backgroundImage: `url(https://cdn.y2kforever.com/characters/${character['main-raw']})`,
                }}
              />
            )}
            <div className="relative flex gap-[14px]">
              {slotsOrderBottom.map((slot) => (
                <CharacterItem key={slot} character={character} type={slot} onHover={setHovered} />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[4px]">
            {slotsOrderRight.map((slot) => (
              <CharacterItem key={slot} character={character} type={slot} onHover={setHovered} />
            ))}
          </div>
        </div>

        {hovered && position && (
          <ItemTooltip
            character={character}
            slot={hovered}
            geometry={tooltipGeometry(position.column, position.index)}
          />
        )}
      </div>
    </motion.div>
  );
};
