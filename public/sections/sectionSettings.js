import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadSettingsSection(content, user) {
  stopBubblesAnimation();
  stopBGAnimation();

  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';
  document.title = `Settings`;

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
      <h2><i class="fas fa-cog"></i> Settings</h2>
    </div>
    <div class="settings-container">
      <ul class="settings-menu">
        <li><a href="#settings-account"><i class="fas fa-user-shield"></i> Account & Security</a></li>
        <li><a href="#settings-privacy"><i class="fas fa-lock"></i> Privacy</a></li>
        <li><a href="#settings-backup"><i class="fas fa-floppy-disk"></i> Backup</a></li>
        <li><a href="#settings-payments" class="premium"><i class="fas fa-wallet"></i> Plan & Payments</a></li>
        <li><a href="#settings-devices"><i class="fas fa-laptop"></i> Devices</a></li>
        <li><a href="#settings-activity"><i class="fas fa-chart-line"></i> Activity Logs</a></li>
        <li><a href="#settings-chats"><i class="fas fa-comment-alt"></i> Chats</a></li>
        <li><a href="#settings-notifications"><i class="fas fa-bell"></i> Notifications</a></li>
        <li><a href="#settings-theme"><i class="fas fa-palette"></i> App Theme</a></li>
        <li><a href="#settings-language"><i class="fas fa-globe"></i> Language</a></li>
        <li><a href="#settings-info"><i class="fas fa-info-circle"></i> App Information</a></li>
        <li><a href="#settings-developer"><i class="fas fa-key"></i> API Keys</a></li>
        <li><a href="#settings-danger" class="danger"><i class="fas fa-exclamation-triangle"></i> Dangerous Actions</a></li>
      </ul>
    </div>
  `;

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth <= 768;
  if (!isMobile) {
    const tooltips = {
      '#settings-account': 'Manage your account details, update your email, and change your password securely.',
      '#settings-backup': 'Create or restore backups of your data to prevent loss or transfer between devices.',
      '#settings-payments': 'View your current plan, upgrade to premium, and manage your payment methods.',
      '#settings-devices': 'See a list of connected devices and revoke access to unknown or unused ones.',
      '#settings-privacy': 'Control who can see your activity, and manage data sharing and tracking settings.',
      '#settings-activity': 'Review detailed logs of recent actions, logins, and security events tied to your account.',
      '#settings-chats': 'Customize chat settings, archive conversations, and clear chat history if needed.',
      '#settings-notifications': 'Enable or disable alerts for email, push, or in-app notifications.',
      '#settings-theme': 'Choose between light, dark, or custom themes to personalize the app appearance.',
      '#settings-language': 'Change the interface language for better accessibility or personal preference.',
      '#settings-info': 'Access app version, legal information, and developer credits.',
      '#settings-developer': 'Generate, manage, or revoke your personal API keys for development purposes.',
      '#settings-danger': 'Perform high-risk actions like deactivating or permanently deleting your account.'
    };

    const links = content.querySelectorAll('.settings-menu a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (tooltips[href]) {
        link.setAttribute('data-tooltip', tooltips[href]);
        link.classList.add('custom-tooltip');
      }
    });
  }
}
