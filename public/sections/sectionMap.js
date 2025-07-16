export default async function loadMapSection(content, user) {
  const avatar = user?.profilePictureUrl || '../media/user.png';
  const username = user?.name || 'Username';
  const nickname = user?.uniquenick ? `@${user.uniquenick}` : '@uniquenick';
  const about = user?.about_me || '"About me"';

  content.innerHTML = `
    <h2><i class="fas fa-map"></i> Map</h2>
    <div class="card map-card" style="position: relative; overflow: hidden;">
      <div id="preview-map"></div>
    </div>

    <a href="#map-screen" class="btn map-button">
      <i class="fas fa-location-arrow"></i> Go to Map
    </a>

    <div class="fancy-line"></div>

    <div class="card profile-card">
      <img src="${avatar}" alt="User Profile" oncontextmenu="return false;">
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

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      const mapPreview = L.map('preview-map', {
        center: [latitude, longitude],
        zoom: 15,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
        attributionControl: false,
      });

      // Modalità satellite
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/' +
        'World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles © Esri'
      }).addTo(mapPreview);

      // 👤 Avatar come marker
      const icon = L.icon({
        iconUrl: avatar,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        className: 'user-map-icon',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        shadowSize: [41, 41],
        shadowAnchor: [12, 41],
      });

      L.marker([latitude, longitude], { icon }).addTo(mapPreview);

      setTimeout(() => {
        mapPreview.invalidateSize();
      }, 100);
    });
  }
}
