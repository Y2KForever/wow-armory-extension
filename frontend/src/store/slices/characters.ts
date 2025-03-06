import { ApiTalents, WowCharacter } from '@/types/Characters';
import { createSlice } from '@reduxjs/toolkit';

interface CharactersState {
  characters: WowCharacter[];
  talents: ApiTalents | null;
}

const initialState: CharactersState = {
  characters: [],
  talents: null,
};

const charactersSlice = createSlice({
  name: 'characters',
  initialState,
  reducers: {
    setCharacters: (state, action) => {
      state.characters = action.payload;
    },
    clearCharacters: (state) => {
      state.characters = [];
    },
    setTalents: (state, action) => {
      state.talents = action.payload;
    },
    clearTalents: (state) => {
      state.talents = null;
    },
  },
});

export const { clearCharacters, setCharacters, setTalents, clearTalents } = charactersSlice.actions;

export default charactersSlice.reducer;
