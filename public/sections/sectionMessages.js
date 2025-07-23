import loadMessagesList from './sectionMessagesList.js';
import loadChatWindow from './sectionChatWindow.js';
import { stopBGAnimation } from '../scripts/premiumBg.js';

export default async function loadMessagesSection(content, user, subSection = 'list', subSectionParams = {}) {
  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';
  document.title = `Messages`;

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';

  const topNavbar = document.querySelector('.mobile-topbar');
  const bottomNavbar = document.querySelector('.bottom-navbar');

  if (subSection === 'list') {
    if (topNavbar) topNavbar.style.display = '';
    if (bottomNavbar) bottomNavbar.style.display = '';

    await loadMessagesList(content, user, (chatUserId) => {
      loadMessagesSection(content, user, 'chat', { chatUserId });
    });

  } else if (subSection === 'chat') {
    if (topNavbar) topNavbar.style.display = 'none';
    if (bottomNavbar) bottomNavbar.style.display = 'none';

    const { chatUserId } = subSectionParams;
    if (!chatUserId) {
      content.innerHTML = '<p>Chat user ID missing</p>';
      return;
    }

    await loadChatWindow(content, user, chatUserId, () => {
      if (topNavbar) topNavbar.style.display = '';
      if (bottomNavbar) bottomNavbar.style.display = '';

      loadMessagesSection(content, user, 'list');
    });
  }

  stopBGAnimation();
};