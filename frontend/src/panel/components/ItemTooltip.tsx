import { Capitalize } from '@/lib/utils';
import { TooltipGeometry } from '@/lib/gearTooltip';
import { ApiCharacter } from '@/types/Characters';

interface IItemTooltipProps {
  character: ApiCharacter;
  slot: string;
  geometry: TooltipGeometry;
}


export const ItemTooltip = ({ character, slot, geometry }: IItemTooltipProps) => {
  const item = character[slot.replace('-', '_')];
  if (!item?.image) return null;

  const quality = item.quality?.toLowerCase();

  return (
    <div
      className="absolute z-10 flex flex-col gap-px overflow-hidden px-[9px] pt-[7px] pb-[8px] border border-blizzard-gold-dim"
      style={{
        left: geometry.left,
        right: geometry.right,
        top: geometry.top,
        bottom: geometry.bottom,
        maxHeight: geometry.maxHeight,
        background: 'linear-gradient(180deg,rgba(14,13,9,.98),rgba(5,6,8,.98))',
        boxShadow: '0 4px 20px rgba(0,0,0,.85), inset 0 0 0 1px rgba(0,0,0,.8)',
      }}
    >
      <div
        className="absolute w-[8px] h-[8px] rotate-45 bg-[#0e0d09]"
        style={{
          left: geometry.arrow.left,
          right: geometry.arrow.right,
          top: geometry.arrow.top,
          bottom: geometry.arrow.bottom,
          borderLeft: geometry.arrow.borderLeft,
          borderBottom: geometry.arrow.borderBottom,
          borderTop: geometry.arrow.borderTop,
          borderRight: geometry.arrow.borderRight,
        }}
      />

      <span className={`text-[12.5px] font-semibold leading-[1.25] text-rarity-${quality}`}>{item.name}</span>
      {item.level && <span className="text-[11px] font-semibold text-blizzard-yellow">Item level {item.level}</span>}
      {item.transmog && (
        <span className="text-[10.5px] leading-[1.35] text-blizzard-transmog">Transmogrified to: {item.transmog}</span>
      )}

      <div
        className="h-px mt-[4px] mb-[3px]"
        style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.7),transparent)' }}
      />

      {item.stats?.map((stat, idx) => (
        <span key={`stat-${idx}`} className="text-[11px] leading-[1.3]" style={{ color: stat.color }}>
          {character.namespace === 'retail' ? `+${stat.value} ${stat.name}` : stat.display_string}
        </span>
      ))}

      {!!item.sockets?.length && (
        <div className="flex flex-col gap-[2px] mt-[4px]">
          {item.sockets.map((socket, idx) => (
            <div key={`socket-${idx}`} className="flex items-center gap-[5px]">
              <div
                className={`flex-none w-[15px] h-[15px] bg-cover bg-center ${
                  socket.item?.value ? 'border border-blizzard-slot' : 'border border-[rgba(138,109,20,.55)]'
                }`}
                style={{
                  backgroundImage: socket.item?.value
                    ? `url(https://cdn.y2kforever.com/sockets/${socket.image})`
                    : `url(https://cdn.y2kforever.com/characters/${socket.type.toLowerCase()}-socket.png)`,
                }}
              />
              <span className={`text-[11px] ${socket.item?.value ? 'text-[#e8e4da]' : 'text-[#7f7866]'}`}>
                {socket.item?.value ?? `${Capitalize(socket.type.toLowerCase())} Socket`}
              </span>
            </div>
          ))}
        </div>
      )}

      {item.enchantments?.map((enchantment) => (
        <span key={enchantment} className="text-[11px] leading-[1.3] text-blizzard-green mt-[3px]">
          {enchantment}
        </span>
      ))}

      {item.setBonus && (
        <div className="flex flex-col gap-[2px] mt-[5px] pt-[4px] border-t border-[rgba(138,109,20,.35)]">
          <span className="text-[11px] font-semibold text-blizzard-yellow">
            {item.setBonus.name ?? item.setBonus.amount}
          </span>
          {item.setBonus.effects?.map((effect) => (
            <span
              key={effect.display_string}
              className={`text-[10px] leading-[1.35] ${
                effect.is_active ? 'text-blizzard-green' : 'text-[#6a6455]'
              }`}
            >
              {effect.display_string}
            </span>
          ))}
        </div>
      )}

      {item.spells?.map((spell) => (
        <span key={spell.name} className="text-[10px] leading-[1.35] text-blizzard-green mt-[4px]">
          {spell.description}
        </span>
      ))}
    </div>
  );
};
