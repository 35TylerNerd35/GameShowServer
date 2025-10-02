import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { index } = req.body;
    await supabase.from("poll_votes").insert([{ option_index: index }]);
  }

  const { data } = await supabase.from("poll_votes").select("*");
  res.status(200).json(data);
}
