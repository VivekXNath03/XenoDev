const { asyncHandler, sendSuccess } = require('../../common/http');
const metricsService = require('./metrics.service');

async function summary(req, res) {
  const { storeId, from, to } = req.query;
  const allowedStores = storeId ? [storeId] : (req.user.isOrgAdmin ? [] : (req.user.storeRoles || []).map(r => r.storeId));
  const data = await metricsService.getSummary(req.organizationId, allowedStores, { from, to });
  return sendSuccess(res, data);
}

async function ordersByDate(req, res) {
  const { storeId, from, to } = req.query;
  const allowedStores = storeId ? [storeId] : (req.user.isOrgAdmin ? [] : (req.user.storeRoles || []).map(r => r.storeId));
  const data = await metricsService.getOrdersByDate(req.organizationId, allowedStores, { from, to });
  return sendSuccess(res, data);
}

async function topCustomers(req, res) {
  const { storeId, from, to, limit } = req.query;
  const allowedStores = storeId ? [storeId] : (req.user.isOrgAdmin ? [] : (req.user.storeRoles || []).map(r => r.storeId));
  const data = await metricsService.getTopCustomers(req.organizationId, allowedStores, { from, to, limit: limit ? parseInt(limit, 10) : 5 });
  return sendSuccess(res, data);
}

module.exports = {
  summary: asyncHandler(summary),
  ordersByDate: asyncHandler(ordersByDate),
  topCustomers: asyncHandler(topCustomers),
};
