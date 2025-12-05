function notFoundHandler(req, res) {
  res.status(404).json({ success: false, error: { message: 'Not Found', code: 'NOT_FOUND' } });
}

module.exports = notFoundHandler;
