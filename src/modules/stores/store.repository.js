const prisma = require('../../config/prisma');

async function findById(id) {
  return prisma.store.findUnique({ where: { id }, include: { shopifyConfig: true } });
}

async function findByOrganization(organizationId) {
  return prisma.store.findMany({ where: { organizationId } });
}

async function createStore({ organizationId, name, shopDomain, timezone, currency }) {
  return prisma.store.create({ data: { organizationId, name, shopDomain, timezone, currency } });
}

async function deleteStore(id) {
  await prisma.orderLineItem.deleteMany({ 
    where: { order: { storeId: id } } 
  });
  await prisma.order.deleteMany({ where: { storeId: id } });
  await prisma.product.deleteMany({ where: { storeId: id } });
  await prisma.customer.deleteMany({ where: { storeId: id } });
  await prisma.storeSyncStatus.deleteMany({ where: { storeId: id } });
  await prisma.shopifyStoreConfig.deleteMany({ where: { storeId: id } });
  await prisma.userStoreRole.deleteMany({ where: { storeId: id } });
  
  return prisma.store.delete({ where: { id } });
}

module.exports = { findById, findByOrganization, createStore, deleteStore };
