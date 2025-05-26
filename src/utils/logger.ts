import pino from 'pino';

export default pino({
  'transport': {
    'target': 'pino-pretty',
    'options': {
      'colorize': true,
      'translateTime': 'yyyy-mm-dd HH:MM:ss',
      'ignore': 'pid,hostname',
    },
  },
});
