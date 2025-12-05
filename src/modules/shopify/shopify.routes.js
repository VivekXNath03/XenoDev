const express = require('express');
const router = express.Router();
const shopifyService = require('./shopify.service');
const { authGuard } = require('../auth/auth.middleware');
const storeContext = require('../../common/middleware/storeContext');
const env = require('../../config/env');

/**
 * @openapi
 * /shopify/mode:
 *   get:
 *     tags:
 *       - Shopify
 *     summary: Returns current Shopify mode
 */
router.get('/mode', (req, res) => {
  res.json({ mode: env.isOAuthAppMode ? 'oauth_app' : (env.isDevDirectMode ? 'dev_direct' : 'unknown') });
});

/**
 * POST /stores/:storeId/shopify/connect
 * In OAuth mode this would be the callback that saves tokens.
 */
router.post('/stores/:storeId/shopify/connect', authGuard, storeContext, async (req, res, next) => {
  const { accessToken, scope, apiVersion } = req.body;
  try {
    if (env.isOAuthAppMode) {
      await shopifyService.connectStoreWithOAuth(req.storeId, accessToken, scope, apiVersion || env.shopifyApiVersion);
      return res.json({ success: true });
    }
    // Dev direct: no-op if dev credentials already used
    return res.json({ success: true, note: 'Dev direct mode - using single DEV_* credentials' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
