import { RootState } from '../store';

export const selectSelectedCharacters = (state: RootState) => state.characters.characters;
