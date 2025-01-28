import { RootState } from '../store';

export const selectSelectedProfile = (state: RootState) => state.profile.profile;
