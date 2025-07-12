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
          welcomeMessage.textContent = `Welcome, ${user.name}!`;
        }

        if (user && user.roles && user.roles.includes('ceo')) {
          document.querySelectorAll('#admin-section').forEach(el => {
            el.style.display = 'flex';
          });
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
        }
      } catch (err) {
        console.error('Error preloading notifications:', err);
      }
    }

    async function caricaSezione(section) {
      switch (section) {
        case 'notifications':
          content.innerHTML = `
              <h2><i class="fas fa-bell"></i> Notifications</h2>
              <div id="notificationList">Loading notifications...</div>
              <div id="notificationDetail" class="notification-detail hidden"></div>
            `;

          const notificationList = document.getElementById('notificationList');
          const notificationDetail = document.getElementById('notificationDetail');
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

                if (openNotificationId === id) {
                  notificationDetail.style.display = 'none';
                  notificationDetail.classList.add('hidden');
                  notificationDetail.innerHTML = '';
                  openNotificationId = null;
                  return;
                }

                if (!notification.read) {
                  await markNotificationAsRead(id);
                  notification.read = true;
                }

                openNotificationId = id;
                notificationDetail.classList.remove('hidden');
                notificationDetail.style.display = 'block';
                notificationDetail.innerHTML = `
                    <h3>${notification.title}</h3>
                    <p>${notification.message}</p>
                    <small><em>${new Date(notification.date).toLocaleString()}</em></small>
                  `;

                renderNotifications();
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

          await loadNotifications();
          break;

        case 'map':
          content.innerHTML = '<h2><i class="fas fa-map"></i> Map</h2><p>Contenuto della mappa...</p>';
          break;

        case 'messages':
          content.innerHTML = '<h2><i class="fas fa-comment-alt"></i> Messages</h2><p>Qui puoi vedere i messaggi.</p>';
          break;

        case 'stories':
          content.innerHTML = '<h2>Storie</h2><p>Le tue storie qui.</p>';
          break;

        case 'profile':
          content.innerHTML = '<h2><i class="fas fa-user"></i> Account & Profile</h2><p>Loading datas...</p>';

          function maskEmail(email) {
            if (!email) return '';
            const [userPart, domain] = email.split('@');
            if (!domain) return email;

            if (userPart.length <= 2) {
              return userPart[0] + '*'.repeat(userPart.length - 1) + '@' + domain;
            }
            const firstChar = userPart[0];
            const lastChar = userPart[userPart.length - 1];
            const maskedMiddle = '*'.repeat(userPart.length - 2);
            return `${firstChar}${maskedMiddle}${lastChar}@${domain}`;
          }

          if (!user) {
            content.innerHTML = `<p>User data not loaded. Please refresh.</p>`;
            return;
          }
          
          console.log("ABOUT ME:", user.about_me);
          const maskedEmail = maskEmail(user.email || '');
          content.innerHTML = `
              <h2><i class="fas fa-user"></i> Account & Profile</h2>
                <form id="profile-form" class="profile-form" enctype="multipart/form-data">
                  <div class="form-group">
                    <div class="profile-pic-wrapper" style="position: relative; display: inline-block;">
                      <img id="profile-pic" src="${user.profilePictureUrl || '/media/user.png'}" alt="Profile Picture" class="profile-img" />
                      <div class="edit-icon" style="position: absolute; bottom: 5px; right: 5px; background: rgba(0,0,0,0.6); border-radius: 50%; padding: 5px;">
                        <i class="fas fa-pen" style="color: white;"></i>
                      </div>
                    </div>
                    <input type="file" id="profilePicInput" accept="image/*" style="display:none;" />
                  </div>

                  <div class="form-group">
                    <label>Nickname:</label>
                    <input type="text" id="nickname-input" value="${user.nickname || user.name || "👋 Hello there! I'm a Neirly user!"}" />
                  </div>

                  <div class="form-group">
                    <label>About me:</label>
                    <textarea maxlength="190" id="aboutme-input" placeholder="What's on your mind?...">${user.about_me || ''}</textarea>
                  </div>

                  <div class="form-group">
                    <label>Email:</label>
                    <input type="email" value="${maskedEmail}" readonly />
                  </div>

                  <div class="form-group">
                    <label>Date of birth:</label>
                    <input type="date" value="${user.birthdate ? user.birthdate.split('T')[0] : ''}" readonly />
                  </div>
                </form>

                <div id="unsaved-notification" class="unsaved-notification" style="display:none;">
                  <span id="unsaved-text">You have unsaved changes.</span>
                  <button id="save-changes-btn" class="btn-submit">Save</button>
                </div>

                <div id="profile-msg"></div>

                <div id="cropper-modal" class="profile-img-editor" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); justify-content:center; align-items:center; z-index:1000;">
                  <div class="profile-img-editor-content" style="background:white; padding:20px; border-radius:10px; text-align:center;">
                    <h3>Edit Image</h3>
                    <div style="width: 300px; height: 300px; margin: auto;">
                      <img id="cropper-image" style="width:300px; height:300px; object-fit:cover;" />
                    </div>
                    <input type="range" id="zoom-slider" min="0.5" max="3" step="0.01" value="1" style="width: 300px; margin-top: 15px;" />
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
            const zoomSlider = document.getElementById('zoom-slider');
            const form = document.getElementById('profile-form');

            const unsavedNotification = document.getElementById('unsaved-notification');
            const saveChangesBtn = document.getElementById('save-changes-btn');

            let cropper = null;
            let croppedBlob = null;
            let formChanged = false;

            const saveChangesBtnOriginal = form.querySelector('.btn-submit');
            if (saveChangesBtnOriginal) saveChangesBtnOriginal.style.display = 'none';

            function toggleUnsavedNotification(show) {
              unsavedNotification.style.display = show ? 'flex' : 'none';
            }

            function normalizeText(text) {
              return text.replace(/\s+/g, ' ').trim();
            }

            function checkFormChanges() {
              const currentNickname = document.getElementById('nickname-input').value.trim();
              const currentAboutMe = normalizeText(document.getElementById('aboutme-input').value);

              const originalNickname = (user.nickname || user.name || '').trim();
              const originalAboutMe = normalizeText(user.about_me || '');

              const nicknameChanged = currentNickname !== originalNickname;
              const aboutMeChanged = currentAboutMe !== originalAboutMe;

              const imageChanged = !!croppedBlob;

              const hasChanges = nicknameChanged || aboutMeChanged || imageChanged;
              formChanged = hasChanges;
              toggleUnsavedNotification(hasChanges);
            }

            document.querySelector('.profile-pic-wrapper').addEventListener('click', () => {
              profilePicInput.click();
            });

            profilePicInput.addEventListener('change', () => {
              const file = profilePicInput.files[0];
              if (!file) return;

              const url = URL.createObjectURL(file);
              cropperImage.src = url;
              cropperModal.style.display = 'flex';

              if (cropper) cropper.destroy();
              cropper = new Cropper(cropperImage, {
                aspectRatio: 1,
                viewMode: 1,
                background: false,
                guides: false,
                dragMode: 'move',
                cropBoxMovable: false,
                cropBoxResizable: false,
                ready() {
                  zoomSlider.value = 1;
                  cropper.zoomTo(1);
                }
              });

              zoomSlider.addEventListener('input', () => {
                const zoom = parseFloat(zoomSlider.value);
                cropper.zoomTo(zoom);
              });
            });

            profilePicInput.addEventListener('input', () => {
              checkFormChanges();
            });

            document.getElementById('crop-cancel').addEventListener('click', () => {
              if (cropper) cropper.destroy();
              cropperModal.style.display = 'none';
            });

            document.getElementById('crop-confirm').addEventListener('click', () => {
              if (!cropper) return;
              cropper.getCroppedCanvas({ width: 300, height: 300 }).toBlob(blob => {
                croppedBlob = blob;
                profilePicImg.src = URL.createObjectURL(blob);
                cropperModal.style.display = 'none';
                cropper.destroy();

                checkFormChanges();
              }, 'image/jpeg');
            });

            form.querySelectorAll('input[type="text"]').forEach(input => {
              input.addEventListener('input', () => {
                checkFormChanges();
              });
            });

            document.getElementById('aboutme-input').addEventListener('input', () => {
              checkFormChanges();
            });

            saveChangesBtn.addEventListener('click', () => {
              form.requestSubmit();
            });

            form.addEventListener('submit', async (e) => {
              e.preventDefault();

              let newNickname = document.getElementById('nickname-input').value.trim();
              let newAboutMe = document.getElementById('aboutme-input').value.trim();

              if (!newNickname) newNickname = user.nickname || user.name || '';

              const formData = new FormData();
              if (newNickname !== (user.nickname || user.name || '')) {
                formData.append('nickname', newNickname);
              }
              if (newAboutMe !== (user.about_me || '')) {
                formData.append('about_me', newAboutMe);
              }
              if (croppedBlob) {
                formData.append('profilePicture', croppedBlob, 'profile.jpg');
              }

              if (!formData.has('nickname') && !formData.has('about_me') && !formData.has('profilePicture')) {
                return;
              }

              try {
                const updateRes = await fetch('/api/profile', {
                  method: 'PUT',
                  credentials: 'include',
                  body: formData
                });

                const updateData = await updateRes.json();
                if (updateRes.ok) {
                  showToast('Profile successfully updated.', 'success');

                  formChanged = false;
                  toggleUnsavedNotification(false);
                  croppedBlob = null;

                  user.nickname = newNickname;
                  user.about_me = newAboutMe;

                } else {
                  showToast('Error: ' + (updateData.message || "Can't update profile."), 'error');
                }
              } catch (err) {
                showToast('Network error while saving changes.', 'error');
              }
            });

          break;

        case 'settings':
          content.innerHTML = `
              <h2><i class="fas fa-cog"></i> Settings</h2>
              <div class="settings-container">
                <ul class="settings-menu">
                  <li><a href="#settings-account"><i class="fas fa-user-shield"></i> Account & Security</a></li>
                  <li><a href="#settings-privacy"><i class="fas fa-lock"></i> Privacy</a></li>
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
              <a href="#settings" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
              <h2>👤 Account & Sicurezza</h2>
              <button class="btn">Change Password</button>
              <button class="btn">Enable 2FA</button>
              <button class="btn">Login Activity</button>
            `;
          break;

        case 'settings-notifications':
          content.innerHTML = `
          <a href="#settings" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
          <h2><i class="fas fa-bell"></i> Notifications</h2><p>Gestisci le tue preferenze di notifica.</p>`;
          break;

        case 'settings-theme':
          content.innerHTML = `
          <a href="#settings" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
          <h2><i class="fas fa-palette"></i> App Theme</h2><p>Scegli il tema della tua app.</p>`;
          break;

        case 'settings-region':
          content.innerHTML = `
          <a href="#settings" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
          <h2><i class="fas fa-globe"></i> Language</h2><p>Imposta la lingua e la regione.</p>`;
          break;

        case 'settings-privacy':
          content.innerHTML = `
          <a href="#settings" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
          <h2><i class="fas fa-lock"></i> Privacy</h2><p>Controlla le tue impostazioni sulla privacy.</p>`;
          break;

        case 'settings-info':
          content.innerHTML = `
          <a href="#settings" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
          <h2><i class="fas fa-info-circle"></i> App Informations</h2><p>Informazioni sulla versione dell'app.</p>`;
          break;

        case 'settings-danger':
          content.innerHTML = `
          <a href="#settings" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
            <h2><i class="fas fa-exclamation-triangle"></i> Dangerous Actions</h2>
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

