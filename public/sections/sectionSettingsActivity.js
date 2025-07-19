export default async function loadSettingsActivitySection(content, user) {
  document.body.style.background = '';
  document.body.style.transition = 'background 0.3s ease-in-out';

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';

  content.innerHTML = `
    <div class="case-header">
      <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link">
        <i class="fas fa-arrow-left"></i>
      </a>
      <h2><i class="fas fa-chart-line"></i> Activity Logs</h2>
    </div>
    <div class="activity-log-container" id="activity-logs">
      <h4>All logs</h4>
      <div class="activity-log-list" id="log-list">
        Loading...
      </div>
                  <div class="filters">
        <label>Type:
          <select id="filter-type">
            <option value="all">All</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>
        </label>

        <label>Date:
          <input type="date" id="filter-date">
        </label>

        <label>From:
          <input type="time" id="filter-time-from">
        </label>

        <label>To:
          <input type="time" id="filter-time-to">
        </label>

        <button id="apply-filters">Apply</button>
      </div>
    </div>
  `;

  async function loadActivityLogs() {
    try {
      const response = await fetch('/api/activity', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch activity logs');
      const logs = await response.json();

      const logListContainer = document.getElementById('log-list');
      if (!logListContainer) return;

      const icons = {
        login: '<i class="fas fa-sign-in-alt"></i>',
        logout: '<i class="fas fa-sign-out-alt"></i>',
      };

      function renderLogs(filteredLogs) {
        if (filteredLogs.length === 0) {
          logListContainer.innerHTML = '<p>No activity logs found.</p>';
          return;
        }

        const list = filteredLogs.map(log => {
          const icon = icons[log.type?.toLowerCase()] || '<i class="fas fa-question-circle"></i>';
          return `
            <div class="activity-entry">
              <div class="${log.type.toLowerCase()}">
                <strong>${icon} ${log.type.toUpperCase()}</strong> - ${new Date(log.timestamp).toLocaleString()}
                ${log.metadata?.provider ? `via <span class="${log.type.toLowerCase()}">${log.metadata.provider}</span>` : '<span style="color: red">unable to solve provider.</span>'}
                ${log.metadata?.ip ? ` (IP: ${log.metadata.ip})` : '<span style="color: red">unable to solve IP.</span>'}
              </div>
            </div>
          `;
        }).join('');

        logListContainer.innerHTML = list;
      }

      renderLogs(logs);

      document.getElementById('apply-filters').addEventListener('click', () => {
        const type = document.getElementById('filter-type').value;
        const date = document.getElementById('filter-date').value;
        const timeFrom = document.getElementById('filter-time-from').value;
        const timeTo = document.getElementById('filter-time-to').value;

        const filtered = logs.filter(log => {
          const logDate = new Date(log.timestamp);

          if (type !== 'all' && log.type.toLowerCase() !== type) return false;

          if (date) {
            const logDateStr = logDate.toISOString().split('T')[0];
            if (logDateStr !== date) return false;
          }

          if (timeFrom) {
            const fromMinutes = parseInt(timeFrom.split(':')[0]) * 60 + parseInt(timeFrom.split(':')[1]);
            const logMinutes = logDate.getHours() * 60 + logDate.getMinutes();
            if (logMinutes < fromMinutes) return false;
          }

          if (timeTo) {
            const toMinutes = parseInt(timeTo.split(':')[0]) * 60 + parseInt(timeTo.split(':')[1]);
            const logMinutes = logDate.getHours() * 60 + logDate.getMinutes();
            if (logMinutes > toMinutes) return false;
          }

          return true;
        });

        renderLogs(filtered);
      });

    } catch (error) {
      const logsContainer = document.getElementById('activity-logs');
      if (logsContainer)
        logsContainer.innerHTML = `<p>Error loading activity: ${error.message}</p>`;
    }
  }
  loadActivityLogs();
}