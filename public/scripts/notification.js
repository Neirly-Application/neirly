function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('custom-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.title = 'Oop... wait a second...';
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
    title.textContent = 'Oop... wait a second...';

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
}

export function customPopup({ 
  title = '', 
  description = '', 
  yesText = 'Save', 
  noText = 'Cancel' 
} = {}) {
  return new Promise((resolve) => {
    const existing = document.querySelector('.unsaved-notification');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'unsaved-notification';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.gap = '10px';
    overlay.style.position = 'fixed';
    overlay.style.top = '20px';
    overlay.style.left = '50%';
    overlay.style.transform = 'translateX(-50%)';
    overlay.style.background = '#fff';
    overlay.style.padding = '15px 25px';
    overlay.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    overlay.style.borderRadius = '6px';
    overlay.style.zIndex = 9999;
    overlay.style.minWidth = '300px';
    overlay.style.fontFamily = 'Arial, sans-serif';

    if (title) {
      const titleElem = document.createElement('strong');
      titleElem.textContent = title;
      titleElem.style.marginRight = '10px';
      overlay.appendChild(titleElem);
    }

    const descSpan = document.createElement('span');
    descSpan.textContent = description;
    overlay.appendChild(descSpan);

    const noBtn = document.createElement('button');
    noBtn.className = 'btn-cancel';
    noBtn.textContent = noText;
    noBtn.style.marginLeft = 'auto'; 
    noBtn.onclick = () => {
      document.body.removeChild(overlay);
      resolve(false);
    };

    const yesBtn = document.createElement('button');
    yesBtn.className = 'btn-submit';
    yesBtn.textContent = yesText;
    yesBtn.onclick = () => {
      document.body.removeChild(overlay);
      resolve(true);
    };

    overlay.appendChild(noBtn);
    overlay.appendChild(yesBtn);

    document.body.appendChild(overlay);
  });
}