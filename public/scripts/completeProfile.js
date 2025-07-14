document.getElementById('complete-profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const birthdate = document.getElementById('birthdate').value;
  const password = document.getElementById('password').value;
  const username = document.getElementById('username').value;
  const uniquenick = document.getElementById('uniquenick').value.trim();
  const wantsUpdates = document.getElementById('wantsUpdates').checked;
  const acceptedTerms = document.getElementById('acceptedTerms').checked;
  const userId = new URLSearchParams(window.location.search).get('userId');
  const errorMsg = document.getElementById('error-msg');

  if (!acceptedTerms) {
    errorMsg.textContent = 'You must accept the policies.';
    return;
  }

  try {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      errorMsg.textContent = 'Password must be at least 8 characters long, contain one uppercase letter and one number.';
      return;
    }

    if (!/^[a-z0-9._]+$/.test(uniquenick)) {
      errorMsg.textContent = 'Nickname can only contain lowercase letters, numbers, underscores, and dots.';
      return;
    }

    const nickCheck = await fetch(`/api/profile/check-nick?nick=${encodeURIComponent(uniquenick)}`);
    const nickData = await nickCheck.json();

    if (nickData.exists) {
      errorMsg.textContent = 'This nickname is already in use. Choose another one.';
      return;
    }

    const res = await fetch('/api/auth/complete-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        birthdate,
        password,
        username,
        uniquenick,
        wantsUpdates,
        acceptedTerms
      })
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = `/main/main.html?name=${encodeURIComponent(username)}`;
    } else {
      errorMsg.textContent = data.message || 'Error while saving.';
    }
  } catch (err) {
    errorMsg.textContent = 'Network error.';
  }
});
