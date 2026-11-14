const express = require('express');

const pool = require('../src/config/db');

const app = express();

pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Database connected successfully!');
        console.log('Database time:', result.rows[0].now);
    }
});

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API!' });
});


const productRoutes = require('../routes/products');
app.use('/products', productRoutes);


const PORT = 3000
app.listen(PORT, () => {
    console.log(`ShopSphere is running on port ${PORT}`);
})