const offlineOverlay = document.getElementById('offlineOverlay');

function updateOnlineStatus() {
  if (navigator.onLine) {
    offlineOverlay.style.display = 'none';
  } else {
    offlineOverlay.style.display = 'flex';
  }
}

updateOnlineStatus();

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

document.addEventListener('click', () => {
  if (offlineOverlay.style.display === 'flex') {
    updateOnlineStatus();
  }
});
