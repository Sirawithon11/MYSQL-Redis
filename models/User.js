const pool = require('../config/database');

class User {
  /**
   * Initialize database table
   */
  static async initTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    try {
      const connection = await pool.getConnection();
      await connection.query(query);
      connection.release();
      console.log('✓ Users table initialized');
    } catch (err) {
      console.error('Error initializing users table:', err);
    }
  }

  /**
   * Create a new user
   * @param {string} username
   * @param {string} password (hashed)
   * @param {string} phone
   * @returns {object} Created user object
   */
  static async create(username, password, phone = null) {
    const query = 'INSERT INTO users (username, password, phone) VALUES (?, ?, ?)';
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(query, [username, password, phone]);
      return {
        id: result.insertId,
        username,
        phone,
        created_at: new Date()
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Find user by ID
   * @param {number} id
   * @returns {object|null} User object or null if not found
   */
  static async findById(id) {
    const query = 'SELECT id, username, password, phone, created_at, updated_at FROM users WHERE id = ?';
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, [id]);
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Find user by username
   * @param {string} username
   * @returns {object|null} User object with password hash or null
   */
  static async findByUsername(username) {
    const query = 'SELECT id, username, password, phone, created_at, updated_at FROM users WHERE username = ?';
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(query, [username]);
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  /**
   * Update user
   * @param {number} id
   * @param {object} updateData { username, password, phone }
   * @returns {object} Updated user object
   */
  static async update(id, updateData) {
    const allowedFields = ['username', 'password', 'phone'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    const connection = await pool.getConnection();
    try {
      await connection.query(query, values);
      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  /**
   * Delete user
   * @param {number} id
   * @returns {boolean} True if deleted
   */
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(query, [id]);
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Check if username exists
   * @param {string} username
   * @returns {boolean}
   */
  static async usernameExists(username) {
    const user = await this.findByUsername(username);
    return user !== null;
  }
}

// Initialize table on module load
User.initTable().catch(err => console.error('Failed to initialize users table:', err));

module.exports = User;
