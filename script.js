import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = 'https://izghwhppfuumvzjehfrr.supabase.co'
const SUPABASE_ANON_KEY = "sb_secret_YQixTHwaXJhY2CtpfVEybw_giQjsd3i";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const options = ["Unreal", "Unity", "Godot"];
const optionsDiv = document.getElementById("options");
const resultsDiv = document.getElementById("results");

// Render vote buttons
options.forEach((opt, i) => {
  const btn = document.createElement("button");
  btn.textContent = opt;
  btn.onclick = async () => {
    await supabase.from("poll_votes").insert([{ option_index: i }]);
  };
  optionsDiv.appendChild(btn);
});

async function fetchVotes() {
  const { data } = await supabase.from("poll_votes").select("*");
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
    { event: 'INSERT', schema: 'public', table: 'poll_votes' },
    (payload) => {
      fetchVotes();
    }
  )
  .subscribe();

// Initial fetch
fetchVotes();
