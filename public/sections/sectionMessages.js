import loadMessagesList from './sectionMessagesList.js';
import loadChatWindow from './sectionChatWindow.js';

export default async function loadMessagesSection(content, user, subSection = 'list', subSectionParams = {}) {
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
}
