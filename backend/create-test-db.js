// Script to create the test database
const { Client } = require('pg');
require('dotenv').config();

async function createTestDB() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'root',
        database: 'postgres' // connect to default DB first
    });

    try {
        await client.connect();
        const dbName = process.env.TEST_DB_NAME || 'webprajita_test_db';

        // Check if DB already exists
        const result = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]
        );

        if (result.rows.length === 0) {
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database "${dbName}" created successfully!`);
        } else {
            console.log(`Database "${dbName}" already exists.`);
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.end();
    }
}

createTestDB();
