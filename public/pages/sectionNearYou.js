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
  const username = user?.name || 'Username';
  const nickname = user?.uniquenick ? `@${user.uniquenick}` : '@uniquenick';
  const about = user?.about_me || '"About me"';

  content.innerHTML = `
    <h2><i class="fas fa-broadcast-tower"></i> Near you</h2>

    <div class="card profile-card" data-menu="profile">
      <img src="${avatar}" alt="User Profile" data-menu="profile" oncontextmenu="return false;">
      <div class="profile-info" data-menu="profile" >
        <h3 class="info-name" data-menu="profile" >${username}</h3>
        <p class="info-nick" data-menu="profile" >${nickname}</p>
        <p class="info-about" data-menu="profile" >${about}</p>
        <span class="status">Online</span>
      </div>
      <div class="profile-actions" data-menu="profile" >

      <a href="#profile" data-section="profile" data-menu="profile" >
        <button class="view-btn" data-menu="profile" >
          <i class="fas fa-pen" data-menu="profile" ></i> <span data-menu="profile" >Edit Profile</span>
        </button>
      </a>
      <a href="settings-location" data-menu="location" >
        <button class="settings-btn" data-menu="location" >
          <i class="fas fa-cog"></i> <span data-menu="location" >Location Settings</span>
        </button>
      </a>
      </div>
    </div>
    
    <div class="fancy-line"></div>
  `;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      const mapPreview = L.map('preview-map', {
        center: [latitude, longitude],
        zoom: 20,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
        attributionControl: false,
      });

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/' +
        'World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri'
      }).addTo(mapPreview);

      const icon = L.icon({
        iconUrl: avatar,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        className: 'user-map-icon',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.webp',
        shadowSize: [41, 41],
        shadowAnchor: [12, 41],
      });

      L.marker([latitude, longitude], { icon }).addTo(mapPreview);

      setTimeout(() => {
        mapPreview.invalidateSize();
      }, 100);
    });
  }

  
};