export default async function loadCeoSection(content, user) {
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
}