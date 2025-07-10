-- Final fix for RLS policies - ensuring customer browsing works
-- This migration will completely reset and fix the RLS policies

-- First, disable RLS temporarily to ensure we can work with the tables
ALTER TABLE public.seller_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.plates DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies completely
DO $$ 
BEGIN
    -- Drop all policies on seller_profiles
    DROP POLICY IF EXISTS "Users can select own seller profile" ON public.seller_profiles;
    DROP POLICY IF EXISTS "Everyone can browse seller profiles" ON public.seller_profiles;
    DROP POLICY IF EXISTS "Users can update own seller profile" ON public.seller_profiles;
    DROP POLICY IF EXISTS "Users can insert own seller profile" ON public.seller_profiles;
    DROP POLICY IF EXISTS "allow_authenticated_select_seller_profiles" ON public.seller_profiles;
    DROP POLICY IF EXISTS "allow_own_insert_seller_profiles" ON public.seller_profiles;
    DROP POLICY IF EXISTS "allow_own_update_seller_profiles" ON public.seller_profiles;
    
    -- Drop all policies on plates
    DROP POLICY IF EXISTS "Everyone can browse plates" ON public.plates;
    DROP POLICY IF EXISTS "Users can select own plates" ON public.plates;
    DROP POLICY IF EXISTS "Users can insert plates for their own seller profile" ON public.plates;
    DROP POLICY IF EXISTS "allow_authenticated_select_plates" ON public.plates;
    DROP POLICY IF EXISTS "allow_seller_insert_plates" ON public.plates;
    DROP POLICY IF EXISTS "allow_seller_update_plates" ON public.plates;
    DROP POLICY IF EXISTS "allow_seller_delete_plates" ON public.plates;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore errors if policies don't exist
END $$;

-- Re-enable RLS
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plates ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
-- SELLER_PROFILES: Allow everyone to read, only owners to modify
CREATE POLICY "seller_profiles_select_all" 
ON public.seller_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "seller_profiles_insert_own" 
ON public.seller_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "seller_profiles_update_own" 
ON public.seller_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- PLATES: Allow everyone to read, only sellers to modify their own
CREATE POLICY "plates_select_all" 
ON public.plates 
FOR SELECT 
USING (true);

CREATE POLICY "plates_insert_own" 
ON public.plates 
FOR INSERT 
WITH CHECK (
  seller_id IN (
    SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "plates_update_own" 
ON public.plates 
FOR UPDATE 
USING (
  seller_id IN (
    SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "plates_delete_own" 
ON public.plates 
FOR DELETE 
USING (
  seller_id IN (
    SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
  )
);