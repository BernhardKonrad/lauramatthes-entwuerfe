// Renders Lauras Instagram-Beiträge in one of five layouts.
// ?reels=1..5 picks the layout (default 1); ?demo=12 pads the list with placeholders
// so the layouts can be judged with a realistic number of videos.
(() => {
  const app = document.getElementById('reels-app');
  if (!app || !window.LM_REELS) return;

  const params = new URLSearchParams(location.search);
  const LAYOUTS = {
    1: { name: 'Leiste', render: renderRow },
    2: { name: 'Handy', render: renderPhone },
    3: { name: 'Raster', render: renderGrid },
    4: { name: 'Story-Kreise', render: renderStories },
    5: { name: 'Highlight + Liste', render: renderFeature },
  };
  const layout = LAYOUTS[params.get('reels')] ? Number(params.get('reels')) : 1;
  const demoCount = Math.min(Number(params.get('demo')) || 0, 24);
  const PROFILE = window.LM_PROFILE;
  const TOPICS = {
    verwaltung: 'Verwaltung', wirtschaft: 'Wirtschaft', familien: 'Familien',
    zukunft: 'Zukunft', persoenlich: 'Persönlich', nachwahl: 'Nachwahl',
  };

  const items = [...window.LM_REELS];
  const demoPosters = ['laura-garten-quer', 'thema-verwaltung', 'thema-familie', 'thema-wirtschaft', 'laura-herbst-portrait', 'laura-herbst-gehend', 'laura-garten-gehend'];
  const demoTopics = Object.keys(TOPICS);
  for (let i = items.length; i < demoCount; i++) {
    items.push({
      title: `Platzhalter-Video ${i + 1}`, type: 'reel', url: PROFILE, demo: true,
      poster: `assets/fotos/${demoPosters[i % demoPosters.length]}.jpg`, topic: demoTopics[i % demoTopics.length],
    });
  }

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fmtDate = d => d ? new Date(d + 'T12:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
  const kindLabel = it => it.type === 'post' ? 'Beitrag' : 'Reel';
  const badge = it => it.demo ? '<span class="rx-badge">Platzhalter</span>' : '';
  const ig = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>';
  const extNote = '<p class="rx-note">Die Videos öffnen sich auf Instagram. Erst dann werden Daten an Meta übertragen.</p>';

  // A tile either plays the self-hosted video in the lightbox or links out to Instagram.
  function tileAttrs(it, i) {
    return it.video
      ? `href="${esc(it.url)}" data-play="${i}"`
      : `href="${esc(it.url)}" target="_blank" rel="noopener"`;
  }
  function playIcon(it) {
    return it.type === 'post'
      ? '<span class="rx-kind" aria-hidden="true">▣</span>'
      : '<span class="rx-play" aria-hidden="true"></span>';
  }
  function moreCard() {
    return `<a class="rx-more" href="${PROFILE}" target="_blank" rel="noopener">${ig}<strong>Alle Videos auf Instagram</strong><span>@lauramatthes</span></a>`;
  }

  /* 1 · Leiste: horizontally scrolling cards with arrows */
  function renderRow() {
    app.innerHTML = `
      <div class="rx-row-wrap">
        <ul class="rx-row" role="list">
          ${items.map((it, i) => `<li><a class="rx-card" ${tileAttrs(it, i)}>
            <img src="${esc(it.poster)}" alt="" loading="lazy">${playIcon(it)}${badge(it)}
            <span class="rx-meta"><span class="rx-sub">${kindLabel(it)}${it.date ? ' · ' + fmtDate(it.date) : ''}</span><strong>${esc(it.title)}</strong></span>
          </a></li>`).join('')}
          <li>${moreCard()}</li>
        </ul>
        <button type="button" class="rx-arrow rx-prev" aria-label="Zurück">←</button>
        <button type="button" class="rx-arrow rx-next" aria-label="Weiter">→</button>
      </div>${extNote}`;
    const row = app.querySelector('.rx-row');
    const prev = app.querySelector('.rx-prev'), next = app.querySelector('.rx-next');
    const step = () => (row.querySelector('li')?.offsetWidth || 220) + 16;
    const update = () => {
      prev.disabled = row.scrollLeft <= 2;
      next.disabled = row.scrollLeft >= row.scrollWidth - row.clientWidth - 2;
    };
    prev.onclick = () => row.scrollBy({ left: -step(), behavior: 'smooth' });
    next.onclick = () => row.scrollBy({ left: step(), behavior: 'smooth' });
    row.addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    update();
  }

  /* 2 · Handy: one item at a time in a phone frame, playlist beside it */
  function renderPhone() {
    app.innerHTML = `
      <div class="rx-phone-layout">
        <div class="rx-phone"><div class="rx-screen"></div>
          <button type="button" class="rx-phone-nav rx-up" aria-label="Vorheriges Video">↑</button>
          <button type="button" class="rx-phone-nav rx-down" aria-label="Nächstes Video">↓</button>
        </div>
        <div class="rx-playlist">
          <ol role="list">${items.map((it, i) => `<li><button type="button" data-i="${i}">
            <img src="${esc(it.poster)}" alt="" loading="lazy"><span><span class="rx-sub">${kindLabel(it)}${it.topic ? ' · ' + TOPICS[it.topic] : ''}</span><strong>${esc(it.title)}</strong></span>${badge(it)}
          </button></li>`).join('')}</ol>
          <a class="rx-follow" href="${PROFILE}" target="_blank" rel="noopener">${ig} Laura auf Instagram folgen</a>
        </div>
      </div>${extNote}`;
    const screen = app.querySelector('.rx-screen');
    const buttons = [...app.querySelectorAll('.rx-playlist button')];
    let cur = 0;
    function show(i) {
      cur = (i + items.length) % items.length;
      const it = items[cur];
      screen.innerHTML = it.video
        ? `<video src="${esc(it.video)}" poster="${esc(it.poster)}" controls playsinline preload="metadata"></video>`
        : `<img class="rx-blur" src="${esc(it.poster)}" alt=""><img class="rx-fg" src="${esc(it.poster)}" alt=""><div class="rx-screen-ui"><strong>${esc(it.title)}</strong>
             <a class="rx-btn" href="${esc(it.url)}" target="_blank" rel="noopener">${ig} Auf Instagram ansehen</a></div>${badge(it)}`;
      buttons.forEach((b, j) => b.setAttribute('aria-current', String(j === cur)));
    }
    buttons.forEach(b => b.onclick = () => show(Number(b.dataset.i)));
    app.querySelector('.rx-up').onclick = () => show(cur - 1);
    app.querySelector('.rx-down').onclick = () => show(cur + 1);
    show(0);
  }

  /* 3 · Raster: profile-like grid with topic filter and "Mehr anzeigen" */
  function renderGrid() {
    const PAGE = 8;
    const topics = [...new Set(items.map(it => it.topic).filter(Boolean))];
    let filter = 'alle', shown = PAGE;
    app.innerHTML = `
      <div class="rx-filters" role="group" aria-label="Nach Thema filtern">
        <button type="button" data-f="alle" aria-pressed="true">Alle</button>
        ${topics.map(t => `<button type="button" data-f="${t}" aria-pressed="false">${TOPICS[t]}</button>`).join('')}
      </div>
      <ul class="rx-grid" role="list"></ul>
      <div class="rx-grid-foot"><button type="button" class="rx-btn rx-load">Mehr anzeigen</button><a class="rx-link" href="${PROFILE}" target="_blank" rel="noopener">${ig} Alle auf Instagram</a></div>${extNote}`;
    const grid = app.querySelector('.rx-grid'), load = app.querySelector('.rx-load');
    function draw() {
      const list = items.map((it, i) => [it, i]).filter(([it]) => filter === 'alle' || it.topic === filter);
      grid.innerHTML = list.slice(0, shown).map(([it, i]) => `<li><a class="rx-card rx-card--grid" ${tileAttrs(it, i)}>
        <img src="${esc(it.poster)}" alt="" loading="lazy">${playIcon(it)}${badge(it)}
        <span class="rx-meta"><span class="rx-sub">${it.topic ? TOPICS[it.topic] : kindLabel(it)}</span><strong>${esc(it.title)}</strong></span></a></li>`).join('');
      load.hidden = list.length <= shown;
    }
    app.querySelectorAll('.rx-filters button').forEach(b => b.onclick = () => {
      filter = b.dataset.f; shown = PAGE;
      app.querySelectorAll('.rx-filters button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      draw();
    });
    load.onclick = () => { shown += PAGE; draw(); };
    draw();
  }

  /* 4 · Story-Kreise: round previews, full-screen story viewer */
  function renderStories() {
    app.innerHTML = `
      <ul class="rx-stories" role="list">
        ${items.map((it, i) => `<li><button type="button" class="rx-story" data-i="${i}">
          <span class="rx-ring"><img src="${esc(it.poster)}" alt=""></span><span class="rx-story-title">${esc(it.title)}</span></button></li>`).join('')}
        <li><a class="rx-story rx-story--more" href="${PROFILE}" target="_blank" rel="noopener"><span class="rx-ring">${ig}</span><span class="rx-story-title">Alle auf Instagram</span></a></li>
      </ul>
      <p class="rx-hint">Antippen, um durch die Videos zu blättern.</p>`;
    app.querySelectorAll('.rx-story[data-i]').forEach(b => b.onclick = () => openStories(Number(b.dataset.i)));
  }

  function openStories(start) {
    const DURATION = 6000;
    const dlg = document.createElement('div');
    dlg.className = 'rx-viewer rx-viewer--story';
    dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-label', 'Lauras Videos');
    dlg.innerHTML = `<div class="rx-story-frame">
      <div class="rx-bars">${items.map(() => '<span><i></i></span>').join('')}</div>
      <div class="rx-story-media"></div>
      <button type="button" class="rx-tap rx-tap-l" aria-label="Vorheriges"></button>
      <button type="button" class="rx-tap rx-tap-r" aria-label="Nächstes"></button>
      <button type="button" class="rx-close" aria-label="Schließen">×</button>
    </div>`;
    document.body.appendChild(dlg);
    document.body.classList.add('rx-locked');
    const media = dlg.querySelector('.rx-story-media');
    const bars = [...dlg.querySelectorAll('.rx-bars i')];
    let cur = start, timer;
    function show(i) {
      if (i >= items.length) return close();
      cur = Math.max(0, i);
      clearTimeout(timer);
      const it = items[cur];
      bars.forEach((b, j) => { b.style.transition = 'none'; b.style.width = j < cur ? '100%' : '0%'; });
      media.innerHTML = it.video
        ? `<video src="${esc(it.video)}" poster="${esc(it.poster)}" autoplay playsinline></video>`
        : `<img class="rx-blur" src="${esc(it.poster)}" alt=""><img class="rx-fg" src="${esc(it.poster)}" alt="">`;
      media.insertAdjacentHTML('beforeend', `<div class="rx-story-ui"><strong>${esc(it.title)}</strong>
        <a class="rx-btn" href="${esc(it.url)}" target="_blank" rel="noopener">${ig} ${it.video ? 'Auf Instagram öffnen' : 'Ganzes Video auf Instagram'}</a></div>${badge(it)}`);
      const video = media.querySelector('video');
      const dur = video ? null : DURATION;
      requestAnimationFrame(() => {
        bars[cur].style.transition = dur ? `width ${dur}ms linear` : 'none';
        bars[cur].style.width = '100%';
      });
      if (video) video.onended = () => show(cur + 1);
      else timer = setTimeout(() => show(cur + 1), dur);
    }
    function close() {
      clearTimeout(timer);
      dlg.remove(); document.body.classList.remove('rx-locked');
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') { e.stopPropagation(); show(cur + 1); }
      if (e.key === 'ArrowLeft') { e.stopPropagation(); show(cur - 1); }
    }
    dlg.querySelector('.rx-tap-l').onclick = () => show(cur - 1);
    dlg.querySelector('.rx-tap-r').onclick = () => show(cur + 1);
    dlg.querySelector('.rx-close').onclick = close;
    dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
    document.addEventListener('keydown', onKey);
    show(start);
    dlg.querySelector('.rx-close').focus();
  }

  /* 5 · Highlight + Liste: newest large, the rest as a compact list */
  function renderFeature() {
    const [first, ...rest] = items;
    app.innerHTML = `
      <div class="rx-feature">
        <a class="rx-card rx-card--feature" ${tileAttrs(first, 0)}>
          <img src="${esc(first.poster)}" alt="" loading="lazy">${playIcon(first)}${badge(first)}
          <span class="rx-meta"><span class="rx-sub">Neu · ${kindLabel(first)}</span><strong>${esc(first.title)}</strong></span>
        </a>
        <div class="rx-list">
          <p class="rx-list-head">Weitere Videos</p>
          <ul role="list">${rest.map((it, k) => `<li><a ${tileAttrs(it, k + 1)}>
            <img src="${esc(it.poster)}" alt="" loading="lazy">
            <span><span class="rx-sub">${kindLabel(it)}${it.topic ? ' · ' + TOPICS[it.topic] : ''}</span><strong>${esc(it.title)}</strong></span>${badge(it)}
            <span class="rx-go" aria-hidden="true">↗</span></a></li>`).join('')}</ul>
          <a class="rx-follow" href="${PROFILE}" target="_blank" rel="noopener">${ig} Alle Videos auf Instagram</a>
        </div>
      </div>${extNote}`;
  }

  // Lightbox for self-hosted videos (only used once items carry a `video` URL)
  app.addEventListener('click', e => {
    const a = e.target.closest('[data-play]');
    if (!a) return;
    e.preventDefault();
    const it = items[Number(a.dataset.play)];
    const dlg = document.createElement('div');
    dlg.className = 'rx-viewer';
    dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-label', it.title);
    dlg.innerHTML = `<div class="rx-lightbox"><video src="${esc(it.video)}" poster="${esc(it.poster)}" controls autoplay playsinline></video>
      <button type="button" class="rx-close" aria-label="Schließen">×</button></div>`;
    const close = () => { dlg.remove(); document.body.classList.remove('rx-locked'); };
    dlg.addEventListener('click', ev => { if (ev.target === dlg || ev.target.closest('.rx-close')) close(); });
    document.addEventListener('keydown', function onEsc(ev) { if (ev.key === 'Escape') { close(); document.removeEventListener('keydown', onEsc); } });
    document.body.appendChild(dlg); document.body.classList.add('rx-locked');
  });

  app.dataset.layout = layout;
  LAYOUTS[layout].render();

  // Draft switcher: only shown when a layout was picked via the URL
  if (params.has('reels')) {
    const bar = document.createElement('nav');
    bar.className = 'rx-switch';
    bar.setAttribute('aria-label', 'Instagram-Varianten');
    const link = (n, d) => { const p = new URLSearchParams(location.search); p.set('reels', n); d ? p.set('demo', d) : p.delete('demo'); return `?${p}#reels`; };
    bar.innerHTML = `<span>Instagram-Variante</span>
      ${Object.entries(LAYOUTS).map(([n, l]) => `<a href="${link(n, demoCount)}" ${Number(n) === layout ? 'aria-current="true"' : ''} title="${l.name}">${n}<em>${l.name}</em></a>`).join('')}
      <a class="rx-demo" href="${link(layout, demoCount ? 0 : 12)}">${demoCount ? 'Nur echte Videos' : 'Mit 12 Videos ansehen'}</a>`;
    document.body.appendChild(bar);
  }
})();
