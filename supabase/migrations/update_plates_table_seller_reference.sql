
-- Update plates table to reference seller_profiles instead of auth.users
ALTER TABLE public.plates 
DROP CONSTRAINT IF EXISTS plates_seller_id_fkey;

-- Add foreign key constraint to seller_profiles
ALTER TABLE public.plates 
ADD CONSTRAINT plates_seller_id_fkey 
FOREIGN KEY (seller_id) REFERENCES public.seller_profiles(id) ON DELETE CASCADE;

-- Update RLS policies to work with seller_profiles
DROP POLICY IF EXISTS "Sellers can read their own plates" ON public.plates;
DROP POLICY IF EXISTS "Sellers can insert their own plates" ON public.plates;
DROP POLICY IF EXISTS "Sellers can update their own plates" ON public.plates;
DROP POLICY IF EXISTS "Sellers can delete their own plates" ON public.plates;

-- Create new policies that work with seller_profiles
CREATE POLICY "Sellers can read their own plates" 
ON public.plates
FOR SELECT
USING (
  seller_id IN (
    SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Sellers can insert their own plates" 
ON public.plates
FOR INSERT
WITH CHECK (
  seller_id IN (
    SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Sellers can update their own plates" 
ON public.plates
FOR UPDATE
USING (
  seller_id IN (
    SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Sellers can delete their own plates" 
ON public.plates
FOR DELETE
USING (
  seller_id IN (
    SELECT id FROM public.seller_profiles WHERE user_id = auth.uid()
  )
);
