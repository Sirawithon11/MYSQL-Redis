const pool = require('../config/database');

class Purchase {
  /**
   * Initialize database table
   */
  static async initTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS purchases (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        price_per_unit DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_product_id (product_id),
        INDEX idx_status (status)
      )
    `;
    try {
      const connection = await pool.getConnection();
      await connection.query(query);
      connection.release();
      console.log('✓ Purchases table initialized');
    } catch (err) {
      console.error('Error initializing purchases table:', err);
    }
  }

  /**
   * Create a new purchase
   * @param {number} user_id
   * @param {number} product_id
   * @param {number} quantity
   * @param {number} price_per_unit
   * @param {string} payment_method
   * @param {string} notes
   * @returns {object} Created purchase object
   */
  static async create(user_id, product_id, quantity, price_per_unit, payment_method = null, notes = null) {
    const total_price = quantity * price_per_unit;
    const query = `
      INSERT INTO purchases (user_id, product_id, quantity, price_per_unit, total_price, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(query, [
        user_id,
        product_id,
        quantity,
        price_per_unit,
        total_price,
        payment_method,
        notes
      ]);
      return {
        id: result.insertId,
        user_id,
        product_id,
        quantity,
        price_per_unit,
        total_price,
        payment_method,
        notes,
        created_at: new Date()
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Find purchase by ID
   * @param {number} id
   * @returns {object|null} Purchase object or null
   */
  static async findById(id) {
    const query = `
      SELECT p.*,
             u.username,
             pr.name as product_name
      FROM purchases p
      JOIN users u ON p.user_id = u.id
      JOIN products pr ON p.product_id = pr.id
      WHERE p.id = ?
    `;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all purchases (with pagination)
   * @param {number} limit
   * @param {number} offset
   * @returns {array} Array of purchases
   */
  static async getAll(limit = 10, offset = 0) {
    const query = `
      SELECT p.*,
             u.username,
             pr.name as product_name
      FROM purchases p
      JOIN users u ON p.user_id = u.id
      JOIN products pr ON p.product_id = pr.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, [limit, offset]);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Get purchases by user ID
   * @param {number} user_id
   * @param {number} limit
   * @param {number} offset
   * @returns {array} Array of purchases
   */
  static async getByUserId(user_id, limit = 10, offset = 0) {
    const query = `
      SELECT p.*,
             u.username,
             pr.name as product_name
      FROM purchases p
      JOIN users u ON p.user_id = u.id
      JOIN products pr ON p.product_id = pr.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, [user_id, limit, offset]);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Get purchases by product ID
   * @param {number} product_id
   * @param {number} limit
   * @param {number} offset
   * @returns {array} Array of purchases
   */
  static async getByProductId(product_id, limit = 10, offset = 0) {
    const query = `
      SELECT p.*,
             u.username,
             pr.name as product_name
      FROM purchases p
      JOIN users u ON p.user_id = u.id
      JOIN products pr ON p.product_id = pr.id
      WHERE p.product_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, [product_id, limit, offset]);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Get purchases by status
   * @param {string} status - 'pending', 'completed', or 'cancelled'
   * @param {number} limit
   * @param {number} offset
   * @returns {array} Array of purchases
   */
  static async getByStatus(status, limit = 10, offset = 0) {
    const query = `
      SELECT p.*,
             u.username,
             pr.name as product_name
      FROM purchases p
      JOIN users u ON p.user_id = u.id
      JOIN products pr ON p.product_id = pr.id
      WHERE p.status = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, [status, limit, offset]);
      return rows;
    } finally {
      connection.release();
    }
  }

  /**
   * Update purchase
   * @param {number} id
   * @param {object} updateData { quantity, price_per_unit, status, payment_method, notes }
   * @returns {object} Updated purchase object
   */
  static async update(id, updateData) {
    const allowedFields = ['quantity', 'price_per_unit', 'status', 'payment_method', 'notes'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    // Recalculate total_price if quantity or price_per_unit changed
    if (updateData.quantity !== undefined || updateData.price_per_unit !== undefined) {
      const purchase = await this.findById(id);
      const newQuantity = updateData.quantity !== undefined ? updateData.quantity : purchase.quantity;
      const newPrice = updateData.price_per_unit !== undefined ? updateData.price_per_unit : purchase.price_per_unit;
      updates.push('total_price = ?');
      values.push(newQuantity * newPrice);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    values.push(id);
    const query = `UPDATE purchases SET ${updates.join(', ')} WHERE id = ?`;
    const connection = await pool.getConnection();
    try {
      await connection.query(query, values);
      return await this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Update purchase status
   * @param {number} id
   * @param {string} status - 'pending', 'completed', or 'cancelled'
   * @returns {object} Updated purchase object
   */
  static async updateStatus(id, status) {
    const validStatuses = ['pending', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status. Must be: pending, completed, or cancelled');
    }

    const query = 'UPDATE purchases SET status = ? WHERE id = ?';
    const connection = await pool.getConnection();
    try {
      await connection.query(query, [status, id]);
      return await this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Delete purchase
   * @param {number} id
   * @returns {boolean} true if deleted, false otherwise
   */
  static async delete(id) {
    const query = 'DELETE FROM purchases WHERE id = ?';
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(query, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Get total count of purchases
   * @returns {number} Total count
   */
  static async getTotalCount() {
    const query = 'SELECT COUNT(*) as total FROM purchases';
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query);
      return rows[0].total;
    } finally {
      connection.release();
    }
  }

  /**
   * Get total count of purchases by user
   * @param {number} user_id
   * @returns {number} Total count
   */
  static async getCountByUserId(user_id) {
    const query = 'SELECT COUNT(*) as total FROM purchases WHERE user_id = ?';
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, [user_id]);
      return rows[0].total;
    } finally {
      connection.release();
    }
  }

  /**
   * Get purchase summary for user
   * @param {number} user_id
   * @returns {object} Purchase statistics
   */
  static async getUserSummary(user_id) {
    const query = `
      SELECT 
        COUNT(*) as total_purchases,
        SUM(quantity) as total_items,
        SUM(total_price) as total_spent,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_purchases,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_purchases,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_purchases
      FROM purchases
      WHERE user_id = ?
    `;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, [user_id]);
      return rows[0];
    } finally {
      connection.release();
    }
  }

  /**
   * Get product sales summary
   * @param {number} product_id
   * @returns {object} Sales statistics
   */
  static async getProductSummary(product_id) {
    const query = `
      SELECT 
        COUNT(*) as total_sales,
        SUM(quantity) as total_units_sold,
        SUM(total_price) as total_revenue,
        AVG(total_price) as average_order_value
      FROM purchases
      WHERE product_id = ? AND status = 'completed'
    `;
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, [product_id]);
      return rows[0];
    } finally {
      connection.release();
    }
  }
}

module.exports = Purchase;
