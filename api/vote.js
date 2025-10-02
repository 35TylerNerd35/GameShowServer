import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = 'https://izghwhppfuumvzjehfrr.supabase.co'
const SUPABASE_ANON_KEY = "sb_publishable_OfDnBziyMsBman1rO6HAuQ_5Oe1uBAf";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { index } = req.body;
    await supabase.from("poll_votes").insert([{ option_index: index }]);
  }

  // GET request returns all votes
  const { data } = await supabase.from("poll_votes").select("*");
  res.status(200).json(data);
}
