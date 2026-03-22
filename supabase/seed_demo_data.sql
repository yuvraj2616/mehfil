-- ==============================================================================
-- 🌟 MEHFIL — COMPREHENSIVE SEED SCRIPT
-- ==============================================================================
-- Instructions: Run this script in the Supabase SQL Editor.
-- Note: Re-running this script might cause primary key collisions if not cleared.
-- To completely reset and seed, you can run TRUNCATE on the tables first, but 
-- please ONLY DO SO if you want to overwrite your existing data.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SEED PROFILES (Users)
-- We insert into public.profiles but not auth.users to keep it simple and safe.
-- Note: These dummy users won't be able to log in, but they will show up 
-- perfectly in reviews, events, and bookings on the platform.
-- We MUST insert into auth.users first to satisfy the user_id foreign key constraint.
-- ------------------------------------------------------------------------------

-- Insert into auth.users (Supabase authentication table)
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES 
    -- Organizers
    ('11111111-1111-1111-1111-111111111111'::uuid, 'authenticated', 'authenticated', 'ncpaworld@mehfil.in', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"organizer"}'),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'authenticated', 'authenticated', 'comedy.club@mehfil.in', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"organizer"}'),
    
    -- Artists
    ('33333333-3333-3333-3333-333333333333'::uuid, 'authenticated', 'authenticated', 'zakir@mehfil.in', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"artist"}'),
    ('44444444-4444-4444-4444-444444444444'::uuid, 'authenticated', 'authenticated', 'ar.rahman@mehfil.in', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"artist"}'),
    
    -- Attendees
    ('55555555-5555-5555-5555-555555555555'::uuid, 'authenticated', 'authenticated', 'attendee.one@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"attendee"}'),
    ('66666666-6666-6666-6666-666666666666'::uuid, 'authenticated', 'authenticated', 'attendee.two@example.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"attendee"}')
ON CONFLICT (id) DO NOTHING;

-- Insert into public.profiles (Application user data)

