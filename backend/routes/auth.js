const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Input validation and sanitization helper
const validateAndSanitize = {
  // Sanitize string inputs
  string: (input, maxLength = 1000) => {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, maxLength);
  },
  
  // Validate email format
  email: (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = validateAndSanitize.string(input, 255);
    return emailRegex.test(sanitized) ? sanitized : null;
  },
  
  // Validate username format
  username: (input) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    const sanitized = validateAndSanitize.string(input, 30);
    return usernameRegex.test(sanitized) ? sanitized : null;
  },
  
  // Validate password
  password: (input) => {
    if (typeof input !== 'string' || input.length < 6 || input.length > 128) {
      return null;
    }
    return input;
  },
  
  // Validate role
  role: (input) => {
    const validRoles = ['student', 'teacher', 'college_admin'];
    return validRoles.includes(input) ? input : null;
  }
};

// Rate limiting storage (in production, use Redis or similar)
const loginAttempts = new Map();
const signupAttempts = new Map();

// Clean up old attempts (run periodically)
setInterval(() => {
  const now = Date.now();
  const cleanup = (attemptsMap) => {
    for (const [key, attempts] of attemptsMap.entries()) {
      if (now - attempts.firstAttempt > 15 * 60 * 1000) { // 15 minutes
        attemptsMap.delete(key);
      }
    }
  };
  cleanup(loginAttempts);
  cleanup(signupAttempts);
}, 5 * 60 * 1000); // Every 5 minutes

// Rate limiting middleware
const rateLimit = (attemptsMap, maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip + ':' + (req.body.email || req.body.username || 'unknown');
    const now = Date.now();
    const attempts = attemptsMap.get(key);

    if (!attempts) {
      attemptsMap.set(key, { count: 1, firstAttempt: now });
      return next();
    }

    if (now - attempts.firstAttempt > windowMs) {
      attemptsMap.set(key, { count: 1, firstAttempt: now });
      return next();
    }

    if (attempts.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Too many attempts. Please try again later.'
      });
    }

    attempts.count++;
    next();
  };
};

// Signup route
router.post('/signup', rateLimit(signupAttempts), async (req, res) => {
    try {
        console.log('Signup request received:', { 
            body: { 
                email: req.body.email, 
                username: req.body.username, 
                password: '***',
                role: req.body.role
            } 
        });
        
        const { username, email, password, role } = req.body;

        // Input validation and sanitization
        const sanitizedUsername = validateAndSanitize.username(username);
        const sanitizedEmail = validateAndSanitize.email(email);
        const sanitizedPassword = validateAndSanitize.password(password);
        const sanitizedRole = validateAndSanitize.role(role);

        // Check validation results
        if (!sanitizedUsername || !sanitizedEmail || !sanitizedPassword || !sanitizedRole) {
            console.log('Validation failed:', { 
                username: sanitizedUsername ? 'valid' : 'invalid',
                email: sanitizedEmail ? 'valid' : 'invalid',
                password: sanitizedPassword ? 'valid' : 'invalid',
                role: sanitizedRole ? 'valid' : 'invalid'
            });
            return res.status(400).json({
                success: false,
                message: 'Invalid input data. Please check all fields.'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: sanitizedEmail }, 
                { username: sanitizedUsername }
            ] 
        });
        
        if (existingUser) {
            console.log('User already exists:', { 
                email: sanitizedEmail, 
                username: sanitizedUsername 
            });
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Create new user
        const user = new User({
            username: sanitizedUsername,
            email: sanitizedEmail,
            password: sanitizedPassword,
            role: sanitizedRole
        });

        await user.save();
        console.log('User created successfully:', { 
            userId: user._id,
            role: user.role
        });

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error in signup:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user'
        });
    }
});

// Login route
router.post('/login', rateLimit(loginAttempts), async (req, res) => {
    try {
        console.log('Login request received:', { 
            body: { 
                email: req.body.email, 
                password: '***'
            } 
        });
        
        const { email, password } = req.body;

        // Input validation and sanitization
        const sanitizedEmail = validateAndSanitize.email(email);
        const sanitizedPassword = validateAndSanitize.password(password);

        if (!sanitizedEmail || !sanitizedPassword) {
            console.log('Login validation failed:', { 
                email: sanitizedEmail ? 'valid' : 'invalid',
                password: sanitizedPassword ? 'valid' : 'invalid'
            });
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password format'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: sanitizedEmail });
        if (!user) {
            console.log('User not found:', { email: sanitizedEmail });
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(sanitizedPassword);
        if (!isMatch) {
            console.log('Password mismatch:', { email: sanitizedEmail });
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        console.log('Login successful:', { 
            userId: user._id, 
            role: user.role 
        });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login'
        });
    }
});

// Get current user info
router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error in /me endpoint:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error fetching user info'
        });
    }
});

// Update user profile
router.put('/profile', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        const { username, email } = req.body;

        // Validate and sanitize inputs
        const sanitizedUsername = username ? validateAndSanitize.username(username) : user.username;
        const sanitizedEmail = email ? validateAndSanitize.email(email) : user.email;

        // Check if new username/email is already taken by another user
        if (sanitizedUsername !== user.username || sanitizedEmail !== user.email) {
            const existingUser = await User.findOne({
                $and: [
                    { _id: { $ne: user._id } },
                    { $or: [{ email: sanitizedEmail }, { username: sanitizedUsername }] }
                ]
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username or email already taken'
                });
            }
        }

        // Update user
        if (sanitizedUsername) user.username = sanitizedUsername;
        if (sanitizedEmail) user.email = sanitizedEmail;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error updating profile'
        });
    }
});

// Change password
router.put('/password', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Validate and sanitize inputs
        const sanitizedCurrentPassword = validateAndSanitize.password(currentPassword);
        const sanitizedNewPassword = validateAndSanitize.password(newPassword);

        if (!sanitizedCurrentPassword || !sanitizedNewPassword) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password format'
            });
        }

        // Check current password
        const isMatch = await user.comparePassword(sanitizedCurrentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = sanitizedNewPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Error changing password:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error changing password'
        });
    }
});

// Logout route (client-side token removal)
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

module.exports = router;
