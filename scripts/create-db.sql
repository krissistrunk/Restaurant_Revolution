-- Create database for Restaurant Revolution v3
-- Run this as postgres superuser: psql -U postgres -f scripts/create-db.sql

-- Create database
CREATE DATABASE restaurant_revolution;

-- Create user (optional - for production)
-- CREATE USER restaurant_user WITH PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE restaurant_revolution TO restaurant_user;