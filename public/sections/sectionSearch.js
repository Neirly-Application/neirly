import { stopBGAnimation } from '../scripts/premiumBg.js';

export default async function loadSearchSection(content, user) {
  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';
  document.title = 'Search';

  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';

  content.innerHTML = `
    <div class="search-bar">
      <div class="search-content">
        <input type="search" placeholder="Search..." id="searchInput" />
        <button type="submit" id="searchBtn" class="search-btn">
          <i class="fas fa-search"></i>
        </button>
      </div>
    </div>
    
    <div class="fancy-line"></div>

    <div class="search-results" id="search-results">
      <p class="search-placeholder">Your recent searches</p>
    </div>
  `;

  const input = document.getElementById('searchInput');
  const button = document.getElementById('searchBtn');
  const results = document.getElementById('search-results');

  const showDefaultMessage = () => {
    results.innerHTML = `<p class="search-placeholder">Your recent searches</p>`;
  };

  const handleSearch = () => {
    const query = input.value.trim();
    if (!query) {
      showDefaultMessage();
      return;
    }

    results.innerHTML = `
      <p class="search-title">Results for: <strong>${query}</strong></p>
      <ul class="search-list">
        <li>Example result 1</li>
        <li>Example result 2</li>
        <li>Example result 3</li>
      </ul>
    `;
  };

  button.addEventListener('click', handleSearch);

  input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  showDefaultMessage();

  stopBGAnimation();
}
