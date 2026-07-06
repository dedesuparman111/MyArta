import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: { user } } = await supabase.auth.getUser();
  console.log('User:', user?.id);

  const trx = {
    date: '2023-01-01',
    type: 'Pendapatan',
    category: 'Gaji',
    amount: 5000,
    description: 'Test trx',
    installment_id: null
  };

  const { data, error } = await supabase
    .from('transactions')
    .insert([{ ...trx, user_id: user?.id }])
    .select();

  if (error) {
    console.error('Supabase error:', JSON.stringify(error, null, 2));
  } else {
    console.log('Success:', data);
  }
}
test();
