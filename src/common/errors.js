class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

const BadRequest = (msg = 'Bad Request') => new AppError(msg, 400, 'BAD_REQUEST');
const Unauthorized = (msg = 'Unauthorized') => new AppError(msg, 401, 'UNAUTHORIZED');
const Forbidden = (msg = 'Forbidden') => new AppError(msg, 403, 'FORBIDDEN');
const NotFound = (msg = 'Not Found') => new AppError(msg, 404, 'NOT_FOUND');
const Internal = (msg = 'Internal Server Error') => new AppError(msg, 500, 'INTERNAL_ERROR');

module.exports = {
  AppError,
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  Internal,
};
