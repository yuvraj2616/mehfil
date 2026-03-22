-- ==============================================================================
-- 🔧 FIX v6: Restore instance_id and check auth logs
-- ==============================================================================

-- Step 1: Fix the NULL instance_id back to the correct all-zeros value
UPDATE auth.users 
SET 
  instance_id = '00000000-0000-0000-0000-000000000000',
  encrypted_password = crypt('password123', gen_salt('bf')),
  email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
  aud = 'authenticated',
  role = 'authenticated',
  is_sso_user = false,
  updated_at = NOW(),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}',
  raw_user_meta_data = '{}'
WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
  'a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2',
  'a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3',
  'a4a4a4a4-a4a4-a4a4-a4a4-a4a4a4a4a4a4',
  'a5a5a5a5-a5a5-a5a5-a5a5-a5a5a5a5a5a5',
  'a6a6a6a6-a6a6-a6a6-a6a6-a6a6a6a6a6a6',
  'a7a7a7a7-a7a7-a7a7-a7a7-a7a7a7a7a7a7',
  'a8a8a8a8-a8a8-a8a8-a8a8-a8a8a8a8a8a8',
  'a9a9a9a9-a9a9-a9a9-a9a9-a9a9a9a9a9a9',
  'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1',
  'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2',
  'b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3'
);

-- Step 2: Verify side-by-side comparison of working vs seeded user
SELECT u.email, u.instance_id, u.aud, u.role as auth_role,
  u.email_confirmed_at IS NOT NULL as confirmed,
  u.raw_app_meta_data,
  i.provider, i.provider_id
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id
ORDER BY u.created_at
LIMIT 5;
