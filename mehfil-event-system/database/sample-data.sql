-- Sample data for Mehfil Event Management System
-- This file contains sample events and related data

USE mehfil_events;

-- Sample events
INSERT INTO events (
    title, description, category, tags, 
    start_datetime, end_datetime, duration, timezone,
    venue_name, venue_city, venue_country, venue_capacity,
    organizer_id, is_ticketed, ticket_types, status, is_active, published_at
) VALUES 
(
    'Echoes of the Soul - Poetry Night',
    'An intimate evening of contemporary poetry featuring local and visiting poets. Experience the power of spoken word in a cozy, welcoming atmosphere. This monthly gathering celebrates diverse voices and stories from our community.',
    'poetry',
    '["spoken word", "contemporary poetry", "open mic", "community"]',
    '2025-07-15 19:00:00',
    '2025-07-15 22:00:00',
    180,
    'UTC',
    'The Literary Lounge',
    'Los Angeles',
    'USA',
    80,
    2,
    TRUE,
    '[{"name": "General Admission", "price": 15.00, "available": 80}]',
    'published',
    TRUE,
    '2025-06-26 19:41:11'
),
(
    'Rhythms of Unity - World Music Festival',
    'A celebration of global musical traditions featuring artists from diverse cultural backgrounds. Join us for an afternoon of incredible performances, food trucks, and cultural exhibits that showcase the beautiful diversity of our community.',
    'music',
    '["world music", "festival", "multicultural", "outdoor"]',
    '2025-07-22 14:00:00',
    '2025-07-22 21:00:00',
    420,
    'UTC',
    'Harmony Park Amphitheater',
    'Los Angeles',
    'USA',
    500,
    2,
    TRUE,
    '[{"name": "General Admission", "price": 25.00, "available": 400}, {"name": "VIP", "price": 50.00, "available": 100}]',
    'published',
    TRUE,
    '2025-06-26 19:41:11'
),
(
    'Classical Ghazal Evening',
    'Immerse yourself in the timeless beauty of Urdu ghazals performed by renowned artists. This elegant evening features traditional compositions alongside contemporary interpretations, accompanied by classical instruments.',
    'music',
    '["ghazal", "urdu poetry", "classical music", "traditional"]',
    '2025-08-05 18:30:00',
    '2025-08-05 21:30:00',
    180,
    'UTC',
    'Heritage Cultural Center',
    'New York',
    'USA',
    150,
    3,
    TRUE,
    '[{"name": "General Admission", "price": 30.00, "available": 120}, {"name": "Premium", "price": 45.00, "available": 30}]',
    'published',
    TRUE,
    '2025-06-26 19:41:11'
),
(
    'Contemporary Dance Showcase',
    'Experience the evolution of cultural dance through contemporary interpretations. This showcase features choreographers who blend traditional movement with modern expression, creating powerful visual storytelling.',
    'dance',
    '["contemporary dance", "cultural fusion", "choreography", "performance art"]',
    '2025-08-12 19:00:00',
    '2025-08-12 21:00:00',
    120,
    'UTC',
    'Movement Arts Theater',
    'Chicago',
    'USA',
    200,
    2,
    TRUE,
    '[{"name": "General Admission", "price": 20.00, "available": 180}, {"name": "Student", "price": 12.00, "available": 20}]',
    'published',
    TRUE,
    '2025-06-26 19:41:11'
),
(
    'Stories from Home - Cultural Storytelling',
    'An evening dedicated to oral traditions and storytelling from various cultures. Listen to tales passed down through generations, performed by master storytellers who keep these precious traditions alive.',
    'cultural',
    '["storytelling", "oral tradition", "cultural heritage", "family-friendly"]',
    '2025-08-18 17:00:00',
    '2025-08-18 20:00:00',
    180,
    'UTC',
    'Community Stories Hall',
    'San Francisco',
    'USA',
    120,
    2,
    TRUE,
    '[{"name": "General Admission", "price": 18.00, "available": 100}, {"name": "Family Pack (4)", "price": 60.00, "available": 20}]',
    'published',
    TRUE,
    '2025-06-26 19:41:11'
),
(
    'Comedy Night - Cultural Perspectives',
    'Laugh with us as comedians share hilarious takes on cultural experiences, identity, and community life. This evening celebrates humor as a bridge between cultures and generations.',
    'comedy',
    '["stand-up comedy", "cultural humor", "community", "entertainment"]',
    '2025-08-25 20:00:00',
    '2025-08-25 22:30:00',
    150,
    'UTC',
    'Laughs & Culture Club',
    'New York',
    'USA',
    100,
    3,
    TRUE,
    '[{"name": "General Admission", "price": 22.00, "available": 90}, {"name": "VIP Table", "price": 40.00, "available": 10}]',
    'published',
    TRUE,
    '2025-06-26 19:41:11'
);