INSERT INTO public.profiles (user_id, email, name, role, avatar, bio, created_at)
VALUES 
    -- Organizers
    ('11111111-1111-1111-1111-111111111111'::uuid, 'ncpaworld@mehfil.in', 'NCPA Mumbai', 'organizer', 'https://images.unsplash.com/photo-1514300302302-3c1aeb6c1e55?q=80&w=250&auto=format&fit=crop', 'India’s premier institution for the performing arts.', NOW() - INTERVAL '30 days'),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'comedy.club@mehfil.in', 'The Comedy Club', 'organizer', 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=250&auto=format&fit=crop', 'Bringing the best standup comedians to your city.', NOW() - INTERVAL '25 days'),
    
    -- Artists
    ('33333333-3333-3333-3333-333333333333'::uuid, 'zakir@mehfil.in', 'Zakir Khan', 'artist', 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=250&auto=format&fit=crop', 'Sakht launda turning life tragedies into comedy gold.', NOW() - INTERVAL '20 days'),
    ('44444444-4444-4444-4444-444444444444'::uuid, 'ar.rahman@mehfil.in', 'A.R. Rahman', 'artist', 'https://images.unsplash.com/photo-1516280440502-12fc06d860e3?q=80&w=250&auto=format&fit=crop', 'Oscar-winning composer and music maestro.', NOW() - INTERVAL '15 days'),
    
    -- Attendees
    ('55555555-5555-5555-5555-555555555555'::uuid, 'attendee.one@example.com', 'Aisha Sharma', 'attendee', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop', 'Love attending indie music gigs.', NOW() - INTERVAL '10 days'),
    ('66666666-6666-6666-6666-666666666666'::uuid, 'attendee.two@example.com', 'Rohan Gupta', 'attendee', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=250&auto=format&fit=crop', 'Comedy enthusiast from Delhi.', NOW() - INTERVAL '5 days')
ON CONFLICT (user_id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 2. SEED EVENTS
-- Beautifully curated realistic events across different Indian cities.
-- ------------------------------------------------------------------------------

INSERT INTO public.events (id, organizer_id, title, description, category, venue, date_time, ticketing, artists, media, is_featured, status, created_at)
VALUES 
    -- Music Event 1
    (
        'aaaa1111-aaaa-1111-aaaa-111111111111'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Sufi Nights with A.R. Rahman',
        'Experience a magical evening of soulful Sufi music, blending traditional qawwalis with contemporary orchestral arrangements. An unforgettable night under the stars at the iconic NSCI Dome.',
        'music',
        '{"name": "NSCI Dome", "address": "SVP Stadium, Worli", "city": "Mumbai", "capacity": 5000}',
        json_build_object('start', (NOW() + INTERVAL '10 days')::text, 'end', (NOW() + INTERVAL '10 days 4 hours')::text, 'timezone', 'Asia/Kolkata'),
        '[{"name": "Silver Phase 1", "price": 1500, "quantity": 1000}, {"name": "Gold Class", "price": 3500, "quantity": 500}, {"name": "VIP Lounge", "price": 7500, "quantity": 100}]'::jsonb,
        '[{"name": "A.R. Rahman", "role": "Lead Performer"}]'::jsonb,
        '{"banner": "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop"}'::jsonb,
        true,
        'published',
        NOW() - INTERVAL '5 days'
    ),
    -- Comedy Event 1
    (
        'bbbb2222-bbbb-2222-bbbb-222222222222'::uuid,
        '22222222-2222-2222-2222-222222222222'::uuid,
        'Zakir Khan Live - Haq Se Single',
        'India’s favourite comedian is back on tour! Join Zakir Khan for 90 minutes of pure laughter as he shares new anecdotes from his life, dating struggles, and family drama.',
        'comedy',
        '{"name": "Siri Fort Auditorium", "address": "August Kranti Marg", "city": "Delhi", "capacity": 1800}',
        json_build_object('start', (NOW() + INTERVAL '15 days')::text, 'end', (NOW() + INTERVAL '15 days 2 hours')::text, 'timezone', 'Asia/Kolkata'),
        '[{"name": "Balcony Row", "price": 799, "quantity": 500}, {"name": "Front Row VIP", "price": 1999, "quantity": 200}]'::jsonb,
        '[{"name": "Zakir Khan", "role": "Comedian"}]'::jsonb,
        '{"banner": "https://images.unsplash.com/photo-1527224857830-43a7ebb85455?q=80&w=1200&auto=format&fit=crop"}'::jsonb,
        true,
        'published',
        NOW() - INTERVAL '4 days'
    ),
    -- Theatre Event 1
    (
        'cccc3333-cccc-3333-cccc-333333333333'::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid,
        'Mughal-E-Azam: The Musical',
        'The spectacular stage adaptation of K. Asif’s classic film. Witness grandeur, breathtaking choreography, and live singing of legendary tracks in this Broadway-style theatrical masterpiece.',
        'theater',
        '{"name": "Jamshed Bhabha Theatre", "address": "NCPA Marg, Nariman Point", "city": "Mumbai", "capacity": 1000}',
        json_build_object('start', (NOW() - INTERVAL '2 days')::text, 'end', (NOW() - INTERVAL '2 days' + INTERVAL '3 hours')::text, 'timezone', 'Asia/Kolkata'),
        '[{"name": "General", "price": 2000, "quantity": 500}, {"name": "Premium", "price": 5000, "quantity": 200}]'::jsonb,
        '[{"name": "Feroz Abbas Khan", "role": "Director"}]'::jsonb,
        '{"banner": "https://images.unsplash.com/photo-1507676184212-d0330a15233c?q=80&w=1200&auto=format&fit=crop"}'::jsonb,
        false,
        'published',
        NOW() - INTERVAL '10 days'
    )
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 3. SEED BOOKINGS & PAYMENTS
-- We attach some confirmed dummy bookings from the attendee profiles.
-- ------------------------------------------------------------------------------

INSERT INTO public.bookings (id, event_id, attendee_id, status, tickets, final_amount, check_in, created_at)
VALUES 
    (
        'dddd4444-dddd-4444-dddd-444444444444'::uuid,
        'cccc3333-cccc-3333-cccc-333333333333'::uuid, -- Mughal-E-Azam
        '55555555-5555-5555-5555-555555555555'::uuid, -- Aisha
        'confirmed',
        '[{"tier": "General", "quantity": 2, "price": 2000}]'::jsonb,
        4000.00,
        '{"code": "CHK-A1B2C", "scanned": true, "scannedAt": "2026-03-20T18:00:00Z"}'::jsonb,
        NOW() - INTERVAL '7 days'
    ),
    (
        'eeee5555-eeee-5555-eeee-555555555555'::uuid,
        'cccc3333-cccc-3333-cccc-333333333333'::uuid, -- Mughal-E-Azam
        '66666666-6666-6666-6666-666666666666'::uuid, -- Rohan
        'confirmed',
        '[{"tier": "Premium", "quantity": 1, "price": 5000}]'::jsonb,
        5000.00,
        '{"code": "CHK-X9Y8Z", "scanned": true, "scannedAt": "2026-03-20T18:15:00Z"}'::jsonb,
        NOW() - INTERVAL '6 days'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.payments (id, booking_id, payer_id, amount, net_amount, payment_method, gateway, processing_fee, platform_fee, status, created_at)
VALUES 
    (
        '11115555-ffff-5555-ffff-555555555555'::uuid,
        'dddd4444-dddd-4444-dddd-444444444444'::uuid,
        '55555555-5555-5555-5555-555555555555'::uuid, -- Aisha
        4000.00,
        3800.00,
        'upi',
        '{"order_id": "order_dummy12345", "payment_id": "pay_dummy12345", "provider": "razorpay"}'::jsonb,
        100.00,
        100.00,
        'completed',
        NOW() - INTERVAL '7 days'
    ),
    (
        '22226666-eeee-6666-eeee-666666666666'::uuid,
        'eeee5555-eeee-5555-eeee-555555555555'::uuid,
        '66666666-6666-6666-6666-666666666666'::uuid, -- Rohan
        5000.00,
        4750.00,
        'card',
        '{"order_id": "order_dummy67890", "payment_id": "pay_dummy67890", "provider": "razorpay"}'::jsonb,
        125.00,
        125.00,
        'completed',
        NOW() - INTERVAL '6 days'
    )
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------------------------
-- 4. SEED REVIEWS
-- Since Mughal-E-Azam is in the past, Aisha and Rohan can leave reviews.
-- ------------------------------------------------------------------------------

INSERT INTO public.reviews (id, event_id, reviewer_id, ratings, title, content, status, created_at)
VALUES 
    (
        '77777777-7777-7777-7777-777777777777'::uuid,
        'cccc3333-cccc-3333-cccc-333333333333'::uuid, -- Mughal-E-Azam
        '55555555-5555-5555-5555-555555555555'::uuid, -- Aisha
        '{"overall": 5, "venue": 5, "performance": 5, "value": 4}'::jsonb,
        'Absolutely Breathtaking!',
        'The sheer grandeur of the sets and the live singing left me speechless. It truly lived up to the hype. The NCPA venue was perfect as always.',
        'approved',
        NOW() - INTERVAL '1 day'
    ),
    (
        '88888888-8888-8888-8888-888888888888'::uuid,
        'cccc3333-cccc-3333-cccc-333333333333'::uuid, -- Mughal-E-Azam
        '66666666-6666-6666-6666-666666666666'::uuid, -- Rohan
        '{"overall": 4, "venue": 4, "performance": 5, "value": 3}'::jsonb,
        'Great performances, slightly pricey tickets',
        'The acting and direction were phenomenal. I bought the premium tickets, and while the view was great, I felt the F&B during the interval was overly expensive.',
        'approved',
        NOW() - INTERVAL '12 hours'
    )
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ✅ SEEDING COMPLETE
-- ==============================================================================
