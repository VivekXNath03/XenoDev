const express = require('express');
const router = express.Router();
const orgController = require('./organization.controller');

/**
 * @openapi
 * /organizations/me:
 *   get:
 *     tags:
 *       - Organizations
 *     summary: Get current organization
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/me', orgController.me);

module.exports = router;
