const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { authGuard } = require('../auth/auth.middleware');

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/me', authGuard, userController.me);

/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: List organization users (org-admin only)
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', authGuard, userController.list);

/**
 * @openapi
 * /users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Create a new user in the organization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               roles:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', authGuard, userController.create);

module.exports = router;
