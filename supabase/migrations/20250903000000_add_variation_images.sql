-- Add image column to variations table to store flavor images
ALTER TABLE variations ADD COLUMN IF NOT EXISTS image text;

-- Add comment to explain the column
COMMENT ON COLUMN variations.image IS 'URL or Base64 data URL for the variation image uploaded in admin dashboard';

