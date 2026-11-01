// Floating switcher shown on the backup designs.
// Lives in a shadow root so it never collides with a variant's own styles.
(() => {
  const VARIANTS = [
    { id: '02-zeitung', name: 'Meringer Zeitung' },
    { id: '04-karte',   name: 'Mering-Karte' },
    { id: '08-magazin', name: 'Magazin' },
  ];

  if (window.self !== window.top) return;
  const match = location.pathname.match(/varianten\/([^/]+)\//);
  const idx = match ? VARIANTS.findIndex(v => v.id === match[1]) : -1;
  if (idx < 0) return;

  const at = i => VARIANTS[(i + VARIANTS.length) % VARIANTS.length];
  const href = v => `../${v.id}/index.html`;
  const prev = at(idx - 1), next = at(idx + 1), cur = VARIANTS[idx];

  let collapsed = false;
  try { collapsed = sessionStorage.getItem('lm-switcher-collapsed') === '1'; } catch {}

  const host = document.createElement('div');
  host.setAttribute('aria-label', 'Entwurfs-Umschalter');
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `
    <style>
      :host { all: initial; }
      .bar {
        position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%);
        z-index: 2147483000; display: flex; align-items: center; gap: 4px;
        background: rgba(17, 17, 17, .92); color: #fff; backdrop-filter: blur(8px);
        border-radius: 999px; padding: 6px; box-shadow: 0 10px 30px rgba(0,0,0,.25);
        font: 500 14px/1.2 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        max-width: calc(100vw - 24px);
      }
      a, button {
        all: unset; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
        height: 36px; min-width: 36px; padding: 0 12px; border-radius: 999px; color: #fff; white-space: nowrap;
      }
      a:hover, button:hover { background: rgba(255,255,255,.14); }
      a:focus-visible, button:focus-visible { outline: 2px solid #fff; outline-offset: 1px; }
      .label { padding: 0 10px; display: flex; flex-direction: column; min-width: 0; }
      .label small { opacity: .6; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; }
      .label strong { font-weight: 600; overflow: hidden; text-overflow: ellipsis; }
      .main { background: #fff; color: #111; font-weight: 600; }
      .main:hover { background: #e9e9e9; }
      .bar.collapsed .label, .bar.collapsed .nav, .bar.collapsed .main { display: none; }
      @media (max-width: 480px) { .label small { display: none; } }
      @media print { .bar { display: none; } }
    </style>
    <div class="bar${collapsed ? ' collapsed' : ''}">
      <a class="nav" href="${href(prev)}" title="${prev.name}" aria-label="Vorheriges Backup">←</a>
      <div class="label"><small>Backup ${idx + 1} von ${VARIANTS.length}</small><strong>${cur.name}</strong></div>
      <a class="nav" href="${href(next)}" title="${next.name}" aria-label="Nächstes Backup">→</a>
      <a class="main" href="../../index.html" title="Zur Hauptseite">Hauptseite</a>
      <button class="toggle" aria-label="Umschalter ein- oder ausklappen">${collapsed ? '‹›' : '×'}</button>
    </div>`;

  const bar = root.querySelector('.bar');
  const toggle = root.querySelector('.toggle');
  toggle.addEventListener('click', () => {
    collapsed = !collapsed;
    bar.classList.toggle('collapsed', collapsed);
    toggle.textContent = collapsed ? '‹›' : '×';
    try { sessionStorage.setItem('lm-switcher-collapsed', collapsed ? '1' : '0'); } catch {}
  });

  document.addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowLeft') location.href = href(prev);
    if (e.key === 'ArrowRight') location.href = href(next);
  });

  // keep page footers reachable above the bar, in the footer's own colour
  const last = [...document.body.children].filter(el => el.tagName !== 'SCRIPT').pop();
  const spacer = document.createElement('div');
  spacer.style.height = '72px';
  if (last) {
    const bg = getComputedStyle(last).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') spacer.style.background = bg;
  }
  document.body.appendChild(spacer);
  document.body.appendChild(host);
})();
