require("dotenv").config(); // Load environment variables
const { createClient } = require("@supabase/supabase-js");

// Load Supabase credentials from .env file
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("❌ Supabase URL or Key is missing in .env file");
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;
