// ===== SCROLL PROGRESS BAR =====
const progressBar = document.getElementById('scroll-progress');

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;

  // Progress bar
  if (progressBar) progressBar.style.width = (scrollY / docHeight * 100) + '%';

  // Navbar glass effect
  if (navbar) navbar.classList.toggle('scrolled', scrollY > 60);

  // Back to top
  if (backToTop) backToTop.classList.toggle('visible', scrollY > 500);
}, { passive: true });

// ===== HAMBURGER (new 3-bar design) =====
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
    });
  });
}

// ===== SMOOTH SCROLL for anchor links =====
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id === '#') return;
  const target = document.querySelector(id);
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth' });
  if (navLinks) navLinks.classList.remove('open');
  if (hamburger) hamburger.classList.remove('open');
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 90);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
  revealObserver.observe(el);
});

// ===== HERO IMAGE SLIDESHOW =====
const heroImgs = document.querySelectorAll('.hero-img');
if (heroImgs.length > 1) {
  let heroIdx = 0;
  setInterval(() => {
    heroImgs[heroIdx].classList.remove('active');
    heroIdx = (heroIdx + 1) % heroImgs.length;
    heroImgs[heroIdx].classList.add('active');
  }, 4500);
}

// ===== COUNTER ANIMATION =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.target;
    const step = target / (1800 / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current).toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 16);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.4 });
document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// ===== TESTIMONIAL SLIDER =====
const track = document.getElementById('testimonialTrack');
if (track) {
  const cards = track.querySelectorAll('.testimonial-card');
  const dotsContainer = document.getElementById('dots');
  let current = 0;
  let autoSlide;

  if (dotsContainer) {
    cards.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsContainer.appendChild(dot);
    });
  }

  function goTo(index) {
    current = (index + cards.length) % cards.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }
  }

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  function resetAuto() {
    clearInterval(autoSlide);
    autoSlide = setInterval(() => goTo(current + 1), 5000);
  }
  resetAuto();

  // Touch/swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); resetAuto(); }
  });
}

// ===== CONTACT FORM =====
const API_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api/v1/leads/submit' 
  : 'https://backend-triven-crm.vercel.app/api/v1/leads/submit';

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const success = document.getElementById('formSuccess');
    const error = document.getElementById('formError');
    const btn = contactForm.querySelector('button[type="submit"]');
    
    if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('leadName').value,
          phone: document.getElementById('leadPhone').value,
          problem: document.getElementById('leadProblem').value
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Server returned an error');
      }
      if (success) success.classList.add('show');
      if (error) error.style.display = 'none';
      e.target.reset();
      setTimeout(() => { if (success) success.classList.remove('show'); }, 5000);
    } catch (err) {
      if (error) {
        error.textContent = '❌ Error: ' + err.message + ' (Check CORS or Network)';
        error.style.display = 'block';
      } else {
        alert("Error sending message: " + err.message);
      }
      setTimeout(() => { if (error) error.style.display = 'none'; }, 6000);
    } finally {
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    }
  });
}

// ===== AUTO POPUP MODAL ON LOAD =====
window.addEventListener('load', () => {
  const modal = document.getElementById('leadModal');
  const closeModal = document.getElementById('closeModal');
  
  if (modal) {
    // Show modal after 1.5 seconds
    setTimeout(() => {
      modal.classList.add('show');
    }, 1500);

    // Close button logic
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        modal.classList.remove('show');
      });
    }

    // Close when clicking outside the modal box
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
  }
});

// ===== MODAL FORM SUBMIT =====
const modalForm = document.getElementById('modalForm');
if (modalForm) {
  modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const success = document.getElementById('modalSuccess');
    const btn = modalForm.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('modalName').value,
          phone: document.getElementById('modalPhone').value,
          problem: document.getElementById('modalProblem').value
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Server rejected request');
      }
      if (success) success.style.display = 'block';
      e.target.reset();
      setTimeout(() => { 
        const modal = document.getElementById('leadModal');
        if (modal) modal.classList.remove('show');
        if (success) success.style.display = 'none';
      }, 3000); // Close modal 3 seconds after success
    } catch (err) {
      alert("Error: " + err.message + "\n(This is usually due to CORS policy blocking '127.0.0.1:5500' in your Vercel backend)");
    } finally {
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; }
    }
  });
}
