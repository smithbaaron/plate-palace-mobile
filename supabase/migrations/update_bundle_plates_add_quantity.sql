-- Add quantity column to bundle_plates table to support multiple quantities of the same plate
ALTER TABLE bundle_plates ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

-- Drop the unique constraint that prevents duplicate plate entries
ALTER TABLE bundle_plates DROP CONSTRAINT IF EXISTS bundle_plates_bundle_id_plate_id_key;

-- Add a new constraint to ensure quantity is positive
ALTER TABLE bundle_plates ADD CONSTRAINT bundle_plates_quantity_positive CHECK (quantity > 0);