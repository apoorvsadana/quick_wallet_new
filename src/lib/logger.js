import pino from 'pino';

const log = pino({
  name: 'QuickWallet',
  browser: {
    asObject: true,
  },
}).child({ name: 'QuickWallet' });

export default log;
