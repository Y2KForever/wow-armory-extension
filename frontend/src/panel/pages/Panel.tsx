import { TwitchAuthContext } from '../App';
import { createContext, useContext, useState } from 'react';
import { useGetProfileQuery } from '@/store/api/profile';
import { Spinner } from '@/assets/icons/Spinner';
import { Characters } from '../components/Characters';
import { ApiCharacter } from '@/types/Characters';
import { motion } from 'framer-motion';
import { Character } from '../components/Character';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { Views } from '@/types/User';
import { Talents } from '../components/Talents';

export interface IViewProps {
  view: Views;
  character: ApiCharacter | null;
}

interface IListViewProps {
  characters: ApiCharacter[];
}

interface IViewContext {
  view: IViewProps;
  setView: React.Dispatch<React.SetStateAction<IViewProps>>;
}

const ViewContext = createContext<IViewContext | undefined>(undefined);

const ItemView = () => {
  const context = useContext(ViewContext);
  if (!context) throw new Error('ItemView must be used within a ViewContext.Provider');

  if (!context.view.character) {
    return <></>;
  }

  const { setView, view } = context;

  return <Character character={context.view.character} setView={setView} view={view} />;
};

const TalentView = () => {
  const context = useContext(ViewContext);
  if (!context) throw new Error(`Itemview must be used within a ViewContext.Provider`);

  if (!context.view.character) {
    return <></>;
  }

  const { setView, view } = context;

  return <Talents view={view} setView={setView} />;
};

const ListView = ({ characters }: IListViewProps) => {
  const context = useContext(ViewContext);
  if (!context) throw new Error('ListView must be used within a ViewContext.Provider');

  const { setView } = context;

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
          <div key={char.character_id} onClick={() => setView({ view: Views.ITEM, character: char })}>
            <Characters character={char} />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const Panel = () => {
  const twitchAuth = useContext(TwitchAuthContext);
  const isAuthLoading = !twitchAuth.authorized || !twitchAuth.channelId;
  const [view, setView] = useState<IViewProps>({ view: Views.LIST, character: null });

  const {
    isLoading: isProfileLoading,
    error,
    data,
  } = useGetProfileQuery(undefined, {
    skip: isAuthLoading,
  });

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
    <ViewContext.Provider value={{ view, setView }}>
      {view.view === Views.LIST && (
        <SimpleBar style={{ width: '100%', maxHeight: 500 }}>
          {data?.characters ? (
            <ListView characters={data.characters} />
          ) : (
            <div className="flex flex-col items-center w-full mt-2">
              <p className="text-xs text-white">Streamer has not imported any characters.</p>
            </div>
          )}
        </SimpleBar>
      )}
      {view.view === Views.ITEM && <ItemView />}
      {view.view === Views.TALENTS && <TalentView />}
    </ViewContext.Provider>
  );
};
