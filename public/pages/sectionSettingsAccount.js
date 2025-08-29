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
    loadSectionCSS('/styles/dist/UIsettings/account-security.min.css');

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
    content.style.margin = '';

    content.innerHTML = `
      <div class="case-header">
        <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#home'" class="back-arrow-link">
          <i class="fas fa-arrow-left"></i>
        </a>
        <h2><i class="fas fa-user-shield"></i> Account & Security</h2>
      </div>

      <section class="settings-section">
        <form class="settings-form" id="accountSecurityForm">

          <div class="form-group">
            <label for="email"><i class="fas fa-envelope"></i> Email address</label>
            <input type="email" id="email" name="email" value="${user?.email || ''}" disabled>
          </div>
          <button class="cta-button"><i class="fas fa-envelope"></i> Change Email</button>
          
          <div class="form-group">
            <label for="username"><i class="fas fa-birthday-cake"></i> Birthday</label>
            <input type="date" id="birthday" name="birthday" value="${user.birthdate ? user.birthdate.split('T')[0] : ''}" disabled>
          </div>
          <button class="cta-button"><i class="fas fa-birthday-cake"></i> Change Birthday</button>

          <div class="form-group twofa">
              <a id="account-privacy"><i class="fas fa-user-secret"></i> Account privacy</a>
              <a id="change-password-btn"><i class="fas fa-lock"></i> Change Password</a>
              <a id="twofa-btn"><i class="fas fa-mobile-alt"></i> Two-factor Authentication (2FA)</a>
              <a id="change-password-btn"><i class="fas fa-sms"></i> Setup SMS verification</a>
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

    const initialValues = {};
    form.querySelectorAll('input').forEach(input => {
        initialValues[input.name] = input.value;
    });

    function checkChanges() {
        let changed = false;
        form.querySelectorAll('input').forEach(input => {
            if (input.value !== initialValues[input.name]) {
                changed = true;
            }
        });
        notification.style.display = changed ? 'flex' : 'none';
    }

    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', checkChanges);
    });

    cancelBtn.addEventListener('click', () => {
        form.querySelectorAll('input').forEach(input => {
            input.value = initialValues[input.name];
        });
        checkChanges();
    });

    saveBtn.addEventListener('click', () => {
        Object.keys(initialValues).forEach(name => {
            initialValues[name] = form.querySelector(`[name="${name}"]`).value;
        });
        checkChanges();
        showToast('Changes saved!', 'success');
    });

    /** ------------------------
     *  CHANGE PASSWORD HANDLING
     * ------------------------ */
    const changePasswordBtn = document.getElementById('change-password-btn');
    changePasswordBtn.addEventListener('click', () => {
      console.log("user.oauthPasswordChanged:", user.oauthPasswordChanged);
      const hideCurrentPassword = user.oauthPasswordChanged === true;

      const modal = document.createElement('div');
      modal.className = 'change-password-modal-overlay';
      modal.innerHTML = `
        <div class="change-password-modal">
          <h3>Change Password</h3>
          <form id="changePasswordForm">
            ${hideCurrentPassword ? '' : `
            <div class="form-group">
              <input type="password" placeholder="Current Password" id="currentPassword" name="currentPassword" required>
            </div>`}
            
            <div class="form-group">
              <input type="password" placeholder="New Password" id="newPassword" name="newPassword" required>
            </div>

            <div class="form-group">
              <input type="password" placeholder="Confirm New Password" id="confirmPassword" name="confirmPassword" required>
            </div>

            <button type="submit" class="btn-submit">Save</button>
            <button type="button" class="btn-cancel" id="cancelChangePwd">Cancel</button>
          </form>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('cancelChangePwd').onclick = () => modal.remove();

      document.getElementById('changePasswordForm').onsubmit = async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword')?.value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        try {
          const res = await fetch('/api/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
          });

          const data = await res.json();
          if (res.ok) {
            showToast(data.message, 'success');
            user.oauthPasswordChanged = true;
            modal.remove();
          } else {
            showToast(data.message || "Can't change password.", 'error');
          }
        } catch (err) {
          showToast('Error while changing password.', 'error');
        }
      };
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