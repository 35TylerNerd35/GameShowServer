import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Grab lobby code from payload
  const payload = req.body;
  const {device_id} = req.body;

  const { data, error } = await supabase.from("DeviceInformation").delete().eq('device_id', device_id);
  res.status(200).json(data, error);
}
