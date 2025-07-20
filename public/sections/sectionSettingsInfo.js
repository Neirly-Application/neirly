import { showToast } from '../scripts/notification.js';

export default async function loadSettingsInfoSection(content, user) {
  document.body.style.background = '';
  document.body.style.transition = 'background 0.3s ease-in-out';

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';

  console.log('[loadSettingsInfoSection] user object:', user);

  const userId = user?._id || user?.id || 'Not available';
  const browserInfo = navigator.userAgent;
  const platform = navigator.platform || 'Unknown';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  content.innerHTML = `
    <div class="case-header">
      <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link">
        <i class="fas fa-arrow-left"></i>
      </a>
      <h2><i class="fas fa-info-circle"></i> App Information</h2>
    </div>

    <div class="app-info-container">
      <section class="info-section">
        <h3><i class="fas fa-cogs"></i> Application</h3>
        <p><strong>Name:</strong> Neirly</p>
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Release Date:</strong> Friday, June 27, 2025 at 11:35:23 PM</p>
        <p><strong>Last Update:</strong> 18 July 2025</p>
        <p><strong>Browser:</strong> ${browserInfo}</p>
        <p><strong>Platform:</strong> ${platform}</p>
        <p><strong>Timezone:</strong> ${timezone}</p>
      </section>

      <section class="info-section">
        <h3><i class="fas fa-user"></i> User</h3>
        <div class="info-line">
          <strong>User ID:</strong>
          <code id="user-id">${userId}</code>
          ${userId !== 'Not available' ? '<i class="fas fa-copy copy-icon" title="Copy ID" onclick="copyUserId()"></i>' : ''}
        </div>
        <p><strong>Provider:</strong> ${user?.provider || 'Not set'}</p>
        <p><strong>Accepted Terms:</strong> ${user?.acceptedTerms ? 'Yes' : 'No'}</p>
        <p><strong>Premium:</strong> ${user?.hasPremium ? 'Yes' : 'No'}</p>
        <p><strong>Account Created:</strong> ${user?.join_date ? new Date(user.join_date).toLocaleDateString() : 'Unknown'}</p>
        <p><strong>Roles:</strong> ${user?.roles?.join(', ') || 'None'}</p>
      </section>

      <section class="info-section">
        <h3><i class="fas fa-balance-scale"></i> Legal & Support</h3>
        <p><strong>Privacy Policy:</strong> <a href="/legal/privacy" target="_blank">View</a></p>
        <p><strong>Terms of Use:</strong> <a href="/legal/terms" target="_blank">View</a></p>
        <p><strong>Support Email:</strong> <a href="mailto:support@neirly.com">support@neirly.com</a></p>
        <p><strong>Discord:</strong> <a href="https://discord.gg/yvP66vRGYx" target="_blank">Join Server</a></p>
      </section>
    </div>
  `;

  window.copyUserId = () => {
    const el = document.getElementById('user-id');
    const text = el?.textContent?.trim();
    if (text && text !== 'Not available') {
      navigator.clipboard.writeText(text)
        .then(() => showToast('User ID copied!', 'success'))
        .catch(() => showToast('Failed to copy User ID.', 'error'));
    }
  };
}
