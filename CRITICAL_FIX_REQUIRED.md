# CRITICAL FIX REQUIRED - RLS Policies Missing

## Issue
During testing, we discovered that the `user_memberships` and `payments` tables have Row Level Security (RLS) enabled but are missing critical policies that allow users to create their own records.

### Error Messages
1. **Payments Table:** `new row violates row-level security policy for table "payments"`
2. **User Memberships Table:** `new row violates row-level security policy for table "user_memberships"`

## Root Cause
The database schema (`db.sql`) enables RLS on these tables but doesn't define policies for INSERT operations by regular users:
- `payments` table: Only has SELECT and admin policies
- `user_memberships` table: Has NO policies at all

## Solution
A migration file has been created at: `supabase/migrations/20251017_add_user_payment_insert_policy.sql`

### To Apply the Fix

#### Option 1: Using Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project: `ryvgohmywawgudfygfgu`
3. Navigate to SQL Editor
4. Copy and paste the contents of `supabase/migrations/20251017_add_user_payment_insert_policy.sql`
5. Click "Run"

#### Option 2: Using Supabase CLI
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref ryvgohmywawgudfygfgu

# Apply the migration
supabase db push
```

## Migration SQL
```sql
-- Add policy to allow users to create their own payment records
CREATE POLICY "Users can create own payments"
  ON public.payments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Add policies for user_memberships table
CREATE POLICY "Users can view own memberships"
  ON public.user_memberships FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own memberships"
  ON public.user_memberships FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all memberships"
  ON public.user_memberships FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

## Impact
**Without this fix:**
- ❌ Users cannot purchase memberships
- ❌ Users cannot book events
- ❌ Payment flow is completely broken

**After applying the fix:**
- ✅ Users can purchase memberships
- ✅ Users can book events
- ✅ Payment flow works correctly
- ✅ Users can only create/view their own records
- ✅ Admins can manage all records

## Testing After Fix
1. Navigate to http://localhost:8080/memberships
2. Click "Choose Gold" (or any tier)
3. Wait 2 seconds for mock payment processing
4. Should redirect to `/payment-success` page
5. Check profile page to verify membership appears

## Priority
🔴 **CRITICAL** - This must be fixed before the application can be used for membership purchases or event bookings.

## Status
- [x] Issue identified
- [x] Migration file created
- [ ] Migration applied to database
- [ ] Fix verified through testing

---

**Created:** 2025-10-17
**Last Updated:** 2025-10-17

