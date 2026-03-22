// ==============================================================================
// 🔧 Create test users via Supabase Admin API (the proper way)
// ==============================================================================
// Run: node supabase/create_test_users.mjs
// ==============================================================================

const SUPABASE_URL = 'https://tilckngdpyhstztdcxdn.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpbGNrbmdkcHloc3R6dGRjeGRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc2MjU3MiwiZXhwIjoyMDg5MzM4NTcyfQ.4n3rKR2IRggCRJe6cDbFsEb7RVw5Cg5eN3swFrR4gNE';

const TEST_USERS = [
  // Organizers
  { email: 'ncpa.world@mehfil.dev', password: 'password123', name: 'NCPA Mumbai', role: 'organizer', bio: "India's premier institution for the performing arts.", avatar: 'https://images.unsplash.com/photo-1514300302302-3c1aeb6c1e55?q=80&w=250&auto=format&fit=crop' },
  { email: 'comedy.club@mehfil.dev', password: 'password123', name: 'The Comedy Club', role: 'organizer', bio: 'Bringing the best standup comedians to your city.', avatar: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=250&auto=format&fit=crop' },
  { email: 'priya.mehta@mehfil.dev', password: 'password123', name: 'Priya Mehta Events', role: 'organizer', bio: 'Premium cultural events across Bengaluru & Chennai.', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250&auto=format&fit=crop' },
  
  // Artists
  { email: 'zakir.khan@mehfil.dev', password: 'password123', name: 'Zakir Khan', role: 'artist', bio: 'Sakht launda turning life tragedies into comedy gold.', avatar: 'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=250&auto=format&fit=crop' },
  { email: 'ar.rahman@mehfil.dev', password: 'password123', name: 'A.R. Rahman', role: 'artist', bio: 'Oscar-winning composer and music maestro.', avatar: 'https://images.unsplash.com/photo-1516280440502-12fc06d860e3?q=80&w=250&auto=format&fit=crop' },
  { email: 'prateek.kuhad@mehfil.dev', password: 'password123', name: 'Prateek Kuhad', role: 'artist', bio: 'Indie folk singer-songwriter from Jaipur.', avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=250&auto=format&fit=crop' },

  // Attendees
  { email: 'aisha.sharma@mehfil.dev', password: 'password123', name: 'Aisha Sharma', role: 'attendee', bio: 'Love attending indie music gigs.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=250&auto=format&fit=crop' },
  { email: 'rohan.gupta@mehfil.dev', password: 'password123', name: 'Rohan Gupta', role: 'attendee', bio: 'Comedy enthusiast from Delhi.', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=250&auto=format&fit=crop' },
  { email: 'kavya.singh@mehfil.dev', password: 'password123', name: 'Kavya Singh', role: 'attendee', bio: 'Poet & theater fan from Jaipur.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=250&auto=format&fit=crop' },
];

async function createUser(user) {
  // Step 1: Create auth user via Admin API
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { name: user.name },
    }),
  });

  const result = await createRes.json();

  if (!createRes.ok) {
    if (result.msg?.includes('already been registered') || result.message?.includes('already been registered')) {
      console.log(`  ⏭️  ${user.email} already exists, updating profile...`);
      // Get existing user
      const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, {
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
        },
      });
      const listData = await listRes.json();
      const existingUser = listData.users?.find(u => u.email === user.email);
      if (existingUser) {
        await updateProfile(existingUser.id, user);
      }
      return;
    }
    console.error(`  ❌ Failed to create ${user.email}:`, result);
    return;
  }

  console.log(`  ✅ Created ${user.email} (${result.id})`);
  
  // Step 2: Update profile with role, bio, avatar
  await updateProfile(result.id, user);
}

async function updateProfile(userId, user) {
  const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({
      name: user.name,
      role: user.role,
      bio: user.bio,
      avatar: user.avatar,
    }),
  });

  if (updateRes.ok) {
    console.log(`  📝 Updated profile for ${user.email} → ${user.role}`);
  } else {
    const err = await updateRes.text();
    console.error(`  ⚠️  Profile update failed for ${user.email}:`, err);
  }
}

async function main() {
  console.log('🚀 Creating test users via Supabase Admin API...\n');

  for (const user of TEST_USERS) {
    await createUser(user);
    console.log('');
  }

  console.log('✅ Done! All test users created.');
  console.log('\n📋 Test login credentials:');
  console.log('   Password for all: password123');
  console.log('   Organizer: ncpa.world@mehfil.dev');
  console.log('   Artist:    zakir.khan@mehfil.dev');
  console.log('   Attendee:  aisha.sharma@mehfil.dev');
}

main().catch(console.error);
