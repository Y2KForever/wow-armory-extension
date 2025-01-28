import { User } from '@/types/User';
import { createSlice } from '@reduxjs/toolkit';

interface ProfileState {
  profile: User | null;
  token: string | null;
  userId: string | null;
}

const initialState: ProfileState = {
  profile: null,
  token: null,
  userId: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.token = null;
      state.userId = null;
    },
  },
});

export const { setProfile, clearProfile, setToken, setUserId } = profileSlice.actions;

export default profileSlice.reducer;
