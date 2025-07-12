import { showNotification } from './notifications.js';

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password-register').value;
  const confirm = document.getElementById('password-repeat').value;

  if (password !== confirm) {
    showToast('The passwords do not match.', 'error');
    return;
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast(data.message, 'success');
      setTimeout(() => window.location.href = '/src/login.html', 1500);
    } else {
      showToast(data.message || 'Error while registering.', 'error');
    }
  } catch (err) {
    showToast('Network error.', 'error');
  }
});
