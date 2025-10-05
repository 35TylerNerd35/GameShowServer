import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = 'https://izghwhppfuumvzjehfrr.supabase.co'
const SUPABASE_ANON_KEY = "sb_publishable_OfDnBziyMsBman1rO6HAuQ_5Oe1uBAf";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const buttons = new Map();
const table = "PollVotes";

let options = [];
const optionsDiv = document.getElementById("options");
const resultsDiv = document.getElementById("results");

// Grab options from table
async function fetchOptions() {
  const { data } = await supabase.from(table).select("option_name");
  options = data.map(opt => opt.option_name);
  UpdateButtons();
}

function UpdateButtons() {
  // Create buttons
  options.forEach((opt, i) => {

    // Create button and add to map
    const btn = document.createElement("button");
    buttons.set(btn, i);

    // Assign content and event
    btn.textContent = opt;
    btn.onclick = async () => {
      await OnButtonClick(btn);
    };

    // Add to page
    optionsDiv.appendChild(btn);
  });
}

async function fetchVotes() {
  // buttons.forEach((btn, i) => {
  //   renderResults(btn, i)
  // });
  // renderResults();
  const { data } = await supabase.from(table).select("*");
  renderResults(data);
}

function renderResults(data) {
  resultsDiv.innerHTML = "";
  options.forEach((opt, i) => {
    const votes = data[i].votes;
    const p = document.createElement("p");
    p.textContent = `${opt}: ${votes} votes`;
  });
}

// async function renderResults(btn, i) {
//   // Grab current number of votes from button
//   const votes = GrabButtonVotes(btn);
//   const p = document.createElement("p");
//   p.textContent = `${btn.textContent}: ${votes} votes`;
//   resultsDiv.appendChild(p);
// }

async function OnButtonClick(btn) {
  // Add vote for specified option
  const buttonID = buttons.get(btn)
  const currentVotes = GrabButtonVotes(buttonID);
  await supabase.from(table).upsert({option_id: buttonID, votes: currentVotes + 1});
}

async function GrabButtonVotes(ID) {
  // Grab votes based on button ID
  const {data, error} = await supabase.from(table).select("votes").eq("option_id",  ID);
  return data.votes;
}

// function renderResults() {
//   resultsDiv.innerHTML = "";
//   options.forEach((opt, i) => {
//     const votes = GrabButtonVotes(i);
//     const p = document.createElement("p");
//     p.textContent = `${opt}: ${votes} votes`;
//     resultsDiv.appendChild(p);
//   });
// }

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
