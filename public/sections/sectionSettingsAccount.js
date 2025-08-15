import { showToast, customConfirm } from '../scripts/notification.js';
import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

function loadSectionCSS(href) {
    if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
}

export default async function loadSettingsAccountSection(content, user) {
    // Load section-specific CSS
    loadSectionCSS('/styles/UIsettings/account-security.css');

    // Stop background animations
    stopBubblesAnimation();
    stopBGAnimation();

    // Reset page styles
    document.body.style.background = '';
    document.body.style.animation = '';
    document.body.style.backgroundSize = '';
    document.body.style.transition = 'background 0.3s ease-in-out';

    // Reset content container styles
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

    // Render the HTML content
    content.innerHTML = `
      <div class="case-header">
        <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link">
          <i class="fas fa-arrow-left"></i>
        </a>
        <h2><i class="fas fa-user-shield"></i> Account & Security</h2>
      </div>

      <section class="settings-section">
        <form class="settings-form" id="accountSecurityForm">

          <div class="form-group">
            <label for="email"><i class="fas fa-envelope"></i> Email address</label>
            <input type="email" id="email" name="email" value="${user?.email || ''}">
          </div>

          <div class="form-group">
            <label for="username"><i class="fas fa-birthday-cake"></i> Birthday</label>
            <input type="date" id="birthday" name="birthday" value="${user.birthdate ? user.birthdate.split('T')[0] : ''}">
          </div>

          <div class="form-group twofa">
              <a id="change-password-btn"><i class="fas fa-lock"></i> Change Password</a>
              <a id="twofa-btn"><i class="fas fa-mobile-alt"></i> Two-factor Authentication (2FA)</a>
              <a id="passkey-btn"><i class="fas fa-key"></i> Setup a Passkey</a>
              <a id="delete-account-btn" style="color: var(--danger-bg-color-hover);"><i class="fas fa-trash"></i> Delete my Account</a>
          </div>
        </form>

        <!-- Unsaved changes notification -->
        <div id="unsaved-notification" class="unsaved-notification" style="display: none;">
          <span>You have unsaved changes.</span>
          <button id="cancel-changes-btn" class="btn-cancel">Cancel</button>
          <button id="save-changes-btn" class="btn-submit">Save</button>
        </div>
      </section>
    `;

    /** ------------------------
     * UNSAVED CHANGES HANDLING
     * ------------------------ */

    const form = document.getElementById('accountSecurityForm');
    const notification = document.getElementById('unsaved-notification');
    const cancelBtn = document.getElementById('cancel-changes-btn');
    const saveBtn = document.getElementById('save-changes-btn');

    // Store initial field values to compare later
    const initialValues = {};
    form.querySelectorAll('input').forEach(input => {
        initialValues[input.name] = input.value;
    });

    // Function to check if any changes have been made
    function checkChanges() {
        let changed = false;
        form.querySelectorAll('input').forEach(input => {
            if (input.value !== initialValues[input.name]) {
                changed = true;
            }
        });
        // Show/hide the notification based on change status
        notification.style.display = changed ? 'flex' : 'none';
    }

    // Listen for changes in all inputs
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', checkChanges);
    });

    // Cancel button → restore initial values and hide notification
    cancelBtn.addEventListener('click', () => {
        form.querySelectorAll('input').forEach(input => {
            input.value = initialValues[input.name];
        });
        checkChanges();
    });

    // Save button → simulate save and update initialValues
    saveBtn.addEventListener('click', () => {
        // TODO: Implement actual save logic (e.g., send data to API)
        Object.keys(initialValues).forEach(name => {
            initialValues[name] = form.querySelector(`[name="${name}"]`).value;
        });
        checkChanges();
        showToast('Changes saved!', 'success');
    });

    /** ------------------------
     * DELETE ACCOUNT HANDLING
     * ------------------------ */
    const deleteBtn = document.getElementById('delete-account-btn');
    deleteBtn?.addEventListener('click', async () => {
        if (await customConfirm('Do you really want to delete your account? This action cannot be undone, meaning you\'ll confirm the deletion of all your information.')) {
            try {
                const res = await fetch('/api/auth/delete-account', {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (res.ok) {
                    showToast('Account successfully deleted. Redirecting to login page...', 'success');
                    window.location.href = '/register.html';
                } else {
                    const data = await res.json();
                    showToast('Error: ' + (data.message || "Can't delete account."), 'error');
                }
            } catch (err) {
                showToast('Error while deleting account.', 'error');
            }
        }
    });
}
