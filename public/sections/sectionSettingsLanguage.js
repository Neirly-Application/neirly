import { stopBGAnimation } from '../scripts/premiumBg.js';

export default async function loadSettingsLanguageSection(content, user) {
  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';

  content.innerHTML = `
    <div class="case-header">
      <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
      <h2><i class="fas fa-globe"></i> Language</h2>
    </div>
      <p>Imposta la lingua e la regione.</p>`;
};

stopBGAnimation();