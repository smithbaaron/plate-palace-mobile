-- Fix RLS policies to allow customers to browse seller profiles
-- Drop the restrictive policy that only allows users to see their own profile
DROP POLICY IF EXISTS "Users can select own seller profile" ON public.seller_profiles;

-- Add new policies:
-- 1. Allow users to select their own seller profile (for editing)
CREATE POLICY "Users can select own seller profile" 
ON public.seller_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Allow all authenticated users to browse seller profiles (for customers)
CREATE POLICY "Everyone can browse seller profiles" 
ON public.seller_profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Similar fix for plates - allow all authenticated users to view plates
DROP POLICY IF EXISTS "Users can select own plates" ON public.plates;

-- Allow all authenticated users to view plates
CREATE POLICY "Everyone can browse plates" 
ON public.plates
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Keep the existing insert/update policies for sellers
CREATE POLICY IF NOT EXISTS "Users can select own plates" 
ON public.plates
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND
  seller_id IN (
    SELECT sp.id 
    FROM public.seller_profiles sp 
    WHERE sp.user_id = auth.uid()
  )
);