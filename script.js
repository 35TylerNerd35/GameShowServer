import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = 'https://izghwhppfuumvzjehfrr.supabase.co'
const SUPABASE_ANON_KEY = "sb_publishable_OfDnBziyMsBman1rO6HAuQ_5Oe1uBAf";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const table = "PollVotes";

// const options = ["Unreal", "Unity", "Godot"];
let options = [];
const optionsDiv = document.getElementById("options");
const resultsDiv = document.getElementById("results");

async function fetchOptions() {
  const { data } = await supabase.from(table).select("option_name");
  options = data.map(opt => opt.name);
}


// Render vote buttons
options.forEach((opt, i) => {
  const btn = document.createElement("button");
  btn.textContent = opt;
  btn.onclick = async () => {
    await supabase.from(table).insert([{ option_index: i }]);
  };
  optionsDiv.appendChild(btn);
});

async function fetchVotes() {
  const { data } = await supabase.from(table).select("*");
  renderResults(data);
}

function renderResults(data) {
  resultsDiv.innerHTML = "";
  options.forEach((opt, i) => {
    const count = data.filter(v => v.option_index === i).length;
    const p = document.createElement("p");
    p.textContent = `${opt}: ${count} votes`;
    resultsDiv.appendChild(p);
  });
}

// Realtime subscription using v2 syntax
supabase
  .channel('table-db-changes')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'PollVotes' },
    (payload) => {
      fetchOptions();
      fetchVotes();
    }
  )
  .subscribe();

// Initial fetch
fetchOptions();
fetchVotes();
