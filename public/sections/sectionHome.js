import { stopBGAnimation } from '../scripts/premiumBg.js';

export default async function loadHomeSection(content, user) {
  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';

  content.innerHTML = `
        <div class="case-header">
            <h2>
            <i class="fas fa-home"></i> Home Page</h2>
        </div>
      `;

  stopBGAnimation();
};