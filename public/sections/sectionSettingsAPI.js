import { showToast, customConfirm } from '../scripts/notification.js';
import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadSettingsApiKeysSection(content, user) {
  stopBubblesAnimation();
  stopBGAnimation();

  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';
  document.title = `Settings – API Keys`;

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';
  content.style.display = '';
  content.style.flexDirection = '';
  content.style.justifyContent = '';
  content.style.alignItems = '';
  content.style.height = '';
  content.style.overflow = '';
  content.style.padding = '';
  content.style.margin = '';

  content.style = 'transition: background 0.3s ease-in-out;';
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

      <div id="api-key-container" class="api-key-placeholder"><br>Loading…</div>

      <div style="margin-top:1rem;">
        <button id="btn-generate" class="btn btn-generate">Generate new key</button>
        <button id="btn-revoke" class="btn btn-revoke" disabled>Revoke key</button>
      </div>
    </div>
  `;

  const container = document.getElementById('api-key-container');
  const btnGen = document.getElementById('btn-generate');
  const btnRev = document.getElementById('btn-revoke');
  const notify = (msg, type = 'info') => {
    const el = document.getElementById('notification');
    el.textContent = msg;
    el.className = `notification show ${type}`;
    setTimeout(() => el.classList.remove('show'), 4000);
  };

  const toggleVisibility = () => {
    const input = document.getElementById('api-key-input');
    const btn = document.getElementById('toggle-visibility');
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.innerHTML = `<i class="fas fa-eye${isHidden ? '-slash' : ''}"></i>`;
  };

  const copyToClipboard = () => {
    const input = document.getElementById('api-key-input');
    navigator.clipboard.writeText(input.value);
    showToast('API key copied to clipboard.', 'success');
  };

  async function refresh() {
    container.innerHTML = '<br>Loading…';
    btnRev.disabled = true;

    try {
      const res = await fetch('/api/developer/current-key', { credentials: 'include' });

      if (res.status === 404) {
        container.innerHTML = `<br><p>No active API key.</p>`;
        return;
      }

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Invalid response format');
      }

      const { key, description, createdAt, status, lastUsed } = data;

      container.innerHTML = `
        <div class="api-key-card">
          <span class="label">Active API key:</span>
          <div class="api-key-value">
            <input type="password" id="api-key-input" value="${key}" readonly />
            <button id="toggle-visibility" class="btn-mini" aria-label="Toggle visibility"><i class="fas fa-eye"></i></button>
            <button id="copy-key" class="btn-mini" aria-label="Copy key"><i class="fas fa-copy"></i></button>
          </div>
          <div class="api-key-info">
            <strong>Description:</strong> ${escapeHTML(description)}<br>
            <strong>Created at:</strong> ${new Date(createdAt).toLocaleString()}<br>
            <strong>Last used:</strong> ${lastUsed ? new Date(lastUsed).toLocaleString() : 'Never'}<br>
            <strong>Status:</strong> ${escapeHTML(status)}
          </div>
        </div>
      `;

      btnRev.disabled = false;

      document.getElementById('toggle-visibility').onclick = toggleVisibility;
      document.getElementById('copy-key').onclick = copyToClipboard;

    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error loading API key.', 'error');
      container.innerHTML = `<p>Error loading API key.</p>`;
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
      await refresh();
    } catch (err) {
      showToast(err.message || 'Error revoking key.', 'error');
    }
  };

  refresh();
}

// Escape HTML to prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (match) => {
    const escape = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return escape[match];
  });
}