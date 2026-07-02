import { configureStore } from '@reduxjs/toolkit';

const rootReducer = {
  app: (state = { initializedAt: Date.now() }) => state,
};

export const store = configureStore({
  reducer: rootReducer,
  devTools: import.meta.env.DEV,
});
