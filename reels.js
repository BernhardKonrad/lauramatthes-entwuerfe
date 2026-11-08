// Renders Lauras Instagram-Beiträge in one of nine layouts.
// ?reels=1..9 picks the layout (default 1); ?demo=12 pads the list with placeholders
// so the layouts can be judged with a realistic number of videos.
(() => {
  const app = document.getElementById('reels-app');
  if (!app || !window.LM_REELS) return;

  // Draft phase: show the way to the overview page. Set to false before launch.
  const DRAFT = true;

  const params = new URLSearchParams(location.search);
  const LAYOUTS = {
    1: { name: 'Leiste', section: renderRow },
    2: { name: 'Handy', section: renderPhone },
    3: { name: 'Raster', section: renderGrid },
    4: { name: 'Story-Kreise', section: renderStories },
    5: { name: 'Highlight + Liste', section: renderFeature },
    6: { name: 'In den Themen (klein)', section: renderRow, extras: [topicsMini] },
    7: { name: 'In den Themen (groß)', section: renderRow, extras: [topicsBig] },
    8: { name: 'Handy im Einstieg', section: renderRow, extras: [heroPhone] },
    9: { name: 'Instagram zuerst', section: renderFeature, extras: [moveSectionUp, topicsMini] },
  };
  const layout = LAYOUTS[params.get('reels')] ? Number(params.get('reels')) : 1;
  const demoCount = Math.min(Number(params.get('demo')) || 0, 24);
  const PROFILE = window.LM_PROFILE;
  const TOPICS = {
    verwaltung: 'Verwaltung', wirtschaft: 'Wirtschaft', familien: 'Familien',
    zukunft: 'Zukunft', persoenlich: 'Persönlich', nachwahl: 'Nachwahl',
  };

  const real = window.LM_REELS;
  const items = [...real];
  const demoPosters = ['laura-garten-quer', 'thema-verwaltung', 'thema-familie', 'thema-wirtschaft', 'laura-herbst-portrait', 'laura-herbst-gehend', 'laura-garten-gehend'];
  const demoTopics = Object.keys(TOPICS);
  for (let i = items.length; i < demoCount; i++) {
    items.push({
      title: `Platzhalter-Video ${i + 1}`, type: 'reel', url: PROFILE, demo: true,
      poster: `assets/fotos/${demoPosters[i % demoPosters.length]}.jpg`, topic: demoTopics[i % demoTopics.length],
    });
  }

  // Every rendered item gets an id here, so the lightbox can find it again.
  const REG = [];
  const reg = it => REG.push(it) - 1;

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fmtDate = d => d ? new Date(d + 'T12:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
  const kindLabel = it => it.type === 'post' ? 'Beitrag' : 'Reel';
  const badge = it => it.demo ? '<span class="rx-badge">Platzhalter</span>' : '';
  const ig = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>';
  const extNote = '<p class="rx-note">Die Videos öffnen sich auf Instagram. Erst dann werden Daten an Meta übertragen.</p>';

  // Items for one topic. Topics without own videos get repeats of the real ones,
  // marked as placeholders, so the layout can be judged.
  function topicItems(topic, n) {
    const own = items.filter(it => it.topic === topic);
    const out = own.slice(0, n);
    const offset = Object.keys(TOPICS).indexOf(topic);
    for (let k = 0; out.length < n && k < real.length; k++) {
      const pick = real[(k + offset) % real.length];
      if (!out.some(o => o.url === pick.url)) out.push({ ...pick, demo: true });
    }
    return out;
  }

  // A tile either plays the self-hosted video in the lightbox or links out to Instagram.
  function tileAttrs(it) {
    return it.video
      ? `href="${esc(it.url)}" data-play="${reg(it)}"`
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
  // 3:4 thumbnail shown whole inside a taller frame, the rest filled with a blurred copy
  function blurPoster(it) {
    return `<img class="rx-blur" src="${esc(it.poster)}" alt=""><img class="rx-fg" src="${esc(it.poster)}" alt="">`;
  }

  /* 1 · Leiste: horizontally scrolling cards with arrows */
  function renderRow() {
    app.innerHTML = `
      <div class="rx-row-wrap">
        <ul class="rx-row" role="list">
          ${items.map(it => `<li><a class="rx-card" ${tileAttrs(it)}>
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
    const buttons = [...app.querySelectorAll('.rx-playlist button')];
    const phone = phoneScreen(app.querySelector('.rx-screen'), i => buttons.forEach((b, j) => b.setAttribute('aria-current', String(j === i))));
    buttons.forEach(b => b.onclick = () => phone.show(Number(b.dataset.i)));
    app.querySelector('.rx-up').onclick = () => phone.show(phone.cur - 1);
    app.querySelector('.rx-down').onclick = () => phone.show(phone.cur + 1);
    phone.show(0);
  }

  // Screen content of a phone frame; shared by layout 2 and the hero phone.
  function phoneScreen(screen, onShow) {
    const state = { cur: 0, show };
    function show(i) {
      state.cur = (i + items.length) % items.length;
      const it = items[state.cur];
      screen.innerHTML = it.video
        ? `<video src="${esc(it.video)}" poster="${esc(it.poster)}" controls playsinline preload="metadata"></video>`
        : `${blurPoster(it)}<div class="rx-screen-ui"><strong>${esc(it.title)}</strong>
             <a class="rx-btn" href="${esc(it.url)}" target="_blank" rel="noopener">${ig} Auf Instagram ansehen</a></div>${badge(it)}`;
      onShow && onShow(state.cur);
    }
    return state;
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
      const list = items.filter(it => filter === 'alle' || it.topic === filter);
      grid.innerHTML = list.slice(0, shown).map(it => `<li><a class="rx-card rx-card--grid" ${tileAttrs(it)}>
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
        : blurPoster(it);
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
        <a class="rx-card rx-card--feature" ${tileAttrs(first)}>
          <img src="${esc(first.poster)}" alt="" loading="lazy">${playIcon(first)}${badge(first)}
          <span class="rx-meta"><span class="rx-sub">Neu · ${kindLabel(first)}</span><strong>${esc(first.title)}</strong></span>
        </a>
        <div class="rx-list">
          <p class="rx-list-head">Weitere Videos</p>
          <ul role="list">${rest.map(it => `<li><a ${tileAttrs(it)}>
            <img src="${esc(it.poster)}" alt="" loading="lazy">
            <span><span class="rx-sub">${kindLabel(it)}${it.topic ? ' · ' + TOPICS[it.topic] : ''}</span><strong>${esc(it.title)}</strong></span>${badge(it)}
            <span class="rx-go" aria-hidden="true">↗</span></a></li>`).join('')}</ul>
          <a class="rx-follow" href="${PROFILE}" target="_blank" rel="noopener">${ig} Alle Videos auf Instagram</a>
        </div>
      </div>${extNote}`;
  }

  /* 6 · In den Themen (klein): a small "Dazu auf Instagram" strip in every topic card */
  function topicsMini() {
    document.querySelectorAll('.topic[data-topic]').forEach(card => {
      const list = topicItems(card.dataset.topic, 2);
      if (!list.length) return;
      card.querySelector('.topic-body').insertAdjacentHTML('beforeend', `
        <div class="rx-topic-mini">
          <p class="rx-topic-label">${ig} Dazu auf Instagram</p>
          <ul role="list">${list.map(it => `<li><a ${tileAttrs(it)}>
            <span class="rx-tm-thumb"><img src="${esc(it.poster)}" alt="" loading="lazy">${it.type === 'post' ? '' : '<span class="rx-tm-play" aria-hidden="true"></span>'}</span>
            <span class="rx-tm-title">${esc(it.title)}${badge(it)}</span></a></li>`).join('')}</ul>
        </div>`);
    });
  }

  /* 7 · In den Themen (groß): the topic photo becomes a video preview */
  function topicsBig() {
    document.querySelectorAll('.topic[data-topic]').forEach(card => {
      const [it] = topicItems(card.dataset.topic, 1);
      if (!it) return;
      card.classList.add('rx-topic-big');
      const img = card.querySelector(':scope > img');
      const box = document.createElement('a');
      box.className = 'rx-topic-video';
      box.innerHTML = `${blurPoster(it)}${it.type === 'post' ? '' : '<span class="rx-play rx-play--center" aria-hidden="true"></span>'}${badge(it)}
        <span class="rx-tv-cap">${ig}<span><strong>${esc(it.title)}</strong><span>${it.type === 'post' ? 'Beitrag' : 'Video'} auf Instagram ansehen</span></span></span>`;
      const attrs = tileAttrs(it).match(/(\S+?)="([^"]*)"/g);
      attrs.forEach(a => { const [, k, v] = a.match(/(\S+?)="([^"]*)"/); box.setAttribute(k, v.replace(/&amp;/g, '&')); });
      img ? img.replaceWith(box) : card.prepend(box);
    });
  }

  /* 8 · Handy im Einstieg: the hero photo becomes a phone playing through the videos */
  function heroPhone() {
    const fig = document.querySelector('.hero-photo');
    if (!fig) return;
    fig.classList.add('rx-hero');
    fig.innerHTML = `
      <div class="rx-hero-photo"><img src="assets/fotos/laura-garten-gehend.jpg" alt="Laura Matthes im Garten"></div>
      <div class="rx-phone rx-phone--hero"><div class="rx-screen"></div></div>
      <div class="rx-hero-tag">${ig}<span><strong>Neu auf Instagram</strong>@lauramatthes</span></div>
      <div class="rx-hero-dots" role="group" aria-label="Video wählen">${items.slice(0, 6).map((_, i) => `<button type="button" data-i="${i}" aria-label="Video ${i + 1}"></button>`).join('')}</div>`;
    const dots = [...fig.querySelectorAll('.rx-hero-dots button')];
    const phone = phoneScreen(fig.querySelector('.rx-screen'), i => dots.forEach((d, j) => d.setAttribute('aria-current', String(j === i))));
    let timer;
    const cycle = () => { clearInterval(timer); timer = setInterval(() => phone.show((phone.cur + 1) % Math.min(items.length, 6)), 5000); };
    dots.forEach(d => d.onclick = () => { phone.show(Number(d.dataset.i)); cycle(); });
    fig.addEventListener('mouseenter', () => clearInterval(timer));
    fig.addEventListener('mouseleave', cycle);
    phone.show(0);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) cycle();
  }

  /* 9 · Instagram zuerst: the whole Instagram section moves up, right below the hero */
  function moveSectionUp() {
    const section = document.getElementById('reels');
    const hero = document.querySelector('.hero');
    if (section && hero) hero.after(section);
    section.classList.add('rx-first');
    const h2 = section.querySelector('.reels-head h2');
    if (h2) h2.textContent = 'Neu von Laura auf Instagram';
  }

  // Lightbox for self-hosted videos (only used once items carry a `video` URL)
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-play]');
    if (!a) return;
    e.preventDefault();
    const it = REG[Number(a.dataset.play)];
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
  LAYOUTS[layout].section();
  (LAYOUTS[layout].extras || []).forEach(fn => fn());

  // Draft switcher: full bar when a layout was picked via the URL, otherwise a small pill
  if (!DRAFT || window.self !== window.top) return; // no bar inside the overview thumbnails
  const overview = new URL('varianten/index.html', document.baseURI).href;
  const bar = document.createElement('nav');
  bar.setAttribute('aria-label', 'Entwürfe');
  if (params.has('reels')) {
    const link = (n, d) => { const p = new URLSearchParams(location.search); p.set('reels', n); d ? p.set('demo', d) : p.delete('demo'); return `?${p}${n == 8 ? '' : n >= 6 && n <= 7 ? '#themen' : '#reels'}`; };
    const prev = layout === 1 ? 9 : layout - 1, next = layout === 9 ? 1 : layout + 1;
    bar.className = 'rx-switch';
    bar.innerHTML = `
      <a class="rx-sw-all" href="${overview}" title="Alle Entwürfe">▦ Alle</a>
      <a href="${link(prev, demoCount)}" aria-label="Vorherige Variante">←</a>
      <span class="rx-sw-cur"><small>Instagram ${layout} von 9</small>${LAYOUTS[layout].name}</span>
      <a href="${link(next, demoCount)}" aria-label="Nächste Variante">→</a>
      <a class="rx-demo" href="${link(layout, demoCount ? 0 : 12)}">${demoCount ? 'Nur echte Videos' : 'Mit 12 Videos'}</a>`;
  } else {
    bar.className = 'rx-pill';
    bar.innerHTML = `<a href="${overview}">▦ Entwürfe &amp; Varianten</a>`;
  }
  document.body.appendChild(bar);
})();
