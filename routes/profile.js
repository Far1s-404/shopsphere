const express = require('express');
const router = express.Router();
const pool = require('../src/config/db');
const verifyToken = require('../middleware/auth');

router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [userId]);
        return res.status(200).json(result.rows[0]);
        
    
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching user profile.' });
    }

})

module.exports = router;