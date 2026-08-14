const cursor = document.getElementById('cursor');
if (cursor && window.matchMedia('(min-width: 901px)').matches) {
  window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  document.querySelectorAll('a, button, .teaser-card, .rec-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

const canvas = document.getElementById('web-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let w, h, nodes = [];
  const NODE_COUNT = 46;
  const LINK_DIST = 150;
  const MOUSE_RADIUS = 180;
  let mouse = { x: -9999, y: -9999 };

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function initNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25
      });
    }
  }
  initNodes();

  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  function tick() {
    ctx.clearRect(0, 0, w, h);

    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const opacity = (1 - dist / LINK_DIST) * 0.16;
          ctx.strokeStyle = `rgba(243,243,245,${opacity})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      const dmx = nodes[i].x - mouse.x, dmy = nodes[i].y - mouse.y;
      const mdist = Math.sqrt(dmx * dmx + dmy * dmy);
      if (mdist < MOUSE_RADIUS) {
        const opacity = (1 - mdist / MOUSE_RADIUS) * 0.55;
        ctx.strokeStyle = `rgba(232,56,61,${opacity})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
    requestAnimationFrame(tick);
  }
  tick();
}

const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('in');
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      toggle.textContent = menu.classList.contains('open') ? 'CLOSE' : 'MENU';
    });
  }
});

/* ============================================================
   PHASE 2 SPIDEY FEATURES — paste this whole block at the very
   end of js/main.js. Every feature creates its own DOM at
   runtime, so no HTML file needs to be touched by hand.
   ============================================================ */

/* ---- 1. Spider crawling the scroll indicator ---- */
(function initScrollSpider() {
  const dotsWrap = document.querySelector('.nav-dots');
  if (!dotsWrap) return; // page has no scroll-dots sidebar, skip

  const line = document.createElement('div');
  line.className = 'scroll-thread-line';
  dotsWrap.prepend(line);

  const spider = document.createElement('div');
  spider.className = 'scroll-thread-spider';
  spider.innerHTML = `<svg viewBox="0 0 24 24">
    <ellipse cx="12" cy="10" rx="2.2" ry="3"/>
    <ellipse cx="12" cy="15" rx="1.6" ry="2"/>
    <g stroke-linecap="round">
      <path d="M12 8 C9 6.5,6 5.5,3.5 3.5"/>
      <path d="M12 9.5 C8.5 8.5,5 8,2 7"/>
      <path d="M12 11 C8.5 11.5,5 12,2 13"/>
      <path d="M12 13 C9 14.5,6 16,3.5 18.5"/>
      <path d="M12 8 C15 6.5,18 5.5,20.5 3.5"/>
      <path d="M12 9.5 C15.5 8.5,19 8,22 7"/>
      <path d="M12 11 C15.5 11.5,19 12,22 13"/>
      <path d="M12 13 C15 14.5,18 16,20.5 18.5"/>
    </g>
  </svg>`;
  dotsWrap.appendChild(spider);

  function updateSpider() {
    const scrollable = document.body.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? window.scrollY / scrollable : 0;
    spider.style.top = (pct * dotsWrap.offsetHeight) + 'px';
  }
  window.addEventListener('scroll', updateSpider, { passive: true });
  window.addEventListener('resize', updateSpider);
  updateSpider();
})();

/* ---- 2. "Thwip" section transitions ---- */
(function initThwip() {
  const sections = document.querySelectorAll('section, footer.foot');
  if (!sections.length) return;
  const thwipObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      thwipObserver.unobserve(entry.target); // fire once per section only
      const rect = entry.target.getBoundingClientRect();
      const flash = document.createElement('div');
      flash.className = 'thwip-flash';
      flash.style.left = Math.min(window.innerWidth - 60, Math.max(20, rect.left + 40)) + 'px';
      flash.style.top = Math.max(20, rect.top + 20) + 'px';
      flash.innerHTML = `<svg viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="16" fill="none" stroke="#E8383D" stroke-width="2"/>
        <path d="M20 4v10M20 26v10M4 20h10M26 20h10M9 9l7 7M31 9l-7 7M9 31l7-7M31 31l-7-7" stroke="#E8383D" stroke-width="1.5"/>
      </svg>`;
      document.body.appendChild(flash);
      requestAnimationFrame(() => flash.classList.add('go'));
      flash.addEventListener('animationend', () => flash.remove());
    });
  }, { threshold: 0.35 });
  sections.forEach(s => thwipObserver.observe(s));
})();

/* ---- 3. Web-swing loading transition ---- */
(function initPageSwing() {
  const overlay = document.createElement('div');
  overlay.id = 'page-swing-overlay';
  overlay.innerHTML = `<svg class="swing-mark" viewBox="0 0 24 24">
    <ellipse cx="12" cy="10" rx="2.4" ry="3.2" fill="#E8383D"/>
    <ellipse cx="12" cy="15.5" rx="1.8" ry="2.2" fill="#E8383D"/>
    <g stroke="#E8383D" stroke-width="1.2" fill="none" stroke-linecap="round">
      <path d="M12 8 L4 4M12 9 L3 8M12 11 L3 12M12 13 L4 17M12 8 L20 4M12 9 L21 8M12 11 L21 12M12 13 L20 17"/>
    </g>
  </svg>`;
  document.body.prepend(overlay);
  setTimeout(() => {
    overlay.classList.add('done');
    setTimeout(() => overlay.remove(), 500);
  }, 150);
})();

/* ---- 4. HUD stat callouts ("Karen mode") ---- */
(function initHudStats() {
  const labels = ['CONFIRMED', 'VERIFIED', 'TRACKED', 'LOGGED'];
  const stats = document.querySelectorAll('.stat');
  if (!stats.length) return;
  const hudObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      hudObserver.unobserve(entry.target);
      const idx = Array.from(stats).indexOf(entry.target);
      const tag = document.createElement('div');
      tag.className = 'hud-tag';
      tag.textContent = '[ ' + labels[idx % labels.length] + ' ]';
      entry.target.appendChild(tag);
      requestAnimationFrame(() => tag.classList.add('show'));
      tag.addEventListener('animationend', () => tag.remove());
    });
  }, { threshold: 0.6 });
  stats.forEach(s => hudObserver.observe(s));
})();

/* ---- 5. Web-thread footer connector ---- */
(function initWebThreadConnector() {
  const thread = document.createElement('div');
  thread.id = 'web-thread-connector';
  document.body.appendChild(thread);
  function sway() {
    const scrollable = document.body.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? window.scrollY / scrollable : 0;
    thread.style.transform = `skewX(${(pct - 0.5) * 1.5}deg)`;
  }
  window.addEventListener('scroll', sway, { passive: true });
  sway();
})();

/* ---- 6. Comic-panel flash on internal page navigation ---- */
(function initComicTransition() {
  const flash = document.createElement('div');
  flash.id = 'comic-transition';
  document.body.appendChild(flash);

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:')) return;
    if (href.startsWith('http') || link.target === '_blank') return; // external / new-tab links untouched
    if (!href.endsWith('.html')) return;

    e.preventDefault();
    flash.classList.add('active');
    setTimeout(() => { window.location.href = href; }, 220);
  });
})();