-- Add profile_image_url column to seller_profiles table
ALTER TABLE seller_profiles 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add comment for the column
COMMENT ON COLUMN seller_profiles.profile_image_url IS 'URL to the seller business profile picture or logo';