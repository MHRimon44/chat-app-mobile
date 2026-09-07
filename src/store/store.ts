import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import { listenerMiddleware } from './listeners';
import { sessionReducer } from './sessionSlice';
import { messageReducer } from '../messages/messageSlice';
export const appStore = configureStore({
  reducer: { [api.reducerPath]: api.reducer, messages: messageReducer, session: sessionReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware).concat(api.middleware),
});
export type AppDispatch = typeof appStore.dispatch;
export type RootState = ReturnType<typeof appStore.getState>;
