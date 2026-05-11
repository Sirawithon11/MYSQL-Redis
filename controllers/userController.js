const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken, verifyToken } = require('../utils/tokenUtils');

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

    // Generate access token
    const accessToken = generateToken(newUser);
    req.session.accessToken = accessToken;
    req.session.userId = newUser.id;
    req.session.username = newUser.username;
    // Create refresh token
    RefreshToken.create(newUser.id,'web-client', null, (err, refreshToken) => {
      if (err) {
        console.error('Error creating refresh token:', err);
        return res.status(500).json({
          success: false,
          message: 'Error creating refresh token',
          error: err.message
        });
      }
      
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          id: newUser.id,
          username: newUser.username,
          phone: newUser.phone,
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      });
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
 * Login user
 * POST /users/login
 * Body: { username, password }
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
        error: 'Missing required fields'
      });
    }

    // Find user by username
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
        error: 'User not found'
      });
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
        error: 'Password mismatch'
      });
    }

    // Generate access token
    const accessToken = generateToken(user);
    req.session.accessToken = accessToken;
    req.session.userId = user.id;
    req.session.username = user.username;
    // Create refresh token
    RefreshToken.create(user.id, 'web-client', null, (err, refreshToken) => {
      if (err) {
        console.error('Error creating refresh token:', err);
        return res.status(500).json({
          success: false,
          message: 'Error creating refresh token',
          error: err.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          accessToken: accessToken,
          refreshToken: refreshToken
        }
      });
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error logging in',
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
    if (req.session.userId !== parseInt(userId)) {
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

/**
 * Refresh access token
 * POST /users/refresh
 * Body: { refreshToken }
 */
async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        error: 'Missing refresh token'
      });
    }

    // Fetch refresh token from Redis
    RefreshToken.fetchByToken(refreshToken, async (err, tokenData) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error verifying refresh token',
          error: err.message
        });
      }

      if (!tokenData) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token',
          error: 'Token not found'
        });
      }

      try {
        // Fetch user
        const user = await User.findById(tokenData.userId);
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found',
            error: 'Invalid user ID'
          });
        }

        // Generate new access token
        const newAccessToken = generateToken(user);

        return res.status(200).json({
          success: true,
          message: 'Token refreshed successfully',
          data: {
            accessToken: newAccessToken,
            refreshToken: refreshToken
          }
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: 'Error refreshing token',
          error: err.message
        });
      }
    });
  } catch (err) {
    console.error('Refresh error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error refreshing token',
      error: err.message
    });
  }
}

/**
 * Logout user (revoke refresh token)
 * POST /users/logout
 * Requires: Authentication (JWT token)
 * Body: { refreshToken }
 */
async function logout(req, res) {
  try {
    const userId = req.session.userId;
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
        error: 'Missing refresh token'
      });
    }

    req.session = null;

    // Revoke refresh token from Redis
    RefreshToken.removeByRefreshToken(refreshToken, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error logging out',
          error: err.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        data: { userId: userId }
      });
    });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: err.message
    });
  }
}

module.exports = {
  register,
  login,
  update,
  deleteUser,
  getProfile,
  refresh,
  logout
};
