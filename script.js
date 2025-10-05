import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = 'https://izghwhppfuumvzjehfrr.supabase.co'
const SUPABASE_ANON_KEY = "sb_publishable_OfDnBziyMsBman1rO6HAuQ_5Oe1uBAf";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const buttons = new Map();
const table = "PollVotes";

// const options = ["Unreal", "Unity", "Godot"];
let options = [];
const optionsDiv = document.getElementById("options");
const resultsDiv = document.getElementById("results");

async function fetchOptions() {
  const { data } = await supabase.from(table).select("option_name");
  options = data.map(opt => opt.option_name);
  UpdateButtons();
}

function UpdateButtons() {
  // Render vote buttons
  console.log(options);
  options.forEach((opt, i) => {
    const btn = document.createElement("button");
    buttons.set(btn, i);
    btn.textContent = opt;
    btn.onclick = async () => {
      await OnButtonClick(btn);
      // await supabase.from(table).insert([{ option_index: i }]);
      // await supabase.from(table).update({ votes: })
    };
    optionsDiv.appendChild(btn);
  });
}

async function fetchVotes() {
  // const { data } = await supabase.from(table).select("*");
  // renderResults(data);

  options.forEach((opt, i) = async() => {
    // Grab current number of votes from button
    const buttonID = buttons.get(btn);
    const {data : returnedVotes, error : err} = await supabase.from(table).select("votes").eq("option_id",  buttonID);

    const p = document.createElement("p");
    p.textContent = `${opt}: ${returnedVotes.votes} votes`;
    resultsDiv.appendChild(p);
  });
}

async function OnButtonClick(btn) {

  // Grab current number of votes from button
  const buttonID = buttons.get(btn);
  const {data : returnedVotes, error : err} = await supabase.from(table).select("votes").eq("option_id",  buttonID);

  // Add vote for specified option
  const currentVotes = returnedVotes[0].votes;
  await supabase.from(table).upsert({option_id: buttonID, votes: currentVotes + 1});
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

function getByValue(map, searchValue) {
  for (let [key, value] of map.entries()) {
    if (value === searchValue)
      return key;
  }
}
