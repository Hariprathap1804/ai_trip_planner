-- ========================================================
-- TripPilot AI: Supabase Database Schema
-- Run this in your Supabase SQL Editor to initialize tables
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Cities & Transit Hubs Table
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

-- 2. Journeys Table (Simulated Journeys across 6 modes)
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

-- 3. Demo Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    reference_number TEXT NOT NULL UNIQUE, -- e.g. TP-849201
    status TEXT NOT NULL DEFAULT 'CONFIRMED', -- CONFIRMED, CANCELLED, COMPLETED
    journey_id TEXT,
    journey_data JSONB NOT NULL,
    passengers JSONB NOT NULL,
    fare_breakdown JSONB NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    notes TEXT,
    is_simulated_demo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. User Preferences Table
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT NOT NULL DEFAULT 'demo_user',
    budget_priority TEXT DEFAULT 'balanced', -- cheapest, fastest, comfort
    preferred_modes JSONB DEFAULT '["flight", "train", "metro", "bus", "cab", "auto"]'::jsonb,
    seat_preference TEXT DEFAULT 'window',
    accessibility_needed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) but allow anonymous access for prototype demo
ALTER TABLE public.hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on hubs" ON public.hubs;
CREATE POLICY "Allow public all on hubs" ON public.hubs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on journeys" ON public.journeys;
CREATE POLICY "Allow public all on journeys" ON public.journeys FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access on bookings" ON public.bookings;
CREATE POLICY "Allow public full access on bookings" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access on user_preferences" ON public.user_preferences;
CREATE POLICY "Allow public full access on user_preferences" ON public.user_preferences FOR ALL USING (true) WITH CHECK (true);
