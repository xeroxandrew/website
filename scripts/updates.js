// Updates page: highlight month links based on scroll and smooth-scroll on click.
(function(){
  const links = Array.from(document.querySelectorAll(".months a"));
  const ids = links.map(a => a.getAttribute("href")).filter(Boolean).map(h => h.slice(1));
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);

  function setActive(id){
    links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
  }

  // Smooth scroll
  links.forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if(!href || !href.startsWith("#")) return;
      const id = href.slice(1);
      const el = document.getElementById(id);
      if(!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", href);
      setActive(id);
    });
  });

  // Observe sections
  const obs = new IntersectionObserver((entries) => {
    // pick the entry closest to the top (largest intersection ratio)
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if(visible && visible.target && visible.target.id){
      setActive(visible.target.id);
    }
  }, { rootMargin: "-20% 0px -70% 0px", threshold: [0.05, 0.15, 0.3, 0.6] });

  sections.forEach(s => obs.observe(s));
})();
