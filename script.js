import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://izghwhppfuumvzjehfrr.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6Z2h3aHBwZnV1bXZ6amVoZnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjA1NDEsImV4cCI6MjA3NDk5NjU0MX0.asynlrUGX3vpvZhVE_Tjjs9537rNdnBsmlNEhic1vOM";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const options = ["Unreal", "Unity", "Godot"];
const optionsDiv = document.getElementById("options");
const resultsDiv = document.getElementById("results");

// Render vote buttons
options.forEach((opt, i) => {
  const btn = document.createElement("button");
  btn.textContent = opt;
  btn.onclick = () => vote(i);
  optionsDiv.appendChild(btn);
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
