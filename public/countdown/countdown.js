function pad(n){return String(n).padStart(2,'0');}

function updateElement(id, newValue) {
    const el = document.getElementById(id);
    if(el.textContent !== newValue){
    el.textContent = newValue;
    el.classList.remove('change');
    void el.offsetWidth; 
    el.classList.add('change');
    }
}

function updateCountdown(){
    const now = new Date();
    const target = new Date(now.getFullYear(), 10, 1, 0, 0, 0);
    if(now > target){
    target.setFullYear(target.getFullYear() + 1);
    }
    const diff = target - now;

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    updateElement('days', pad(days));
    updateElement('hours', pad(hours));
    updateElement('minutes', pad(minutes));
    updateElement('seconds', pad(seconds));
}

setInterval(updateCountdown,1000);
updateCountdown();