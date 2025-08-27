import { showToast } from './notification.js';

(async () => {
  try {
    const res = await fetch('/api/profile', { credentials: 'include' });
    if (res.ok) {
      const user = await res.json();
      if (user && user.id) {
        if (!user.profileCompleted) {
          window.location.href = `/main/complete-profile.html`;
        } else {
          window.location.href = `/main/app.html`;
        }
        return;
      }
    }
  } catch (err) {
    console.error('Error checking session:', err);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let data;
      try {
        data = await res.json();
      } catch {
        return showToast('Server returned invalid response.', 'error');
      }

      if (res.ok) {
        showToast(data.message, 'info');

        setTimeout(() => {
          if (!data.user.profileCompleted) {
            window.location.href = `/main/complete-profile.html`;
          } else {
            window.location.href = data.redirectUrl || `/main/app.html`;
          }
        }, 1000);
      } else {
        showToast(data.message || 'Invalid credentials.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    }
  });
});