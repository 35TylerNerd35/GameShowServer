import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://izghwhppfuumvzjehfrr.supabase.co'
const SUPABASE_ANON_KEY = "sb_secret_YQixTHwaXJhY2CtpfVEybw_giQjsd3i";

const supabase = createClient(supabaseUrl, SUPABASE_ANON_KEY);

const options = ["Unreal", "Unity", "Godot"];
const optionsDiv = document.getElementById("options");
const resultsDiv = document.getElementById("results");

// Render vote buttons
options.forEach((opt, i) => {
  const btn = document.createElement("button");
  btn.textContent = opt;
  btn.onclick = () => vote(i);
  optionsDiv.appendChild(btn);
  console.log("New Button");
});

// Fetch current votes
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

// Submit a vote
async function vote(index) {
  const btn = document.createElement("button");
  btn.textContent = "KILL ME"
  resultsDiv.appendChild(btn);
  await supabase.from("poll_votes").insert([{ option_index: index }]);
}

// Listen for new votes in realtime
supabase
  .from("poll_votes")
  .on("INSERT", payload => {
    fetchVotes();
  })
  .subscribe();

// Initial load
fetchVotes();
