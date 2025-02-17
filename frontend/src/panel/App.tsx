import { Spinner } from '@/assets/icons/Spinner';
import { useTwitchAuth } from '@/hooks/useTwitchAuth';
import { createContext } from 'react';
import { Toaster } from 'sonner';
import { Panel } from './pages/Panel';
import { AnimatePresence } from 'framer-motion';

export const TwitchAuthContext = createContext({
  authorized: false,
  channelId: '',
  clientId: '',
  helixToken: '',
  token: '',
  userId: '',
});

const App: React.FC = () => {
  const twitchAuth = useTwitchAuth();
  const isAuthLoading = !twitchAuth.authorized || !twitchAuth.channelId;
  const isLoading = isAuthLoading;

  if (isLoading) {
    return (
      <div className="flex flex-1 justify-center">
        <Spinner className="animate-spin fill-white" />
      </div>
    );
  }
  return (
    <TwitchAuthContext.Provider value={twitchAuth}>
      <Toaster richColors closeButton visibleToasts={1} position="top-center" theme={'light'} />
      <div className="min-h-[500px] bg-backgroundBlizzard flex">
        <AnimatePresence mode="sync">
          <Panel />
        </AnimatePresence>
      </div>
    </TwitchAuthContext.Provider>
  );
};

export default App;
