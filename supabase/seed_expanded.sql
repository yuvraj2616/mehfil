-- ==============================================================================
-- 🌟 MEHFIL — EXPANDED SEED SCRIPT (Run AFTER the original seed)
-- ==============================================================================
-- This adds MORE events, users, bookings, and reviews to make the platform
-- feel full and vibrant. Run this in the Supabase SQL Editor.
-- ==============================================================================

-- --------------------------------------------------------------------------
-- 1. MORE AUTH USERS
-- --------------------------------------------------------------------------
INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid, 'authenticated','authenticated','priya.mehta@mehfil.in', crypt('password123',gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"organizer"}'),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid, 'authenticated','authenticated','cultural.society@mehfil.in', crypt('password123',gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"organizer"}'),
  ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3'::uuid, 'authenticated','authenticated','neeraj.chopra@mehfil.in', crypt('password123',gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"artist"}'),
  ('a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4'::uuid, 'authenticated','authenticated','shreya.ghoshal@mehfil.in', crypt('password123',gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"artist"}'),
  ('a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5'::uuid, 'authenticated','authenticated','biswa.mast@mehfil.in', crypt('password123',gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"artist"}'),
  ('a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6'::uuid, 'authenticated','authenticated','kavya.singh@example.com', crypt('password123',gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"attendee"}'),
  ('a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7'::uuid, 'authenticated','authenticated','dev.kapoor@example.com', crypt('password123',gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"attendee"}'),
  ('a8a8a8a8-a8a8-a8a8-a8a8-a8a8a8a8a8a8'::uuid, 'authenticated','authenticated','meera.iyer@example.com', crypt('password123',gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"attendee"}'),
  ('a9a9a9a9-a9a9-a9a9-a9a9-a9a9a9a9a9a9'::uuid, 'authenticated','authenticated','arjun.reddy@example.com', crypt('password123',gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"attendee"}'),
  ('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1'::uuid, 'authenticated','authenticated','tanvi.joshi@example.com', crypt('password123',gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"attendee"}'),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2'::uuid, 'authenticated','authenticated','rahul.verma@example.com', crypt('password123',gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"attendee"}'),
  ('b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3'::uuid, 'authenticated','authenticated','sneha.patel@example.com', crypt('password123',gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"attendee"}')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------------
-- 2. MORE PROFILES
-- --------------------------------------------------------------------------
INSERT INTO public.profiles (user_id, email, name, role, avatar, bio, created_at)
VALUES
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid, 'priya.mehta@mehfil.in', 'Priya Mehta Events', 'organizer', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250&auto=format&fit=crop', 'Premium event management across Bengaluru and Chennai.', NOW() - INTERVAL '28 days'),
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid, 'cultural.society@mehfil.in', 'Hyderabad Cultural Society', 'organizer', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=250&auto=format&fit=crop', 'Preserving Deccani heritage through arts and performances.', NOW() - INTERVAL '22 days'),
  ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3'::uuid, 'neeraj.chopra@mehfil.in', 'Prateek Kuhad', 'artist', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop', 'Singer-songwriter crafting indie folk melodies that move hearts.', NOW() - INTERVAL '18 days'),
  ('a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4'::uuid, 'shreya.ghoshal@mehfil.in', 'Shreya Ghoshal', 'artist', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop', 'Grammy-nominated playback singer with the voice of an angel.', NOW() - INTERVAL '12 days'),
  ('a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5'::uuid, 'biswa.mast@mehfil.in', 'Biswa Kalyan Rath', 'artist', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=250&auto=format&fit=crop', 'Standup comedian and creator of Laakhon Mein Ek.', NOW() - INTERVAL '8 days'),
  ('a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6'::uuid, 'kavya.singh@example.com', 'Kavya Singh', 'attendee', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=250&auto=format&fit=crop', 'Poet and theater fan from Jaipur.', NOW() - INTERVAL '9 days'),
  ('a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7'::uuid, 'dev.kapoor@example.com', 'Dev Kapoor', 'attendee', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop', 'Music junkie. From Carnatic to EDM.', NOW() - INTERVAL '6 days'),
  ('a8a8a8a8-a8a8-a8a8-a8a8-a8a8a8a8a8a8'::uuid, 'meera.iyer@example.com', 'Meera Iyer', 'attendee', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250&auto=format&fit=crop', 'Classical dance lover from Chennai.', NOW() - INTERVAL '4 days'),
  ('a9a9a9a9-a9a9-a9a9-a9a9-a9a9a9a9a9a9'::uuid, 'arjun.reddy@example.com', 'Arjun Reddy', 'attendee', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=250&auto=format&fit=crop', 'Comedy show regular from Hyderabad.', NOW() - INTERVAL '3 days'),
  ('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1'::uuid, 'tanvi.joshi@example.com', 'Tanvi Joshi', 'attendee', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=250&auto=format&fit=crop', 'Literature enthusiast and book reviewer.', NOW() - INTERVAL '2 days'),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2'::uuid, 'rahul.verma@example.com', 'Rahul Verma', 'attendee', 'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=250&auto=format&fit=crop', 'Weekend warrior for live gigs.', NOW() - INTERVAL '1 day'),
  ('b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3'::uuid, 'sneha.patel@example.com', 'Sneha Patel', 'attendee', 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?q=80&w=250&auto=format&fit=crop', 'Bollywood and Sufi music fan from Ahmedabad.', NOW() - INTERVAL '12 hours')
ON CONFLICT (user_id) DO NOTHING;

-- --------------------------------------------------------------------------
-- 3. LOTS MORE EVENTS (10 additional events across all categories)
-- --------------------------------------------------------------------------
INSERT INTO public.events (id, organizer_id, title, description, category, venue, date_time, ticketing, artists, media, is_featured, status, created_at)
VALUES
  -- Poetry
  ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1'::uuid, 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid,
   'Jashn-e-Rekhta: Urdu Poetry Festival',
   'A celebration of Urdu language and literature featuring legendary poets, mushairas, book launches, and qawwali performances. A weekend immersion into the beauty of Urdu.',
   'poetry',
   '{"name":"Major Dhyan Chand Stadium","address":"India Gate Circle","city":"Delhi","capacity":8000}',
   json_build_object('start',(NOW()+INTERVAL '5 days')::text,'end',(NOW()+INTERVAL '7 days')::text,'timezone','Asia/Kolkata'),
   '[{"name":"Weekend Pass","price":500,"quantity":5000},{"name":"VIP Lounge","price":2500,"quantity":500}]'::jsonb,
   '[{"name":"Javed Akhtar","role":"Chief Guest"},{"name":"Gulzar","role":"Poet"}]'::jsonb,
   '{"banner":"https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop"}'::jsonb,
   true,'published',NOW()-INTERVAL '3 days'),

  -- Music
  ('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2'::uuid, 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid,
   'Prateek Kuhad - The Way That Lovers Do Tour',
   'India''s beloved indie artist performs his chart-topping singles live. Expect stripped-down acoustic sets, fan favourites, and new unreleased tracks in an intimate venue.',
   'music',
   '{"name":"Phoenix Marketcity","address":"Whitefield","city":"Bengaluru","capacity":2000}',
   json_build_object('start',(NOW()+INTERVAL '12 days')::text,'end',(NOW()+INTERVAL '12 days 3 hours')::text,'timezone','Asia/Kolkata'),
   '[{"name":"General","price":1200,"quantity":1500},{"name":"Front Row","price":3000,"quantity":200}]'::jsonb,
   '[{"name":"Prateek Kuhad","role":"Singer-Songwriter"}]'::jsonb,
   '{"banner":"https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop"}'::jsonb,
   true,'published',NOW()-INTERVAL '2 days'),

  -- Dance
  ('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3'::uuid, 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid,
   'Nrityanjali: Classical Dance Confluence',
   'A grand evening of Bharatanatyam, Kathak, and Odissi by India''s finest classical dancers. Witness the grace of tradition meet the energy of contemporary choreography.',
   'dance',
   '{"name":"Ravindra Bharathi","address":"Saifabad","city":"Hyderabad","capacity":1200}',
   json_build_object('start',(NOW()+INTERVAL '8 days')::text,'end',(NOW()+INTERVAL '8 days 3 hours')::text,'timezone','Asia/Kolkata'),
   '[{"name":"Standard","price":800,"quantity":800},{"name":"Premium","price":2000,"quantity":200}]'::jsonb,
   '[{"name":"Madhavi Mudgal","role":"Odissi Dancer"},{"name":"Birju Maharaj Troupe","role":"Kathak"}]'::jsonb,
   '{"banner":"https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?q=80&w=1200&auto=format&fit=crop"}'::jsonb,
   false,'published',NOW()-INTERVAL '6 days'),

  -- Comedy
  ('e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4'::uuid, '22222222-2222-2222-2222-222222222222'::uuid,
   'Biswa Kalyan Rath: Sushi',
   'The mathematician-turned-comedian returns with his signature observational humour. A sharp, witty take on everyday absurdities that will leave you questioning life itself.',
   'comedy',
   '{"name":"Canvas Laugh Club","address":"Lower Parel","city":"Mumbai","capacity":300}',
   json_build_object('start',(NOW()+INTERVAL '20 days')::text,'end',(NOW()+INTERVAL '20 days 2 hours')::text,'timezone','Asia/Kolkata'),
   '[{"name":"General","price":999,"quantity":250},{"name":"Couple Pass","price":1799,"quantity":50}]'::jsonb,
   '[{"name":"Biswa Kalyan Rath","role":"Comedian"}]'::jsonb,
   '{"banner":"https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=1200&auto=format&fit=crop"}'::jsonb,
   true,'published',NOW()-INTERVAL '1 day'),

  -- Literary
  ('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5'::uuid, 'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::uuid,
   'Jaipur Literature Festival 2026',
   'The world''s largest free literary festival returns! Featuring 250+ sessions, author meet-and-greets, book launches, panel debates, and cultural programs across 5 days.',
   'literary',
   '{"name":"Diggi Palace","address":"Sawai Man Singh Highway","city":"Jaipur","capacity":15000}',
   json_build_object('start',(NOW()+INTERVAL '30 days')::text,'end',(NOW()+INTERVAL '34 days')::text,'timezone','Asia/Kolkata'),
   '[{"name":"Free Entry","price":0,"quantity":10000},{"name":"Delegate Pass","price":5000,"quantity":1000}]'::jsonb,
   '[{"name":"Amitav Ghosh","role":"Author"},{"name":"Shashi Tharoor","role":"Speaker"}]'::jsonb,
   '{"banner":"https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop"}'::jsonb,
   true,'published',NOW()-INTERVAL '7 days'),

  -- Cultural
  ('e6e6e6e6-e6e6-e6e6-e6e6-e6e6e6e6e6e6'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   'Ganesh Chaturthi Cultural Gala',
   'A spectacular evening celebrating Ganesh Chaturthi with dhol-tasha performances, aarti, traditional Maharashtrian folk dance, and a grand feast of modaks and puranpoli.',
   'cultural',
   '{"name":"Shivaji Park","address":"Dadar","city":"Mumbai","capacity":20000}',
   json_build_object('start',(NOW()+INTERVAL '45 days')::text,'end',(NOW()+INTERVAL '45 days 6 hours')::text,'timezone','Asia/Kolkata'),
   '[{"name":"Open Ground","price":0,"quantity":15000},{"name":"VIP Pandal","price":1000,"quantity":500}]'::jsonb,
   '[{"name":"Dhol Tasha Pathak","role":"Percussion Ensemble"}]'::jsonb,
   '{"banner":"https://images.unsplash.com/photo-1532375810709-75b1da00537c?q=80&w=1200&auto=format&fit=crop"}'::jsonb,
   false,'published',NOW()-INTERVAL '8 days'),

  -- Music (Shreya Ghoshal)
  ('e7e7e7e7-e7e7-e7e7-e7e7-e7e7e7e7e7e7'::uuid, 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid,
   'Shreya Ghoshal Live in Concert',
   'The nightingale of Bollywood performs her greatest hits live — from Dola Re to Sun Raha Hai. A mesmerising evening of soulful melodies with a full orchestral ensemble.',
   'music',
   '{"name":"Jawaharlal Nehru Stadium","address":"Lodhi Road","city":"Delhi","capacity":10000}',
   json_build_object('start',(NOW()+INTERVAL '18 days')::text,'end',(NOW()+INTERVAL '18 days 3 hours')::text,'timezone','Asia/Kolkata'),
   '[{"name":"Silver","price":2000,"quantity":5000},{"name":"Gold","price":5000,"quantity":2000},{"name":"Diamond","price":10000,"quantity":500}]'::jsonb,
   '[{"name":"Shreya Ghoshal","role":"Playback Singer"}]'::jsonb,
   '{"banner":"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop"}'::jsonb,
   true,'published',NOW()-INTERVAL '1 day'),

  -- Theater (past event for more reviews)
  ('e8e8e8e8-e8e8-e8e8-e8e8-e8e8e8e8e8e8'::uuid, '11111111-1111-1111-1111-111111111111'::uuid,
   'Tumhari Amrita — A Play in Letters',
   'Based on A.R. Gurney''s "Love Letters", this Hindi adaptation is a poignant tale of love told through letters spanning decades. Starring Shabana Azmi and Farooq Sheikh.',
   'theater',
   '{"name":"Prithvi Theatre","address":"Juhu","city":"Mumbai","capacity":200}',
   json_build_object('start',(NOW()-INTERVAL '5 days')::text,'end',(NOW()-INTERVAL '5 days'+INTERVAL '2 hours')::text,'timezone','Asia/Kolkata'),
   '[{"name":"General","price":1500,"quantity":150},{"name":"Premium","price":3000,"quantity":50}]'::jsonb,
   '[{"name":"Shabana Azmi","role":"Lead Actress"}]'::jsonb,
   '{"banner":"https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1200&auto=format&fit=crop"}'::jsonb,
   false,'published',NOW()-INTERVAL '15 days'),

  -- Comedy (past event for reviews)
  ('e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9'::uuid, '22222222-2222-2222-2222-222222222222'::uuid,
   'Comedy Premium League — Mumbai Finals',
   'The best comedians from across India compete in rapid-fire rounds, improv battles, and audience challenges. Previous winners include Zakir Khan and Biswa.',
   'comedy',
   '{"name":"Bandra Fort Amphitheatre","address":"Bandra West","city":"Mumbai","capacity":500}',
   json_build_object('start',(NOW()-INTERVAL '3 days')::text,'end',(NOW()-INTERVAL '3 days'+INTERVAL '3 hours')::text,'timezone','Asia/Kolkata'),
   '[{"name":"Standard","price":699,"quantity":400},{"name":"Premium","price":1499,"quantity":100}]'::jsonb,
   '[{"name":"Zakir Khan","role":"Judge"},{"name":"Biswa Kalyan Rath","role":"Performer"}]'::jsonb,
   '{"banner":"https://images.unsplash.com/photo-1527224857830-43a7ebb85455?q=80&w=1200&auto=format&fit=crop"}'::jsonb,
   false,'published',NOW()-INTERVAL '12 days'),

  -- Music (past)
  ('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1'::uuid, 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::uuid,
   'Indie Music Fest Bengaluru',
   'A full-day outdoor music festival featuring 12 indie bands, food trucks, art installations, and a sunset acoustic lounge. The vibe was immaculate.',
   'music',
   '{"name":"Jayamahal Palace Grounds","address":"Jayamahal","city":"Bengaluru","capacity":5000}',
   json_build_object('start',(NOW()-INTERVAL '7 days')::text,'end',(NOW()-INTERVAL '7 days'+INTERVAL '8 hours')::text,'timezone','Asia/Kolkata'),
   '[{"name":"Early Bird","price":999,"quantity":2000},{"name":"Regular","price":1499,"quantity":2000},{"name":"Backstage","price":4999,"quantity":200}]'::jsonb,
   '[{"name":"Prateek Kuhad","role":"Headliner"},{"name":"When Chai Met Toast","role":"Band"}]'::jsonb,
   '{"banner":"https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop"}'::jsonb,
   false,'published',NOW()-INTERVAL '14 days')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------------
-- 4. BOOKINGS for past events
-- --------------------------------------------------------------------------
INSERT INTO public.bookings (id, event_id, attendee_id, status, tickets, final_amount, check_in, created_at)
VALUES
  -- Tumhari Amrita bookings
  ('b4b4b4b4-b4b4-b4b4-b4b4-b4b4b4b4b4b4'::uuid,'e8e8e8e8-e8e8-e8e8-e8e8-e8e8e8e8e8e8'::uuid,'a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6'::uuid,'confirmed','[{"tier":"Premium","quantity":2,"price":3000}]'::jsonb,6000.00,'{"code":"CHK-TUM01","scanned":true,"scannedAt":"2026-03-17T19:00:00Z"}'::jsonb,NOW()-INTERVAL '8 days'),
  ('b5b5b5b5-b5b5-b5b5-b5b5-b5b5b5b5b5b5'::uuid,'e8e8e8e8-e8e8-e8e8-e8e8-e8e8e8e8e8e8'::uuid,'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7'::uuid,'confirmed','[{"tier":"General","quantity":1,"price":1500}]'::jsonb,1500.00,'{"code":"CHK-TUM02","scanned":true,"scannedAt":"2026-03-17T19:10:00Z"}'::jsonb,NOW()-INTERVAL '7 days'),
  ('b6b6b6b6-b6b6-b6b6-b6b6-b6b6b6b6b6b6'::uuid,'e8e8e8e8-e8e8-e8e8-e8e8-e8e8e8e8e8e8'::uuid,'a8a8a8a8-a8a8-a8a8-a8a8-a8a8a8a8a8a8'::uuid,'confirmed','[{"tier":"General","quantity":2,"price":1500}]'::jsonb,3000.00,'{"code":"CHK-TUM03","scanned":true,"scannedAt":"2026-03-17T19:15:00Z"}'::jsonb,NOW()-INTERVAL '7 days'),

  -- Comedy Premium League bookings
  ('b7b7b7b7-b7b7-b7b7-b7b7-b7b7b7b7b7b7'::uuid,'e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9'::uuid,'a9a9a9a9-a9a9-a9a9-a9a9-a9a9a9a9a9a9'::uuid,'confirmed','[{"tier":"Standard","quantity":2,"price":699}]'::jsonb,1398.00,'{"code":"CHK-CPL01","scanned":true,"scannedAt":"2026-03-19T18:00:00Z"}'::jsonb,NOW()-INTERVAL '5 days'),
  ('b8b8b8b8-b8b8-b8b8-b8b8-b8b8b8b8b8b8'::uuid,'e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9'::uuid,'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1'::uuid,'confirmed','[{"tier":"Premium","quantity":1,"price":1499}]'::jsonb,1499.00,'{"code":"CHK-CPL02","scanned":true,"scannedAt":"2026-03-19T18:05:00Z"}'::jsonb,NOW()-INTERVAL '5 days'),
  ('b9b9b9b9-b9b9-b9b9-b9b9-b9b9b9b9b9b9'::uuid,'e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9'::uuid,'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2'::uuid,'confirmed','[{"tier":"Standard","quantity":3,"price":699}]'::jsonb,2097.00,'{"code":"CHK-CPL03","scanned":true,"scannedAt":"2026-03-19T18:10:00Z"}'::jsonb,NOW()-INTERVAL '4 days'),

  -- Indie Music Fest bookings
  ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'::uuid,'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1'::uuid,'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7'::uuid,'confirmed','[{"tier":"Regular","quantity":2,"price":1499}]'::jsonb,2998.00,'{"code":"CHK-IMF01","scanned":true,"scannedAt":"2026-03-15T12:00:00Z"}'::jsonb,NOW()-INTERVAL '10 days'),
  ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'::uuid,'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1'::uuid,'b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3'::uuid,'confirmed','[{"tier":"Backstage","quantity":1,"price":4999}]'::jsonb,4999.00,'{"code":"CHK-IMF02","scanned":true,"scannedAt":"2026-03-15T11:30:00Z"}'::jsonb,NOW()-INTERVAL '9 days'),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3'::uuid,'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1'::uuid,'55555555-5555-5555-5555-555555555555'::uuid,'confirmed','[{"tier":"Early Bird","quantity":4,"price":999}]'::jsonb,3996.00,'{"code":"CHK-IMF03","scanned":true,"scannedAt":"2026-03-15T12:30:00Z"}'::jsonb,NOW()-INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------------
-- 5. PAYMENTS for those bookings
-- --------------------------------------------------------------------------
INSERT INTO public.payments (id, booking_id, payer_id, amount, net_amount, payment_method, gateway, processing_fee, platform_fee, status, created_at)
VALUES
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1'::uuid,'b4b4b4b4-b4b4-b4b4-b4b4-b4b4b4b4b4b4'::uuid,'a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6'::uuid,6000.00,5700.00,'card','{"order_id":"order_tum01","payment_id":"pay_tum01","provider":"razorpay"}'::jsonb,150.00,150.00,'completed',NOW()-INTERVAL '8 days'),
  ('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2'::uuid,'b5b5b5b5-b5b5-b5b5-b5b5-b5b5b5b5b5b5'::uuid,'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7'::uuid,1500.00,1425.00,'upi','{"order_id":"order_tum02","payment_id":"pay_tum02","provider":"razorpay"}'::jsonb,37.50,37.50,'completed',NOW()-INTERVAL '7 days'),
  ('d3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3'::uuid,'b6b6b6b6-b6b6-b6b6-b6b6-b6b6b6b6b6b6'::uuid,'a8a8a8a8-a8a8-a8a8-a8a8-a8a8a8a8a8a8'::uuid,3000.00,2850.00,'card','{"order_id":"order_tum03","payment_id":"pay_tum03","provider":"razorpay"}'::jsonb,75.00,75.00,'completed',NOW()-INTERVAL '7 days'),
  ('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4'::uuid,'b7b7b7b7-b7b7-b7b7-b7b7-b7b7b7b7b7b7'::uuid,'a9a9a9a9-a9a9-a9a9-a9a9-a9a9a9a9a9a9'::uuid,1398.00,1328.00,'upi','{"order_id":"order_cpl01","payment_id":"pay_cpl01","provider":"razorpay"}'::jsonb,35.00,35.00,'completed',NOW()-INTERVAL '5 days'),
  ('d5d5d5d5-d5d5-d5d5-d5d5-d5d5d5d5d5d5'::uuid,'b8b8b8b8-b8b8-b8b8-b8b8-b8b8b8b8b8b8'::uuid,'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1'::uuid,1499.00,1424.00,'card','{"order_id":"order_cpl02","payment_id":"pay_cpl02","provider":"razorpay"}'::jsonb,37.50,37.50,'completed',NOW()-INTERVAL '5 days'),
  ('d6d6d6d6-d6d6-d6d6-d6d6-d6d6d6d6d6d6'::uuid,'b9b9b9b9-b9b9-b9b9-b9b9-b9b9b9b9b9b9'::uuid,'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2'::uuid,2097.00,1992.00,'netbanking','{"order_id":"order_cpl03","payment_id":"pay_cpl03","provider":"razorpay"}'::jsonb,52.50,52.50,'completed',NOW()-INTERVAL '4 days'),
  ('d7d7d7d7-d7d7-d7d7-d7d7-d7d7d7d7d7d7'::uuid,'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1'::uuid,'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7'::uuid,2998.00,2848.00,'upi','{"order_id":"order_imf01","payment_id":"pay_imf01","provider":"razorpay"}'::jsonb,75.00,75.00,'completed',NOW()-INTERVAL '10 days'),
  ('d8d8d8d8-d8d8-d8d8-d8d8-d8d8d8d8d8d8'::uuid,'c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2'::uuid,'b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3'::uuid,4999.00,4749.00,'card','{"order_id":"order_imf02","payment_id":"pay_imf02","provider":"razorpay"}'::jsonb,125.00,125.00,'completed',NOW()-INTERVAL '9 days'),
  ('d9d9d9d9-d9d9-d9d9-d9d9-d9d9d9d9d9d9'::uuid,'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3'::uuid,'55555555-5555-5555-5555-555555555555'::uuid,3996.00,3796.00,'wallet','{"order_id":"order_imf03","payment_id":"pay_imf03","provider":"razorpay"}'::jsonb,100.00,100.00,'completed',NOW()-INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------------
-- 6. TONS OF REVIEWS for past events
-- --------------------------------------------------------------------------
INSERT INTO public.reviews (id, event_id, reviewer_id, ratings, title, content, status, created_at)
VALUES
  -- Tumhari Amrita reviews
  ('a0a01001-a0a0-1001-a0a0-a0a010010001'::uuid,'e8e8e8e8-e8e8-e8e8-e8e8-e8e8e8e8e8e8'::uuid,'a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6'::uuid,
   '{"overall":5,"venue":5,"performance":5,"value":5}'::jsonb,
   'A masterpiece of emotional storytelling',
   'Shabana Azmi was absolutely mesmerising. The way love unfolds through decades of letters left the entire audience in tears. Prithvi Theatre''s intimate setting made it feel like we were peering into someone''s private diary. An unforgettable experience.','approved',NOW()-INTERVAL '4 days'),

  ('a0a02002-a0a0-2002-a0a0-a0a020020002'::uuid,'e8e8e8e8-e8e8-e8e8-e8e8-e8e8e8e8e8e8'::uuid,'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7'::uuid,
   '{"overall":4,"venue":5,"performance":5,"value":3}'::jsonb,
   'Beautiful but wish it was longer',
   'The performances were extraordinary — every word felt real. The only downside was the short runtime. I wanted to hear more letters and see more of their journey. Premium pricing for 90 minutes felt steep, but the acting quality justifies it.','approved',NOW()-INTERVAL '3 days'),

  ('a0a03003-a0a0-3003-a0a0-a0a030030003'::uuid,'e8e8e8e8-e8e8-e8e8-e8e8-e8e8e8e8e8e8'::uuid,'a8a8a8a8-a8a8-a8a8-a8a8-a8a8a8a8a8a8'::uuid,
   '{"overall":5,"venue":4,"performance":5,"value":4}'::jsonb,
   'Theater at its absolute finest',
   'I drove from Pune just for this show and it was worth every kilometer. The simplicity of two actors reading letters, yet creating such profound emotion — this is what theater is all about. Bravo!','approved',NOW()-INTERVAL '2 days'),

  -- Comedy Premium League reviews
  ('a0a04004-a0a0-4004-a0a0-a0a040040004'::uuid,'e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9'::uuid,'a9a9a9a9-a9a9-a9a9-a9a9-a9a9a9a9a9a9'::uuid,
   '{"overall":5,"venue":4,"performance":5,"value":5}'::jsonb,
   'Laughed so hard my stomach hurt!',
   'The improv rounds were pure gold. Zakir Khan as a judge was hilarious — his commentary was funnier than some of the acts! Great value for money. The Bandra Fort venue under the stars was perfect for a comedy night.','approved',NOW()-INTERVAL '2 days'),

  ('a0a05005-a0a0-5005-a0a0-a0a050050005'::uuid,'e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9'::uuid,'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1'::uuid,
   '{"overall":4,"venue":3,"performance":4,"value":4}'::jsonb,
   'Solid comedy but venue was cramped',
   'The comedy was top-notch — Biswa''s set was the highlight of the night. However, the premium seats were too close together and sight lines weren''t great. The amphitheatre needs better seating arrangements. Still worth going.','approved',NOW()-INTERVAL '1 day'),

  ('a0a06006-a0a0-6006-a0a0-a0a060060006'::uuid,'e9e9e9e9-e9e9-e9e9-e9e9-e9e9e9e9e9e9'::uuid,'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2'::uuid,
   '{"overall":5,"venue":4,"performance":5,"value":5}'::jsonb,
   'Best comedy show I have attended',
   'Went with two friends and all three of us agree — this was the best comedy event in Mumbai this year. The audience interaction was electric. Already looking forward to next season!','approved',NOW()-INTERVAL '12 hours'),

  -- Indie Music Fest reviews
  ('a0a07007-a0a0-7007-a0a0-a0a070070007'::uuid,'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1'::uuid,'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7'::uuid,
   '{"overall":5,"venue":5,"performance":5,"value":4}'::jsonb,
   'Bengaluru''s answer to Coachella',
   'What an incredible day! 12 bands, amazing food, art installations, and the palace grounds as a backdrop. Prateek Kuhad''s sunset set was one of the most magical moments of my life. The only knock is the food truck prices were a bit high.','approved',NOW()-INTERVAL '5 days'),

  ('a0a08008-a0a0-8008-a0a0-a0a080080008'::uuid,'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1'::uuid,'b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3'::uuid,
   '{"overall":5,"venue":5,"performance":5,"value":5}'::jsonb,
   'Best investment of the year — backstage was incredible',
   'I splurged on the backstage pass and it was absolutely worth it. Got to take photos with When Chai Met Toast and chat with the artists. The production quality was world-class. This needs to become an annual thing.','approved',NOW()-INTERVAL '4 days'),

  ('a0a09009-a0a0-9009-a0a0-a0a090090009'::uuid,'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1'::uuid,'55555555-5555-5555-5555-555555555555'::uuid,
   '{"overall":4,"venue":4,"performance":4,"value":5}'::jsonb,
   'Great vibe, great music, great people',
   'Went with my family of four and everyone had a blast. The kids loved the art installations and we loved the music. Only wished there were more shaded areas — the afternoon sun was brutal. Otherwise, 10/10 would go again.','approved',NOW()-INTERVAL '3 days'),

  -- More Mughal-E-Azam reviews (adding to existing 2)
  ('a0a0a00a-a0a0-a00a-a0a0-a0a0a00a000a'::uuid,'cccc3333-cccc-3333-cccc-333333333333'::uuid,'a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6'::uuid,
   '{"overall":5,"venue":5,"performance":5,"value":4}'::jsonb,
   'Broadway-level production in Mumbai!',
   'The sets were jaw-dropping — literally transported back to the Mughal era. The singing was live and flawless. I have seen the original film dozens of times and this adaptation honoured it perfectly while adding its own magic.','approved',NOW()-INTERVAL '18 hours')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- ✅ EXPANDED SEEDING COMPLETE — 18 users, 13 events, 11 bookings, 12 reviews
-- ==============================================================================
