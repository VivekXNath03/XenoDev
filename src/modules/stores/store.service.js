const storeRepo = require('./store.repository');
const { Forbidden, BadRequest } = require('../../common/errors');

async function listStores(organizationId, user) {
  // Return stores the user has access to. If org admin, return all.
  if (user.isOrgAdmin || user.globalRole === 'SUPER_ADMIN') {
    return storeRepo.findByOrganization(organizationId);
  }
  // otherwise, return stores where user has membership
  const storeIds = (user.storeRoles || []).map(r => r.storeId);
  if (!storeIds.length) return [];
  const stores = await storeRepo.findByOrganization(organizationId);
  return stores.filter(s => storeIds.includes(s.id));
}

async function createStore({ organizationId, name, shopDomain, timezone, currency }, user) {
  if (!user || (!user.isOrgAdmin && user.globalRole !== 'SUPER_ADMIN')) {
    throw Forbidden('Only organization admins can create stores');
  }
  if (!shopDomain || !name) throw BadRequest('name and shopDomain are required');
  return storeRepo.createStore({ organizationId, name, shopDomain, timezone, currency });
}

async function getStore(storeId) {
  return storeRepo.findById(storeId);
}

async function deleteStore(storeId, organizationId, user) {
  if (!user || (!user.isOrgAdmin && user.globalRole !== 'SUPER_ADMIN')) {
    throw Forbidden('Only organization admins can delete stores');
  }
  const store = await storeRepo.findById(storeId);
  if (!store || store.organizationId !== organizationId) {
    throw BadRequest('Store not found or access denied');
  }
  return storeRepo.deleteStore(storeId);
}

module.exports = { listStores, createStore, getStore, deleteStore };
