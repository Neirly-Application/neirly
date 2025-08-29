import { stopBGAnimation, stopBubblesAnimation } from '../scripts/premiumBg.js';

export default async function loadUserProfileSection(content) {
    stopBubblesAnimation();
    stopBGAnimation();

    document.body.style.background = '';
    document.body.style.animation = '';
    document.body.style.backgroundSize = '';
    document.body.style.transition = 'background 0.3s ease-in-out';

    content.style.all = '';
    content.style.transition = 'background 0.3s ease-in-out';
    
    const hash = window.location.hash.substring(1);
    let username = null;

    if (hash.includes('?')) {
        const [section, query] = hash.split('?');
        const params = new URLSearchParams(query);
        username = params.get('uniquenick');
    } else {
        username = hash.split('/')[1];
    }

    if (!username) {
        content.innerHTML = `<p>Utente non trovato.</p>`;
        return;
    }

    // Mock di dati, sostituire con fetch reale se disponibile
    const profileData = {
        username: username,
        age: 25,
        bio: "Sono un utente molto silenzioso 😎",
        avatar: "/images/default-avatar.png"
    };

    content.innerHTML = `
        <div class="profile-card">
            <img src="${profileData.avatar}" alt="Avatar di ${profileData.username}" class="profile-avatar">
            <h1>${profileData.username}</h1>
            <p>Età: ${profileData.age}</p>
            <p>Bio: ${profileData.bio}</p>
        </div>
    `;

    // Back button
    const backLink = document.createElement('a');
    backLink.className = 'back-arrow-link';
    backLink.innerHTML = '<i class="fas fa-arrow-left"></i>';
    backLink.addEventListener('click', () => {
        if (window.history.length > 1) history.back();
        else window.location.href = '/main.html#home';
    });
    content.prepend(backLink);
}
