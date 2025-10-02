const socket = io();

socket.on('pollData', (poll) => {
  document.getElementById('question').textContent = poll.question;
  const optionsDiv = document.getElementById('options');
  const resultsDiv = document.getElementById('results');
  optionsDiv.innerHTML = '';
  resultsDiv.innerHTML = '';

  poll.options.forEach((option, index) => {
    const btn = document.createElement('button');
    btn.textContent = option;
    btn.onclick = () => socket.emit('vote', index);
    optionsDiv.appendChild(btn);

    const p = document.createElement('p');
    p.textContent = `${option}: ${poll.votes[index]} votes`;
    resultsDiv.appendChild(p);
  });
});
