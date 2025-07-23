import { showToast, customConfirm } from '../scripts/notification.js';
import { stopBGAnimation } from '../scripts/premiumBg.js';

export default async function loadSettingsDangerSection(content, user) {
  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';
  document.title = `Settings - Danger Zone`;

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';

  content.innerHTML = `
    <div class="case-header">
      <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
      <h2><i class="fas fa-exclamation-triangle"></i> Dangerous Actions</h2>
    </div>
      <button id="delete-account-btn" class="btn-delete-account"><i class="fas fa-trash"></i> Delete Account</button>
  `;

  const deleteBtn = document.getElementById('delete-account-btn');
  deleteBtn?.addEventListener('click', async () => {
    if (await customConfirm('Are you sure you want to delete your account? This action cannot be undone.')) {
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

  stopBGAnimation();
};