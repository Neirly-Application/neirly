import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadHomeSection(content, user) {
  stopBubblesAnimation();
  stopBGAnimation();

  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';
  document.title = 'Home';

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';
  content.style.display = '';
  content.style.flexDirection = '';
  content.style.justifyContent = '';
  content.style.alignItems = '';
  content.style.height = '';
  content.style.overflow = '';
  content.style.padding = '';
  content.style.margin = '';

  content.innerHTML = `
    <div class="backup-section">
      <div class="case-header">
        <a onclick="history.back()" class="back-arrow-link">
          <i class="fas fa-arrow-left"></i>
        </a>
        <h2><i class="fas fa-floppy-disk"></i> Backups</h2>
      </div>

      <div id="backup" class="backup"></div>
    </div>
  `;

  
}
