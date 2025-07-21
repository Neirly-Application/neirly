import { stopBGAnimation } from '../scripts/premiumBg.js';

export default async function loadMessagesList(content, user, onChatUserClick) {
  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';

  content.innerHTML = '<p>Loading chats...</p>';
  try {
    const res = await fetch('/api/chats/friends-and-chats');
    if (!res.ok) throw new Error('Failed to load friends and chats');

    const { friends = [], recentChats = [] } = await res.json();

    content.innerHTML = `
      <h2>Messages</h2>
      <div class="recent-chats">${recentChats.map(c => `
        <div class="chat-item" data-userid="${c._id}">
          <img src="/api/users/${c._id}/profile-picture" alt="Avatar" class="avatar"/>
          <span>${c.name || c.uniquenick}</span>
        </div>
      `).join('')}</div>
      <h4>Friends</h4>
      <div class="friends-list">${friends.map(f => `
        <div class="friend-item" data-userid="${f._id}">
          <img src="/api/users/${f._id}/profile-picture" alt="Avatar" class="avatar"/>
          <span>${f.name || f.uniquenick}</span>
        </div>
      `).join('')}</div>
    `;

    content.querySelectorAll('.chat-item, .friend-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-userid');
        onChatUserClick(id);
      });
    });
  } catch (e) {
    console.error(e);
    content.innerHTML = `<p>Error loading chats: ${e.message}</p>`;
  }
};

stopBGAnimation();