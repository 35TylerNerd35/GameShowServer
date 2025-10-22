import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // if (req.method != "POST") return res.status(405).send("Method not allowed, please use POST");

  // Grab payload
  // const payload = req.body;
  // const table = payload.string;

  const { data, error } = await supabase.from("DeviceInformation").select("*");
  res.status(200).json(data, error);
}