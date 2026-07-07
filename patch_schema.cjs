const fs = require('fs');
let content = fs.readFileSync('supabase_schema.sql', 'utf-8');

const targetStr = `CREATE TABLE IF NOT EXISTS public.assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type in ('Kripto', 'Saham', 'Reksadana', 'Emas', 'Lainnya')),
  platform text,
  quantity numeric(20, 8) NOT NULL CHECK (quantity >= 0),
  average_price numeric(15, 2) NOT NULL CHECK (average_price >= 0),
  current_price numeric(15, 2) NOT NULL CHECK (current_price >= 0)
);`;

const replaceStr = `CREATE TABLE IF NOT EXISTS public.assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type in ('Kripto', 'Saham', 'Reksadana', 'Emas', 'Lainnya')),
  platform text,
  quantity numeric(20, 8) NOT NULL CHECK (quantity >= 0),
  average_price numeric(15, 2) NOT NULL CHECK (average_price >= 0),
  current_price numeric(15, 2) NOT NULL CHECK (current_price >= 0),
  total_deposit numeric(15, 2) DEFAULT 0.00,
  total_withdraw numeric(15, 2) DEFAULT 0.00
);`;

if (content.includes(targetStr)) {
  fs.writeFileSync('supabase_schema.sql', content.replace(targetStr, replaceStr));
  console.log("Success schema");
} else {
  console.log("Not found schema");
}
