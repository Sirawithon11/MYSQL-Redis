const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

/**
 * POST /purchases
 * Create new purchase
 * Body: { user_id, product_id, quantity, price_per_unit, payment_method?, notes? }
 */
router.post('/', purchaseController.createPurchase);

/**
 * GET /purchases
 * Get all purchases with pagination
 * Query: ?page=1&limit=10
 */
router.get('/', purchaseController.getAllPurchases);

/**
 * GET /purchases/user/:user_id/summary
 * Get user purchase summary (statistics)
 */
router.get('/user/:user_id/summary', purchaseController.getUserSummary);

/**
 * GET /purchases/user/:user_id
 * Get purchases by user with pagination
 * Query: ?page=1&limit=10
 */
router.get('/user/:user_id', purchaseController.getPurchasesByUser);

/**
 * GET /purchases/product/:product_id/summary
 * Get product sales summary (statistics)
 */
router.get('/product/:product_id/summary', purchaseController.getProductSummary);

/**
 * GET /purchases/product/:product_id
 * Get purchases by product with pagination
 * Query: ?page=1&limit=10
 */
router.get('/product/:product_id', purchaseController.getPurchasesByProduct);

/**
 * GET /purchases/status/:status
 * Get purchases by status with pagination
 * Query: ?page=1&limit=10
 */
router.get('/status/:status', purchaseController.getPurchasesByStatus);

/**
 * GET /purchases/:id
 * Get purchase by ID
 */
router.get('/:id', purchaseController.getPurchaseById);

/**
 * PUT /purchases/:id
 * Update purchase
 * Body: { quantity?, price_per_unit?, status?, payment_method?, notes? }
 */
router.put('/:id', purchaseController.updatePurchase);

/**
 * PATCH /purchases/:id/status
 * Update purchase status
 * Body: { status } - 'pending', 'completed', or 'cancelled'
 */
router.patch('/:id/status', purchaseController.updatePurchaseStatus);

/**
 * DELETE /purchases/:id
 * Delete purchase
 */
router.delete('/:id', purchaseController.deletePurchase);

module.exports = router;
