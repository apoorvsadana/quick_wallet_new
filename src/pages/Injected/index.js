// const replaceWindowEthereum = () => {
//   if (!window.ethereum || !window.ethereum.selectedAddress) {
//     setTimeout(replaceWindowEthereum, 100);
//   }
//   window.ethereum = {
//     request: (req) => {
//       console.log('this is the req!!!', req);
//     },
//   };
// };

// replaceWindowEthereum();

// PocketUniverse logo in ASCII form.
import logger from '../../lib/logger';
import {
  RequestManager,
  toPartialRequestArgs,
  Response,
} from '../../lib/request';
import { ethErrors } from 'eth-rpc-errors';
import { ethers } from 'ethers';
import axios from 'axios';

const log = logger.child({ component: 'Injected' });
log.debug({ msg: 'Injected script loaded.' });

/// Handling all the request communication.
const REQUEST_MANAGER = new RequestManager();

const addPocketUniverseProxy = (provider) => {
  if (!provider || provider.isPocketUniverse) {
    return;
  }

  // Heavily taken from RevokeCash to ensure consistency. Thanks Rosco :)!
  //
  // https://github.com/RevokeCash/browser-extension
  const sendHandler = {
    apply: (target, thisArg, args) => {
      const [payloadOrMethod, callbackOrParams] = args;

      // ethereum.send has three overloads:

      // ethereum.send(method: string, params?: Array<unknown>): Promise<JsonRpcResponse>;
      // > gets handled like ethereum.request
      if (typeof payloadOrMethod === 'string') {
        return provider.request({
          method: payloadOrMethod,
          params: callbackOrParams,
        });
      }

      // ethereum.send(payload: JsonRpcRequest): unknown;
      // > cannot contain signature requests
      if (!callbackOrParams) {
        return Reflect.apply(target, thisArg, args);
      }

      // ethereum.send(payload: JsonRpcRequest, callback: JsonRpcCallback): void;
      // > gets handled like ethereum.sendAsync
      return provider.sendAsync(payloadOrMethod, callbackOrParams);
    },
  };

  const requestHandler = {
    apply: async (target, thisArg, args) => {
      const [request] = args;
      if (!request) {
        return Reflect.apply(target, thisArg, args);
      }

      if (
        request.method !== 'eth_signTypedData_v3' &&
        request.method !== 'eth_signTypedData_v4' &&
        request.method !== 'eth_sendTransaction' &&
        request.method !== 'eth_sign' &&
        request.method !== 'personal_sign'
      ) {
        return Reflect.apply(target, thisArg, args);
      }

      log.info({ args }, 'Request type');
      let response;
      if (request.method === 'eth_sendTransaction') {
        log.info('Transaction Request');

        if (request.params.length !== 1) {
          // Forward the request anyway.
          log.warn('Unexpected argument length.');
          return Reflect.apply(target, thisArg, args);
        }

        console.log('i am somehwere over here!!! - ', request);
        log.info(request, 'Request being sent');

        // Sending response.
        // response = await REQUEST_MANAGER.request({
        //   chainId: await provider.request({ method: 'eth_chainId' }),
        //   ...toPartialRequestArgs(request.method, request.params ?? []),
        // });
        response = Response.Reject;

        let provider = ethers.getDefaultProvider(
          'https://rpc-mainnet.maticvigil.com/v1/258e87c299409a354a268f96a06f9e6ae7ab8cea'
        );
        const signer = new ethers.Wallet('', provider);

        let gasPrice = await axios.get(
          'https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice'
        );
        console.log('this is signer', {
          ...request.params[0],
          gasPrice: Number(gasPrice.data.result),
        });
        let result = await signer.sendTransaction({
          ...request.params[0],
          gasPrice: Number(gasPrice.data.result),
        });
        console.log('this is the result - ', result);
        document.getElementsByClassName('bpGPfa')[0].style.display = 'none';

        if (response === Response.Reject) {
          log.info('Reject');
          // Based on EIP-1103
          // eslint-disable-next-line no-throw-literal
          return result;
          //   throw ethErrors.provider.userRejectedRequest(
          //     'PocketUniverse Tx Signature: User denied transaction signature.'
          //   );
        }
      } else if (
        request.method === 'eth_signTypedData_v3' ||
        request.method === 'eth_signTypedData_v4'
      ) {
        log.info('Signature Request');
        if (request.params.length !== 2) {
          // Forward the request anyway.
          log.warn('Unexpected argument length.');
          return Reflect.apply(target, thisArg, args);
        }

        const params = JSON.parse(request.params[1]);
        log.info({ params }, 'Request being sent');

        // Sending response.
        response = await REQUEST_MANAGER.request({
          chainId: await provider.request({ method: 'eth_chainId' }),
          ...toPartialRequestArgs(request.method, request.params ?? []),
        });

        if (response === Response.Reject) {
          log.info('Reject');
          // NOTE: Be cautious when changing this name. 1inch behaves strangely when the error message diverges.
          throw ethErrors.provider.userRejectedRequest(
            'PocketUniverse Message Signature: User denied message signature.'
          );
        }
      } else if (request.method === 'eth_sign') {
        log.info('EthSign Request');
        if (request.params.length !== 2) {
          // Forward the request anyway.
          log.warn('Unexpected argument length.');
          return Reflect.apply(target, thisArg, args);
        }

        // Sending response.
        response = await REQUEST_MANAGER.request({
          chainId: await provider.request({ method: 'eth_chainId' }),
          ...toPartialRequestArgs(request.method, request.params ?? []),
        });

        if (response === Response.Reject) {
          log.info('Reject');
          // NOTE: Be cautious when changing this name. 1inch behaves strangely when the error message diverges.
          throw ethErrors.provider.userRejectedRequest(
            'PocketUniverse Message Signature: User denied message signature.'
          );
        }
      } else if (request.method === 'personal_sign') {
        log.info('Presonal Sign Request');
        if (request.params.length < 2) {
          // Forward the request anyway.
          log.warn('Unexpected argument length.');
          return Reflect.apply(target, thisArg, args);
        }

        // Sending response.
        response = await REQUEST_MANAGER.request({
          chainId: await provider.request({ method: 'eth_chainId' }),
          ...toPartialRequestArgs(request.method, request.params ?? []),
        });

        if (response === Response.Reject) {
          log.info('Reject');
          // NOTE: Be cautious when changing this name. 1inch behaves strangely when the error message diverges.
          throw ethErrors.provider.userRejectedRequest(
            'PocketUniverse Message Signature: User denied message signature.'
          );
        }
      } else {
        throw new Error('Show never reach here');
      }

      // For error, we just continue, to make sure we don't block the user!
      if (response === Response.Continue || response === Response.Error) {
        log.info(response, 'Continue | Error');
        return Reflect.apply(target, thisArg, args);
      }
    },
  };

  const sendAsyncHandler = {
    apply: async (target, thisArg, args) => {
      const [request, callback] = args;
      if (!request) {
        return Reflect.apply(target, thisArg, args);
      }

      if (
        request.method !== 'eth_signTypedData_v3' &&
        request.method !== 'eth_signTypedData_v4' &&
        request.method !== 'eth_sendTransaction' &&
        request.method !== 'eth_sign' &&
        request.method !== 'personal_sign'
      ) {
        return Reflect.apply(target, thisArg, args);
      }

      log.info({ args }, 'Request Type Async Handler');
      if (request.method === 'eth_sendTransaction') {
        log.info('Transaction Request');

        if (request.params.length !== 1) {
          // Forward the request anyway.
          log.warn('Unexpected argument length.');
          return Reflect.apply(target, thisArg, args);
        }

        log.info(request, 'Request being sent');
        provider
          .request({ method: 'eth_chainId' })
          .then((chainId) => {
            return REQUEST_MANAGER.request({
              chainId,
              ...toPartialRequestArgs(request.method, request.params ?? []),
            });
          })
          .then((response) => {
            if (response === Response.Reject) {
              log.info('Reject');
              // Based on EIP-1103
              // eslint-disable-next-line no-throw-literal
              const error = ethErrors.provider.userRejectedRequest(
                'PocketUniverse Tx Signature: User denied transaction signature.'
              );
              const response = {
                id: request?.id,
                jsonrpc: '2.0',
                error,
              };
              callback(error, response);
              // For error, we just continue, to make sure we don't block the user!
            } else if (
              response === Response.Continue ||
              response === Response.Error
            ) {
              log.info(response, 'Continue | Error');
              return Reflect.apply(target, thisArg, args);
            }
          });
      } else if (
        request.method === 'eth_signTypedData_v3' ||
        request.method === 'eth_signTypedData_v4'
      ) {
        log.info('Signature Request');
        if (request.params.length !== 2) {
          // Forward the request anyway.
          log.warn('Unexpected argument length.');
          return Reflect.apply(target, thisArg, args);
        }

        const params = JSON.parse(request.params[1]);
        log.info({ params }, 'Request being sent');

        provider
          .request({ method: 'eth_chainId' })
          .then((chainId) => {
            return REQUEST_MANAGER.request({
              chainId,
              ...toPartialRequestArgs(request.method, request.params ?? []),
            });
          })
          .then((response) => {
            if (response === Response.Reject) {
              log.info('Reject');
              // Based on EIP-1103
              // eslint-disable-next-line no-throw-literal
              const error = ethErrors.provider.userRejectedRequest(
                'PocketUniverse Message Signature: User denied message signature.'
              );
              const response = {
                id: request?.id,
                jsonrpc: '2.0',
                error,
              };
              callback(error, response);
              // For error, we just continue, to make sure we don't block the user!
            } else if (
              response === Response.Continue ||
              response === Response.Error
            ) {
              log.info(response, 'Continue | Error');
              return Reflect.apply(target, thisArg, args);
            }
          });
      } else if (request.method === 'eth_sign') {
        log.info('EthSign Request');
        if (request.params.length !== 2) {
          // Forward the request anyway.
          log.warn('Unexpected argument length.');
          return Reflect.apply(target, thisArg, args);
        }

        provider
          .request({ method: 'eth_chainId' })
          .then((chainId) => {
            return REQUEST_MANAGER.request({
              chainId,
              ...toPartialRequestArgs(request.method, request.params ?? []),
            });
          })
          .then((response) => {
            if (response === Response.Reject) {
              log.info('Reject');
              // Based on EIP-1103
              // eslint-disable-next-line no-throw-literal
              const error = ethErrors.provider.userRejectedRequest(
                'PocketUniverse Message Signature: User denied message signature.'
              );
              const response = {
                id: request?.id,
                jsonrpc: '2.0',
                error,
              };
              callback(error, response);
              // For error, we just continue, to make sure we don't block the user!
            } else if (
              response === Response.Continue ||
              response === Response.Error
            ) {
              log.info(response, 'Continue | Error');
              return Reflect.apply(target, thisArg, args);
            }
          });
      } else if (request.method === 'personal_sign') {
        log.info('Presonal Sign Request');
        if (request.params.length === 0) {
          // Forward the request anyway.
          log.warn('Unexpected argument length.');
          return Reflect.apply(target, thisArg, args);
        }

        provider
          .request({ method: 'eth_chainId' })
          .then((chainId) => {
            return REQUEST_MANAGER.request({
              chainId,
              ...toPartialRequestArgs(request.method, request.params ?? []),
            });
          })
          .then((response) => {
            if (response === Response.Reject) {
              log.info('Reject');
              // Based on EIP-1103
              // eslint-disable-next-line no-throw-literal
              const error = ethErrors.provider.userRejectedRequest(
                'PocketUniverse Message Signature: User denied message signature.'
              );
              const response = {
                id: request?.id,
                jsonrpc: '2.0',
                error,
              };
              callback(error, response);
              // For error, we just continue, to make sure we don't block the user!
            } else if (
              response === Response.Continue ||
              response === Response.Error
            ) {
              log.info(response, 'Continue | Error');
              return Reflect.apply(target, thisArg, args);
            }
          });
      }
    },
  };

  log.debug({ provider }, 'Added proxy');
  // TODO(jqphu): Brave will not allow us to overwrite request/send/sendAsync as it is readonly.
  //
  // The workaround would be to proxy the entire window.ethereum object (but
  // that could run into its own complications). For now we shall just skip
  // brave wallet.
  //
  // This should still work for metamask and other wallets using the brave browser.
  try {
    Object.defineProperty(provider, 'request', {
      value: new Proxy(provider.request, requestHandler),
    });
    Object.defineProperty(provider, 'send', {
      value: new Proxy(provider.send, sendHandler),
    });
    Object.defineProperty(provider, 'sendAsync', {
      value: new Proxy(provider.sendAsync, sendAsyncHandler),
    });
    provider.isPocketUniverse = true;
    console.log('Pocket Universe is running!');
  } catch (error) {
    // If we can't add ourselves to this provider, don't mess with other providers.
    log.warn({ provider, error }, 'Could not attach to provider');
  }
};

if (window.ethereum) {
  console.log('PocketUniverse: window.ethereum detected, adding proxy.');

  log.debug({ provider: window.ethereum }, 'Detected Provider');
  addPocketUniverseProxy(window.ethereum);
} else {
  console.log('PocketUniverse: window.ethereum not detected, defining.');

  let ethCached = undefined;
  Object.defineProperty(window, 'ethereum', {
    get: () => {
      return ethCached;
    },
    set: (provider) => {
      addPocketUniverseProxy(provider);
      ethCached = provider;
    },
  });
}
