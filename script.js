import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Connect to supabase
const SUPABASE_URL = 'https://izghwhppfuumvzjehfrr.supabase.co'
const SUPABASE_ANON_KEY = "sb_publishable_OfDnBziyMsBman1rO6HAuQ_5Oe1uBAf";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Declare vars
const voteTable = 'PollVotes'
const deviceTable = 'DeviceInformation'

// Declare documents
const optionsDiv = document.getElementById("options");
const lobbyCodeInpt = document.getElementById("lobbyCode");
const inPersonCheck = document.getElementById("isInPerson");
const joinLobbyBtn = document.getElementById("joinLobby");

const poll_options = [{option_id : 0, created_at : new Date(), option_name : "Option 1", votes : 0}];
const test : {option_id : number, created_at : Date, option_name : string, votes : number};

// Dynamic vars
let lobbyCode;
let checkedOption;

async function Setup() {
    
    joinLobbyBtn.onclick = async () => {

        // Attempt to find lobby
        lobbyCode = lobbyCodeInpt.value;
        const { data, error } = await supabase.from(deviceTable).select('lobby_id').eq('is_host', true).eq('lobby_id', lobbyCode);

        // Alert user to incorrect code
        if (data == null || data.length <= 0) {
            window.alert("Invalid lobby code. Please try again.");
            return;
        }

        // Grab registered device IDs
        const { data : deviceData, error : deviceError } = await supabase.from(deviceTable).select('device_id');
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
        supabase.from(deviceTable).insert({ device_id : device_id, lobby_id : lobbyCode, is_host : false, is_in_person : inPersonCheck.checked });
        
        SetupButtons();
    }
}

async function SetupButtons() {
    // Grab database
    const { data, error } = await supabase.from(voteTable).select().eq('lobby_id', lobbyCode);

    // Clear current data
    poll_options.length = 0;
    optionsDiv.innerHTML = "";

    // Keep track of and define row
    for (const row of data) {
        poll_options.push(row);
        CreateButton(row);
    }

    UpdateVoteDisplays();
}

function CreateButton(buttonInformation) {

    // Define doc elements
    const parentContainer = document.createElement("div")
    const optionLabel = document.createElement("label")
    const optionCheckbox = document.createElement("input")

    // Set attributes
    parentContainer.setAttribute("class", "option")
    optionLabel.setAttribute("for", buttonInformation.option_name)
    optionLabel.setAttribute("id", buttonInformation.option_name + "Label")
    optionCheckbox.setAttribute("type", "checkbox")
    optionCheckbox.setAttribute("id", buttonInformation.option_name + "Checkbox")
    optionCheckbox.setAttribute("name", buttonInformation.option_name)
    optionCheckbox.setAttribute("option_id", buttonInformation.option_id);

    optionLabel.innerText = buttonInformation.option_name;

    // Add to document
    optionsDiv.appendChild(parentContainer);
    parentContainer.appendChild(optionLabel);
    parentContainer.appendChild(optionCheckbox);

    // Read checkbox inputs
    // Setup button listener
    optionCheckbox.onchange = async (event) => {

        // Check if should remove votes
        if (event.target.checked)
        {
            SetVote(event.target);
        }
        else
        {
            SetVote();
        }
    }
}

async function UpdateVoteDisplays() {
    for (const option of poll_options) {
        const optionLabel = document.getElementById(option.option_name + "Label");
        optionLabel.innerText = option.option_name + " (" + option.votes + ")";
    }
}

function SetVote(newVoteCheckbox) {

    if (checkedOption != null) {
        DisplayNewVote(checkedOption, -1)
    }

    // Remove checked and return if no new option to vote for
    if (newVoteCheckbox == null) {
        checkedOption = null;
        return;
    }

    // Vote for new option
    checkedOption = poll_options.find(element => element.option_id == newVoteCheckbox.option_id);
    DisplayNewVote(checkedOption, 1);
}

function DisplayNewVote(option, increment) {
    // Grab elements of previously checked options
    const checkedLabel = option.option_name + "Label";
    const checkedCheckbox = option.option_name + "Checkbox";

    // Find element in array
    const checkedInArray = poll_options.find(element => element.option_id == option.option_id);
    const checkedIndex = poll_options.indexOf(checkedInArray);

    // Update display
    poll_options[checkedIndex].votes += increment;
    checkedLabel.innerText = option.option_name + " (" + poll_options[checkedIndex].votes + ")";
    checkedCheckbox.checked = false;
    
    // Update database
    supabase.from(voteTable).update({ votes : poll_options[checkedIndex].votes }).eq('option_name', option.option_name);
}





Setup();



function RandomInRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
