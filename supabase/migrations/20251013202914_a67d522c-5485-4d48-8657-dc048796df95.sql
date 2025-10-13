-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE vehicle_type AS ENUM ('bus', 'taxi', 'motorbike');
CREATE TYPE ride_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('mtn_momo', 'airtel_money', 'cash');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  is_driver BOOLEAN DEFAULT FALSE,
  driver_rating DECIMAL(3,2) DEFAULT 5.0,
  total_rides INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_type vehicle_type NOT NULL,
  license_plate TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  last_location_update TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create routes table
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  start_point TEXT NOT NULL,
  end_point TEXT NOT NULL,
  start_latitude DECIMAL(10, 8) NOT NULL,
  start_longitude DECIMAL(11, 8) NOT NULL,
  end_latitude DECIMAL(10, 8) NOT NULL,
  end_longitude DECIMAL(11, 8) NOT NULL,
  base_fare DECIMAL(10, 2) NOT NULL,
  distance_km DECIMAL(10, 2) NOT NULL,
  estimated_duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create rides table
CREATE TABLE public.rides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passenger_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
  status ride_status DEFAULT 'pending',
  pickup_latitude DECIMAL(10, 8) NOT NULL,
  pickup_longitude DECIMAL(11, 8) NOT NULL,
  dropoff_latitude DECIMAL(10, 8) NOT NULL,
  dropoff_longitude DECIMAL(11, 8) NOT NULL,
  pickup_address TEXT,
  dropoff_address TEXT,
  estimated_fare DECIMAL(10, 2) NOT NULL,
  actual_fare DECIMAL(10, 2),
  estimated_duration_minutes INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  transaction_id TEXT UNIQUE,
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create safety_reports table
CREATE TABLE public.safety_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  description TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Create shared_trips table for safety feature
CREATE TABLE public.shared_trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  shared_with_phone TEXT NOT NULL,
  shared_with_name TEXT,
  share_token UUID DEFAULT uuid_generate_v4(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_trips ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for vehicles (public read, driver write)
CREATE POLICY "Anyone can view active vehicles"
  ON public.vehicles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Drivers can manage their vehicles"
  ON public.vehicles FOR ALL
  USING (driver_id = auth.uid());

-- RLS Policies for routes (public read)
CREATE POLICY "Anyone can view active routes"
  ON public.routes FOR SELECT
  USING (is_active = true);

-- RLS Policies for rides
CREATE POLICY "Users can view their own rides"
  ON public.rides FOR SELECT
  USING (passenger_id = auth.uid() OR vehicle_id IN (
    SELECT id FROM public.vehicles WHERE driver_id = auth.uid()
  ));

CREATE POLICY "Users can create rides"
  ON public.rides FOR INSERT
  WITH CHECK (passenger_id = auth.uid());

CREATE POLICY "Users can update their rides"
  ON public.rides FOR UPDATE
  USING (passenger_id = auth.uid() OR vehicle_id IN (
    SELECT id FROM public.vehicles WHERE driver_id = auth.uid()
  ));

-- RLS Policies for payments
CREATE POLICY "Users can view their payments"
  ON public.payments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for ratings
CREATE POLICY "Anyone can view ratings"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings for their rides"
  ON public.ratings FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for safety_reports
CREATE POLICY "Users can view their safety reports"
  ON public.safety_reports FOR SELECT
  USING (reporter_id = auth.uid() OR driver_id = auth.uid());

CREATE POLICY "Users can create safety reports"
  ON public.safety_reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

-- RLS Policies for shared_trips
CREATE POLICY "Users can view trips shared with them or by them"
  ON public.shared_trips FOR SELECT
  USING (shared_by = auth.uid() OR is_active = true);

CREATE POLICY "Users can share their trips"
  ON public.shared_trips FOR INSERT
  WITH CHECK (shared_by = auth.uid());

CREATE POLICY "Users can manage their shared trips"
  ON public.shared_trips FOR UPDATE
  USING (shared_by = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to update driver rating
CREATE OR REPLACE FUNCTION update_driver_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET driver_rating = (
    SELECT AVG(rating)::DECIMAL(3,2)
    FROM public.ratings
    WHERE driver_id = NEW.driver_id
  )
  WHERE id = NEW.driver_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update driver rating when new rating is added
CREATE TRIGGER update_driver_rating_trigger
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_driver_rating();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;