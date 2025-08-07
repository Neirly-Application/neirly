import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadSearchSection(content, user) {
  stopBubblesAnimation();
  stopBGAnimation();

  Object.assign(document.body.style, {
    background: '',
    animation: '',
    backgroundSize: '',
    transition: 'background 0.2s ease-in-out',
  });

  Object.assign(content.style, {
    background: '',
    transition: 'background 0.2s ease-in-out',
    display: '',
    flexDirection: '',
    justifyContent: '',
    alignItems: '',
    height: '',
    overflow: '',
    padding: '',
    margin: '',
  });

  document.title = 'Search';

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
      <p class="search-placeholder">Loading recent searches...</p>
    </div>
  `;

  const input = document.getElementById('searchInput');
  const btn = document.getElementById('searchBtn');
  const results = document.getElementById('search-results');

  let lastQuery = '';
  let debounceTimeout;
  let recentSavedQuery = '';

  const saveTextSearch = async (query) => {
    if (query === recentSavedQuery) return;
    recentSavedQuery = query;

    try {
      await fetch('/api/search/add-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query }),
      });
    } catch (err) {
      console.warn('Failed to save text search', err);
    }
  };

  const saveUserSearch = async (user) => {
    try {
      await fetch('/api/search/add-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          targetUniquenick: user.uniquenick,
          name: user.name,
          profilePictureUrl: user.profilePictureUrl
        }),
      });
    } catch (err) {
      console.warn('Failed to save user search', err);
    }
  };

  const renderUsers = (users = []) => {
    results.innerHTML = users.length
      ? `<ul class="search-list">
          ${users.map(ru => `
            <li class="user-result" data-id="${ru._id}" data-nick="${ru.uniquenick}" data-name="${ru.name}" data-img="${ru.profilePictureUrl || '../media/user.png'}">
              <img src="${ru.profilePictureUrl || '../media/user.png'}" alt="${ru.name}" class="search-user-img"/>
              <div class="search-user-info">
                <span class="search-user-name">${ru.name}</span>
                <span class="search-user-nick">@${ru.uniquenick}</span>
              </div>
              <button class="remove-search" title="Remove">&#10005;</button>
            </li>`).join('')}
        </ul>`
      : `<p>Search now for a user you are interested to know!.</p>`;

    document.querySelectorAll('.remove-search').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();

        const li = btn.closest('.user-result');
        const userId = li.dataset.id;

        try {
          await fetch(`/api/search/remove-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ userId })
          });

          li.remove();
        } catch (err) {
          console.error('Failed to remove search.', err);
        }
      });
    });

    document.querySelectorAll('.user-result').forEach(li => {
      li.addEventListener('click', async () => {
        const user = {
          name: li.dataset.name,
          uniquenick: li.dataset.nick,
          profilePictureUrl: li.dataset.img
        };
        await saveUserSearch(user);
        // Profile navigation or other behaviors here.
      });
    });
  };


  const renderGenericResults = ({ posts = [], tags = [], users = [] }) => {
    if (!users.length && !posts.length && !tags.length) {
      results.innerHTML = `<p>No results found.</p>`;
      return;
    }

    results.innerHTML = `
      ${users.length ? `
        <ul class="search-list">
          ${users.map(u => `
            <li class="user-result" data-nick="${u.uniquenick}" data-name="${u.name}" data-img="${u.profilePictureUrl || '../media/user.png'}">
              <img src="${u.profilePictureUrl || '../media/user.png'}" alt="${u.name}" class="search-user-img"/>
              <div class="search-user-info">
                <span class="search-user-name">${u.name}</span>
                <span class="search-user-nick">@${u.uniquenick}</span>
              </div>
            </li>`).join('')}
        </ul>` : ''}

      ${posts.length ? `
        <ul class="search-list">
          ${posts.map(p => `<li>${p.title || 'Untitled post'}</li>`).join('')}
        </ul>` : ''}

      ${tags.length ? `
        <ul class="search-list">
          ${tags.map(t => `<li>#${t.name}</li>`).join('')}
        </ul>` : ''}
    `;

    document.querySelectorAll('.user-result').forEach(li => {
      li.addEventListener('click', async () => {
        const user = {
          name: li.dataset.name,
          uniquenick: li.dataset.nick,
          profilePictureUrl: li.dataset.img
        };
        await saveUserSearch(user);
      });
    });
  };

  const loadLastSearches = async () => {
    try {
      const res = await fetch('/api/search/last-searches', { credentials: 'include' });
      const json = await res.json();
      renderUsers(json?.searches || []);
    } catch (err) {
      console.error('Failed to load last searches:', err);
      results.innerHTML = `<p class="search-error">Unable to load recent searches.</p>`;
    }
  };

  const handleSearch = async () => {
    const query = input.value.trim();

    if (!query) {
      lastQuery = '';
      loadLastSearches();
      return;
    }

    if (query === lastQuery) return;
    lastQuery = query;

    results.innerHTML = `<p class="search-title">Searching for: <strong>${query}</strong>...</p>`;

    try {
      if (query.startsWith('@')) {
        const name = query.slice(1);
        const res = await fetch(`/api/search/users?q=${encodeURIComponent(name)}`, { credentials: 'include' });
        const json = await res.json();
        renderUsers(json?.users || []);
      } else {
        await saveTextSearch(query);

        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { credentials: 'include' });
        const json = await res.json();
        renderGenericResults(json);
      }
    } catch (err) {
      console.error('Search error:', err);
      results.innerHTML = `<p class="search-error">Something went wrong.</p>`;
    }
  };

  input.addEventListener('input', () => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(handleSearch, 250);
  });

  input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      await handleSearch();
    }
  });

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    await handleSearch();
  });

  loadLastSearches();
}