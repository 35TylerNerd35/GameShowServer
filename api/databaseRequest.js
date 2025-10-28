import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Grab lobby code from payload
  const payload = req.body;
  const {table_name, method, params} = req.body;

  const command = "await supabase.from(`";
  command += table_name;
  command += "`.";
  command += method;
  command += "()";
  command += params;

  const { data, error } = new Function(command);
  res.status(200).json(data, command, error);
}
