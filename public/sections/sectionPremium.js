export default async function loadPremiumSection(content, user) {
  document.body.style.background = 'var(--premium-section-bg)';
  document.body.style.animation = 'gradient 10s ease infinite';
  document.body.style.backgroundSize = '400% 400%';
  document.body.style.transition = 'background 0.5s ease-in-out';

  content.style.background = 'transparent';
  content.style.transition = 'background 0.2s ease-in-out';

  let existingCanvas = document.getElementById('bubbles-canvas');
  if (!existingCanvas) {
    const canvas = document.createElement('canvas');
    canvas.id = 'bubbles-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);
  }

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
      <h1>Monthly Plans</h1>
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

    <div class="premium-container">
      <h1>Yearly Plans</h1>
      <div class="pricing-container">
        <div class="pricing-card">
          <h3>Basic</h3>
          <p class="price">€ 5,50/year</p>
          <ul>
            <li>Something 1</li>
            <li>Something 2</li>
            <li>Something 3</li>
          </ul>
          <button>Choose</button>
        </div>

        <div class="pricing-card highlighted">
          <h3>Pro</h3>
          <p class="price"><u>€ 14,99/year</u></p>
          <ul>
            <li>Something 1</li>
            <li>Something 2</li>
            <li>Something 3</li>
          </ul>
          <button>Choose</button>
        </div>

        <div class="pricing-card">
          <h3>Legend</h3>
          <p class="price">€ 29,99/year</p>
          <ul>
            <li>Something 1</li>
            <li>Something 2</li>
            <li>Something 3</li>
          </ul>
          <button>Choose</button>
        </div>

        <div class="pricing-card">
          <h3>Champion</h3>
          <p class="price">€ 49,99/year</p>
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
  
  setupBubblesAnimation();
}

function setupBubblesAnimation() {
  const canvas = document.getElementById('bubbles-canvas');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Bubble {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 100;
      this.radius = 5 + Math.random() * 30;
      this.speed = 0.3 + Math.random() * 1.2; 
      this.alpha = 0.1 + Math.random() * 0.3;
      this.wind = (Math.random() - 0.5) * 0.5;
    }
    update() {
      this.y -= this.speed;
      this.x += this.wind;
      this.alpha -= 0.001; 
      if (this.y + this.radius < 0 || this.alpha <= 0) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      ctx.fill();
    }
  }

  const bubbles = [];
  const maxBubbles = 40;

  for (let i = 0; i < maxBubbles; i++) {
    bubbles.push(new Bubble());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const bubble of bubbles) {
      bubble.update();
      bubble.draw();
    }
    requestAnimationFrame(animate);
  }

  animate();
}