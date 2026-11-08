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
const revealables = document.querySelectorAll('.section-head, .topic, .expect-col, .about-grid > *, .chapter');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  revealables.forEach(el => { el.classList.add('reveal'); io.observe(el); });
}

// Reels row: arrow buttons scroll by one card, disabled at either end
const reels = document.querySelector('.reels');
if (reels) {
  const buttons = document.querySelectorAll('.reels-btn');
  const step = () => (reels.querySelector('li')?.offsetWidth || 220) + 16;
  const update = () => {
    const max = reels.scrollWidth - reels.clientWidth - 2;
    buttons.forEach(b => { b.disabled = b.dataset.dir === '-1' ? reels.scrollLeft <= 2 : reels.scrollLeft >= max; });
  };
  buttons.forEach(b => b.addEventListener('click', () =>
    reels.scrollBy({ left: step() * Number(b.dataset.dir), behavior: 'smooth' })));
  reels.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
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
