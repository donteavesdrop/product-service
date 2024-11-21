import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Pool } from 'pg';
require('dotenv').config();

// Применение переменных окружения
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

const app = express();
app.use(bodyParser.json());

// Логирование действия
app.post('/product-history', async (req: Request, res: Response) => {
    const { product_id, shop_id, action, details } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO product_history (product_id, shop_id, action, details) VALUES ($1, $2, $3, $4) RETURNING *',
            [product_id, shop_id, action, details]
        );
        res.json(result.rows[0]);
    } catch (err: unknown) { 
        if (err instanceof Error) { 
            res.status(500).send(err.message); 
        } else {
            res.status(500).send('Unknown error occurred'); 
        }
    }
});

// Получение истории по фильтрам и пагинации
app.get('/product-history', async (req: Request, res: Response) => {
    const { shop_id, plu, date_from, date_to, action, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    try {
        const query = `SELECT * FROM product_history
                       JOIN products ON product_history.product_id = products.id
                       WHERE ($1::INTEGER IS NULL OR product_history.shop_id = $1)
                         AND ($2::VARCHAR IS NULL OR products.plu = $2)
                         AND ($3::DATE IS NULL OR product_history.action_date >= $3)
                         AND ($4::DATE IS NULL OR product_history.action_date <= $4)
                         AND ($5::VARCHAR IS NULL OR product_history.action = $5)
                       ORDER BY action_date DESC
                       LIMIT $6 OFFSET $7`;
        const result = await pool.query(query, [shop_id, plu, date_from, date_to, action, limit, offset]);
        res.json(result.rows);
    } catch (err: unknown) { 
        if (err instanceof Error) { 
            res.status(500).send(err.message); 
        } else {
            res.status(500).send('Unknown error occurred'); 
        }
    }
});

app.listen(4000, () => {
    console.log('History service running on port 4000');
});
