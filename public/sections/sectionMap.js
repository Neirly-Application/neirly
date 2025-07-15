export default async function loadMapSection(content, user) {
content.innerHTML = `
            <h2><i class="fas fa-map"></i> Map</h2>
            <div class="card map-card">
              <a href="#map-screen" class="btn map-button"><i class="fas fa-location-arrow"></i> Go to Map</a>
            </div>

            <div class="fancy-line"></div>

            <div class="card profile-card">
              <img src="../media/user.png" alt="User Profile">
              <div class="profile-info">
                <h3>Username</h3>
                <p>@uniquenick</p>
                <p>"About me"</p>
                <span class="status">Online</span>
              </div>
              <div class="profile-actions">
                <button class="view-btn"><i class="fas fa-user"></i> <span>View Profile</span></button>
                <button class="request-btn"><i class="fas fa-user-plus"></i> <span>Add as Friend</span></button>
              </div>
            </div>
          `;
}