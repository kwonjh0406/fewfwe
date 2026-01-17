-- Add symbol column to stocks table
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS symbol TEXT;
