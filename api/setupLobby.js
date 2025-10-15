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
  const deviceId = payload.device_id;
  
  const { data, error } = await supabase.from("DeviceInformation").insert({ device_id : deviceId, lobby_id : lobbyCode, is_host : true, is_in_person : false });
  res.status(200).json(data[0], error);
}