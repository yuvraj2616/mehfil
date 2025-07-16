const mysql = require('mysql2/promise');
require('dotenv').config();

async function testMySQLConnection() {
    console.log('🔍 Testing MySQL connection...');
    console.log('Configuration:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Port: ${process.env.DB_PORT || 3306}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
    console.log(`   Password: ${process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]'}`);
    
    try {
        // Try to connect without password first (common in development)
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });
        
        console.log('✅ MySQL connection successful!');
        
        // Test basic query
        const [rows] = await connection.execute('SELECT VERSION() as version, NOW() as current_time');
        console.log(`📊 MySQL Version: ${rows[0].version}`);
        console.log(`🕒 Server Time: ${rows[0].current_time}`);
        
        // Check if our database exists
        const [databases] = await connection.execute('SHOW DATABASES LIKE ?', ['mehfil_events']);
        if (databases.length > 0) {
            console.log('📚 Database "mehfil_events" already exists');
        } else {
            console.log('📚 Database "mehfil_events" does not exist - will be created');
        }
        
        await connection.end();
        return true;
        
    } catch (error) {
        console.log('❌ MySQL connection failed');
        console.log('Error:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Suggestions:');
            console.log('   1. Make sure MySQL is running');
            console.log('   2. Check your MySQL username/password');
            console.log('   3. If using XAMPP, try without password');
            console.log('   4. Update .env file with correct credentials');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Suggestions:');
            console.log('   1. Make sure MySQL server is running');
            console.log('   2. Check if port 3306 is correct');
            console.log('   3. Try starting MySQL service');
        }
        
        return false;
    }
}

// Alternative: Create a simple in-memory database for testing
async function createSimpleInMemoryDB() {
    console.log('\n🔄 Creating simple in-memory database for testing...');
    
    // We can use SQLite as a fallback for development
    const Database = require('better-sqlite3');
    const db = new Database(':memory:');
    
    // Create a simple events table
    db.exec(`
        CREATE TABLE events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            start_datetime TEXT NOT NULL,
            end_datetime TEXT NOT NULL,
            venue_name TEXT NOT NULL,
            venue_city TEXT NOT NULL,
            venue_country TEXT NOT NULL,
            venue_capacity INTEGER NOT NULL,
            organizer_id INTEGER DEFAULT 1,
            status TEXT DEFAULT 'published',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Insert sample data
    const insert = db.prepare(`
        INSERT INTO events (title, description, category, start_datetime, end_datetime, venue_name, venue_city, venue_country, venue_capacity)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const sampleEvents = [
        ['Echoes of the Soul - Poetry Night', 'An intimate evening of contemporary poetry', 'poetry', '2025-07-15 19:00:00', '2025-07-15 22:00:00', 'The Literary Lounge', 'Los Angeles', 'USA', 80],
        ['Rhythms of Unity - World Music Festival', 'A celebration of global musical traditions', 'music', '2025-07-22 14:00:00', '2025-07-22 21:00:00', 'Harmony Park Amphitheater', 'Los Angeles', 'USA', 500],
        ['Classical Ghazal Evening', 'Immerse yourself in the timeless beauty of Urdu ghazals', 'music', '2025-08-05 18:30:00', '2025-08-05 21:30:00', 'Heritage Cultural Center', 'New York', 'USA', 150]
    ];
    
    sampleEvents.forEach(event => insert.run(...event));
    
    console.log('✅ In-memory database created with sample data');
    
    // Test query
    const events = db.prepare('SELECT * FROM events').all();
    console.log(`📊 Sample events created: ${events.length}`);
    
    return db;
}

if (require.main === module) {
    testMySQLConnection()
        .then(async (success) => {
            if (success) {
                console.log('\n🎉 MySQL is ready! You can now run:');
                console.log('   node scripts/setup-database.js');
                console.log('   node server-mysql.js');
            } else {
                console.log('\n⚠️ MySQL is not available. Options:');
                console.log('   1. Install and configure MySQL (see MYSQL_SETUP_GUIDE.md)');
                console.log('   2. Use SQLite fallback for development');
                console.log('   3. Continue with MongoDB (current working setup)');
                
                // For now, let's continue with the existing MongoDB setup
                console.log('\n🔄 Recommendation: Continue with current MongoDB setup');
                console.log('   The existing server is working. MySQL can be set up later.');
            }
        })
        .catch(console.error);
}

module.exports = { testMySQLConnection, createSimpleInMemoryDB };
