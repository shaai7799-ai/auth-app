-- setup-database.sql
-- Run this file once to create the database and users table

-- Step 1: Create the database (run this in psql as postgres user)
-- CREATE DATABASE auth_db;

-- Step 2: Connect to auth_db then run the rest
-- \c auth_db

-- Step 3: Create users table
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,           -- Auto-incrementing ID
  name        VARCHAR(100) NOT NULL,        -- User's full name
  email       VARCHAR(255) UNIQUE NOT NULL, -- Email must be unique
  password    VARCHAR(255) NOT NULL,        -- Hashed password (never store plain text!)
  created_at  TIMESTAMP DEFAULT NOW()       -- When the account was created
);

-- Confirm it worked
SELECT 'Users table created successfully!' AS message;
