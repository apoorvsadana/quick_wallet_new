import { createSlice } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

const initialState = {
  walletPrivateKey: undefined,
  currentTransaction: false, //false or the current transaction object
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setWallet: (state, data) => {
      state.walletPrivateKey = data.payload;
    },
    setCurrentTransaction: (state, data) => {
      console.log('setting current transactiojn', data);
      state.currentTransaction = data.payload;
    },
  },
});

export const { setWallet, setCurrentTransaction } = walletSlice.actions;

export const selectWallet = (state) => {
  if (!state.wallet.walletPrivateKey) {
    return false;
  }
  return new ethers.Wallet(state.wallet.walletPrivateKey);
};

export const selectCurrentTransaction = (state) =>
  state.wallet.currentTransaction;
// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
export const initWallet = () => (dispatch, getState) => {
  const currentWallet = selectWallet(getState());
  if (currentWallet) {
    return;
  }
  let pk = ethers.Wallet.createRandom().privateKey;
  dispatch(setWallet(pk));
};

export default walletSlice.reducer;
