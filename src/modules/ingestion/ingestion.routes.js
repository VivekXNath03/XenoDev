const express = require('express');
const router = express.Router();
const { authGuard } = require('../auth/auth.middleware');
const storeContext = require('../../common/middleware/storeContext');
const ingestionService = require('./ingestion.service');

/**
 * POST /stores/:storeId/sync
 */
router.post('/stores/:storeId/sync', authGuard, storeContext, async (req, res, next) => {
  try {
    const result = await ingestionService.syncStore(req.storeId, { organizationId: req.organizationId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
