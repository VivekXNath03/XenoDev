const express = require('express');
const router = express.Router();
const { authGuard } = require('../auth/auth.middleware');
const orgContext = require('../../common/middleware/orgContext');
const { asyncHandler, sendSuccess } = require('../../common/http');
const prisma = require('../../config/prisma');

router.get('/', authGuard, orgContext, asyncHandler(async (req, res) => {
  const { storeId } = req.query;
  if (!storeId) {
    return res.status(400).json({ error: 'storeId is required' });
  }
  
  const products = await prisma.product.findMany({
    where: {
      organizationId: req.organizationId,
      storeId,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return sendSuccess(res, products);
}));

module.exports = router;
