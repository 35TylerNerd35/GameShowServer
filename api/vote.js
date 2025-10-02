import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = https://izghwhppfuumvzjehfrr.supabase.co;
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6Z2h3aHBwZnV1bXZ6amVoZnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjA1NDEsImV4cCI6MjA3NDk5NjU0MX0.asynlrUGX3vpvZhVE_Tjjs9537rNdnBsmlNEhic1vOM;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { index } = req.body;
    await supabase.from("poll_votes").insert([{ option_index: index }]);
  }

  const { data } = await supabase.from("poll_votes").select("*");
  res.status(200).json(data);
}
