
-- Add availability columns to plates table
ALTER TABLE public.plates 
ADD COLUMN IF NOT EXISTS is_single boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS is_bundle boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true;

-- Update existing records to have default values
UPDATE public.plates 
SET 
  is_single = true,
  is_bundle = false,
  is_available = true
WHERE 
  is_single IS NULL 
  OR is_bundle IS NULL 
  OR is_available IS NULL;
