const sectionContainers = document.getElementsByClassName("section-container");

// On scroll, check which section container is in view
// Set the corresponding nav item to active
window.addEventListener('scroll', function(ev) {
  // Check distance from viewport top of each sectoin container
  Array.from(sectionContainers).forEach(e => {
    const distTop = e.getBoundingClientRect().top;
    if (distTop > 0 && distTop < window.innerHeight/2) {
      // Unset active status from nav elements
      const navItems = document.getElementsByClassName("nav-item"); 
      Array.from(navItems).forEach(n => n.classList.remove("active"))

      // Set active status
      const activeItem = e.getAttribute("id")
      const activeNav = document.getElementById(`l-${activeItem}`);
      activeNav.classList.add("active")
      //window.location.hash = `#${activeItem}`;
    }
  })
});
