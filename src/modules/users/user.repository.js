const prisma = require('../../config/prisma');

async function findById(id) {
  return prisma.user.findUnique({ where: { id }, include: { storeMemberships: true } });
}

async function findByOrganization(organizationId) {
  return prisma.user.findMany({ where: { organizationId } });
}

async function createUser({ email, passwordHash, fullName, organizationId }) {
  return prisma.user.create({ data: { email, passwordHash, fullName, organizationId } });
}

async function addStoreRoles(userId, roles = []) {
  const ops = roles.map(r => prisma.userStoreRole.create({ data: { userId, storeId: r.storeId, role: r.role } }));
  return prisma.$transaction(ops);
}

module.exports = { findById, findByOrganization, createUser, addStoreRoles };
