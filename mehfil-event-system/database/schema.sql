-- Mehfil Event Management System - MySQL Database Schema
-- Created: June 28, 2025

-- Create database
CREATE DATABASE IF NOT EXISTS mehfil_events 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE mehfil_events;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(500),
    role ENUM('admin', 'organizer', 'artist', 'attendee') DEFAULT 'attendee',
    bio TEXT,
    
    -- Location information
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    
    -- Artist profile
    skills JSON,
    experience TEXT,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    price_min DECIMAL(10, 2),
    price_max DECIMAL(10, 2),
    price_currency VARCHAR(3) DEFAULT 'USD',
    
    -- Organizer profile
    company_name VARCHAR(255),
    company_description TEXT,
    website VARCHAR(500),
    facebook_url VARCHAR(500),
    instagram_url VARCHAR(500),
    twitter_url VARCHAR(500),
    organizer_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_events INT DEFAULT 0,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    
    -- Attendee profile
    preferences JSON,
    total_events_attended INT DEFAULT 0,
    
    -- Account status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires DATETIME,
    last_login DATETIME,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_city (city),
    INDEX idx_verification (verification_status)
);

-- Events table
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('poetry', 'music', 'dance', 'cultural', 'literary', 'comedy', 'theater', 'other') NOT NULL,
    tags JSON,
    
    -- Scheduling
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    duration INT, -- in minutes
    timezone VARCHAR(50) DEFAULT 'UTC',
    
    -- Venue information
    venue_name VARCHAR(255) NOT NULL,
    venue_street VARCHAR(255),
    venue_city VARCHAR(100) NOT NULL,
    venue_state VARCHAR(100),
    venue_country VARCHAR(100) NOT NULL,
    venue_zip_code VARCHAR(20),
    venue_lat DECIMAL(10, 8),
    venue_lng DECIMAL(11, 8),
    venue_capacity INT NOT NULL,
    venue_amenities JSON,
    venue_accessibility JSON,
    
    -- Organization
    organizer_id INT NOT NULL,
    
    -- Media and images
    images JSON,
    videos JSON,
    
    -- Ticketing
    is_ticketed BOOLEAN DEFAULT FALSE,
    ticket_types JSON,
    
    -- Financial
    total_revenue DECIMAL(12, 2) DEFAULT 0.00,
    expenses JSON,
    sponsors JSON,
    
    -- Event status
    status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'draft',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Booking stats
    total_bookings INT DEFAULT 0,
    total_attendees INT DEFAULT 0,
    
    -- Reviews and ratings
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    
    -- Policies
    refundable BOOLEAN DEFAULT TRUE,
    refund_percentage INT DEFAULT 100,
    
    -- Timestamps
    published_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_category (category),
    INDEX idx_start_date (start_datetime),
    INDEX idx_city (venue_city),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured),
    INDEX idx_organizer (organizer_id)
);

-- Event Artists (Many-to-Many relationship)
CREATE TABLE event_artists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    artist_id INT NOT NULL,
    role VARCHAR(100) DEFAULT 'performer',
    fee DECIMAL(10, 2),
    status ENUM('pending', 'confirmed', 'declined') DEFAULT 'pending',
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_event_artist (event_id, artist_id),
    INDEX idx_event (event_id),
    INDEX idx_artist (artist_id),
    INDEX idx_status (status)
);

-- Bookings table
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    
    -- Booking details
    ticket_type VARCHAR(100),
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Booking status
    status ENUM('pending', 'confirmed', 'cancelled', 'refunded') DEFAULT 'pending',
    booking_reference VARCHAR(50) UNIQUE,
    
    -- Payment information
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_id VARCHAR(255),
    
    -- Attendee information
    attendee_details JSON,
    
    -- QR code and tickets
    qr_code VARCHAR(255),
    ticket_data JSON,
    
    -- Cancellation
    cancelled_at DATETIME,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10, 2),
    refunded_at DATETIME,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_event (event_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_reference (booking_reference)
);

-- Reviews table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_votes INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_event_review (event_id, user_id),
    INDEX idx_event (event_id),
    INDEX idx_user (user_id),
    INDEX idx_rating (rating)
);

-- Payments table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Payment gateway information
    gateway VARCHAR(50), -- 'stripe', 'paypal', 'razorpay', etc.
    gateway_transaction_id VARCHAR(255),
    gateway_payment_id VARCHAR(255),
    
    -- Payment status
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    
    -- Payment method
    method VARCHAR(50), -- 'card', 'bank_transfer', 'digital_wallet', etc.
    card_last_four VARCHAR(4),
    
    -- Timestamps
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    failed_at TIMESTAMP NULL,
    
    -- Error handling
    error_code VARCHAR(50),
    error_message TEXT,
    
    -- Refund information
    refund_amount DECIMAL(10, 2),
    refunded_at TIMESTAMP NULL,
    refund_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    
    INDEX idx_booking (booking_id),
    INDEX idx_status (status),
    INDEX idx_gateway_transaction (gateway_transaction_id)
);

-- Sponsors table
CREATE TABLE sponsors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500),
    website VARCHAR(500),
    sponsorship_type ENUM('title', 'presenting', 'supporting', 'media', 'community') DEFAULT 'supporting',
    amount DECIMAL(10, 2),
    benefits JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    
    INDEX idx_event (event_id),
    INDEX idx_type (sponsorship_type)
);

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('event', 'booking', 'payment', 'system', 'reminder') DEFAULT 'system',
    
    -- Related entities
    event_id INT NULL,
    booking_id INT NULL,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created (created_at)
);

-- User Favorites (Many-to-Many)
CREATE TABLE user_favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_favorite (user_id, event_id),
    INDEX idx_user (user_id),
    INDEX idx_event (event_id)
);

-- Artist Portfolio
CREATE TABLE artist_portfolio (
    id INT PRIMARY KEY AUTO_INCREMENT,
    artist_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    media_url VARCHAR(500),
    media_type ENUM('image', 'video', 'audio') NOT NULL,
    display_order INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_artist (artist_id),
    INDEX idx_type (media_type),
    INDEX idx_order (display_order)
);

-- Event Announcements
CREATE TABLE event_announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_urgent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    
    INDEX idx_event (event_id),
    INDEX idx_urgent (is_urgent)
);

-- Insert some initial data

-- Admin user
INSERT INTO users (name, email, password, role, is_verified) VALUES 
('Admin User', 'admin@mehfil.com', '$2b$10$placeholder_hash', 'admin', TRUE);

-- Sample categories for easier reference
-- (Categories are handled via ENUM in the events table)

-- Sample test data (optional)
INSERT INTO users (name, email, password, role, city, country, is_verified) VALUES 
('Ahmed Hassan', 'ahmed.organizer@mehfil.com', '$2b$10$placeholder_hash', 'organizer', 'Los Angeles', 'USA', TRUE),
('Sarah Johnson', 'sarah.organizer@mehfil.com', '$2b$10$placeholder_hash', 'organizer', 'New York', 'USA', TRUE),
('Fatima Al-Zahra', 'fatima.artist@mehfil.com', '$2b$10$placeholder_hash', 'artist', 'Chicago', 'USA', TRUE),
('John Doe', 'john.attendee@mehfil.com', '$2b$10$placeholder_hash', 'attendee', 'San Francisco', 'USA', TRUE);
