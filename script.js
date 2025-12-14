
const ALLOWED_RANKS = [
  "Kitchen Trainee",
  "Junior Chef",
  "Chef",
  "Station Cook",
  "Senior Chef",
  "Lead Chef",
  "Shift Supervisor",
  "Sous Chef",
  "Head Chef",
  "Supervisory Chef",
  "Culinary Chef",
  "Operations Coordinator",
  "Chief of Staff",
  "Deputy Franchise Director",
  "Franchise Director",
  "Administrator"
];

function submitShift() {
  const statusEl = document.getElementById('status');
  const shiftName = document.getElementById('shiftName').value.trim();
  const host = document.getElementById('host').value.trim();
  const hosterCode = document.getElementById('hosterCode')?.value.trim();
  const entries = document.getElementById('entries').value.trim();

  statusEl.className = '';
  statusEl.style.display = 'none';

  if (hosterCode !== HOSTER_CODE) {
    showStatus('error', 'Invalid hoster code.');
    return;
  }

  if (!shiftName || !host || !entries) {
    showStatus('error', 'All fields are required.');
    return;
  }

  const lines = entries.split('\n').filter(line => line.trim());
  const parsedEntries = [];
  const errors = [];

  lines.forEach((line, i) => {
    const parts = line.split(',').map(p => p.trim());
    
    if (parts.length !== 3) {
      errors.push(`Line ${i + 1}: Invalid format (expected 3 fields, got ${parts.length})`);
      return;
    }

    const [username, xp, rank] = parts;

    if (!username) {
      errors.push(`Line ${i + 1}: Username is empty`);
    }

    if (!xp || isNaN(xp)) {
      errors.push(`Line ${i + 1}: XP must be a number`);
    }

    if (!ALLOWED_RANKS.includes(rank)) {
      errors.push(`Line ${i + 1}: Invalid rank "${rank}"`);
    }

    if (username && !isNaN(xp) && ALLOWED_RANKS.includes(rank)) {
      parsedEntries.push({ 
        username, 
        xp: Number(xp), 
        rank 
      });
    }
  });

  if (errors.length) {
    showStatus('error', 'Validation errors:\n' + errors.join('\n'));
    return;
  }

  showStatus('info', 'Submitting shift...');

  const formData = new URLSearchParams();
  formData.append('apiKey', API_KEY);
  formData.append('shiftName', shiftName);
  formData.append('host', host);
  formData.append('entries', JSON.stringify(parsedEntries));

  fetch(SCRIPT_URL, {
    method: "POST",
    body: formData
  })
  .then(res => res.text())
  .then(text => {
    if (text === "OK") {
      showStatus(
        'success',
        `Shift submitted successfully!\n\n` +
        `Shift: ${shiftName}\n` +
        `Host: ${host}\n` +
        `Entries: ${parsedEntries.length}\n` +
        `Total XP: ${parsedEntries.reduce((s, e) => s + e.xp, 0)}`
      );
      document.getElementById('entries').value = '';
      document.getElementById('shiftName').value = '';
    } else {
      showStatus('error', 'Server error:\n' + text);
    }
  })
  .catch(err => {
    showStatus('error', 'Network error:\n' + err.message);
  });
}

function showStatus(type, message) {
  const statusEl = document.getElementById('status');
  statusEl.className = type;
  statusEl.textContent = message;
  statusEl.style.display = 'block';
}



