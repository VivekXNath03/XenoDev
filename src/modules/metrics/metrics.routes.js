const express = require('express');
const router = express.Router();
const { authGuard } = require('../auth/auth.middleware');
const orgContext = require('../../common/middleware/orgContext');
const metricsController = require('./metrics.controller');

/**
 * GET /metrics/summary
 */
router.get('/summary', authGuard, orgContext, metricsController.summary);

/**
 * GET /metrics/orders-by-date
 */
router.get('/orders-by-date', authGuard, orgContext, metricsController.ordersByDate);

/**
 * GET /metrics/top-customers
 */
router.get('/top-customers', authGuard, orgContext, metricsController.topCustomers);

module.exports = router;
