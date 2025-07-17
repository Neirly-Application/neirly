export default async function loadMessagesSection(content, user) {
    content.innerHTML = `
    <h2><i class="fas fa-comment-alt"></i> Messages</h2>
    
    <div class="recent-chats">
        <div class="chat-item">
            <img src="https://i.pravatar.cc/48?img=1" alt="Avatar" class="avatar" />
            <div class="chat-details">
            <div class="chat-name">Luke 😎</div>
            <div class="chat-last-message">Hey! How are you doing?</div>
            </div>
            <div class="chat-unread-badge">2</div>
        </div>

        <div class="chat-item">
            <img src="https://i.pravatar.cc/48?img=2" alt="Avatar" class="avatar" />
            <div class="chat-details">
            <div class="chat-name">Lucy 🧡</div>
            <div class="chat-last-message">Perfect, see you soon!</div>
            </div>
        </div>
    </div>
    `;
}