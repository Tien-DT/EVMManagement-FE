// src/api/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Lấy thông tin từ environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Kiểm tra xem env variables có được set chưa
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

// Tạo client Supabase
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabaseClient;
