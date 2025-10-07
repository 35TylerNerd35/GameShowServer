import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  const { data, error } = await supabase.from("PollVotes").select('option_name, votes').order('votes', { ascending: false });
  res.status(200).json(data[0], error);
}
