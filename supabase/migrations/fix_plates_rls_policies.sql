
-- Drop existing policies
DROP POLICY IF EXISTS "Sellers can read their own plates" ON public.plates;
DROP POLICY IF EXISTS "Sellers can insert their own plates" ON public.plates;
DROP POLICY IF EXISTS "Sellers can update their own plates" ON public.plates;
DROP POLICY IF EXISTS "Sellers can delete their own plates" ON public.plates;
DROP POLICY IF EXISTS "Customers can view plates" ON public.plates;

-- Create more explicit policies with better error handling
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

CREATE POLICY "Sellers can insert their own plates" 
ON public.plates
FOR INSERT
WITH CHECK (
  seller_id IN (
    SELECT sp.id 
    FROM public.seller_profiles sp 
    WHERE sp.user_id = auth.uid()
    AND sp.business_name IS NOT NULL 
    AND sp.business_name != ''
  )
);

CREATE POLICY "Sellers can update their own plates" 
ON public.plates
FOR UPDATE
USING (
  seller_id IN (
    SELECT sp.id 
    FROM public.seller_profiles sp 
    WHERE sp.user_id = auth.uid()
  )
);

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

-- Allow customers and anonymous users to view all available plates
CREATE POLICY "Anyone can view plates" 
ON public.plates
FOR SELECT
USING (true);

-- Create a function to help debug seller profile issues
CREATE OR REPLACE FUNCTION public.debug_seller_profile(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  user_id UUID,
  seller_profile_id UUID,
  business_name TEXT,
  has_profile BOOLEAN,
  profile_complete BOOLEAN
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
    (sp.business_name IS NOT NULL AND sp.business_name != '') as profile_complete
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
      FALSE as profile_complete;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.debug_seller_profile TO authenticated;
