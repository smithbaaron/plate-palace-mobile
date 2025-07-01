
-- Drop all existing policies on plates table
DROP POLICY IF EXISTS "Sellers can read their own plates" ON public.plates;
DROP POLICY IF EXISTS "Sellers can insert their own plates" ON public.plates;
DROP POLICY IF EXISTS "Sellers can update their own plates" ON public.plates;
DROP POLICY IF EXISTS "Sellers can delete their own plates" ON public.plates;
DROP POLICY IF EXISTS "Anyone can view plates" ON public.plates;

-- Ensure RLS is enabled
ALTER TABLE public.plates ENABLE ROW LEVEL SECURITY;

-- Create more explicit and debugging-friendly policies

-- Policy for SELECT - Allow sellers to read their own plates and allow public viewing
CREATE POLICY "Enable read access for all users" 
ON public.plates
FOR SELECT
USING (true);

-- Policy for INSERT - Allow authenticated users with valid seller profiles to insert plates
CREATE POLICY "Enable insert for authenticated sellers" 
ON public.plates
FOR INSERT
WITH CHECK (
  -- Must be authenticated
  auth.uid() IS NOT NULL
  AND
  -- The seller_id must exist in seller_profiles table
  EXISTS (
    SELECT 1 
    FROM public.seller_profiles sp 
    WHERE sp.id = seller_id
    AND sp.user_id = auth.uid()
    AND sp.business_name IS NOT NULL 
    AND sp.business_name != ''
  )
);

-- Policy for UPDATE - Allow sellers to update their own plates
CREATE POLICY "Enable update for sellers on their own plates" 
ON public.plates
FOR UPDATE
USING (
  auth.uid() IS NOT NULL
  AND
  EXISTS (
    SELECT 1 
    FROM public.seller_profiles sp 
    WHERE sp.id = seller_id
    AND sp.user_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL
  AND
  EXISTS (
    SELECT 1 
    FROM public.seller_profiles sp 
    WHERE sp.id = seller_id
    AND sp.user_id = auth.uid()
  )
);

-- Policy for DELETE - Allow sellers to delete their own plates
CREATE POLICY "Enable delete for sellers on their own plates" 
ON public.plates
FOR DELETE
USING (
  auth.uid() IS NOT NULL
  AND
  EXISTS (
    SELECT 1 
    FROM public.seller_profiles sp 
    WHERE sp.id = seller_id
    AND sp.user_id = auth.uid()
  )
);

-- Create a function to help debug RLS issues
CREATE OR REPLACE FUNCTION public.debug_user_seller_access()
RETURNS TABLE (
  current_user_id UUID,
  seller_profiles_count BIGINT,
  seller_profile_details JSON
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as current_user_id,
    COUNT(sp.id) as seller_profiles_count,
    json_agg(
      json_build_object(
        'id', sp.id,
        'user_id', sp.user_id,
        'business_name', sp.business_name,
        'business_name_valid', (sp.business_name IS NOT NULL AND sp.business_name != '')
      )
    ) as seller_profile_details
  FROM public.seller_profiles sp
  WHERE sp.user_id = auth.uid()
  GROUP BY auth.uid();
  
  -- If no seller profile found, return empty result
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      auth.uid() as current_user_id,
      0::BIGINT as seller_profiles_count,
      '[]'::JSON as seller_profile_details;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.debug_user_seller_access TO authenticated;
