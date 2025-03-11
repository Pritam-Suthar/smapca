const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// ✅ Ensure environment variables are set
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase URL or Key in environment variables.");
}

// ✅ Create and export the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = supabase;
