document.getElementById('complete-profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const birthdate = document.getElementById('birthdate').value;
  const username = document.getElementById('username').value;
  const uniquenick = document.getElementById('uniquenick').value.trim();
  const wantsUpdates = document.getElementById('wantsUpdates').checked;
  const acceptedTerms = document.getElementById('acceptedTerms').checked;
  const userId = new URLSearchParams(window.location.search).get('userId');
  const errorMsg = document.getElementById('error-msg');

  errorMsg.textContent = ''; 

  if (!acceptedTerms) {
    errorMsg.textContent = 'You must accept the policies.';
    return;
  }

  if (!/^[a-z0-9._]+$/.test(uniquenick)) {
    errorMsg.textContent = 'Nickname can only contain lowercase letters, numbers, underscores, and dots.';
    return;
  }

 console.log('Checking nickname:', uniquenick);
try {
  const nickCheck = await fetch(`/api/profile/check-nick?nick=${encodeURIComponent(uniquenick)}`);
  console.log('Fetch returned', nickCheck);
  const nickData = await nickCheck.json();
  console.log('Response JSON:', nickData);

    if (!nickData.available) {
      errorMsg.textContent = 'This nickname is already in use. Choose another one.';
      return;
    }

    const res = await fetch('/api/auth/complete-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        birthdate,
        password: ' ',
        username,
        uniquenick,
        wantsUpdates,
        acceptedTerms
      })
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = `/main/main.html`;
    } else {
      errorMsg.textContent = data.message || 'Error while saving.';
    }
  } catch (err) {
    console.error('Fetch error:', err);
    errorMsg.textContent = 'Network error.';
  }
});