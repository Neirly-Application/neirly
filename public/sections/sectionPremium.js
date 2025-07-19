export default async function loadPremiumSection(content, user) {
  document.body.style.background = 'var(--premium-section-bg)';
  document.body.style.transition = 'background 0.5s ease-in-out';

  content.style.background = 'transparent';
  content.style.transition = 'background 0.2s ease-in-out';

  content.innerHTML = `
    <div class="premium-section">
      <div class="case-header premium-header" style="align-items: center; justify-content: center;">
      <h2 style="font-size: 3rem;"><i class="fas fa-crown"></i> Premium</h2>
    </div>`;
}
