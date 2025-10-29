import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method != "POST") return res.status(405).send("Method not allowed, please use POST");

  // Grab lobby code from payload
  const payload = req.body;
  const lobbyCode = payload.lobby_id;
  
  const { data, error } = await supabase.from("PollVotes").select('option_name, votes').eq('lobby_id', lobbyCode).order('votes', { ascending: false });
  let returnString = `{"rows" : `;
  returnString += JSON.stringify(data);
  returnString += "}"
  res.status(200).json(returnString, error);
  
}