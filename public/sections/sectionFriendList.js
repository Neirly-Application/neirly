import { showToast } from '../scripts/notification.js';

export default async function loadFriendListSection(content, user) {
  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';

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
                <img src="/api/users/${friend._id}/profile-picture" alt="Avatar" class="avatar" />
                <strong>${friend.name || '-'}</strong>
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
}