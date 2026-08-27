import { Capitalize, removeSpace } from '@/lib/utils';
import { ApiCharacter } from '@/types/Characters';

type CharacterRowProps = {
  character: ApiCharacter;
  onSelect: () => void;
};

export const CharacterRow = ({ character, onSelect }: CharacterRowProps) => {
  const classToken = removeSpace(character.class);

  return (
    <div
      onClick={onSelect}
      className="group flex items-center flex-none gap-[9px] h-[48px] pr-[10px] border-b border-[rgba(138,109,20,.14)] hover:cursor-pointer hover:bg-[linear-gradient(100deg,rgba(221,172,0,.12),transparent_65%)]"
    >
      <div
        className={`flex-none w-[3px] h-[48px] text-class-${classToken}`}
        style={{ background: 'linear-gradient(180deg,transparent,currentColor,transparent)' }}
      />
      <div className="flex-none p-px" style={{ background: 'linear-gradient(145deg,#8a6d14,#3a2f10)' }}>
        <div
          className="w-[28px] h-[28px] bg-cover bg-center"
          style={{
            backgroundImage: `url(https://cdn.y2kforever.com/characters/${
              character.dead ? 'dead.jpg' : character.avatar
            })`,
            filter: 'saturate(.9)',
          }}
        />
      </div>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-[5px] min-w-0">
          <span
            className={`font-friz text-[17px] leading-tight truncate text-class-${classToken}`}
            style={{ textShadow: '0 1px 2px #000' }}
          >
            {Capitalize(character.name)}
          </span>
          {character.self_found && (
            <img
              title="Character is self-found"
              className="flex-none w-[12px] h-[12px] border border-blizzard-gold-dim"
              src="https://cdn.y2kforever.com/characters/selffound.jpg"
            />
          )}
        </div>
        <span className="text-[11px] text-[#8d8674] truncate">
          Level {character.level} {character.spec} {character.class}
        </span>
      </div>

      <div className="flex flex-col items-center flex-none py-[2px] px-[7px] ml-auto border border-[rgba(138,109,20,.6)] bg-black/40">
        <span className="text-[15px] font-bold leading-[1.1] text-blizzard-yellow">{character.equip_item_level}</span>
        <span className="text-[8.5px] font-medium tracking-[.14em] text-blizzard-gold-mute">ILVL</span>
      </div>
    </div>
  );
};

type RealmGroupProps = {
  realm: string;
  characters: ApiCharacter[];
  onSelect: (character: ApiCharacter) => void;
};

export const RealmGroup = ({ realm, characters, onSelect }: RealmGroupProps) => {
  return (
    <div className="flex flex-col flex-none">
      {realm && (
        <div
          className="flex items-center flex-none gap-[7px] h-[18px] px-[10px]"
          style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.22),rgba(0,0,0,0) 70%)' }}
        >
          <span className="text-[10.5px] font-semibold tracking-[.14em] whitespace-nowrap text-blizzard-gold-mid">
            {Capitalize(realm)}
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: 'linear-gradient(90deg,rgba(138,109,20,.5),transparent)' }}
          />
          <span className="text-[9.5px] font-medium whitespace-nowrap text-[#6f6141]">{characters.length}</span>
        </div>
      )}
      {characters.map((character) => (
        <CharacterRow key={character.character_id} character={character} onSelect={() => onSelect(character)} />
      ))}
    </div>
  );
};
