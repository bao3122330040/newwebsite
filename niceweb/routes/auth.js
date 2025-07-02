const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const authService = require('../auth/authService');
const dbService = require('../services/dbService');

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30),
  email: Joi.string().email(),
  currentPassword: Joi.string().when('newPassword', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  newPassword: Joi.string().min(6)
});

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Access token required',
        code: 'MISSING_TOKEN'
      });
    }

    const decoded = authService.verifyToken(token);
    const user = await dbService.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid token - user not found',
        code: 'INVALID_TOKEN'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({
      error: true,
      message: 'Invalid or expired token',
      code: 'TOKEN_VERIFICATION_FAILED'
    });
  }
};

// POST /api/auth/register - User registration
router.post('/register', async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        details: error.details.map(detail => detail.message),
        code: 'VALIDATION_ERROR'
      });
    }

    const { username, email, password } = value;

    // Check if user already exists
    const existingUserByEmail = await dbService.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({
        error: true,
        message: 'User with this email already exists',
        code: 'EMAIL_EXISTS'
      });
    }

    const existingUserByUsername = await dbService.getUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(409).json({
        error: true,
        message: 'Username already taken',
        code: 'USERNAME_EXISTS'
      });
    }

    // Hash password and create user
    const hashedPassword = await authService.hashPassword(password);
    const newUser = await dbService.createUser(username, email, hashedPassword);

    // Generate JWT token
    const token = authService.signToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          created_at: newUser.created_at
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        details: error.details.map(detail => detail.message),
        code: 'VALIDATION_ERROR'
      });
    }

    const { email, password } = value;

    // Find user by email
    const user = await dbService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const isValidPassword = await authService.comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate JWT token
    const token = authService.signToken({
      userId: user.id,
      username: user.username,
      email: user.email
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at
        },
        token: token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

// POST /api/auth/logout - User logout
router.post('/logout', authenticateToken, (req, res) => {
  // Note: With JWT, logout is typically handled client-side by removing the token
  // For server-side logout, you would need to implement a token blacklist
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// GET /api/auth/profile - Get user profile (protected)
router.get('/profile', authenticateToken, (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          created_at: req.user.created_at
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to retrieve profile',
      code: 'PROFILE_ERROR'
    });
  }
});

// PUT /api/auth/profile - Update user profile (protected)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    // Validate input
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        details: error.details.map(detail => detail.message),
        code: 'VALIDATION_ERROR'
      });
    }

    const { username, email, currentPassword, newPassword } = value;
    const updateFields = {};

    // Check if username is being updated and not taken
    if (username && username !== req.user.username) {
      const existingUser = await dbService.getUserByUsername(username);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(409).json({
          error: true,
          message: 'Username already taken',
          code: 'USERNAME_EXISTS'
        });
      }
      updateFields.username = username;
    }

    // Check if email is being updated and not taken
    if (email && email !== req.user.email) {
      const existingUser = await dbService.getUserByEmail(email);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(409).json({
          error: true,
          message: 'Email already in use',
          code: 'EMAIL_EXISTS'
        });
      }
      updateFields.email = email;
    }

    // Handle password update
    if (newPassword) {
      // Verify current password
      const isCurrentPasswordValid = await authService.comparePassword(
        currentPassword, 
        req.user.password_hash
      );
      
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          error: true,
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Hash new password
      updateFields.password_hash = await authService.hashPassword(newPassword);
    }

    // Update user if there are changes
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        error: true,
        message: 'No changes provided',
        code: 'NO_CHANGES'
      });
    }

    const updatedUser = await dbService.updateUser(req.user.id, updateFields);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          created_at: updatedUser.created_at,
          updated_at: updatedUser.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: true,
      message: error.message || 'Profile update failed',
      code: 'UPDATE_PROFILE_ERROR'
    });
  }
});

// GET /api/auth/verify - Verify token validity
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email
      }
    }
  });
});

module.exports = router;