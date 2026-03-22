-- ============================================================
-- Mehfil Seed Data — 6 sample events for testing
-- Run this after creating your database tables
-- ============================================================

-- First, get the ID of any organizer user. If no organizer exists,
-- we'll use your current user (update the user_id below).
-- You can find your user_id in Supabase Dashboard → Authentication → Users

-- IMPORTANT: Replace the organizer_id below with an actual user_id from your profiles table.
-- To find your user_id, run: SELECT user_id, name, role FROM profiles;
-- Then update the role to 'organizer' if needed: UPDATE profiles SET role = 'organizer' WHERE user_id = 'YOUR_ID';

DO $$
DECLARE
  org_id UUID;
BEGIN
  -- Try to find an organizer, otherwise use the first user
  SELECT user_id INTO org_id FROM profiles WHERE role IN ('organizer', 'admin') LIMIT 1;
  
  IF org_id IS NULL THEN
    SELECT user_id INTO org_id FROM profiles LIMIT 1;
  END IF;

  IF org_id IS NULL THEN
    RAISE NOTICE 'No users found. Please sign up first, then run this script.';
    RETURN;
  END IF;

  -- Update the user's role to organizer if not already
  UPDATE profiles SET role = 'organizer' WHERE user_id = org_id AND role NOT IN ('organizer', 'admin');

  INSERT INTO events (organizer_id, title, description, category, tags, date_time, venue, artists, ticketing, media, status, is_featured)
  VALUES
  (
    org_id,
    'Mushaira Night — An Evening of Urdu Poetry',
    'Join us for an enchanting evening of Urdu poetry featuring some of the finest contemporary poets. Experience the beauty of ghazals, nazms, and rubaiyat in the traditional mushaira format under the open sky. Chai and snacks will be served.',
    'poetry',
    ARRAY['urdu', 'ghazal', 'mushaira', 'live poetry'],
    '{"start": "2026-04-15T18:30:00", "end": "2026-04-15T22:00:00"}',
    '{"name": "India Habitat Centre", "address": "Lodhi Road", "city": "Delhi", "capacity": 300}',
    '[{"name": "Javed Akhtar", "role": "Chief Guest"}, {"name": "Gulzar", "role": "Poet"}, {"name": "Rahat Indori", "role": "Poet"}]',
    '[{"name": "Front Row", "price": 999, "quantity": 50}, {"name": "General", "price": 499, "quantity": 200}, {"name": "Student Pass", "price": 199, "quantity": 50}]',
    '{"banner": ""}',
    'published',
    true
  ),
  (
    org_id,
    'Sufi Night Live — Qawwali & Sufi Rock',
    'A mesmerizing night of Sufi music blending traditional qawwali with contemporary rock elements. Let the mystical sounds transport you to a world of divine love and spiritual ecstasy. Food stalls available at the venue.',
    'music',
    ARRAY['sufi', 'qawwali', 'live music', 'fusion'],
    '{"start": "2026-04-22T19:00:00", "end": "2026-04-22T23:30:00"}',
    '{"name": "NCPA Tata Theatre", "address": "Nariman Point", "city": "Mumbai", "capacity": 500}',
    '[{"name": "Abida Parveen", "role": "Lead Vocalist"}, {"name": "Nooran Sisters", "role": "Guest Performers"}]',
    '[{"name": "VIP Lounge", "price": 1499, "quantity": 100}, {"name": "General", "price": 799, "quantity": 300}, {"name": "Balcony", "price": 599, "quantity": 100}]',
    '{"banner": ""}',
    'published',
    true
  ),
  (
    org_id,
    'Kathak Utsav — Classical Dance Festival',
    'A three-hour celebration of Kathak dance featuring performances by renowned dancers from the Lucknow and Jaipur gharanas. Witness the grace, footwork, and storytelling of this ancient art form.',
    'dance',
    ARRAY['kathak', 'classical dance', 'festival', 'indian dance'],
    '{"start": "2026-05-01T17:00:00", "end": "2026-05-01T20:00:00"}',
    '{"name": "Jawahar Kala Kendra", "address": "JLN Marg", "city": "Jaipur", "capacity": 400}',
    '[{"name": "Birju Maharaj Legacy Group", "role": "Lucknow Gharana"}, {"name": "Prerana Shrimali", "role": "Jaipur Gharana"}]',
    '[{"name": "Premium", "price": 899, "quantity": 80}, {"name": "General", "price": 599, "quantity": 250}, {"name": "Student", "price": 299, "quantity": 70}]',
    '{"banner": ""}',
    'published',
    true
  ),
  (
    org_id,
    'Stand-Up Comedy Night — Desi Laughs',
    'Get ready for a hilarious evening of stand-up comedy in Hindi and English! Five of India''s funniest comedians take the stage for an unforgettable night of laughter and entertainment.',
    'comedy',
    ARRAY['stand-up', 'comedy', 'hindi comedy', 'live show'],
    '{"start": "2026-04-28T20:00:00", "end": "2026-04-28T22:30:00"}',
    '{"name": "Canvas Laugh Club", "address": "Lower Parel", "city": "Mumbai", "capacity": 200}',
    '[{"name": "Zakir Khan", "role": "Headliner"}, {"name": "Prashasti Singh", "role": "Comedian"}, {"name": "Abhishek Upmanyu", "role": "Comedian"}]',
    '[{"name": "Front Row", "price": 1299, "quantity": 30}, {"name": "Regular", "price": 699, "quantity": 120}, {"name": "Back Row", "price": 449, "quantity": 50}]',
    '{"banner": ""}',
    'published',
    false
  ),
  (
    org_id,
    'Rabindra Sangeet Evening — Songs of Tagore',
    'An intimate evening celebrating the musical legacy of Rabindranath Tagore. Classical and contemporary renditions of his most beloved compositions performed live.',
    'literary',
    ARRAY['tagore', 'rabindra sangeet', 'bengali', 'classical'],
    '{"start": "2026-05-07T18:00:00", "end": "2026-05-07T21:00:00"}',
    '{"name": "Rabindra Sadan", "address": "AJC Bose Road", "city": "Kolkata", "capacity": 350}',
    '[{"name": "Lopamudra Mitra", "role": "Lead Singer"}, {"name": "Anup Ghoshal", "role": "Classical Vocalist"}]',
    '[{"name": "Gold", "price": 750, "quantity": 100}, {"name": "Silver", "price": 450, "quantity": 200}, {"name": "Bronze", "price": 250, "quantity": 50}]',
    '{"banner": ""}',
    'published',
    false
  ),
  (
    org_id,
    'Natak — Modern Hindi Theater',
    'A powerful contemporary Hindi play exploring themes of identity, belonging, and the modern Indian experience. This award-winning production combines traditional theatrical elements with modern stagecraft.',
    'theater',
    ARRAY['hindi theater', 'natak', 'drama', 'modern play'],
    '{"start": "2026-05-12T19:00:00", "end": "2026-05-12T21:30:00"}',
    '{"name": "Rangsharda Auditorium", "address": "Bandra West", "city": "Mumbai", "capacity": 280}',
    '[{"name": "Naseeruddin Shah", "role": "Lead Actor"}, {"name": "Ratna Pathak Shah", "role": "Lead Actress"}]',
    '[{"name": "Box Seat", "price": 1200, "quantity": 30}, {"name": "Orchestra", "price": 800, "quantity": 150}, {"name": "Balcony", "price": 500, "quantity": 100}]',
    '{"banner": ""}',
    'published',
    false
  );

  RAISE NOTICE 'Inserted 6 sample events for organizer: %', org_id;
END $$;
