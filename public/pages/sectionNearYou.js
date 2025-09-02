import { showToast, customConfirm } from '../scripts/notification.js';
import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

function showLocationSkeleton() {
  const statusBox = document.getElementById("location-status");
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  if (!statusBox) return;

  const random1 = random(180, 200);
  const random2 = random(100, 200);
  statusBox.innerHTML = `
      <div class="error-container post-skeleton" data-menu="location" style="display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 20px;">
        <div class="skeleton-circle" style="width: ${random1}px; height: 120px;"></div>
        <p class="skeleton-bar" style="width: ${random2}px; height: 16px;"></p>
      </div>
    `;
}

function removeLocationSkeleton() {
  const statusBox = document.getElementById("location-status");
  if (!statusBox) return;
  statusBox.querySelectorAll('.skeleton-bar').forEach(s => s.remove());
}

function showNearbyUsersSkeleton(count = 10) {
  const usersBox = document.getElementById("nearby-users");
  if (!usersBox) return;
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const skeletons = [];
  for (let i = 0; i < count; i++) {
    const randomWidthName = random(100,140);
    const randomWidthNick = random(40,80);
    const randomWidthDesc = random(100,140);
    skeletons.push(`
      <div class="card profile-card post-skeleton">
        <div class="profile-card-row">
          <div class="skeleton-circle" style="width: 120px; height: 120px;"></div>
          <div class="profile-info" style="margin-left: 10px; flex: 1;">
            <p class="skeleton-bar" style="width: ${randomWidthName}px; height: 16px; margin-bottom: 10px;"></p>
            <p class="skeleton-bar" style="width: ${randomWidthNick}px; height: 14px; margin-bottom: 10px;"></p>
            <p class="skeleton-bar" style="width: ${randomWidthDesc}px; height: 14px; margin-bottom: 10px;"></p>
            <p class="skeleton-bar" style="width: 80px; height: 16px;"></p>
          </div>
        </div>
        <div class="profile-actions" style="display: flex; gap: 10px; margin-top: 10px;">
          <div class="skeleton-bar" style="width: 100px; height: 30px;"></div>
          <div class="skeleton-bar" style="width: 100px; height: 30px;"></div>
        </div>
      </div>
    `);
  }
  usersBox.innerHTML = skeletons.join('');
}

function removeNearbyUsersSkeleton() {
  const usersBox = document.getElementById("nearby-users");
  if (!usersBox) return;
  usersBox.querySelectorAll('.post-skeleton').forEach(card => card.remove());
}

function clearSkeletonsAndErrors() {
  removeLocationSkeleton();
  removeNearbyUsersSkeleton();
  const statusBox = document.getElementById("location-status");
  if (!statusBox) return;
  statusBox.querySelectorAll('.error-container').forEach(e => e.remove());
}

