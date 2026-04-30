const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => console.error('Unexpected PostgreSQL idle client error', err));

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
