import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_API_KEY;

if (!url || !key) {
  throw new Error("Missing Supabase environment variables!");
}

const client = createClient(url, key);
export default client;
