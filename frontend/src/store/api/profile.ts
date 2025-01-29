import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setProfile } from '../slices/profile';
import { RootState } from '../store';
import { User } from '@/types/User';

interface GenerateSignedUrlProps {
  region: string;
}

export const profileApi = createApi({
  reducerPath: 'profileApi',
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
  tagTypes: ['profile'],
  endpoints: (builder) => ({
    getProfile: builder.query<User, void>({
      query: () => ({
        url: 'user',
        method: 'GET',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setProfile(data));
      },
      providesTags: (result, error, userId) => ['profile'],
    }),
    getGenerateSignedUrl: builder.query({
      query: ({ region }: GenerateSignedUrlProps) => ({
        url: 'generate-signed-url',
        method: 'GET',
        headers: {
          'x-region': region,
        },
      }),
    }),
  }),
});

export const { useGetProfileQuery, useLazyGetGenerateSignedUrlQuery } = profileApi;
