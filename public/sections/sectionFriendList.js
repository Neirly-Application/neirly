import { showToast, customConfirm } from '../scripts/notification.js';
import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadFriendListSection(content, user) {
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
    <h2><i class="fas fa-user-friends"></i> Friend List</h2>
    <form id="addFriendForm" class="friend-form">
      <input
        type="text"
        id="friendNick"
        placeholder="Add a friend via nickname"
        required
        class="friend-input"
      />
      <i
        class="fas fa-user-plus friend-btn"
        role="button"
        tabindex="0"
        aria-label="Send Friend Request"
        title="Send Friend Request"
      ></i>
    </form>

    <div class="friend-requests" id="open-friend-requests-view">
      <span class="friend-requests-text">You have no pending friend requests</span>
      <div class="friend-requests-icon-with-badge">
        <i class="fas fa-user-friends friend-requests-icon"></i>
        <span class="friend-requests-badge">0</span>
      </div>
    </div>

    <div id="friendRequestsModal" class="friends-modal hidden">
      <div class="friends-modal-content">
        <span class="friends-modal-close-btn" id="closeFriendModal">&times;</span>
        <div class="friends-modal-tabs">
          <button id="incomingTab" class="tab active">Incoming</button>
          <button id="outgoingTab" class="tab">Outgoing</button>
        </div>
        <div class="friends-modal-body">
          <div id="incomingRequests" class="friends-modal-requests-section active">
            <p>Loading incoming requests...</p>
          </div>
          <div id="outgoingRequests" class="friends-modal-requests-section">
            <p>Loading outgoing requests...</p>
          </div>
        </div>
      </div>
    </div>

    <h3>Friends</h3><br>
  
    <div id="friendsList">Start now by adding a friend via their nickname!</div>
  `;

  const addFriendForm = document.getElementById('addFriendForm');
  const friendNickInput = document.getElementById('friendNick');
  const friendIconBtn = document.querySelector('.friend-btn');
  const friendsList = document.getElementById('friendsList');

  friendIconBtn.addEventListener('click', () => {
    addFriendForm.requestSubmit();
  });

  friendIconBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      addFriendForm.requestSubmit();
    }
  });

  addFriendForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nick = friendNickInput.value.trim();
    if (!nick) return showToast('Enter a valid nickname.', 'error');

    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ uniquenick: nick })
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Request sent successfully.', 'success');
        friendNickInput.value = '';
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
        friendsList.innerHTML = '<p>Error while loading friends.</p>';
        return;
      }

      const { confirmedFriends = [], pendingRequests = [], sentRequests = [] } = data;
      const reqText = document.querySelector('.friend-requests-text');
      const reqBadge = document.querySelector('.friend-requests-badge');

      if (reqText && reqBadge) {
        const count = pendingRequests.length;

        reqText.textContent =
          count === 0
            ? 'You have no pending friend requests'
            : `You have ${count} pending friend request${count > 1 ? 's' : ''}`;

        reqBadge.textContent = count;
      }

      let html = '';

      if (confirmedFriends.length > 0) {
        confirmedFriends.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        html += confirmedFriends.map(friend => `
          <div class="friend-item">
            <div class="friend-info">
              <img src="${friend.profilePictureUrl || '../media/user.png'}" alt="Avatar" class="avatar" />
              <div class="friend-name">
                <strong>${friend.name || '-'}</strong><br>
                <small class="friend-nick">@${friend.uniquenick || ''}</small>
              </div>
            </div>
            <div class="friend-actions">
              <button class="message-btn" title="Message ${friend.name || 'User'}" data-id="${friend._id}" data-name="${friend.name || '-'}" id="message-friend">
                <i class="fas fa-comment-alt"></i> 
              </button>
              <button class="remove-btn" title="Remove ${friend.name || 'User'}" data-id="${friend._id}" data-name="${friend.name || '-'}" id="remove-friend">
                <i class="fas fa-user-minus"></i>
              </button>
              <button class="settings-btn" title="Friend Settings" data-id="${friend._id}" data-name="${friend.name || '-'}" id="friend-settings">
                <i class="fas fa-cog"></i>
              </button>
            </div>
          </div>
        `).join('');
      } else if (pendingRequests.length === 0) {
        html += '<p>Start now by adding a friend via their nickname!.</p>';
      }

      friendsList.innerHTML = html;

      const incomingContainer = document.getElementById('incomingRequests');
      const outgoingContainer = document.getElementById('outgoingRequests');

      incomingContainer.innerHTML = pendingRequests.length > 0
        ? pendingRequests.map(req => `
            <div class="friend-request-card">
              <div class="friend-request-card-info">
                <img src="${req.profilePictureUrl || '../media/user.png'}" alt="Avatar" class="avatar" />
                <div class="friend-request-card-name">
                  <strong>${req.name || 'User'}</strong><br>
                  <small class="friend-request-card-nick">@${req.uniquenick || 'Undefined'}</small>
                </div>
              </div>
              <div class="friend-request-card-actions">
                <button class="accept-btn" title="Accept ${req.name || 'User'}'s request" data-id="${req._id}" data-name="${req.name || 'User'}">
                  <i class="fas fa-check"></i> 
                </button>
                <button class="reject-btn" title="Reject ${req.name || 'User'}'s request" data-id="${req._id}" data-name="${req.name || 'User'}">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          `).join('')
        : '<p>No incoming requests.</p>';

      outgoingContainer.innerHTML = sentRequests.length > 0
        ? sentRequests.map(req => `
            <div class="friend-request-card">
              <div class="friend-request-card-info">
                <img src="${req.profilePictureUrl || '../media/user.png'}" alt="Avatar" class="avatar" />
                <div class="friend-request-card-name">
                  <strong>${req.name || 'User'}</strong><br>
                  <small class="friend-request-card-nick">@${req.uniquenick || 'Undefined'}</small>
                </div>
              </div>
              <div class="friend-request-card-actions">
                <button class="cancel-request-btn" title="Cancel request" data-id="${req._id}" data-name="${req.name || 'User'}">
                  <i class="fas fa-times"></i> 
                </button>
              </div>
            </div>
          `).join('')
        : '<p>No outgoing requests.</p>';

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

      document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const friendId = btn.dataset.id;
          const friendName = btn.dataset.name;
          const confirmRemoval = await customConfirm(`Are you sure you want to remove ${friendName} from your friend list?`);
          if (!confirmRemoval) return;

          try {
            const res = await fetch(`/api/friends/remove/${friendId}`, {
              method: 'DELETE',
              credentials: 'include',
            });

            const data = await res.json();

            if (res.ok) {
              showToast(data.message || 'Friend successfully removed.', 'success');
              loadFriends();
            } else {
              showToast(data.message || 'Error while removing friend.', 'error');
            }
          } catch (err) {
            console.error('Network error:', err);
            showToast('Network error while removing friend.', 'error');
          }
        });
      });

      document.querySelectorAll('.cancel-request-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const notifId = btn.dataset.id;
          const targetName = btn.dataset.name;
          const confirmed = await customConfirm(`Are you sure you want to cancel the friend request sent to ${targetName}?`);
          if (!confirmed) return;

          try {
            const res = await fetch(`/api/friends/cancel/${notifId}`, {
              method: 'DELETE',
              credentials: 'include'
            });

            const data = await res.json();

            if (res.ok) {
              showToast(data.message || 'Request cancelled.', 'success');
              loadFriends();
            } else {
              showToast(data.message || 'Error while cancelling friend request.', 'error');
            }
          } catch (err) {
            console.error('Network error:', err);
            showToast('Network error while cancelling the request.', 'error');
          }
        });
      });


    } catch (err) {
      console.error('Errore fetch amici:', err);
      friendsList.innerHTML = '<p>Error while loading friends.</p>';
    }
  }

  loadFriends();

  document.getElementById('open-friend-requests-view').addEventListener('click', () => {
    document.getElementById('friendRequestsModal').classList.remove('hidden');
  });

  document.getElementById('closeFriendModal').addEventListener('click', () => {
    document.getElementById('friendRequestsModal').classList.add('hidden');
  });

  friendRequestsModal.addEventListener('click', (event) => {
    if (event.target === friendRequestsModal) {
      friendRequestsModal.classList.add('hidden');
    }
  });

  document.getElementById('incomingTab').addEventListener('click', () => {
    document.getElementById('incomingRequests').classList.add('active');
    document.getElementById('outgoingRequests').classList.remove('active');
    document.getElementById('incomingTab').classList.add('active');
    document.getElementById('outgoingTab').classList.remove('active');
  });

  document.getElementById('outgoingTab').addEventListener('click', () => {
    document.getElementById('incomingRequests').classList.remove('active');
    document.getElementById('outgoingRequests').classList.add('active');
    document.getElementById('incomingTab').classList.remove('active');
    document.getElementById('outgoingTab').classList.add('active');
  });

}