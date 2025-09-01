import { showToast, customConfirm } from '../scripts/notification.js';
import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadNearYouSection(content, user) {
  stopBubblesAnimation();
  stopBGAnimation();

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

  const avatar = user?.profilePictureUrl || '../media/user.webp';
  const username = user?.name || 'User';
  const nickname = user?.uniquenick ? `@${user.uniquenick}` : 'Undefined';
  const about = user?.about_me || '"About me"';

  function myDataAttrs(my) {
    return `data-menu="profile location"`;
  }

  content.innerHTML = `
    <h2><i class="fas fa-broadcast-tower"></i> Near you</h2>

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
      <div id="location-status" class="text-middlepage-info">
        <p>📍 Loading location...</p>
      </div>
  `;

  const statusBox = document.getElementById("location-status");

  async function updateCoordinatesAndFetch(position) {
    const { latitude: lat, longitude: lng } = position.coords;

    try {
      await fetch('/api/set-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      });

      const data = await fetch(`/api/near-me`).then(r => r.json());
      const nearbyUsers = data.nearby || [];
      const { road = '', city = '', postcode = '' } = data.address || {};

      let locationText = (!road && !city && !postcode) 
        ? `
          📍 Location not available!
        `
        : `
          📍 Your Location: ${road}, ${postcode} ${city}
        `;

      statusBox.innerHTML = `
          <p>${locationText}</p>
          <!-- <p><small><a href="#settings-location">Wrong Position?</a></small></p> -->
      `;

      if (nearbyUsers.length) {
        const nearbyHtml = nearbyUsers.map(u => {
          const uName = u.name || 'User';
          const uNick = '@' + u.uniquenick || '@' + 'Undefined';
          const uAv = u.profilePictureUrl || '../media/user.webp';
          const uAbout= u.about_me || '👋 Hello there! I\'m a Neirly user!';

          function userDataAttrs(user) {
            return `data-menu="nearby-user-profile" data-name="${uName}" data-nick="${uNick}"`;
          }

          return `
              <div class="card profile-card" ${userDataAttrs(user)}>
                <div class="profile-card-row">
                  <img src="${uAv}" alt="User Profile" ${userDataAttrs(user)} oncontextmenu="return false;">
                  <div class="profile-info" ${userDataAttrs(user)} >
                    <h3 class="info-name" ${userDataAttrs(user)} >${uName}</h3>
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
          <div class="error">
            <img src="../media/errors/2275514.webp" alt="Not Found">
            <p>No nearby users found.</p>
          </div>
          `;
      }

    } catch (err) {
      console.error(err);
      statusBox.innerHTML = `
          <div class="error">
            <img src="../media/errors/2210218.webp" alt="Fetch Error">
            <p>Unable to fetch nearby users.</p>
          </div>`;
    }
  }

  function handleGeoError(err) {
    statusBox.innerHTML = `
          <div class="error">
            <img src="../media/errors/2210217.webp" alt="General Error">
            <p>Error: ${err.message}.</p>
          </div>`;
  }

  async function initGeolocation() {
    if (!navigator.geolocation) {
      statusBox.innerHTML = `
          <div class="error">
            <img src="../media/errors/2210217.webp" alt="General Error">
            <p>Geolocation not supported.</p>
          </div>`;
      return;
    }

    navigator.permissions.query({ name: 'geolocation' }).then(result => {
      if (result.state === 'granted' || result.state === 'prompt') {
        navigator.geolocation.getCurrentPosition(updateCoordinatesAndFetch, handleGeoError);
      } else if (result.state === 'denied') {
        statusBox.innerHTML = `
          <div class="error">
            <img src="../media/errors/4052967.webp" alt="Geolocation Disabled">
            <p>Geolocation is disabled. Please enable permissions in your browser settings.</p>
          </div>`;
      }
    });
  }

  const hasValidCoordinates = user?.location?.coordinates &&
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
