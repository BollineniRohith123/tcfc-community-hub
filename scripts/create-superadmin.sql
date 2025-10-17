-- Script to assign admin role to superadmin@gmail.com
-- Run this in your Supabase SQL Editor

-- First, let's check if the user exists
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'superadmin@gmail.com';

-- If the user exists, insert the admin role
-- This will automatically use the user_id from the query above
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'superadmin@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the admin role was assigned
SELECT u.email, u.created_at, ur.role
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'superadmin@gmail.com';

