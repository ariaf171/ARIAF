import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://sglageesshilrpbybtpk.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnbGFnZWVzc2hpbHJwYnlidHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MjUyMjAsImV4cCI6MjEwNDMwMTIyMH0.dNIbSO-C7aaxaBgJ0Rb3x-1e_7Ac0vcxVABYZO5kD6g';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkImages() {
  const { data: products } = await supabase.from('products').select('image_url').limit(5);
  console.log('Products:', products);
  const { data: categories } = await supabase.from('categories').select('image_url').limit(5);
  console.log('Categories:', categories);
  const { data: banners } = await supabase.from('banners').select('image_url').limit(5);
  console.log('Banners:', banners);
  const { data: settings } = await supabase.from('settings').select('*').limit(1);
  console.log('Settings:', settings);
}

checkImages();
