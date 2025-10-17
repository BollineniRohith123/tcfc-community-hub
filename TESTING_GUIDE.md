# TCFC Community Hub - Complete Testing Guide

## 🎯 Overview
This document provides a comprehensive guide for testing all features of the TCFC Community Hub application.

## ✅ Issues Fixed

### 1. Admin Dashboard Access Issue - FIXED ✅
**Problem:** Navbar was checking for hardcoded email `admin@tcfc.com` instead of using the `isAdmin` flag from the auth context.

**Solution:** Updated `src/components/Navbar.tsx` to:
- Import `isAdmin` from `useAuth` hook
- Check `isAdmin` flag instead of specific email
- Now works with any user who has admin role in `user_roles` table

**Files Modified:**
- `src/components/Navbar.tsx` - Lines 10, 54, 101

### 2. Mock PhonePe Integration - IMPLEMENTED ✅
**Created:** Mock payment gateway for testing without actual PhonePe credentials

**New Files:**
- `supabase/functions/phonepe-payment-mock/index.ts` - Mock payment initiation
- `supabase/functions/phonepe-callback-mock/index.ts` - Mock payment callback handler
- `src/pages/PaymentSuccess.tsx` - Payment success page
- `src/pages/PaymentFailed.tsx` - Payment failure page

### 3. Membership Booking Flow - IMPLEMENTED ✅
**Updated:** `src/pages/Memberships.tsx` to include full payment flow

**Features:**
- Fetches memberships from database
- Checks if user already has active membership
- Initiates mock payment via edge function
- Shows loading states during payment
- Prevents duplicate membership purchases

## 🗄️ Database Schema Summary

### Tables (8 total):
1. **profiles** - User profile information
2. **user_roles** - User role assignments (admin/user)
3. **memberships** - Membership tier definitions (Gold, Diamond, Platinum)
4. **user_memberships** - User membership records
5. **events** - Event information
6. **event_bookings** - Event booking records
7. **payments** - Payment transaction records
8. **cms_content** - CMS content management

### Key Functions:
- `has_role(user_id, role)` - Check if user has specific role
- `handle_new_user()` - Trigger to create profile and assign user role on signup

### Membership Tiers:
- **Gold**: ₹15,000/year
- **Diamond**: ₹30,000/year
- **Platinum**: ₹25,000/year (Note: db.sql shows ₹25,000, but UI shows ₹50,000 - needs alignment)

## 🧪 Testing Checklist

### A. Superadmin Testing

#### 1. Login as Superadmin ✅
- **Email:** superadmin@gmail.com
- **Password:** superadmin123
- **Expected:** Successfully login and see "Admin Dashboard" link in navbar

#### 2. Admin Dashboard ✅
- Navigate to `/admin`
- **Expected:** See dashboard with stats:
  - Total Members
  - Total Events
  - Total Revenue
  - Active Bookings

#### 3. Event Management
**Create Event:**
1. Click "Events" in admin sidebar
2. Click "Create Event" button
3. Fill in event details:
   - Title: "Diwali Family Celebration 2025"
   - Description: Event description
   - Date: Future date
   - Time: Start and end time
   - Venue: "TCFC Community Hall, Tirupati"
   - Capacity: 100
   - Lunch Price: ₹500
   - Dinner Price: ₹800
   - Allowed Tiers: All (Platinum, Diamond, Gold)
   - Status: Published
4. Click "Create Event"
5. **Expected:** Event created successfully and appears in events list

**Edit Event:**
1. Click "Edit" on an existing event
2. Modify details
3. Click "Update Event"
4. **Expected:** Event updated successfully

**Delete Event:**
1. Click "Delete" on an event
2. Confirm deletion
3. **Expected:** Event removed from list

#### 4. User Management
- Navigate to `/admin/users`
- **Expected:** See list of all registered users
- View user details, membership status

#### 5. Payment Management
- Navigate to `/admin/payments`
- **Expected:** See all payment transactions
- Filter by status (pending, success, failed)

### B. User Flow Testing

#### 1. User Signup
1. Navigate to `/auth`
2. Click "Sign Up" tab
3. Fill in:
   - Full Name: "Test User"
   - Email: "testuser@example.com"
   - Password: "testpass123"
4. Click "Sign Up"
5. **Expected:** 
   - User created successfully
   - Automatically logged in
   - Profile created in `profiles` table
   - User role assigned in `user_roles` table

#### 2. User Login
1. Navigate to `/auth`
2. Enter credentials
3. Click "Sign In"
4. **Expected:** Successfully logged in, redirected to home

#### 3. Browse Events
1. Navigate to `/events`
2. **Expected:** See list of published events
3. Click on an event
4. **Expected:** See event details

#### 4. Membership Purchase (Mock Payment)
1. Login as regular user
2. Navigate to `/memberships`
3. Click "Choose Gold" (or any tier)
4. **Expected:**
   - Button shows "Processing..." with spinner
   - Mock payment initiated
   - Redirected to mock payment URL
   - After 2 seconds, redirected to `/payment-success`
   - User membership created in database
   - Payment record created with status "success"

