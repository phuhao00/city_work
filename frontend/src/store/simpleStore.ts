import { configureStore } from '@reduxjs/toolkit';

// Simple store for testing
export const store = configureStore({
  reducer: {
    // Empty reducer for now
    test: (state = {}, action) => state,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;