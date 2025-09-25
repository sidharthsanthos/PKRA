import { createClient } from "@supabase/supabase-js";

const supabaseURL= process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnon= process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase=createClient(supabaseURL,supabaseAnon);