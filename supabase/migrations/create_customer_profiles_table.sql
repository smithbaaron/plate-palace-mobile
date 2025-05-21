
-- Create a customer_profiles table to store customer preferences
CREATE TABLE public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  followed_sellers TEXT[],
  dietary_preferences TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Create RLS policies
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own customer profile
CREATE POLICY "Users can view own customer profile" ON public.customer_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to update their own customer profile
CREATE POLICY "Users can update own customer profile" ON public.customer_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to insert their own customer profile
CREATE POLICY "Users can insert own customer profile" ON public.customer_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger to update the updated_at timestamp
CREATE TRIGGER set_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_current_timestamp_updated_at();
