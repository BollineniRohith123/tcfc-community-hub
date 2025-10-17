import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ryvgohmywawgudfygfgu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('\nPlease run this script with:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key npm run assign-admin');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function assignAdminRole(email: string) {
  try {
    console.log(`\n🔍 Looking for user with email: ${email}`);
    
    // Find the user by email
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Error fetching users: ${userError.message}`);
    }
    
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }
    
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    
    // Check if user already has admin role
    const { data: existingRole, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();
    
    if (existingRole) {
      console.log(`ℹ️  User already has admin role`);
      return;
    }
    
    // Insert admin role
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: 'admin'
      });
    
    if (insertError) {
      throw new Error(`Error inserting admin role: ${insertError.message}`);
    }
    
    console.log(`✅ Successfully assigned admin role to ${email}`);
    console.log(`\n🎉 Done! User can now access the admin dashboard at /admin`);
    console.log(`   Please log out and log back in for changes to take effect.`);
    
  } catch (error) {
    console.error(`\n❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

// Get email from command line argument or use default
const email = process.argv[2] || 'superadmin@gmail.com';

assignAdminRole(email);

