const pool = require('../config/database');

class Product {
  /**
   * Initialize database table
   */
  static async initTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        stock INT DEFAULT 0,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    try {
      const connection = await pool.getConnection();
      await connection.query(query);
      connection.release();
      console.log('✓ Products table initialized');
    } catch (err) {
      console.error('Error initializing products table:', err);
    }
  }

  /**
   * Create a new product
   * @param {string} name
   * @param {string} description
   * @param {number} price
   * @param {number} stock
   * @param {string} category
   * @returns {object} Created product object
   */
  static async create(name, description, price, stock, category ) {
    const query = 'INSERT INTO products (name, description, price, stock, category) VALUES ( ?, ?, ?, ?, ?)';
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(query, [name, description, price, stock, category]);
      return {
        id: result.insertId,
        name,
        description,
        price,
        stock,
        category,
        created_at: new Date()
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Find product by ID
   * @param {number} id
   * @returns {object|null} Product object or null if not found
   */
  static async findById(id) {
    const query = 'SELECT id, name, description, price, stock, category, created_at, updated_at FROM products WHERE id = ?';
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Find product by name
   * @param {string} name
   * @returns {object|null} Product object or null
   */
  static async findByName(name) {
    const query = 'SELECT id, name, description, price, stock, category, created_at, updated_at FROM products WHERE name = ?';
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, [name]);
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all products (with pagination)
   * @param {number} limit
   * @param {number} offset
   * @returns {array} Array of products
   */
  static async getAll(limit = 10, offset = 0) {
    const query = 'SELECT id, name, description, price, stock, category, created_at, updated_at FROM products LIMIT ? OFFSET ?';
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, [limit, offset]);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Get products by category
   * @param {string} category
   * @returns {array} Array of products
   */
  static async getByCategory(category) {
    const query = 'SELECT id, name, description, price, stock, category, created_at, updated_at FROM products WHERE category = ?';
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, [category]);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Update product
   * @param {number} id
   * @param {object} updateData { name, description, price, stock, category }
   * @returns {object} Updated product object
   */
  static async update(id, updateData) {
    const allowedFields = ['name', 'description', 'price', 'stock', 'category'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
    const connection = await pool.getConnection();
    try {
      await connection.query(query, values);
      return await this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Delete product
   * @param {number} id
   * @returns {boolean} true if deleted, false otherwise
   */
  static async delete(id) {
    const query = 'DELETE FROM products WHERE id = ?';
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(query, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Get total count of products
   * @returns {number} Total count
   */
  static async getTotalCount() {
    const query = 'SELECT COUNT(*) as total FROM products';
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query);
      return rows[0].total;
    } finally {
      connection.release();
    }
  }

  
}

module.exports = Product;
