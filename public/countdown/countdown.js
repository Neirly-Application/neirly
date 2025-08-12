// ==== AUDIO TICK ====
const tickAudio = new Audio('../countdown/sfx/clock-it.mp3');
tickAudio.preload = 'auto';
tickAudio.volume = 0.35;

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

      audioEnabled = true;
      bgMusic.play().catch(() => {});
      updateAudioButton();
    }).catch(() => {
      updateAudioButton();
    });

  } else {
    audioEnabled = !audioEnabled;

    if (audioEnabled) {
      bgMusic.play().catch(() => {});
    } else {
      bgMusic.pause();
    }
    updateAudioButton();
  }
});

function updateAudioButton() {
  if (audioEnabled) {
    audioToggleBtn.innerHTML = '<i class="fas fa-volume-up"></i> Volume ON';
    audioToggleBtn.title = "Volume ON";
  } else {
    audioToggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Volume OFF';
    audioToggleBtn.title = "Volume OFF";
  }
}

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
      .then(data => {
        if (data.success === true) {
          window.location.reload();
        } else {
          console.log(data.message);
        }
      })
      .catch(err => console.error(err));
  }
}

// ==== PROGRESS BAR ====
const startmyUTC = Date.UTC(2025, 5, 27, 23, 35, 23);
const endUTC = Date.UTC(2026, 0, 1, 0, 0, 0);
const maxDuration = endUTC - startmyUTC;

function updateProgressBar() {
  const nowUTC = Date.now();
  const elapsed = nowUTC - startmyUTC;

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

let touchStartX = 0;
let touchEndX = 0;
let gestureEnabled = true;

themeToggleBtn.addEventListener('change', () => {
  document.body.classList.toggle('light-theme', themeToggleBtn.checked);
});

function toggleThemeOnClick() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  themeToggleBtn.checked = !themeToggleBtn.checked;
  document.body.classList.toggle('light-theme', themeToggleBtn.checked);
}

function handleGesture() {
  if (!gestureEnabled);

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

function simSwipeLeft() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  document.body.classList.remove('light-theme');
  themeToggleBtn.checked = false;
}

function simSwipeRight() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  document.body.classList.add('light-theme');
  themeToggleBtn.checked = true;
}


document.addEventListener('touchstart', e => {
    gestureEnabled = true;
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
  if (gestureEnabled) {
    touchEndX = e.changedTouches[0].screenX;
    handleGesture();
  }
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

// ==== KEY EVENTS ====
document.addEventListener('keydown', (event) => {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.isComposing) {
    return;
  }
  if (event.key === 'm' || event.key === 'M') {
    audioToggleBtn.click();
  } else if (event.key === 't' || event.key === 'T') {
    themeToggleBtn.checked = !themeToggleBtn.checked;
    document.body.classList.toggle('light-theme', themeToggleBtn.checked);
  }
});

// ==== USER LATENCY ====
async function measurePing() {
const pingEl = document.getElementById('ping');

    try {
    const start = performance.now();
    await fetch('/ping', { cache: 'no-store' });
    const end = performance.now();

    const ping = Math.round(end - start);
    pingEl.textContent = ping + "ms";

    let colorVar;

    if (ping < 100) {
        colorVar = '--ping-good';
    } else if (ping < 200) {
        colorVar = '--ping-stable';
    } else {
        colorVar = '--ping-bad';
    }

    pingEl.style.color = getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();

    } catch (err) {
    pingEl.textContent = 'Err';
    pingEl.style.color = '#f00';
    }
}

setInterval(measurePing, 500);
measurePing();