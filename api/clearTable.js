import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // await supabase.from("PollVotes").delete().neq('votes', -100);
  const { data } = await supabase.from("PollVotes").select("*");
  res.status(200).json(data);
}
