function isDesktop() {
  return window.matchMedia("(pointer: fine)").matches;
}

document.addEventListener('contextmenu', (e) => {
  if (!isDesktop()) {
    return;
  }

  e.preventDefault();

  let menuTargets = e.target.dataset.menu || 'default';
  if (menuTargets === "disabled") return;

  const name = '<b>' + (e.target.dataset.name || 'User') + '</b>';
  const nick = "@" + (e.target.dataset.nick || 'Undefined');

  const types = menuTargets.split(' ');
  showCustomMenu(e.clientX, e.clientY, types, name, nick);
});


function showCustomMenu(x, y, types, name, nick) {
  const menu = document.getElementById('custom-menu');
  const dynamicPart = menu.querySelector('.dynamic');
  const red = `red"`
  dynamicPart.innerHTML = '';

    const contentMap = {
      'home': `
        <ul>
          <li><a href="#home"><i class="far fa-sticky-note"></i> Check the Posts</a></li>
        </ul>`,
      'near-you': `
        <ul>
          <li><a href="#settings-privacy"><i class="fas fa-user-shield"></i> Account Privacy</a></li>
          <li><a><i class="fas fa-map-marker-alt"></i> Location Settings</a></li>
        </ul>`,
      'location': `
        <ul>
          <li><a><i class="fas fa-map-marker-alt"></i> Location Settings</a></li>
        </ul>`,
      'profile': `
        <ul>
          <li><a href="#profile"><i class="fas fa-pencil-alt"></i> Edit your Profile</a></li>
        </ul>`,
      'friend-list': `
        <ul>
          <li><a href="#friend-list"><i class="fas fa-user-plus"></i> Add a friend</a></li>
          <li><a href="#friend-list"><i class="fas fa-user-friends"></i> View friend list</a></li>
          <li><a href="#friend-list"><i class="fas fa-ban"></i> View blocked list</a></li>
        </ul>`,
      'selected-friend': `
        <ul>
          <li><a><i class="fas fa-comment-alt"></i> Chat with ${name}</a></li>
          <li><a><i class="fas fa-user-minus ${red}"></i> <span class="${red}">Unfriend ${name}</span></a></li>
          <li><a><i class="fas fa-ban ${red}"></i> <span class="${red}">Block ${name}</span></a></li>
          <li><a><i class="fas fa-cog"></i> Friend settings</a></li>
        </ul>`,
      'selected-friend-profile': `
        <ul>
          <li><a><i class="fas fa-user"></i> ${name}</a></li>
        </ul>`,
      'selected-friend-chat-with': `
        <ul>
          <li><a><i class="fas fa-comment-alt"></i> Chat with ${name}</a></li>
        </ul>`,
      'selected-friend-remove': `
        <ul>
          <li><a><i class="fas fa-user-minus ${red}"></i> <span class="${red}">Unfriend ${name}</span></a></li>
        </ul>`,
      'selected-friend-settings': `
        <ul>
          <li><a><i class="fas fa-cog"></i> Friend settings</a></li>
        </ul>`,
      'incoming-friend': `
        <ul>
          <li><a><i class="fas fa-check"></i> Accept ${name}'s request</a></li>
          <li><a><i class="fas fa-times ${red}"></i> <span class="${red}">Reject ${name}'s request</span></a></li>
        </ul>`,
      'outgoing-friend': `
        <ul>
          <li><a><i class="fas fa-times ${red}"></i> <span class="${red}">Cancel Request</span></a></li>
        </ul>`,
      'add-friend': `
        <ul>
          <li><a href="#friend-list"><i class="fas fa-user-plus"></i> Add ${name}</a></li>
        </ul>`,
      'messages': `
        <ul>
          <li><a href="#settings-chats"><i class="fas fa-comment-alt"></i> Chat Settings</a></li>
        </ul>`,
      'settings': `
        <ul>
          <li><a href="#settings-account"><i class="fas fa-user-shield"></i> Account & Security</a></li>
          <li><a href="#settings-privacy"><i class="fas fa-lock"></i> Privacy</a></li>
          <li><a href="#settings-theme"><i class="fas fa-palette"></i> App Theme</a></li>
          <small><a href="#settings">More...</a></small>
        </ul>`,
      'premium': `
        <ul>
          <li><a href="#settings-payment"><i class="fas fa-wallet"></i> Plan & Payments</a></li>
        </ul>`,
      'copy-post-title': `
        <ul>
          <li><a><i class="fas fa-copy"></i> Copy Title</a></li>
        </ul>`,
      'copy-post-desc': `
        <ul>
          <li><a><i class="fas fa-copy"></i> Copy Content</a></li>
        </ul>`,
      'post-author': `
        <ul>
          <li><a><i class="fas fa-user"></i> ${name}</a></li>
        </ul>`,
      'nearby-user-profile': `
        <ul>
          <li><a><i class="fas fa-user"></i> ${name}</a></li>
        </ul>`
    };

  types.forEach(type => {
    if (contentMap[type]) {
      dynamicPart.innerHTML += contentMap[type];
    }
  });

  dynamicPart.classList.toggle('hidden', dynamicPart.innerHTML.trim() === '');

  menu.style.visibility = 'hidden';
  menu.classList.add('visible');

  const { innerWidth, innerHeight } = window;
  const menuWidth = menu.offsetWidth;
  const menuHeight = menu.offsetHeight;

  menu.style.top = Math.min(y, innerHeight - menuHeight) + 'px';
  menu.style.left = Math.min(x, innerWidth - menuWidth) + 'px';

  menu.style.visibility = 'visible';
}

document.addEventListener('click', () => {
  document.getElementById('custom-menu').classList.remove('visible');
});