-- Add group_name column to stocks table for grouping
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS group_name TEXT DEFAULT '기타';
