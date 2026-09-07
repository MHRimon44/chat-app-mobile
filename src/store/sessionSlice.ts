import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../auth/types';
export type SessionState = {
  accessToken: string | null;
  status: 'restoring' | 'anonymous' | 'authenticated';
  user: AuthUser | null;
};
const initialState: SessionState = { accessToken: null, status: 'restoring', user: null };
const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    sessionRestored(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload;
      state.status = action.payload === null ? 'anonymous' : 'authenticated';
      if (action.payload === null) state.user = null;
    },
    signedIn(state, action: PayloadAction<{ accessToken: string; user: AuthUser }>) {
      state.accessToken = action.payload.accessToken;
      state.status = 'authenticated';
      state.user = action.payload.user;
    },
    signedOut(state) {
      state.accessToken = null;
      state.status = 'anonymous';
      state.user = null;
    },
  },
});
export const { sessionRestored, signedIn, signedOut } = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
