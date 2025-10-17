# SUPERADMIN Setup Instructions

## Quick Setup for Superadmin Account

### Credentials
- **Email**: superadmin@gmail.com
- **Password**: superadmin123

---

## Step-by-Step Setup Process

### Step 1: Sign Up the Superadmin User
1. Navigate to `/auth` in your application
2. Click on "Sign Up" if you're on the login form
3. Fill in the registration form:
   - **Email**: `superadmin@gmail.com`
   - **Password**: `superadmin123`
   - **Full Name**: `Super Admin` (or your preferred name)
4. Click "Sign Up"

> **Note**: The application has auto-confirm enabled, so you should be logged in immediately.

---

### Step 2: Grant Admin Role via Database

Once the user is created, you need to manually assign the admin role in the database.

#### Option A: Using Lovable Cloud Backend (Recommended)

1. Open your backend dashboard:
   - Click the "Backend" or "Database" button in Lovable
   
2. Navigate to **SQL Editor**

3. First, find the user ID by running:
   ```sql
   SELECT id, email, created_at 
   FROM auth.users 
   WHERE email = 'superadmin@gmail.com';
   ```

4. Copy the `id` (UUID) from the result

5. Insert the admin role:
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('PASTE_USER_ID_HERE', 'admin')
   ON CONFLICT (user_id, role) DO NOTHING;
   ```

   Replace `PASTE_USER_ID_HERE` with the actual UUID you copied.

#### Option B: Using Table Editor

1. Open your backend dashboard
2. Navigate to **Table Editor**
3. Open the `user_roles` table
4. Click **Insert row**
5. Fill in:
   - `user_id`: Get this from the `profiles` table (same as auth.users id)
   - `role`: Select `admin` from dropdown
6. Click **Save**

---

### Step 3: Verify Admin Access

1. **Log out** (if you're already logged in as the user)
2. **Log back in** with:
   - Email: `superadmin@gmail.com`
   - Password: `superadmin123`
3. You should now see **"Admin Dashboard"** in the navbar
4. Navigate to `/admin` to access the admin panel

---

## Admin Capabilities

Once logged in as superadmin, you have full access to:

### 📊 Dashboard (`/admin`)
- View total members, events, revenue, and active bookings
- Quick overview of platform statistics

### 🎉 Events Management (`/admin/events`)
- **Create** new events with full details:
  - Event name, description, date, time
  - Venue and map link
  - Capacity limits
  - Lunch/dinner pricing
  - Allowed membership tiers
  - Event image
- **Edit** existing events
- **Delete** events
- **Publish/Unpublish** events (draft vs published)
- View all event bookings

### 👥 Users Management (`/admin/users`)
- View all registered users
- See user profile information:
  - Full name, email, phone
  - Family size and address
  - Join date
- View user membership status and tier
- Monitor user activity

### 💳 Payments Management (`/admin/payments`)
- Track all payment transactions
- View payment details:
  - User information
  - Event booking details
  - Amount and payment gateway
  - Transaction ID
  - Payment status (success/pending/failed/refunded)
- Monitor revenue

### 🎫 Memberships
- Default memberships are pre-configured:
  - **Platinum** - ₹25,000/year
  - **Diamond** - ₹50,000/year  
  - **Gold** - ₹15,000/year
- Can view membership benefits and pricing

---

## Security Notes

### 🔐 Security Best Practices

1. **Change the default password** after first login:
   - While logged in, go to your profile
   - Update the password from `superadmin123` to a strong password

2. **Admin verification is server-side**:
   - Admin status is checked via database using `has_role()` function
   - Cannot be spoofed from client-side
   - All admin routes are protected with Row Level Security

3. **Never share admin credentials**:
   - Admin accounts have full platform access
   - Create separate admin accounts for team members
   - Do not use the same password across accounts

4. **RLS Policies protect all data**:
   - Only users with `admin` role in `user_roles` table can access admin features
   - Regular users cannot access admin endpoints
   - All database queries respect RLS policies

---

## Adding More Admins

To create additional admin users:

1. Have them sign up normally through `/auth`
2. Follow **Step 2** above to grant them the admin role
3. They'll need to log out and log back in to see admin features

---

## Database Schema Reference

All admin capabilities are powered by these tables:
- `user_roles` - Stores admin/user role assignments
- `profiles` - User profile information
- `events` - Event listings
- `event_bookings` - Event booking records
- `payments` - Payment transactions
- `memberships` - Membership tier definitions
- `user_memberships` - User membership subscriptions

See `db.sql` for complete database schema.

---

## Troubleshooting

### "Admin Dashboard" link not showing?
1. Log out and log back in
2. Verify the admin role was inserted correctly:
   ```sql
   SELECT ur.role, p.email 
   FROM user_roles ur
   JOIN auth.users p ON ur.user_id = p.id
   WHERE p.email = 'superadmin@gmail.com';
   ```
3. Should return `admin` role

### Can't access `/admin` routes?
- Make sure you're logged in
- Verify admin role exists in database
- Clear browser cache and try again

### Changes not reflecting?
- Wait a few seconds for auth state to update
- Refresh the page
- Log out and log back in

---

## Quick SQL Commands

```sql
-- View all admins
SELECT u.email, u.created_at, ur.role
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role = 'admin';

-- View all users with their roles
SELECT u.email, p.full_name, ur.role
FROM auth.users u
JOIN profiles p ON u.id = p.id
LEFT JOIN user_roles ur ON u.id = ur.user_id;

-- Remove admin role (use carefully!)
DELETE FROM user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'superadmin@gmail.com')
AND role = 'admin';
```
