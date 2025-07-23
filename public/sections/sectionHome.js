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
        <h2><i class="fas fa-home"></i> Home Page</h2>
    </div>

    <div class="stories-container">
      <div style="text-align: center;">
        <div class="story" data-image="../media/neirly-logo.png">
          <img src="../media/neirly-logo.png" alt="User 1" />
        </div>
        <div class="story-label">Story Template</div>
      </div>
    </div>
  `;

  stopBGAnimation();

  document.querySelectorAll('.story').forEach(story => {
    story.addEventListener('click', () => {
      const imgSrc = story.getAttribute('data-image');
      showStoryOverlay(imgSrc);
    });
  });

  function showStoryOverlay(imageUrl) {
    const overlay = document.createElement('div');
    overlay.classList.add('story-overlay');
    overlay.innerHTML = `
      <span class="close-btn">&times;</span>
      <img src="${imageUrl}" alt="Story Image" />
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('.close-btn').addEventListener('click', () => {
      overlay.remove();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }
}
