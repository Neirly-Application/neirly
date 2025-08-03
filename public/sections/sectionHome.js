import { stopBGAnimation } from '../scripts/premiumBg.js';

export default async function loadHomeSection(content, user) {
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
    <div class="case-header">
        <h2><i class="fas fa-home"></i> Home Page</h2>
    </div>

    <div class="stories-container">
      <div style="text-align: center;">
        <div class="story" data-image="../media/neirly-logo.png">
          <img src="${user.profilePictureUrl || '../media/user.png'}" alt="Your Story" />
        </div>
        <div class="story-label">Your Story</div>
      </div>
    </div>
    
    <div class="fancy-line"></div>

    <div class="home-posts" id="loadPosts">
      <div class="home-post-card">
        <div class="home-post-card-content">
          <h2>Test.</h2>
          <p>Community posts.</p>
        </div>
        <div class="post-fancy-line"></div>
        <small>Here you can find some community posts you might like!</small>
      </div>
      <div class="home-post-card">
        <div class="home-post-card-content">
          <h2>Test.</h2>
          <p>Community posts.</p>
        </div>
        <div class="post-fancy-line"></div>
        <small>Here you can find some community posts you might like!</small>
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
      <img src="${imageUrl}" alt="Story Content" />
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
