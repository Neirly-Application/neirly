export default async function loadSettingsThemeSection(content, user) {
              content.innerHTML = `
            <div class="case-header">
              <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link"><i class="fas fa-arrow-left"></i></a>
              <h2><i class="fas fa-palette"></i> App Theme</h2>
            </div>
              <p>Scegli il tema della tua app.</p>

            <div class="toggle-view">
              <label>
                <input type="checkbox" id="viewToggle" />
                Vista rapida
              </label>
            </div>

            <div class="card-container">
              <div class="theme-card">
                <span class="badge"><i class="fas fa-fire"></i></span>
                <div class="emoji">🎨</div>
                <h3>Tema Creativo</h3>
                <p class="card-desc">Un tema perfetto per designer e artisti visivi.</p>
                <button class="select-btn">Scegli Tema</button>
              </div>

              <div class="theme-card">
                <span class="badge"><i class="fas fa-star"></i></span>
                <div class="emoji">🌙</div>
                <h3>Tema Notturno</h3>
                <p class="card-desc">Ideale per lavorare di notte con meno affaticamento visivo.</p>
                <button class="select-btn">Scegli Tema</button>
              </div>
            </div>
            `;

              const toggle = document.getElementById('viewToggle');
              const cards = document.querySelectorAll('.theme-card');

              toggle.addEventListener('change', () => {
                cards.forEach(card => {
                  card.classList.toggle('condensed', toggle.checked);
                });
              });
}