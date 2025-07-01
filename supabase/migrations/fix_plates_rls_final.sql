
-- First, let's check the current structure and fix any inconsistencies
-- Drop all existing policies to start clean
DROP POLICY IF EXISTS "Sellers can read their own plates" ON public.plates;
DROP POLICY IF EXISTS "Sellers can insert their own plates" ON public.plates;
DROP POLICY IF EXISTS "Sellers can update their own plates" ON public.plates;
DROP POLICY IF EXISTS "Sellers can delete their own plates" ON public.plates;
DROP POLICY IF EXISTS "Anyone can view plates" ON public.plates;
DROP POLICY IF EXISTS "Customers can view plates" ON public.plates;

-- Ensure RLS is enabled
ALTER TABLE public.plates ENABLE ROW LEVEL SECURITY;

-- Create new, more explicit policies that work with the current table structure
-- Policy for SELECT - Allow sellers to read their own plates
CREATE POLICY "Sellers can read their own plates" 
ON public.plates
FOR SELECT
USING (
  seller_id IN (
    SELECT sp.id 
    FROM public.seller_profiles sp 
    WHERE sp.user_id = auth.uid()
  )
);

-- Policy for INSERT - Allow authenticated users with valid seller profiles to insert plates
CREATE POLICY "Sellers can insert their own plates" 
ON public.plates
FOR INSERT
WITH CHECK (
  -- Ensure the user is authenticated
  auth.uid() IS NOT NULL
  AND
  -- Ensure the seller_id being used belongs to the authenticated user
  seller_id IN (
    SELECT sp.id 
    FROM public.seller_profiles sp 
    WHERE sp.user_id = auth.uid()
    AND sp.business_name IS NOT NULL 
    AND sp.business_name != ''
  )
);

-- Policy for UPDATE - Allow sellers to update their own plates
CREATE POLICY "Sellers can update their own plates" 
ON public.plates
FOR UPDATE
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

-- Policy for DELETE - Allow sellers to delete their own plates
CREATE POLICY "Sellers can delete their own plates" 
ON public.plates
FOR DELETE
USING (
  seller_id IN (
    SELECT sp.id 
    FROM public.seller_profiles sp 
    WHERE sp.user_id = auth.uid()
  )
);

-- Policy for public viewing - Allow anyone to view plates (for customers)
CREATE POLICY "Anyone can view plates" 
ON public.plates
FOR SELECT
USING (true);

-- Create a helper function to get seller profile ID for the current user
CREATE OR REPLACE FUNCTION public.get_current_user_seller_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  seller_profile_id UUID;
BEGIN
  SELECT sp.id INTO seller_profile_id
  FROM public.seller_profiles sp
  WHERE sp.user_id = auth.uid()
  AND sp.business_name IS NOT NULL 
  AND sp.business_name != '';
  
  RETURN seller_profile_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_user_seller_id TO authenticated;

-- Update the debug function to be more comprehensive
DROP FUNCTION IF EXISTS public.debug_seller_profile(UUID);

CREATE OR REPLACE FUNCTION public.debug_seller_profile(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  user_id UUID,
  seller_profile_id UUID,
  business_name TEXT,
  has_profile BOOLEAN,
  profile_complete BOOLEAN,
  can_insert_plates BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    user_uuid as user_id,
    sp.id as seller_profile_id,
    sp.business_name,
    (sp.id IS NOT NULL) as has_profile,
    (sp.business_name IS NOT NULL AND sp.business_name != '') as profile_complete,
    (sp.id IS NOT NULL AND sp.business_name IS NOT NULL AND sp.business_name != '') as can_insert_plates
  FROM public.seller_profiles sp
  WHERE sp.user_id = user_uuid;
  
  -- If no rows returned, return a row with nulls to indicate no profile
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      user_uuid as user_id,
      NULL::UUID as seller_profile_id,
      NULL::TEXT as business_name,
      FALSE as has_profile,
      FALSE as profile_complete,
      FALSE as can_insert_plates;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.debug_seller_profile TO authenticated;
