const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });
}

const counters = document.querySelectorAll("[data-count]");

const animateCounter = (element) => {
  const target = Number(element.dataset.count);
  const duration = 1200;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.floor(progress * target);

    element.textContent = value;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = `${target}`;
    }
  };

  requestAnimationFrame(tick);
};

const options = {
  threshold: 0.35
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const element = entry.target;
      if (!element.dataset.animated) {
        animateCounter(element);
        element.dataset.animated = "true";
      }
    }
  });
}, options);

counters.forEach((counter) => {
  observer.observe(counter);
});
