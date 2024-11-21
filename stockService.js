const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const fetch = require('node-fetch');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const app = express();
app.use(bodyParser.json());

const logAction = async (product_id, shop_id, action, details) => {
    try {
        await fetch('http://localhost:4000/product-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id, shop_id, action, details }),
        });
    } catch (err) {
        console.error('Failed to log action:', err.message);
    }
};

// Создание товара
app.post('/products', async (req, res) => {
    const { plu, name } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (plu, name) VALUES ($1, $2) RETURNING *',
            [plu, name]
        );
        const createdProduct = result.rows[0];
        await logAction(createdProduct.id, null, 'CREATE_PRODUCT', `Product ${createdProduct.name} created`);
        res.json(createdProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Создание остатка
app.post('/stocks', async (req, res) => {
    const { product_id, shop_id, shelf_quantity, order_quantity } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO stocks (product_id, shop_id, shelf_quantity, order_quantity) VALUES ($1, $2, $3, $4) RETURNING *',
            [product_id, shop_id, shelf_quantity, order_quantity]
        );
        const createdStock = result.rows[0];
        await logAction(product_id, shop_id, 'CREATE_STOCK', `Stock created with shelf quantity ${shelf_quantity}`);
        res.json(createdStock);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Увеличение остатка
app.patch('/stocks/increase', async (req, res) => {
    const { product_id, shop_id, shelf_quantity } = req.body;
    try {
        const result = await pool.query(
            'UPDATE stocks SET shelf_quantity = shelf_quantity + $3 WHERE product_id = $1 AND shop_id = $2 RETURNING *',
            [product_id, shop_id, shelf_quantity]
        );
        const updatedStock = result.rows[0];
        await logAction(product_id, shop_id, 'INCREASE_STOCK', `Stock increased by ${shelf_quantity}`);
        res.json(updatedStock);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Уменьшение остатка
app.patch('/stocks/decrease', async (req, res) => {
    const { product_id, shop_id, shelf_quantity } = req.body;
    try {
        const result = await pool.query(
            'UPDATE stocks SET shelf_quantity = shelf_quantity - $3 WHERE product_id = $1 AND shop_id = $2 RETURNING *',
            [product_id, shop_id, shelf_quantity]
        );
        const updatedStock = result.rows[0];
        await logAction(product_id, shop_id, 'DECREASE_STOCK', `Stock decreased by ${shelf_quantity}`);
        res.json(updatedStock);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Получение остатков по фильтрам
app.get('/stocks', async (req, res) => {
    const { plu, shop_id, shelf_quantity_from, shelf_quantity_to, order_quantity_from, order_quantity_to } = req.query;

    try {
        
        const query = `
            SELECT stocks.*, products.plu, products.name 
            FROM stocks
            JOIN products ON stocks.product_id = products.id
            WHERE 
                ($1::VARCHAR IS NULL OR products.plu = $1)
                AND ($2::INTEGER IS NULL OR stocks.shop_id = $2)
                AND ($3::INTEGER IS NULL OR stocks.shelf_quantity >= $3)
                AND ($4::INTEGER IS NULL OR stocks.shelf_quantity <= $4)
                AND ($5::INTEGER IS NULL OR stocks.order_quantity >= $5)
                AND ($6::INTEGER IS NULL OR stocks.order_quantity <= $6)
        `;
        
        
        const result = await pool.query(query, [
            plu ? plu : null,
            shop_id ? shop_id : null,
            shelf_quantity_from ? shelf_quantity_from : null,
            shelf_quantity_to ? shelf_quantity_to : null,
            order_quantity_from ? order_quantity_from : null,
            order_quantity_to ? order_quantity_to : null,
        ]);

        
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// Получение товаров по фильтрам
// Получение товаров по фильтрам
app.get('/products', async (req, res) => {
    const { name, plu } = req.query;
    try {
        const query = `SELECT * FROM products
                       WHERE ($1::VARCHAR IS NULL OR name LIKE $1)
                         AND ($2::VARCHAR IS NULL OR plu = $2)`;

        const result = await pool.query(query, [`%${name || ''}%`, plu || '']);
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});







app.listen(3000, () => {
    console.log('Stock service running on port 3000');
});
