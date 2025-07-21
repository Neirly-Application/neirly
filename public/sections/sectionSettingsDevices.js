import { stopBGAnimation } from '../scripts/premiumBg.js';

export default async function loadSettingsDevicesSection(content, user) {
  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';

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
}

stopBGAnimation();