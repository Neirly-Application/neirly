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
    loadSectionCSS('/styles/UIsettings/account-security.css');
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

        <!--
        <div class="form-group">
          <label for="currentPassword"><i class="fas fa-lock"></i> Current password</label>
          <input type="password" id="currentPassword" name="currentPassword" placeholder="••••••••">
        </div>

        <div class="form-group">
          <label for="newPassword"><i class="fas fa-key"></i> New password</label>
          <input type="password" id="newPassword" name="newPassword" placeholder="••••••••" minlength="8">
        </div>
        -->

        <div class="form-group twofa">
            <a><i class="fas fa-lock"></i> Change Password</a>
            <a><i class="fas fa-mobile-alt"></i> Two-factor Authentication (2FA)</a>
            <a><i class="fas fa-key"></i> Setup a Passkey</a>
            <a id="delete-account-btn" style="color: var(--danger-bg-color-hover);"><i class="fas fa-trash"></i> Delete my Account</a>
        </div>
      </form>
    </section>
  `;

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
