import { showToast } from '../scripts/notification.js';

export default async function loadSettingsApiKeysSection(content, user) {
  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';
  document.title = 'Settings – API Keys';

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';
  
  content.innerHTML = `
    <div class="api-section">
      <div class="case-header">
        <a onclick="history.back()" class="back-arrow-link">
          <i class="fas fa-arrow-left"></i>
        </a>
        <h2><i class="fas fa-key"></i> API Keys</h2>
      </div>

      <div id="notification" class="notification"></div>

      <p>Generate and manage your Neirly API key. You can use it to embed your profile or fetch user data via SDK-like requests.</p>
      <div id="api-key-container" class="loading">Loading…</div>
      <div style="margin-top:1rem;">
        <button id="btn-generate" class="btn btn-generate">Generate new key</button>
        <button id="btn-revoke" class="btn btn-revoke" disabled>Revoke key</button>
      </div>
    </div>
  `;

  const notify = (msg, type = 'info') => {
    const el = document.getElementById('notification');
    el.textContent = msg;
    el.className = `notification show ${type}`;
    setTimeout(() => el.classList.remove('show'), 4000);
  };

  const container = document.getElementById('api-key-container');
  const btnGen = document.getElementById('btn-generate');
  const btnRev = document.getElementById('btn-revoke');

  async function refresh() {
    container.innerHTML = 'Loading…';
    btnRev.disabled = true;

    try {
      const res = await fetch('/api/developer/current-key', { credentials: 'include' });
      if (res.status === 404) {
        showToast('No active API key.', 'error');
        return;
      }
      const { key, description, createdAt, status, lastUsed } = await res.json();

      container.innerHTML = `
        <div class="api-key-card">
          <span class="label">Active API key:</span>
          <div class="api-key-value">
            <input type="password" id="api-key-input" value="${key}" readonly />
            <button id="toggle-visibility" class="btn-mini"><i class="fas fa-eye"></i></button>
            <button id="copy-key" class="btn-mini"><i class="fas fa-copy"></i></button>
          </div>
          <div class="api-key-info">
            Description: ${description}<br>
            Created at: ${new Date(createdAt).toLocaleString()}<br>
            Last used: ${ lastUsed ? new Date(lastUsed).toLocaleString() : 'Never' }<br>
            Status: <strong>${status}</strong>
          </div>
        </div>
      `;
      btnRev.disabled = false;

      document.getElementById('toggle-visibility').onclick = () => {
        const input = document.getElementById('api-key-input');
        input.type = input.type === 'password' ? 'text' : 'password';
      };
      document.getElementById('copy-key').onclick = () => {
        const input = document.getElementById('api-key-input');
        navigator.clipboard.writeText(input.value);
        showToast('API key copied to clipboard.', 'success');
      };

    } catch (err) {
      console.error(err);
      showToast('Error loading API key.', 'error');
    }
  }

  btnGen.onclick = async () => {
    const desc = prompt('What will you use this key for? (min 10 characters)');
    if (!desc || desc.trim().length < 10) return showToast('Description too short.', 'error');

    try {
      btnGen.disabled = true;
      const res = await fetch('/api/developer/generate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ description: desc.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast('API key generated.', 'success');
      await refresh();
    } catch (err) {
      showToast(err.message || 'Error generating key.', 'error');
    } finally {
      btnGen.disabled = false;
    }
  };

  btnRev.onclick = async () => {
    if (!confirm('Are you sure you want to revoke your key?')) return;

    try {
      btnRev.disabled = true;
      const res = await fetch('/api/developer/revoke-key', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      showToast('API key revoked.', 'info');
      showToast('No active API key.', 'error');
    } catch (err) {
      showToast(err.message || 'Error revoking key.', 'error');
    }
  };

  await refresh();
}
