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
const lobbyCodeInpt = document.getElementById("lobbyCode");
const joinLobbyBtn = document.getElementById("joinLobby");


async function SetupButtons(optionTxt) {
    // Clear buttons
    optionsDiv.innerHTML = "";
    btnMap.clear();

    for (const optionName of optionTxt) {

        // Create doc elements
        const row = document.createElement("div");
        const chk = document.createElement("input");
        const label = document.createElement("label");

        // Setup doc elements
        row.appendChild(label);
        row.appendChild(chk);
        optionsDiv.appendChild(row);

        // Setup checkbox
        chk.type = "checkbox";
        chk.name = optionName;
        chk.innerText = optionName;

        // Update map
        btnMap.set(chk, optionName);

        // Setup button listener
        chk.onchange = async (event) => {

            // Check if should remove votes
            if (event.target.checked)
            {
                RemoveOtherChecks(chk);
                await ChangeVotes(chk, 1);
            }
            else
            {
                await ChangeVotes(chk, -1);
            }
        }

        DisplayVotes();
    }
}

async function RemoveOtherChecks(pressedBtn) {
    for (const [btn, optionName] of btnMap) {
        // Skip if this button was just activated
        if (btn == pressedBtn) {
            continue;
        }

        // Remove vote if was currently on checkbox
        if (btn.checked) {
            btn.checked = false;
            ChangeVotes(btn, -1);
        }
    }
}

async function ChangeVotes(chck, increment) {

    // Grab requested checkbox
    const optionName = btnMap.get(chck);
    const votes = await GetOptionVotes(optionName);

    // Update database
    const {data, error} = await supabase.from(tableName).select('option_id').eq('option_name', optionName);
    await supabase.from(tableName).update({ votes : votes + increment}).eq('option_id', data[0].option_id);
}

async function GetOptionVotes(optionName) {
    const { data, error } = await supabase.from(tableName).select('votes').eq('option_name', optionName);
    return data[0].votes;
}

async function DisplayVotes() {
    for (const [btn, optionName] of btnMap) {
        // Grab votes to display
        const votes = await GetOptionVotes(optionName);

        // Update button text
        const parent = btn.parentNode;
        parent.children[0].innerText = optionName + ": " + votes;
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
joinLobbyBtn.onclick = async () => {
    // Attempt to find lobby
    const lobbyCode = lobbyCodeInpt.value;
    const { data, error } = await supabase.from('DeviceInformation').select('lobby_id').eq('is_host', true).eq('lobby_id', lobbyCode);
    console.log(data);
    console.log(error)

    // Alert user to incorrect code
    if (data == null || data.length <= 0) {
        window.alert("Invalid lobby code. Please try again.");
        return;
    }

    // Grab registered device IDs
    const { data : deviceData, error : deviceError } = await supabase.from('DeviceInformation').select('device_id');
    const devices = [];
    for (const device of deviceData) {
        devices.push(device.device_id);
    }

    // Set new ID
    let device_id = 0;
    while (devices.includes(device_id)) {
        device_id = RandomInRange(1, 1000000);
    }

    // Register ID
    await supabase.from('DeviceInformation').insert({ device_id : device_id, lobby_id : lobbyCode, is_host : false });
}



function RandomInRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}