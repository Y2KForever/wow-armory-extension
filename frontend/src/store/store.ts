import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import profileReducer from './slices/profile';
import characterReduser from './slices/characters';
import { profileApi } from './api/profile';
import { setupListeners } from '@reduxjs/toolkit/query';
import { charactersApi } from './api/characters';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    characters: characterReduser,
    [profileApi.reducerPath]: profileApi.reducer,
    [charactersApi.reducerPath]: charactersApi.reducer,
  },
  middleware: (getdefaultMiddleware) => getdefaultMiddleware().concat(profileApi.middleware, charactersApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelect: TypedUseSelectorHook<RootState> = useSelector;

export default store;
