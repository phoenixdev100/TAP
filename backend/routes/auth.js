const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Signup route
router.post('/signup', async (req, res) => {
    try {
        console.log('Signup request received:', { body: { ...req.body, password: '***' } });
        const { username, email, password, role } = req.body;

        // Input validation
        if (!username || !email || !password || !role) {
            console.log('Validation failed:', { username, email, password: !!password, role });
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate role
        const validRoles = ['student', 'teacher', 'college_admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            console.log('User already exists:', { email, username });
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            role
        });

        await user.save();
        console.log('User created successfully:', { userId: user._id });

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Generate refresh token (longer expiry)
        const refreshToken = jwt.sign(
            { userId: user._id, type: 'refresh' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            token,
            refreshToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Signup error details:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating user. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        console.log('Login request received:', { body: { ...req.body, password: '***' } });
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            console.log('Validation failed:', { email, password: !!password });
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', { email });
            return res.status(401).json({
                success: false,
                message: 'Account not found. Please check your email or sign up.'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch for user:', { email });
            return res.status(401).json({
                success: false,
                message: 'Incorrect password. Please try again.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Generate refresh token (longer expiry)
        const refreshToken = jwt.sign(
            { userId: user._id, type: 'refresh' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('Login successful:', { userId: user._id });
        res.json({
            success: true,
            message: 'Login successful',
            token,
            refreshToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error details:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 