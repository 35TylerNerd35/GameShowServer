import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    // if (req.method != "POST") return res.status(405).send("Method not allowed, please use POST");

    // Grab lobby code from payload
    const payload = req.body;
    const lobbyCode = payload.lobby_id;

    // Grab connected devices
    const { data, error } = await supabase.from("DeviceInformation").select('*').eq('lobby_id', lobbyCode);

    // Grab number of helpers
    let num = data.length;
    let numHelpers = Math.floor(data.length/10) + 1;

    for (let index = 0; index < numHelpers; index++)
    {
        let randomPlayer = array[Math.floor(Math.random() * array.length)];
        let selectedId = randomPlayer.device_id;
        const {UpdateRole} = require('../../script.js');
        UpdateRole(selectedId);
    }

    

    res.status(200).json(data, error);
}
