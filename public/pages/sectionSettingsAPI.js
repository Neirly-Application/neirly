import { showToast, customConfirm } from '../scripts/notification.js';
import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadSettingsApiKeysSection(content, user) {
  stopBubblesAnimation();
  stopBGAnimation();

  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';
  content.style.display = '';
  content.style.flexDirection = '';
  content.style.justifyContent = '';
  content.style.alignItems = '';
  content.style.height = '';
  content.style.overflow = '';
  content.style.padding = '';
  content.style.margin  = '';
  content.dataset.menu = '';
  content.style = 'transition: background 0.3s ease-in-out;';
    
  content.innerHTML = `
    <div class="api-section">
      <div class="api-header">
        <div class="header-left">
          <a onclick="history.back()" class="back-btn">
            <i class="fas fa-arrow-left"></i>
          </a>
          <div class="header-title">
            <h1><i class="fas fa-key"></i> API Keys</h1>
          </div>
        </div>
        <button id="help-btn" class="help-btn" title="Help & Documentation">
          <i class="fas fa-question"></i>
        </button>
      </div>

      <div id="notification" class="notification"></div>

      <div class="intro-card">
        <div class="intro-icon">
          <i class="fas fa-code"></i>
        </div>
        <div class="intro-content">
          <h2>Developer Access</h2>
          <p>Generate and manage your Neirly API key. Use it to embed your profile or fetch user data via SDK-like requests with full authentication.</p>
        </div>
      </div>

      <div class="api-key-section">
        <div id="api-key-container" class="loading">
          <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading your API key...</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <button id="btn-generate" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            <span>Generate New Key</span>
          </button>
          <button id="btn-revoke" class="btn btn-danger" disabled>
            <i class="fas fa-trash-alt"></i>
            <span>Revoke Key</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Generate Key Modal -->
    <div id="generate-modal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-plus-circle"></i> Generate New API Key</h3>
          <button class="modal-close" id="modal-close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="key-description">What will you use this key for?</label>
            <input type="text" id="key-description" placeholder="e.g., Mobile app integration, Website embed..." maxlength="100">
            <span class="form-help">Minimum 10 characters required</span>
          </div>
        </div>
        <div class="modal-footer">
          <button id="modal-cancel-btn" class="btn btn-secondary">
            <i class="fas fa-times"></i>
            <span>Cancel</span>
          </button>
          <button id="modal-generate-btn" class="btn btn-primary">
            <i class="fas fa-key"></i>
            <span>Generate Key</span>
          </button>
        </div>
        <div id="modal-loading" class="modal-loading">
          <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Generating your API key...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Help Modal -->
    <div id="help-modal" class="modal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3><i class="fas fa-book"></i> API Documentation</h3>
          <button class="modal-close" id="help-modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="help-section">
            <h4><i class="fas fa-book-open"></i> Complete Documentation</h4>
            <div class="coming-soon-banner">
              <div class="coming-soon-content">
                <i class="fas fa-rocket"></i>
                <div>
                  <h5>Full API Documentation Coming Soon!</h5>
                  <p>We're working on comprehensive documentation that will include detailed endpoints, authentication methods, rate limits, and extensive code examples for all major programming languages.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="help-section">
            <h4><i class="fas fa-terminal"></i> Quick Start</h4>
            <p>Use your API key to authenticate requests to the Neirly API:</p>
            <div class="code-block">
              <code>curl -H "Authorization: Bearer YOUR_API_KEY" https://api.neirly.com/v1/profile</code>
              <button class="copy-code-btn" onclick="copyToClipboard(this)">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>
          
          <div class="help-section">
            <h4><i class="fas fa-shield-alt"></i> Security Best Practices</h4>
            <ul>
              <li><strong>Keep it secure:</strong> Never share your API key publicly or commit it to version control</li>
              <li><strong>Use environment variables:</strong> Store your key as an environment variable in production</li>
              <li><strong>Revoke if compromised:</strong> Immediately revoke and regenerate if you suspect your key is compromised</li>
              <li><strong>Monitor usage:</strong> Check the "Last used" timestamp regularly to detect unauthorized usage</li>
            </ul>
          </div>

          <div class="help-section">
            <h4><i class="fas fa-code"></i> Code Examples</h4>
            <div class="code-examples">
              <div class="code-example">
                <h5>JavaScript (Fetch)</h5>
                <div class="code-block">
                  <code>fetch('https://api.neirly.com/v1/profile', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
}).then(response => response.json())</code>
                  <button class="copy-code-btn" onclick="copyToClipboard(this)">
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
              
              <div class="code-example">
                <h5>Python (Requests)</h5>
                <div class="code-block">
                  <code>import requests

headers = {'Authorization': 'Bearer YOUR_API_KEY'}
response = requests.get('https://api.neirly.com/v1/profile', headers=headers)</code>
                  <button class="copy-code-btn" onclick="copyToClipboard(this)">
                    <i class="fas fa-copy"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="help-section">
            <h4><i class="fas fa-link"></i> Available Endpoints (Preview)</h4>
            <p class="endpoints-note">Basic endpoints available now. More coming with full documentation:</p>
            <div class="endpoints-list">
              <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/v1/profile</span>
                <span class="description">Get user profile data</span>
              </div>
              <div class="endpoint">
                <span class="method get">GET</span>
                <span class="url">/v1/embed</span>
                <span class="description">Get embeddable profile widget</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Overlay -->
    <div id="modal-overlay" class="modal-overlay"></div>
  `;

  // Initialize modal functionality
  initializeModals();

  const container = document.getElementById('api-key-container');
  const btnGen = document.getElementById('btn-generate');
  const btnRev = document.getElementById('btn-revoke');

  async function refresh() {
    container.innerHTML = `
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Loading your API key...</span>
      </div>
    `;
    btnRev.disabled = true;

    try {
      const res = await fetch('/', { credentials: 'include' });
      if (res.status === 404) {
        container.innerHTML = `
          <div class="no-key-state">
            <div class="no-key-icon">
              <i class="fas fa-key"></i>
            </div>
            <h3>No API Key Found</h3>
            <p>Generate your first API key to get started with the Neirly API</p>
          </div>
        `;
        return;
      }
      const { key, description, createdAt, status, lastUsed } = await res.json();

      container.innerHTML = `
        <div class="api-key-card">
          <div class="key-header">
            <h3><i class="fas fa-shield-alt"></i> Your Active API Key</h3>
            <span class="status-badge status-${status.toLowerCase()}">${status.toUpperCase()}</span>
          </div>
          
          <div class="key-display">
            <div class="key-input-group">
              <input type="password" id="api-key-input" value="${key}" readonly />
              <button id="toggle-visibility" class="btn-icon" title="Toggle visibility">
                <i class="fas fa-eye"></i>
              </button>
              <button id="copy-key" class="btn-icon" title="Copy to clipboard">
                <i class="fas fa-copy"></i>
              </button>
            </div>
          </div>

          <div class="key-info">
            <div class="info-item">
              <strong>Description:</strong> ${description}
            </div>
            <div class="info-item">
              <strong>Created:</strong> ${new Date(createdAt).toLocaleString()}
            </div>
            <div class="info-item">
              <strong>Last used:</strong> ${lastUsed ? new Date(lastUsed).toLocaleString() : 'Never'}
            </div>
          </div>
        </div>
      `;
      btnRev.disabled = false;

      // Bind key actions
      bindKeyActions();

    } catch (err) {
      console.error(err);
      container.innerHTML = `
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Error Loading API Key</h3>
          <p>Please try refreshing the page</p>
        </div>
      `;
      showToast('Error loading API key.', 'error');
    }
  }

  function bindKeyActions() {
    const toggleBtn = document.getElementById('toggle-visibility');
    const copyBtn = document.getElementById('copy-key');
    const input = document.getElementById('api-key-input');

    if (toggleBtn) {
      toggleBtn.onclick = () => {
        const icon = toggleBtn.querySelector('i');
        if (input.type === 'password') {
          input.type = 'text';
          icon.className = 'fas fa-eye-slash';
        } else {
          input.type = 'password';
          icon.className = 'fas fa-eye';
        }
      };
    }

    if (copyBtn) {
      copyBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(input.value);
          const icon = copyBtn.querySelector('i');
          icon.className = 'fas fa-check';
          copyBtn.classList.add('success');
          setTimeout(() => {
            icon.className = 'fas fa-copy';
            copyBtn.classList.remove('success');
          }, 2000);
          showToast('API key copied to clipboard!', 'success');
        } catch (err) {
          showToast('Failed to copy to clipboard', 'error');
        }
      };
    }
  }

  function initializeModals() {
    const generateModal = document.getElementById('generate-modal');
    const helpModal = document.getElementById('help-modal');
    const overlay = document.getElementById('modal-overlay');
    
    // Generate modal controls
    const generateBtn = document.getElementById('btn-generate');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalGenerateBtn = document.getElementById('modal-generate-btn');
    const keyDescriptionInput = document.getElementById('key-description');
    
    // Help modal controls
    const helpBtn = document.getElementById('help-btn');
    const helpModalClose = document.getElementById('help-modal-close');

    function openModal(modal) {
      modal.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
      modal.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      
      if (modal === generateModal) {
        keyDescriptionInput.value = '';
        hideModalLoading();
      }
    }

    function showModalLoading() {
      document.getElementById('modal-loading').classList.add('active');
      modalGenerateBtn.disabled = true;
      modalCancelBtn.disabled = true;
    }

    function hideModalLoading() {
      document.getElementById('modal-loading').classList.remove('active');
      modalGenerateBtn.disabled = false;
      modalCancelBtn.disabled = false;
    }

    // Event listeners
    generateBtn.onclick = () => openModal(generateModal);
    helpBtn.onclick = () => openModal(helpModal);
    
    modalCloseBtn.onclick = () => closeModal(generateModal);
    modalCancelBtn.onclick = () => closeModal(generateModal);
    helpModalClose.onclick = () => closeModal(helpModal);
    
    overlay.onclick = () => {
      closeModal(generateModal);
      closeModal(helpModal);
    };

    // Generate key functionality
    modalGenerateBtn.onclick = async () => {
      const description = keyDescriptionInput.value.trim();
      if (description.length < 10) {
        showToast('Description must be at least 10 characters long.', 'error');
        return;
      }

      try {
        showModalLoading();
        
        const res = await fetch('/generate-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ description })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        
        closeModal(generateModal);
        showToast('🎉 API key generated successfully!', 'success');
        await refresh();
        
      } catch (err) {
        hideModalLoading();
        showToast(err.message || 'Error generating key.', 'error');
      }
    };

    // Enter key support for modal
    keyDescriptionInput.onkeydown = (e) => {
      if (e.key === 'Enter' && keyDescriptionInput.value.trim().length >= 10) {
        modalGenerateBtn.click();
      }
    };
  }

  // Revoke key functionality
  btnRev.onclick = async () => {
    const confirmed = confirm('⚠️ Are you sure you want to revoke your API key?\n\nThis action cannot be undone and will immediately disable all applications using this key.');
    if (!confirmed) return;

    try {
      btnRev.disabled = true;
      const originalHTML = btnRev.innerHTML;
      btnRev.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Revoking...</span>';
      
      const res = await fetch('/revoke-key', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      showToast('API key revoked successfully.', 'info');
      await refresh();
    } catch (err) {
      showToast(err.message || 'Error revoking key.', 'error');
    } finally {
      // Reset button state regardless of success or failure
      btnRev.disabled = false;
      btnRev.innerHTML = '<i class="fas fa-trash-alt"></i> <span>Revoke Key</span>';
    }
  };

  // Global function for copying code examples
  window.copyToClipboard = async function(button) {
    const codeBlock = button.parentElement.querySelector('code');
    try {
      await navigator.clipboard.writeText(codeBlock.textContent);
      const icon = button.querySelector('i');
      const originalClass = icon.className;
      icon.className = 'fas fa-check';
      setTimeout(() => {
        icon.className = originalClass;
      }, 2000);
      showToast('Code copied to clipboard!', 'success');
    } catch (err) {
      showToast('Failed to copy code', 'error');
    }
  };

  // Notification function
  const notify = (msg, type = 'info') => {
    const el = document.getElementById('notification');
    el.textContent = msg;
    el.className = `notification show ${type}`;
    setTimeout(() => el.classList.remove('show'), 4000);
  };

  await refresh();
}