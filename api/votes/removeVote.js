import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Grab lobby code from payload
  const payload = req.body;
  const {option_id, votes} = req.body;

  const { data, error } = await supabase.from("PollVotes").update({ votes : votes - 1 }).eq('option_id', option_id);
  const length = data.length;
  res.status(200).json(length, error);
}
