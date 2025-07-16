const db = require('../config/database');

class Event {
    constructor(data) {
        Object.assign(this, data);
    }

    // Create a new event
    static async create(eventData) {
        const {
            title, description, category, tags,
            start_datetime, end_datetime, duration, timezone,
            venue_name, venue_street, venue_city, venue_state, venue_country, venue_zip_code,
            venue_lat, venue_lng, venue_capacity, venue_amenities, venue_accessibility,
            organizer_id, images, videos, is_ticketed, ticket_types,
            refundable, refund_percentage
        } = eventData;

        const sql = `
            INSERT INTO events (
                title, description, category, tags,
                start_datetime, end_datetime, duration, timezone,
                venue_name, venue_street, venue_city, venue_state, venue_country, venue_zip_code,
                venue_lat, venue_lng, venue_capacity, venue_amenities, venue_accessibility,
                organizer_id, images, videos, is_ticketed, ticket_types,
                refundable, refund_percentage, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const params = [
            title, description, category, JSON.stringify(tags || []),
            start_datetime, end_datetime, duration, timezone || 'UTC',
            venue_name, venue_street, venue_city, venue_state, venue_country, venue_zip_code,
            venue_lat, venue_lng, venue_capacity, 
            JSON.stringify(venue_amenities || []), 
            JSON.stringify(venue_accessibility || []),
            organizer_id, 
            JSON.stringify(images || []), 
            JSON.stringify(videos || []),
            is_ticketed || false, 
            JSON.stringify(ticket_types || []),
            refundable !== false, 
            refund_percentage || 100, 
            'draft'
        ];

        const result = await db.query(sql, params);
        return await Event.findById(result.insertId);
    }

    // Find event by ID
    static async findById(id) {
        const sql = `
            SELECT e.*, u.name as organizer_name, u.email as organizer_email
            FROM events e
            LEFT JOIN users u ON e.organizer_id = u.id
            WHERE e.id = ?
        `;
        const event = await db.queryOne(sql, [id]);
        
        if (!event) return null;
        
        // Parse JSON fields
        event.tags = JSON.parse(event.tags || '[]');
        event.venue_amenities = JSON.parse(event.venue_amenities || '[]');
        event.venue_accessibility = JSON.parse(event.venue_accessibility || '[]');
        event.images = JSON.parse(event.images || '[]');
        event.videos = JSON.parse(event.videos || '[]');
        event.ticket_types = JSON.parse(event.ticket_types || '[]');
        
        // Get event artists
        event.artists = await Event.getEventArtists(id);
        
        return new Event(event);
    }

    // Find all events with optional filters
    static async findAll(filters = {}) {
        let sql = `
            SELECT e.*, u.name as organizer_name, u.email as organizer_email
            FROM events e
            LEFT JOIN users u ON e.organizer_id = u.id
            WHERE e.is_active = 1
        `;
        const params = [];

        // Add filters
        if (filters.category) {
            sql += ' AND e.category = ?';
            params.push(filters.category);
        }

        if (filters.city) {
            sql += ' AND e.venue_city = ?';
            params.push(filters.city);
        }

        if (filters.status) {
            sql += ' AND e.status = ?';
            params.push(filters.status);
        }

        if (filters.organizer_id) {
            sql += ' AND e.organizer_id = ?';
            params.push(filters.organizer_id);
        }

        if (filters.date_from) {
            sql += ' AND e.start_datetime >= ?';
            params.push(filters.date_from);
        }

        if (filters.date_to) {
            sql += ' AND e.start_datetime <= ?';
            params.push(filters.date_to);
        }

        // Default ordering
        sql += ' ORDER BY e.start_datetime ASC';

        // Pagination
        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filters.limit));
            
            if (filters.offset) {
                sql += ' OFFSET ?';
                params.push(parseInt(filters.offset));
            }
        }

        const events = await db.query(sql, params);
        
        // Process each event
        const processedEvents = await Promise.all(events.map(async (event) => {
            // Parse JSON fields
            event.tags = JSON.parse(event.tags || '[]');
            event.venue_amenities = JSON.parse(event.venue_amenities || '[]');
            event.venue_accessibility = JSON.parse(event.venue_accessibility || '[]');
            event.images = JSON.parse(event.images || '[]');
            event.videos = JSON.parse(event.videos || '[]');
            event.ticket_types = JSON.parse(event.ticket_types || '[]');
            
            // Get event artists
            event.artists = await Event.getEventArtists(event.id);
            
            return new Event(event);
        }));

        return processedEvents;
    }

    // Get event artists
    static async getEventArtists(eventId) {
        const sql = `
            SELECT ea.*, u.name as artist_name, u.email as artist_email
            FROM event_artists ea
            LEFT JOIN users u ON ea.artist_id = u.id
            WHERE ea.event_id = ?
            ORDER BY ea.role DESC, ea.fee DESC
        `;
        return await db.query(sql, [eventId]);
    }

    // Update event
    async update(updateData) {
        const allowedFields = [
            'title', 'description', 'category', 'tags',
            'start_datetime', 'end_datetime', 'duration', 'timezone',
            'venue_name', 'venue_street', 'venue_city', 'venue_state', 'venue_country', 'venue_zip_code',
            'venue_lat', 'venue_lng', 'venue_capacity', 'venue_amenities', 'venue_accessibility',
            'images', 'videos', 'is_ticketed', 'ticket_types',
            'status', 'is_featured', 'refundable', 'refund_percentage'
        ];

        const updates = [];
        const params = [];

        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                
                // Handle JSON fields
                if (['tags', 'venue_amenities', 'venue_accessibility', 'images', 'videos', 'ticket_types'].includes(key)) {
                    params.push(JSON.stringify(updateData[key]));
                } else {
                    params.push(updateData[key]);
                }
            }
        });

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        updates.push('updated_at = NOW()');
        params.push(this.id);

        const sql = `UPDATE events SET ${updates.join(', ')} WHERE id = ?`;
        await db.query(sql, params);

        return await Event.findById(this.id);
    }

    // Delete event
    async delete() {
        const sql = 'DELETE FROM events WHERE id = ?';
        await db.query(sql, [this.id]);
        return true;
    }

    // Publish event
    async publish() {
        const sql = 'UPDATE events SET status = ?, published_at = NOW() WHERE id = ?';
        await db.query(sql, ['published', this.id]);
        return await Event.findById(this.id);
    }

    // Add artist to event
    async addArtist(artistId, role = 'performer', fee = 0) {
        const sql = `
            INSERT INTO event_artists (event_id, artist_id, role, fee, status)
            VALUES (?, ?, ?, ?, 'pending')
        `;
        await db.query(sql, [this.id, artistId, role, fee]);
        return true;
    }

    // Remove artist from event
    async removeArtist(artistId) {
        const sql = 'DELETE FROM event_artists WHERE event_id = ? AND artist_id = ?';
        await db.query(sql, [this.id, artistId]);
        return true;
    }

    // Get event statistics
    static async getStats(organizerId = null) {
        let sql = `
            SELECT 
                COUNT(*) as total_events,
                COUNT(CASE WHEN status = 'published' THEN 1 END) as published_events,
                COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_events,
                COUNT(CASE WHEN start_datetime > NOW() THEN 1 END) as upcoming_events,
                AVG(rating) as avg_rating,
                SUM(total_bookings) as total_bookings,
                SUM(total_attendees) as total_attendees
            FROM events
            WHERE is_active = 1
        `;
        const params = [];

        if (organizerId) {
            sql += ' AND organizer_id = ?';
            params.push(organizerId);
        }

        return await db.queryOne(sql, params);
    }

    // Search events
    static async search(searchTerm, filters = {}) {
        let sql = `
            SELECT e.*, u.name as organizer_name
            FROM events e
            LEFT JOIN users u ON e.organizer_id = u.id
            WHERE e.is_active = 1 AND e.status = 'published'
            AND (
                e.title LIKE ? OR 
                e.description LIKE ? OR 
                e.venue_name LIKE ? OR 
                e.venue_city LIKE ?
            )
        `;
        
        const searchPattern = `%${searchTerm}%`;
        const params = [searchPattern, searchPattern, searchPattern, searchPattern];

        // Add category filter
        if (filters.category) {
            sql += ' AND e.category = ?';
            params.push(filters.category);
        }

        sql += ' ORDER BY e.start_datetime ASC LIMIT 20';

        const events = await db.query(sql, params);
        
        // Process events
        return await Promise.all(events.map(async (event) => {
            event.tags = JSON.parse(event.tags || '[]');
            event.venue_amenities = JSON.parse(event.venue_amenities || '[]');
            event.venue_accessibility = JSON.parse(event.venue_accessibility || '[]');
            event.images = JSON.parse(event.images || '[]');
            event.videos = JSON.parse(event.videos || '[]');
            event.ticket_types = JSON.parse(event.ticket_types || '[]');
            event.artists = await Event.getEventArtists(event.id);
            return new Event(event);
        }));
    }

    // Convert to JSON (for API responses)
    toJSON() {
        const obj = { ...this };
        
        // Format for MongoDB compatibility (keeping the old structure)
        if (obj.start_datetime || obj.end_datetime) {
            obj.dateTime = {
                start: obj.start_datetime,
                end: obj.end_datetime
            };
        }
        
        if (obj.venue_name) {
            obj.venue = {
                name: obj.venue_name,
                address: {
                    street: obj.venue_street,
                    city: obj.venue_city,
                    state: obj.venue_state,
                    country: obj.venue_country,
                    zipCode: obj.venue_zip_code,
                    coordinates: {
                        lat: obj.venue_lat,
                        lng: obj.venue_lng
                    }
                },
                capacity: obj.venue_capacity,
                amenities: obj.venue_amenities || [],
                accessibility: obj.venue_accessibility || []
            };
        }
        
        if (obj.is_ticketed !== undefined) {
            obj.ticketing = {
                isTicketed: obj.is_ticketed,
                ticketTypes: obj.ticket_types || []
            };
        }
        
        // Add organizer info
        if (obj.organizer_name) {
            obj.organizer = {
                _id: obj.organizer_id,
                name: obj.organizer_name,
                email: obj.organizer_email
            };
        }
        
        // Use MySQL id as _id for compatibility
        obj._id = obj.id;
        
        return obj;
    }
}

module.exports = Event;
