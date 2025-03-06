import { RootState } from '../store';

export const selectSelectedTalents = (state: RootState) => state.characters.talents;
