import { ApiCharacter, slotAbbr } from '@/types/Characters';
import { useMemo } from 'react';

interface ICharacterItemProps {
  character: ApiCharacter;
  type: string;
  className?: string;
  onHover: (slot: string | null) => void;
}

export const CharacterItem = ({ character, type, className, onHover }: ICharacterItemProps) => {
  const fixedType = useMemo(() => type.replace('-', '_'), [type]);
  const currentItem = useMemo(() => character[fixedType], [character, fixedType]);

  return (
    <div
      onMouseEnter={() => onHover(currentItem?.image ? type : null)}
      onMouseLeave={() => onHover(null)}
      className={`relative flex flex-none items-center justify-center w-[44px] h-[44px] border border-blizzard-slot hover:border-blizzard-yellow ${
        currentItem?.image ? 'hover:cursor-pointer' : ''
      } ${className ?? ''}`}
      style={{
        background: 'radial-gradient(90% 90% at 50% 20%,#191b22,#080a0d)',
        boxShadow: 'inset 0 1px 0 rgba(221,172,0,.14), inset 0 0 10px rgba(0,0,0,.9)',
      }}
    >
      <span className="text-[7px] font-semibold tracking-[.08em] text-[#4a4433]">{slotAbbr[type] ?? ''}</span>
      {currentItem?.image && (
        <div
          className={`absolute inset-[2px] bg-cover bg-center border border-rarity-${currentItem.quality?.toLowerCase()}`}
          style={{ backgroundImage: `url(https://cdn.y2kforever.com/items/${currentItem.image})` }}
        />
      )}
    </div>
  );
};
