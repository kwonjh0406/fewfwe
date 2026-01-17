-- Add manual_price column to stocks table
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS manual_price NUMERIC;
