import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadMessagesList(content, user, onChatUserClick) {
  stopBubblesAnimation();
  stopBGAnimation();

  content.classList.remove('chat-box');
  content.classList.add('content');

  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';
  document.body.style.padding = '';

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
  <h2><i class="fas fa-comment-alt"></i>  Messages</h2>
  <div id="chats">
    <p>Loading chats...</p>
  </div>`;

  try {
    const res = await fetch('/api/chats/friends-and-chats', { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to load friends and chats');

    const { friends = [], recentChats = [] } = await res.json();

    chats.innerHTML = `
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
