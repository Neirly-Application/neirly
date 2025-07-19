export default async function loadChatWindow(content, user, chatUserId, onBack) {
  document.body.style.background = '';
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
      fetch(`/api/chats/messages/${chatUserId}`),
      fetch(`/api/users/${chatUserId}`) 
    ]);

    if (!messagesRes.ok || !userRes.ok) throw new Error('Failed to load messages or user');

    const messages = await messagesRes.json();
    const chatUser = await userRes.json(); 

    content.innerHTML = `
      <button id="back-btn">⬅️ Back</button>
      <h2 style="margin: 0 0 10px 0;">Chat with ${escapeHTML(chatUser.name || 'User')}</h2>
      <div style="display:flex; flex-direction: column; height: 100%; border: 1px solid #ccc; padding: 10px;">
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
          <input type="text" id="message-input" placeholder="Type your message..." required style="flex-grow:1;" />
          <button type="submit">Send</button>
        </form>
      </div>
    `;

    const chatMessages = content.querySelector('.chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;

    content.querySelector('#back-btn').addEventListener('click', onBack);

    content.querySelector('#send-message-form').addEventListener('submit', async e => {
      e.preventDefault();
      const input = content.querySelector('#message-input');
      const message = input.value.trim();
      if (!message) return;

      const sendRes = await fetch('/api/chats/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: chatUserId, content: message })
      });

      if (sendRes.ok) {
        input.value = '';
        await loadChatWindow(content, user, chatUserId, onBack);
      } else {
        alert('Failed to send message.');
      }
    });

  } catch (e) {
    content.innerHTML = `<p>Error loading chat: ${e.message}</p>`;
  }
}
