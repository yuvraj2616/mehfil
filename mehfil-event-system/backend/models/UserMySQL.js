const db = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    constructor(data) {
        Object.assign(this, data);
    }

    // Create a new user
    static async create(userData) {
        const {
            name, email, password, phone, avatar, role,
            bio, city, state, country, lat, lng
        } = userData;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (
                name, email, password, phone, avatar, role,
                bio, city, state, country, lat, lng,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const params = [
            name, email, hashedPassword, phone, avatar, role || 'attendee',
            bio, city, state, country, lat, lng
        ];

        const result = await db.query(sql, params);
        return await User.findById(result.insertId);
    }

    // Find user by ID
    static async findById(id) {
        const sql = 'SELECT * FROM users WHERE id = ? AND is_active = 1';
        const user = await db.queryOne(sql, [id]);
        
        if (!user) return null;
        
        // Parse JSON fields
        user.skills = JSON.parse(user.skills || '[]');
        user.preferences = JSON.parse(user.preferences || '[]');
        
        return new User(user);
    }

    // Find user by email
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
        const user = await db.queryOne(sql, [email]);
        
        if (!user) return null;
        
        // Parse JSON fields
        user.skills = JSON.parse(user.skills || '[]');
        user.preferences = JSON.parse(user.preferences || '[]');
        
        return new User(user);
    }

    // Find all users with filters
    static async findAll(filters = {}) {
        let sql = 'SELECT * FROM users WHERE is_active = 1';
        const params = [];

        if (filters.role) {
            sql += ' AND role = ?';
            params.push(filters.role);
        }

        if (filters.city) {
            sql += ' AND city = ?';
            params.push(filters.city);
        }

        if (filters.verification_status) {
            sql += ' AND verification_status = ?';
            params.push(filters.verification_status);
        }

        sql += ' ORDER BY created_at DESC';

        if (filters.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(filters.limit));
            
            if (filters.offset) {
                sql += ' OFFSET ?';
                params.push(parseInt(filters.offset));
            }
        }

        const users = await db.query(sql, params);
        
        return users.map(user => {
            user.skills = JSON.parse(user.skills || '[]');
            user.preferences = JSON.parse(user.preferences || '[]');
            return new User(user);
        });
    }

    // Update user
    async update(updateData) {
        const allowedFields = [
            'name', 'phone', 'avatar', 'bio', 'city', 'state', 'country', 'lat', 'lng',
            'skills', 'experience', 'price_min', 'price_max', 'price_currency',
            'company_name', 'company_description', 'website', 'facebook_url', 'instagram_url', 'twitter_url',
            'preferences', 'verification_status', 'is_verified'
        ];

        const updates = [];
        const params = [];

        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                
                // Handle JSON fields
                if (['skills', 'preferences'].includes(key)) {
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

        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        await db.query(sql, params);

        return await User.findById(this.id);
    }

    // Update password
    async updatePassword(newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const sql = 'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?';
        await db.query(sql, [hashedPassword, this.id]);
        return true;
    }

    // Verify password
    async verifyPassword(password) {
        return await bcrypt.compare(password, this.password);
    }

    // Deactivate user
    async deactivate() {
        const sql = 'UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?';
        await db.query(sql, [this.id]);
        return true;
    }

    // Update last login
    async updateLastLogin() {
        const sql = 'UPDATE users SET last_login = NOW() WHERE id = ?';
        await db.query(sql, [this.id]);
        return true;
    }

    // Get user statistics
    static async getStats(userId = null) {
        let sql;
        let params = [];

        if (userId) {
            // Individual user stats
            sql = `
                SELECT 
                    u.role,
                    u.total_events,
                    u.total_events_attended,
                    u.rating,
                    u.total_reviews,
                    (SELECT COUNT(*) FROM bookings WHERE user_id = ?) as total_bookings,
                    (SELECT COUNT(*) FROM reviews WHERE user_id = ?) as reviews_given,
                    (SELECT COUNT(*) FROM user_favorites WHERE user_id = ?) as favorite_events
                FROM users u
                WHERE u.id = ?
            `;
            params = [userId, userId, userId, userId];
        } else {
            // Overall platform stats
            sql = `
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN role = 'attendee' THEN 1 END) as attendees,
                    COUNT(CASE WHEN role = 'organizer' THEN 1 END) as organizers,
                    COUNT(CASE WHEN role = 'artist' THEN 1 END) as artists,
                    COUNT(CASE WHEN is_verified = 1 THEN 1 END) as verified_users,
                    COUNT(CASE WHEN last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as active_users
                FROM users
                WHERE is_active = 1
            `;
        }

        return await db.queryOne(sql, params);
    }

    // Search users
    static async search(searchTerm, filters = {}) {
        let sql = `
            SELECT id, name, email, role, city, state, country, rating, company_name
            FROM users 
            WHERE is_active = 1 
            AND (name LIKE ? OR email LIKE ? OR company_name LIKE ?)
        `;
        
        const searchPattern = `%${searchTerm}%`;
        const params = [searchPattern, searchPattern, searchPattern];

        if (filters.role) {
            sql += ' AND role = ?';
            params.push(filters.role);
        }

        if (filters.city) {
            sql += ' AND city = ?';
            params.push(filters.city);
        }

        sql += ' ORDER BY rating DESC, name ASC LIMIT 20';

        const users = await db.query(sql, params);
        return users.map(user => new User(user));
    }

    // Get user's events (for organizers)
    async getEvents() {
        if (this.role !== 'organizer') {
            throw new Error('Only organizers can have events');
        }

        const sql = `
            SELECT * FROM events 
            WHERE organizer_id = ? 
            ORDER BY start_datetime DESC
        `;
        
        return await db.query(sql, [this.id]);
    }

    // Get user's bookings (for attendees)
    async getBookings() {
        const sql = `
            SELECT b.*, e.title as event_title, e.start_datetime, e.venue_name
            FROM bookings b
            JOIN events e ON b.event_id = e.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `;
        
        return await db.query(sql, [this.id]);
    }

    // Get user's reviews
    async getReviews() {
        const sql = `
            SELECT r.*, e.title as event_title
            FROM reviews r
            JOIN events e ON r.event_id = e.id
            WHERE r.user_id = ?
            ORDER BY r.created_at DESC
        `;
        
        return await db.query(sql, [this.id]);
    }

    // Add to favorites
    async addFavorite(eventId) {
        const sql = 'INSERT IGNORE INTO user_favorites (user_id, event_id) VALUES (?, ?)';
        await db.query(sql, [this.id, eventId]);
        return true;
    }

    // Remove from favorites
    async removeFavorite(eventId) {
        const sql = 'DELETE FROM user_favorites WHERE user_id = ? AND event_id = ?';
        await db.query(sql, [this.id, eventId]);
        return true;
    }

    // Get user's favorites
    async getFavorites() {
        const sql = `
            SELECT e.*, uf.created_at as favorited_at
            FROM user_favorites uf
            JOIN events e ON uf.event_id = e.id
            WHERE uf.user_id = ?
            ORDER BY uf.created_at DESC
        `;
        
        return await db.query(sql, [this.id]);
    }

    // Convert to JSON (for API responses, excluding sensitive data)
    toJSON() {
        const obj = { ...this };
        
        // Remove sensitive fields
        delete obj.password;
        delete obj.verification_token;
        delete obj.password_reset_token;
        delete obj.password_reset_expires;
        
        // Use MySQL id as _id for compatibility
        obj._id = obj.id;
        
        // Format profile data for compatibility
        if (obj.role === 'artist') {
            obj.artistProfile = {
                skills: obj.skills || [],
                experience: obj.experience,
                rating: obj.rating,
                totalReviews: obj.total_reviews,
                priceRange: {
                    min: obj.price_min,
                    max: obj.price_max,
                    currency: obj.price_currency
                }
            };
        }
        
        if (obj.role === 'organizer') {
            obj.organizerProfile = {
                companyName: obj.company_name,
                companyDescription: obj.company_description,
                website: obj.website,
                socialMedia: {
                    facebook: obj.facebook_url,
                    instagram: obj.instagram_url,
                    twitter: obj.twitter_url
                },
                rating: obj.organizer_rating,
                totalEvents: obj.total_events,
                verificationStatus: obj.verification_status
            };
        }
        
        if (obj.role === 'attendee') {
            obj.attendeeProfile = {
                preferences: obj.preferences || [],
                totalEventsAttended: obj.total_events_attended
            };
        }
        
        // Location data
        if (obj.city || obj.lat) {
            obj.location = {
                city: obj.city,
                state: obj.state,
                country: obj.country,
                coordinates: {
                    lat: obj.lat,
                    lng: obj.lng
                }
            };
        }
        
        return obj;
    }

    // Convert to public JSON (minimal info for public display)
    toPublicJSON() {
        return {
            _id: this.id,
            id: this.id,
            name: this.name,
            role: this.role,
            city: this.city,
            state: this.state,
            country: this.country,
            rating: this.rating || this.organizer_rating,
            company_name: this.company_name,
            bio: this.bio,
            avatar: this.avatar
        };
    }
}

module.exports = User;
