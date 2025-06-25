
-- Add delivery and pickup fields to plates table
ALTER TABLE public.plates 
ADD COLUMN IF NOT EXISTS delivery_available boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pickup_time text;

-- Update the updated_at timestamp when these fields are modified
-- (The trigger is already in place from the original migration)
