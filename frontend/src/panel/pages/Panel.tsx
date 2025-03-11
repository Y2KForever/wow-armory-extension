import { TwitchAuthContext } from '../App';
import { useContext, useState } from 'react';
import { useGetProfileQuery } from '@/store/api/profile';
import { Spinner } from '@/assets/icons/Spinner';
import { ApiCharacter } from '@/types/Characters';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { Views } from '@/types/User';
import { MenuHeader } from '../components/Menu';
import { CharactersView } from './Characters';
import { CharacterView } from './Character';
import { TalentView } from './Talents';

export const Panel = () => {
  const twitchAuth = useContext(TwitchAuthContext);
  const isAuthLoading = !twitchAuth.authorized || !twitchAuth.channelId;
  const {
    isLoading: isProfileLoading,
    error,
    data,
  } = useGetProfileQuery(undefined, {
    skip: isAuthLoading,
  });
  const [view, setView] = useState<Views>(Views.LIST);
  const [selectedCharacter, setSelectedCharacter] = useState<ApiCharacter | null>(null);
  if (isProfileLoading) {
    return (
      <div className="flex flex-1 justify-center">
        <Spinner className="animate-spin fill-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-row items-center justify-center flex-1 justify-center">
        <p className="text-white font-friz">Oh no, an error!</p>
      </div>
    );
  }

  if (data && data.characters.length === 0) {
    return (
      <div className="flex flex-col items-center w-full mt-2">
        <p className="text-xs text-white">Streamer has not imported any characters.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      {view !== Views.LIST && <MenuHeader selectedCharacter={selectedCharacter} setView={setView} view={view} />}
      {view === Views.LIST && (
        <SimpleBar style={{ width: '100%', maxHeight: 500 }}>
          {data?.characters ? (
            <CharactersView setCharacter={setSelectedCharacter} characters={data.characters} setView={setView} />
          ) : (
            <div className="flex flex-col items-center w-full mt-2">
              <p className="text-xs text-white">Streamer has not imported any characters.</p>
            </div>
          )}
        </SimpleBar>
      )}
      {view === Views.CHARACTER && selectedCharacter && (
        <CharacterView character={selectedCharacter} />
      )}
      {view === Views.TALENTS && selectedCharacter && <TalentView character={selectedCharacter} />}
    </div>
  );
};
