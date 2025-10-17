// Simple script to assign admin role using Supabase client
// Run with: node scripts/assign-admin.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ryvgohmywawgudfygfgu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5dmdvaG15d2F3Z3VkZnlnZmd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NjU0NTksImV4cCI6MjA3NjA0MTQ1OX0.Y55PQUgbW8jcI3x9QCH1YE-FsLpvBparZpNHCO_Z9P4';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function assignAdminRole() {
  try {
    console.log('\n🔐 Logging in as superadmin...');
    
    // Login as superadmin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'superadmin@gmail.com',
      password: 'superadmin123'
    });
    
    if (authError) {
      throw new Error(`Login failed: ${authError.message}`);
    }
    
    const userId = authData.user.id;
    console.log(`✅ Logged in successfully (User ID: ${userId})`);
    
    // Check if admin role already exists
    console.log('\n🔍 Checking existing roles...');
    const { data: existingRoles, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId);
    
    if (roleCheckError) {
      console.error('Error checking roles:', roleCheckError);
    } else {
      console.log('Current roles:', existingRoles);
    }
    
    // Try to insert admin role
    console.log('\n➕ Attempting to add admin role...');
    const { data: insertData, error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      })
      .select();
    
    if (insertError) {
      if (insertError.code === '23505') {
        console.log('ℹ️  Admin role already exists for this user');
      } else {
        console.error('❌ Error inserting admin role:', insertError);
        console.log('\n💡 This might be due to RLS policies. You need to run the SQL directly in Supabase:');
        console.log(`
INSERT INTO public.user_roles (user_id, role)
VALUES ('${userId}', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
        `);
      }
    } else {
      console.log('✅ Admin role assigned successfully!', insertData);
    }
    
    // Verify the role
    console.log('\n🔍 Verifying admin role...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();
    
    if (verifyError) {
      console.log('⚠️  Could not verify admin role:', verifyError.message);
    } else if (verifyData) {
      console.log('✅ Admin role verified!');
    }
    
    console.log('\n🎉 Process complete!');
    console.log('📝 Next steps:');
    console.log('   1. If the role was not added automatically, run the SQL query shown above in Supabase SQL Editor');
    console.log('   2. Log out and log back in to the application');
    console.log('   3. You should now see "Admin Dashboard" in the navbar');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

assignAdminRole();

