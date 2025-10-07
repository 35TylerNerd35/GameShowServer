import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method != "POST") return res.status(405).send("Method not allowed, please use POST");

  // Grab names from payload
  const payload = req.body;
  const optionNames = payload.optionNames;

  // Setup new options
  for (const optionName of optionNames) {
    await supabase.from("PollVotes").insert({ option_name : optionName, votes : 0});
  }

  // Refresh buttons
  await RefreshButtons();

  res.status(200).send("Success");
}
