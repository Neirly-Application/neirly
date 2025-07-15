export default async function loadSettingsChatsSection(content, user) {
        content.innerHTML = `
            <div class="case-header">
              <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
              <h2><i class="fas fa-comment-alt"></i> Chats</h2>
            </div>
              <p>Your chat settings.</p>`;
}