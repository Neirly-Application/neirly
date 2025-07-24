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
        <input type="search" placeholder="Search..." id="searchInput" autocomplete="off"/>
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
  const results = document.getElementById('search-results');

  let currentTimeout = null;
  let lastQuery = '';

  const showDefaultMessage = () => {
    results.innerHTML = `<p class="search-placeholder">Your recent searches</p>`;
  };

  const renderUsers = (users = []) => {
    if (!users.length) {
      results.innerHTML = `<p>No users found.</p>`;
      return;
    }

    results.innerHTML = `
      <p class="search-title">Users</p>
      <ul class="search-list">
        ${users.map(user => `
          <li>
            <img src="${user.profilePictureUrl || '../media/user.png'}" alt="${user.nickname}" class="search-user-img"/>
            <span class="search-user-name">@${user.uniquenick}</span>
          </li>
        `).join('')}
      </ul>
    `;
  };

  const renderGenericResults = (data = {}) => {
    const { posts = [], tags = [], users = [] } = data;

    if (!posts.length && !tags.length && !users.length) {
      results.innerHTML = `<p>No results found.</p>`;
      return;
    }

    results.innerHTML = `
      ${users.length ? `
        <p class="search-title">Users</p>
        <ul class="search-list">
          ${users.map(user => `
            <li>
              <img src="${user.profilePictureUrl || '../media/user.png'}" alt="${user.nickname}" class="search-user-img"/>
              <span class="search-user-name">@${user.uniquenick}</span>
            </li>
          `).join('')}
        </ul>
      ` : ''}

      ${posts.length ? `
        <p class="search-title">Posts</p>
        <ul class="search-list">
          ${posts.map(post => `<li>${post.title || 'Untitled post'}</li>`).join('')}
        </ul>
      ` : ''}

      ${tags.length ? `
        <p class="search-title">Tags</p>
        <ul class="search-list">
          ${tags.map(tag => `<li>#${tag.name}</li>`).join('')}
        </ul>
      ` : ''}
    `;
  };

  const handleSearch = async () => {
    const query = input.value.trim();

    if (query === lastQuery) return;
    lastQuery = query;

    if (!query) {
      showDefaultMessage();
      return;
    }

    results.innerHTML = `<p class="search-title">Searching for: <strong>${query}</strong>...</p>`;

    try {
      if (query.startsWith('@')) {
        const nickname = query.slice(1);
        const res = await fetch(`/api/search/users?q=${encodeURIComponent(nickname)}`, {
          credentials: 'include'
        });
        const json = await res.json();
        renderUsers(json.users || []);
      } else {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          credentials: 'include'
        });
        const json = await res.json();
        renderGenericResults(json);
      }
    } catch (err) {
      console.error('Search error:', err);
      results.innerHTML = `<p class="search-error">Something went wrong. Try again.</p>`;
    }
  };

  input.addEventListener('input', () => {
    clearTimeout(currentTimeout);
    currentTimeout = setTimeout(handleSearch, 300); // debounce 300ms
  });

  document.getElementById('searchBtn').addEventListener('click', handleSearch);

  showDefaultMessage();
  stopBGAnimation();
}