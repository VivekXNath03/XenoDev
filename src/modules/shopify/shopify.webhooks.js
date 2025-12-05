// Minimal webhook skeleton - expand security (HMAC) and verification in production
const express = require('express');
const router = express.Router();
const logger = require('../../config/logger');

router.post('/orders/create', express.json({ type: '*/*' }), (req, res) => {
  logger.info('Received order create webhook', { body: req.body });
  // TODO: verify signature, queue ingestion
  res.status(200).send('OK');
});

module.exports = router;
