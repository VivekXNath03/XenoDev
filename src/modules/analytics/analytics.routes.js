const express = require('express');
const router = express.Router();
const { authGuard } = require('../auth/auth.middleware');
const orgContext = require('../../common/middleware/orgContext');
const { asyncHandler, sendSuccess } = require('../../common/http');
const analyticsService = require('./analytics.service');

/**
 * @openapi
 * /analytics/business-insights:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get business insights (top products, customers, locations)
 *     parameters:
 *       - in: query
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business insights data
 */
router.get('/business-insights', authGuard, orgContext, asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  
  if (!storeId) {
    return res.status(400).json({ error: 'storeId is required' });
  }

  const insights = await analyticsService.getBusinessInsights(req.organizationId, storeId);
  return sendSuccess(res, insights);
}));

/**
 * @openapi
 * /analytics/top-products:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get top selling products
 *     parameters:
 *       - in: query
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top selling products
 */
router.get('/top-products', authGuard, orgContext, asyncHandler(async (req, res) => {
  const { storeId, limit } = req.query;
  
  if (!storeId) {
    return res.status(400).json({ error: 'storeId is required' });
  }

  const products = await analyticsService.getTopSellingProducts(
    req.organizationId, 
    storeId, 
    parseInt(limit) || 10
  );
  return sendSuccess(res, products);
}));

/**
 * @openapi
 * /analytics/top-customers:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get top customers by spend
 *     parameters:
 *       - in: query
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Top customers
 */
router.get('/top-customers', authGuard, orgContext, asyncHandler(async (req, res) => {
  const { storeId, limit } = req.query;
  
  if (!storeId) {
    return res.status(400).json({ error: 'storeId is required' });
  }

  const customers = await analyticsService.getTopCustomers(
    req.organizationId, 
    storeId, 
    parseInt(limit) || 10
  );
  return sendSuccess(res, customers);
}));

/**
 * @openapi
 * /analytics/customer-segments:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get customer segmentation (VIP, Frequent, New, At-Risk, One-time)
 *     parameters:
 *       - in: query
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer segments
 */
router.get('/customer-segments', authGuard, orgContext, asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  
  if (!storeId) {
    return res.status(400).json({ error: 'storeId is required' });
  }

  const segments = await analyticsService.getCustomerSegments(req.organizationId, storeId);
  return sendSuccess(res, segments);
}));

/**
 * @openapi
 * /analytics/revenue-forecast:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get revenue forecast for next N months
 *     parameters:
 *       - in: query
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: months
 *         schema:
 *           type: integer
 *           default: 3
 *     responses:
 *       200:
 *         description: Revenue forecast with historical data
 */
router.get('/revenue-forecast', authGuard, orgContext, asyncHandler(async (req, res) => {
  const { storeId, months } = req.query;
  
  if (!storeId) {
    return res.status(400).json({ error: 'storeId is required' });
  }

  const forecast = await analyticsService.getRevenueForecast(
    req.organizationId, 
    storeId,
    parseInt(months) || 3
  );
  return sendSuccess(res, forecast);
}));

/**
 * @openapi
 * /analytics/business-alerts:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get automated business alerts and recommendations
 *     parameters:
 *       - in: query
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Business alerts with actionable recommendations
 */
router.get('/business-alerts', authGuard, orgContext, asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  
  if (!storeId) {
    return res.status(400).json({ error: 'storeId is required' });
  }

  const alerts = await analyticsService.getBusinessAlerts(req.organizationId, storeId);
  return sendSuccess(res, alerts);
}));

/**
 * @openapi
 * /analytics/product-matrix:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get product performance matrix (Stars, Cash Cows, Question Marks, Dogs)
 *     parameters:
 *       - in: query
 *         name: storeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product performance matrix
 */
router.get('/product-matrix', authGuard, orgContext, asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  
  if (!storeId) {
    return res.status(400).json({ error: 'storeId is required' });
  }

  const matrix = await analyticsService.getProductPerformanceMatrix(req.organizationId, storeId);
  return sendSuccess(res, matrix);
}));

module.exports = router;
