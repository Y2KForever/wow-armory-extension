import { motion } from 'framer-motion';
import { IViewProps } from '../pages/Panel';
import { CharacterHeader } from './CharacterHeader';
import { CharacterItem } from './CharacterItem';
import { ApiCharacter, slotsOrderBottom, slotsOrderLeft, slotsOrderRight } from '@/types/Characters';
import { removeSpace } from '@/lib/utils';
import { ItemLevel } from '@/assets/icons/ItemLevel';

interface ICharacterProps {
  setView: React.Dispatch<React.SetStateAction<IViewProps>>;
  character: ApiCharacter;
}

export const Character = ({ setView, character }: ICharacterProps) => {
  return (
    <motion.div
      key={'item'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col flex-1 justify-center w-full"
    >
      <CharacterHeader setView={setView} />
      <div
        style={{
          backgroundImage: `url(https://cdn.y2kforever.com/class/${removeSpace(character.class.toLowerCase())}.webp)`,
        }}
        className={`h-full w-full bg-center bg-cover`}
      >
        <div className="flex flex-row w-full h-full flex-1 p-3">
          <div className="flex flex-col justify-between">
            {Object.values(slotsOrderLeft).map((slot, idx) => (
              <CharacterItem key={`${slot}-${idx}`} character={character} type={slot} tooltipSide="right" />
            ))}
          </div>
          <div
            style={{
              backgroundSize: '400%',
              backgroundImage: `url(https://cdn.y2kforever.com/characters/${character.character_id}-main-raw.png)`,
            }}
            className={`flex flex-row flex-1 w-full h-full bg-center`}
          >
            <div className="w-full flex flex-col items-center flex-1 h-full">
              <div className="flex flex-col items-center text-blizzard-yellow font-sans">
                <p className={`text-base text-class-${removeSpace(character.class)}`}>{character.name}</p>

                <p className="text-xs text-white">
                  {character.level} {character.race} {character.class}
                </p>
                <div className="flex items-center">
                  <ItemLevel width={16} height={16} className="fill-blizzard-yellow" />
                  <p className="ml-1 text-sm">{`${character.equip_item_level} ILVL`}</p>
                </div>
              </div>
              <div className="flex mt-auto flex-row items-end align-between ml-auto mr-auto">
                {Object.values(slotsOrderBottom).map((slot, idx) => (
                  <CharacterItem
                    tooltipSide="top"
                    key={`${slot}-${idx}`}
                    className={idx === 0 ? 'mr-3' : 'ml-3'}
                    character={character}
                    type={slot}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between">
            {Object.values(slotsOrderRight).map((slot, idx) => (
              <CharacterItem tooltipSide="left" key={`${slot}-${idx}`} character={character} type={slot} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
