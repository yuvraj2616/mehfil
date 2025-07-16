# MySQL Database Setup Guide for Mehfil Event System

## Prerequisites

1. **Install MySQL Server**
   - Download MySQL from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP: https://www.apachefriends.org/download.html
   - Or install via package manager:
     ```bash
     # Windows (using Chocolatey)
     choco install mysql
     
     # macOS (using Homebrew)
     brew install mysql
     
     # Ubuntu/Debian
     sudo apt-get install mysql-server
     ```

2. **Start MySQL Service**
   - Windows: Start MySQL service from Services or XAMPP Control Panel
   - macOS: `brew services start mysql`
   - Linux: `sudo systemctl start mysql`

## Quick Setup Options

### Option 1: Using XAMPP (Recommended for Development)
1. Download and install XAMPP from https://www.apachefriends.org/
2. Start XAMPP Control Panel
3. Start Apache and MySQL services
4. Open phpMyAdmin at http://localhost/phpmyadmin
5. Default credentials: username `root`, no password

### Option 2: MySQL Workbench
1. Download MySQL Workbench from https://dev.mysql.com/downloads/workbench/
2. Connect to localhost with username `root`
3. Create the database manually or use our setup script

### Option 3: Command Line
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE mehfil_events CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional, for security)
CREATE USER 'mehfil_user'@'localhost' IDENTIFIED BY 'mehfil_password';
GRANT ALL PRIVILEGES ON mehfil_events.* TO 'mehfil_user'@'localhost';
FLUSH PRIVILEGES;
```

## Configuration

Update your `.env` file with your MySQL credentials:

```env
# MySQL Configuration
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=mehfil_events
```

## Running the Setup

After MySQL is installed and running:

```bash
# Navigate to backend directory
cd backend

# Run the database setup script
node scripts/setup-database.js

# Start the MySQL-powered server
node server-mysql.js
```

## Verification

1. Check if database was created:
   ```sql
   SHOW DATABASES;
   USE mehfil_events;
   SHOW TABLES;
   ```

2. Test the API:
   ```bash
   curl http://localhost:5000/api/events
   ```

## Troubleshooting

### Common Issues:

1. **Access Denied Error**
   - Make sure MySQL is running
   - Check username/password in .env file
   - Try connecting with MySQL Workbench first

2. **Connection Refused**
   - MySQL service is not running
   - Wrong port (default is 3306)
   - Firewall blocking connection

3. **Database Already Exists**
   - Safe to ignore, setup will continue
   - To start fresh: `DROP DATABASE mehfil_events;`

### Reset Database:
```bash
# To completely reset
node scripts/setup-database.js --reset
```

## Production Notes

For production deployment:
1. Use a dedicated MySQL user (not root)
2. Set a strong password
3. Configure SSL connections
4. Set up regular backups
5. Monitor performance and optimize queries

## Next Steps

After successful setup:
1. Test API endpoints
2. Update frontend to use new MySQL backend
3. Run the application and verify event loading
4. Consider adding authentication and authorization
