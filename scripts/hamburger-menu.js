document.addEventListener("DOMContentLoaded", function () {
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const navMenu = document.getElementById("main-nav");
    const toolbar = document.getElementById("toolbar");
    const asideLayout = document.getElementById("aside-layout"); // Everything below toolbar

    // Toggle the navigation and move everything down
    hamburgerBtn.addEventListener("click", function () {
        if (navMenu.classList.contains("active")) {
            navMenu.classList.remove("active");
            toolbar.style.marginTop = "0"; // Reset toolbar position
            asideLayout.style.marginTop = "0"; // Reset everything below
        } else {
            navMenu.classList.add("active");
            const navHeight = navMenu.scrollHeight; // Get the actual height of the nav menu
            toolbar.style.marginTop = `${navHeight}px`; // Move toolbar down
            asideLayout.style.marginTop = `${navHeight}px`; // Move everything else down
        }
    });
});

