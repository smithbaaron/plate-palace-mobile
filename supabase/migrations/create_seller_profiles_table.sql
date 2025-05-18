
-- Create a seller_profiles table to store detailed seller information
CREATE TABLE public.seller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  business_name TEXT NOT NULL,
  bio TEXT,
  phone_number TEXT,
  offer_pickup BOOLEAN DEFAULT true,
  offer_delivery BOOLEAN DEFAULT false,
  pickup_addresses JSONB,
  delivery_zip_codes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Create RLS policies
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own seller profile
CREATE POLICY "Users can view own seller profile" ON public.seller_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to update their own seller profile
CREATE POLICY "Users can update own seller profile" ON public.seller_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to insert their own seller profile
CREATE POLICY "Users can insert own seller profile" ON public.seller_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to set updated_at on profile updates
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on seller profile updates
CREATE TRIGGER set_seller_profiles_updated_at
  BEFORE UPDATE ON public.seller_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_current_timestamp_updated_at();
