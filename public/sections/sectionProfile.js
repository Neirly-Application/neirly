import { showToast } from '../scripts/notification.js';

export default async function loadProfileSection(content, user) {
  content.innerHTML = '<h2><i class="fas fa-user"></i> Profile</h2><p>Loading data…</p>';

  if (!user) {
    console.warn('DEBUG: user object missing – redirecting');
    content.innerHTML = '<p>User data not loaded. Please refresh.</p>';
    return;
  }

  const maskEmail = (email = '') => {
    const [u, d] = email.split('@');
    if (!d) return email;
    if (u.length <= 2) return u[0] + '*'.repeat(u.length - 1) + '@' + d;
    const visibleStart = u[0];
    const visibleEnd = u.slice(-1);
    const maskLength = u.length - 2;
    const mask = '*'.repeat(maskLength);
    return `${visibleStart}${mask}${visibleEnd}@${d}`;
  };

  const lastUniquenickChange = new Date(user.uniquenickChangedAt || 0);
  const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
  const canEditUniquenick = Date.now() - lastUniquenickChange.getTime() >= sevenDaysInMs;
  const nextChangeDateReadable = new Date(lastUniquenickChange.getTime() + sevenDaysInMs).toLocaleDateString();

  content.innerHTML = `
    <h2><i class="fas fa-user"></i> Profile</h2>

    <form id="profile-form" class="profile-form" enctype="multipart/form-data" autocomplete="off">
      <div class="form-group">
        <div class="profile-pic-wrapper">
          <img id="profile-pic"
              src="${user.profilePictureUrl || '../media/user.png'}"
              alt="Profile Picture"
              class="profile-img" oncontextmenu="return false;"/>
          <div class="edit-icon">
            <i class="fas fa-pen" style="color:white;"></i>
          </div>
        </div>
        <input type="file" id="profilePicInput" accept="image/*" style="display:none;">
      </div>

      <div class="form-group">
        <label>Display name:</label>
        <input type="text" id="nickname-input" value="${user.nickname || user.name || 'User'}" placeholder="${user.nickname || user.name || 'User'}">
      </div>

      <div class="form-group">
        <label>Nickname:</label>
        <input type="text" id="uniquenick-input"
              value="${user.uniquenick || ''}"
              placeholder="${user.uniquenick || ''}"
              maxlength="24"
              ${canEditUniquenick ? '' : 'disabled'}
              title="${canEditUniquenick ? '' : 'You can change your nickname every 7 days.'}">
        ${canEditUniquenick ? '' : `<small style="color: var(--color-888);">Next change: ${nextChangeDateReadable}</small>`}
      </div>
      <div class="form-group about-group" style="position:relative;">
        <label>About me:</label>
        <div style="position:relative;">
          <textarea id="aboutme-input" 
            placeholder="Who are you? What are you passionate about? Tell us about you here, in a few lines.">${user.about_me || 'Who are you? What are you passionate about? Tell us about you here, in a few lines.'}</textarea>
          <span id="about-counter">250</span>
        </div>
      </div>

      <div class="form-group"><label>Email:</label>
      <input type="email" value="${maskEmail(user.email)}" readonly style="font-family: monospace;">
      </div>
      <div class="form-group"><label>Date of birth:</label>
        <input type="date" value="${user.birthdate ? user.birthdate.split('T')[0] : ''}" readonly>
      </div>
    </form>

<div id="cropper-modal" class="profile-img-editor">
  <div class="profile-img-editor-content">
    <h3 style="margin-bottom: 10px;">Edit Image</h3>
    <div style="width: 300px; height: 300px; margin: auto; border-radius: 50%; overflow: hidden;">
      <img id="cropper-image" oncontextmenu="return false;" style="width: 100%; height: 100%; object-fit: cover;" />
    </div>
    <div style="margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 10px;">
      <i class="fas fa-search-minus"></i>
      <input type="range" id="cropper-zoom" min="0.5" max="2" step="0.01" value="1" style="width: 150px;">
      <i class="fas fa-search-plus"></i>
    </div>
    <div style="margin-top: 20px; display: flex; justify-content: center; gap: 10px;">
      <button id="crop-reset" class="btn-cancel">
        <i class="fas fa-undo-alt" style="margin-right: 5px;"></i>Reset
      </button>
      <button id="crop-cancel" class="btn-cancel">Cancel</button>
      <button id="crop-confirm" class="btn-submit">Apply</button>
    </div>
  </div>
</div>


  `;

  const profilePicInput = document.getElementById('profilePicInput');
  const profilePicImg = document.getElementById('profile-pic');
  const cropperModal = document.getElementById('cropper-modal');
  const cropperImage = document.getElementById('cropper-image');
  const cropperZoom = document.getElementById('cropper-zoom');
  const form = document.getElementById('profile-form');
  const saveBtn = document.getElementById('save-changes-btn');
  const cancelBtn = document.getElementById('cancel-changes-btn');
  const banner = document.getElementById('unsaved-notification');

  const aboutInput = document.getElementById('aboutme-input');
  const counter = document.getElementById('about-counter');
  const maxLen = user.bioLimit || 250;

  const detectChanges = () => {
    const s = fieldState();
    const diff = (
      s.nickname !== originalState.nickname ||
      s.uniquenick !== originalState.uniquenick ||
      s.about !== originalState.about ||
      !!croppedBlob
    );
    toggleBanner(diff);
    return diff;
  };

  const updateAboutCounter = () => {
    const current = aboutInput.value.length;
    const remaining = maxLen - current;

    if (remaining <= 150) {
      counter.style.visibility = 'visible';
      counter.textContent = remaining >= 0 ? `${remaining}` : `${remaining}`;
      counter.style.color = remaining >= 0 ? '#888' : 'red';
    } else {
      counter.style.visibility = 'hidden';
    }
  };

  aboutInput.addEventListener('input', () => {
    updateAboutCounter();
    detectChanges();
  });

  updateAboutCounter();

  let cropper = null;
  let croppedBlob = null;

  const toggleBanner = show => {
    banner.style.display = show ? 'flex' : 'none';
  };

  const norm = str => str.replace(/\s+/g, ' ').trim();

  const fieldState = () => ({
    nickname: norm(document.getElementById('nickname-input').value),
    uniquenick: norm(document.getElementById('uniquenick-input').value),
    about: norm(document.getElementById('aboutme-input').value)
  });

  const originalState = {
    nickname: norm(user.nickname || user.name || ''),
    uniquenick: norm(user.uniquenick || ''),
    about: norm(user.about_me || '')
  };

  form.addEventListener('input', detectChanges);

  document.querySelector('.profile-pic-wrapper').onclick = () => profilePicInput.click();

profilePicInput.onchange = () => {
  const file = profilePicInput.files[0];
  if (!file) return;

  cropperImage.onload = () => {
    const imgWidth = cropperImage.naturalWidth;
    const imgHeight = cropperImage.naturalHeight;
    const containerSize = 300;
    const minZoom = Math.max(containerSize / imgWidth, containerSize / imgHeight);

    if (cropper) cropper.destroy();
    cropper = new Cropper(cropperImage, {
      aspectRatio: 1,
      viewMode: 1,
      background: false,
      guides: false,
      zoomOnWheel: false,
      minZoom: minZoom,
      ready() {
        cropper.zoomTo(minZoom);
        cropperZoom.min = minZoom.toFixed(2);
        cropperZoom.max = '2';
        cropperZoom.step = '0.01';
        cropperZoom.value = minZoom.toFixed(2);
      }
    });
  };

  cropperImage.src = URL.createObjectURL(file);
  cropperModal.style.display = 'flex';
};


  cropperZoom.oninput = () => {
    if (cropper) {
      cropper.zoomTo(parseFloat(cropperZoom.value));
    }
  };

  document.getElementById('crop-reset').onclick = () => {
    if (cropper) {
      cropper.reset();
      cropperZoom.value = 1;
    }
  };

  document.getElementById('crop-cancel').onclick = () => {
    if (cropper) cropper.destroy();
    cropperModal.style.display = 'none';
  };

  document.getElementById('crop-confirm').onclick = () => {
    if (!cropper) return;
    cropper.getCroppedCanvas({ width: 300, height: 300 })
      .toBlob(blob => {
        croppedBlob = blob;
        profilePicImg.src = URL.createObjectURL(blob);
        cropperModal.style.display = 'none';
        cropper.destroy();
        detectChanges();
      }, 'image/jpeg');
  };

  cancelBtn.onclick = () => {
    document.getElementById('nickname-input').value = originalState.nickname;
    document.getElementById('uniquenick-input').value = originalState.uniquenick;
    document.getElementById('aboutme-input').value = originalState.about;
    croppedBlob = null;
    profilePicImg.src = user.profilePictureUrl || '../media/user.png';
    detectChanges();
  };

  saveBtn.onclick = () => {
    if (!detectChanges()) return;
    form.requestSubmit(); 
  };

  form.onsubmit = async e => {
    e.preventDefault();

    const currentLength = document.getElementById('aboutme-input').value.length;
    if (currentLength > maxLen) {
      showToast('Too many characters in the "About Me" section.', 'error');
      return;
    }

    if (!detectChanges()) return;

    const { nickname, uniquenick, about } = fieldState();
    const data = new FormData();

    if (nickname !== originalState.nickname) data.append('nickname', nickname);
    if (about !== originalState.about) data.append('about_me', about);

    if (canEditUniquenick && uniquenick !== originalState.uniquenick) {
      data.append('uniquenick', uniquenick);
    }

    if (croppedBlob) data.append('profilePicture', croppedBlob, 'profile.jpg');

    try {
      const res = await fetch('/api/profile', { method: 'PUT', credentials: 'include', body: data });
      if (!res.ok) throw new Error('Failed to save profile.');

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Unknown error');

      Object.assign(originalState, { nickname, uniquenick, about });
      croppedBlob = null;
      user.uniquenick = uniquenick;

      showToast('Profile updated successfully!', 'success');
      detectChanges();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  detectChanges();
}
