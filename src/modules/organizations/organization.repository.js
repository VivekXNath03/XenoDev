const prisma = require('../../config/prisma');

async function findById(id) {
  return prisma.organization.findUnique({ where: { id }, include: { users: true, stores: true } });
}

module.exports = { findById };
