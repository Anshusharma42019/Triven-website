// scroll to contact on page load/refresh
window.addEventListener('load', () => {
  setTimeout(() => {
    const contact = document.getElementById('contact');
    if (contact) contact.scrollIntoView({ behavior: 'smooth' });
  }, 300);
});

// intercept all internal anchor clicks for smooth scroll
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = document.querySelector(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth' });
  if (navLinks) navLinks.classList.remove('open');
  if (hamburger) hamburger.querySelector('i').className = 'fas fa-bars';
});

// ===== SCROLL PROGRESS BAR =====
const progressBar = document.getElementById('scroll-progress');

// ===== NAVBAR + BACK TO TOP + PROGRESS (single scroll listener) =====
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');
const navLinks = document.getElementById('navLinks');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  // Progress bar
  if (progressBar) progressBar.style.width = (scrollY / docHeight * 100) + '%';

  // Navbar shrink
  navbar.classList.toggle('scrolled', scrollY > 50);

  // Back to top
  if (backToTop) backToTop.classList.toggle('visible', scrollY > 400);
}, { passive: true });

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.querySelector('i').className = navLinks.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.querySelector('i').className = 'fas fa-bars';
    });
  });
}

// ===== HERO IMAGE SLIDESHOW =====
const heroImgs = document.querySelectorAll('.hero-img');
if (heroImgs.length) {
  let heroIdx = 0;
  setInterval(() => {
    heroImgs[heroIdx].classList.remove('active');
    heroIdx = (heroIdx + 1) % heroImgs.length;
    heroImgs[heroIdx].classList.add('active');
  }, 4000);
}

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.benefit-card, .product-card, .stat, .review-card, .consult-left, .consult-form-box, .about-story-grid, .contact-info, .contact-form'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ===== COUNTER ANIMATION =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.target;
    const step = target / (2000 / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 16);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// ===== TESTIMONIAL SLIDER =====
const track = document.getElementById('testimonialTrack');
if (track) {
  const cards = track.querySelectorAll('.testimonial-card');
  const dotsContainer = document.getElementById('dots');
  let current = 0;
  let autoSlide;

  cards.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  document.getElementById('prevBtn').addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  document.getElementById('nextBtn').addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  function resetAuto() { clearInterval(autoSlide); autoSlide = setInterval(() => goTo(current + 1), 5000); }
  resetAuto();
}

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const success = document.getElementById('formSuccess');
    const error = document.getElementById('formError');
    try {
      const res = await fetch('https://backend-triven-crm.vercel.app/api/v1/leads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('leadName').value,
          phone: document.getElementById('leadPhone').value,
          problem: document.getElementById('leadProblem').value
        })
      });
      if (!res.ok) throw new Error();
      success?.classList.add('show');
      if (error) error.style.display = 'none';
      e.target.reset();
      setTimeout(() => success?.classList.remove('show'), 4000);
    } catch {
      if (error) error.style.display = 'block';
      setTimeout(() => { if (error) error.style.display = 'none'; }, 4000);
    }
  });
}
