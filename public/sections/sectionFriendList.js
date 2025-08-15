import { showToast, customConfirm } from '../scripts/notification.js';
import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadFriendListSection(content, user) {
  stopBubblesAnimation();
  stopBGAnimation();

  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';

  Object.assign(content.style, {
    background: '',
    transition: 'background 0.3s ease-in-out',
    display: '',
    flexDirection: '',
    justifyContent: '',
    alignItems: '',
    height: '',
    overflow: '',
    padding: '',
    margin: ''
  });

  content.innerHTML = `
    <h2><i class="fas fa-user-friends"></i> Friend List</h2>
    <form id="addFriendForm" class="friend-form" autocomplete="off">
      <input
        type="text"
        id="friendNick"
        placeholder="Add a friend via nickname"
        required
        class="friend-input"
        autoocomplete="off"
      />
      <i
        class="fas fa-user-plus friend-btn"
        role="button"
        tabindex="0"
        aria-label="Send Friend Request"
        title="Send Friend Request"
      ></i>
    </form>

    <div class="friend-requests" id="open-friend-requests-view" role="button" tabindex="0" aria-label="Open friend requests modal">
      <span class="friend-requests-text">You have no pending friend requests.</span>
      <div class="friend-requests-icon-with-badge">
        <i class="fas fa-user-friends friend-requests-icon"></i>
        <span class="friend-requests-badge" style="display:none;">0</span>
      </div>
    </div>

    <div id="friendRequestsModal" class="friends-modal hidden" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="friends-modal-content">
        <span class="friends-modal-close-btn" id="closeFriendModal" role="button" tabindex="0" aria-label="Close friend requests modal">&times;</span>
        <div class="friends-modal-tabs">
          <button id="incomingTab" class="tab active" type="button">Incoming</button>
          <button id="outgoingTab" class="tab" type="button">Outgoing</button>
        </div>
        <div class="friends-modal-body">
          <div id="incomingRequests" class="friends-modal-requests-section active" tabindex="0">
            <p>Loading incoming requests...</p>
          </div>
          <div id="outgoingRequests" class="friends-modal-requests-section" tabindex="0">
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
  const friendRequestsModal = document.getElementById('friendRequestsModal');
  const openFriendRequestsView = document.getElementById('open-friend-requests-view');
  const closeFriendModalBtn = document.getElementById('closeFriendModal');
  const incomingTab = document.getElementById('incomingTab');
  const outgoingTab = document.getElementById('outgoingTab');
  const incomingRequests = document.getElementById('incomingRequests');
  const outgoingRequests = document.getElementById('outgoingRequests');

  // Helper function to update badge and text
  function updateFriendNotificationBadge(count) {
    const reqBadge = document.querySelector('.friend-requests-badge');
    const reqText = document.querySelector('.friend-requests-text');
    if (!reqBadge || !reqText) return;

    if (count > 0) {
      reqBadge.style.display = 'inline-block';
      reqBadge.textContent = count;
      reqBadge.classList.add('vibrate');
      reqText.innerHTML = `You have <b>${count}</b> pending friend request${count > 1 ? 's' : ''}.`;
    } else {
      reqBadge.style.display = 'none';
      reqBadge.textContent = '';
      reqBadge.classList.remove('vibrate');
      reqText.textContent = 'You have no pending friend requests.';
    }
  }

  async function fetchAndUpdateFriendNotifications() {
    try {
      const res = await fetch('/api/friends', { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      const pendingCount = (data.pendingRequests || []).length;
      updateFriendNotificationBadge(pendingCount);
    } catch (err) {
      console.error('Error fetching friend notifications:', err);
    }
  }

  friendIconBtn.addEventListener('click', () => addFriendForm.requestSubmit());
  friendIconBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
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
        await loadFriends();
        await fetchAndUpdateFriendNotifications();
      } else {
        showToast(data.message || 'Error while sending friend request.', 'error');
      }
    } catch (err) {
      console.error('Network error:', err);
      showToast('Network error while sending friend request.', 'error');
    }
  });

  async function respondToRequest(fromUserId, accept) {
    try {
      const res = await fetch('/api/friends/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fromUserId,
          action: accept ? 'accept' : 'reject'
        })
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message || (accept ? 'Friend request accepted.' : 'Friend request rejected.'), 'success');
        await loadFriends();
        await fetchAndUpdateFriendNotifications();
      } else {
        showToast(data.message || 'Error processing friend request.', 'error');
      }
    } catch (err) {
      console.error('Network error:', err);
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

      updateFriendNotificationBadge(pendingRequests.length);

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
              <button class="message-btn" 
                      title="Message ${friend.name || 'User'}" 
                      data-id="${friend._id}" 
                      data-name="${friend.name || '-'}">
                <i class="fas fa-comment-alt"></i> 
              </button>
              <button class="remove-btn" title="Remove ${friend.name || 'User'}" data-id="${friend._id}" data-name="${friend.name || '-'}">
                <i class="fas fa-user-minus"></i>
              </button>
              <button class="settings-btn" title="Friend Settings" data-id="${friend._id}" data-name="${friend.name || '-'}">
                <i class="fas fa-cog"></i>
              </button>
            </div>
          </div>
        `).join('');
      } else if (pendingRequests.length === 0) {
        html += '<p>Start now by adding a friend via their nickname!</p>';
      }

      friendsList.innerHTML = html;

      // Render incoming requests
      incomingRequests.innerHTML = pendingRequests.length > 0
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
                <button class="accept-btn" title="Accept ${req.name || 'User'}'s request" data-id="${req._id}" data-fromuserid="${req.fromUserId || req._id}" data-name="${req.name || 'User'}">
                  <i class="fas fa-check"></i> 
                </button>
                <button class="reject-btn" title="Reject ${req.name || 'User'}'s request" data-id="${req._id}" data-fromuserid="${req.fromUserId || req._id}" data-name="${req.name || 'User'}">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          `).join('')
        : '<p>No incoming requests.</p>';

      // Render outgoing requests
      outgoingRequests.innerHTML = sentRequests.length > 0
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
                <button class="cancel-request-btn" title="Cancel request" data-id="${req._id}" data-userid="${req.toUserId || req._id}" data-name="${req.name || 'User'}">
                  <i class="fas fa-times"></i> 
                </button>
              </div>
            </div>
          `).join('')
        : '<p>No outgoing requests.</p>';

      // Add event listeners to buttons
      document.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const fromUserId = btn.dataset.fromuserid;
          await respondToRequest(fromUserId, true);
        });
      });

      document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const fromUserId = btn.dataset.fromuserid;
          await respondToRequest(fromUserId, false);
        });
      });

      document.querySelectorAll('.cancel-request-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const userId = btn.dataset.userid;
          if (await customConfirm('Cancel this friend request?')) {
            try {
              const res = await fetch(`/api/friends/cancel/${userId}`, {
                method: 'DELETE',
                credentials: 'include',
              });
              const data = await res.json();
              if (res.ok) {
                showToast(data.message || 'Friend request cancelled.', 'success');
                await loadFriends();
                await fetchAndUpdateFriendNotifications();
              } else {
                showToast(data.message || 'Error cancelling request.', 'error');
              }
            } catch (err) {
              showToast('Network error.', 'error');
            }
          }
        });
      });

      document.querySelectorAll('#remove-friend').forEach(btn => {
        btn.addEventListener('click', async () => {
          const friendId = btn.dataset.id;
          const friendName = btn.dataset.name;
          if (await customConfirm(`Remove ${friendName} from friends?`)) {
            try {
              const res = await fetch(`/api/friends/remove/${friendId}`, {
                method: 'DELETE',
                credentials: 'include',
              });
              const data = await res.json();
              if (res.ok) {
                showToast(data.message || 'Friend removed.', 'success');
                await loadFriends();
                await fetchAndUpdateFriendNotifications();
              } else {
                showToast(data.message || 'Error removing friend.', 'error');
              }
            } catch (err) {
              showToast('Network error.', 'error');
            }
          }
        });
      });

      // Message and settings buttons can be implemented as needed
    } catch (error) {
      console.error(error);
      friendsList.innerHTML = '<p>Error loading friends.</p>';
    }
  }

  // Modal toggle
  openFriendRequestsView.addEventListener('click', () => {
    friendRequestsModal.classList.remove('hidden');
    incomingRequests.focus();
  });

  closeFriendModalBtn.addEventListener('click', () => {
    friendRequestsModal.classList.add('hidden');
    openFriendRequestsView.focus();
  });

  friendRequestsModal.addEventListener('click', (event) => {
    if (event.target === friendRequestsModal) {
      friendRequestsModal.classList.add('hidden');
      openFriendRequestsView.focus();
    }
  });

  // Tabs switch
  incomingTab.addEventListener('click', () => {
    incomingTab.classList.add('active');
    outgoingTab.classList.remove('active');
    incomingRequests.classList.add('active');
    outgoingRequests.classList.remove('active');
    incomingRequests.focus();
  });

  outgoingTab.addEventListener('click', () => {
    outgoingTab.classList.add('active');
    incomingTab.classList.remove('active');
    outgoingRequests.classList.add('active');
    incomingRequests.classList.remove('active');
    outgoingRequests.focus();
  });

  // Load initial friends list and badge
  await loadFriends();
  await fetchAndUpdateFriendNotifications();
}