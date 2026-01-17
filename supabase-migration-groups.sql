-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(portfolio_id, name)
);

-- Add group_id to stocks table
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE SET NULL;

-- (Optional) Copy existing group_names to groups table and link them
-- This is a bit complex for a simple script, so we'll start fresh or let the user handle it.
-- For now, we will rely on group_id.
