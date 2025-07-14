document.addEventListener('DOMContentLoaded', async () => {
  try {
    const navItems = document.querySelectorAll('.nav-item');
    const content = document.querySelector('.content');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const adminSection = document.getElementById('admin-section');

    let allNotifications = [];
    let openNotificationId = null;
    let user = null;

    async function fetchAndSetUser() {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        if (!res.ok) {
          window.location.href = '/login.html';
          return;
        }
        user = await res.json();

        if (welcomeMessage && user.name) {
          welcomeMessage.textContent = `Welcome ${user.name}!`;
        }

        if (user && user.roles && user.roles.includes('ceo')) {
          // Mostra la sezione admin
          if (adminSection) adminSection.style.display = 'flex';
        } else {
          if (adminSection) adminSection.style.display = 'none';
        }
      } catch (err) {
        console.error('Failed to fetch user profile on load:', err);
        window.location.href = '/login.html';
      }
    }

    function checkUnreadNotifications(unreadCount) {
      const badges = document.querySelectorAll('.notification-badge');
      badges.forEach(badge => {
        if (unreadCount > 0) {
          badge.style.display = 'inline-block';
          badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
          badge.classList.add('vibrate');
        } else {
          badge.style.display = 'none';
          badge.textContent = '';
          badge.classList.remove('vibrate');
        }
      });
    }

    async function preloadNotifications() {
      try {
        const res = await fetch('/api/notifications', { credentials: 'include' });
        if (res.ok) {
          allNotifications = await res.json();
          // Puoi poi fare render o aggiornamenti se serve
        } else {
          console.error('Failed to preload notifications, status:', res.status);
        }
      } catch (err) {
        console.error('Error preloading notifications:', err);
      }
    }

    async function fetchUnreadCount() {
      try {
        const res = await fetch('/api/notifications/unread-count', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to fetch unread notifications count.');
        const data = await res.json();
        checkUnreadNotifications(data.unread || 0);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    }

    await fetchAndSetUser();
    await preloadNotifications();
    await fetchUnreadCount();

    async function caricaSezione(section) {
      switch (section) {
        case 'notifications':
          content.innerHTML = `
            <div class="case-header">
              <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
              <h2><i class="fas fa-bell"></i> Notifications</h2>
            </div>
              <div id="notificationList">Loading notifications...
              </div>
            `;

          const notificationList = document.getElementById('notificationList');
          let allNotifications = [];
          let openNotificationId = null;

          function updateNotificationBadges(unreadCount) {
            const badges = document.querySelectorAll('.notification-badge');
            badges.forEach(badge => {
              if (unreadCount > 0) {
                badge.style.display = 'inline-block';
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.classList.add('vibrate');
              } else {
                badge.style.display = 'none';
                badge.textContent = '';
                badge.classList.remove('vibrate');
              }
            });
          }

          async function fetchUnreadCount() {
            try {
              const res = await fetch('/api/notifications/unread-count', { credentials: 'include' });
              const data = await res.json();
              const unread = data.unread || 0;
              updateNotificationBadges(unread);
            } catch (err) {
              console.error('Error while fetching unread count:', err);
            }
          }

          async function markNotificationAsRead(id) {
            try {
              const res = await fetch(`/api/notifications/${id}/read`, {
                method: 'PUT',
                credentials: 'include'
              });
              if (!res.ok) throw new Error('Error while marking notification as read.');
            } catch (err) {
              console.error('Errore:', err);
            }
          }

          function renderNotifications() {
            if (!notificationList) return;

            notificationList.innerHTML = allNotifications.length
              ? allNotifications.map(n => `
                    <div class="notification-item ${n.read ? '' : 'unread'}" data-id="${n._id}">
                      <img src="${n.imageUrl}" alt="notifica" class="notification-img">
                      <div class="notification-text">
                        <strong>${n.title || 'System'}</strong>
                        <small>${n.message.length > 60 ? n.message.slice(0, 60) + '...' : n.message}</small>
                      </div>
                    </div>
                  `).join('')
              : '<p>No notifications.</p>';

            document.querySelectorAll('.notification-item').forEach(item => {
              item.addEventListener('click', async () => {
                const id = item.dataset.id;
                const notification = allNotifications.find(n => n._id === id);
                if (!notification) return;

                const existingDetail = document.querySelector('.notification-detail-view');
                let wasOpen = false;
                if (existingDetail) {
                  if (existingDetail.dataset.notificationId === id) {
                    wasOpen = true;
                  }
                  existingDetail.remove();
                }

                if (wasOpen) {
                  return;
                }

                if (!notification.read) {
                  await markNotificationAsRead(id);
                  notification.read = true;
                  item.classList.remove('unread');
                }

                const detailView = document.createElement('div');
                detailView.className = 'notification-detail-view';
                detailView.dataset.notificationId = id;
                detailView.innerHTML = `
                    <h3>${notification.title}</h3>
                    <p>${notification.message}</p>
                    <small><em>${new Date(notification.date).toLocaleString()}</em></small>
                  `;
                item.insertAdjacentElement('afterend', detailView);

                fetchUnreadCount();
              });
            });
          }

          async function loadNotifications() {
            try {
              const res = await fetch('/api/notifications', { credentials: 'include' });
              if (!res.ok) throw new Error('Error while fetching notifications.');

              allNotifications = await res.json();
              renderNotifications();
              fetchUnreadCount();
            } catch (err) {
              console.error('Error while fetching notifications:', err);
              notificationList.innerHTML = '<p>Error while fetching notifications.</p>';
            }
          }

          async function loadAndRenderNotifications() {
            await loadNotifications();
          }

          loadAndRenderNotifications(); // chiamata senza await, perché è top-level

          break;

        case 'map':
          content.innerHTML = `
            <h2><i class="fas fa-map"></i> Map</h2>
            <div class="card map-card">
              <a href="#map-screen" class="btn map-button"><i class="fas fa-location-arrow"></i> Go to Map</a>
            </div>

            <div class="fancy-line"></div>

            <div class="card profile-card">
              <img src="../media/user.png" alt="User Profile">
              <div class="profile-info">
                <h3>Username</h3>
                <p>@uniquenick</p>
                <p>"About me"</p>
                <span class="status">Online</span>
              </div>
              <div class="profile-actions">
                <button class="view-btn"><i class="fas fa-user"></i> <span>View Profile</span></button>
                <button class="request-btn"><i class="fas fa-user-plus"></i> <span>Add as Friend</span></button>
              </div>
            </div>
          `;
          break;

        case 'map-screen':
          content.innerHTML = `
            <div class="case-header">
              <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link">
                <i class="fas fa-arrow-left"></i>
              </a>
              <h2><i class="fas fa-map-marker-alt"></i> Map</h2>
            </div>

            <div id="map" class="map-container">
              <div id="map-loader" class="map-loader">Loading map...</div>
            </div>
            
            <button id="btn-center-map"><i class="fas fa-crosshairs"></i> Center Map</button>
          `;

          const loader = document.getElementById('map-loader');
          const mapContainer = document.getElementById('map');
          loader.style.display = 'flex';
          mapContainer.style.display = 'block';

          let map, userMarker, userCoords;

          async function fetchUserProfile() {
            try {
              const res = await fetch('/api/profile', { credentials: 'include' });
              if (!res.ok) throw new Error('Failed to fetch user profile');
              return await res.json();
            } catch (err) {
              console.error('[User Profile Fetch Error]', err);
              return null;
            }
          }

          function createProfileIcon(url) {
            return L.icon({
              iconUrl: url,
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -50],
              className: 'user-map-icon',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              shadowSize: [41, 41],
              shadowAnchor: [12, 41],
            });
          }

          function initializeMap(latitude, longitude, profileImgUrl, nickname) {
            loader.style.display = 'none';

            map = L.map('map', {
              center: [latitude, longitude],
              zoom: 18,
              minZoom: 9,
              maxZoom: 18,
              zoomControl: false
            });

            const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            const esriLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/' +
              'World_Imagery/MapServer/tile/{z}/{y}/{x}', {
              attribution: 'Tiles &copy; Esri'
            });

            const baseLayers = {
              "Street Map": osmLayer,
              "Satellite": esriLayer
            };
            L.control.layers(baseLayers).addTo(map);
            L.control.scale({ imperial: false }).addTo(map);
            L.control.zoom({ position: 'topright' }).addTo(map);

            const profileIcon = createProfileIcon(profileImgUrl);

            userMarker = L.marker([latitude, longitude], { icon: profileIcon })
              .addTo(map)
              .bindPopup(`
                <div style="text-align:center;">
                  <img src="${profileImgUrl}" alt="Profile" style="width: 40px; height:40px; border-radius:50%; border:2px solid #333; box-shadow: 0 0 5px rgba(0,0,0,0.3); margin-bottom:5px;">
                  <h4>${nickname}</h4>
                  <a href="#" id="wrong-pos">Wrong Position?</a>
                </div>
              `, {className: 'pos-popup'})
              .openPopup();

            userCoords = [latitude, longitude];
          }

          function updateUserLocation(position, profileImgUrl, nickname) {
            const { latitude, longitude } = position.coords;
            userCoords = [latitude, longitude];
            if (userMarker) {
              userMarker.setLatLng(userCoords);
              userMarker.setPopupContent(`
                <div style="text-align:center;">
                  <img src="${profileImgUrl}" alt="Profile" style="width: 40px; height: 40px; border-radius:50%; border:2px solid #333; box-shadow: 0 0 5px rgba(0,0,0,0.3); margin-bottom:5px;">
                  <h4>${nickname}</h4>
                  <a href="#wrong-pos">Wrong Position?</a>
                </div>
              `);
              userMarker.openPopup();
            } else {
              userMarker = L.marker(userCoords, { icon: createProfileIcon(profileImgUrl) }).addTo(map);
            }
            map.setView(userCoords, 14);
          }

          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async position => {
              const user = await fetchUserProfile();
              const profileImgUrl = user?.profilePictureUrl?.trim()
                ? user.profilePictureUrl
                : '../media/user.png';
              const nickname = user?.nickname || "You're here!";

              setTimeout(() => {
                initializeMap(position.coords.latitude, position.coords.longitude, profileImgUrl, nickname);
              }, 1000);
            }, () => {
              loader.innerHTML = "Permission denied or location unavailable.";
            });
          } else {
            loader.innerHTML = "Geolocation not supported.";
          }

          document.addEventListener('click', e => {
            if (e.target.id === 'btn-center-map') {
              if (map && userCoords) {
                map.setView(userCoords, 18);
              }
            }
          });
          break;

        case 'messages':
          content.innerHTML = '<h2><i class="fas fa-comment-alt"></i> Messages</h2><p>Qui puoi vedere i messaggi.</p>';
          break;

        case 'stories':
          content.innerHTML = '<h2>Storie</h2><p>Le tue storie qui.</p>';
          break;

        case 'profile': {
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
                    return `${u[0]}${'*'.repeat(u.length - 2)}${u.slice(-1)}@${d}`;
                  };

                  const lastUniquenickChange   = new Date(user.uniquenickChangedAt || 0);
                  const sevenDaysInMs          = 7 * 24 * 60 * 60 * 1000;
                  const canEditUniquenick      = Date.now() - lastUniquenickChange.getTime() >= sevenDaysInMs;
                  const nextChangeDateReadable = new Date(lastUniquenickChange.getTime() + sevenDaysInMs).toLocaleDateString();

                  content.innerHTML = `
                    <h2><i class="fas fa-user"></i> Profile</h2>

                    <form id="profile-form" class="profile-form" enctype="multipart/form-data" autocomplete="off">
                      <div class="form-group">
                        <div class="profile-pic-wrapper" style="position:relative;display:inline-block;">
                          <img id="profile-pic"
                              src="${user.profilePictureUrl || '../media/user.png'}"
                              alt="Profile Picture"
                              class="profile-img" />
                          <div class="edit-icon"
                              style="position:absolute;bottom:5px;right:5px;background:rgba(0,0,0,0.6);border-radius:50%;padding:5px;">
                            <i class="fas fa-pen" style="color:white;"></i>
                          </div>
                        </div>
                        <input type="file" id="profilePicInput" accept="image/*" style="display:none;">
                      </div>

                      <div class="form-group">
                        <label>Display name:</label>
                        <input type="text" id="nickname-input" value="${user.nickname || user.name || 'User'}">
                      </div>

                      <div class="form-group">
                        <label>Nickname:</label>
                        <input type="text" id="uniquenick-input"
                              value="${user.uniquenick || ''}"
                              maxlength="24"
                              ${canEditUniquenick ? '' : 'disabled'}
                              title="${canEditUniquenick ? '' : 'You can change your nickname every 7 days.'}">
                        ${canEditUniquenick ? '' : `<small style="color:#888;">Next change: ${nextChangeDateReadable}</small>`}
                      </div>
                      <div class="form-group about-group" style="position:relative;">
                        <label>About me:</label>
                        <div style="position:relative;">
                          <textarea id="aboutme-input" placeholder="What's on your mind?..." style="padding: 10px 75px 50px 10px; resize: vertical; min-height: 100px;"></textarea>
                          <span id="about-counter"
                                style="position:absolute;bottom:6px;right:12px;font-size:0.75em;color:#888;pointer-events:none;">
                            250
                          </span>
                        </div>
                      </div>

                      <div class="form-group"><label>Email:</label>
                        <input type="email" value="${maskEmail(user.email)}" readonly>
                      </div>
                      <div class="form-group"><label>Date of birth:</label>
                        <input type="date" value="${user.birthdate ? user.birthdate.split('T')[0] : ''}" readonly>
                      </div>
                    </form>

                    <div id="unsaved-notification" class="unsaved-notification" style="display:none;align-items:center;gap:10px;">
                      <span>You have unsaved changes.</span>
                      <button id="cancel-changes-btn" class="btn-cancel">Cancel</button>
                      <button id="save-changes-btn" class="btn-submit">Save</button>
                    </div>

                    <div id="cropper-modal" class="profile-img-editor" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.7);justify-content:center;align-items:center;z-index:1000;">
                      <div class="profile-img-editor-content" style="background:white;padding:20px;border-radius:10px;text-align:center;">
                        <h3>Edit Image</h3>
                        <div style="width:300px;height:300px;margin:auto;">
                          <img id="cropper-image" style="width:300px;height:300px;object-fit:cover;">
                        </div>
                        <div style="margin-top:15px;">
                          <button id="crop-confirm" class="btn-submit">Upload</button>
                          <button id="crop-cancel" class="btn-cancel">Cancel</button>
                        </div>
                      </div>
                    </div>
                  `;

                  const profilePicInput = document.getElementById('profilePicInput');
                  const profilePicImg = document.getElementById('profile-pic');
                  const cropperModal = document.getElementById('cropper-modal');
                  const cropperImage = document.getElementById('cropper-image');
                  const form = document.getElementById('profile-form');
                  const saveBtn = document.getElementById('save-changes-btn');
                  const cancelBtn = document.getElementById('cancel-changes-btn');
                  const banner = document.getElementById('unsaved-notification');

                  const aboutInput = document.getElementById('aboutme-input');
                  const counter = document.getElementById('about-counter');
                  const maxLen = user.bioLimit || 250;


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

                  const toggleBanner = show => banner.style.display = show ? 'flex' : 'none';
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

                  form.addEventListener('input', detectChanges);

                  document.querySelector('.profile-pic-wrapper').onclick = () => profilePicInput.click();

                  profilePicInput.onchange = () => {
                    const file = profilePicInput.files[0];
                    if (!file) return;
                    console.log('DEBUG: selected file', file);

                    cropperImage.src = URL.createObjectURL(file);
                    cropperModal.style.display = 'flex';

                    if (cropper) cropper.destroy();
                    cropper = new Cropper(cropperImage, {
                      aspectRatio: 1,
                      viewMode: 1,
                      background: false,
                      guides: false
                    });
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

                  saveBtn.onclick = () => form.requestSubmit();

                  form.onsubmit = async e => {
                    e.preventDefault();

                    const currentLength = document.getElementById('aboutme-input').value.length;
                    if (currentLength > maxLen) {
                      showToast('Too many characters in the About Me section.', 'error');
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

                    console.log('DEBUG: submitting fields', Array.from(data.keys()));

                    try {
                      const res = await fetch('/api/profile', { method: 'PUT', credentials: 'include', body: data });
                      const json = await res.json();

                      if (!res.ok) {
                        showToast(json.message || 'Update failed.', 'error');
                        return;
                      }

                      showToast('Profile successfully updated.', 'success');

                      Object.assign(user, {
                        nickname: nickname,
                        about_me: about,
                        profilePictureUrl: json.profilePictureUrl || user.profilePictureUrl,
                        ...(json.uniquenick && { uniquenick: json.uniquenick }),
                        ...(json.uniquenickChangedAt && { uniquenickChangedAt: json.uniquenickChangedAt })
                      });

                      profilePicImg.src = user.profilePictureUrl || '../media/user.png';

                      if (json.uniquenickChangedAt) {
                        const input = document.getElementById('uniquenick-input');
                        input.disabled = true;
                        const next = new Date(new Date(json.uniquenickChangedAt).getTime() + sevenDaysInMs).toLocaleDateString();
                        let small = input.parentElement.querySelector('small');
                        if (!small) {
                          small = document.createElement('small');
                          small.style.color = '#888';
                          input.parentElement.appendChild(small);
                        }
                        small.textContent = `Next change: ${next}`;
                      }

                      croppedBlob = null;
                      Object.assign(originalState, { nickname, uniquenick: user.uniquenick, about });
                      detectChanges();

                    } catch (err) {
                      showToast('Network error.', 'error');
                    }
                  };
                } break;


        case 'settings':
          content.innerHTML = `
          <div class="case-header">
              <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
              <h2><i class="fas fa-cog"></i> Settings</h2>
            </div>
              <div class="settings-container">
                <ul class="settings-menu">
                  <li><a href="#settings-account"><i class="fas fa-user-shield"></i> Account & Security</a></li>
                  <li><a href="#settings-devices"><i class="fas fa-laptop"></i> Devices</a></li>
                  <li><a href="#settings-privacy"><i class="fas fa-lock"></i> Privacy</a></li>
                  <li><a href="#settings-activity"><i class="fas fa-chart-line"></i> Activity</a></li>
                  <li><a href="#settings-notifications"><i class="fas fa-bell"></i> Notifications</a></li>
                  <li><a href="#settings-theme"><i class="fas fa-palette"></i> App Theme</a></li>
                  <li><a href="#settings-region"><i class="fas fa-globe"></i> Language</a></li>
                  <li><a href="#settings-info"><i class="fas fa-info-circle"></i> App Information</a></li>
                  <li><a href="#settings-danger" class="danger"><i class="fas fa-exclamation-triangle"></i> Dangerous Actions</a></li>
                </ul>
              </div>
            `;
          break;

        case 'settings-account':
          content.innerHTML = `
            <div class="case-header">
              <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
              <h2><i class="fas fa-user-shield"></i> Account & Security</h2>
            </div>
              <button class="btn">Change Password</button>
              <button class="btn">Enable 2FA</button>
            `;
          break;

      case 'settings-devices':
        content.innerHTML = `
            <div class="case-header">
              <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
              <h2><i class="fas fa-laptop"></i> Connected Devices</h2>
            </div>
              <p>Here are the devices currently connected to your account.</p>
              <div class="device-list" id="device-list">
                <p>Loading devices...</p>
              </div>
        `;

        const normalize = str => (str || '').replace(/\s+/g, '').toLowerCase();

        const formatLastActive = date => {
          if (!date) return 'Unknown';
          const d = new Date(date);
          const now = new Date();
          const diff = now - d;
        
          const mins = Math.floor(diff / 60000);
          const hrs = Math.floor(diff / 3600000);
          const days = Math.floor(diff / 86400000);
        
          if (mins < 1) return 'Just now';
          if (mins === 1) return '1 minute ago';
          if (mins < 60) return `${mins} minutes ago`;
          if (hrs === 1) return '1 hour ago';
          if (hrs < 24) return `${hrs} hours ago`;
          if (days === 1) return `Yesterday at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
          return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        };
      
        const deviceIcons = {
          desktop: '<i class="fas fa-desktop"></i>',
          mobile: '<i class="fas fa-mobile-alt"></i>',
          tablet: '<i class="fas fa-tablet-alt"></i>'
        };
      
        const currentUA = navigator.userAgent;
        const deviceList = document.getElementById('device-list');
      
        async function loadDevices() {
          try {
            const res = await fetch('/api/devices', {
              method: 'GET',
              credentials: 'include'
            });
            const devices = await res.json();
          
            if (!devices.length) {
              deviceList.innerHTML = '<p>No devices connected.</p>';
              return;
            }
          
            const html = devices.map((device, index) => {
              const isCurrent = normalize(device.name) === normalize(currentUA);
              const type = device.type || 'desktop';
              const icon = deviceIcons[type] || deviceIcons.desktop;
            
              const lastSeen = new Date(device.lastActive);
              const now = new Date();
              const minutesAgo = (now - lastSeen) / 60000;
              const isOnline = minutesAgo <= 5;
            
              const tag1 = [
                isCurrent ? '<span class="status-tag current">Current Device</span>' : '',
              ].join(' ');

              const tag2 = [
                isOnline
                  ? '<span class="status-tag online">🟢 Online</span>'
                  : '<span class="status-tag offline">🔴 Offline</span>'
              ].join(' ');
            
              return `
                <div class="device-card" data-index="${index}" data-name="${device.name}">
                  ${icon}
                  <div class="device-info">
                  <strong>${device.name} ${tag1}</strong>
                  <div class="fancy-line"></div>
                    <div class="device-info-text">
                      <p>Location: ${device.location}</p>
                      <p>Last Active: ${formatLastActive(device.lastActive)} ${tag2}</p>
                    </div>
                  </div>
                  <div class="device-actions">
                    <button class="btn-disconnect">Disconnect</button>
                  </div>
                </div>
              `;
            }).join('');
          
            deviceList.innerHTML = html;
          } catch (err) {
            console.error(err);
            deviceList.innerHTML = `<p style="color:red;">Error loading devices.</p>`;
          }
        }
      
        async function pingDevice() {
          try {
            await fetch('/api/devices/ping', {
              method: 'PATCH',
              credentials: 'include'
            });
          } catch (err) {
            console.error('[Heartbeat] Ping failed:', err.message);
          }
        }
      
        loadDevices();
        pingDevice();
        const pingInterval = setInterval(() => {
          pingDevice();
          loadDevices();
        }, 60000);
      
        document.addEventListener('click', async function (e) {
          if (e.target.classList.contains('btn-disconnect')) {
            const card = e.target.closest('.device-card');
            const index = card.dataset.index;
            const deviceName = card.dataset.name;
            const isCurrent = normalize(deviceName) === normalize(currentUA);
          
            const confirmed = await customConfirm(
              `Do you want to disconnect "${deviceName}"?` + (isCurrent ? '\nThis is your current device.' : '')
            );
            if (!confirmed) return;
          
            try {
              const res = await fetch(`/api/devices/${index}`, {
                method: 'DELETE',
                credentials: 'include'
              });
            
              if (!res.ok) throw new Error('Failed to disconnect');
            
              if (isCurrent) {
                await fetch('/api/auth/logout', {
                  method: 'POST',
                  credentials: 'include'
                });
                window.location.href = '/login.html';
              } else {
                card.remove();
                showToast('Device disconnected.', 'success');
              }
            } catch (err) {
              console.error(err);
              showToast('Error disconnecting device.', 'error');
            }
          }
        });
        break;

      case 'settings-activity':
        content.innerHTML = `
          <div class="case-header">
            <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link">
              <i class="fas fa-arrow-left"></i>
            </a>
            <h2><i class="fas fa-chart-line"></i> Activity</h2>
          </div>
          <div id="activity-logs">
                  Loading...
          </div>
        `;

        try {
          const response = await fetch('/api/activity', { credentials: 'include' });
          if (!response.ok) throw new Error('Failed to fetch activity logs');
          const logs = await response.json();

          const logsContainer = document.getElementById('activity-logs');
          if (logs.length === 0) {
            logsContainer.innerHTML = `<p>No activity logs found.</p>`;
          } else {
            const list = logs.map(log => `
              <div class="activity-entry">
                <div class="${log.type.toLowerCase()}">
                  <strong>${log.type.toUpperCase()}</strong> -  ${new Date(log.timestamp).toLocaleString()}
                  ${log.metadata?.provider ? `via <span class="${log.type.toLowerCase()}">${log.metadata.provider}</span>` : '<span style="color: red">unable to solve provider.</span>'}
                  ${log.metadata?.ip ? ` (IP: ${log.metadata.ip})` : '<span style="color: red">unable to solve IP.</span>'}
                </div>
              </div>
            `).join('');
            logsContainer.innerHTML = `
                <div class="activity-log">
                      <p>Your account activity logs.</p>
                      ${list}
                </div>`;
              }
            } catch (error) {
              const logsContainer = document.getElementById('activity-logs');
              logsContainer.innerHTML = `<p>Error loading activity: ${error.message}</p>`;
            }
          break;

        case 'settings-notifications':
          content.innerHTML = `
            <div class="case-header">
              <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
              <h2><i class="fas fa-bell"></i> Notifications</h2>
            </div>
              <p>Gestisci le tue preferenze di notifica.</p>`;
          break;

        case 'settings-theme':
          content.innerHTML = `
            <div class="case-header">
              <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
              <h2><i class="fas fa-palette"></i> App Theme</h2>
            </div>
              <p>Scegli il tema della tua app.</p>`;
          break;

        case 'settings-region':
          content.innerHTML = `
            <div class="case-header">
              <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
              <h2><i class="fas fa-globe"></i> Language</h2>
            </div>
              <p>Imposta la lingua e la regione.</p>`;
          break;

         case 'settings-privacy':
            content.innerHTML = `
            <div class="case-header">
              <a href="#settings" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
              <h2><i class="fas fa-lock"></i> Privacy</h2>
            </div>
              <form id="privacy-form" class="privacy-form">
                <div class="form-group">
                  <label for="profile-visibility">Who can view your profile?</label>
                  <select id="profile-visibility">
                    <option value="friends">Only Friends</option>
                    <option value="everyone">Everyone</option>
                    <option value="private">No one (private)</option>
                  </select>
                </div>
              </form>

              <div id="privacy-unsaved-notification" class="unsaved-notification" style="display:none;">
                <span>You have unsaved changes.</span>
                <button id="privacy-save-changes-btn" class="btn-submit">Save</button>
              </div>
            `;

            const privacySelect = document.getElementById('profile-visibility');
            const privacyUnsavedNotification = document.getElementById('privacy-unsaved-notification');
            const privacySaveBtn = document.getElementById('privacy-save-changes-btn');

            let originalPrivacy = user?.privacy || 'friends'; // default fallback
            privacySelect.value = originalPrivacy;

            function togglePrivacyUnsaved(show) {
              privacyUnsavedNotification.style.display = show ? 'flex' : 'none';
            }
          
            privacySelect.addEventListener('change', () => {
              togglePrivacyUnsaved(privacySelect.value !== originalPrivacy);
            });
          
            privacySaveBtn.addEventListener('click', async () => {
              const selected = privacySelect.value;
              try {
                const res = await fetch('/api/privacy', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({ visibility: selected })
                });
              
                const data = await res.json();
                if (res.ok) {
                  showToast('Privacy settings updated.', 'success');
                  originalPrivacy = selected;
                  togglePrivacyUnsaved(false);
                  user.privacy = selected;
                } else {
                  showToast(data.message || 'Error saving privacy settings.', 'error');
                }
              } catch (err) {
                console.error('Error saving privacy settings:', err);
                showToast('Network error while saving settings.', 'error');
              }
            });
            break;

        case 'settings-info':
          content.innerHTML = `
            <div class="case-header">
              <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
              <h2><i class="fas fa-info-circle"></i> App Informations</h2>
            </div>
              <p>Informazioni sulla versione dell'app.</p>`;
          break;

        case 'settings-danger':
          content.innerHTML = `
            <div class="case-header">
              <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
              <h2><i class="fas fa-exclamation-triangle"></i> Dangerous Actions</h2>
            </div>
              <button id="delete-account-btn" class="btn-delete-account"><i class="fas fa-trash"></i> Delete Account</button>
          `;

          const deleteBtn = document.getElementById('delete-account-btn');
          deleteBtn?.addEventListener('click', async () => {
            if (await customConfirm('Are you sure you want to delete your account? This action cannot be undone.')) {
              try {
                const res = await fetch('/api/auth/delete-account', {
                  method: 'DELETE',
                  credentials: 'include'
                });
                if (res.ok) {
                  showToast('Account successfully deleted. Redirecting to login page...', 'success');
                  window.location.href = '/register.html';
                } else {
                  const data = await res.json();
                  showToast('Error: ' + (data.message || "Can't delete account."), 'error');
                }
              } catch (err) {
                showToast('Error while deleting account.', 'error');
              }
            }
          });
          break;

        case 'ceo':
          content.innerHTML = `
                <h2><i class="fas fa-user-shield"></i> CEO</h2>
                <input type="text" id="searchEmail" class="input-search-email" placeholder="Cerca per email..." />
                <div id="userList">Loading users...</div>
              `;

          if (user.roles && user.roles.includes('ceo')) {
            document.querySelectorAll('#admin-section').forEach(el => {
              el.style.display = 'flex';
            });
          } else {
            showToast("Access denied. You are not a CEO.", "error");
            window.location.hash = '#map';
          }

          const searchInput = document.getElementById('searchEmail');
          const userListDiv = document.getElementById('userList');
          let allUsers = [];

          const rolesHierarchy = ['user', 'supporter', 'moderator', 'ceo'];

          async function fetchUsers() {
            const res = await fetch('/api/auth/users', { credentials: 'include' });
            if (res.ok) {
              const data = await res.json();
              allUsers = data;
              renderUsers(allUsers);
            } else {
              console.error('Error while fetching users:', res.status);
              userListDiv.innerHTML = '<p>Error while fetching users.</p>';
            }
          }

          function renderUsers(users) {
            userListDiv.innerHTML = users.map(user => {
              const userRoles = user.roles || [];
              const highestRoleIndex = Math.max(...userRoles.map(r => rolesHierarchy.indexOf(r)));

              const currentRole = rolesHierarchy[highestRoleIndex] || 'user';

              const lowerRole = rolesHierarchy[highestRoleIndex - 1] || null;
              const higherRole = rolesHierarchy[highestRoleIndex + 1] || null;

              return `
                  <div class="user-card" data-user-id="${user._id}">
                    <strong class="user-name">${user.name || ''}</strong><br>
                    <span>Email: ${user.email}</span><br>
                    <span>Roles: ${userRoles.join(', ')}</span><br>
                    <span>Date of birth: ${user.birthdate ? new Date(user.birthdate).toLocaleDateString() : '-'}</span><br>
                    ${lowerRole ? `<button class="btn change-role add-role" data-role="${lowerRole}" data-action="add">+${capitalize(lowerRole)}</button>` : ''}
                    ${higherRole ? `<button class="btn change-role remove-role" data-role="${currentRole}" data-action="remove">−${capitalize(currentRole)}</button>` : ''}
                    <button class="btn force-logout">🔒 Slog</button>
                    <button class="btn ban-user">🚫 Ban</button>
                    <button class="btn delete-user">❌ Delete</button>
                  </div>
                `;

            }).join('') || '<p>Nessun utente trovato.</p>';
          }

          function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
          }

          userListDiv.addEventListener('click', async (e) => {
            const card = e.target.closest('.user-card');
            const userId = card?.dataset?.userId;
            if (!userId) return;

            if (e.target.classList.contains('change-role')) {
              const role = e.target.dataset.role;
              const action = e.target.dataset.action;

              const res = await fetch('/api/auth/user-role', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId, role, action })
              });
              const data = await res.json();
              showToast(data.message, 'info');
              fetchUsers();
            }

            if (e.target.classList.contains('force-logout')) {
              const res = await fetch('/api/auth/force-logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId })
              });
              const data = await res.json();
              showToast(data.message, 'info');
            }

            if (e.target.classList.contains('ban-user')) {
              if (!await customConfirm('Are you sure you want to ban this user?')) return;

              const res = await fetch('/api/auth/ban-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ userId })
              });
              const data = await res.json();
              showToast(data.message, 'info');
              fetchUsers();
            }

            if (e.target.classList.contains('delete-user')) {
              if (!await customConfirm('Are you sure you want to delete this user?')) return;

              const res = await fetch(`/api/profile/delete/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
              });
              const data = await res.json();
              showToast(data.message, 'info');
              fetchUsers();
            }
          });

          searchInput.addEventListener('input', () => {
            const val = searchInput.value.toLowerCase();
            renderUsers(allUsers.filter(u => u.email.toLowerCase().includes(val)));
          });

          fetchUsers();
          break;

        case 'friend-list':
          content.innerHTML = `
                <h2><i class="fas fa-user-friends"></i> Friend List</h2>
                <form id="addFriendForm" class="friend-form">
                  <input type="email" id="friendEmail" placeholder="Email dell'amico" required class="friend-input" />
                  <button type="submit" class="friend-btn">Send Request</button>
                </form>
                <div id="friendsList">Loading friends...</div>
              `;

          const addFriendForm = document.getElementById('addFriendForm');
          const friendEmailInput = document.getElementById('friendEmail');
          const friendsList = document.getElementById('friendsList');

          addFriendForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = friendEmailInput.value.trim();
            if (!email) return showToast('Enter a valid email address.', 'info');

            try {
              const res = await fetch('/api/friends/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email })
              });

              const data = await res.json();

              if (res.ok) {
                showToast('Request sent successfully.', 'success');
                friendEmailInput.value = '';
                loadFriends();
              } else {
                showToast(data.message || 'Error while sending friend request.', 'error');
              }
            } catch (err) {
              console.error('Errore rete:', err);
              showToast('Network error while sending friend request.', 'error');
            }
          });

          async function respondToRequest(notificationId, accept) {
            try {
              const res = await fetch('/api/friends/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  notificationId,
                  action: accept ? 'accept' : 'reject'
                })
              });

              const data = await res.json();

              if (res.ok) {
                showToast(data.message || 'Friend request sent.', 'success');
                loadFriends();
              } else {
                showToast(data.message || 'Error while sending friend request.', 'error');
              }
            } catch (err) {
              console.error('Error:', err, 'error');
              showToast('Network error.', 'error');
            }
          }

          async function loadFriends() {
            try {
              const res = await fetch('/api/friends', { credentials: 'include' });
              const data = await res.json();

              if (!res.ok) {
                friendsList.innerHTML = '<p>Errore durante il caricamento amici.</p>';
                return;
              }

              const { confirmedFriends = [], pendingRequests = [] } = data;

              let html = '';

              if (pendingRequests.length > 0) {
                html += '<h3>Richieste in arrivo</h3>';
                html += pendingRequests.map(req => `
                      <div class="friend-request-card">
                        <strong>${req.name || '-'}</strong><br>
                        <small>${req.email}</small><br>
                        <button class="accept-btn" data-id="${req._id}">Accetta</button>
                        <button class="reject-btn" data-id="${req._id}">Rifiuta</button>
                      </div>
                    `).join('');
              }

              if (confirmedFriends.length > 0) {
                confirmedFriends.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                html += '<h3>Friends</h3>';
                html += confirmedFriends.map(friend => `
                      <div class="friend-item">
                        <strong>${friend.name || '-'}</strong><br>
                        <small>${friend.email}</small>
                      </div>
                    `).join('');
              } else if (pendingRequests.length === 0) {
                html += '<p>Nessun amico ancora.</p>';
              }

              friendsList.innerHTML = html;

              document.querySelectorAll('.accept-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                  const id = btn.dataset.id;
                  await respondToRequest(id, true);
                });
              });

              document.querySelectorAll('.reject-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                  const id = btn.dataset.id;
                  await respondToRequest(id, false);
                });
              });

            } catch (err) {
              console.error('Errore fetch amici:', err);
              friendsList.innerHTML = '<p>Errore durante il caricamento amici.</p>';
            }
          }

          loadFriends();
          break;


        default:
          content.innerHTML = '<h2>Welcome</h2><p>Select an option from the menu.</p>';
      }
    }

  document.querySelectorAll('.logout-btn').forEach(logoutBtn => {
    logoutBtn.addEventListener('click', async e => {
      e.preventDefault();
      try {
        const res = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });

        if (res.ok) {
          window.location.href = '/login.html';
        } else {
          showToast('Logout failed.', 'error');
        }
      } catch (err) {
        showToast('Network error while logging out.', 'error');
      }
    });
  });
    await fetchAndSetUser();

    const initialSection = window.location.hash.substring(1) || 'map';
    caricaSezione(initialSection);

    window.addEventListener('hashchange', () => {
      const section = window.location.hash.substring(1) || 'map';
      caricaSezione(section);
    });

  } catch (err) {
    console.error(err);
    window.location.href = '/login.html';
  }
});