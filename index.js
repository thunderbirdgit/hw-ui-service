const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3080;

/*
// Retrieve database credentials from environment variables
const pool = new Pool({
  host: '104.198.20.225',
  port: 5432,
  user: 'dev_api_db_creds',
  password: 'idmepostgressqlpw',
  database: 'hello_world_db',
});
*/

// Retrieve database credentials from environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

/*
// Function to query the database
async function queryTable(tableName) {
  try {
    const result = await pool.query(`SELECT * FROM ${tableName}`);
    console.log(result.rows);
  } catch (err) {
    console.error('Error querying the table:', err);
  }
}

// Example usage
queryTable('messages'); // Replace with your table name
*/

app.get('/', async (req, res) => {
    const result = await pool.query('SELECT * FROM messages');
    //res.send(result.rows[0].message);
    res.send(result.rows);
});

app.listen(port, () => {
    console.log(`Node.js app listening at http://localhost:${port}`);
});
