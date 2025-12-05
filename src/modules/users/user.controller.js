const { asyncHandler, sendSuccess } = require('../../common/http');
const userService = require('./user.service');

async function me(req, res) {
  const user = await userService.getMe(req.user.id);
  return sendSuccess(res, user);
}

async function list(req, res) {
  const users = await userService.listUsers(req.user.organizationId, req.user);
  return sendSuccess(res, users);
}

async function create(req, res) {
  const { email, password, fullName, roles } = req.body;
  const user = await userService.createUser({ email, password, fullName, organizationId: req.user.organizationId, roles }, req.user);
  return sendSuccess(res, user, 201);
}

module.exports = {
  me: asyncHandler(me),
  list: asyncHandler(list),
  create: asyncHandler(create),
};
