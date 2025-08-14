import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default function loadSettingsThemeSection(content, user) {
  stopBubblesAnimation();
  stopBGAnimation();

  document.body.style.transition = 'background 0.2s ease-in-out';
  content.style.transition = 'background 0.2s ease-in-out';

  content.innerHTML = `
    <div class="case-header">
      <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link">
        <i class="fas fa-arrow-left"></i>
      </a>
      <h2><i class="fas fa-palette"></i> App Theme</h2>
    </div>
    <p>Select the app theme.</p>

    <div class="toggle-view">
      <label>
        <input type="checkbox" id="viewToggle" />
        Fast view
      </label>
    </div>

    <div class="card-container">
      <div class="theme-card" data-theme="light">
        <span class="badge"><i class="fas fa-sun"></i></span>
        <div class="emoji"><i class="fas fa-sun"></i></div>
        <h3>Light Theme</h3>
        <p class="card-desc">A perfect theme for lovers of visually bright colors.</p>
        <button class="select-btn">Select</button>
      </div>

      <div class="theme-card" data-theme="dark">
        <span class="badge"><i class="fas fa-moon"></i></span>
        <div class="emoji"><i class="fas fa-moon"></i></div>
        <h3>Dark Theme</h3>
        <p class="card-desc">Ideal for the night with less eye strain.</p>
        <button class="select-btn">Select</button>
      </div>
    </div>
  `;

  const toggle = document.getElementById('viewToggle');
  const cards = document.querySelectorAll('.theme-card');

  toggle.addEventListener('change', () => {
    cards.forEach(card => card.classList.toggle('condensed', toggle.checked));
  });

  let initialTheme = user?.theme || localStorage.getItem('theme') || 'dark';
  applyTheme(initialTheme);
  setSelectedButton(initialTheme);

  fetch('/api/profile')
    .then(res => res.json())
    .then(userData => {
      const currentTheme = userData.theme || 'dark';
      if (currentTheme !== initialTheme) {
        applyTheme(currentTheme);
        setSelectedButton(currentTheme);
      }
      user.theme = currentTheme;
      localStorage.setItem('theme', currentTheme);
    })
    .catch(err => console.warn('Theme fetch failed, using cached:', err));

  document.querySelectorAll('.select-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedTheme = e.target.closest('.theme-card').dataset.theme;

      applyTheme(selectedTheme);
      setSelectedButton(selectedTheme);
      user.theme = selectedTheme;
      localStorage.setItem('theme', selectedTheme);

      fetch('/api/user/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: selectedTheme })
      }).catch(err => console.error('Error while saving theme:', err));
    });
  });
}

function applyTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  document.body.classList.toggle('light', theme === 'light');
}

function setSelectedButton(theme) {
  document.querySelectorAll('.select-btn').forEach(btn => {
    const cardTheme = btn.closest('.theme-card').dataset.theme;
    if (cardTheme === theme) {
      btn.textContent = 'Selected!';
      btn.disabled = true;
      btn.style.backgroundColor = '#395b96ff';
      btn.style.color = '#d7d7d7ff';
    } else {
      btn.textContent = 'Select';
      btn.disabled = false;
      btn.style.backgroundColor = '';
      btn.style.color = '';
    }
  });
}
