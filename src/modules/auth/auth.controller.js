const { asyncHandler, sendSuccess } = require('../../common/http');
const authService = require('./auth.service');

async function signup(req, res) {
  const { organizationName, organizationSlug, email, password, fullName, initialStoreName, initialShopDomain } = req.body;
  const result = await authService.signup({ organizationName, organizationSlug, email, password, fullName, initialStoreName, initialShopDomain });
  return sendSuccess(res, result, 201);
}

async function login(req, res) {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  return sendSuccess(res, result, 200);
}

module.exports = {
  signup: asyncHandler(signup),
  login: asyncHandler(login),
};
