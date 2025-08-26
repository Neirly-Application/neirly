import { showToast, customConfirm } from '../scripts/notification.js';
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

    <div class="friend-box-container">
      <div style="text-align: center;">
        <div class="story" data-image="../media/neirly-logo.webp">
          <img src="${user.profilePictureUrl || '../media/user.webp'}" alt="Your Story" />
        </div>
        <div class="story-label">Your Story</div>
      </div>
    </div>

    <div class="home-container-actions">
      <div class="container-actions">
        <a class="cta-button-actions" title="Create a new post"><i class="fas fa-pen-to-square"></i></a>
        <div class="divider"></div>
        <a class="cta-button-actions" title="Posted"><i class="fa-solid fa-image"></i></a>
        <a class="cta-button-actions" title="Liked"><i class="fa-solid fa-heart"></i></a>
        <a class="cta-button-actions" title="Saved"><i class="fa-solid fa-bookmark"></i></a>
        <a class="cta-button-actions" title="Favorites"><i class="fa-solid fa-star"></i></a>
      </div>
    </div>
    
    <div class="fancy-line"></div>

    <div class="home-posts" id="loadPosts"></div>
  `;

  const createPostButton = content.querySelector('.cta-button-actions[title="Create a new post"]');
  const postsContainer = content.querySelector('#loadPosts');

  // Overlay e form
  const overlay = document.createElement('div');
  overlay.classList.add('create-post-overlay');
  overlay.style.display = 'none';

  const postForm = document.createElement('div');
  postForm.classList.add('create-post-form');
  postForm.innerHTML = `
    <h3>Create a new post</h3>
    <form id="createPostForm" class="createPostForm">
      <input type="text" id="postTitle" placeholder="Give me a Title 💖" />
      <textarea id="postContent" placeholder="What's on your mind?..."></textarea>
      <input type="file" id="postMedia" accept="image/*,video/*,.gif" hidden />
      <label for="postMedia" class="upload-btn">
        <i class="fas fa-upload"></i> Choose Media
      </label>
      <span id="fileName" class="file-name">No file chosen</span>
      <button id="submitPost">Post</button>
    </form>
  `;

  overlay.appendChild(postForm);
  document.body.appendChild(overlay);

  createPostButton.addEventListener('click', () => {
    overlay.style.display = 'flex';
  });

  // Helper: aggiunge post al DOM
  function addPostToDOM(post) {
  console.log('post.media:', post.media);
    const newPost = document.createElement('div');
    newPost.classList.add('home-post-card');
    newPost.dataset.id = post._id;

    let mediaHTML = '';
    let mediaPath = post.media?.url;
    if (mediaPath && !mediaPath.startsWith('/uploads/') && !mediaPath.startsWith('http')) {
      mediaPath = '/uploads/' + mediaPath;
    }
    if (mediaPath) {
      if (post.media?.type === 'video') {
        const videoId = `video-${post._id}`;
        mediaHTML = `
          <div class="custom-video-wrapper">
            <video id="${videoId}" src="${mediaPath}" preload="metadata"></video>
            <div class="video-controls">
              <button class="play-pause"><i class="fas fa-play"></i></button>
              <input type="range" class="seek-bar" value="0" min="0" max="100">
              <button class="mute"><i class="fas fa-volume-mute"></i></button>
              <input type="range" class="volume-bar" min="0" max="1" step="0.01" value="1">
            </div>
          </div>
        `;
      } else {
        mediaHTML = `<img src="${mediaPath}" alt="Post Media" />`;
      }
    }

    newPost.innerHTML = `
      <div class="home-post-card-content">
        <h2>${post.title}</h2>
        <p>${post.content.replace(/\n/g, "<br>")}</p>
        ${mediaHTML}
      </div>
      <small>${new Date(post.createdAt).toLocaleString()}</small>
      <div class="post-fancy-line"></div>
      <div class="post-actions">
        <div class="post-actions-left">
          <li><a class="like" href="#" title="Like"><i class="${post.likedByUser ? 'fas' : 'far'} fa-heart"></i></a></li>
          <li><a class="comment" href="#" title="Comment"><i class="far fa-comment"></i></a></li>
          <li><a class="save" href="#" title="Favorite"><i class="far fa-star"></i></a></li>
        </div>
        <div class="post-actions-right">
          <li><a class="save" href="#" title="Save"><i class="far fa-bookmark"></i></a></li>
          <li><a class="share" href="#" title="Share"><i class="far fa-paper-plane"></i></a></li>
        </div>
      </div>
    `;

    if (post.media?.type === 'video') {
      const video = newPost.querySelector('video');
      const playPause = newPost.querySelector('.play-pause');
      const seekBar = newPost.querySelector('.seek-bar');
      const mute = newPost.querySelector('.mute');
      const volumeBar = newPost.querySelector('.volume-bar');

      playPause.onclick = () => {
        if (video.paused) {
          video.play();
          playPause.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
          video.pause();
          playPause.innerHTML = '<i class="fas fa-play"></i>';
        }
      };

      video.ontimeupdate = () => {
        seekBar.value = (video.currentTime / video.duration) * 100 || 0;
      };

      seekBar.oninput = () => {
        video.currentTime = (seekBar.value / 100) * video.duration;
      };

      mute.onclick = () => {
        video.muted = !video.muted;
        mute.innerHTML = video.muted ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
      };

      volumeBar.oninput = () => {
        video.volume = volumeBar.value;
      };
    }

    // Like
    const likeBtn = newPost.querySelector('.like');
    likeBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(`/api/posts/${post._id}/like`, {
          method: 'POST',
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to like post');
        const data = await res.json();
        const icon = likeBtn.querySelector('i');
        icon.classList.toggle('fas', data.liked);
        icon.classList.toggle('far', !data.liked);
        showToast(data.liked ? 'You liked this post!' : 'Like removed.', 'info');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    // Share
    const shareBtn = newPost.querySelector('.share');
    shareBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const temp = document.createElement('textarea');
      temp.value = `${post.title}\n${post.content}`;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
      showToast('Post content copied to clipboard!', 'success');
    });

    // Comment
    const commentBtn = newPost.querySelector('.comment');
    commentBtn.addEventListener('click', (e) => {
      e.preventDefault();
      customConfirm('Write your comment:', '', async (commentText) => {
        if (!commentText || !commentText.trim()) return;
        try {
          const res = await fetch(`/api/posts/${post._id}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ text: commentText })
          });
          if (!res.ok) throw new Error('Failed to add comment');
          showToast('Comment added!', 'success');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });

    postsContainer.prepend(newPost);
  }

  // Load posts dal backend
  async function loadPosts() {
    try {
      const res = await fetch('/api/posts', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load posts');
      const posts = await res.json();
      postsContainer.innerHTML = '';
      posts.forEach(addPostToDOM);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  loadPosts();

  // Submit post
  postForm.querySelector('#submitPost').addEventListener('click', async (e) => {
    e.preventDefault();

    const title = postForm.querySelector('#postTitle').value.trim();
    const contentText = postForm.querySelector('#postContent').value.trim();
    const fileInput = postForm.querySelector('#postMedia');
    const file = fileInput.files[0];

    if (!title || !contentText) return showToast('Title and content are required!', 'error');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', contentText);
    if (file) formData.append('media', file);

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to create post');
      const newPost = await res.json();
      addPostToDOM(newPost);
      overlay.style.display = 'none';
      postForm.querySelectorAll('input[type="text"], textarea').forEach(el => el.value = '');
      fileInput.value = '';
      document.getElementById('fileName').textContent = 'No file chosen';
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  const fileInput = postForm.querySelector('#postMedia');
  const fileName = postForm.querySelector('#fileName');

  fileInput.addEventListener('change', () => {
    fileName.textContent = fileInput.files.length > 0
      ? fileInput.files[0].name
      : 'No file chosen';
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.style.display = 'none';
  });
}