import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: !!localStorage.getItem('access_token'),
  profile: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile(state, action) {
      state.profile = action.payload;
    },
    setAuthenticated(state, action) {
      state.isAuthenticated = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.profile = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
    },
  },
});

export const { setProfile, setAuthenticated, logout } = userSlice.actions;
export default userSlice.reducer; 