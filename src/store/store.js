import { configureStore } from '@reduxjs/toolkit';
import walletReducer from '../features/wallet/walletSlice';
import navbarReducer from '../features/wallet/navbarSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    navbar: navbarReducer,
  },
  devTools: true,
});
