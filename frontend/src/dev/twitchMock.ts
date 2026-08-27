import { TwitchAuthResponse } from '@/hooks/useTwitchAuth';

type TwitchHelperWindow = Window & {
  Twitch?: { ext?: Record<string, unknown> };
};

type TwitchJwtPayload = {
  channel_id?: string;
  user_id?: string;
  opaque_user_id?: string;
  role?: string;
  exp?: number;
};

const decodeJwt = (token: string): TwitchJwtPayload | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

const buildAuth = (): TwitchAuthResponse => {
  const token = import.meta.env.VITE_DEV_TWITCH_TOKEN ?? '';
  const claims = token ? decodeJwt(token) : null;

  if (token && !claims) {
    console.warn('[twitch-dev] VITE_DEV_TWITCH_TOKEN is not a readable JWT — run `yarn dev:token` again.');
  }

  if (claims?.exp && claims.exp * 1000 < Date.now()) {
    console.warn('[twitch-dev] VITE_DEV_TWITCH_TOKEN expired — run `yarn dev:token` for a fresh one.');
  }

  if (!token) {
    console.warn(
      '[twitch-dev] No VITE_DEV_TWITCH_TOKEN set. The UI renders, but every API call will be rejected. ' +
        'See frontend/README.md → Local development.',
    );
  }

  const channelId = claims?.channel_id ?? import.meta.env.VITE_DEV_CHANNEL_ID ?? '';

  return {
    channelId,
    clientId: import.meta.env.VITE_DEV_CLIENT_ID ?? '',
    helixToken: '',
    token,
    userId: claims?.opaque_user_id ?? `U${channelId}`,
  };
};

export const installTwitchDevMock = () => {
  if (!import.meta.env.DEV) {
    return;
  }
  if (window.self !== window.top) {
    return;
  }

  const auth = buildAuth();
  const noop = () => {};

  const twitchWindow = window as Window as TwitchHelperWindow;

  twitchWindow.Twitch = {
    ext: {
      ...(twitchWindow.Twitch?.ext ?? {}),
      onAuthorized: (callback: (response: TwitchAuthResponse) => void) => {
        setTimeout(() => callback(auth), 0);
      },
      onContext: noop,
      onError: noop,
      onVisibilityChanged: noop,
      listen: noop,
      unlisten: noop,
      send: noop,
      actions: { requestIdShare: noop, followChannel: noop, minimize: noop },
      configuration: { broadcaster: undefined, developer: undefined, global: undefined, onChanged: noop, set: noop },
      viewer: { id: auth.userId, opaqueId: auth.userId, role: 'broadcaster', isLinked: true },
    },
  };

  console.info(`[twitch-dev] Mock helper installed for channel ${auth.channelId || '(unset)'}.`);
};
