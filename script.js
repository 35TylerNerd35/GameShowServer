import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Connect to supabase
const SUPABASE_URL = 'https://izghwhppfuumvzjehfrr.supabase.co'
const SUPABASE_ANON_KEY = "sb_publishable_OfDnBziyMsBman1rO6HAuQ_5Oe1uBAf";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Declare vars
const btnMap = new Map();
const tableName = 'PollVotes'

// Declare documents
const optionsDiv = document.getElementById("options");
const resultsDiv = document.getElementById("results");

async function SetupButtons(optionTxt) {
    // Clear buttons
    optionsDiv.innerHTML = "";
    btnMap.clear();

    for (const optionName of optionTxt) {

        // Create button
        const btn = document.createElement("button");
        btn.innerText = optionName;
        optionsDiv.appendChild(btn);

        // Update map
        btnMap.set(btn, optionName);

        // Setup button listener
        btn.onclick = async () => {
            await AddVote(btn);
        }

        DisplayVotes();
    }
}

async function AddVote(btn) {
    // Get current number of votes
    const optionName = btnMap.get(btn);
    const votes = await GetOptionVotes(optionName);

    // Update database
    const {data, error} = await supabase.from(tableName).select('option_id').eq('option_name', optionName);
    await supabase.from(tableName).update({ votes : votes + 1}).eq('option_id', data[0].option_id);
}

async function GetOptionVotes(optionName) {
    const { data, error } = await supabase.from(tableName).select('votes').eq('option_name', optionName);
    return data[0].votes;
}

async function DisplayVotes() {
    for (const [btn, optionName] of btnMap) {
        const votes = await GetOptionVotes(optionName);
        btn.innerText = optionName + ": " + votes;
    }
}

function LogHeader(title) {
    console.log("\n\n");
    console.log("%c"+title, "color:blue");
}

supabase
  .channel('table-db-changes')
  .on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: tableName },
    (payload) => {
      DisplayVotes();
    }
  )
  .subscribe();

async function RefreshButtons() {
    const grabbedOptions  = [];

    // Grab database names, push to array
    const { data, error } = await supabase.from(tableName).select('option_name')
    for (const option of data) {
        grabbedOptions.push(option.option_name);
    }

    await SetupButtons(grabbedOptions);
}

await RefreshButtons();