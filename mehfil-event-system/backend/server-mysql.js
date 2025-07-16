const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/database");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection on startup
async function initializeServer() {
    console.log("🚀 Starting Mehfil Event System (MySQL Edition)...");
    
    const dbConnected = await db.testConnection();
    if (!dbConnected) {
        console.error("❌ Failed to connect to MySQL database");
        process.exit(1);
    }
    
    console.log("✅ Database connection established");
}

// Root route
app.get("/", (req, res) => {
    res.json({
        message: "Mehfil Event System API (MySQL Edition)",
        version: "2.0.0",
        status: "running",
        database: "MySQL",
        timestamp: new Date().toISOString()
    });
});

// Health check route
app.get("/health", async (req, res) => {
    try {
        // Test database connection
        await db.query('SELECT 1');
        
        res.json({
            status: "healthy",
            database: "connected",
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(500).json({
            status: "unhealthy",
            database: "disconnected",
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// API Routes

// Events Routes
app.get("/api/events", async (req, res) => {
    try {
        const Event = require("./models/EventMySQL");
        
        const {
            category,
            city,
            status = 'published',
            organizer_id,
            date_from,
            date_to,
            limit = 50,
            offset = 0
        } = req.query;

        const filters = {
            category,
            city,
            status,
            organizer_id,
            date_from,
            date_to,
            limit: parseInt(limit),
            offset: parseInt(offset)
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined || filters[key] === '') {
                delete filters[key];
            }
        });

        const events = await Event.findAll(filters);
        
        res.json(events.map(event => event.toJSON()));
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({
            error: "Failed to fetch events",
            message: error.message
        });
    }
});

// Get single event
app.get("/api/events/:id", async (req, res) => {
    try {
        const Event = require("./models/EventMySQL");
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        
        res.json(event.toJSON());
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({
            error: "Failed to fetch event",
            message: error.message
        });
    }
});

// Create new event
app.post("/api/events", async (req, res) => {
    try {
        const Event = require("./models/EventMySQL");
        const event = await Event.create(req.body);
        
        res.status(201).json(event.toJSON());
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(400).json({
            error: "Failed to create event",
            message: error.message
        });
    }
});

// Update event
app.put("/api/events/:id", async (req, res) => {
    try {
        const Event = require("./models/EventMySQL");
        let event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        
        event = await event.update(req.body);
        res.json(event.toJSON());
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(400).json({
            error: "Failed to update event",
            message: error.message
        });
    }
});

// Delete event
app.delete("/api/events/:id", async (req, res) => {
    try {
        const Event = require("./models/EventMySQL");
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        
        await event.delete();
        res.json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({
            error: "Failed to delete event",
            message: error.message
        });
    }
});

// Search events
app.get("/api/events/search/:term", async (req, res) => {
    try {
        const Event = require("./models/EventMySQL");
        const { term } = req.params;
        const { category } = req.query;
        
        const events = await Event.search(term, { category });
        
        res.json(events.map(event => event.toJSON()));
    } catch (error) {
        console.error("Error searching events:", error);
        res.status(500).json({
            error: "Failed to search events",
            message: error.message
        });
    }
});

// Event statistics
app.get("/api/events/stats", async (req, res) => {
    try {
        const Event = require("./models/EventMySQL");
        const { organizer_id } = req.query;
        
        const stats = await Event.getStats(organizer_id);
        
        res.json(stats);
    } catch (error) {
        console.error("Error fetching event stats:", error);
        res.status(500).json({
            error: "Failed to fetch event statistics",
            message: error.message
        });
    }
});

// Users Routes
app.get("/api/users", async (req, res) => {
    try {
        const User = require("./models/UserMySQL");
        
        const {
            role,
            city,
            verification_status,
            limit = 50,
            offset = 0
        } = req.query;

        const filters = {
            role,
            city,
            verification_status,
            limit: parseInt(limit),
            offset: parseInt(offset)
        };

        // Remove undefined filters
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined || filters[key] === '') {
                delete filters[key];
            }
        });

        const users = await User.findAll(filters);
        
        res.json(users.map(user => user.toPublicJSON()));
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            error: "Failed to fetch users",
            message: error.message
        });
    }
});

// Get single user
app.get("/api/users/:id", async (req, res) => {
    try {
        const User = require("./models/UserMySQL");
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.json(user.toPublicJSON());
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            error: "Failed to fetch user",
            message: error.message
        });
    }
});

// Database management routes (for development)
app.get("/api/database/init", async (req, res) => {
    try {
        const fs = require('fs').promises;
        const path = require('path');
        
        // Read and execute schema
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = await fs.readFile(schemaPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = schema.split(';').filter(stmt => stmt.trim());
        
        for (let statement of statements) {
            if (statement.trim()) {
                await db.query(statement);
            }
        }
        
        res.json({ message: "Database schema initialized successfully" });
    } catch (error) {
        console.error("Error initializing database:", error);
        res.status(500).json({
            error: "Failed to initialize database",
            message: error.message
        });
    }
});

app.get("/api/database/seed", async (req, res) => {
    try {
        const fs = require('fs').promises;
        const path = require('path');
        
        // Read and execute sample data
        const dataPath = path.join(__dirname, '../database/sample-data.sql');
        const sampleData = await fs.readFile(dataPath, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sampleData.split(';').filter(stmt => stmt.trim());
        
        for (let statement of statements) {
            if (statement.trim()) {
                await db.query(statement);
            }
        }
        
        res.json({ message: "Sample data inserted successfully" });
    } catch (error) {
        console.error("Error seeding database:", error);
        res.status(500).json({
            error: "Failed to seed database",
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        error: "Internal server error",
        message: err.message
    });
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({
        error: "Route not found",
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Start server
async function startServer() {
    await initializeServer();
    
    app.listen(PORT, () => {
        console.log(`🌟 Server running on port ${PORT}`);
        console.log(`📍 API available at: http://localhost:${PORT}/api`);
        console.log(`🔍 Health check: http://localhost:${PORT}/health`);
        console.log(`📚 Database: MySQL`);
    });
}

startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});

module.exports = app;
