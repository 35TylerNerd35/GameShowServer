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

    // Grab connected devices
    const { data, error } = await supabase.from("DeviceInformation").select('*').eq('lobby_id', lobbyCode).eq("is_host", false);
    const { data: host } = await supabase.from("DeviceInformation").select('device_id').eq('lobby_id', lobbyCode).eq("is_host", true);

    // Grab number of helpers
    let num = data.length;
    let numHelpers = Math.floor(num/10) + 1;

    for (let index = 0; index < numHelpers; index++)
    {
      let randomPlayer = data[Math.floor(Math.random() * data.length)];
      let selectedId = randomPlayer.device_id;
      await supabase.from("DeviceInformation").update({team_id : 1, is_helper : true}).eq("device_id", selectedId);
    }

    await supabase.from("DeviceInformation").update({team_id : 1}).eq("device_id", host[0].device_id);

    res.status(200).json(host, error);
}
