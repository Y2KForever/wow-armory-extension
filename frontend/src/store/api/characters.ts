import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCharacters } from '../slices/characters';
import { RootState } from '../store';
import { User } from '@/types/User';
import { WowCharacter } from '@/types/Characters';

type GetCharactersProps = {
  region: string;
};

export const charactersApi = createApi({
  reducerPath: 'charactersApi',
  refetchOnFocus: true,
  refetchOnMountOrArgChange: true,
  refetchOnReconnect: true,
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://wow.y2kforever.com/',
    prepareHeaders(headers, { getState }) {
      const token = (getState() as RootState).profile.token;
      const userId = (getState() as RootState).profile.userId;

      if (token) {
        headers.set('X-Token', token);
      }

      if (userId) {
        headers.set('X-User-Id', userId);
      }

      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['characters'],
  endpoints: (builder) => ({
    getCharaters: builder.query<WowCharacter[], GetCharactersProps>({
      query: ({ region }) => ({
        url: 'characters',
        method: 'GET',
        params: {
          region,
        },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCharacters(data));
      },
      providesTags: (result, error, userId) => ['characters'],
    }),
  }),
});

export const { useLazyGetCharatersQuery } = charactersApi;
