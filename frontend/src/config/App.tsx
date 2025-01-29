import { useTwitchAuth } from '@/hooks/useTwitchAuth';
import { Config } from './pages/Config';
import { createContext, useMemo } from 'react';
import { Spinner } from '@/assets/icons/Spinner';
import { Toaster } from 'sonner';

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

  const isStreamer = useMemo(() => `U${twitchAuth.channelId}` === twitchAuth.userId, [twitchAuth]);
  const isAuthLoading = !twitchAuth.authorized || !twitchAuth.channelId;

  const isLoading = isAuthLoading;

  if (isLoading) {
    return (
      <div className="flex flex-1 justify-center">
        <Spinner className="animate-spin fill-current" />
      </div>
    );
  }

  return (
    <TwitchAuthContext.Provider value={twitchAuth}>
      <Toaster richColors closeButton visibleToasts={1} position="top-center" theme={'light'} />
      {isStreamer ? <Config /> : <div>Unathorized</div>}
    </TwitchAuthContext.Provider>
  );
};

export default App;
