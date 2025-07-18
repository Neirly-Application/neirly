import { showToast } from './notification.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
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
  
      const data = await res.json();
  
      if (res.ok) {
        showToast(data.message, 'info');
  
        if (!data.user.profileCompleted) {
          setTimeout(() => {
            window.location.href = `/main/complete-profile.html?userId=${data.user.id}`;
          }, 1000);
        } else {
          setTimeout(() => {
            window.location.href = `/main/main.html?name=${encodeURIComponent(data.user.name || 'User')}`;
          }, 1000);
        }
      } else {
        showToast(data.message || 'Invalid credentials.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    }
  });
});
