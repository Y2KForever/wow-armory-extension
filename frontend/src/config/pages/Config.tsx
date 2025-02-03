import { ConfigHeader } from '../components/ConfigHeader';
import * as bg from '../../assets/bg.jpg';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { TwitchAuthContext } from '../App';
import { useGetProfileQuery, useLazyGetGenerateSignedUrlQuery } from '@/store/api/profile';
import { Spinner } from '@/assets/icons/Spinner';
import { isFetchBaseQueryError } from '@/lib/utils';
import { RegionSelect } from '../components/RegionSelect';
import { Region } from '@/types/Region';
import { useLazyPostFetchCharactersQuery, useImportCharactersMutation } from '@/store/api/characters';
import { toast } from 'sonner';
import { CharacterList } from '../components/CharacterList';
import { useAppSelect } from '@/store/store';
import { selectSelectedCharacters } from '@/store/selectors/selectCharacters';
import { NamespaceSelect } from '../components/NamespaceSelect';
import { Option } from '@/components/ui/multi-select';
import { RowSelectionState, Updater } from '@tanstack/react-table';
import { WowCharacter } from '@/types/Characters';
import { BlizzardButton } from '../components/BlizzardButton';
import { BattleNet } from '@/assets/icons/BattleNet';

export const Config = () => {
  const characters = useAppSelect(selectSelectedCharacters);
  const twitchAuth = useContext(TwitchAuthContext);
  const isAuthLoading = !twitchAuth.authorized || !twitchAuth.channelId;

  const { isLoading: isProfileLoading, error, data } = useGetProfileQuery(undefined, { skip: isAuthLoading });
  const [getCharacters, { isLoading: isCharactersLoading }] = useLazyPostFetchCharactersQuery();
  const [importCharacters, { isLoading: isLoadingImport }] = useImportCharactersMutation();
  const [getSignedUrl] = useLazyGetGenerateSignedUrlQuery();

  const [region, setRegion] = useState<string | undefined>(undefined);
  const [namespaces, setNamespaces] = useState<string[]>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedCharacters, setSelectedCharacters] = useState<WowCharacter[]>([]);

  const handleOnRowSelectionChange = useCallback(
    (valueFn: Updater<RowSelectionState>) => {
      if (typeof valueFn === 'function') {
        const updatedRowSelection = valueFn(rowSelection);
        setRowSelection(updatedRowSelection);

        const selectedRows = Object.keys(updatedRowSelection).reduce((acc: WowCharacter[], key) => {
          if (updatedRowSelection[key]) {
            const index = parseInt(key, 10);
            const row = characters[index];
            if (row) {
              acc.push(row);
            }
          }
          return acc;
        }, []);
        setSelectedCharacters(selectedRows);
      }
    },
    [characters, rowSelection],
  );

  const handleChangeNamespace = (namespaces: Option[]) => {
    setNamespaces(namespaces.map((namespace) => namespace.value));
  };

  const fetchCharacters = async () => {
    if (region) {
      try {
        await getCharacters({
          region,
          namespaces,
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

  const importSelectedCharacters = async () => {
    if (region) {
      if (selectedCharacters.length > 0) {
        try {
          await importCharacters({
            characters: selectedCharacters,
            region,
          }).unwrap();
          toast.success('Imported characters sucessfully', {
            description: 'Characters have been imported. You can now start using the extension.',
          });
        } catch (err) {
          if (isFetchBaseQueryError(err)) {
            toast.error(`Failed to import`, {
              description: err.data.error,
            });
          } else {
            toast.error(`Failed to import`, {
              description: 'Something went wrong, try again later.',
            });
          }
        }
      } else {
        toast.error('Error', {
          description: 'Please select characters to import.',
        });
      }
    } else {
      toast.error('Error', {
        description: 'Please select a region.',
      });
    }
  };

  const isLoading = isAuthLoading || isProfileLoading;

  const selectRegion = (region: Region) => {
    setRegion(region);
  };

  const popupRef = useRef<Window | null>(null);

  const openPopup = async () => {
    if (!region) {
      return;
    }
    try {
      const popup = window.open('', '_blank', 'width=800,height=600,noopener,noreferrer');

      popupRef.current = popup;
      const { data, error } = await getSignedUrl({ region: region.toLowerCase() });

      console.log('data', data);

      if (error) {
        toast.error('Error', {
          description: 'Failed to create a secure URL, please try again later.',
        });
        popup?.close();
        return;
      }
      if (popup) {
        popup.location.href = data;
      }
    } catch (err) {
      toast.error(`Error`, {
        description: `Error opening popup: ${err}`,
      });
      return;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (popupRef.current && popupRef.current.closed) {
        clearInterval(interval);
        popupRef.current = null;
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

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
            {!data?.authorized ? (
              <BlizzardButton className="mt-5" isDisabled={!region} isLoading={false} onClick={openPopup}>
                <>
                  <BattleNet className="fill-current" />
                  Get Started Now
                </>
              </BlizzardButton>
            ) : (
              <>
                <div className="flex flex-col items-center">
                  <NamespaceSelect onValueChange={handleChangeNamespace} isDisabled={isLoading} />
                  <BlizzardButton
                    isLoading={isCharactersLoading}
                    onClick={fetchCharacters}
                    isDisabled={isCharactersLoading || namespaces.length === 0}
                    className="mt-5"
                  >
                    Fetch Character(s)
                  </BlizzardButton>
                </div>
              </>
            )}
          </div>
          {data?.authorized && (characters.length > 0 || selectedCharacters.length > 0) && (
            <>
              <div className="container mx-auto py-10">
                <CharacterList
                  data={characters}
                  rowSelection={rowSelection}
                  handleOnRowChange={handleOnRowSelectionChange}
                />
              </div>
              <div className="flex items-end flex-col w-full mb-2">
                <BlizzardButton
                  isLoading={isLoadingImport}
                  isDisabled={selectedCharacters.length === 0 || isLoadingImport}
                  onClick={importSelectedCharacters}
                  className="mr-16"
                >
                  Import Character(s)
                </BlizzardButton>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
