-- Comprehensive fix for RLS policies to allow customer browsing
-- First, drop ALL existing policies to start clean
DROP POLICY IF EXISTS "Users can select own seller profile" ON public.seller_profiles;
DROP POLICY IF EXISTS "Everyone can browse seller profiles" ON public.seller_profiles;
DROP POLICY IF EXISTS "Users can update own seller profile" ON public.seller_profiles;
DROP POLICY IF EXISTS "Users can insert own seller profile" ON public.seller_profiles;

DROP POLICY IF EXISTS "Everyone can browse plates" ON public.plates;
DROP POLICY IF EXISTS "Users can select own plates" ON public.plates;
DROP POLICY IF EXISTS "Users can insert plates for their own seller profile" ON public.plates;

-- Enable RLS on tables (in case it's not enabled)
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plates ENABLE ROW LEVEL SECURITY;

-- SELLER_PROFILES policies
-- 1. Allow all authenticated users to SELECT (browse) seller profiles
CREATE POLICY "allow_authenticated_select_seller_profiles" 
ON public.seller_profiles
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow users to INSERT their own seller profile
CREATE POLICY "allow_own_insert_seller_profiles" 
ON public.seller_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Allow users to UPDATE their own seller profile
CREATE POLICY "allow_own_update_seller_profiles" 
ON public.seller_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- PLATES policies  
-- 1. Allow all authenticated users to SELECT (browse) plates
CREATE POLICY "allow_authenticated_select_plates" 
ON public.plates
FOR SELECT
TO authenticated
USING (true);

-- 2. Allow sellers to INSERT plates for their own seller profile
CREATE POLICY "allow_seller_insert_plates" 
ON public.plates
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND
  seller_id IN (
    SELECT sp.id 
    FROM public.seller_profiles sp 
    WHERE sp.user_id = auth.uid()
  )
);

-- 3. Allow sellers to UPDATE their own plates
CREATE POLICY "allow_seller_update_plates" 
ON public.plates
FOR UPDATE
TO authenticated
USING (
  seller_id IN (
    SELECT sp.id 
    FROM public.seller_profiles sp 
    WHERE sp.user_id = auth.uid()
  )
)
WITH CHECK (
  seller_id IN (
    SELECT sp.id 
    FROM public.seller_profiles sp 
    WHERE sp.user_id = auth.uid()
  )
);

-- 4. Allow sellers to DELETE their own plates
CREATE POLICY "allow_seller_delete_plates" 
ON public.plates
FOR DELETE
TO authenticated
USING (
  seller_id IN (
    SELECT sp.id 
    FROM public.seller_profiles sp 
    WHERE sp.user_id = auth.uid()
  )
);