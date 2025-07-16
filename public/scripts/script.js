const toggleBtn = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const overlay = document.querySelector('.overlay');

function openMenu() {
navLinks.classList.add('show');
overlay.classList.add('active');
toggleBtn.setAttribute("aria-expanded", "true");
}

function closeMenu() {
navLinks.classList.remove('show');
overlay.classList.remove('active');
toggleBtn.setAttribute("aria-expanded", "false");
}

toggleBtn.addEventListener('click', () => {
if (navLinks.classList.contains('show')) {
    closeMenu();
} else {
    openMenu();
}
});

overlay.addEventListener('click', () => {
closeMenu();
});

document.querySelectorAll('.nav-links a').forEach(link => {
link.addEventListener('click', () => {
    closeMenu();
});
});


document.addEventListener('contextmenu', event => event.preventDefault());

document.addEventListener('keydown', function (event) {
if (
    event.key === 'F12' ||
    (event.ctrlKey && event.shiftKey && ['I', 'C', 'J'].includes(event.key)) ||
    (event.ctrlKey && ['U', 'S'].includes(event.key))
) {
    event.preventDefault();
}
});
