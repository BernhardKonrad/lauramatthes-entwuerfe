// Mobile navigation
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.setAttribute('aria-label', open ? 'Menü öffnen' : 'Menü schließen');
  nav.classList.toggle('open', !open);
});

nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  toggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}));

// Header border once scrolled
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Fade sections in on scroll
const revealables = document.querySelectorAll('.section-head, .topic, .expect-col, .about-grid > *');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealables.forEach(el => { el.classList.add('reveal'); io.observe(el); });
}

// Form: submit via fetch on Netlify, show a message locally
const form = document.querySelector('form[name="anliegen"]');
const status = form.querySelector('.form-status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  status.textContent = 'Wird gesendet …';
  try {
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString(),
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    status.textContent = 'Danke! Ihre Nachricht ist angekommen. Ich melde mich bei Ihnen.';
  } catch {
    status.textContent = 'Das hat leider nicht geklappt. Bitte schreiben Sie mir direkt per E-Mail.';
  } finally {
    button.disabled = false;
  }
});
