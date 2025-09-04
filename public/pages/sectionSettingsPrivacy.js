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
  content.style.margin  = '';
  content.dataset.menu = '';

  content.innerHTML = `
    <div class="case-header">
      <a href="#settings" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
      <h2><i class="fas fa-lock"></i> Privacy</h2>
    </div>
      <form id="privacy-form" class="privacy-form">
        <div class="form-group">
          <label for="profile-visibility">Who can view your profile?</label>
          <select id="profile-visibility" name="profile-visibility">
            <option value="vp_everyone">Everyone</option>
            <option value="vp_logged_in">Only logged-in users</option>
            <option value="vp_friends">Friends</option>
            <option value="vp_friends_except">Friends except...</option>
            <option value="vp_only_me">Only me</option>
            <option value="vp_custom">Custom list</option>
          </select>
        </div>

        <!-- Amicizie -->
        <div class="form-group">
          <label for="friend-requests">Who can send you friend requests?</label>
          <select id="friend-requests" name="friend-requests">
            <option value="fr_everyone">Everyone</option>
            <option value="fr_friends_of_friends">Friends of friends</option>
            <option value="fr_nearby">Nearby users</option>
            <option value="fr_no_one">No one</option>
          </select>
        </div>

        <!-- Messaggi -->
        <div class="form-group">
          <label for="messages">Who can send you messages?</label>
          <select id="messages" name="messages">
            <option value="msg_everyone">Everyone</option>
            <option value="msg_friends">Friends</option>
            <option value="msg_friends_of_friends">Friends of friends</option>
            <option value="msg_no_one">No one</option>
          </select>
        </div>

        <!-- Attività -->
        <div class="form-group">
          <label for="activity-visibility">Who can see your activity (posts, likes)?</label>
          <select id="activity-visibility" name="activity-visibility">
            <option value="act_everyone">Everyone</option>
            <option value="act_friends">Friends</option>
            <option value="act_only_me">Only me</option>
            <option value="act_custom">Custom list</option>
          </select>
        </div>

        <!-- Stato online -->
        <div class="form-group">
          <label for="status-visibility">Who can see your online status?</label>
          <select id="status-visibility" name="status-visibility">
            <option value="st_everyone">Everyone</option>
            <option value="st_friends">Friends</option>
            <option value="st_no_one">No one</option>
          </select>
        </div>

        <!-- Tag -->
        <div class="form-group">
          <label for="tag-permissions">Who can tag you?</label>
          <select id="tag-permissions" name="tag-permissions">
            <option value="tag_everyone">Everyone</option>
            <option value="tag_friends">Friends</option>
            <option value="tag_no_one">No one</option>
          </select>
        </div>

        <!-- Foto -->
        <div class="form-group">
          <label for="photo-permissions">Who can see your photos?</label>
          <select id="photo-permissions" name="photo-permissions">
            <option value="ph_everyone">Everyone</option>
            <option value="ph_friends">Friends</option>
            <option value="ph_only_me">Only me</option>
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

    let originalPrivacy = user?.privacy || 'vp_friends';
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