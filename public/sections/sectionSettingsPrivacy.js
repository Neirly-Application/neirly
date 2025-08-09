import { showToast } from '../scripts/notification.js';
import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadSettingsPrivacySection(content, user) {
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
      <a href="#settings" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
      <h2><i class="fas fa-lock"></i> Privacy</h2>
    </div>
      <form id="privacy-form" class="privacy-form">
        <div class="form-group">
          <label for="profile-visibility">Who can view your profile?</label>
          <select id="profile-visibility">
            <option value="friends">Only Friends</option>
            <option value="everyone">Everyone</option>
            <option value="private">No one (private)</option>
          </select>
        </div>
      </form>

      <div id="privacy-unsaved-notification" class="unsaved-notification" style="display:none;">
        <span>You have unsaved changes.</span>
        <button id="privacy-save-changes-btn" class="btn-submit">Save</button>
      </div>
    `;

    const privacySelect = document.getElementById('profile-visibility');
    const privacyUnsavedNotification = document.getElementById('privacy-unsaved-notification');
    const privacySaveBtn = document.getElementById('privacy-save-changes-btn');

    let originalPrivacy = user?.privacy || 'friends'; // default fallback
    privacySelect.value = originalPrivacy;

    function togglePrivacyUnsaved(show) {
      privacyUnsavedNotification.style.display = show ? 'flex' : 'none';
    }

    privacySelect.addEventListener('change', () => {
      togglePrivacyUnsaved(privacySelect.value !== originalPrivacy);
    });

    privacySaveBtn.addEventListener('click', async () => {
      const selected = privacySelect.value;
      try {
        const res = await fetch('/api/privacy', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ visibility: selected })
        });
      
        const data = await res.json();
        if (res.ok) {
          showToast('Privacy settings updated.', 'success');
          originalPrivacy = selected;
          togglePrivacyUnsaved(false);
          user.privacy = selected;
        } else {
          showToast(data.message || 'Error saving privacy settings.', 'error');
        }
      } catch (err) {
        console.error('Error saving privacy settings:', err);
        showToast('Network error while saving settings.', 'error');
      }
    });

  
};