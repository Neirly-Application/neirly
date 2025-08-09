import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadMessagesList(content, user, onChatUserClick) {
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

  content.innerHTML = '<p>Loading chats...</p>';

  try {
    const res = await fetch('/api/chats/friends-and-chats', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load friends and chats');

    const { friends = [], recentChats = [] } = await res.json();

    content.innerHTML = `
      <h2>Messages</h2>
      <div class="recent-chats">
        ${recentChats.map(c => `
          <div class="chat-item chat-name" data-userid="${c._id}">
            <img src="${c.profilePictureUrl || '../media/user.png'}" alt="Avatar" class="avatar"/>
            <span>${c.name || c.uniquenick || 'Unknown'}</span>
          </div>
        `).join('')}
      </div>
    `;

    content.querySelectorAll('.chat-item, .friend-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-userid');
        if (id) onChatUserClick(id);
      });
    });
  } catch (error) {
    console.error(error);
    content.innerHTML = `<p>Error loading chats: ${error.message}</p>`;
  }

  
}
