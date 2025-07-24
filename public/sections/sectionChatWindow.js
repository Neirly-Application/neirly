import { stopBGAnimation } from '../scripts/premiumBg.js';

export default async function loadChatWindow(content, user, chatUserId, onBack) {
  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';

  content.innerHTML = '<p>Loading chat...</p>';

  const escapeHTML = str =>
    str.replace(/[&<>'"]/g, tag =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );

  try {
    const [messagesRes, userRes] = await Promise.all([
      fetch(`/api/chats/messages/${chatUserId}`, { credentials: 'include' }),
      fetch(`/api/users/${chatUserId}`, { credentials: 'include' })
    ]);

    if (!messagesRes.ok || !userRes.ok) throw new Error('Failed to load messages or user');

    const messages = await messagesRes.json();
    const chatUser = await userRes.json();

    content.innerHTML = `
      <button id="back-btn" class="back-button">⬅️ Back</button>
      <div class="chat-box">
        <h2 style="margin-bottom: 10px;">Chat with ${escapeHTML(chatUser.name || 'User')}</h2>
        <div class="chat-messages" style="flex-grow: 1; overflow-y: auto; margin-bottom: 10px; max-height: 70vh;">
          ${messages.map(m => `
            <div class="message ${m.sender === chatUserId ? 'incoming' : 'outgoing'}" style="margin-bottom: 10px;">
              <strong>${m.sender === chatUserId ? escapeHTML(chatUser.name) : 'You'}</strong><br />
              ${escapeHTML(m.content)}<br />
              <small style="font-size: 10px; color: #767676e0;">${new Date(m.timestamp).toLocaleString()}</small>
            </div>
          `).join('')}
        </div>
        <form id="send-message-form" style="display:flex; gap:5px;">
          <input type="text" id="message-input" placeholder="Type your message..." required style="flex-grow:1;" autocomplete="off" />
          <button type="submit">Send</button>
        </form>
      </div>
    `;

    document.title = `${escapeHTML(chatUser.name || 'User')}`;

    const chatMessages = content.querySelector('.chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;

    content.querySelector('#back-btn').addEventListener('click', () => {
      onBack?.();
    });

    const form = content.querySelector('#send-message-form');
    const input = content.querySelector('#message-input');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const message = input.value.trim();
      if (!message) return;

      const sendRes = await fetch('/api/chats/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ to: chatUserId, content: message })
      });

      if (sendRes.ok) {
        const newMsg = await sendRes.json();
        chatMessages.innerHTML += `
          <div class="message outgoing" style="margin-bottom: 10px;">
            <strong>You</strong><br />
            ${escapeHTML(newMsg.content)}<br />
            <small style="font-size: 10px; color: #767676e0;">${new Date(newMsg.timestamp).toLocaleString()}</small>
          </div>
        `;
        input.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
      } else {
        alert('Failed to send message.');
      }
    });

  } catch (e) {
    content.innerHTML = `<p>Error loading chat: ${e.message}</p>`;
  }

  stopBGAnimation();
}
