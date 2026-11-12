// "Videos": Raster mit Themenfilter. Einträge mit eigener MP4 laufen direkt auf der
// Seite in einem Player-Fenster, alle anderen öffnen sich in einem neuen Tab.
(() => {
  const app = document.getElementById('videos-app');
  if (!app || !window.LM_VIDEOS) return;

  const items = window.LM_VIDEOS;
  const PAGE = 8;
  const TOPICS = {
    verwaltung: 'Verwaltung', wirtschaft: 'Wirtschaft', familien: 'Familien',
    zukunft: 'Zukunft', persoenlich: 'Persönlich', neuwahl: 'Neuwahl',
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const kind = it => it.type === 'bild' ? 'Bildbeitrag' : 'Video';
  const ext = '<svg class="vx-ext" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';

  const topics = [...new Set(items.map(it => it.topic).filter(Boolean))];
  let filter = 'alle', shown = PAGE;

  app.innerHTML = `
    ${topics.length > 1 ? `<div class="vx-filters" role="group" aria-label="Nach Thema filtern">
      <button type="button" data-f="alle" aria-pressed="true">Alle</button>
      ${topics.map(t => `<button type="button" data-f="${t}" aria-pressed="false">${TOPICS[t]}</button>`).join('')}
    </div>` : ''}
    <ul class="vx-grid" role="list"></ul>
    <div class="vx-foot">
      <button type="button" class="btn vx-load">Mehr anzeigen</button>
      <a class="vx-all" href="${window.LM_PROFILE}" target="_blank" rel="noopener">Alle Videos von Laura ${ext}</a>
    </div>
    <p class="vx-note">Beiträge mit ${ext} öffnen sich in einem neuen Tab auf Lauras Social-Media-Kanal.</p>`;

  const grid = app.querySelector('.vx-grid');
  const load = app.querySelector('.vx-load');

  function tile(it, i) {
    const inline = Boolean(it.video);
    const attrs = inline ? `href="${esc(it.video)}" data-play="${i}"` : `href="${esc(it.url)}" target="_blank" rel="noopener"`;
    const icon = it.type === 'bild' ? '' : '<span class="vx-play" aria-hidden="true"></span>';
    const sub = [it.topic ? TOPICS[it.topic] : kind(it), it.duration].filter(Boolean).join(' · ');
    return `<li><a class="vx-card" ${attrs}>
      <span class="vx-thumb"><img src="${esc(it.poster)}" alt="" loading="lazy">${icon}${inline ? '' : `<span class="vx-out">${ext}</span>`}</span>
      <span class="vx-meta"><span class="vx-sub">${esc(sub)}</span><strong>${esc(it.title)}</strong></span>
    </a></li>`;
  }

  function draw() {
    const list = items.map((it, i) => [it, i]).filter(([it]) => filter === 'alle' || it.topic === filter);
    grid.innerHTML = list.slice(0, shown).map(([it, i]) => tile(it, i)).join('');
    load.hidden = list.length <= shown;
  }

  app.querySelectorAll('.vx-filters button').forEach(b => b.addEventListener('click', () => {
    filter = b.dataset.f; shown = PAGE;
    app.querySelectorAll('.vx-filters button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    draw();
  }));
  load.addEventListener('click', () => { shown += PAGE; draw(); });

  // Player window for videos hosted with the site
  app.addEventListener('click', e => {
    const a = e.target.closest('[data-play]');
    if (!a) return;
    e.preventDefault();
    const it = items[Number(a.dataset.play)];
    const dlg = document.createElement('div');
    dlg.className = 'vx-viewer';
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-label', it.title);
    dlg.innerHTML = `<div class="vx-player">
        <video src="${esc(it.video)}" poster="${esc(it.poster)}" controls autoplay playsinline></video>
        <button type="button" class="vx-close" aria-label="Schließen">×</button>
      </div>
      <p class="vx-caption">${esc(it.title)}</p>`;
    const close = () => {
      dlg.remove();
      document.body.classList.remove('vx-locked');
      document.removeEventListener('keydown', onKey);
      a.focus();
    };
    const onKey = ev => { if (ev.key === 'Escape') close(); };
    dlg.addEventListener('click', ev => { if (ev.target === dlg || ev.target.closest('.vx-close')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(dlg);
    document.body.classList.add('vx-locked');
    dlg.querySelector('.vx-close').focus();
  });

  draw();
})();
