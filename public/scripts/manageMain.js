import loadPremiumSection from '../pages/sectionPremium.js';
import loadFriendListSection from '../pages/sectionFriendList.js';
import loadHomeSection from '../pages/sectionHome.js';
import loadMapSection from '../pages/sectionMap.js';
import loadMessagesSection from '../pages/sectionMessages.js';
import loadNotificationsSection from '../pages/sectionNotifications.js';
import loadProfileSection from '../pages/sectionProfile.js';
import loadSearchSection from '../pages/sectionSearch.js';
import loadSettingsSection from '../pages/sectionSettings.js';
import loadSettingsAccountSection from '../pages/sectionSettingsAccount.js';
import loadSettingsActivitySection from '../pages/sectionSettingsActivity.js';
import loadSettingsChatsSection from '../pages/sectionSettingsChats.js';
import loadSettingsDevicesSection from '../pages/sectionSettingsDevices.js';
import loadSettingsInfoSection from '../pages/sectionSettingsInfo.js';
import loadSettingsDeveloperSection from '../pages/sectionSettingsAPI.js';
import loadSettingsBackupSection from '../pages/sectionSettingsBackup.js';
import loadSettingsLanguageSection from '../pages/sectionSettingsLanguage.js';
import loadSettingsNotificationsSection from '../pages/sectionSettingsNotifications.js';
import loadSettingsPrivacySection from '../pages/sectionSettingsPrivacy.js';
import loadSettingsThemeSection from '../pages/sectionSettingsTheme.js';
import loadDefaultSection from '../pages/sectionDefault.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch("/api/profile", { credentials: "include" });
    if (!res.ok) throw new Error("Error while fetching profile.");
    const user = await res.json();

    // --- NAV PROFILE ---
    function getNavProfileHTML(isMobile) {
      if (isMobile) {
        return `<img src="${user.profilePictureUrl}" alt="Profile Picture" class="profile-icon">`;
      } else {
        return `
          <img src="${user.profilePictureUrl}" alt="Profile Picture" class="profile-icon">
          <span class="nav-username">${user.name || user.email}</span>`;
      }
    }

    function updateNavProfiles() {
      const isMobile = window.innerWidth <= 768;
      document.querySelectorAll("#nav-profile-loader").forEach(el => {
        el.innerHTML = getNavProfileHTML(isMobile);
      });
    }
    updateNavProfiles();
    window.addEventListener("resize", updateNavProfiles);

    // --- APPLY THEME ---
    function applyTheme(theme) {
      if (theme === 'dark') {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
      } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
      }
    }
    applyTheme(user.theme || 'dark');

    // --- NOTIFICATIONS & FRIENDS ---
    const content = document.querySelector('.content');
    let allNotifications = [];
    window.disablePullToRefresh = false;
    let currentLoadToken = null;

    function checkUnreadNotifications(unreadCount) {
      const badges = document.querySelectorAll('.notification-badge');
      badges.forEach(badge => {
        if (unreadCount > 0) {
          badge.style.display = 'inline-block';
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
        }
      } catch (err) {
        console.error('Error preloading notifications:', err);
      }
    }

    async function fetchUnreadCount() {
      try {
        const res = await fetch('/api/notifications/unread-count', { credentials: 'include' });
        if (!res.ok) throw new Error();
        const data = await res.json();
        checkUnreadNotifications(data.unread || 0);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    }

    async function fetchFriendNotificationCount() {
      try {
        const res = await fetch('/api/friends', { credentials: 'include' });
        if (!res.ok) return;
        const { pendingRequests = [] } = await res.json();
        const friendIconBadge = document.querySelector('.friend-notification-badge');

        const count = pendingRequests.length;
        if (friendIconBadge) {
          if (count > 0) {
            friendIconBadge.style.display = 'inline-block';
            friendIconBadge.classList.add('vibrate');
          } else {
            friendIconBadge.style.display = 'none';
            friendIconBadge.textContent = '';
            friendIconBadge.classList.remove('vibrate');
          }
        }
      } catch (err) {
        console.error('Error while loading friend requests:', err);
      }
    }

    // --- LOAD SECTION ---
    async function loadSection(section) {
      const thisToken = Symbol('load');
      currentLoadToken = thisToken;

      const sectionTitles = {
        ceo: "Neirly - CEO",
        "friend-list": "Neirly - Friends",
        home: "Neirly - Home",
        map: "Neirly - Map",
        "map-screen": "Neirly - Map Screen",
        messages: "Neirly - Messages",
        notifications: "Neirly - Notifications",
        premium: "Neirly - Premium",
        profile: "Neirly - Profile",
        search: "Neirly - Search",
        settings: "Neirly - Settings",
        "settings-account": "Neirly - Account & Security",
        "settings-activity": "Neirly - Activity",
        "settings-chats": "Neirly - Chat Settings",
        "settings-devices": "Neirly - Devices",
        "settings-info": "Neirly - Info",
        "settings-developer": "Neirly - Developer",
        "settings-backup": "Neirly - Backups",
        "settings-language": "Neirly - Language",
        "settings-notifications": "Neirly - Notifications Settings",
        "settings-privacy": "Neirly - Privacy",
        "settings-theme": "Neirly - Theme",
        "default": "Neirly - Loading",
      };

      document.title = sectionTitles[section] || "Neirly";
      content.innerHTML = '<div class="loading">Loading...</div>';

      const disablePull = [
        "premium", "profile", "map-screen", "friend-list", "settings", "settings-account", "settings-chats", "settings-info", "settings-language", "settings-notifications",
        "settings-privacy", "settings-theme"
      ];
      window.disablePullToRefresh = disablePull.includes(section);

      switch (section) {
        case 'friend-list': await loadFriendListSection(content, user); break;
        case 'home': await loadHomeSection(content, user); break;
        case 'map': await loadMapSection(content, user); break;
        case 'messages': await loadMessagesSection(content, user); break;
        case 'notifications': await loadNotificationsSection(content, user); break;
        case 'premium': await loadPremiumSection(content, user); break;
        case 'profile': await loadProfileSection(content, user); break;
        case 'search': await loadSearchSection(content, user); break;
        case 'settings': await loadSettingsSection(content, user); break;
        case 'settings-account': await loadSettingsAccountSection(content, user); break;
        case 'settings-activity': await loadSettingsActivitySection(content, user); break;
        case 'settings-chats': await loadSettingsChatsSection(content, user); break;
        case 'settings-devices': await loadSettingsDevicesSection(content, user); break;
        case 'settings-info': await loadSettingsInfoSection(content, user); break;
        case 'settings-developer': await loadSettingsDeveloperSection(content, user); break;
        case 'settings-backup': await loadSettingsBackupSection(content, user); break;
        case 'settings-language': await loadSettingsLanguageSection(content, user); break;
        case 'settings-notifications': await loadSettingsNotificationsSection(content, user); break;
        case 'settings-privacy': await loadSettingsPrivacySection(content, user); break;
        case 'settings-theme': await loadSettingsThemeSection(content, user); break;
        default: await loadDefaultSection(content, user); return;
      }

      if (currentLoadToken !== thisToken) return;
    }

    // --- LOGOUT ---
    document.querySelectorAll('.logout-btn').forEach(logoutBtn => {
      logoutBtn.addEventListener('click', async e => {
        e.preventDefault();
        try {
          const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
          res.ok ? window.location.href = '/login.html' : showToast('Logout failed.', 'error');
        } catch (err) {
          showToast('Network error while logging out.', 'error');
        }
      });
    });

    // --- INITIALIZATION ---
    await preloadNotifications();
    await fetchUnreadCount();
    await fetchFriendNotificationCount();
    setInterval(fetchFriendNotificationCount, 1000);

    const initialSection = window.location.hash.substring(1) || 'home';
    loadSection(initialSection);

    window.addEventListener('hashchange', () => {
      const section = window.location.hash.substring(1) || 'home';
      loadSection(section);
    });

    // --- PULL TO REFRESH ---
    function setupPullToRefresh() {
      const refreshThreshold = 70;
      const refreshContainer = document.getElementById('pull-to-refresh');
      const content = document.getElementById('content');

      let startY = 0;
      let isTouching = false;
      let isRefreshing = false;
      let activeRefreshToken = null;

      window.addEventListener('hashchange', () => {
        if (isRefreshing) {
          isRefreshing = false;
          activeRefreshToken = null;
          refreshContainer.classList.remove('active');
          refreshContainer.style.transform = `translateY(-60px)`;
          content.style.transform = `translateY(0px)`;
        }
      });

      document.addEventListener('touchstart', (e) => {
        if (window.disablePullToRefresh) return;
        if (content.scrollTop <= 0 && !isRefreshing) {
          isTouching = true;
          startY = e.touches[0].clientY;
        }
      });

      document.addEventListener('touchmove', (e) => {
        if (!isTouching || isRefreshing || window.disablePullToRefresh) return;
        if (content.scrollTop > 0) {
          isTouching = false;
          return;
        }
        const moveY = e.touches[0].clientY;
        const distance = moveY - startY;
        if (distance > 0) {
          e.preventDefault();
          const translateY = Math.min(distance / 2, refreshThreshold + 30);
          refreshContainer.style.transform = `translateY(${translateY}px)`;
          content.style.transform = `translateY(${translateY}px)`;
        }
      }, { passive: false });

      document.addEventListener('touchend', async () => {
        if (!isTouching || isRefreshing) return;
        const match = refreshContainer.style.transform.match(/translateY\(([\d.-]+)px\)/);
        const currentTransform = match ? parseFloat(match[1]) : 0;
        isTouching = false;
        if (currentTransform >= refreshThreshold) {
          isRefreshing = true;
          const refreshToken = Symbol('refresh');
          activeRefreshToken = refreshToken;
          refreshContainer.classList.add('active');
          refreshContainer.style.transform = `translateY(60px)`;
          content.style.transform = `translateY(60px)`;
          const currentSection = window.location.hash.replace('#', '') || 'home';
          await loadSection(currentSection);
          if (activeRefreshToken !== refreshToken) return;
          refreshContainer.classList.remove('active');
          refreshContainer.style.transform = `translateY(-60px)`;
          content.style.transform = `translateY(0px)`;
          isRefreshing = false;
        } else {
          refreshContainer.style.transform = `translateY(-60px)`;
          content.style.transform = `translateY(0px)`;
        }
      });
    }
    setupPullToRefresh();

  } catch (err) {
    console.error(err);
    window.location.href = '/login.html';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  loadEmoji().catch(err => console.error('[emoji]', err));
});

