import { motion } from 'framer-motion';
import { useContext, useMemo } from 'react';
import { ApiCharacter } from '@/types/Characters';
import { Views } from '@/types/User';
import { RealmGroup } from '../components/Characters';
import { WowIcon } from '@/assets/icons/WowIcon';
import { TwitchAuthContext } from '../App';

interface IListViewProps {
  characters: ApiCharacter[];
  setView: React.Dispatch<React.SetStateAction<Views>>;
  setCharacter: (character: ApiCharacter | null) => void;
  onAsk: (character: ApiCharacter) => void;
}

export const RosterHeader = ({ characters }: { characters: ApiCharacter[] }) => {
  const realmCount = useMemo(() => new Set(characters.map((character) => character.realm_name)).size, [characters]);

  return (
    <div className="flex items-center w-full h-full gap-[8px] px-[10px]">
      <WowIcon className="flex-none w-[16px] h-[16px] fill-blizzard-gold-dim" />
      <span className="text-[11.5px] font-semibold tracking-[.16em] text-blizzard-yellow">ROSTER</span>
      <span className="ml-auto text-[11px] font-medium text-blizzard-gold-mute">
        {characters.length} character{characters.length === 1 ? '' : 's'} &middot; {realmCount} realm
        {realmCount === 1 ? '' : 's'}
      </span>
    </div>
  );
};

export const CharactersView = ({ characters, setView, setCharacter, onAsk }: IListViewProps) => {
  const twitchAuth = useContext(TwitchAuthContext);
  const isStreamer = `U${twitchAuth.channelId}` === twitchAuth.userId;

  const groups = useMemo(() => {
    const byRealm = new Map<string, ApiCharacter[]>();
    for (const character of characters) {
      const realm = character.realm_name ?? '';
      if (!byRealm.has(realm)) {
        byRealm.set(realm, []);
      }
      byRealm.get(realm)?.push(character);
    }
    return [...byRealm.entries()];
  }, [characters]);

  return (
    <motion.div
      key={'list'}
      className="flex flex-col w-full font-semplicita no-scrollbar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {groups.map(([realm, realmCharacters]) => (
        <RealmGroup
          key={realm}
          realm={realm}
          characters={realmCharacters}
          onSelect={(character) => {
            setCharacter(character);
            setView(Views.CHARACTER);
          }}
          canRemove={isStreamer}
          onAsk={onAsk}
        />
      ))}
    </motion.div>
  );
};
