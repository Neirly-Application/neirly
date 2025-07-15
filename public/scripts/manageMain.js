import loadCeoSection from '../sections/sectionCeo.js';
import loadFriendListSection from '../sections/sectionFriendList.js';
import loadMapSection from '../sections/sectionMap.js';
import loadMapScreenSection from '../sections/sectionMapScreen.js';
import loadMessagesSection from '../sections/sectionMessages.js';
import loadNotificationsSection from '../sections/sectionNotifications.js';
import loadProfileSection from '../sections/sectionProfile.js';
import loadSettingsSection from '../sections/sectionSettings.js';
import loadSettingsAccountSection from '../sections/sectionSettingsAccount.js';
import loadSettingsActivitySection from '../sections/sectionSettingsActivity.js';
import loadSettingsChatsSection from '../sections/sectionSettingsChats.js';
import loadSettingsDangerSection from '../sections/sectionSettingsDanger.js';
import loadSettingsDevicesSection from '../sections/sectionSettingsDevices.js';
import loadSettingsInfoSection from '../sections/sectionSettingsInfo.js';
import loadSettingsLanguageSection from '../sections/sectionSettingsLanguage.js';
import loadSettingsNotificationsSection from '../sections/sectionSettingsNotifications.js';
import loadSettingsPrivacySection from '../sections/sectionSettingsPrivacy.js';
import loadSettingsThemeSection from '../sections/sectionSettingsTheme.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const navItems = document.querySelectorAll('.nav-item');
    const content = document.querySelector('.content');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const adminSection = document.getElementById('admin-section');

    let allNotifications = [];
    let openNotificationId = null;
    let user = null;

    async function fetchAndSetUser() {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        if (!res.ok) {
          window.location.href = '/login.html';
          return;
        }
        user = await res.json();

        if (welcomeMessage && user.name) {
          welcomeMessage.textContent = `Welcome ${user.name}!`;
        }

        if (user && user.roles && user.roles.includes('ceo')) {
          // Mostra la sezione admin
          if (adminSection) adminSection.style.display = 'flex';
        } else {
          if (adminSection) adminSection.style.display = 'none';
        }
      } catch (err) {
        console.error('Failed to fetch user profile on load:', err);
        window.location.href = '/login.html';
      }
    }

    function checkUnreadNotifications(unreadCount) {
      const badges = document.querySelectorAll('.notification-badge');
      badges.forEach(badge => {
        if (unreadCount > 0) {
          badge.style.display = 'inline-block';
          badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
          badge.classList.add('vibrate');
        } else {
          badge.style.display = 'none';
          badge.textContent = '';
          badge.classList.remove('vibrate');
        }
      });
    }

    async function preloadNotifications() {
      try {
        const res = await fetch('/api/notifications', { credentials: 'include' });
        if (res.ok) {
          allNotifications = await res.json();
          // Puoi poi fare render o aggiornamenti se serve
        } else {
          console.error('Failed to preload notifications, status:', res.status);
        }
      } catch (err) {
        console.error('Error preloading notifications:', err);
      }
    }

    async function fetchUnreadCount() {
      try {
        const res = await fetch('/api/notifications/unread-count', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch unread notifications count.');
        const data = await res.json();
        checkUnreadNotifications(data.unread || 0);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    }

    await fetchAndSetUser();
    await preloadNotifications();
    await fetchUnreadCount();

    async function caricaSezione(section) {
      content.innerHTML = '<div class="loading">Loading...</div>';
      switch (section) {
        case 'ceo':
          await loadCeoSection(content, user);
          break;
        case 'friend-list':
          await loadFriendListSection(content, user);
          break;
        case 'map':
          await loadMapSection(content, user);
          break;
        case 'map-screen':
          await loadMapScreenSection(content, user);
          break;
        case 'messages':
          await loadMessagesSection(content, user);
          break;
        case 'notifications':
          await loadNotificationsSection(content, user);
          break;
        case 'profile':
          await loadProfileSection(content, user);
          break;
        case 'settings':
          await loadSettingsSection(content, user);
          break;
        case 'settings-account':
          await loadSettingsAccountSection(content, user);
          break;
        case 'settings-activity':
          await loadSettingsActivitySection(content, user);
          break;
        case 'settings-chats':
          await loadSettingsChatsSection(content, user);
          break;
        case 'settings-danger':
          await loadSettingsDangerSection(content, user);
          break;
        case 'settings-devices':
          await loadSettingsDevicesSection(content, user);
          break;
        case 'settings-info':
          await loadSettingsInfoSection(content, user);
          break;
        case 'settings-language':
          await loadSettingsLanguageSection(content, user);
          break;
        case 'settings-notifications':
          await loadSettingsNotificationsSection(content, user);
          break;
        case 'settings-privacy':
          await loadSettingsPrivacySection(content, user);
          break;
        case 'settings-theme':
          await loadSettingsThemeSection(content, user);
          break;
        default:
          content.innerHTML = '<p>Sezione non trovata</p>';
          break;
      }
    }

    document.querySelectorAll('.logout-btn').forEach(logoutBtn => {
      logoutBtn.addEventListener('click', async e => {
        e.preventDefault();
        try {
          const res = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });

          if (res.ok) {
            window.location.href = '/login.html';
          } else {
            showToast('Logout failed.', 'error');
          }
        } catch (err) {
          showToast('Network error while logging out.', 'error');
        }
      });
    });
    await fetchAndSetUser();

    const initialSection = window.location.hash.substring(1) || 'map';
    caricaSezione(initialSection);

    window.addEventListener('hashchange', () => {
      const section = window.location.hash.substring(1) || 'map';
      caricaSezione(section);
    });

  } catch (err) {
    console.error(err);
    window.location.href = '/login.html';
  }
});