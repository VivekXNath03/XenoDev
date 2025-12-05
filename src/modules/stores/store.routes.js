const express = require('express');
const router = express.Router();
const storeController = require('./store.controller');
const { authGuard } = require('../auth/auth.middleware');
const orgContext = require('../../common/middleware/orgContext');

/**
 * @openapi
 * /stores:
 *   get:
 *     tags:
 *       - Stores
 *     summary: List stores user has access to
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', authGuard, orgContext, storeController.list);

/**
 * @openapi
 * /stores:
 *   post:
 *     tags:
 *       - Stores
 *     summary: Create a new store (org-admin only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               shopDomain:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', authGuard, orgContext, storeController.create);

/**
 * @openapi
 * /stores/{id}:
 *   delete:
 *     tags:
 *       - Stores
 *     summary: Delete a store (org-admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store deleted successfully
 */
router.delete('/:id', authGuard, orgContext, storeController.deleteStore);

module.exports = router;
