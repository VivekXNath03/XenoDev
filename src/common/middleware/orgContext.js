module.exports = function orgContext(req, res, next) {
  if (!req.user || !req.user.organizationId) {
    return res.status(403).json({ success: false, error: { message: 'Organization context missing', code: 'FORBIDDEN' } });
  }
  req.organizationId = req.user.organizationId;
  return next();
};
