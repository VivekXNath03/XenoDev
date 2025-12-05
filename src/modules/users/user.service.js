const bcrypt = require('bcryptjs');
const userRepo = require('./user.repository');
const { BadRequest, Forbidden } = require('../../common/errors');

async function getMe(userId) {
  const user = await userRepo.findById(userId);
  if (!user) throw BadRequest('User not found');
  return user;
}

async function listUsers(organizationId, requester) {
  if (!requester || (!requester.isOrgAdmin && requester.globalRole !== 'SUPER_ADMIN')) {
    throw Forbidden('Only organization admins can list users');
  }
  return userRepo.findByOrganization(organizationId);
}

async function createUser({ email, password, fullName, organizationId, roles = [] }, requester) {
  if (!requester || (!requester.isOrgAdmin && requester.globalRole !== 'SUPER_ADMIN')) {
    throw Forbidden('Only organization admins can create users');
  }
  if (!email || !password) throw BadRequest('email and password required');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepo.createUser({ email, passwordHash, fullName, organizationId });

  if (roles && roles.length > 0) {
    await userRepo.addStoreRoles(user.id, roles);
  }

  return user;
}

module.exports = { getMe, listUsers, createUser };
