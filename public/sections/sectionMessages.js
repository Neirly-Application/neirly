export default async function loadMessagesSection(content, user) {
  try {
    const res = await fetch('/api/chats/friends-and-chats');
    if (!res.ok) throw new Error('Failed to load friends and chats');
    
    const { friends = [], recentChats = [] } = await res.json();

    const recentChatsHTML = recentChats.map(chatUser => {
    console.log("Chat user picture URL:", chatUser.profilePictureUrl);
    return `
        <div class="chat-item" data-userid="${chatUser._id}">
            <img src="/api/users/${chatUser._id}/profile-picture" alt="Avatar" class="avatar" />
            <div class="chat-details">
            <div class="chat-name">${chatUser.name || chatUser.uniquenick}</div>
            <div class="chat-last-message">Last message preview here...</div>
            </div>
        </div>
    `;
    }).join('');

    const friendsHTML = friends.map(friend => {
    console.log("Friend picture URL:", friend.profilePictureUrl);
    return `
        <div class="friend-item" data-userid="${friend._id}">
        <img src="/api/users/${friend._id}/profile-picture" alt="Avatar" class="avatar" />
        <div class="friend-name">${friend.name || friend.uniquenick}</div>
        </div>
    `;
    }).join('');

    content.innerHTML = `
      <h2><i class="fas fa-comment-alt"></i> Messages</h2>
      
      <div class="recent-chats">${recentChatsHTML || '<p>No recent chats</p>'}</div>
      
      <h3>Select a friend to start chat:</h3>
      <div class="friends-list">${friendsHTML || '<p>No friends found</p>'}</div>

      <div id="chat-window" style="margin-top:20px;">
      </div>
    `;

    content.querySelectorAll('.chat-item, .friend-item').forEach(el => {
      el.addEventListener('click', () => {
        const chatUserId = el.getAttribute('data-userid');
        openChatWithUser(chatUserId, content);
      });
    });

  } catch (err) {
    console.error(err);
    content.innerHTML = '<p>Error loading messages.</p>';
  }
}

async function openChatWithUser(userId, content) {
  const chatWindow = content.querySelector('#chat-window');
  chatWindow.innerHTML = `<p>Loading chat...</p>`;

  try {
    const res = await fetch(`/api/chats/messages/${userId}`);
    if (!res.ok) throw new Error('Failed to load messages');
    const messages = await res.json();

    chatWindow.innerHTML = `
      <div class="chat-messages" style="max-height:300px; overflow-y:auto; border:1px solid #ccc; padding:10px; margin-bottom:10px;">
        ${messages.map(m => `
          <div class="message ${m.userId === userId ? 'incoming' : 'outgoing'}">
            <div><strong>${m.userId === userId ? 'Them' : 'You'}</strong></div>
            <div>${m.content}</div>
            <div style="font-size:0.7em; color:#666;">${new Date(m.timestamp).toLocaleString()}</div>
          </div>
        `).join('')}
      </div>

      <form id="send-message-form">
        <input type="text" id="message-input" placeholder="Type your message..." required style="width:80%;" />
        <button type="submit">Send</button>
      </form>
    `;

    chatWindow.querySelector('#send-message-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = chatWindow.querySelector('#message-input');
    const messageContent = input.value.trim();
    if (!messageContent) return;

    const sendRes = await fetch('/api/chats/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: userId, content: messageContent })
    });

        if (sendRes.ok) {
            openChatWithUser(userId, content);
        } else {
            alert('Failed to send message');
        }
    });


  } catch (err) {
    chatWindow.innerHTML = '<p>Error loading chat.</p>';
    console.error(err);
  }
}