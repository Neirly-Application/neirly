export default async function loadChatWindow(content, user, chatUserId, onBack) {
  content.innerHTML = '<p>Loading chat...</p>';

  try {
    const res = await fetch(`/api/chats/messages/${chatUserId}`);
    if (!res.ok) throw new Error('Failed to load messages');
    const messages = await res.json();

    content.innerHTML = `
      <button id="back-btn">⬅️ Back</button>
      <div style="display:flex; flex-direction: column; height: 100%; border: 1px solid #ccc; padding: 10px;">
        <div class="chat-messages" style="flex-grow: 1; overflow-y: auto; margin-bottom: 10px;">
          ${messages.map(m => `
            <div class="message ${m.userId === chatUserId ? 'incoming' : 'outgoing'}">
              <strong>${m.userId === chatUserId ? 'Them' : 'You'}</strong><br />
              ${m.content}<br />
              <small>${new Date(m.timestamp).toLocaleString()}</small>
            </div>
          `).join('')}
        </div>
        <form id="send-message-form" style="display:flex; gap:5px;">
          <input type="text" id="message-input" placeholder="Type your message..." required style="flex-grow:1;" />
          <button type="submit">Send</button>
        </form>
      </div>
    `;

    content.querySelector('#back-btn').addEventListener('click', onBack);

    content.querySelector('#send-message-form').addEventListener('submit', async e => {
      e.preventDefault();
      const input = content.querySelector('#message-input');
      const message = input.value.trim();
      if (!message) return;

      const sendRes = await fetch('/api/chats/messages', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ to: chatUserId, content: message })
      });

      if (sendRes.ok) {
        loadChatWindow(content, user, chatUserId, onBack);
      } else {
        alert('Failed to send message.');
      }
    });

  } catch (e) {
    content.innerHTML = `<p>Error loading chat: ${e.message}</p>`;
  }
}
