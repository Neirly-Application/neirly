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