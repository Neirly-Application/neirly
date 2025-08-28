import { showToast, customConfirm } from '../scripts/notification.js';
import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadHomeSection(content, user) {
  let currentPage = 1;
  let loading = false;
  let hasMore = true;

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
    <h2><i class="fas fa-home"></i> Home Page</h2>

    <div class="friend-box-container">
      <div style="text-align: center;">
        <div class="story" data-image="../media/neirly-logo.webp">
          <img src="${user.profilePictureUrl || '../media/user.webp'}" alt="You" />
        </div>
        <div class="story-label">You</div>
      </div>
    </div>

    <div class="home-container-actions">
      <div class="container-actions">
        <a class="cta-button-actions" title="Create a new post"><i class="fas fa-pen-to-square"></i></a>
        <div class="divider"></div>
        <a id="feed" class="cta-button-actions" title="Feed"><i class="fas fa-home"></i></a>
        <a id="posted" class="cta-button-actions" title="Posted"><i class="fa-solid fa-image"></i></a>
        <a id="liked" class="cta-button-actions" title="Liked"><i class="fa-solid fa-heart"></i></a>
        <a id="saved" class="cta-button-actions" title="Saved"><i class="fa-solid fa-bookmark"></i></a>
        <a id="favorites" class="cta-button-actions" title="Favorites"><i class="fa-solid fa-star"></i></a>
      </div>
    </div>
    
    <div class="fancy-line"></div>

    <div class="home-posts" id="loadPosts">
      <p style="text-align:center;opacity:0.7;">Posts are loading...</p>
    </div>
  `;

  // =====================
  //    FORM ELEMENTS
  // =====================
  const createPostButton = content.querySelector('.cta-button-actions[title="Create a new post"]');
  const homeButton       = content.querySelector('#feed');
  const likedButton      = content.querySelector('#liked');
  const postedButton     = content.querySelector('#posted');
  const savedButton      = content.querySelector('#saved');
  const favoritesButton  = content.querySelector('#favorites');
  const postsContainer   = content.querySelector('#loadPosts');

  const overlay = document.createElement('div');
  overlay.classList.add('create-post-overlay');
  overlay.classList.add('hidden');

  const postForm = document.createElement('div');
  postForm.classList.add('create-post-form');
  postForm.innerHTML = `
    <h3>Create a new post</h3>
    <form id="createPostForm" class="createPostForm">
      <input type="text" id="postTitle" placeholder="Give me a Title 💖" />
      <textarea id="postContent" placeholder="What's on your mind?..."></textarea>
      <input type="file" id="postMedia" accept="image/*,video/*,.gif" hidden />
      <label class="upload-btn" for="postMedia">
        <i class="fas fa-upload"></i> Choose Media
      </label>
      <span id="fileName" class="file-name">No file chosen</span>
      <button id="submitPost">Post</button>
    </form>
  `;
  
  const fileInput = postForm.querySelector('#postMedia');
  const fileName = postForm.querySelector('#fileName');
  const submitButton = postForm.querySelector('#submitPost');

  fileInput.addEventListener('change', () => {
    fileName.textContent = fileInput.files[0]?.name || 'No file chosen';
  });

  overlay.appendChild(postForm);
  document.body.appendChild(overlay);

// =====================
//      POST SUBMIT
// =====================
  submitButton.addEventListener('click', async (e) => {
    e.preventDefault();

    const title = postForm.querySelector('#postTitle').value.trim();
    const contentText = postForm.querySelector('#postContent').value.trim();
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
      newPost.author = {
        _id: user.id,
        name: user.name,
        uniquenick: user.uniquenick,
        profilePictureUrl: user.profilePictureUrl
      };
      addPostToDOM(newPost, { newPost: true });

      overlay.classList.add('hidden');
      postForm.querySelectorAll('input[type="text"], textarea').forEach(el => el.value = '');
      fileInput.value = '';
      fileName.textContent = 'No file chosen';
      submitButton.textContent = 'Post';
      showToast('Post created!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  createPostButton.addEventListener('click', () => {
    overlay.classList.remove('hidden');
    postForm.querySelector('#postTitle').focus();
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      overlay.classList.add('hidden');
    }
  });

  function closeCreatePostOverlay() {
    overlay.classList.add('hidden');
  }

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      closeCreatePostOverlay();
    });
  });

  function addPostToDOM(post, { newPost: isNew = false } = {}) {
    const newPost = document.createElement('div');
    newPost.classList.add('home-post-card');
    newPost.dataset.id = post._id;
    const author = post.author;
    const authorName = author?.name || "User";
    const authorNick = author?.uniquenick || "user";
    const authorPic = author?.profilePictureUrl || "../media/user.webp";

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
            <div class="seek-bar">
              <div class="seek-bar-progress"></div>
            </div>
          </div>
        `;
      } else {
        mediaHTML = `<img src="${mediaPath}" alt="Post Media" />`;
      }
    }

    newPost.innerHTML = `
      <div class="home-post-card-content">
        <div class="post-menu">
          <button class="post-menu-btn"><i class="fas fa-ellipsis-v"></i></button>
          <div class="post-menu-dropdown" style="display:none"></div>
        </div>
        <div class="post-author">
          <a href="#${authorNick}"><img class="post-author-pic" src="${authorPic}" alt="${authorName}" />
          <span class="post-author-name">${authorName}</span></a>
        </div>
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

    const menuBtn = newPost.querySelector('.post-menu-btn');
    const menuDropdown = newPost.querySelector('.post-menu-dropdown');

    menuBtn.onclick = (e) => {
      e.stopPropagation();
      menuDropdown.style.display = menuDropdown.style.display === 'block' ? 'none' : 'block';
    };
    document.addEventListener('click', () => { menuDropdown.style.display = 'none'; });

    if (author._id === user.id) {
      menuDropdown.innerHTML = `<button class="delete-post"><i class="fas fa-trash"></i> Delete</button>`;
      menuDropdown.querySelector('.delete-post').onclick = async () => {
        if (confirm('Are you sure you want to delete this post?')) {
          try {
            const res = await fetch(`/api/posts/${post._id}`, { method: 'DELETE', credentials: 'include' });
            if (!res.ok) throw new Error('Error deleting post');
            showToast('Post deleted!', 'success');
            newPost.remove();
          } catch (err) {
            showToast(err.message, 'error');
          }
        }
      };
    } else {
      menuDropdown.innerHTML = `<button class="report-post"><i class="fas fa-flag"></i> Report</button>`;
      menuDropdown.querySelector('.report-post').onclick = () => {
        showToast('Post reported! (funzionalità da implementare)', 'info');
        menuDropdown.style.display = 'none';
      };
    }

    if (post.media?.type === 'video') {
      const video = newPost.querySelector('video');
      const progress = newPost.querySelector('.seek-bar-progress');

      function updateProgress() {
        const percent = (video.currentTime / video.duration) * 100 || 0;
        progress.style.width = percent + '%';
        requestAnimationFrame(updateProgress);
      }

      video.addEventListener('play', () => { requestAnimationFrame(updateProgress); });
      video.addEventListener('click', () => { if (video.paused) video.play(); else video.pause(); });
    }

    const likeBtn = newPost.querySelector('.like');
    likeBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(`/api/posts/${post._id}/like`, { method: 'POST', credentials: 'include' });
        if (!res.ok) throw new Error('Failed to like post');
        const data = await res.json();
        const icon = likeBtn.querySelector('i');
        icon.classList.toggle('fas', data.liked);
        icon.classList.toggle('far', !data.liked);
        showToast(data.liked ? 'You liked this post!' : 'Like removed.', 'info');
      } catch (err) { showToast(err.message, 'error'); }
    });

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
        } catch (err) { showToast(err.message, 'error'); }
      });
    });

    if (isNew) {
      postsContainer.prepend(newPost);
    } else {
      postsContainer.appendChild(newPost);
    }
  }

  async function loadPosts() {
    if (loading || !hasMore) return;
    loading = true;

    try {
      const res = await fetch(`/api/posts?page=${currentPage}&limit=5`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load posts');

      const data = await res.json();
      const posts = Array.isArray(data) ? data : data.posts || [];

      if (currentPage === 1) postsContainer.innerHTML = '';
      if (posts.length === 0 && currentPage === 1) {
        postsContainer.innerHTML = '<div style="text-align:center;opacity:0.7;">No posts from friends.</div>';
      }

      posts.forEach(addPostToDOM);

      hasMore = posts.length === 5;
      currentPage++;
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      loading = false;
    }
  }

  async function loadFeed() {
    try {
      const res = await fetch('/api/posts?page=1&limit=50', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      const posts = Array.isArray(data) ? data : data.posts || [];

      postsContainer.innerHTML = '';
      if (posts.length === 0) {
        postsContainer.innerHTML = '<div style="text-align:center;opacity:0.7;">No posts from friends.</div>';
        return;
      }

      posts.forEach(addPostToDOM);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function loadLikedPosts() {
    try {
      const res = await fetch('/api/posts?page=1&limit=50', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      const posts = Array.isArray(data) ? data : data.posts || [];

      const likedPosts = posts.filter(post => post.likedByUser);
      postsContainer.innerHTML = '';
      if (likedPosts.length === 0) {
        postsContainer.innerHTML = '<div style="text-align:center;opacity:0.7;">You didn\'t like any post yet.</div>';
        return;
      }
      likedPosts.forEach(addPostToDOM);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function loadUserPosts() {
    try {
      const res = await fetch('/api/posts/me?page=1&limit=50', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      const posts = data.posts || [];
      postsContainer.innerHTML = '';

      if (posts.length === 0) {
        postsContainer.innerHTML = '<div style="text-align:center;opacity:0.7;">You haven\'t posted anything yet.</div>';
        return;
      }

      posts.forEach(addPostToDOM);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  loadPosts();

  window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
      loadPosts();
    }
  });

  homeButton.addEventListener('click', (e) => {
    e.preventDefault();
    loadFeed();
  });

  likedButton.addEventListener('click', (e) => {
    e.preventDefault();
    loadLikedPosts();
  });

  postedButton.addEventListener('click', (e) => {
    e.preventDefault();
    loadUserPosts();
  });

}