const Purchase = require('../models/Purchase');
const User = require('../models/User');
const Product = require('../models/Product');

/**
 * Create new purchase
 * POST /purchases
 * Body: { user_id, product_id, quantity, price_per_unit, payment_method?, notes? }
 */
async function createPurchase(req, res) {
  try {
    const { user_id, product_id, quantity, price_per_unit, payment_method, notes } = req.body;

    // Validation
    if (!user_id || !product_id || quantity === undefined || !price_per_unit) {
      return res.status(400).json({
        success: false,
        message: 'user_id, product_id, quantity, and price_per_unit are required',
        error: 'Missing required fields'
      });
    }

    if (isNaN(user_id) || isNaN(product_id) || isNaN(quantity) || isNaN(price_per_unit)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid numeric values',
        error: 'user_id, product_id, quantity, and price_per_unit must be numbers'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0',
        error: 'Invalid quantity'
      });
    }

    if (price_per_unit < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be non-negative',
        error: 'Invalid price'
      });
    }

    // Check if user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'Invalid user_id'
      });
    }

    // Check if product exists
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'Invalid product_id'
      });
    }

    // Check if product has sufficient stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
        error: `Only ${product.stock} units available`
      });
    }

    // Create purchase
    const newPurchase = await Purchase.create(
      user_id,
      product_id,
      quantity,
      price_per_unit,
      payment_method || null,
      notes || null
    );

    return res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: newPurchase
    });
  } catch (err) {
    console.error('Create purchase error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error creating purchase',
      error: err.message
    });
  }
}

/**
 * Get all purchases
 * GET /purchases?page=1&limit=10
 */
async function getAllPurchases(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const purchases = await Purchase.getAll(limit, offset);
    const total = await Purchase.getTotalCount();

    return res.status(200).json({
      success: true,
      message: 'Purchases retrieved successfully',
      data: {
        purchases,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('Get all purchases error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving purchases',
      error: err.message
    });
  }
}

/**
 * Get purchase by ID
 * GET /purchases/:id
 */
async function getPurchaseById(req, res) {
  try {
    const purchaseId = req.params.id;

    if (!purchaseId || isNaN(purchaseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase ID',
        error: 'ID must be a valid number'
      });
    }

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
        error: 'Invalid purchase ID'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Purchase retrieved successfully',
      data: purchase
    });
  } catch (err) {
    console.error('Get purchase error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving purchase',
      error: err.message
    });
  }
}

/**
 * Get purchases by user
 * GET /purchases/user/:user_id?page=1&limit=10
 */
async function getPurchasesByUser(req, res) {
  try {
    const userId = req.params.user_id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
        error: 'ID must be a valid number'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'Invalid user_id'
      });
    }

    const purchases = await Purchase.getByUserId(userId, limit, offset);
    const total = await Purchase.getCountByUserId(userId);

    return res.status(200).json({
      success: true,
      message: 'User purchases retrieved successfully',
      data: {
        user_id: userId,
        username: user.username,
        purchases,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('Get user purchases error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving user purchases',
      error: err.message
    });
  }
}

/**
 * Get purchases by product
 * GET /purchases/product/:product_id?page=1&limit=10
 */
async function getPurchasesByProduct(req, res) {
  try {
    const productId = req.params.product_id;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        error: 'ID must be a valid number'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'Invalid product_id'
      });
    }

    const purchases = await Purchase.getByProductId(productId, limit, offset);

    return res.status(200).json({
      success: true,
      message: 'Product purchases retrieved successfully',
      data: {
        product_id: productId,
        product_name: product.name,
        purchases,
        pagination: {
          page,
          limit,
          count: purchases.length
        }
      }
    });
  } catch (err) {
    console.error('Get product purchases error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving product purchases',
      error: err.message
    });
  }
}

/**
 * Get purchases by status
 * GET /purchases/status/:status?page=1&limit=10
 */
async function getPurchasesByStatus(req, res) {
  try {
    const status = req.params.status;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        error: `Status must be: ${validStatuses.join(', ')}`
      });
    }

    const purchases = await Purchase.getByStatus(status, limit, offset);

    return res.status(200).json({
      success: true,
      message: 'Purchases retrieved successfully',
      data: {
        status,
        purchases,
        pagination: {
          page,
          limit,
          count: purchases.length
        }
      }
    });
  } catch (err) {
    console.error('Get purchases by status error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving purchases',
      error: err.message
    });
  }
}

