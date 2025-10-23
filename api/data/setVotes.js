import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method != "POST") return res.status(405).send("Method not allowed, please use POST");

  // Grab data from payload
  const payload = req.body;
  const rows = payload.rows;

  // Update database
  for (const row of rows) {
    await supabase.from("PollVotes").insert({option_name : row.option_name, votes: 0, lobby_id : row.lobby_id});
  }

  res.status(200).send("Success");
}
