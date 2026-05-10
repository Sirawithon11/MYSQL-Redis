const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

/**
 * POST /products
 * Create new product
 * Body: { name, description?, price, stock, category? }
 */
router.post('/', productController.createProduct);

/**
 * GET /products
 * Get all products with pagination
 * Query: ?page=1&limit=10
 */
router.get('/', productController.getAllProducts);

/**
 * GET /products/category/:category
 * Get products by category
 */
router.get('/category/:category', productController.getProductsByCategory);

/**
 * GET /products/:id
 * Get product by ID
 */
router.get('/:id', productController.getProductById);

/**
 * PUT /products/:id
 * Update product
 * Body: { name?, description?, price?, stock?, category?}
 */
router.put('/:id', productController.updateProduct);

/**
 * DELETE /products/:id
 * Delete product
 */
router.delete('/:id', productController.deleteProduct);

module.exports = router;
