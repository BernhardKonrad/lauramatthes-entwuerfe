// Draft phase only: way to the overview page and a bar to page through the colour concepts.
// Remove this script (and the "Entwürfe" footer link) before launch.
(() => {
  if (window.self !== window.top) return; // not inside the overview thumbnails
  const concepts = window.LM_CONCEPTS || [];
  const cur = window.LM_CONCEPT || 1;
  const overview = new URL('varianten/index.html', document.baseURI).href;
  const params = new URLSearchParams(location.search);
  const bar = document.createElement('nav');
  bar.setAttribute('aria-label', 'Entwürfe');

  if (params.has('farbe')) {
    const n = concepts.length;
    const link = i => { const p = new URLSearchParams(location.search); p.set('farbe', i); return `?${p}${location.hash}`; };
    const prev = cur === 1 ? n : cur - 1, next = cur === n ? 1 : cur + 1;
    bar.className = 'dx-bar';
    bar.innerHTML = `
      <a class="dx-all" href="${overview}" title="Alle Farbkonzepte">▦ Alle</a>
      <a href="${link(prev)}" aria-label="Vorheriges Farbkonzept">←</a>
      <span class="dx-cur"><small>Farbkonzept ${cur} von ${n}</small>${concepts[cur - 1].name}</span>
      <a href="${link(next)}" aria-label="Nächstes Farbkonzept">→</a>`;
    document.addEventListener('keydown', e => {
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.altKey || e.ctrlKey || e.metaKey || document.querySelector('.vx-viewer')) return;
      if (e.key === 'ArrowLeft') location.href = link(prev);
      if (e.key === 'ArrowRight') location.href = link(next);
    });
  } else {
    bar.className = 'dx-pill';
    bar.innerHTML = `<a href="${overview}">▦ Entwürfe &amp; Farbkonzepte</a>`;
  }
  document.body.appendChild(bar);
})();
