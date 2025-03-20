import { RaidsByExpansion, ApiTalents, WowCharacter } from '@/types/Characters';
import { createSlice } from '@reduxjs/toolkit';

interface CharactersState {
  characters: WowCharacter[];
  talents: ApiTalents | null;
  instances: RaidsByExpansion[] | null;
}

const initialState: CharactersState = {
  characters: [],
  talents: null,
  instances: null,
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
    setInstances: (state, action) => {
      state.instances = action.payload;
    },
    clearInstances: (state, action) => {
      state.instances = null;
    },
    clearTalents: (state) => {
      state.talents = null;
    },
  },
});

export const { clearCharacters, setCharacters, setTalents, clearTalents, setInstances, clearInstances } =
  charactersSlice.actions;

export default charactersSlice.reducer;
