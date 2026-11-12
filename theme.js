// Colour concept (?farbe=1..13, default 1 "Flyer"; 11–13 use the Greens' corporate design) plus the header themes
// standard / dark / mering. Loaded in <head> so colours apply before the first paint.
(() => {
  const KEY = 'lm-theme';
  const THEMES = ['standard', 'dark', 'mering'];
  const CONCEPTS = [
    { name: 'Flyer', color: '#083335' },
    { name: 'Weiß & Petrol', color: '#083335' },
    { name: 'Navy & Türkis', color: '#001b3d' },
    { name: 'Schiefer & Kupfer', color: '#2e3a44' },
    { name: 'Ozeanblau', color: '#0f3d5e' },
    { name: 'Graphit & Magenta', color: '#2a2c33' },
    { name: 'Sand & Petrol', color: '#0e4245' },
    { name: 'Nachtblau & Koralle', color: '#1d2b4f' },
    { name: 'Hell & Gold', color: '#2b2b2b' },
    { name: 'Minimal', color: '#14181c' },
    { name: 'Grüne CI · Sand', color: '#005437' },
    { name: 'Grüne CI · Tanne & Sonne', color: '#005437' },
    { name: 'Grüne CI · Online', color: '#005437' },
  ];
  window.LM_CONCEPTS = CONCEPTS;
  const root = document.documentElement;

  const param = Number(new URLSearchParams(location.search).get('farbe'));
  const concept = param >= 1 && param <= CONCEPTS.length ? param : 1;
  window.LM_CONCEPT = concept;
  if (concept > 1) root.setAttribute('data-concept', String(concept));

  // Previewing a colour concept always starts in its light standard look.
  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch {}
  const initial = !param && THEMES.includes(stored) ? stored : 'standard';
  const META = { standard: CONCEPTS[concept - 1].color, dark: '#071a1c', mering: '#1b1b1b' };

  function apply(theme, save) {
    // switch colours instantly instead of letting hover transitions fade them
    root.classList.add('theme-switching');
    setTimeout(() => root.classList.remove('theme-switching'), 60);
    if (theme === 'standard') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', META[theme]);
    document.querySelectorAll('[data-theme-choice]').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.themeChoice === theme)));
    if (save) { try { localStorage.setItem(KEY, theme); } catch {} }
  }

  apply(initial, false);
  document.addEventListener('DOMContentLoaded', () => {
    apply(initial, false);
    document.querySelectorAll('[data-theme-choice]').forEach(b =>
      b.addEventListener('click', () => apply(b.dataset.themeChoice, true)));
  });
})();
