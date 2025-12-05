const logger = require('../../config/logger');
const { AppError } = require('../errors');

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    logger.error({ err }, 'AppError');
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
      },
    });
  }

  logger.error({ err }, 'UnhandledError');
  return res.status(500).json({ success: false, error: { message: 'Internal Server Error', code: 'INTERNAL_ERROR' } });
}

module.exports = errorHandler;
