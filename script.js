import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Connect to supabase
const SUPABASE_URL = 'https://izghwhppfuumvzjehfrr.supabase.co'
const SUPABASE_ANON_KEY = "sb_publishable_OfDnBziyMsBman1rO6HAuQ_5Oe1uBAf";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Declare vars
const btnMap = new Map();
const tstOptions = ["I", "Am", "A", "Option"];
const tableName = 'PollVotes'

// Declare documents
const optionsDiv = document.getElementById("options");
const resultsDiv = document.getElementById("results");

function SetupButtons() {
    for (const optionName of tstOptions) {

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
    }
}

async function AddVote(btn) {
    const optionName = btnMap.get(btn);
    const votes = await GetOptionVotes(optionName);
    const { data, error } = await supabase.from(tableName).upsert({ option_name : optionName, votes : votes + 1});
    LogHeader("AddVote");
    console.log(data);
    console.log(error);
}

async function GetOptionVotes(optionName) {
    const { data, error } = await supabase.from(tableName).select('votes').eq('option_name', optionName);
    LogHeader("GetOptionVotes");
    console.log(data);
    console.log(error);
    return data[0].votes;
}

function LogHeader(title) {
    console.log("\n\n\n");
    console.log("%c"+title, "color:blue");
}

SetupButtons();