async function loadEmoji() {
  const res = await fetch('../media/emoji/emoji.json');
  if (!res.ok) throw new Error('emoji.json non trovato: ' + res.status);
  const data = await res.json();

  const toChar = unified =>
    String.fromCodePoint(...unified.split('-').map(u => parseInt(u, 16)));

  const map = new Map();
  for (const e of data) {
    if (!e.image) continue;
    const img = `../media/emoji/img/apple/64/${e.image}`;
    if (e.unified)       map.set(toChar(e.unified), img);
    if (e.non_qualified) map.set(toChar(e.non_qualified), img);
  }

  const keys = Array.from(map.keys()).sort((a, b) => b.length - a.length);
  if (!keys.length) return;

  const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(keys.map(escapeRegex).join('|'), 'g');

  function replaceInNode(node) {
    if (!node || ['INPUT','TEXTAREA'].includes(node.nodeName)) return;

    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const html = child.nodeValue.replace(re, m =>
          `<img src="${map.get(m)}" alt="${m}" class="custom-emoji">`
        );
        if (html !== child.nodeValue) {
          const span = document.createElement('span');
          span.innerHTML = html;
          child.replaceWith(...span.childNodes);
        }
      } else {
        replaceInNode(child);
      }
    });
  }

  const content = document.getElementById('content');
  if (!content) return;

  replaceInNode(content);

  const observer = new MutationObserver(() => replaceInNode(content));
  observer.observe(content, { childList: true, subtree: true });
}


function detectDevTools() {
  const threshold = 160;
  const widthDiff = window.outerWidth - window.innerWidth > threshold;
  const heightDiff = window.outerHeight - window.innerHeight > threshold;

  return widthDiff || heightDiff;
}

setInterval(() => {
  if (detectDevTools()) {
    console.clear();
    console.log(
      '%cSTOP HERE!',
      'color: red; font-size: 150px; font-weight: bold; text-shadow: 2px 2px 0 black;'
    );
    console.log('%c⚠️ WARNING: Do not paste anything here!', 'color: orange; font-size: 20px; font-weight: bold;');
    console.log('%cThis console is intended for developers. If someone told you to paste code here, they might be trying to steal your account or sensitive data.', 'color: white; font-size: 16px;');
    console.log('%cPasting unknown code can allow attackers to impersonate you, access private data, or take control of your account.', 'color: white; font-size: 16px;');
    console.log('%cIf you are not sure what you are doing, close the DevTools immediately.', 'color: #ff4444; font-size: 16px; font-weight: bold;');
  }
}, 1000);