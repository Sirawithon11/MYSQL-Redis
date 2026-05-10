const Product = require('../models/Product');

/**
 * Create new product
 * POST /products
 * Body: { name, description, price, stock, category }
 */
async function createProduct(req, res) {
  try {
    const { name, description, price, stock, category } = req.body;

    // Validation
    if (!name || !price || price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Product name and valid price are required',
        error: 'Missing or invalid required fields'
      });
    }

    if (name.trim().length === 0 || name.length > 255) {
      return res.status(400).json({
        success: false,
        message: 'Product name must be between 1 and 255 characters',
        error: 'Invalid product name'
      });
    }

    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity must be a non-negative number',
        error: 'Invalid stock value'
      });
    }

    // Check if product already exists
    const existingProduct = await Product.findByName(name);
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: 'Product name already exists',
        error: 'Duplicate product name'
      });
    }

    // Create product
    const newProduct = await Product.create(
      name,
      description || null,
      price,
      stock,
      category || null,
    );

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (err) {
    console.error('Create product error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: err.message
    });
  }
}

/**
 * Get all products
 * GET /products?page=1&limit=10
 */
async function getAllProducts(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;

    const products = await Product.getAll(limit, offset);
    const total = await Product.getTotalCount();

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error('Get all products error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving products',
      error: err.message
    });
  }
}

/**
 * Get product by ID
 * GET /products/:id
 */
async function getProductById(req, res) {
  try {
    const productId = req.params.id;

    // Validate ID
    if (!productId || isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
        error: 'ID must be a valid number'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        error: 'Invalid product ID'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (err) {
    console.error('Get product error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving product',
      error: err.message
    });
  }
}

/**
 * Get products by category
 * GET /products/category/:category
 */
async function getProductsByCategory(req, res) {
  try {
    const category = req.params.category;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required',
        error: 'Missing category parameter'
      });
    }

    const products = await Product.getByCategory(category);

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        category,
        count: products.length,
        products
      }
    });
  } catch (err) {
    console.error('Get products by category error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving products',
      error: err.message
    });
  }
}

/**
 * Update product
 * PUT /products/:id
 * Body: { name?, description?, price?, stock?, category? }
 */
async function updateProduct(req, res) {
  try {
    const productId = req.params.id;
    const { name, description, price, stock, category } = req.body;

    // Validate ID
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
        error: 'Invalid product ID'
      });
    }

    // Prepare update data
    const updateData = {};

    // Validate and add name if provided
    if (name !== undefined) {
      if (name.trim().length === 0 || name.length > 255) {
        return res.status(400).json({
          success: false,
          message: 'Product name must be between 1 and 255 characters',
          error: 'Invalid product name'
        });
      }
      // Check if new name already exists (and is different from current)
      if (name !== product.name) {
        const existingProduct = await Product.findByName(name);
        if (existingProduct) {
          return res.status(409).json({
            success: false,
            message: 'Product name already exists',
            error: 'Duplicate product name'
          });
        }
      }
      updateData.name = name;
    }

    // Validate and add price if provided
    if (price !== undefined) {
      if (isNaN(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid non-negative number',
          error: 'Invalid price'
        });
      }
      updateData.price = price;
    }

    // Validate and add stock if provided
    if (stock !== undefined) {
      if (isNaN(stock) || stock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock must be a valid non-negative number',
          error: 'Invalid stock value'
        });
      }
      updateData.stock = stock;
    }

    // Add optional fields
    if (description !== undefined) {
      updateData.description = description;
    }

    if (category !== undefined) {
      updateData.category = category;
    }


    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
        error: 'Empty update data'
      });
    }

    // Update product
    const updatedProduct = await Product.update(productId, updateData);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (err) {
    console.error('Update product error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: err.message
    });
  }
}



/**
 * Delete product
 * DELETE /products/:id
 */
async function deleteProduct(req, res) {
  try {
    const productId = req.params.id;

    // Validate ID
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
        error: 'Invalid product ID'
      });
    }

    // Delete product
    const deleted = await Product.delete(productId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: 'Database error'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        id: productId,
        name: product.name
      }
    });
  } catch (err) {
    console.error('Delete product error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: err.message
    });
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  updateProduct,
  deleteProduct
};
