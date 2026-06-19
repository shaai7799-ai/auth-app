// db.js - This file connects our app to PostgreSQL

const { Pool } = require('pg');
require('dotenv').config();

// Pool manages multiple database connections efficiently
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }, // Required for Neon cloud PostgreSQL
});

// Test the connection when the app starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.message);
    console.error('   Check your .env file and make sure PostgreSQL is running');
  } else {
    console.log('✅ Connected to PostgreSQL database successfully!');
    release(); // Release the connection back to the pool
  }
});

module.exports = pool;
