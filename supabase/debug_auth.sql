-- ==============================================================================
-- 🔍 DIAGNOSTIC: Compare working vs seeded identities
-- ==============================================================================
-- Run this in the SQL Editor and SHARE the full output with me
-- ==============================================================================

-- 1. Show a WORKING identity (your test user account)
SELECT 'WORKING USER' as label, 
  u.id, u.email, u.instance_id, u.aud, u.role as auth_role,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  i.id as identity_id, i.provider, i.provider_id,
  i.identity_data
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id
WHERE u.email NOT LIKE '%mehfil%' AND u.email NOT LIKE '%example.com'
LIMIT 1;

-- 2. Show a SEEDED identity  
SELECT 'SEEDED USER' as label,
  u.id, u.email, u.instance_id, u.aud, u.role as auth_role,
  u.email_confirmed_at IS NOT NULL as email_confirmed,
  i.id as identity_id, i.provider, i.provider_id,
  i.identity_data
FROM auth.users u
LEFT JOIN auth.identities i ON i.user_id = u.id
WHERE u.email = 'ncpaworld@mehfil.in'
LIMIT 1;
