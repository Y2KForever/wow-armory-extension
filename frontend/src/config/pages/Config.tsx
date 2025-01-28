import { BNetConnect } from '../components/BnetConnect';
import { ConfigHeader } from '../components/ConfigHeader';
import * as bg from '../../assets/bg.jpg';
import { useContext, useEffect, useRef, useState } from 'react';
import { TwitchAuthContext } from '../App';
import { useGetProfileQuery } from '@/store/api/profile';
import { Spinner } from '@/assets/icons/Spinner';
import { isFetchBaseQueryError } from '@/lib/utils';
import { RegionSelect } from '../components/RegionSelect';
import { Region } from '@/types/Region';
import { FetchCharactersButton } from '../components/FetchCharactersButton';
import { useLazyGetCharatersQuery } from '@/store/api/characters';
import { toast } from 'sonner';
import { CharacterList } from '../components/CharacterList';
import { useAppSelect } from '@/store/store';
import { selectSelectedCharacters } from '@/store/selectors/selectCharacters';
import { ImportButton } from '../components/ImportButton';

export const Config = () => {
  const characters = useAppSelect(selectSelectedCharacters);
  const twitchAuth = useContext(TwitchAuthContext);
  const isAuthLoading = !twitchAuth.authorized || !twitchAuth.channelId;
  const { isLoading: isProfileLoading, error, data } = useGetProfileQuery(undefined, { skip: isAuthLoading });
  const [getCharacters, { isLoading: isCharactersLoading }] = useLazyGetCharatersQuery();
  const [region, setRegion] = useState<string | undefined>(undefined);

  const importCharacters = async () => {
    if (region) {
      try {
        await getCharacters({
          region: region,
        }).unwrap();
        toast.success('Success!', {
          description: 'Successfully fetched characters',
        });
      } catch (err) {
        toast.error('Error', {
          description:
            isFetchBaseQueryError(err) && err.data.error
              ? err.data.error
              : 'Something went wrong. Please try again later.',
        });
      }
    } else {
      toast.error('Error', {
        description: 'Please select a region',
      });
    }
  };

  const isLoading = isAuthLoading || isProfileLoading;

  const selectRegion = (region: Region) => {
    setRegion(region);
  };

  const popupRef = useRef<Window | null>(null);

  const openPopup = () => {
    const popup = window.open(
      `https://wow.y2kforever.com/authorize?region=${region?.toLowerCase()}`,
      '_blank',
      'width=800,height=600',
    );

    if (!popup) {
      console.error('Popup blocked or failed to open');
      return;
    }

    popupRef.current = popup;

    const interval = setInterval(() => {
      if (popup.closed) {
        console.log('Popup closed');
        clearInterval(interval);
        popupRef.current = null;

        console.log('Fetching user data...');
      }
    }, 500);
  };

  useEffect(() => {
    if (data?.region) {
      setRegion(data.region);
    }
  }, [data]);

  return (
    <div
      className="flex flex-col w-full h-full items-center bg-cover text-white"
      style={{ backgroundImage: `url(${bg.default})` }}
    >
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="animate-spin fill-current" />
        </div>
      ) : error && isFetchBaseQueryError(error) && error.status !== 404 ? (
        <div className="rounded-lg flex flex-col bg-backgroundBlizzard p-5 mt-5">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm leading-snug text-white">Something went wrong. Please try again later.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center pt-5 backdrop-brightness-50 w-full h-full overflow-scroll">
          <ConfigHeader />
          <div id="connect-container">
            <RegionSelect
              isDisabled={isCharactersLoading || isLoading}
              defaultValue={region}
              onValueChange={selectRegion}
            />
            {!data?.userId ? (
              <BNetConnect isDisabled={!region} openAuth={openPopup} />
            ) : (
              <div>
                <FetchCharactersButton
                  onClick={importCharacters}
                  isDisabled={isCharactersLoading}
                  isLoading={isCharactersLoading}
                />
              </div>
            )}
          </div>
          {characters && characters.length > 0 && (
            <>
              <div className="container mx-auto py-10">
                <CharacterList data={characters} />
              </div>
              <div className="flex items-end flex-col w-full mb-2">
                <ImportButton isDisabled={false} openAuth={() => {}} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
