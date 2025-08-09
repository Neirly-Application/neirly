function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('custom-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.title = 'Wait a second...';
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, duration);
}

function customConfirm(message) {
  return new Promise((resolve) => {
    const existing = document.querySelector('.confirm-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';

    const box = document.createElement('div');
    box.className = 'confirm-box';

    const header = document.createElement('div');
    header.className = 'confirm-header';

    const img = document.createElement('img');
    img.src = '../media/handstop.png';
    img.alt = 'Alert Icon';
    img.className = 'confirm-icon';

    const title = document.createElement('h2');
    title.textContent = 'Wait a second...';

    header.appendChild(img);
    header.appendChild(title);

    const text = document.createElement('p');
    text.textContent = message;

    const buttons = document.createElement('div');
    buttons.className = 'confirm-buttons';

    const yesBtn = document.createElement('button');
    yesBtn.textContent = 'Yes, proceed!';
    yesBtn.className = 'btn-confirm yes';

    const noBtn = document.createElement('button');
    noBtn.textContent = 'No, dismiss!';
    noBtn.className = 'btn-confirm no';

    yesBtn.onclick = () => {
      document.body.removeChild(overlay);
      resolve(true);
    };

    noBtn.onclick = () => {
      document.body.removeChild(overlay);
      resolve(false);
    };

    buttons.appendChild(yesBtn);
    buttons.appendChild(noBtn);

    box.appendChild(header);
    box.appendChild(text);
    box.appendChild(buttons);

    overlay.appendChild(box);
    document.body.appendChild(overlay);
  });
};

export { showToast, customConfirm };