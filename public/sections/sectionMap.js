export default async function loadMapSection(content, user) {
  const avatar = user?.profilePictureUrl || '../media/user.png';
  const username = user?.name || 'Username';
  const nickname = user?.uniquenick ? `@${user.uniquenick}` : '@uniquenick';
  const about = user?.about_me || '"About me"';

  content.innerHTML = `
    <h2><i class="fas fa-map"></i> Map</h2>
    <div class="card map-card" style="position: relative; overflow: hidden;">
      <img src="${avatar}" alt="Profile" class="profile-avatar" style="position: absolute;">
    </div>

    <a href="#map-screen" class="btn map-button">
      <i class="fas fa-location-arrow"></i> Go to Map
    </a>

    <div class="fancy-line"></div>

    <div class="card profile-card">
      <img src="${avatar}" alt="User Profile">
      <div class="profile-info">
        <h3>${username}</h3>
        <p>${nickname}</p>
        <p>${about}</p>
        <span class="status">Online</span>
      </div>
      <div class="profile-actions">
        <button class="view-btn">
          <i class="fas fa-user"></i> <span>View Profile</span>
        </button>
        <button class="request-btn">
          <i class="fas fa-user-plus"></i> <span>Add as Friend</span>
        </button>
      </div>
    </div>
  `;

  const container = document.querySelector('.map-card');
  const padding = 30;
  const avatarSize = 30;
  const mainAvatarSize = 20;

  const people = [];

  function getRandomPosition(size) {
    const maxLeft = container.clientWidth - size - padding;
    const maxTop = container.clientHeight - size - padding;
    const left = Math.random() * (maxLeft - padding) + padding;
    const top = Math.random() * (maxTop - padding) + padding;
    return { left, top };
  }

  function distanzaTraPunti(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
  }

  function generatePeople() {
    const count = Math.floor(Math.random() * 3) + 3;
    const minDistance = 60;

    let positions = [];

    for (let i = 0; i < count; i++) {
      let tries = 0;
      let pos;
      do {
        pos = getRandomPosition(avatarSize);
        const troppoVicino = positions.some(p => distanzaTraPunti(pos.left, pos.top, p.left, p.top) < minDistance);
        tries++;
        if (!troppoVicino || tries > 100) break;
      } while(true);

      positions.push(pos);
    }

    container.querySelectorAll('.random-avatar').forEach(e => e.remove());

    positions.forEach(pos => {
      const img = document.createElement('img');
      img.src = '../media/neirly.png';
      img.classList.add('random-avatar');
      img.style.position = 'absolute';
      img.style.width = '30px';
      img.style.height = '30px';
      img.style.borderRadius = '50%';
      img.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
      img.style.objectFit = 'cover';
      img.style.cursor = 'none';
      img.style.zIndex = '10';
      img.style.left = pos.left + 'px';
      img.style.top = pos.top + 'px';
      container.appendChild(img);

      people.push({
        el: img,
        left: pos.left,
        top: pos.top,
        size: avatarSize
      });
    });
  }

  function positionMainAvatar() {
    const mainAvatar = document.querySelector('.profile-avatar');
    if (!mainAvatar) return;

    let pos;
    let tries = 0;
    do {
      pos = getRandomPosition(mainAvatarSize);
      const troppoVicino = people.some(p => distanzaTraPunti(pos.left, pos.top, p.left, p.top) < 60);
      tries++;
      if (!troppoVicino || tries > 100) break;
    } while(true);

    people.push({
      el: mainAvatar,
      left: pos.left,
      top: pos.top,
      size: mainAvatarSize
    });
  }

  function movePerson(person) {
    const speed = 10; 
    const minDistance = 60;

    function step() {
      if (Math.random() > 0.3) {
        let tries = 0;
        let newLeft, newTop;

        do {
          const deltaX = (Math.random() - 0.5) * speed * 2;
          const deltaY = (Math.random() - 0.5) * speed * 2;

          newLeft = person.left + deltaX;
          newTop = person.top + deltaY;

          if (newLeft < padding) newLeft = padding;
          if (newTop < padding) newTop = padding;
          if (newLeft > container.clientWidth - person.size - padding) newLeft = container.clientWidth - person.size - padding;
          if (newTop > container.clientHeight - person.size - padding) newTop = container.clientHeight - person.size - padding;

          const troppoVicino = people.some(other => {
            if (other === person) return false;
            return distanzaTraPunti(newLeft, newTop, other.left, other.top) < minDistance;
          });

          tries++;
          if (!troppoVicino || tries > 100) break;
        } while(true);

        person.left = newLeft;
        person.top = newTop;

        person.el.style.left = newLeft + 'px';
        person.el.style.top = newTop + 'px';
      }
      const delay = 1500 + Math.random() * 2000;
      setTimeout(step, delay);
    }

    step();
  }

  function movePeople() {
    people.forEach(person => {
      movePerson(person);
    });
  }


  generatePeople();
  positionMainAvatar();
  movePeople();
}