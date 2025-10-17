import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Hardcoded credentials from .env file
const supabaseUrl = 'https://ryvgohmywawgudfygfgu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmdvaG15d2F3Z3VkZnlnZmd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjU0NTksImV4cCI6MjA3NjA0MTQ1OX0.Y55PQUgbW8jcI3x9QCH1YE-FsLpvBparZpNHCO_Z9P4';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSPolicies() {
  console.log('🔧 Attempting to fix RLS policies...\n');

  // Read the migration file
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251017_add_user_payment_insert_policy.sql');
  let migrationSQL;
  
  try {
    migrationSQL = readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded successfully\n');
  } catch (error) {
    console.error('❌ Failed to read migration file:', error.message);
    process.exit(1);
  }

  // Try to execute the SQL
  console.log('Attempting to execute SQL migration...');
  console.log('Note: This may fail if the anon key does not have sufficient permissions.\n');

  try {
    // The Supabase JS client doesn't support executing raw DDL SQL
    // We need to use the REST API directly
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ query: migrationSQL })
    });

    if (response.ok) {
      console.log('✅ RLS policies applied successfully!');
      return true;
    } else {
      const error = await response.text();
      console.log('❌ Failed to apply RLS policies via API');
      console.log('Response:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to execute SQL:', error.message);
    return false;
  }
}

async function verifyFix() {
  console.log('\n🔍 Verifying RLS policies...\n');

  // Try to login as a test user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'testuser@tcfc.com',
    password: 'testpass123'
  });

  if (authError) {
    console.log('⚠️  Could not login as test user:', authError.message);
    return false;
  }

  console.log('✅ Logged in as test user');

  // Try to insert a test membership (this will fail if RLS is not fixed)
  const testEndDate = new Date();
  testEndDate.setFullYear(testEndDate.getFullYear() + 1);

  const { data, error } = await supabase
    .from('user_memberships')
    .insert({
      user_id: authData.user.id,
      membership_id: '00000000-0000-0000-0000-000000000001', // Dummy ID
      start_date: new Date().toISOString().split('T')[0],
      end_date: testEndDate.toISOString().split('T')[0],
      is_active: true,
    })
    .select();

  if (error) {
    if (error.message.includes('row-level security')) {
      console.log('❌ RLS policies still not working');
      console.log('Error:', error.message);
      return false;
    } else if (error.message.includes('foreign key')) {
      // This is expected - the membership_id doesn't exist
      // But it means RLS is working!
      console.log('✅ RLS policies are working! (Got expected foreign key error)');
      return true;
    } else {
      console.log('⚠️  Unexpected error:', error.message);
      return false;
    }
  }

  // If we got here, the insert worked (unlikely with dummy ID)
  console.log('✅ RLS policies are working!');
  
  // Clean up the test record
  if (data && data[0]) {
    await supabase.from('user_memberships').delete().eq('id', data[0].id);
  }

  return true;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  RLS POLICY FIX SCRIPT');
  console.log('═══════════════════════════════════════════════════════════\n');

  const fixed = await fixRLSPolicies();

  if (!fixed) {
    console.log('\n⚠️  AUTOMATIC FIX FAILED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('The anon key does not have permission to create policies.');
    console.log('You need to apply the migration manually using one of these methods:\n');
    console.log('1. Supabase Dashboard:');
    console.log('   - Go to https://supabase.com/dashboard');
    console.log('   - Navigate to SQL Editor');
    console.log('   - Run the SQL from: supabase/migrations/20251017_add_user_payment_insert_policy.sql\n');
    console.log('2. Supabase CLI:');
    console.log('   - Run: supabase login');
    console.log('   - Run: supabase link --project-ref ryvgohmywawgudfygfgu');
    console.log('   - Run: supabase db push\n');
    console.log('See CRITICAL_FIX_REQUIRED.md for detailed instructions.');
    console.log('═══════════════════════════════════════════════════════════\n');
    process.exit(1);
  }

  // Verify the fix worked
  const verified = await verifyFix();

  if (verified) {
    console.log('\n✅ SUCCESS! RLS policies are now working correctly.');
    console.log('═══════════════════════════════════════════════════════════\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Fix applied but verification failed.');
    console.log('Please check the policies manually.');
    console.log('═══════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

main();

