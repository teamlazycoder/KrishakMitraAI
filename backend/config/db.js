const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'krishak_mitra',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.stack);
  } else {
    console.log('✅ Database connected successfully');
    release();
  }
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

// Helper function for queries (auto-commits)
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query:', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', { text, error: error.message });
    throw error;
  }
}

// Get a client for transactions
async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query;
  const originalRelease = client.release;
  
  // Track transaction state
  let isInTransaction = false;
  
  client.query = async (text, params) => {
    try {
      const result = await originalQuery.call(client, text, params);
      return result;
    } catch (err) {
      if (isInTransaction) {
        await originalQuery.call(client, 'ROLLBACK');
        isInTransaction = false;
      }
      throw err;
    }
  };
  
  client.begin = async () => {
    await originalQuery.call(client, 'BEGIN');
    isInTransaction = true;
  };
  
  client.commit = async () => {
    await originalQuery.call(client, 'COMMIT');
    isInTransaction = false;
  };
  
  client.rollback = async () => {
    await originalQuery.call(client, 'ROLLBACK');
    isInTransaction = false;
  };
  
  client.release = () => {
    if (isInTransaction) {
      console.error('Warning: Transaction not committed before release!');
      originalQuery.call(client, 'ROLLBACK').catch(console.error);
    }
    originalRelease.call(client);
  };
  
  return client;
}

module.exports = {
  query,        // Use for single queries (auto-commit)
  getClient,    // Use for multiple queries (transactions)
  pool
};