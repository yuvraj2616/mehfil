const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    console.log('🚀 Setting up MySQL database for Mehfil Event System...');
    
    // First, connect without specifying database to create it
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        charset: 'utf8mb4'
    });
    
    try {
        // Create database if it doesn't exist
        console.log('📚 Creating database...');
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'mehfil_events'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log('✅ Database created successfully');
        
        // Use the database
        await connection.execute(`USE ${process.env.DB_NAME || 'mehfil_events'}`);
        
        // Read and execute schema
        console.log('📋 Creating tables...');
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = schema.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
        
        for (let statement of statements) {
            const trimmed = statement.trim();
            if (trimmed && !trimmed.startsWith('USE') && !trimmed.startsWith('CREATE DATABASE')) {
                try {
                    await connection.execute(trimmed);
                } catch (error) {
                    if (!error.message.includes('already exists')) {
                        console.warn('Warning executing statement:', error.message);
                    }
                }
            }
        }
        
        console.log('✅ Tables created successfully');
        
        // Check if we should seed with sample data
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM events');
        if (rows[0].count === 0) {
            console.log('🌱 Inserting sample data...');
            
            const dataPath = path.join(__dirname, '../database/sample-data.sql');
            const sampleData = await fs.readFile(dataPath, 'utf8');
            
            const dataStatements = sampleData.split(';').filter(stmt => stmt.trim() && !stmt.trim().startsWith('--'));
            
            for (let statement of dataStatements) {
                const trimmed = statement.trim();
                if (trimmed && !trimmed.startsWith('USE')) {
                    try {
                        await connection.execute(trimmed);
                    } catch (error) {
                        console.warn('Warning inserting data:', error.message);
                    }
                }
            }
            
            console.log('✅ Sample data inserted successfully');
        } else {
            console.log('ℹ️ Database already contains data, skipping sample data insertion');
        }
        
        // Verify setup
        console.log('🔍 Verifying setup...');
        const [eventCount] = await connection.execute('SELECT COUNT(*) as count FROM events');
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
        
        console.log(`📊 Setup complete!`);
        console.log(`   • Events: ${eventCount[0].count}`);
        console.log(`   • Users: ${userCount[0].count}`);
        console.log(`   • Database: ${process.env.DB_NAME || 'mehfil_events'}`);
        console.log(`   • Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

// Run setup if called directly
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('🎉 Database setup completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Database setup failed:', error);
            process.exit(1);
        });
}

module.exports = setupDatabase;
