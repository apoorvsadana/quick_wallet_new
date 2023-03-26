import { printLine } from './modules/print';
import { createRoot } from 'react-dom/client';
import React from 'react';
import WalletCommands from '../../components/CommandPalette/WalletCommands';

console.log('Content script works!');
console.log('Must reload extension for modifications to take effect.');

printLine("Using the 'printLine' function from the Print Module");

// var s = document.createElement('script');
// // This should intentionally fail on chrome as we inject the script in the background file.
// s.src = chrome.runtime.getURL('injectedScript.bundle.js');
// (document.head || document.documentElement).appendChild(s);
// s.onload = () => {
//   s.remove();
// };

window.addEventListener('message', async (message) => {
  const { target } = message?.data ?? {};
  const { name, data } = message?.data?.data ?? {};
  const { hostname } = window.location;

  if (name !== 'metamask-provider' || !data) return;
  if (target === 'metamask-contentscript') {
    // Trying to send messages directly to metamask should not be supported. It should go through pocket universe.
    if (
      data.method === 'eth_sendTransaction' ||
      data.method === 'eth_signTypedData_v3' ||
      data.method === 'eth_signTypedData_v4' ||
      data.method === 'eth_sendTransaction' ||
      data.method === 'eth_sign' ||
      data.method === 'personal_sign'
    ) {
      try {
        const settings = await chrome.storage.sync.get(['settings']);
        if (
          !settings.settings ||
          (settings.settings && !settings.settings.debugger)
        ) {
          return;
        }
        console.log('i have a metamask message22!!!! - ', {
          type: 'qw_forward',
          message: message.data.data.data,
        });
        const currentMessage = await chrome.storage.sync.get(['walletMessage']);
        console.log('this is the current emssage - ', currentMessage);
        if (currentMessage && currentMessage.walletMessage) {
          console.log('i am returnings');
          return;
        }
        chrome.storage.sync.set({
          walletMessage: message.data.data.data,
        });
        chrome.runtime.sendMessage('qw_open_popup');
      } catch (err) {
        console.error('this is the error - ', err);
      }
    }
  }

  //   if (target === 'metamask-inpage' && data?.method?.includes('chainChanged')) {
  //     chainId = Number(data?.params?.chainId ?? chainId);
  //   }
});
