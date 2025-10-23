-- TCFC Platform - Complete Database Schema
-- This file contains all tables, functions, triggers, and policies

-- =====================================================
-- ENUMS
-- =====================================================

-- Membership tier levels
CREATE TYPE public.membership_tier AS ENUM ('platinum', 'diamond', 'gold');

-- Application roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Event status
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'cancelled');

-- Booking status
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Payment status
CREATE TYPE public.payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');

-- =====================================================
-- TABLES
-- =====================================================

-- User Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  family_size INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User Roles Table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, role)
);

-- Memberships Table
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  tier membership_tier NOT NULL,
  price NUMERIC NOT NULL,
  duration_months INTEGER DEFAULT 12 NOT NULL,
  benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User Memberships Table
CREATE TABLE public.user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE NOT NULL,
  start_date DATE DEFAULT CURRENT_DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Events Table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue TEXT NOT NULL,
  venue_map_link TEXT,
  image_url TEXT,
  max_capacity INTEGER DEFAULT 100 NOT NULL,
  lunch_price NUMERIC DEFAULT 0,
  dinner_price NUMERIC DEFAULT 0,
  is_free BOOLEAN DEFAULT false NOT NULL,
  allowed_tiers membership_tier[] DEFAULT ARRAY['platinum', 'diamond', 'gold']::membership_tier[],
  status event_status DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON COLUMN public.events.is_free IS 'If true, the event is free and does not require payment';

-- Event Bookings Table
CREATE TABLE public.event_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  num_adults INTEGER DEFAULT 1 NOT NULL,
  num_children INTEGER DEFAULT 0 NOT NULL,
  children_ages INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  include_lunch BOOLEAN DEFAULT false NOT NULL,
  include_dinner BOOLEAN DEFAULT false NOT NULL,
  total_amount NUMERIC NOT NULL,
  status booking_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

COMMENT ON COLUMN public.event_bookings.children_ages IS 'Array of ages for each child in the booking';

-- Payments Table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.event_bookings(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  status payment_status DEFAULT 'pending' NOT NULL,
  payment_gateway TEXT DEFAULT 'phonepe' NOT NULL,
  transaction_id TEXT,
  payment_method TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- CMS Content Table
CREATE TABLE public.cms_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  content JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_memberships_updated_at
  BEFORE UPDATE ON public.user_memberships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_bookings_updated_at
  BEFORE UPDATE ON public.event_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cms_content_updated_at
  BEFORE UPDATE ON public.cms_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- User Roles Policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Memberships Policies
CREATE POLICY "Anyone can view memberships"
  ON public.memberships FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage memberships"
  ON public.memberships FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- User Memberships Policies
CREATE POLICY "Users can view own membership"
  ON public.user_memberships FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user memberships"
  ON public.user_memberships FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Events Policies
CREATE POLICY "Anyone can view published events"
  ON public.events FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage all events"
  ON public.events FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Event Bookings Policies
CREATE POLICY "Users can view own bookings"
  ON public.event_bookings FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own bookings"
  ON public.event_bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all bookings"
  ON public.event_bookings FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Payments Policies
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all payments"
  ON public.payments FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- CMS Content Policies
CREATE POLICY "Anyone can view CMS content"
  ON public.cms_content FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage CMS content"
  ON public.cms_content FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default membership tiers
INSERT INTO public.memberships (name, description, tier, price, duration_months, benefits) VALUES
('Platinum Membership', 'Premium membership with exclusive benefits', 'platinum', 25000, 12, 
  '["Priority event access", "Free lunch at all events", "Exclusive platinum lounge access", "Monthly newsletter"]'::jsonb),
('Diamond Membership', 'Elite membership with VIP treatment', 'diamond', 50000, 12,
  '["VIP event access", "Free lunch and dinner", "Diamond club exclusive events", "Personal concierge service", "Priority booking"]'::jsonb),
('Gold Membership', 'Standard membership with great perks', 'gold', 15000, 12,
  '["Event access", "Discounted lunch/dinner", "Community events", "Quarterly newsletter"]'::jsonb);

-- =====================================================
-- ADMIN SETUP INSTRUCTIONS
-- =====================================================

-- To create a superadmin:
-- 1. Sign up at /auth with email: superadmin@gmail.com, password: superadmin123
-- 2. After signup, run this query (replace USER_ID with the actual UUID from auth.users):

-- First, find the user ID:
-- SELECT id, email FROM auth.users WHERE email = 'superadmin@gmail.com';

-- Then insert the admin role:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('USER_ID_HERE', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Total Tables: 8
-- 1. profiles - User profile information
-- 2. user_roles - User role assignments (admin/user)
-- 3. memberships - Membership tier definitions
-- 4. user_memberships - User membership subscriptions
-- 5. events - Event listings and details
-- 6. event_bookings - Event booking records
-- 7. payments - Payment transactions
-- 8. cms_content - CMS page content

-- Total Functions: 3
-- 1. has_role() - Check user role (security definer)
-- 2. handle_new_user() - Auto-create profile and assign user role on signup
-- 3. update_updated_at_column() - Auto-update timestamps

-- Total Triggers: 8
-- Auto-update triggers for all tables with updated_at columns
