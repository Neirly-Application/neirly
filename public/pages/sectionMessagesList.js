import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

let controller; // variabile globale al modulo per tenere l’AbortController

export default async function loadMessagesList(content, user, onChatUserClick) {
  stopBubblesAnimation();
  stopBGAnimation();

  // Annulla eventuale fetch precedente
  if (controller) controller.abort();
  controller = new AbortController();

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
    <h2><i class="fas fa-comment-alt"></i> Messages</h2>
    <div id="chats">
      <p>Loading chats...</p>
    </div>
  `;

  try {
    function showAddFriendMessage() {
      chatsContainer.innerHTML = `
        <p class="info-text" style="text-align:left;opacity:0.7;margin-bottom: 20px;" data-menu="friend-list" >Start now by adding a friend!</p>
        <button id="add-friend-btn" class="cta-button" data-menu="friend-list"><i class="fas fa-user-plus" data-menu="friend-list" ></i> Add a friend</button>
      `;
      const btn = chatsContainer.querySelector('#add-friend-btn');
      if (btn) btn.addEventListener('click', () => { window.location.hash = '#friend-list'; });
    }

    function showSelectFriendMessage() {
      chatsContainer.innerHTML = `
        <p class="info-text" style="text-align:left;opacity:0.7;margin-bottom: 20px;" data-menu="messages friend-list">Chat now with your friends!</p>
        <button id="add-friend-btn" class="cta-button" data-menu="messages friend-list"><i class="fas fa-user-plus" data-menu="messages friend-list"></i> Select a friend</button>
      `;
      const btn = chatsContainer.querySelector('#add-friend-btn');
      if (btn) btn.addEventListener('click', () => { window.location.hash = '#friend-list'; });
    }

    const res = await fetch('/api/chats/friends-and-chats', { 
      credentials: 'include',
      signal: controller.signal 
    });

    if (!res.ok) throw new Error('Failed to load friends and chats');

    const { friends = [], recentChats = [] } = await res.json();

    const chatsContainer = content.querySelector('#chats');
    if (!chatsContainer) return; 

    if (recentChats.length > 0) {
      chatsContainer.innerHTML = `
        <div class="recent-chats">
          ${recentChats.map(c => `
            <div class="chat-item chat-name" data-userid="${c._id}">
              <img src="${c.profilePictureUrl || '../media/user.webp'}" alt="Avatar" class="avatar"/>
              <span>${c.name || c.uniquenick || 'Unknown'}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else if (friends.length > 0) {
      showSelectFriendMessage();
    } else {
      showAddFriendMessage();
    }

    content.querySelectorAll('.chat-item, .friend-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-userid');
        if (id) onChatUserClick(id);
      });
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return;
    }
    console.error(error);
    if (content.querySelector('#chats')) {
      content.innerHTML = `<p>Error loading chats: ${error.message}</p>`;
    }
  }
}
