import { motion } from 'framer-motion';
import { ApiCharacter } from '@/types/Characters';
import { Views } from '@/types/User';
import { Characters } from '../components/Characters';

interface IListViewProps {
  characters: ApiCharacter[];
  setView: React.Dispatch<React.SetStateAction<Views>>;
  setCharacter: React.Dispatch<React.SetStateAction<ApiCharacter | null>>;
}

export const CharactersView = ({ characters, setView, setCharacter }: IListViewProps) => {
  return (
    <motion.div
      key={'list'}
      className="flex flex-col w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col w-full font-semplicita no-scrollbar">
        {characters.map((char) => (
          <div
            key={char.character_id}
            onClick={() => {
              setCharacter(char);
              setView(Views.CHARACTER);
            }}
          >
            <Characters character={char} />
          </div>
        ))}
      </div>
    </motion.div>
  );
};
