import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadSettingsSection(content, user) {
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
      <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#home'" class="back-arrow-link">
        <i class="fas fa-arrow-left"></i>
      </a>
      <h2><i class="fas fa-cog"></i> Settings</h2>
    </div>
    <div class="settings-container">
      <ul class="settings-menu" data-menu="disabled">
        <li><a href="#settings-account" data-menu="disabled"><i class="fas fa-user-shield" data-menu="disabled"></i> Account & Security</a></li>
        <li><a href="#settings-privacy" data-menu="disabled"><i class="fas fa-lock" data-menu="disabled"></i> Privacy</a></li>
        <li><a href="#settings-backup" data-menu="disabled"><i class="fas fa-floppy-disk" data-menu="disabled"></i> Backup</a></li>
        <li><a href="#settings-payments" class="premium" data-menu="disabled"><i class="fas fa-wallet" data-menu="disabled"></i> Plan & Payments</a></li>
        <li><a href="#settings-devices" data-menu="disabled"><i class="fas fa-laptop" data-menu="disabled"></i> Devices</a></li>
        <li><a href="#settings-activity" data-menu="disabled"><i class="fas fa-chart-line" data-menu="disabled"></i> Activity Logs</a></li>
        <li><a href="#settings-chats" data-menu="disabled"><i class="fas fa-comment-alt" data-menu="disabled"></i> Chats</a></li>
        <li><a href="#settings-notifications" data-menu="disabled"><i class="fas fa-bell" data-menu="disabled"></i> Notifications</a></li>
        <li><a href="#settings-theme" data-menu="disabled"><i class="fas fa-palette" data-menu="disabled"></i> App Theme</a></li>
        <li><a href="#settings-language" data-menu="disabled"><i class="fas fa-globe" data-menu="disabled"></i> Language</a></li>
        <li><a href="#settings-developer" data-menu="disabled"><i class="fas fa-key" data-menu="disabled"></i> API Keys</a></li>
        <li><a href="#settings-info" data-menu="disabled"><i class="fas fa-info-circle" data-menu="disabled"></i> App Information</a></li>
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
      '#settings-developer': 'Generate, manage, or revoke your personal API keys for development purposes.',
      '#settings-info': 'Access app version, legal information, and developer credits.'
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