5. Try to purchase another membership
6. **Expected:** Error message "You already have an active membership!"

#### 5. Event Booking (Mock Payment)
1. Login as user with active membership
2. Navigate to `/events`
3. Click on a published event
4. Click "Book Event"
5. Fill in booking details:
   - Number of attendees
   - Meal preferences (lunch/dinner)
6. Click "Proceed to Payment"
7. **Expected:**
   - Mock payment initiated
   - Booking created with status "pending"
   - Payment record created
   - Redirected to payment gateway
   - After payment success, booking status updated to "confirmed"
   - Redirected to `/payment-success`

#### 6. View Profile
1. Navigate to `/profile`
2. **Expected:** See:
   - User information
   - Active membership details
   - Upcoming event bookings
   - Payment history

### C. Mock Payment Testing

#### Test Mock Payment Success Flow:
1. Initiate any payment (membership or event)
2. Mock payment function creates payment record
3. Returns mock payment URL with `status=success`
4. Callback function processes payment
5. Updates payment status to "success"
6. Updates booking/membership accordingly
7. Redirects to `/payment-success`

#### Test Mock Payment Failure Flow:
1. Manually navigate to callback with `status=failed`
2. **Expected:** 
   - Payment status updated to "failed"
   - Booking remains "pending"
   - Redirected to `/payment-failed`

## 🚀 Setup Instructions

### 1. Environment Setup
Ensure `.env` file has:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup
Run the SQL from `db.sql` in Supabase SQL Editor to create:
- All tables
- Functions
- Triggers
- RLS policies
- Default membership data

### 3. Assign Admin Role
Run the script to assign admin role to superadmin:
```bash
node scripts/assign-admin.js
```

### 4. Deploy Edge Functions (Optional for Mock)
To deploy mock payment functions to Supabase:
```bash
supabase functions deploy phonepe-payment-mock
supabase functions deploy phonepe-callback-mock
```

### 5. Start Development Server
```bash
npm run dev
```

## 🔧 Known Issues & Future Improvements

### Issues to Fix:
1. **Membership Price Mismatch:** Database shows Platinum at ₹25,000 but UI shows ₹50,000
2. **Event Form Date/Time Input:** Complex date/time pickers need better UX
3. **TypeScript Type Issues:** Some Supabase queries have type instantiation warnings

### Future Enhancements:
1. **Real PhonePe Integration:** Replace mock with actual PhonePe gateway
2. **Email Notifications:** Send confirmation emails for bookings and memberships
3. **Image Upload:** Allow admins to upload event images instead of URLs
4. **Advanced Filtering:** Add filters for events (by date, tier, status)
5. **Analytics Dashboard:** Add charts and graphs to admin dashboard
6. **Membership Upgrades:** Allow users to upgrade their membership tier
7. **Refund Management:** Handle payment refunds and cancellations
8. **Mobile App:** Create React Native mobile app

## 📊 Test Data

### Superadmin Account:
- Email: superadmin@gmail.com
- Password: superadmin123
- User ID: 500249c3-3e45-4915-9054-71ed30887dec

### Test User Account (Create during testing):
- Email: testuser@example.com
- Password: testpass123

### Sample Event Data:
- Title: "Diwali Family Celebration 2025"
- Venue: "TCFC Community Hall, Tirupati"
- Capacity: 100
- Lunch: ₹500
- Dinner: ₹800

## 🎯 Success Criteria

The application is considered 100% working when:
- ✅ Superadmin can login and access admin panel
- ✅ Superadmin can create, edit, delete events
- ✅ Users can signup and login
- ✅ Users can purchase memberships (mock payment)
- ✅ Users can book events (mock payment)
- ✅ Payment success/failure flows work correctly
- ✅ All database operations work with RLS policies
- ✅ No console errors or warnings
- ✅ Responsive design works on mobile and desktop

## 📝 Notes

- Mock payment automatically succeeds after 2 seconds
- All payments are recorded in the `payments` table
- RLS policies ensure users can only see their own data
- Admin users can see all data
- Membership validity is 1 year from purchase date
- Event bookings require active membership

## 🆘 Troubleshooting

### Admin Dashboard not showing:
- Check if user has admin role in `user_roles` table
- Run `node scripts/assign-admin.js` to assign admin role
- Clear browser cache and reload

### Payment not working:
- Check browser console for errors
- Verify Supabase edge functions are deployed
- Check if user is authenticated
- Verify payment record is created in database

### Database errors:
- Check RLS policies are enabled
- Verify user has correct permissions
- Check Supabase logs for detailed errors

## 📞 Support

For issues or questions:
- Check browser console for errors
- Review Supabase logs
- Verify database schema matches `db.sql`
- Ensure all environment variables are set correctly

