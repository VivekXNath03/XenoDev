let logger;
try {
  const pino = require('pino');
  logger = pino({ level: process.env.LOG_LEVEL || 'info' });
} catch (e) {
  // fallback simple console logger
  logger = {
    info: (...args) => console.log('[info]', ...args),
    warn: (...args) => console.warn('[warn]', ...args),
    error: (...args) => console.error('[error]', ...args),
    debug: (...args) => console.debug('[debug]', ...args),
  };
}

module.exports = logger;
