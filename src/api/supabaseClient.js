// src/api/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Thông tin kết nối Supabase
const supabaseUrl = "https://okeiszxxcsahlpylkbnv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rZWlzenh4Y3NhaGxweWxrYm52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDI2ODIsImV4cCI6MjA3NjcxODY4Mn0.rHTzBCwWrpi3cmCHmPHZ_qTN6Ib1e2QL8EsLwCoF-W0";

// Tạo client Supabase
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabaseClient;
