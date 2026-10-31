const express = require('express');

const app = express();

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