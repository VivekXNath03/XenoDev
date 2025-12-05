const { asyncHandler, sendSuccess } = require('../../common/http');
const storeService = require('./store.service');

async function list(req, res) {
  const stores = await storeService.listStores(req.organizationId, req.user);
  return sendSuccess(res, stores);
}

async function create(req, res) {
  const { name, shopDomain, timezone, currency } = req.body;
  const store = await storeService.createStore({ organizationId: req.organizationId, name, shopDomain, timezone, currency }, req.user);
  return sendSuccess(res, store, 201);
}

async function deleteStore(req, res) {
  await storeService.deleteStore(req.params.id, req.organizationId, req.user);
  return sendSuccess(res, { message: 'Store deleted successfully' });
}

module.exports = {
  list: asyncHandler(list),
  create: asyncHandler(create),
  deleteStore: asyncHandler(deleteStore),
};
