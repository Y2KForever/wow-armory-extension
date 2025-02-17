import { Alliance } from '@/assets/icons/Alliance';
import { Horde } from '@/assets/icons/Horde';
import { Capitalize, removeSpace } from '@/lib/utils';
import { ApiCharacter, Faction } from '@/types/Characters';

type CharacterProps = {
  character: ApiCharacter;
  onClick?: () => void;
};

export const Characters = ({ character }: CharacterProps) => {
  return (
    <div className="w-full h-full flex flex-col mt-2" key={character.name}>
      <div className="flex flex-row text-blizzard-yellow h-[100px] bg-blizzard-brown rounded-md border border-blizzard-gray ml-1 mr-1 mb-2 inset-shadow-sm items-center hover:cursor-pointer hover:border-blizzard-lightGray hover:bg-blizzard-lightBrown group">
        <div className="ml-2 flex flex-col justify-center h-full">
          <p className="drop-shadow-md text-lg">{Capitalize(character.name)}</p>
          <p className="text-white text-sm drop-shadow-md">
            Level {character.level}{' '}
            <span className={`drop-shadow-md text-class-${removeSpace(character.class)}`}>{character.class}</span>
          </p>
          <p className="text-blizzard-gray text-sm">{Capitalize(character.realm_name)}</p>
        </div>
        <div className="ml-auto mr-1">
          {character.faction.toLowerCase() === Faction.HORDE ? (
            <Horde className="w-[48px] h-[48px] fill-blizzard-emblem group-hover:fill-blizzard-lightGray" />
          ) : (
            <Alliance className="w-[48px] h-[48px] fill-blizzard-emblem group-hover:fill-blizzard-lightGray" />
          )}
        </div>
      </div>
    </div>
  );
};
