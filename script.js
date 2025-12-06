import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


// Connect to supabase
const SUPABASE_URL = 'https://izghwhppfuumvzjehfrr.supabase.co'
const SUPABASE_ANON_KEY = "sb_publishable_OfDnBziyMsBman1rO6HAuQ_5Oe1uBAf";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Declare vars
const deviceTable = 'DeviceInformation'
const toggleTable = 'ToggleTable'

// Declare documents
const lobbyCodeInpt = document.getElementById("lobbyCode");
const joinLobbyBtn = document.getElementById("joinLobby");

// Dynamic vars
let lobbyCode;
let device_id;
let timestamp = Math.floor(new Date().getTime() / 1000);

let is_helper = false;
let hasRegisteredDeviceID = false;


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

        // Hide join info, show lobby info
        document.getElementById("JoinInformation").style.visibility = "collapse";
        document.getElementById("Lobby").style.visibility = "visible";

        // Setup leave lobby button
        document.getElementById("leaveLobby").onclick = () => {location.reload(true); return false;}
        
        SetupButtons();
    }
}

async function SetupButtons() {

    // Don't run if not in a lobby
    if (!hasRegisteredDeviceID) {
        return;
    }

    // Grab all door elements
    var elements = document.getElementsByClassName("DoorCode");

    // Iterate through each door
    for(var i = 0; i < elements.length; i++) {

        // Grab the door id
        let doorCode = elements[i].dataset.code;

        // Set visuals on button
        elements[i].setAttribute("id", "door-button");
        elements[i].innerHTML = doorCode;

        // Subscribe click event
        elements[i].onclick = async () => await OnToggleButtonClicked(doorCode);
    }
}

async function OnToggleButtonClicked(toggleId)
{
    const currentUnixTimestamp = Math.floor(new Date().getTime() / 1000);
    const targetUnixTimestamp = timestamp + 30;

    if (currentUnixTimestamp < targetUnixTimestamp)
    {
        window.alert(`TOGGLE ACTION IN COOLDOWN:\n${targetUnixTimestamp - currentUnixTimestamp} seconds left.`);
        return;
    }

    timestamp = currentUnixTimestamp;
    StartTimer();
    await supabase.from(toggleTable).update({toggle_id : toggleId, timestamp : new Date()}).eq('device_id', device_id)
}

supabase
  .channel('table-db-changes')
  .on('postgres_changes', {event: 'DELETE', schema: 'public', table: deviceTable}, HandleDeviceDeleted)
  .on('postgres_changes', {event: 'UPDATE', schema: 'public', table: deviceTable}, HandleDeviceUpdated)
  .subscribe()

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

function HandleDeviceUpdated(payload) {
    if (payload.new.device_id != device_id)
        return;

    if (payload.new.team_id != 1)
        return;

    if (payload.new.is_helper)
    {
        document.getElementById("Title").innerHTML = "Help them escape!";
        is_helper = true;
    }
    else
    {
        document.getElementById("Title").innerHTML = "Don't let them out!";
    }
}

Setup();
StartTimer();

window.addEventListener('beforeunload', () => {
    LeaveLobby();
});

function LeaveLobby() {

    if (!hasRegisteredDeviceID) {
        return;
    }

    // Leave Lobby
    const blob = new Blob([JSON.stringify({ device_id })], { type: 'application/json' });
    navigator.sendBeacon('/api/deleteUser', blob);

    // Clear data
    device_id = null;
    lobbyCode = null;
    hasRegisteredDeviceID = false;
}



function RandomInRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}


function StartTimer()
{
    let time = 30;

    document.getElementById("timer").innerHTML = time + "seconds remaining";

    // Update the count down every 1 second
    var x = setInterval(function() {
        
    // Decrease time by 1 and display count
    time -= 1;
    document.getElementById("timer").innerHTML = time + "seconds remaining";
        
    // Change text when count is over
    if (time < 0) {
        clearInterval(x);
        document.getElementById("timer").innerHTML = "Toggle Available!";
        time = 30;
    }
    }, 1000);
}

const query = matchMedia("screen and (orientation:portrait)");
query.onchange = e => {
    if (e.matches) {
        document.getElementById("PortraitCover").style.visibility = "visible";
    } else {
        document.getElementById("PortraitCover").style.visibility = "collapse";
    }
}

if (query.matches) {
    document.getElementById("PortraitCover").style.visibility = "visible";
}