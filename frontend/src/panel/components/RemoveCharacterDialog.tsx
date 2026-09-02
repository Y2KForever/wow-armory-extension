import { Capitalize, removeSpace } from '@/lib/utils';
import { ApiCharacter } from '@/types/Characters';

type RemoveCharacterDialogProps = {
  character: ApiCharacter;
  onConfirm: () => void;
  onCancel: () => void;
};

export const RemoveCharacterDialog = ({ character, onConfirm, onCancel }: RemoveCharacterDialogProps) => {
  const classToken = removeSpace(character.class);

  return (
    <div
      onClick={onCancel}
      className="absolute inset-0 z-20 flex items-center justify-center px-[22px] backdrop-blur-[2px] bg-[rgba(4,5,7,.8)]"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="flex flex-col w-full border border-blizzard-bezel"
        style={{
          background: 'linear-gradient(180deg,#15161c,#0b0c10)',
          boxShadow: '0 18px 40px rgba(0,0,0,.75), inset 0 0 0 1px rgba(0,0,0,.6)',
        }}
      >
        <div
          className="flex-none h-[2px]"
          style={{ background: 'linear-gradient(90deg,transparent,#8e2130 25%,#c41e3b 50%,#8e2130 75%,transparent)' }}
        />

        <div className="flex items-center gap-[9px] px-[13px] pt-[12px] pb-[11px] border-b border-[rgba(138,109,20,.28)]">
          <div className="flex-none p-px" style={{ background: 'linear-gradient(145deg,#8a6d14,#3a2f10)' }}>
            <div
              className="w-[32px] h-[32px] bg-cover bg-center"
              style={{
                backgroundImage: `url(https://cdn.y2kforever.com/characters/${
                  character.dead ? 'dead.jpg' : character.avatar
                })`,
              }}
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0 gap-[2px]">
            <span
              className={`font-friz text-[16px] leading-[1.15] truncate text-class-${classToken}`}
              style={{ textShadow: '0 1px 2px #000' }}
            >
              {Capitalize(character.name)}
            </span>
            <span className="text-[9.5px] leading-[1.2] truncate text-[#8d8674]">
              Level {character.level} {character.spec} {character.class} &middot; {Capitalize(character.realm_name)}
            </span>
          </div>
          <div className="flex flex-col items-center flex-none py-[2px] px-[7px] border border-[rgba(138,109,20,.6)] bg-black/40">
            <span className="text-[12.5px] font-bold leading-[1.1] text-blizzard-yellow">
              {character.equip_item_level}
            </span>
            <span className="text-[8.5px] font-medium tracking-[.14em] text-blizzard-gold-mute">ILVL</span>
          </div>
        </div>

        <div className="flex flex-col gap-[9px] px-[13px] pt-[12px] pb-[13px]">
          <span className="font-friz text-[13px] leading-[1.35] text-[#e8e4da]">Remove from the roster?</span>
          <span className="text-[10px] leading-[1.45] text-[#8d8674]">
            Viewers will no longer see this character. You can import it again from the extension config.
          </span>
          <div className="flex flex-col gap-[6px] mt-[2px]">
            <button
              onClick={onConfirm}
              className="flex items-center justify-center h-[34px] border border-[#8e2130] hover:border-[#c41e3b] hover:cursor-pointer"
              style={{
                background: 'linear-gradient(180deg,rgba(150,26,42,.9),rgba(70,10,18,.92))',
                boxShadow: 'inset 0 1px 0 rgba(255,180,180,.16)',
              }}
            >
              <span className="text-[10px] font-semibold leading-none tracking-[.16em] text-[#ffd9d4]">
                REMOVE CHARACTER
              </span>
            </button>
            <button
              onClick={onCancel}
              className="flex items-center justify-center h-[32px] border border-[rgba(138,109,20,.55)] bg-black/40 hover:border-blizzard-yellow hover:cursor-pointer"
            >
              <span className="text-[10px] font-semibold leading-none tracking-[.16em] text-[#c3bdad]">CANCEL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
