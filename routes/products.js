const express = require('express');
const router = express.Router();
const pool = require('../src/config/db');


router.get('/', async (req,res) => {
    const result = await pool.query('SELECT * FROM products');
    res.status(200).json(result.rows);
});

router.get('/:id', async (req,res) => {
    const productId = Number(req.params.id);

    const product = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    
    if(product.rows.length === 0) {
        return res.status(404).json({ message: 'product not found' });
    }

    res.status(200).json(product.rows[0]);
});


router.post('/', async (req,res) => {
    const {name,price,stock} = req.body;
    if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof price !== 'number' ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isInteger(stock) ||
    stock < 0
) {
    return res.status(400).json({
        message: 'Invalid product data'
    });
}

    const result = await pool.query(
        'INSERT INTO products (name, price, stock) VALUES ($1, $2, $3) RETURNING *',
        [name, price, stock]
    );
    res.status(201).json(result.rows[0]);
})


router.put('/:id', async (req,res) => {
    const productId = Number(req.params.id);
    const product = await pool.query('SELECT * FROM products WHERE id = $1',[productId]);

    if(product.rows.length === 0) {
        return res.status(404).json({ message: 'product not found' });
    }
    const {name,price,stock} = req.body;
    
if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof price !== 'number' ||
    price <= 0 ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    !Number.isFinite(price)
) {
    return res.status(400).json({
        message: 'Invalid product data'
    });
}

    const updatedProduct = await pool.query(
        'UPDATE products SET name =$1, price = $2, stock = $3 WHERE id = $4 RETURNING *',
        [name, price, stock, productId]
    );

    res.status(200).json({ message: 'product updated successfully', product: updatedProduct.rows[0] });

})


router.delete('/:id', async (req,res) => {
    const productId = Number(req.params.id);
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);

    if (product.rows.length === 0) {
        return res.status(404).json({ message: 'product not found' });
    }

    await pool.query('DELETE FROM products WHERE id = $1', [productId]);
    res.status(200).json({ message: 'product deleted successfully' });
});

module.exports = router;
