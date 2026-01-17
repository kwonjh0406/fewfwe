-- 1. Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(portfolio_id, name)
);

-- 2. Add missing columns to stocks table
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES groups(id) ON DELETE SET NULL;
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS group_name TEXT;
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS symbol TEXT;
ALTER TABLE stocks ADD COLUMN IF NOT EXISTS manual_price NUMERIC;

-- 3. Enabling RLS (Optional but recommended)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on groups for now" ON groups FOR ALL USING (true) WITH CHECK (true);
