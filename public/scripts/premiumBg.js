let angle = 0;
let rafId = null;
const section = document.documentElement;

function animate() {
  angle = (angle + 0.5) % 360;
  const newGradient = `linear-gradient(${angle}deg, #161000, #30260a, #685421, #b29b62, #685421, #30260a, #161000)`;
  section.style.setProperty('--premium-section-bg', newGradient);
  rafId = requestAnimationFrame(animate);
}

export function startBGAnimation() {
  if (!rafId) animate();
}

export function stopBGAnimation() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}