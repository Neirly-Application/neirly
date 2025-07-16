export default async function loadNotificationsSection(content, user) {
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
                      <img src="${n.imageUrl}" alt="notifica" class="notification-img" oncontextmenu="return false;">
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

          loadAndRenderNotifications();
}