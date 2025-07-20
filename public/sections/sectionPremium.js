export default async function loadPremiumSection(content, user) {
  document.body.style.background = 'var(--premium-section-bg)';
  document.body.style.transition = 'background 0.5s ease-in-out';

  content.style.background = 'transparent';
  content.style.transition = 'background 0.2s ease-in-out';

  content.innerHTML = `
    <div class="premium-section">
      <div class="case-header premium-header" style="align-items: center; justify-content: center;">
      <h2 style="font-size: 3rem;"><i class="fas fa-crown"></i> Premium</h2>
    </div>

    
    <div class="premium-container">
      <div class="pricing-container">
        <div class="pricing-card">
          <h3>Basic</h3>
          <p class="price">€ 5,50/mo</p>
          <ul>
            <li>Something 1</li>
            <li>Something 2</li>
            <li>Something 3</li>
          </ul>
          <button>Choose</button>
        </div>

        <div class="pricing-card highlighted">
          <h3>Pro</h3>
          <p class="price"><u>€ 14,99/mo</u></p>
          <ul>
            <li>Something 1</li>
            <li>Something 2</li>
            <li>Something 3</li>
          </ul>
          <button>Choose</button>
        </div>

        <div class="pricing-card">
          <h3>Legend</h3>
          <p class="price">€ 29,99/mo</p>
          <ul>
            <li>Something 1</li>
            <li>Something 2</li>
            <li>Something 3</li>
          </ul>
          <button>Choose</button>
        </div>

        <div class="pricing-card">
          <h3>Champion</h3>
          <p class="price">€ 49,99/mo</p>
          <ul>
            <li>Something 1</li>
            <li>Something 2</li>
            <li>Something 3</li>
          </ul>
          <button>Choose</button>
        </div>
      </div>
    </div>
  `;
}
