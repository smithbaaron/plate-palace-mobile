-- Add real customer information columns to customer_profiles table
ALTER TABLE public.customer_profiles 
ADD COLUMN full_name TEXT,
ADD COLUMN email TEXT,
ADD COLUMN phone TEXT;

-- Update RLS policies to include the new columns
-- Users can view their own customer profile including new fields
DROP POLICY IF EXISTS "Users can view own customer profile" ON public.customer_profiles;
CREATE POLICY "Users can view own customer profile" ON public.customer_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own customer profile including new fields  
DROP POLICY IF EXISTS "Users can update own customer profile" ON public.customer_profiles;
CREATE POLICY "Users can update own customer profile" ON public.customer_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own customer profile including new fields
DROP POLICY IF EXISTS "Users can insert own customer profile" ON public.customer_profiles;
CREATE POLICY "Users can insert own customer profile" ON public.customer_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);