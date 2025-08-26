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

    <div class="home-posts" id="loadPosts">
      Posts are loading...
    </div>
  `;

  const createPostButton = content.querySelector('.cta-button-actions[title="Create a new post"]');
  const likedButton = content.querySelector('.cta-button-actions[title="Liked"]');
  const postsContainer = content.querySelector('#loadPosts');

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

// =====================
//    FORM ELEMENTS
// =====================
const fileInput = postForm.querySelector('#postMedia');
const fileName = postForm.querySelector('#fileName');
const submitButton = postForm.querySelector('#submitPost');

const editButton = document.createElement('button');
editButton.textContent = 'Edit Image';
editButton.style.display = 'none';
editButton.type = 'button';

submitButton.parentNode.insertBefore(editButton, submitButton);

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    fileName.textContent = fileInput.files[0].name;
    editButton.style.display = 'block';
  } else {
    fileName.textContent = 'No file chosen';
    editButton.style.display = 'none';
  }
});

editButton.addEventListener('click', () => {
  const file = fileInput.files[0];
  if (!file) return;

  openImageEditor(file, (editedBlob) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File([editedBlob], file.name, { type: file.type }));
    fileInput.files = dataTransfer.files;
    showToast('Image edited! Ready to post.', 'info');
  });
});

// =====================
//    IMAGES EDITOR
// =====================
function openImageEditor(file, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = document.createElement('img');
    img.src = e.target.result;
    img.style.maxWidth = '80vw';
    img.style.maxHeight = '80vh';
    img.style.border = '1px solid #ccc';
    img.style.marginBottom = '10px';

    const editorOverlay = document.createElement('div');
    editorOverlay.style.cssText = `
      position: fixed; top:0; left:0; width:100vw; height:100vh;
      background: rgba(0,0,0,0.85); display:flex; justify-content:center; align-items:center;
      z-index: 9999; flex-direction: column; gap: 10px;
    `;
    
    // DEFAULT CHECKS
    const rotateBtn = document.createElement('button');
    rotateBtn.textContent = 'Rotate 90°';
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';

    editorOverlay.appendChild(img);
    editorOverlay.appendChild(rotateBtn);
    editorOverlay.appendChild(saveBtn);
    editorOverlay.appendChild(cancelBtn);
    document.body.appendChild(editorOverlay);

    // ROTATION
    let rotation = 0;
    rotateBtn.onclick = () => {
      rotation += 90;
      img.style.transform = `rotate(${rotation}deg)`;
    };

    // SAVE
    saveBtn.onclick = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // If rotation is 90 or 270, swap width/height
      const angle = rotation % 360;
      if (angle === 90 || angle === 270) {
        canvas.width = img.naturalHeight;
        canvas.height = img.naturalWidth;
      } else {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }

      ctx.translate(canvas.width/2, canvas.height/2);
      ctx.rotate(rotation * Math.PI / 180);
      ctx.drawImage(img, -img.naturalWidth/2, -img.naturalHeight/2);

      canvas.toBlob((blob) => {
        callback(blob);
        document.body.removeChild(editorOverlay);
      }, file.type);
    };

    cancelBtn.onclick = () => {
      document.body.removeChild(editorOverlay);
    };
  };
  reader.readAsDataURL(file);
}

// =====================
//      POST SUBMIT
// =====================
submitButton.addEventListener('click', async (e) => {
  e.preventDefault();

  const title = postForm.querySelector('#postTitle').value.trim();
  const contentText = postForm.querySelector('#postContent').value.trim();
  const file = fileInput.files[0];

  if (!title || !contentText) return showToast('Title and content are required!', 'error');

  if (file && submitButton.textContent === 'Next') {
    openImageEditor(file, (editedBlob) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(new File([editedBlob], file.name, { type: file.type }));
      fileInput.files = dataTransfer.files;
      submitButton.textContent = 'Post';
      showToast('Image edited! Now click Post to publish.', 'info');
    });
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
      profilePictureUrl: user.profilePictureUrl
    };
    addPostToDOM(newPost);

    overlay.style.display = 'none';
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
    overlay.style.display = 'flex';
  });

  function addPostToDOM(post) {
    const newPost = document.createElement('div');
    newPost.classList.add('home-post-card');
    newPost.dataset.id = post._id;
    const author = post.author;
    const authorName = author?.name || "User";
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
      <div class="post-menu">
        <button class="post-menu-btn"><i class="fas fa-ellipsis-v"></i></button>
        <div class="post-menu-dropdown" style="display:none"></div>
      </div>
      <div class="post-author">
        <img class="post-author-pic" src="${authorPic}" alt="${authorName}" />
        <span class="post-author-name">${authorName}</span>
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

    document.addEventListener('click', () => {
      menuDropdown.style.display = 'none';
    });

    if (author._id === user.id) {
      menuDropdown.innerHTML = `<button class="delete-post">Delete post</button>`;
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
      menuDropdown.innerHTML = `<button class="report-post">Report</button>`;
      menuDropdown.querySelector('.report-post').onclick = () => {
        showToast('Post reported! (funzionalità da implementare)', 'info');
        menuDropdown.style.display = 'none';
      };
    }

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
        console.log(data);
        const icon = likeBtn.querySelector('i');
        icon.classList.toggle('fas', data.liked);
        icon.classList.toggle('far', !data.liked);
        showToast(data.liked ? 'You liked this post!' : 'Like removed.', 'info');
      } catch (err) {
        showToast(err.message, 'error');
      }
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
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });

    postsContainer.appendChild(newPost);
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

      posts.forEach(addPostToDOM);

      hasMore = posts.length === 5;
      currentPage++;
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      loading = false;
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

  loadPosts();

  window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
      loadPosts();
    }
  });

  fileInput.addEventListener('change', () => {
    fileName.textContent = fileInput.files.length > 0
      ? fileInput.files[0].name
      : 'No file chosen';
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.style.display = 'none';
  });

  likedButton.addEventListener('click', (e) => {
    e.preventDefault();
    loadLikedPosts();
  });
}