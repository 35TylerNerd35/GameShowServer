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

// Dynamic vars
let lobbyCode;

const poll_options = [{}];

async function Setup() {
    
    joinLobbyBtn.onclick = async () => {

        // Attempt to find lobby
        lobbyCode = lobbyCodeInpt.value;
        const { data, error } = await supabase.from('DeviceInformation').select('lobby_id').eq('is_host', true).eq('lobby_id', lobbyCode);

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
        supabase.from('DeviceInformation').insert({ device_id : device_id, lobby_id : lobbyCode, is_host : false, is_in_person : inPersonCheck.checked });
        
        SetupButtons();
    }
}

async function SetupButtons() {
    // Grab database names, push to array
    const { data, error } = await supabase.from(tableName).select().eq('lobby_id', lobbyCode);
    for (const row of data) {
        poll_options.push(row);
    }
    console.log(poll_options);
}

// async function CreateButton(buttonInformation)




Setup();



function RandomInRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}
