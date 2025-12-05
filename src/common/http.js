function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function sendSuccess(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

module.exports = {
  asyncHandler,
  sendSuccess,
};
