export default async function loadSettingsNotificationsSection(content, user) {
  document.body.style.background = '';
  document.body.style.transition = 'background 0.3s ease-in-out';

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';

  content.innerHTML = `
    <div class="case-header">
      <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
      <h2><i class="fas fa-bell"></i> Notifications</h2>
    </div>
      <p>Gestisci le tue preferenze di notifica.</p>`;
}