import { WowCharacter } from '@/types/Characters';
import { createSlice } from '@reduxjs/toolkit';

interface CharactersState {
  characters: WowCharacter[];
}

const initialState: CharactersState = {
  characters: [],
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
  },
});

export const { clearCharacters, setCharacters } = charactersSlice.actions;

export default charactersSlice.reducer;
