import { startBGAnimation } from '../scripts/premiumBg.js';

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
      <div class="case-header premium-header" style="color: var(--accent); align-items: center; justify-content: center;
        text-shadow:
          -1px -1px 0 var(--premium-color-bg-card),
           1px -1px 0 var(--premium-color-bg-card),
          -1px  1px 0 var(--premium-color-bg-card),
           1px  1px 0 var(--premium-color-bg-card);
      ">
        <h1><i class="fas fa-crown"></i> Premium</h1>
      </div>

      <div class="premium-wrapper">
        <div class="premium-user-card">
        <div class="light-effect"></div>
          <div class="premium-user-card-img">
            <img src="${user.profilePictureUrl || '../media/user.png'}" alt="User Avatar" oncontextmenu="return false;">
          </div>
          <div class="premium-user-card-info">
            <h2>${user.nickname || user.name || 'User'}</h2>
            <p><span>Biography:</span>${user.about_me || '<i>No biography</i>'}</p>
            <div class="premium-fancy-line-2"></div>
            <p><strong>One year of Neirly Premium?</strong></p>
            <p>Redeem this card now, and it'll be delivered <strong>straight</strong> to your door!<br>
                What's on offer?<br>
                Here you'll find the new offers and surprises perfect for you!<br>
                You can get a vacation, cash, things you love, and much more!</p>
          </div>
        </div>
      </div>

      <div class="premium-container">
        <h1 style="text-shadow:
          -1px -1px 0 var(--premium-color-bg-card),
           1px -1px 0 var(--premium-color-highlighted-bg),
          -1px 1px 0 var(--premium-color-highlighted-bg),
           1px 1px 0 var(--premium-color-highlighted-bg);">
          Monthly Plans
        </h1>
        <div class="pricing-container">
          <div class="pricing-card"><h3>Basic</h3><p class="price">€ 5,50/mo</p><ul><li>Something 1</li><li>Something 2</li><li>Something 3</li></ul><button>Choose</button></div>
          <div class="pricing-card highlighted"><h3>Pro</h3><p class="price"><u>€ 14,99/mo</u></p><ul><li>Something 1</li><li>Something 2</li><li>Something 3</li></ul><button>Choose</button></div>
          <div class="pricing-card"><h3>Legend</h3><p class="price">€ 29,99/mo</p><ul><li>Something 1</li><li>Something 2</li><li>Something 3</li></ul><button>Choose</button></div>
          <div class="pricing-card"><h3>Champion</h3><p class="price">€ 49,99/mo</p><ul><li>Something 1</li><li>Something 2</li><li>Something 3</li></ul><button>Choose</button></div>
        </div>
      </div>

      <div class="premium-container">
        <h1 style="text-shadow:
          -1px -1px 0 var(--premium-color-bg-card),
           1px -1px 0 var(--premium-color-highlighted-bg),
          -1px 1px 0 var(--premium-color-highlighted-bg),
           1px 1px 0 var(--premium-color-highlighted-bg);">
          Yearly Plans
        </h1>
        <div class="pricing-container">
          <div class="pricing-card"><h3>Basic</h3><p class="price">€ 5,50/year</p><ul><li>Something 1</li><li>Something 2</li><li>Something 3</li></ul><button>Choose</button></div>
          <div class="pricing-card highlighted"><h3>Pro</h3><p class="price"><u>€ 14,99/year</u></p><ul><li>Something 1</li><li>Something 2</li><li>Something 3</li></ul><button>Choose</button></div>
          <div class="pricing-card"><h3>Legend</h3><p class="price">€ 29,99/year</p><ul><li>Something 1</li><li>Something 2</li><li>Something 3</li></ul><button>Choose</button></div>
          <div class="pricing-card"><h3>Champion</h3><p class="price">€ 49,99/year</p><ul><li>Something 1</li><li>Something 2</li><li>Something 3</li></ul><button>Choose</button></div>
        </div>
      </div>
    </div>
  `;

  animateCards(content);
  setupBubblesAnimation();
  startBGAnimation();

const card = content.querySelector('.premium-user-card');
if (!card) return;

const light = card.querySelector('.light-effect');

card.style.transition = 'transform 0.2s ease';
card.style.transformStyle = 'preserve-3d';
card.style.willChange = 'transform';

let angle = 0;

function animateCard() {
  const rotateX = Math.sin(angle * 1.5) * 6;
  const rotateY = Math.cos(angle) * 12;

  card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

  if (light) {
    const percentX = 50 - rotateY * 2; 
    const percentY = 50 + rotateX * 2; 

    light.style.transform = `translate(-50%, -50%) translate(${percentX - 50}%, ${percentY - 50}%)`;
    light.style.opacity = '1';
  }

  angle += 0.015;
  requestAnimationFrame(animateCard);
}

animateCard();

function animateCards(content) {
  const pricingCards = content.querySelectorAll('.pricing-card');
  pricingCards.forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('visible');
    }, index * 200);
  });
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
}