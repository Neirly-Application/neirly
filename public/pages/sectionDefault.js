import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadDefaultSection(content, user) {
  stopBubblesAnimation();
  stopBGAnimation();

  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';
  content.style.display = '';
  content.style.flexDirection = '';
  content.style.justifyContent = '';
  content.style.alignItems = '';
  content.style.height = '';
  content.style.overflow = '';
  content.style.padding = '';
  content.style.margin  = '';
  content.dataset.menu = '';

  content.innerHTML = `
    <div class="load-screen" id="loadingScreen">
        <div class="load-spinner"></div>
    </div>`;
  
};