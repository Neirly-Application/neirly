export default async function loadSettingsInfoSection(content, user) {
              content.innerHTML = `
            <div class="case-header">
              <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
              <h2><i class="fas fa-info-circle"></i> App Informations</h2>
            </div>
              <p>Informazioni sulla versione dell'app.</p>`;
}