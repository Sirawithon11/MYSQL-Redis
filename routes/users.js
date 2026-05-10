const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * POST /users/register
 * Register new user
 * Body: { username, password, phone? }
 */
router.post('/register', userController.register);

/**
 * PUT /users/:id
 * Update user
 * Requires: JWT token in Authorization header
 * Body: { phone? }
 */
router.put('/:id', authenticateToken, userController.update);

/**
 * GET /users/:id
 * Get user profile
 * Requires: JWT token in Authorization header
 */
router.get('/:id', authenticateToken, userController.getProfile);

/**
 * DELETE /users/:id
 * Delete user
 * Requires: JWT token in Authorization header
 */
router.delete('/:id', authenticateToken, userController.deleteUser);

module.exports = router;
