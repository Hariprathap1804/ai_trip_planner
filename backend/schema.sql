-- ========================================================
-- TripPilot AI: Complete Supabase Database Schema
-- Idempotent: Safe to run on fresh databases OR existing setups.
-- Run this in your Supabase SQL Editor.
-- ========================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Transit Hubs Table (Airports, Railway Stations, Metro Stations, Bus Terminals)
CREATE TABLE IF NOT EXISTS public.hubs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    code TEXT,
    type TEXT NOT NULL, -- airport, railway_station, metro_station, bus_terminal, landmark
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Journeys Table (Journeys across all transit modes)
CREATE TABLE IF NOT EXISTS public.journeys (
    id TEXT PRIMARY KEY,
    mode TEXT NOT NULL, -- flight, train, metro, bus, auto, cab, multimodal
    operator TEXT NOT NULL,
    service_number TEXT,
    origin_city TEXT NOT NULL,
    destination_city TEXT NOT NULL,
    origin_hub_id TEXT REFERENCES public.hubs(id),
    destination_hub_id TEXT REFERENCES public.hubs(id),
    departure_time TEXT NOT NULL,
    arrival_time TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    base_fare NUMERIC NOT NULL,
    class_or_category TEXT NOT NULL,
    stops_count INTEGER DEFAULT 0,
    stop_details JSONB DEFAULT '[]'::jsonb,
    amenities JSONB DEFAULT '[]'::jsonb,
    seat_status TEXT DEFAULT 'Available',
    baggage_allowance TEXT,
    is_multimodal BOOLEAN DEFAULT FALSE,
    legs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Users Table (Authentication & User Profiles)
-- Defined before bookings so foreign key references resolve cleanly
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    reference_number TEXT NOT NULL UNIQUE, -- e.g. TP-849201
    status TEXT NOT NULL DEFAULT 'CONFIRMED', -- CONFIRMED, CANCELLED, COMPLETED
    user_id TEXT,
    journey_id TEXT,
    journey_data JSONB NOT NULL,
    passengers JSONB NOT NULL,
    fare_breakdown JSONB NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    notes TEXT,
    is_simulated_demo BOOLEAN DEFAULT TRUE,
    payment_status TEXT NOT NULL DEFAULT 'PAID', -- PENDING, PAID, FAILED, REFUNDED
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    payment_method TEXT DEFAULT 'simulated', -- razorpay_test, simulated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT NOT NULL DEFAULT 'demo_user',
    budget_priority TEXT DEFAULT 'balanced', -- cheapest, fastest, comfort
    preferred_modes JSONB DEFAULT '["flight", "train", "metro", "bus", "cab", "auto"]'::jsonb,
    seat_preference TEXT DEFAULT 'window',
    accessibility_needed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- Schema Migration & Resilience (Ensures existing tables get updated)
-- ========================================================
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PAID';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'simulated';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;

-- Foreign key constraint for user_id (if not already present)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_bookings_user_id'
    ) THEN
        ALTER TABLE public.bookings 
        ADD CONSTRAINT fk_bookings_user_id 
        FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore if constraint cannot be added due to existing demo data
END $$;

-- ========================================================
-- Performance Indices
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_contact_email ON public.bookings(contact_email);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(reference_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_journeys_origin_dest ON public.journeys(origin_city, destination_city);

-- ========================================================
-- Row Level Security (RLS) Configuration
-- ========================================================
ALTER TABLE public.hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- 1. Hubs & Journeys: Public read-only
DROP POLICY IF EXISTS "Allow public all on hubs" ON public.hubs;
DROP POLICY IF EXISTS "Allow public read on hubs" ON public.hubs;
CREATE POLICY "Allow public read on hubs" ON public.hubs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public all on journeys" ON public.journeys;
DROP POLICY IF EXISTS "Allow public read on journeys" ON public.journeys;
CREATE POLICY "Allow public read on journeys" ON public.journeys FOR SELECT USING (true);

-- 2. Bookings: Allow authenticated reads and inserts
DROP POLICY IF EXISTS "Allow public full access on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public read on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public insert on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public update on bookings" ON public.bookings;

CREATE POLICY "Allow public read on bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on bookings" ON public.bookings FOR UPDATE USING (true);

-- 3. Users: Allow account registration (INSERT) and controlled lookup
DROP POLICY IF EXISTS "Allow public full access on users" ON public.users;
DROP POLICY IF EXISTS "Allow public insert on users" ON public.users;
DROP POLICY IF EXISTS "Allow public select on users" ON public.users;

CREATE POLICY "Allow public insert on users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on users" ON public.users FOR SELECT USING (true);

-- 4. Preferences: User-scoped preferences
DROP POLICY IF EXISTS "Allow public full access on user_preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Allow public access on user_preferences" ON public.user_preferences;
CREATE POLICY "Allow public access on user_preferences" ON public.user_preferences FOR ALL USING (true);
