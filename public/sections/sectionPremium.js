export default async function loadPremiumSection(content, user) {
  document.body.style.background = 'var(--premium-section-bg)';
  document.body.style.animation = 'gradient 10s ease infinite';
  document.body.style.backgroundSize = '400% 400%';
  document.body.style.transition = 'background 0.5s ease-in-out';

  content.style.background = 'transparent';
  content.style.transition = 'background 0.2s ease-in-out';

  content.innerHTML = `
    <div class="premium-section">
      <div class="case-header premium-header" style="color: var(--premium-text-color-accent); align-items: center; justify-content: center;
                text-shadow:
                  0 0 20px var(--premium-text-shadow-1),
                  0 0 20px var(--premium-text-shadow-2),
                  0 0 20px var(--premium-text-shadow-3),
                  5px 5px 6px var(--color-rgba-000-02);
                  ">
        <a onclick="window.history.length > 1 ? history.back() : window.location.href = '/main.html#map'" class="back-arrow-link" style="color: var(--premium-text-color-accent)"><i class="fas fa-arrow-left"></i></a>
        <h1><i class="fas fa-crown"></i> Premium</h1>
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
