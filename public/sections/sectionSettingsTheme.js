import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadSettingsThemeSection(content, user) {
  stopBubblesAnimation();
  stopBGAnimation();

  document.body.style.transition = 'background 0.3s ease-in-out';
  content.style.transition = 'background 0.3s ease-in-out';

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

  try {
    const res = await fetch('/api/profile');
    const userData = await res.json();
    applyTheme(userData.theme || 'dark');
    user.theme = userData.theme || 'dark';
  } catch (err) {
    console.error('Error fetching user theme:', err);
    applyTheme('dark');
  }

  document.querySelectorAll('.select-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const selectedTheme = e.target.closest('.theme-card').dataset.theme;
      applyTheme(selectedTheme);

      try {
        const res = await fetch('/api/user/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: selectedTheme })
        });

        const data = await res.json();
        if (data.success) {
          user.theme = selectedTheme;
        }
      } catch (err) {
        console.error('Error while saving theme:', err);
      }
    });
  });
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  } else {
    document.body.classList.add('light');
    document.body.classList.remove('dark');
  }
}
