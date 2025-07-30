-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'citizen',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create infrastructure_assets table
CREATE TABLE public.infrastructure_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- road, bridge, park, building, etc.
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  address TEXT,
  construction_cost DECIMAL(15, 2),
  maintenance_cost DECIMAL(15, 2),
  funding_source TEXT, -- central, state, municipal, private
  construction_date DATE,
  last_maintenance_date DATE,
  status TEXT DEFAULT 'active', -- active, under_maintenance, completed, abandoned
  environmental_impact TEXT,
  social_impact TEXT,
  contractor_name TEXT,
  project_id TEXT,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.infrastructure_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for infrastructure_assets
CREATE POLICY "Infrastructure assets are viewable by everyone"
ON public.infrastructure_assets
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create infrastructure assets"
ON public.infrastructure_assets
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create citizen_reports table for user-generated feedback
CREATE TABLE public.citizen_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.infrastructure_assets(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- issue, feedback, verification, completion_status
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'open', -- open, in_review, resolved, closed
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.citizen_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for citizen_reports
CREATE POLICY "Users can view all citizen reports"
ON public.citizen_reports
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create their own reports"
ON public.citizen_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
ON public.citizen_reports
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create maintenance_history table
CREATE TABLE public.maintenance_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID NOT NULL REFERENCES public.infrastructure_assets(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL, -- routine, repair, upgrade, inspection
  description TEXT NOT NULL,
  cost DECIMAL(15, 2),
  contractor_name TEXT,
  start_date DATE NOT NULL,
  completion_date DATE,
  status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_history ENABLE ROW LEVEL SECURITY;

-- Create policies for maintenance_history
CREATE POLICY "Maintenance history is viewable by everyone"
ON public.maintenance_history
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create maintenance records"
ON public.maintenance_history
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, full_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    NEW.raw_user_meta_data ->> 'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_infrastructure_assets_updated_at
  BEFORE UPDATE ON public.infrastructure_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_citizen_reports_updated_at
  BEFORE UPDATE ON public.citizen_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_history_updated_at
  BEFORE UPDATE ON public.maintenance_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();