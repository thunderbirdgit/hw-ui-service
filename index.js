const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3080;

// Retrieve database credentials from environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.get('/', async (req, res) => {
    const result = await pool.query('SELECT * FROM messages');
    res.send(result.rows);
});

app.listen(port, () => {
    console.log(`Node.js app listening at http://localhost:${port}`);
});
