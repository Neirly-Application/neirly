import { showToast, customConfirm } from '../scripts/notification.js';
import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadHomeSection(content, user) {
  let currentPage = 1;
  let loading = false;
  let hasMore = true;
  removeSkeletons

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
    <h2><i class="fas fa-home"></i> Home Page</h2>

    <div class="friend-box-container">
      <div style="text-align: center;" data-menu="profile">
        <div class="story" data-image="../media/neirly-logo.webp" data-menu="profile">
          <img src="${user.profilePictureUrl || '../media/user.webp'}" alt="You" data-menu="profile" />
        </div>
        <div class="story-label" data-menu="profile">You</div>
      </div>
    </div>

    <div class="home-container-actions">
      <div class="container-actions">
        <a id="create-post" class="cta-button-actions" title="Create a new post"><i class="fas fa-pen-to-square"></i></a>
        <div class="divider"></div>
        <a id="feed" class="cta-button-actions" title="From Friends"><i class="fas fa-people-group"></i></a>
        <a id="posted" href="#home=posted" class="cta-button-actions" title="Your Posts"><i class="fa-solid fa-bookmark"></i></a>
        <a id="liked" href="#home=liked" class="cta-button-actions" title="Liked Posts"><i class="fa-solid fa-heart"></i></a>
        <a id="favorites" href="#home=favorites" class="cta-button-actions" title="Favorites Posts"><i class="fa-solid fa-star"></i></a>
      </div>
    </div>
    
    <div class="fancy-line"></div>

    <div class="home-posts" id="loadPosts">
    </div>
  `;

  // =====================
  //    FORM ELEMENTS
  // =====================
  const createPostButton = content.querySelector('#create-post');
  const homeButton       = content.querySelector('#feed');
  const likedButton      = content.querySelector('#liked');
  const postedButton     = content.querySelector('#posted');
  const favoriteButton   = content.querySelector('#favorites');
  const postsContainer   = content.querySelector('#loadPosts');

  function showSkeletons(count = 5) {
    postsContainer.innerHTML = '';
    const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      const titleWidth = random(50,70);
      const mediaHeight = random(0,300);
      const longDesc = `
            <p class="skeleton-bar" style="width: 90%; height: 14px; margin-top: 14px;"></p>
            <p class="skeleton-bar" style="width: 85%; height: 14px; margin-top: 8px;"></p>
            <p class="skeleton-bar" style="width: 80%; height: 14px; margin: 5px 0 14px 0;"></p>
      `;
      skeleton.className = 'home-post-card post-skeleton';
      skeleton.innerHTML = `
        <div class="home-post-card-content">
          <div class="post-menu">
            <button class="post-menu-btn skeleton-circle"></button>
          </div>
          <div class="post-author">
            <div class="post-author-pic skeleton-circle"></div>
            <div class="post-author-name skeleton-bar" style="width: 100px; height: 16px;"></div>
          </div>
          <h2 class="skeleton-bar" style="width: ${titleWidth}%; height: 20px; margin-bottom: 10px;"></h2>
            ${longDesc}
          <div class="media skeleton" style="height: ${mediaHeight}px; border-radius: 20px; margin: 10px 0;"></div>
          <small class="skeleton-bar" style="width: 40%; height: 12px;"></small>
        </div>
        <div class="post-actions">
          <div class="post-actions-left">
            <li class="skeleton-icon"></li>
            <li class="skeleton-icon"></li>
            <li class="skeleton-icon"></li>
          </div>
          <div class="post-actions-right">
            <li class="skeleton-icon"></li>
            <li class="skeleton-icon"></li>
          </div>
        </div>
      `;
      postsContainer.appendChild(skeleton);
    }
  }

  function removeSkeletons() {
    document.querySelectorAll('.post-skeleton').forEach(s => s.remove());
  }

  const overlay = document.createElement('div');
  overlay.classList.add('create-post-overlay');
  overlay.classList.add('hidden');

  const postForm = document.createElement('div');
  postForm.classList.add('create-post-form');
  postForm.innerHTML = `
    <h3>Create a new post</h3>
    <form id="createPostForm" class="createPostForm">
      <input type="text" maxlength="50" id="postTitle" placeholder="Give me a Title 💖" />
      <textarea id="postContent" maxlength="250" placeholder="What's on your mind?..."></textarea>
      <div class="char-counter">
        <span id="charCount">0</span> / 300
      </div>
      <input type="file" id="postMedia" accept="image/*,video/*,.gif" style="display: none;"/>
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
  const textarea = postForm.querySelector('#postContent');
  const charCount = postForm.querySelector('#charCount');
  const maxChars = Number(textarea.getAttribute('maxlength'));

  fileInput.addEventListener('change', () => {
    fileName.textContent = fileInput.files[0]?.name || 'No file chosen';
  });

  overlay.appendChild(postForm);
  document.body.appendChild(overlay);

  textarea.addEventListener('input', () => {
    const length = textarea.value.length;
    charCount.textContent = length;

    if (length >= maxChars) {
      charCount.style.color = 'red';
    } else if (length > maxChars * 0.9) {
      charCount.style.color = 'orange';
    } else {
      charCount.style.color = '#4e6ef2';
    }
  });

// =====================
//      POST SUBMIT
// =====================
  let canClick = true;

  submitButton.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!canClick) return;
    canClick = false;

    const title = postForm.querySelector('#postTitle').value.trim();
    const contentText = postForm.querySelector('#postContent').value.trim();
    const file = fileInput.files[0];

    if (!title || !contentText) {
      showToast('Title and content are required!', 'error');
      canClick = true;
      return;
    }

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
    } finally {
      setTimeout(() => {
        canClick = true;
      }, 3000);
    }
  });

  function openPostForm(overlay, postForm) {
    overlay.classList.remove('hidden');

    postForm.querySelector('#postTitle').value = '';
    postForm.querySelector('#postContent').value = '';
    postForm.querySelector('#postMedia').value = '';
    postForm.querySelector('#fileName').textContent = 'No file chosen';
    postForm.querySelector('#charCount').textContent = '0';
    postForm.querySelector('#charCount').style.color = '#4e6ef2';

    postForm.querySelector('#postTitle').focus();
  }

  function closePostFormOnClickOutside(overlay) {
    overlay.classList.add('hidden');
  }

  createPostButton.addEventListener('click', () => {
    openPostForm(overlay, postForm);
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closePostFormOnClickOutside(overlay);
    }
  });

  async function getFriends() {
    try {
      const res = await fetch('/api/chats/friends-and-chats', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load friends');
      const data = await res.json();
      return data.friends || [];
    } catch (err) {
      showToast(err.message, 'error');
      return [];
    }
  }
  
  const friends = await getFriends();

  function showAddFriendMessage() {
    postsContainer.innerHTML = `
      <div class="error-container">
        <img src="../media/errors/4052969.webp" alt="Not Found">
        <p>Start now by adding a friend!</p>
        <button id="add-friend-btn" class="cta-button"><i class="fas fa-user-plus"></i> Add a friend</button>
      </div>
    `;
    const btn = postsContainer.querySelector('#add-friend-btn');
    if (btn) btn.addEventListener('click', () => { window.location.hash = '#friend-list'; });
  }

  async function loadPosts() {
    if (loading || !hasMore) return;
    loading = true;

    showSkeletons(5);

    try {
      const res = await fetch(`/api/posts?page=${currentPage}&limit=10`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load posts');

      const data = await res.json();
      const posts = Array.isArray(data) ? data : data.posts || [];

      removeSkeletons();

      if (currentPage === 1) postsContainer.innerHTML = '';

      if (posts.length === 0) {
        if (!friends || friends.length === 0) {
          showAddFriendMessage();
        } else if (currentPage === 1) {
          postsContainer.innerHTML = `
           <div class="error-container">
            <img src="../media/errors/4052968.webp" alt="Not Found">
            <p>Too quiet. No posts from Friends yet.</p>
          </div>
          `;
        }
        hasMore = false;
        return;
      }

      posts.forEach(addPostToDOM);

      hasMore = posts.length === 10;
      currentPage++;
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      loading = false;
    }
  }

  const sentinel = document.createElement('div');
  sentinel.id = "scroll-sentinel";
  postsContainer.after(sentinel);

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadPosts();
    }
  }, {
    root: null,
    rootMargin: "600px",
    threshold: 0
  });

  observer.observe(sentinel);


  async function loadLikedPosts() {
    showSkeletons(5);

    try {
      const res = await fetch('/api/posts/me?page=1&limit=50', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      const posts = Array.isArray(data) ? data : data.posts || [];
    
      removeSkeletons();

      const likedPosts = posts.filter(post => post.likedByUser);
      postsContainer.innerHTML = '';
      if (!friends || friends.length === 0) {
          showAddFriendMessage();
        } else if (likedPosts.length === 0) {
        postsContainer.innerHTML = `
           <div class="error-container">
            <img src="../media/errors/6416912.webp" alt="Not Found">
            <p>You didn\'t like any post yet.</p>
          </div>
          `;
        return;
      }
      likedPosts.forEach(addPostToDOM);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function loadFavoritedPosts() {
    showSkeletons(5);

    try {
      const res = await fetch('/api/posts/me?page=1&limit=50', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      const posts = Array.isArray(data) ? data : data.posts || [];
    
      removeSkeletons();

      const favoritePosts = posts.filter(post => post.favoritedByUser);
      postsContainer.innerHTML = '';
      if (!friends || friends.length === 0) {
          showAddFriendMessage();
        } else if (favoritePosts.length === 0) {
        postsContainer.innerHTML = `
           <div class="error-container">
            <img src="../media/errors/6416913.webp" alt="Not Found">
            <p>You haven\'t added any post to favorites yet.</p>
          </div>
          `;
        return;
      }
      favoritePosts.forEach(addPostToDOM);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  async function loadUserPosts() {
    showSkeletons(5);

    try {
      const res = await fetch('/api/posts/me?page=1&limit=50', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      const posts = data.posts || [];
    
      removeSkeletons();

      postsContainer.innerHTML = '';
      if (posts.length === 0) {
        postsContainer.innerHTML = `
           <div class="error-container">
            <img src="../media/errors/6416911.webp" alt="Not Found">
            <p>You haven\'t posted anything yet.</p>
            <button id="startPosting" class="cta-button"><i class="fas fa-pen-to-square"></i> Start Posting</button>
          </div>
          `;

          const startPostingButton = postsContainer.querySelector('#startPosting');
          startPostingButton.addEventListener('click', () => openPostForm(overlay, postForm));
        return;
      }

      posts.forEach(addPostToDOM);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function addPostToDOM(post, { newPost: isNew = false } = {}) {
    const newPost = document.createElement('div');
    newPost.dataset.id = post._id;
    const author = post.author;
    const authorName = author?.name || "User";
    const authorNick = author?.uniquenick || "Undefined";
    const authorPic = author?.profilePictureUrl || "../media/user.webp";
    newPost.classList.add('home-post-card');
    newPost.setAttribute("data-menu", "post-author");
    newPost.setAttribute("data-name", authorName);
    newPost.setAttribute("data-nick", authorNick);

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

    const reactions = [ "🙂", "😍", "🤩", "🤨", "😠", "🤣", "😂", "😘", "🥱", "😯", "😢", "🙄", "😎" ];
    function emojiToCode(emoji) {
      return [...emoji]
        .map(c => c.codePointAt(0).toString(16).toUpperCase())
        .join('-');
    }

    function getRandomEmojiSrc() {
      const emoji = reactions[Math.floor(Math.random() * reactions.length)];
      return `/media/emoji/img/apple/64//${emojiToCode(emoji)}.png`;
    }
    const randomEmoji = getRandomEmojiSrc();

    function authorDataAttrs(author) {
      const name = author.name || 'User';
      const nick = author.uniquenick || 'Undefined';
      return `data-name="${name}" data-nick="${nick}"`;
    }

    newPost.innerHTML = `
      <div class="home-post-card-content" data-menu="post-author" ${authorDataAttrs(author)}>
        <div class="post-menu">
          <button class="post-menu-btn"><i class="fas fa-ellipsis-v"></i></button>
          <div class="post-menu-dropdown" style="display:none"></div>
        </div>
        <div class="post-author" data-menu="post-author" ${authorDataAttrs(author)}>
          <a href="#@${authorNick}"><img class="post-author-pic" src="${authorPic}" alt="${authorName}" data-menu="post-author" ${authorDataAttrs(author)}/>
          <span class="post-author-name" data-menu="post-author" ${authorDataAttrs(author)}>${authorName}</span></a>
        </div>
        <h2 data-menu="post-author copy-post-title" ${authorDataAttrs(author)}>${post.title}</h2>
        <div class="desc" data-menu="post-author copy-post-desc" ${authorDataAttrs(author)}><p data-menu="post-author copy-post-desc" ${authorDataAttrs(author)}>${post.content.replace(/\n/g, "<br>")}</p></div>
        ${mediaHTML}
        <small data-menu="post-author" ${authorDataAttrs(author)}>${new Date(post.createdAt).toLocaleDateString('en-EN', { day: 'numeric', month: 'long', year: 'numeric' })}</small>
      </div>
      <div class="post-actions" data-menu="post-author" ${authorDataAttrs(author)}>
        <div class="post-actions-left" data-menu="post-author" ${authorDataAttrs(author)}>
          <li><a class="like" href="#" title="Like ${authorName}'s Post"><i class="${post.likedByUser ? 'fas' : 'far'} fa-heart"></i></a></li>
          <li><a class="comment" href="#" title="Comment ${authorName}'s Post"><i class="far fa-comment"></i></a></li>
          <li><a href="#" title="React ${authorName}'s Post"><img src="${randomEmoji}" class="custom-emoji"></a></li>
        </div>
        <div class="post-actions-right" data-menu="post-author" ${authorDataAttrs(author)}>
          <li><a class="favorite" href="#" title="Add ${authorName}'s Post to Favorites"><i class="${post.favoritedByUser ? 'fas' : 'far'} fa-star"></i></a></li>
          <li><a class="share" href="#" title="Share ${authorName}'s Post"><i class="far fa-paper-plane"></i></a></li>
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
        if (await customConfirm('Are you sure you want to delete this post?')) {
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
    const favoriteBtn = newPost.querySelector('.favorite');
    const shareBtn = newPost.querySelector('.share');
    const commentBtn = newPost.querySelector('.comment');

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

    favoriteBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(`/api/posts/${post._id}/favorite`, {
          method: 'POST',
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to update favorite');
        const data = await res.json();
        const icon = favoriteBtn.querySelector('i');
        icon.classList.toggle('fas', data.favorited);
        icon.classList.toggle('far', !data.favorited);
        showToast(data.favorited ? 'Added to favorites!' : 'Removed from favorites.', 'info');
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

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

    function waitForImages(el) {
      const imgs = el.querySelectorAll("img");
      if (imgs.length === 0) return Promise.resolve();

      return Promise.all(
        Array.from(imgs).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );
    }

    if (isNew) {
      postsContainer.prepend(newPost);

      newPost.style.transition = "opacity 1s ease, height 1s ease, margin 1s ease, padding 1s ease, transform 1s ease";
      newPost.style.opacity = "1";
      newPost.style.transform = "scale(1) translateY(0)";

      waitForImages(newPost).then(() => {
        const fullHeight = newPost.scrollHeight + "px";
        newPost.style.height = fullHeight;

        setTimeout(() => {
          newPost.style.opacity = "0";
          newPost.style.height = "0px";
          newPost.style.margin = "0px";
          newPost.style.padding = "0px";
          newPost.style.transform = "scale(0.8) translateY(-20px)";

          setTimeout(() => newPost.remove(), 1000);
        }, 5000);
      });
} else {
      postsContainer.appendChild(newPost);
    }
  }

  homeButton.addEventListener('click', (e) => {
    e.preventDefault();
    currentPage = 1;
    hasMore = true;
    loadPosts();
  });

  postedButton.addEventListener('click', (e) => {
    e.preventDefault();
    loadUserPosts();
  });

  likedButton.addEventListener('click', (e) => {
    e.preventDefault();
    loadLikedPosts();
  });

  favoriteButton.addEventListener('click', (e) => {
    e.preventDefault();
    loadFavoritedPosts()
  })
}