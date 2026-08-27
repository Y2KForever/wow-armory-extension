import { TwitchAuthContext } from '../App';
import { useContext, useMemo, useState } from 'react';
import { useGetProfileQuery } from '@/store/api/profile';
import { Spinner } from '@/assets/icons/Spinner';
import { ApiCharacter, InstanceType } from '@/types/Characters';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { Views } from '@/types/User';
import { MenuHeader } from '../components/Menu';
import { Frame } from '../components/Frame';
import { CharactersView, RosterHeader } from './Characters';
import { CharacterView } from './Character';
import { TalentView } from './Talents';
import { InstanceView } from './Instances';
import { MythicKeystoneView } from './MythicKeystone';

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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedCharacter = useMemo(
    () => data?.characters?.find((character) => character.character_id === selectedId) ?? null,
    [data, selectedId],
  );
  const setSelectedCharacter = (character: ApiCharacter | null) => setSelectedId(character?.character_id ?? null);
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
    <Frame
      header={
        view === Views.LIST ? (
          <RosterHeader characters={data?.characters ?? []} />
        ) : (
          <MenuHeader selectedCharacter={selectedCharacter} setView={setView} view={view} />
        )
      }
    >
      {view === Views.LIST && (
        <SimpleBar className="flex-1 min-h-0" style={{ width: '100%' }}>
          {data?.characters ? (
            <CharactersView setCharacter={setSelectedCharacter} characters={data.characters} setView={setView} />
          ) : (
            <div className="flex flex-col items-center w-full mt-2">
              <p className="text-xs text-white">Streamer has not imported any characters.</p>
            </div>
          )}
        </SimpleBar>
      )}
      {view === Views.CHARACTER && selectedCharacter && <CharacterView character={selectedCharacter} />}
      {view === Views.TALENTS && selectedCharacter && <TalentView character={selectedCharacter} />}
      {view === Views.RAIDS && selectedCharacter && (
        <InstanceView character={selectedCharacter} type={InstanceType.RAID} />
      )}
      {view === Views.MPLUS && selectedCharacter && <MythicKeystoneView character={selectedCharacter} />}
    </Frame>
  );
};
