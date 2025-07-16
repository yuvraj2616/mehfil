// Simple Mock API Server for Frontend Testing
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Mock event data
const mockEvents = [
    {
        _id: '1',
        title: 'Urdu Poetry Night',
        category: 'poetry',
        description: 'An evening dedicated to the beauty of Urdu poetry with renowned poets sharing their work.',
        dateTime: {
            start: new Date('2025-07-15T19:00:00Z'),
            end: new Date('2025-07-15T22:00:00Z')
        },
        venue: {
            name: 'Cultural Center Auditorium',
            address: '123 Main Street, City Center',
            capacity: 200
        },
        organizer: {
            name: 'Poetry Society',
            email: 'contact@poetrysociety.com'
        },
        ticketing: {
            ticketTypes: [
                { name: 'General', price: 25, available: 150 },
                { name: 'VIP', price: 50, available: 50 }
            ]
        },
        image: 'assets/images/poetry-night.jpg'
    },
    {
        _id: '2',
        title: 'Classical Music Concert',
        category: 'music',
        description: 'Experience the enchanting melodies of classical music performed by talented musicians.',
        dateTime: {
            start: new Date('2025-07-20T20:00:00Z'),
            end: new Date('2025-07-20T23:00:00Z')
        },
        venue: {
            name: 'Grand Concert Hall',
            address: '456 Arts Avenue, Downtown',
            capacity: 500
        },
        organizer: {
            name: 'Music Academy',
            email: 'info@musicacademy.com'
        },
        ticketing: {
            ticketTypes: [
                { name: 'Regular', price: 30, available: 400 },
                { name: 'Premium', price: 75, available: 100 }
            ]
        },
        image: 'assets/images/classical-music.jpg'
    },
    {
        _id: '3',
        title: 'Dance Performance',
        category: 'dance',
        description: 'A vibrant showcase of traditional and contemporary dance forms.',
        dateTime: {
            start: new Date('2025-07-25T18:00:00Z'),
            end: new Date('2025-07-25T21:00:00Z')
        },
        venue: {
            name: 'Dance Studio Theater',
            address: '789 Performance Lane',
            capacity: 150
        },
        organizer: {
            name: 'Dance Collective',
            email: 'contact@dancecollective.com'
        },
        ticketing: {
            ticketTypes: [
                { name: 'Standard', price: 20, available: 120 },
                { name: 'VIP', price: 40, available: 30 }
            ]
        },
        image: 'assets/images/dance-performance.jpg'
    },
    {
        _id: '4',
        title: 'Cultural Festival',
        category: 'cultural',
        description: 'A celebration of diverse cultures with food, music, and traditional performances.',
        dateTime: {
            start: new Date('2025-08-01T16:00:00Z'),
            end: new Date('2025-08-01T23:00:00Z')
        },
        venue: {
            name: 'City Park Amphitheater',
            address: 'Central Park, Main District',
            capacity: 1000
        },
        organizer: {
            name: 'Cultural Society',
            email: 'events@culturalsociety.org'
        },
        ticketing: {
            ticketTypes: [
                { name: 'General', price: 15, available: 800 },
                { name: 'Family Pack', price: 50, available: 200 }
            ]
        },
        image: 'assets/images/cultural-festival.jpg'
    },
    {
        _id: '5',
        title: 'Theater Drama',
        category: 'theater',
        description: 'A compelling dramatic performance by award-winning theater artists.',
        dateTime: {
            start: new Date('2025-08-05T19:30:00Z'),
            end: new Date('2025-08-05T22:30:00Z')
        },
        venue: {
            name: 'Drama Theater',
            address: '321 Theater Street',
            capacity: 300
        },
        organizer: {
            name: 'Theater Group',
            email: 'booking@theatergroup.com'
        },
        ticketing: {
            ticketTypes: [
                { name: 'Regular', price: 35, available: 250 },
                { name: 'Premium', price: 60, available: 50 }
            ]
        },
        image: 'assets/images/theater-drama.jpg'
    },
    {
        _id: '6',
        title: 'Comedy Night',
        category: 'comedy',
        description: 'An evening full of laughter with stand-up comedians and entertainment.',
        dateTime: {
            start: new Date('2025-08-10T20:00:00Z'),
            end: new Date('2025-08-10T23:00:00Z')
        },
        venue: {
            name: 'Comedy Club',
            address: '654 Laughter Lane',
            capacity: 100
        },
        organizer: {
            name: 'Comedy Central',
            email: 'shows@comedycentral.com'
        },
        ticketing: {
            ticketTypes: [
                { name: 'General', price: 25, available: 80 },
                { name: 'VIP', price: 45, available: 20 }
            ]
        },
        image: 'assets/images/comedy-night.jpg'
    }
];

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Mehfil Mock API Server is running!' });
});

app.get('/api/events', (req, res) => {
    console.log('GET /api/events requested');
    
    // Support query parameters
    let events = [...mockEvents];
    
    if (req.query.category) {
        events = events.filter(event => event.category === req.query.category);
    }
    
    if (req.query.featured) {
        events = events.slice(0, 6); // Return first 6 as featured
    }
    
    if (req.query.limit) {
        events = events.slice(0, parseInt(req.query.limit));
    }
    
    res.json(events);
});

app.get('/api/events/:id', (req, res) => {
    console.log(`GET /api/events/${req.params.id} requested`);
    const event = mockEvents.find(e => e._id === req.params.id);
    
    if (event) {
        res.json(event);
    } else {
        res.status(404).json({ error: 'Event not found' });
    }
});

// Other API endpoints for testing
app.get('/api/users/profile', (req, res) => {
    res.json({ 
        _id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'attendee'
    });
});

app.post('/api/users/login', (req, res) => {
    res.json({
        success: true,
        data: {
            token: 'mock-jwt-token',
            user: {
                _id: 'user1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'attendee'
            }
        }
    });
});

app.get('/api/notifications/unread-count', (req, res) => {
    res.json({ count: 3 });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎭 Mehfil Mock API Server running on http://localhost:${PORT}`);
    console.log(`Available endpoints:`);
    console.log(`  GET  /api/events`);
    console.log(`  GET  /api/events/:id`);
    console.log(`  GET  /api/users/profile`);
    console.log(`  POST /api/users/login`);
    console.log(`  GET  /api/notifications/unread-count`);
});
