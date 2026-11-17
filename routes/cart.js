const express = require('express');
const router = express.Router();
const pool = require('../src/config/db');
const verifyToken = require('../middleware/auth')


router.get('/', verifyToken, async (req, res) => {
    try {
        const cartItems = await pool.query('SELECT * FROM cart_items WHERE user_id = $1' , [req.user.userId]);
        res.json(cartItems.rows);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
})

router.post('/', verifyToken, async (req, res) => {
    const { product_id, quantity = 1 } = req.body;

    if (quantity <= 0 || !Number.isInteger(quantity)) {
        return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }
    if (!product_id || !Number.isInteger(product_id)) {
        return res.status(400).json({ message: 'Product ID must be a valid integer' });
    }
    try {
        const product = await pool.query('SELECT * FROM products WHERE id = $1', [product_id]);
        if (product.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        if (quantity > product.rows[0].stock) {
            return res.status(400).json({ message: 'Only ' + product.rows[0].stock + ' items available' });
        }
        const addCartItem = await pool.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity', [req.user.userId, product_id, quantity]);
        
        return res.status(201).json({ message: 'Item added to cart' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
    })


router.delete('/:id', verifyToken, async (req,res) => {
    const productId = req.params.id
    if (!Number.isInteger(productId) || productId <= 0) {
        return res.status(400).json({message : 'Invalid product ID'})
    }
    try {
        
        const deletedItem = await pool.query('DELETE FROM cart_items WHERE product_id = $1 AND user_id = $2 RETURNING *' , [productId,req.user.userId])
        if (deletedItem.rows.length == 0) {
            return res.status(404).json({message : 'Item not found in cart!'})
        }
        return res.status(200).json({message: 'Selected items deleted sucessfully'})
    } catch (error) {
        console.error(error);
        return res.status(500).json({message : 'Internal server error'})
    }

})
    


module.exports = router;