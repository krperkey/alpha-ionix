document.addEventListener("DOMContentLoaded", function () {
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const navMenu = document.getElementById("main-nav");

    // Toggle the navigation and toolbar visibility when clicking the hamburger menu
    hamburgerBtn.addEventListener("click", function () {
        navMenu.classList.toggle("active");
    });
});
