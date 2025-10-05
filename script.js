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

async function SetupButtons() {
    for (const optionName of tstOptions) {

        // Create button
        const btn = document.createElement("button");
        btn.innerText = optionName;
        optionsDiv.appendChild(btn);

        // Update map
        btnMap.set(btn, optionName);

        await supabase.from(tableName).insert({ option_name : optionName, votes : 0});

        // Setup button listener
        btn.onclick = async () => {
            await AddVote(btn);
        }
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
        LogHeader("Button Map");
        console.log(btn);
        console.log(optionName);

        LogHeader("Display")
        const votes = await GetOptionVotes(optionName);
        console.log(votes);
        btn.innerText = optionName + ": " + votes;
    }
}

function LogHeader(title) {
    console.log("\n\n");
    console.log("%c"+title, "color:blue");
}

await SetupButtons();