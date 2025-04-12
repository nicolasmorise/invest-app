document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");

  // Toggle menu when clicking the hamburger button
  menuToggle.addEventListener("click", function (event) {
    menu.classList.toggle("active");
    event.stopPropagation(); // Prevents click from reaching the document
  });

  // Close menu when clicking anywhere outside of it
  document.addEventListener("click", function (event) {
    if (!menu.contains(event.target) && !menuToggle.contains(event.target)) {
      menu.classList.remove("active");
    }
  });
});

// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
      menuToggle.addEventListener('click', () => {
          const menu = document.querySelector('.menu');
          menu.classList.toggle('active');
      });
  }
});
