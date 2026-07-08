const fs = require('fs');
let content = fs.readFileSync('supabase_schema.sql', 'utf-8');

const platformsSql = `
-- 6. Create ASSET_PLATFORMS Table
CREATE TABLE IF NOT EXISTS public.asset_platforms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name text NOT NULL,
  total_deposit numeric(15, 2) DEFAULT 0.00 NOT NULL CHECK (total_deposit >= 0),
  total_withdraw numeric(15, 2) DEFAULT 0.00 NOT NULL CHECK (total_withdraw >= 0),
  current_value numeric(15, 2) DEFAULT 0.00 NOT NULL CHECK (current_value >= 0)
);

ALTER TABLE public.asset_platforms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own asset platforms" ON public.asset_platforms;
CREATE POLICY "Users can view their own asset platforms"
  ON public.asset_platforms FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own asset platforms" ON public.asset_platforms;
CREATE POLICY "Users can insert their own asset platforms"
  ON public.asset_platforms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own asset platforms" ON public.asset_platforms;
CREATE POLICY "Users can update their own asset platforms"
  ON public.asset_platforms FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own asset platforms" ON public.asset_platforms;
CREATE POLICY "Users can delete their own asset platforms"
  ON public.asset_platforms FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS asset_platforms_user_id_idx ON public.asset_platforms(user_id);
`;

if (!content.includes('ASSET_PLATFORMS Table')) {
  content += '\n' + platformsSql;
  fs.writeFileSync('supabase_schema.sql', content);
  console.log("Success adding asset_platforms schema");
}
