// ==== AUDIO TICK ====
const tickAudio = new Audio('../countdown/sfx/clock-it.mp3');
tickAudio.preload = 'auto';
tickAudio.volume = 0.45;

// ==== AUDIO BACKGROUND ====
const bgMusic = new Audio('../countdown/sfx/waiting.mp3');
bgMusic.preload = 'auto';
bgMusic.loop = true;
bgMusic.volume = 0.15;

let audioEnabled = false;
let audioUnlocked = false;

const audioToggleBtn = document.getElementById('audio-toggle');

audioToggleBtn.addEventListener('click', () => {
  if (!audioUnlocked) {
    audioUnlocked = true;
    tickAudio.play().then(() => {
      tickAudio.pause();
      tickAudio.currentTime = 0;
    }).catch(() => {});
    bgMusic.play().then(() => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }).catch(() => {});
  }

  audioEnabled = !audioEnabled;

  if (audioEnabled) {
    bgMusic.play().catch(() => {});
  } else {
    bgMusic.pause();
  }

  audioToggleBtn.innerHTML = audioEnabled
    ? '<i class="fas fa-volume-up"></i>'
    : '<i class="fas fa-volume-mute"></i>';
});

// ==== PLAY SOUND ====
function playTickSound() {
  if (!audioEnabled || !audioUnlocked) return;
  try {
    tickAudio.currentTime = 0;
    tickAudio.play().catch(() => {});
  } catch (e) {
    console.warn('Audio error:', e);
  }
}

// ==== COUNTDOWN FUNCTIONS ====
function pad(n) {
  return String(n).padStart(2, '0');
}

function updateElement(id, newValue) {
  const el = document.getElementById(id);
  if (el.textContent !== newValue) {
    el.textContent = newValue;
    el.classList.remove('change');
    void el.offsetWidth;
    el.classList.add('change');
    playTickSound();
  }
}

function updateCountdown() {
  const now = new Date();
  const targetUTC = Date.UTC(2026, 0, 1, 23 - 1, 0, 0);

  const startUTC = Date.UTC(2025, 0, 1, 23 - 1, 0, 0);
  const totalDuration = targetUTC - startUTC;
  const elapsed = now.getTime() - startUTC;

  const diff = targetUTC - now.getTime();

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  updateElement('days', pad(days));
  updateElement('hours', pad(hours));
  updateElement('minutes', pad(minutes));
  updateElement('seconds', pad(seconds));

  function toggleHidden(id, show) {
    const el = document.getElementById(id);
    if (!el) return;
    if (show) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  }

  const showDays = days !== 0;
  toggleHidden('days', showDays);
  toggleHidden('sep-days', showDays);
  toggleHidden('label-days', showDays);

  const showHours = showDays ? true : (hours !== 0);
  toggleHidden('hours', showHours);
  toggleHidden('sep-hours', showHours);
  toggleHidden('label-hours', showHours);

  const showMinutes = (showDays && showHours) ? true : (minutes !== 0);
  toggleHidden('minutes', showMinutes);
  toggleHidden('sep-minutes', showMinutes);
  toggleHidden('label-minutes', showMinutes);

  toggleHidden('seconds', true);
  toggleHidden('label-seconds', true);

  if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
    fetch('/switch-root', { method: 'POST' })
      .then(res => res.json())
      .then(data => console.log(data.message))
      .catch(err => console.error(err));

    window.location.reload();
  }
}

// ==== PROGRESS BAR ====
const startUTC = Date.UTC(2025, 5, 27, 23, 35, 23);
const endUTC = Date.UTC(2026, 0, 1, 0, 0, 0);
const maxDuration = endUTC - startUTC;

function updateProgressBar() {
  const nowUTC = Date.now();
  const elapsed = nowUTC - startUTC;

  let progress = (elapsed / maxDuration) * 100;
  if (progress > 100) progress = 100;
  if (progress < 0) progress = 0;

  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

  if (progressBar) {
    progressBar.style.width = progress + '%';
  }
  if (progressText) {
    progressText.textContent = progress.toFixed(2) + '%';
  }
}

setInterval(updateProgressBar, 1000);
updateProgressBar();
setInterval(updateCountdown, 1000);
updateCountdown();

// ==== TEMA & GESTURE ====
const themeToggleBtn = document.getElementById('theme-toggle');

themeToggleBtn.addEventListener('change', () => {
  document.body.classList.toggle('light-theme', themeToggleBtn.checked);
});

let touchStartX = 0;
let touchEndX = 0;

function handleGesture() {
  const deltaX = touchEndX - touchStartX;
  const threshold = 50;

  if (deltaX > threshold) {
    document.body.classList.remove('light-theme');
    themeToggleBtn.checked = false;
  } else if (deltaX < -threshold) {
    document.body.classList.add('light-theme');
    themeToggleBtn.checked = true;
  }
}

document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleGesture();
});

window.addEventListener('load', () => {
  const elements = document.body.children;
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.animation = `popup 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
    elements[i].style.animationDelay = `${i * 0.1}s`;
    elements[i].style.transformOrigin = 'center center';
  }
});

// ==== ONLINE USERS ====
fetch('/launch');
function updateOnlineUsers() {
  fetch('/launch-online-users')
    .then(res => res.json())
    .then(data => {
      document.getElementById('online-users').textContent = data.count;
    })
    .catch(console.error);
}

updateOnlineUsers();
setInterval(updateOnlineUsers, 2000);