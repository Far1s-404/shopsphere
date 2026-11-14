const express = require('express');
const router = express.Router();
const pool = require('../src/config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ==========================================
// REGISTER ROUTE
// ==========================================
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (
        typeof name !== 'string' ||
        !name.trim() ||
        typeof email !== 'string' ||
        !email.trim() ||
        typeof password !== 'string' ||
        !password.trim()
    ) {
        return res.status(400).json({
            message: 'Invalid or missing user data'
        });
    }
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            message: 'Invalid email format'
        });
    }

    try {
        // 1. Check if user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // 2. Hash password and insert new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, hashedPassword]
        );

        const newUser = result.rows[0];

        // 3. Create payload and sign the JWT token
        const payload = {
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role
        };

        const token = jwt.sign(payload, 'YOUR_SUPER_SECRET_KEY', { expiresIn: '1h' });

        // 4. Remove password from object before sending response
        delete newUser.password;

        // 5. Send back success response with user and token
        return res.status(201).json({
            message: 'User registered successfully',
            user: newUser,
            token: token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});


// ==========================================
// LOGIN ROUTE
// ==========================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (
        typeof email !== 'string' ||
        !email.trim() ||
        typeof password !== 'string' ||
        !password.trim()
    ) {
        return res.status(400).json({
            message: 'Invalid or missing user data'
        });
    }

    try {
        // 1. Find user by email
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = userResult.rows[0];

        // 2. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 3. Create payload and sign JWT token
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, 'YOUR_SUPER_SECRET_KEY', { expiresIn: '1h' });

        // 4. Send success response with token
        return res.status(200).json({ 
            message: 'Login successful',
            token: token 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;