/**
 * Update purchase
 * PUT /purchases/:id
 * Body: { quantity?, price_per_unit?, status?, payment_method?, notes? }
 */
async function updatePurchase(req, res) {
  try {
    const purchaseId = req.params.id;
    const { quantity, price_per_unit, status, payment_method, notes } = req.body;

    if (!purchaseId || isNaN(purchaseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase ID',
        error: 'ID must be a valid number'
      });
    }

    // Check if purchase exists
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
        error: 'Invalid purchase_id'
      });
    }

    // Prepare update data
    const updateData = {};

    if (quantity !== undefined) {
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a positive number',
          error: 'Invalid quantity'
        });
      }
      updateData.quantity = quantity;
    }

    if (price_per_unit !== undefined) {
      if (isNaN(price_per_unit) || price_per_unit < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a non-negative number',
          error: 'Invalid price'
        });
      }
      updateData.price_per_unit = price_per_unit;
    }

    if (status !== undefined) {
      const validStatuses = ['pending', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status',
          error: `Status must be: ${validStatuses.join(', ')}`
        });
      }
      updateData.status = status;
    }

    if (payment_method !== undefined) {
      updateData.payment_method = payment_method;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
        error: 'Empty update data'
      });
    }

    // Update purchase
    const updatedPurchase = await Purchase.update(purchaseId, updateData);

    return res.status(200).json({
      success: true,
      message: 'Purchase updated successfully',
      data: updatedPurchase
    });
  } catch (err) {
    console.error('Update purchase error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error updating purchase',
      error: err.message
    });
  }
}

/**
 * Update purchase status
 * PATCH /purchases/:id/status
 * Body: { status } - 'pending', 'completed', or 'cancelled'
 */
async function updatePurchaseStatus(req, res) {
  try {
    const purchaseId = req.params.id;
    const { status } = req.body;

    if (!purchaseId || isNaN(purchaseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase ID',
        error: 'ID must be a valid number'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
        error: 'Missing status field'
      });
    }

    // Check if purchase exists
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
        error: 'Invalid purchase_id'
      });
    }

    // Update status
    const updatedPurchase = await Purchase.updateStatus(purchaseId, status);

    return res.status(200).json({
      success: true,
      message: 'Purchase status updated successfully',
      data: updatedPurchase
    });
  } catch (err) {
    console.error('Update status error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error updating purchase status',
      error: err.message
    });
  }
}

/**
 * Delete purchase
 * DELETE /purchases/:id
 */
async function deletePurchase(req, res) {
  try {
    const purchaseId = req.params.id;

    if (!purchaseId || isNaN(purchaseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase ID',
        error: 'ID must be a valid number'
      });
    }

    // Check if purchase exists
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
        error: 'Invalid purchase_id'
      });
    }

    // Delete purchase
    const deleted = await Purchase.delete(purchaseId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete purchase',
        error: 'Database error'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Purchase deleted successfully',
      data: {
        id: purchaseId,
        user_id: purchase.user_id,
        product_id: purchase.product_id
      }
    });
  } catch (err) {
    console.error('Delete purchase error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error deleting purchase',
      error: err.message
    });
  }
}

/**
 * Get user purchase summary
 * GET /purchases/user/:user_id/summary
 */
async function getUserSummary(req, res) {
  try {
    const userId = req.params.user_id;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
        error: 'ID must be a valid number'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'Invalid user_id'
      });
    }

    const summary = await Purchase.getUserSummary(userId);

    return res.status(200).json({
      success: true,
      message: 'User summary retrieved successfully',
      data: {
        user_id: userId,
        username: user.username,
        summary
      }
    });
  } catch (err) {
    console.error('Get user summary error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving user summary',
      error: err.message
    });
  }
}

/**
 * Get product sales summary
 * GET /purchases/product/:product_id/summary
 */
async function getProductSummary(req, res) {
  try {
    const productId = req.params.product_id;

    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        error: 'ID must be a valid number'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'Invalid product_id'
      });
    }

    const summary = await Purchase.getProductSummary(productId);

    return res.status(200).json({
      success: true,
      message: 'Product summary retrieved successfully',
      data: {
        product_id: productId,
        product_name: product.name,
        summary
      }
    });
  } catch (err) {
    console.error('Get product summary error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving product summary',
      error: err.message
    });
  }
}

module.exports = {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  getPurchasesByUser,
  getPurchasesByProduct,
  getPurchasesByStatus,
  updatePurchase,
  updatePurchaseStatus,
  deletePurchase,
  getUserSummary,
  getProductSummary
};
