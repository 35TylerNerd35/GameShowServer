const options = ["Unreal", "Unity", "Godot"];
const optionsDiv = document.getElementById("options");
const resultsDiv = document.getElementById("results");

// Render buttons
options.forEach((opt, i) => {
  const btn = document.createElement("button");
  btn.textContent = opt;
  btn.onclick = () => vote(i);
  optionsDiv.appendChild(btn);
});

// Fetch votes from API
async function fetchVotes() {
  const res = await fetch("/api/vote");
  const data = await res.json();
  renderResults(data);
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

// Submit a vote
async function vote(index) {
  await fetch("/api/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ index })
  });
  fetchVotes(); // refresh results
}

// Initial fetch
fetchVotes();
