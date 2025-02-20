document.getElementById('nav-toggle').addEventListener('click', function() {
    document.getElementById('main-nav').classList.toggle('active');
});

document.getElementById('toolbar-toggle').addEventListener('click', function() {
    document.querySelector('#toolbar ul').classList.toggle('hidden');
});