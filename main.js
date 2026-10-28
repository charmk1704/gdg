/* GDGoC Poornima – main.js (vanilla ES6+) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme: persist choice in localStorage (guarded) */
  const root = document.documentElement;
  try { const t = localStorage.getItem('gdgoc-theme'); if (t) root.dataset.theme = t; } catch (e) {}
  $('#theme-toggle')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('gdgoc-theme', next); } catch (e) {}
  });

  /* Mobile drawer */
  const btn = $('#menu-btn'), nav = $('#nav');
  btn?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav?.classList.contains('is-open')) { nav.classList.remove('is-open'); btn.setAttribute('aria-expanded', false); btn.focus(); }
  });

  /* Scroll reveal + count-up */
  const countUp = el => {
    const end = +el.dataset.count;
    if (reduce) { el.textContent = end.toLocaleString('en-IN'); return; }
    const t0 = performance.now();
    const tick = t => {
      const p = Math.min((t - t0) / 1400, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('is-in');
    $$('[data-count]', en.target).forEach(countUp);
    io.unobserve(en.target);
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));

  /* Countdown: reads data-date (ISO). If it is still a placeholder, shows a friendly note. */
  const cd = $('#countdown');
  if (cd) {
    const target = Date.parse(cd.dataset.date);
    const note = $('#countdown-note');
    if (Number.isNaN(target)) { cd.hidden = true; if (note) note.hidden = false; }
    else {
      const parts = { d: $('[data-u="d"]', cd), h: $('[data-u="h"]', cd), m: $('[data-u="m"]', cd), s: $('[data-u="s"]', cd) };
      const run = () => {
        let diff = Math.max(0, target - Date.now()) / 1000;
        parts.d.textContent = Math.floor(diff / 86400);
        parts.h.textContent = String(Math.floor(diff % 86400 / 3600)).padStart(2, '0');
        parts.m.textContent = String(Math.floor(diff % 3600 / 60)).padStart(2, '0');
        parts.s.textContent = String(Math.floor(diff % 60)).padStart(2, '0');
      };
      run(); setInterval(run, 1000);
    }
  }

  /* Quick fade between pages */
  $$('a[href$=".html"]').forEach(a => a.addEventListener('click', e => {
    if (reduce || e.metaKey || e.ctrlKey || a.target) return;
    e.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(() => (location.href = a.href), 220);
  }));
  addEventListener('pageshow', () => document.body.classList.remove('is-leaving'));
})();
