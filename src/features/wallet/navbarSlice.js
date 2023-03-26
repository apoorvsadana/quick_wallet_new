import { createSlice } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

export const NavbarPages = {
  TRANSACTIONS: 0,
};

const initialState = {
  page: NavbarPages.TRANSACTIONS,
};

export const navbarSlice = createSlice({
  name: 'navbar',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setPage: (state, data) => {
      state.page = data.payload;
    },
  },
});

export const { setPage } = navbarSlice.actions;

export const selectPage = (state) => {
  return state.navbar.page;
};

export default navbarSlice.reducer;
