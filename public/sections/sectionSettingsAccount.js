export default async function loadSettingsAccountSection(content, user) {
    content.innerHTML = `
        <div class="case-header">
            <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
            <h2><i class="fas fa-user-shield"></i> Account & Security</h2>
        </div>
            <button class="btn">Change Password</button>
            <button class="btn">Enable 2FA</button>
        `;
}