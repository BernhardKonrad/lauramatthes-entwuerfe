// Colour themes: standard (navy/magenta), dark, mering (gold/silver/black).
// Loaded in <head> so the stored theme applies before the first paint.
(() => {
  const KEY = 'lm-theme';
  const THEMES = ['standard', 'dark', 'mering'];
  const META = { standard: '#0b1f44', dark: '#0d121d', mering: '#1b1b1b' };
  const root = document.documentElement;

  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch {}
  const prefersDark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = THEMES.includes(stored) ? stored : (prefersDark ? 'dark' : 'standard');

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
