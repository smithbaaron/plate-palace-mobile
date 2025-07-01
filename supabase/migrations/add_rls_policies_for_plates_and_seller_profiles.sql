
-- Enable RLS on both tables
ALTER TABLE public.plates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Enable insert for authenticated sellers" ON public.plates;
DROP POLICY IF EXISTS "Sellers can insert their own plates" ON public.plates;

-- Policy for seller_profiles: Allow users to select their own profile
CREATE POLICY "Users can select own seller profile" 
ON public.seller_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for plates: Allow insert only if seller_id matches user's seller_profile.id
CREATE POLICY "Users can insert plates for their own seller profile" 
ON public.plates
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL
  AND
  seller_id IN (
    SELECT sp.id 
    FROM public.seller_profiles sp 
    WHERE sp.user_id = auth.uid()
    AND sp.business_name IS NOT NULL 
    AND sp.business_name != ''
  )
);

-- Ensure other necessary policies exist for seller_profiles
CREATE POLICY IF NOT EXISTS "Users can update own seller profile" 
ON public.seller_profiles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own seller profile" 
ON public.seller_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);
