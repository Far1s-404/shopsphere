const express = require('express');
const router = express.Router();

const products = [
    {
        id: 1,
        name: "Gaming Laptop",
        price: 35000,
        stock: 5
    },
    {
        id: 2,
        name: "Wireless Mouse",
        price: 750,
        stock: 20
    }
];

router.get('/', (req,res) => {
    res.status(200).json(products);
});

router.get('/:id',(req,res) => {
    const productId = Number(req.params.id);

    const product = products.find(p => p.id === productId);
    
    if(!product) {
        return res.status(404).json({ message: 'product not found' });
    }

    res.status(200).json(product);
});


router.post('/', (req,res) => {
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

    const newProduct = {
    id: products.length + 1,
    name,
    price,
    stock
    }
    products.push(newProduct);
    res.status(201).json(newProduct);
})


router.put('/:id', (req,res) => {
    const productId = Number(req.params.id);
    const product = products.find(p => p.id === productId);

    if(!product) {
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

    product.name = name;
    product.price = price;
    product.stock = stock;

    res.status(200).json({ message: 'product updated successfully', product });

})


router.delete('/:id', (req,res) => {
    const productId = Number(req.params.id);
    const productIndex = products.findIndex(p => p.id === productId);

    if (productIndex === -1) {
        return res.status(404).json({ message: 'product not found' });
    }

    products.splice(productIndex, 1);
    res.status(200).json({ message: 'product deleted successfully' });
});

module.exports = router;
