const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mehfil_events',
    charset: 'utf8mb4',
    timezone: '+00:00',
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Create connection pool for better performance
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL database connected successfully');
        
        // Test query
        const [rows] = await connection.execute('SELECT VERSION() as version');
        console.log(`📊 MySQL version: ${rows[0].version}`);
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        return false;
    }
}

// Helper function to execute queries
async function query(sql, params = []) {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Helper function to get a single record
async function queryOne(sql, params = []) {
    const results = await query(sql, params);
    return results.length > 0 ? results[0] : null;
}

// Helper function for transactions
async function transaction(callback) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Closing MySQL connection pool...');
    await pool.end();
    process.exit(0);
});

module.exports = {
    pool,
    query,
    queryOne,
    transaction,
    testConnection
};
