import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// Connect to supabase
const SUPABASE_URL = 'https://izghwhppfuumvzjehfrr.supabase.co'
const SUPABASE_ANON_KEY = "sb_publishable_OfDnBziyMsBman1rO6HAuQ_5Oe1uBAf";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Declare vars
const voteTable = 'PollVotes'
const deviceTable = 'DeviceInformation'
const toggleTable = 'ToggleTable'

// Declare documents
const optionsDiv = document.getElementById("options");
const lobbyCodeInpt = document.getElementById("lobbyCode");
const inPersonCheck = document.getElementById("isInPerson");
const joinLobbyBtn = document.getElementById("joinLobby");
document.getElementById("Doors").style.visibility = "hidden";

const poll_options = [{option_id : 0, created_at : new Date(), option_name : "Option 1", votes : 0}];
let hasRegisteredDeviceID = false;

// Dynamic vars
let lobbyCode;
let device_id;
let checkedOption;
let timestamp = Math.floor(new Date().getTime() / 1000);

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
        device_id = 0;
        while (devices.includes(device_id) || device_id == 0) {
            device_id = RandomInRange(1, 1000000);
        }

        // Register ID
        await supabase.from(deviceTable).insert({ device_id : device_id, lobby_id : lobbyCode, is_host : false, is_in_person : false });
        hasRegisteredDeviceID = true;

        // Hide join info
        document.getElementById("JoinInformation").innerHTML = "";
        document.getElementById("Doors").style.visibility = "visible";

        document.getElementById("leaveLobby").onclick = () => {location.reload(true); return false;}
        
        SetupButtons();
    }
}

async function SetupButtons() {

    // Don't run if not in a lobby
    if (!hasRegisteredDeviceID) {
        return;
    }

    // Grab doors
    let doorParent = document.getElementById("Door0")
    let children = doorParent.children;
    let doorParent1 = document.getElementById("Door1")
    let children1 = doorParent1.children;

    // Assign button click for doors
    for (let i = 0; i < children.length; i++) {
        let id = children[i].getAttribute('id');
        children[i].onclick = async () => await OnToggleButtonClicked(id);
    }
    // Assign button click for doors
    for (let i = 0; i < children1.length; i++) {
        let id = children1[i].getAttribute('id');
        children1[i].onclick = async () => await OnToggleButtonClicked(id);
    }

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

async function OnToggleButtonClicked(toggleId)
{
    const currentUnixTimestamp = Math.floor(new Date().getTime() / 1000);
    const targetUnixTimestamp = timestamp + 30;

    if (currentUnixTimestamp < targetUnixTimestamp)
    {
        // window.alert("TOGGLE ACTION IN COOLDOWN:\n" + targetUnixTimestamp - currentUnixTimestamp + " seconds left");
        window.alert(`TOGGLE ACTION IN COOLDOWN:\n${targetUnixTimestamp - currentUnixTimestamp} seconds left.`);
        return;
    }

    timestamp = currentUnixTimestamp;
    await supabase.from(toggleTable).update({toggle_id : toggleId, timestamp : new Date()}).eq('device_id', device_id)
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

function UpdateRole(selectedID)
{
    if (selectedID != device_id)
        return;

    document.getElementById("Role").innerHTML = "Save them...";
}

async function UpdateVoteDisplays() {
    for (const option of poll_options) {
        const optionLabel = document.getElementById(option.option_name + "Label");
        optionLabel.innerText = option.option_name + " (" + option.votes + ")";
    }
}

function SetVote(newVoteCheckbox) {

    if (checkedOption != null && checkedOption.option_id !== undefined) {
        DisplayNewVote(checkedOption, -1)
        document.getElementById(checkedOption.option_name + "Checkbox").checked = false;
    }

    // Remove checked and return if no new option to vote for
    if (newVoteCheckbox == null) {
        checkedOption = null;
        return;
    }

    // Vote for new option
    checkedOption = poll_options.find(element => element.option_id == newVoteCheckbox.getAttribute("option_id"));
    DisplayNewVote(checkedOption, 1);
}

async function DisplayNewVote(option, increment) {
    // Grab elements of previously checked options
    const checkedLabel = document.getElementById(option.option_name + "Label");

    // Find element in array
    const checkedInArray = poll_options.find(element => element.option_id == option.option_id);
    const checkedIndex = poll_options.indexOf(checkedInArray);

    // Update display
    poll_options[checkedIndex].votes += increment;
    checkedLabel.innerText = option.option_name + " (" + poll_options[checkedIndex].votes + ")";
    
    // Update database
    await supabase.from(voteTable).update({ votes : poll_options[checkedIndex].votes }).eq('option_id', option.option_id);
}



supabase
  .channel('table-db-changes')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: voteTable }, HandleRecordInserted)
  .on('postgres_changes', { event: 'DELETE', schema: 'public', table: voteTable }, HandleRecordDeleted)
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: voteTable }, HandleRecordUpdated)
  .on('postgres_changes', {event: 'DELETE', schema: 'public', table: deviceTable}, HandleDeviceDeleted)
  .subscribe()

function HandleRecordInserted(payload) {
    if (payload.new.lobby_id != lobbyCode) {
        return;
    }

    SetupButtons();
}

function HandleRecordDeleted(payload) {
    if (payload.old.lobby_id != lobbyCode) {
        return;
    }

    // Find and remove element in array
    const oldLobby = poll_options.find(element => element.option_id == payload.old.option_id);
    const index = poll_options.indexOf(oldLobby);
    poll_options.splice(index, 1);

    // Remove from document
    document.getElementById(oldLobby.option_name + "Label").parentNode.remove();
}

function HandleDeviceDeleted(payload) {
    if (payload.old.lobby_id != lobbyCode) {
        return;
    }

    if (!payload.old.is_host) {
        return;
    }

    location.reload(true);
    return false;
}

function HandleRecordUpdated(payload) {
    if (payload.new.lobby_id != lobbyCode) {
        return;
    }

    // Find element in array
    const elementInArray = poll_options.find(element => element.option_id == payload.new.option_id);
    const checkedIndex = poll_options.indexOf(elementInArray);

    // Update votes
    poll_options[checkedIndex].votes = payload.new.votes;
    UpdateVoteDisplays();
}


Setup();


window.addEventListener('beforeunload', () => {

    LeaveLobby();
});



document.getElementById("leaveLobby").onclick = async () => {
    LeaveLobby();
}

function LeaveLobby() {

    if (!hasRegisteredDeviceID) {
        return;
    }

    // Leave Lobby
    const blob = new Blob([JSON.stringify({ device_id })], { type: 'application/json' });
    navigator.sendBeacon('/api/deleteUser', blob);

    // Remove Vote
    const option_id = checkedOption.option_id;
    const votes = checkedOption.votes;
    const voteBlob = new Blob([JSON.stringify({option_id, votes})], {type: 'application/json'});
    navigator.sendBeacon('/api/votes/removeVote', voteBlob);

    // Clear data
    device_id = null;
    lobbyCode = null;
    optionsDiv.innerHTML = "";
    checkedOption = null;
    hasRegisteredDeviceID = false;
}



function RandomInRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
