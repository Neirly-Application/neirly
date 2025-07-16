export default async function loadMapScreenSection(content, user) {
  content.innerHTML = `
    <div class="case-header">
      <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link">
        <i class="fas fa-arrow-left"></i>
      </a>
      <h2><i class="fas fa-map-marker-alt"></i> Map</h2>
    </div>

    <div id="map" class="map-container">
      <div id="map-loader" class="map-loader">Loading map...</div>
    </div>
    
    <button id="btn-center-map"><i class="fas fa-crosshairs"></i> Center Map</button>
  `;

  const loader = document.getElementById('map-loader');
  const mapContainer = document.getElementById('map');
  loader.style.display = 'flex';
  mapContainer.style.display = 'block';

  let map, userMarker, userCoords;

  async function fetchUserProfile() {
    try {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch user profile');
      return await res.json();
    } catch (err) {
      console.error('[User Profile Fetch Error]', err);
      return null;
    }
  }

  function createProfileIcon(url) {
    return L.icon({
      iconUrl: url,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -50],
      className: 'user-map-icon',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      shadowSize: [41, 41],
      shadowAnchor: [12, 41],
    });
  }

  function initializeMap(latitude, longitude, profileImgUrl, nickname) {
    loader.style.display = 'none';

    map = L.map('map', {
      center: [latitude, longitude],
      zoom: 18,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: false
    });

    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const esriLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/' +
      'World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    });

    const baseLayers = {
      "Street Map": osmLayer,
      "Satellite": esriLayer
    };
    L.control.layers(baseLayers).addTo(map);
    L.control.scale({ imperial: false }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);

    const profileIcon = createProfileIcon(profileImgUrl);

    userMarker = L.marker([latitude, longitude], { icon: profileIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align:center;">
          <img src="${profileImgUrl}" alt="Profile" style="width: 40px; height:40px; border-radius:50%; border:2px solid #333; box-shadow: 0 0 5px rgba(0,0,0,0.3); margin-bottom:5px;" oncontextmenu="return false;">
          <h4>${nickname}</h4>
          <a href="#" id="wrong-pos">Wrong Position?</a>
        </div>
      `, {className: 'pos-popup'})
      .openPopup();

    userCoords = [latitude, longitude];

    // ** Qui disabilitiamo il pull-to-refresh durante l’interazione con la mappa **
    map.on('dragstart', () => {
      window.disablePullToRefresh = true;
    });

    map.on('dragend', () => {
      window.disablePullToRefresh = false;
    });

    map.on('zoomstart', () => {
      window.disablePullToRefresh = true;
    });

    map.on('zoomend', () => {
      window.disablePullToRefresh = false;
    });
  }

  function updateUserLocation(position, profileImgUrl, nickname) {
    const { latitude, longitude } = position.coords;
    userCoords = [latitude, longitude];
    if (userMarker) {
      userMarker.setLatLng(userCoords);
      userMarker.setPopupContent(`
        <div style="text-align:center;">
          <img src="${profileImgUrl}" alt="Profile" style="width: 40px; height: 40px; border-radius:50%; border:2px solid #333; box-shadow: 0 0 5px rgba(0,0,0,0.3); margin-bottom:5px;" oncontextmenu="return false;">
          <h4>${nickname}</h4>
          <a href="#wrong-pos">Wrong Position?</a>
        </div>
      `);
      userMarker.openPopup();
    } else {
      userMarker = L.marker(userCoords, { icon: createProfileIcon(profileImgUrl) }).addTo(map);
    }
    map.setView(userCoords, 14);
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
      const user = await fetchUserProfile();
      const profileImgUrl = user?.profilePictureUrl?.trim()
        ? user.profilePictureUrl
        : '../media/user.png';
      const nickname = user?.nickname || "You're here!";

      setTimeout(() => {
        initializeMap(position.coords.latitude, position.coords.longitude, profileImgUrl, nickname);
      }, 1000);
    }, () => {
      loader.innerHTML = "Permission denied or location unavailable.";
    });
  } else {
    loader.innerHTML = "Geolocation not supported.";
  }

  document.addEventListener('click', e => {
    if (e.target.id === 'btn-center-map') {
      if (map && userCoords) {
        map.setView(userCoords, 18);
      }
    }
  });
}
