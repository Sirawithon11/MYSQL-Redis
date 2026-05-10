const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/tokenUtils');

/**
 * Register new user
 * POST /users/register
 * Body: { username, password, phone }
 */
async function register(req, res) {
  try {
    const { username, password, phone } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
        error: 'Missing required fields'
      });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Username must be between 3 and 30 characters',
        error: 'Invalid username length'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
        error: 'Password too weak'
      });
    }

    // Check if username already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists',
        error: 'Duplicate username'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await User.create(username, hashedPassword, phone || null);

    // Generate token
    const token = generateToken(newUser);
    req.session.token = token;
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        username: newUser.username,
        phone: newUser.phone,
        Token:token
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: err.message
    });
  }
}

/**
 * Update user
 * PUT /users/:id
 * Body: { username?, password?, phone? }
 * Requires: Authentication (JWT token)
 */
async function update(req, res) {
  try {
    const userId = req.params.id;
    const { username, password, phone } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'Invalid user ID'
      });
    }

    

    // Prepare update data
    const updateData = {};

    // Validate and add username if provided
    if (username !== undefined) {
      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({
          success: false,
          message: 'Username must be between 3 and 30 characters',
          error: 'Invalid username length'
        });
      }
      // Check if new username already exists (and is different from current)
      if (username !== user.username) {
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'Username already exists',
            error: 'Duplicate username'
          });
        }
      }
      updateData.username = username;
    }

    // Validate and hash password if provided
    if (password !== undefined) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
          error: 'Password too weak'
        });
      }
      const hashedPassword = await hashPassword(password);
      updateData.password = hashedPassword;
    }

    // Add phone if provided
    if (phone !== undefined) {
      updateData.phone = phone;
    }

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
        error: 'Empty update data'
      });
    }

    // Update user
    const updatedUser = await User.update(userId, updateData);

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (err) {
    console.error('Update error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: err.message
    });
  }
}

/**
 * Delete user
 * DELETE /users/:id
 * Requires: Authentication (JWT token)
 */
async function deleteUser(req, res) {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'Invalid user ID'
      });
    }

    // Authorization: User can only delete their own profile
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this user',
        error: 'Permission denied'
      });
    }

    // Delete user
    const deleted = await User.delete(userId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete user',
        error: 'Delete operation failed'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: { id: userId }
    });
  } catch (err) {
    console.error('Delete error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: err.message
    });
  }
}

/**
 * Get user profile
 * GET /users/:id
 * Requires: Authentication (JWT token)
 */
async function getProfile(req, res) {
  try {
    const userId = req.params.id;
    console.log('Get profile for user ID:', userId);
    // Fetch user data
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        error: 'Invalid user ID'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User profile deleted successfully',
      data: user
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving user profile',
      error: err.message
    });
  }
}

module.exports = {
  register,
  update,
  deleteUser,
  getProfile
};