-- Sample event artists relationships
INSERT INTO event_artists (event_id, artist_id, role, fee, status, invited_at, responded_at) VALUES
(1, 4, 'main performer', 650.00, 'confirmed', '2025-06-01 19:41:11', '2025-06-18 19:41:11'),
(2, 4, 'supporting artist', 300.00, 'confirmed', '2025-06-05 19:41:11', '2025-06-12 19:41:11'),
(3, 4, 'main performer', 550.00, 'confirmed', '2025-06-23 19:41:11', '2025-06-17 19:41:11'),
(4, 4, 'main performer', 400.00, 'confirmed', '2025-06-22 19:41:11', '2025-06-19 19:41:11'),
(5, 4, 'main performer', 500.00, 'confirmed', '2025-06-06 19:41:11', '2025-06-26 19:41:11'),
(6, 4, 'main performer', 550.00, 'confirmed', '2025-05-28 19:41:11', '2025-06-19 19:41:11');

-- Sample bookings
INSERT INTO bookings (
    event_id, user_id, ticket_type, quantity, unit_price, total_amount, 
    status, booking_reference, payment_status, attendee_details
) VALUES
(1, 5, 'General Admission', 2, 15.00, 30.00, 'confirmed', 'MHF001', 'completed', 
 '{"names": ["John Doe", "Jane Doe"], "emails": ["john@example.com"], "phones": ["+1234567890"]}'),
(2, 5, 'General Admission', 1, 25.00, 25.00, 'confirmed', 'MHF002', 'completed',
 '{"names": ["John Doe"], "emails": ["john@example.com"], "phones": ["+1234567890"]}'),
(3, 5, 'Premium', 1, 45.00, 45.00, 'pending', 'MHF003', 'pending',
 '{"names": ["John Doe"], "emails": ["john@example.com"], "phones": ["+1234567890"]}');

-- Sample reviews
INSERT INTO reviews (event_id, user_id, rating, comment, is_verified) VALUES
(1, 5, 5, 'Amazing poetry night! The atmosphere was perfect and the poets were incredibly talented.', TRUE),
(2, 5, 4, 'Great variety of music and food. Would definitely attend again!', TRUE);

-- Sample notifications
INSERT INTO notifications (user_id, title, message, type, event_id) VALUES
(5, 'Booking Confirmed', 'Your booking for "Echoes of the Soul - Poetry Night" has been confirmed!', 'booking', 1),
(5, 'Event Reminder', 'Don\'t forget! "Rhythms of Unity - World Music Festival" is tomorrow.', 'reminder', 2),
(2, 'New Booking', 'You have received a new booking for your event "Echoes of the Soul - Poetry Night".', 'booking', 1);

-- Sample user favorites
INSERT INTO user_favorites (user_id, event_id) VALUES
(5, 1),
(5, 2),
(5, 3);

-- Update event statistics based on sample data
UPDATE events SET 
    total_bookings = (SELECT COUNT(*) FROM bookings WHERE event_id = events.id),
    total_attendees = (SELECT COALESCE(SUM(quantity), 0) FROM bookings WHERE event_id = events.id AND status = 'confirmed'),
    rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE event_id = events.id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE event_id = events.id);

-- Update user statistics
UPDATE users SET 
    total_events = (SELECT COUNT(*) FROM events WHERE organizer_id = users.id AND status = 'published')
WHERE role = 'organizer';

UPDATE users SET 
    total_events_attended = (SELECT COUNT(*) FROM bookings WHERE user_id = users.id AND status = 'confirmed')
WHERE role = 'attendee';
