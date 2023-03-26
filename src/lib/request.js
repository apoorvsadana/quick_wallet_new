/// Simulate request/reply manager for the content script and injected script.
import { v4 as uuidv4 } from 'uuid';

export const Response = {
  Reject: 0,
  Continue: 1,
  Error: 2,
};

/**
 * Command to simulate request between content script and service worker.
 */
export const REQUEST_COMMAND = 'request';

/// Send a message to background script to check bypasses.
export const BYPASS_COMMAND = 'bypass';

/// Send a message to the background script with a valid simulation.
export const VALID_CONTINUE_COMMAND = 'valid';

export const isSupportedChainId = (chainId) => {
  return (
    chainId === '0x1' ||
    chainId === '1' ||
    chainId === '137' ||
    chainId === '0x89'
  );
};

export const toPartialRequestArgs = (method, params) => {
  if (method === 'eth_sendTransaction') {
    return {
      signer: params[0].from,
      transaction: params[0],
    };
  } else if (
    method === 'eth_signTypedData_v3' ||
    method === 'eth_signTypedData_v4'
  ) {
    const jsonParams = JSON.parse(params[1]);

    return {
      signer: params[0],
      domain: jsonParams['domain'],
      message: jsonParams['message'],
      primaryType: jsonParams['primaryType'],
    };
  } else if (method === 'eth_sign') {
    // The first, second address are either the message or the signer. They can be flipped depending on what method is called.
    const [first, second] = params;

    let address;
    let hash;
    if (String(first).replace(/0x/, '').length === 40) {
      address = first;
      hash = second;
    } else {
      hash = first;
      address = second;
    }

    return {
      signer: address,
      hash,
    };
  } else if (method === 'personal_sign') {
    // The first, second address are either the message or the signer. They can be flipped depending on what method is called.
    const [first, second] = params;

    let address;
    let msg;
    if (String(first).replace(/0x/, '').length === 40) {
      address = first;
      msg = second;
    } else {
      msg = first;
      address = second;
    }

    return {
      signer: address,
      signMessage: msg,
    };
  } else {
    throw new Error('Show never reach here');
  }
};

/**
 * Map request to replies.
 *
 * This is stored in memory, after the page shuts down this is gone.
 */
export class RequestManager {
  /**
   * Maps from a uuid to a resolver function which takes a response.
   */
  mappings = new Map();

  constructor() {
    this.mappings = new Map();

    document.addEventListener(DISPATCH_RESPONSE, (event) => {
      this._handleResponse(JSON.parse(event.detail));
    });
  }

  /**
   * Add a request and store it in the request manager.
   */
  request(args) {
    return new Promise((resolve) => {
      let request;
      const id = uuidv4();
      const chainId = args.chainId;
      const signer = args.signer;

      // TODO(jqphu): This should be called by injected script. This is a leaky abstraction please fix.
      const hostname = window.location.hostname;

      if ('transaction' in args) {
        request = {
          id,
          chainId,
          hostname,
          signer,
          transaction: args.transaction,
        };
      } else if ('hash' in args) {
        request = {
          id,
          chainId,
          hostname,
          signer,
          hash: args.hash,
        };
      } else if ('message' in args) {
        request = {
          id,
          chainId,
          hostname,
          signer,
          domain: args.domain,
          message: args.message,
          primaryType: args.primaryType,
        };
      } else if ('signMessage' in args) {
        request = {
          id,
          chainId,
          hostname,
          signer,
          signMessage: args.signMessage,
        };
      } else {
        console.warn('Unexpected Request', args);
      }

      if (request !== undefined) {
        this.mappings.set(id, resolve);

        this._dispatchRequest(request);
      }
    });
  }

  /**
   * Dispatch a request.
   */
  _dispatchRequest = (request) => {
    document.dispatchEvent(
      new CustomEvent(DISPATCH_REQUEST, {
        detail: request,
      })
    );
  };

  _handleResponse = (response) => {
    const resolver = this.mappings.get(response.id);
    if (!resolver) {
      // Could be a stale request or for another webpage.
      return;
    }

    // Unwrap the response, drop the id.
    resolver(response.type);

    // Remove it from the mapping.
    this.mappings.delete(response.id);
  };
}

/**
 * Dispatch from injected script to content script.
 */
const DISPATCH_REQUEST = 'POCKET_UNIVERSE_DISPATCH_REQUEST';

/**
 * Listen to request
 */
export const listenToRequest = (callback) => {
  document.addEventListener(DISPATCH_REQUEST, async (event) => {
    callback(event.detail);
  });
};

const DISPATCH_RESPONSE = 'POCKET_UNIVERSE_DISPATCH_RESPONSE';

export const dispatchResponse = (response) => {
  document.dispatchEvent(
    new CustomEvent(DISPATCH_RESPONSE, {
      detail: JSON.stringify(response),
    })
  );
};
