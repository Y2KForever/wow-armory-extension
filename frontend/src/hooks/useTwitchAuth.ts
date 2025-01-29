import { setToken, setUserId } from '@/store/slices/profile';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

export interface TwitchAuthResponse {
  channelId: string;
  clientId: string;
  token: string;
  helixToken: string;
  userId: string;
}

export interface TwitchAuthObject extends TwitchAuthResponse {
  authorized: boolean;
}

interface TwitchContext extends Window {
  Twitch: {
    ext: {
      onAuthorized: (callback: CallableFunction) => void;
    };
  };
}

export const useTwitchAuth = () => {
  const dispatch = useDispatch();

  const [twitchAuth, setTwitchAuth] = useState({
    authorized: false,
    channelId: import.meta.env.DEV ? '72606078' : '',
    clientId: '',
    helixToken: '',
    token: '',
    userId: import.meta.env.DEV ? 'U72606078' : '',
  });

  useEffect(() => {
    const twitchContext = window as Window as TwitchContext;
    const itsTwitch = twitchContext.Twitch?.ext;
    if (itsTwitch) {
      twitchContext.Twitch.ext.onAuthorized((twitchResponse: TwitchAuthResponse) => {
        setTwitchAuth({ authorized: true, ...twitchResponse });
        dispatch(setToken(twitchResponse.token ?? null));
        dispatch(setUserId(twitchResponse.channelId ?? null));
      });
    }
  }, []);

  return twitchAuth;
};