export default async function loadNearYouSection(content, user) {
  stopBubblesAnimation();
  stopBGAnimation();

  clearSkeletonsAndErrors();

  document.body.style.background = '';
  document.body.style.animation = '';
  document.body.style.backgroundSize = '';
  document.body.style.transition = 'background 0.3s ease-in-out';
  content.style.background = '';
  content.style.transition = 'background 0.3s ease-in-out';
  content.style.display = '';
  content.style.flexDirection = '';
  content.style.justifyContent = '';
  content.style.alignItems = '';
  content.style.height = '';
  content.style.overflow = '';
  content.style.padding = '';
  content.style.margin = '';
  content.dataset.menu = 'location';

  const avatar = user?.profilePictureUrl || '../media/user.webp';
  const username = user?.name || 'User';
  const nickname = user?.uniquenick ? `@${user.uniquenick}` : 'Undefined';
  const about = user?.about_me || '"About me"';

  function myDataAttrs(my) {
    return `data-menu="profile location"`;
  }

  content.innerHTML = `
    <h2><i class="fas fa-location-dot"></i> Near you</h2>

    <div class="card profile-card" ${myDataAttrs(user)}>
      <div class="profile-card-row">
        <img src="${avatar}" alt="User Profile" ${myDataAttrs(user)} oncontextmenu="return false;">
        <div class="profile-info" ${myDataAttrs(user)} >
          <h3 class="info-name" ${myDataAttrs(user)} >${username}</h3>
          <p class="info-nick" ${myDataAttrs(user)} >${nickname}</p>
          <p class="info-about" ${myDataAttrs(user)} >${about}</p>
          <span class="status">Online</span>
        </div>
      </div>
      <div class="profile-actions" ${myDataAttrs(user)} >
        <a href="#profile" data-section="profile" data-menu="profile" >
          <button class="cta-button" data-menu="profile" >
            <i class="fas fa-pen" data-menu="profile" ></i> Edit Profile
          </button>
        </a>
        <a href="#settings-location" data-menu="location" >
          <button class="cta-button" data-menu="location" >
            <i class="fas fa-cog" data-menu="location"></i> Location
          </button>
        </a>
      </div>
    </div>

    <div class="fancy-line"></div>
    <div id="location-status" class="text-middlepage-info" data-menu="location"></div>
    <div id="nearby-users"></div>
  `;

  const statusBox = document.getElementById("location-status");

  showLocationSkeleton();
  showNearbyUsersSkeleton(10);

  async function updateCoordinatesAndFetch(position) {
    const { latitude: lat, longitude: lng } = position.coords;

    try {
      await fetch('/api/set-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      });

      const data = await fetch(`/api/near-me`).then(r => r.json());

      removeLocationSkeleton();
      removeNearbyUsersSkeleton();

      const nearbyUsers = data.nearby || [];
      const { road = '', city = '', postcode = '' } = data.address || {};

      let locationText = (!road && !city && !postcode) 
        ? `📍 Location not available!`
        : `📍 Your Location: ${road}, ${postcode} ${city}`;

      statusBox.innerHTML = `<p data-menu="location">${locationText}</p>`;

      if (nearbyUsers.length) {
        const nearbyHtml = nearbyUsers.map(u => {
          const uName = u.name || 'User';
          const uNick = '@' + u.uniquenick || '@Undefined';
          const uAv = u.profilePictureUrl || '../media/user.webp';
          const uAbout = u.about_me || '👋 Hello there! I\'m a Neirly user!';

          function userDataAttrs(user) {
            return `data-menu="nearby-user-profile location" data-name="${uName}" data-nick="${uNick}"`;
          }

          return `
            <div class="card profile-card" ${userDataAttrs(user)}>
              <div class="profile-card-row">
                <img src="${uAv}" alt="User Profile" ${userDataAttrs(user)} oncontextmenu="return false;">
                <div class="profile-info" ${userDataAttrs(user)} >
                  <h3 class="info-name" ${userDataAttrs(user)} ><i class="fas fa-location-dot" ${userDataAttrs(user)}></i>${uName}</h3>
                  <p class="info-nick" ${userDataAttrs(user)} >${uNick}</p>
                  <p class="info-about" ${userDataAttrs(user)} >${uAbout}</p>
                  <span class="status">Online</span>
                </div>
              </div>
              <div class="profile-actions" ${userDataAttrs(user)} >
                <a href="#friend-list" data-section="profile" ${userDataAttrs(user)} >
                  <button class="cta-button" ${userDataAttrs(user)} >
                    <i class="fas fa-user-plus" ${userDataAttrs(user)} ></i> Add Friend
                  </button>
                </a>
              </div>
            </div>`;
        }).join('');
        statusBox.innerHTML += nearbyHtml;
      } else {
        statusBox.innerHTML += `
          <div class="error-container" data-menu="location">
            <img src="../media/errors/2275514.webp" alt="Not Found" data-menu="location">
            <p data-menu="location">No nearby users found.</p>
          </div>
        `;
      }

    } catch (err) {
      removeLocationSkeleton();
      removeNearbyUsersSkeleton();

      console.error(err);
      statusBox.innerHTML = `
        <div class="error-container" data-menu="location">
          <img src="../media/errors/2210218.webp" alt="Fetch Error" data-menu="location">
          <p data-menu="location">Unable to fetch nearby users.</p>
        </div>`;
    }
  }

  function handleGeoError(err) {
    removeLocationSkeleton();
    removeNearbyUsersSkeleton();

    statusBox.innerHTML = `
      <div class="error-container" data-menu="location">
        <img src="../media/errors/2210217.webp" alt="General Error" data-menu="location">
        <p data-menu="location">Error: ${err.message}.</p>
      </div>`;
  }

  async function initGeolocation() {
    if (!navigator.geolocation) {
      removeLocationSkeleton();
      removeNearbyUsersSkeleton();

      statusBox.innerHTML = `
        <div class="error-container" data-menu="location">
          <img src="../media/errors/2210217.webp" alt="General Error" data-menu="location">
          <p data-menu="location">Geolocation not supported.</p>
        </div>`;
      return;
    }

    navigator.permissions.query({ name: 'geolocation' }).then(result => {
      if (result.state === 'granted' || result.state === 'prompt') {
        navigator.geolocation.getCurrentPosition(updateCoordinatesAndFetch, handleGeoError);
      } else if (result.state === 'denied') {
        removeLocationSkeleton();
        removeNearbyUsersSkeleton();

        statusBox.innerHTML = `
          <div class="error-container" data-menu="location">
            <img src="../media/errors/4052967.webp" alt="Geolocation Disabled" data-menu="location">
            <p data-menu="location">Geolocation is disabled. Please enable permissions in your browser settings.</p>
          </div>`;
      }
    });
  }

  const hasValidCoordinates = 
    user?.location?.coordinates &&
    Array.isArray(user.location.coordinates) &&
    user.location.coordinates.length === 2 &&
    user.location.coordinates[0] !== 0 &&
    user.location.coordinates[1] !== 0;

  if (hasValidCoordinates) {
    updateCoordinatesAndFetch({
      coords: {
        latitude: user.location.coordinates[1],
        longitude: user.location.coordinates[0]
      }
    });
  } else {
    initGeolocation();
  }
}
