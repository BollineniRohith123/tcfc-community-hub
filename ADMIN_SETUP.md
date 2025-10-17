# TCFC Admin Setup Guide

## Creating the First Admin User

To set up the first superadmin for your TCFC platform:

### Step 1: Sign Up a New User
1. Navigate to `/auth` on your application
2. Create a new account with:
   - Email: `admin@tcfc.com` (or your preferred admin email)
   - Password: Choose a strong password
   - Full Name: Your name

### Step 2: Make the User an Admin

You need to manually add the admin role to this user in the database.

#### Option A: Using Lovable Cloud Backend Dashboard
1. Click on "View Backend" in Lovable to open your backend dashboard
2. Navigate to the **Table Editor**
3. Open the `user_roles` table
4. Click **Insert row**
5. Fill in:
   - `user_id`: Copy the UUID from the `profiles` table for your admin user
   - `role`: Select `admin` from the dropdown
6. Save the row

#### Option B: Using SQL Editor
1. Open the SQL Editor in your backend dashboard
2. Run this query (replace `YOUR_USER_EMAIL` with the admin email):

```sql
-- Find your user ID first
SELECT id, email FROM auth.users WHERE email = 'YOUR_USER_EMAIL';

-- Then insert the admin role (replace USER_ID_HERE with the actual UUID)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin');
```

### Step 3: Verify Admin Access
1. Log out and log back in with the admin account
2. You should now see an "Admin Dashboard" link in the navbar
3. Navigate to `/admin` to access the full admin panel

## Admin Panel Features

Once logged in as an admin, you have access to:

### Dashboard (`/admin`)
- Overview statistics (users, events, bookings, revenue)
- Quick insights into platform activity

### Events Management (`/admin/events`)
- Create new events
- Edit existing events
- Delete events
- Publish/unpublish events
- Set event capacity, pricing, and allowed membership tiers

### Users Management (`/admin/users`)
- View all registered users
- See user membership status
- View user profiles and contact information

### Payments (`/admin/payments`)
- Track all payment transactions
- Monitor payment status
- View transaction details

## Security Notes

- **Never share admin credentials**
- Admin status is verified server-side using RLS policies
- Only users with `admin` role in `user_roles` table can access admin features
- All admin actions are protected by Row Level Security

## Adding More Admins

To add additional admin users:
1. Have them sign up normally through `/auth`
2. Follow Step 2 above to add their `user_id` to the `user_roles` table with role `admin`

## Environment Variables for PhonePe Integration

Add these to your `.env` file for payment processing:

```env
# PhonePe Payment Gateway
PHONEPE_MERCHANT_ID=your_merchant_id_here
PHONEPE_MERCHANT_KEY=your_merchant_key_here
PHONEPE_SALT_INDEX=1
```

Contact PhonePe to get your merchant credentials for production use.

## Default User Roles

When a user signs up, they automatically receive the `user` role. Only manually promoted users have the `admin` role.
