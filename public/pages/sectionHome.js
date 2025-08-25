import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadHomeSection(content, user) {
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
  content.style.margin = '';

  content.innerHTML = `
    <div class="case-header">
        <h2><i class="fas fa-home"></i> Home Page</h2>
    </div>

    <div class="stories-container">
      <div style="text-align: center;">
        <div class="story" data-image="../media/neirly-logo.webp">
          <img src="${user.profilePictureUrl || '../media/user.webp'}" alt="Your Story" />
        </div>
        <div class="story-label">Your Story</div>
      </div>
    </div>
    
    <div class="fancy-line"></div>

    <div class="container-actions">
      <a class="cta-button-actions" title="Create a new post"><i class="fas fa-pen-to-square"></i></a>
      <div class="divider"></div>
      <a class="cta-button-actions" title="Posted"><i class="fa-solid fa-image"></i></a>
      <a class="cta-button-actions" title="Liked"><i class="fa-solid fa-heart"></i></a>
      <a class="cta-button-actions" title="Saved"><i class="fa-solid fa-bookmark"></i></a>
      <a class="cta-button-actions" title="Favorites"><i class="fa-solid fa-star"></i></a>
    </div>

    <div class="home-posts" id="loadPosts">
      <div class="home-post-card">
        <div class="home-post-card-content">
          <h2>Post Title. 🍕</h2>
          <p>Post Description. 🍔</p>
          <img src="../media/map-introducer.webp" alt="Post Image">
        </div>
        <small>All the hashtags and mentions here!</small>
        <div class="post-fancy-line"></div>

        <div class="post-actions">
          <div class="post-actions-left">
            <li><a class="like" id="like"><i class="far fa-heart"></i></a></li>
            <li><a class="comment" id="comment"><i class="far fa-comment"></i></a></li>
            <li><a class="save" id="favorite"><i class="far fa-star"></i></a></li>
          </div>
          <div class="post-actions-right">
            <li><a class="save" id="save"><i class="far fa-bookmark"></i></a></li>
            <li><a class="share" id="share"><i class="far fa-share-square"></i></a></li>
          </div>
        </div>
      </div>
    </div>

  `;

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
