// Add a shadow to the navbar when the user scrolls, and change its background
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled'); // Add a class to apply new styles
    } else {
        navbar.classList.remove('scrolled');
    }
});