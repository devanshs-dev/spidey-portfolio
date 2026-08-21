const cursor = document.getElementById('cursor');
if (cursor && window.matchMedia('(min-width: 901px)').matches) {
  window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursor.classList.add('active');
  });

  const strandSvg = document.getElementById('web-strand');
const strandPath = document.getElementById('web-strand-path');
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => {
    document.getElementById('cursor').classList.add('hover');
    const rect = el.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;
    const midX = (mouseX + targetX) / 2;
    const sagY = Math.max(mouseY, targetY) + 40;
    strandPath.setAttribute('d', `M ${mouseX} ${mouseY} Q ${midX} ${sagY} ${targetX} ${targetY}`);
    strandPath.classList.add('shooting');
  });
  el.addEventListener('mouseleave', () => {
    document.getElementById('cursor').classList.remove('hover');
    strandPath.classList.remove('shooting');
  });
});
}

const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('in'); });
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

// magnetic pull on buttons only (cards handled by tilt below)
document.querySelectorAll('.btn, .nav-cta').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });
  el.addEventListener('mouseleave', () => { el.style.transform = 'translate(0,0)'; });
});

// hero headline split-and-settle on load
const heroH1 = document.querySelector('.hero h1');
if (heroH1) {
  const words = heroH1.innerHTML.split(/(<br>)/).filter(Boolean);
  heroH1.innerHTML = words.map(w =>
    w === '<br>' ? '<br>' : `<span class="word-in">${w}</span>`
  ).join('');
  document.querySelectorAll('.word-in').forEach((w, i) => {
    setTimeout(() => w.classList.add('settled'), 80 * i);
  });
}

// ---- 1. Elastic web-thread trailing the cursor ----
if (window.matchMedia('(min-width: 901px)').matches) {
  const threadCanvas = document.createElement('canvas');
  threadCanvas.style.cssText = 'position:fixed;inset:0;z-index:9996;pointer-events:none;';
  document.body.appendChild(threadCanvas);
  const tctx = threadCanvas.getContext('2d');
  function resizeThread() { threadCanvas.width = window.innerWidth; threadCanvas.height = window.innerHeight; }
  window.addEventListener('resize', resizeThread);
  resizeThread();

  const SEGMENTS = 14;
  const points = Array.from({ length: SEGMENTS }, () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 }));
  let target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  window.addEventListener('mousemove', (e) => { target.x = e.clientX; target.y = e.clientY; });

  function drawThread() {
    points[0].x += (target.x - points[0].x) * 0.5;
    points[0].y += (target.y - points[0].y) * 0.5;
    for (let i = 1; i < points.length; i++) {
      points[i].x += (points[i - 1].x - points[i].x) * 0.35;
      points[i].y += (points[i - 1].y - points[i].y) * 0.35;
    }
    tctx.clearRect(0, 0, threadCanvas.width, threadCanvas.height);
    tctx.beginPath();
    tctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      tctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    tctx.strokeStyle = 'rgba(232,56,61,0.35)';
    tctx.lineWidth = 1;
    tctx.stroke();
    requestAnimationFrame(drawThread);
  }
  drawThread();
}

(function initWebTrail() {
  const canvas = document.getElementById('web-trail');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let points = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  document.addEventListener('mousemove', e => {
    points.push({ x: e.clientX, y: e.clientY, t: Date.now() });
  });

  function draw() {
    const now = Date.now();
    points = points.filter(p => now - p.t < 420);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 1; i < points.length; i++) {
      const age = (now - points[i].t) / 420;
      const opacity = (1 - age) * 0.55;
      const width = (1 - age) * 2.2 + 0.3;
      ctx.beginPath();
      ctx.moveTo(points[i - 1].x, points[i - 1].y);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.strokeStyle = `rgba(232,56,61,${opacity})`;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ---- 2. 3D tilt on cards ----
document.querySelectorAll('.teaser-card, .rec-card').forEach(el => {
  el.style.transformStyle = 'preserve-3d';
  el.style.willChange = 'transform';
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotX = (py - 0.5) * -10;
    const rotY = (px - 0.5) * 10;
    el.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'perspective(700px) rotateX(0) rotateY(0) scale(1)';
  });
});

// ---- 3. Animated stat counters ----
document.querySelectorAll('.stat-num').forEach(el => {
  const raw = el.textContent.trim();
  const isDecimal = raw.includes('.');
  const target = parseFloat(raw);
  if (isNaN(target)) return;
  let started = false;
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        const duration = 1200;
        const start = performance.now();
        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const val = target * eased;
          el.textContent = isDecimal ? val.toFixed(2) : Math.round(val);
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = raw;
        }
        requestAnimationFrame(step);
      }
    });
  }, { threshold: 0.5 });
  counterObserver.observe(el);
});

// ---- 4. Text-scramble decrypt on section labels ----
const scrambleChars = '!<>-_\\/[]{}—=+*^?#________';
function scrambleInto(el, finalText) {
  let frame = 0;
  function update() {
    let out = '';
    for (let i = 0; i < finalText.length; i++) {
      if (i < frame / 2) out += finalText[i];
      else out += finalText[i] === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
    }
    el.textContent = out;
    frame++;
    if (frame / 2 < finalText.length) requestAnimationFrame(update);
    else el.textContent = finalText;
  }
  update();
}
document.querySelectorAll('.section-label').forEach(el => {
  const final = el.childNodes[0] ? el.childNodes[0].textContent : el.textContent;
  const scrambleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        scrambleInto(el.firstChild || el, final);
        scrambleObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });
  scrambleObserver.observe(el);
});

// Case Files Carousel
(function(){
  const track = document.getElementById('cfTrack');
  const prevBtn = document.getElementById('cfPrev');
  const nextBtn = document.getElementById('cfNext');
  const dotsWrap = document.getElementById('cfDots');
  if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

  const slides = Array.from(track.children);
  dotsWrap.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'cf-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => scrollToSlide(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function scrollToSlide(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }

  function currentIndex() {
    let closest = 0, minDist = Infinity;
    slides.forEach((s, i) => {
      const dist = Math.abs(s.offsetLeft - track.scrollLeft);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    return closest;
  }

  function updateDots() {
    const idx = currentIndex();
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  track.addEventListener('scroll', () => {
    clearTimeout(track._t);
    track._t = setTimeout(updateDots, 80);
  });

  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToSlide(currentIndex() - 1);
    setTimeout(updateDots, 400);
  });
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToSlide(currentIndex() + 1);
    setTimeout(updateDots, 400);
  });
})();

/* ---- animated web background on #web-canvas (single source of truth) ---- */
(function initWebCanvas() {
  const canvas = document.getElementById('web-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, nodes = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.floor((w * h) / 45000);
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          ctx.strokeStyle = `rgba(232,56,61,${0.09 * (1 - dist / 140)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  resize();
  tick();
})();

(function initWantedTilt() {
  const poster = document.getElementById('wantedPoster');
  if (!poster) return;
  document.addEventListener('mousemove', e => {
    const rx = (e.clientY / window.innerHeight - 0.5) * -8;
    const ry = (e.clientX / window.innerWidth - 0.5) * 8;
    poster.style.transform = `rotate(3deg) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
})();

/* ============================================================
   1. WEB-ZIP SCROLLING
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    
    e.preventDefault(); // Stop normal scroll

    // Create web line
    const line = document.createElement('div');
    line.className = 'web-zip-line';
    // Align line to where the user clicked
    line.style.left = e.clientX + 'px'; 
    document.body.appendChild(line);

    // Shoot line down
    setTimeout(() => { line.style.height = '100vh'; }, 10);

    // Yank the screen to the section
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'auto' }); // Instant snap
      line.style.opacity = '0'; // Fade out
      setTimeout(() => line.remove(), 300);
    }, 280); // Happens exactly as line hits bottom
  });
});


/* ============================================================
   GLOBAL NAVIGATION FIX
   ============================================================ */

(function initGlobalNavigation() {

  function setupNavigation() {

    const nav = document.querySelector('.nav-links');

    if (!nav) return;

    let currentPage =
      window.location.pathname
        .split('/')
        .pop()
        .toLowerCase();

    if (!currentPage || currentPage === '/') {
      currentPage = 'index.html';
    }

    /*
      Rebuild the navigation so every page always has
      the exact same five links.
    */

    const links = [
      ['HOME', 'index.html'],
      ['PROJECTS', 'projects.html'],
      ['ABOUT', 'about.html'],
      ['WORK WITH ME', 'work-with-me.html'],
      ['CONTACT', 'contact.html']
    ];

    nav.innerHTML = '';

    links.forEach(([label, href]) => {

      const link = document.createElement('a');

      link.href = href;
      link.textContent = label;

      const targetPage = href.toLowerCase();

      let isActive = currentPage === targetPage;

      /*
        Project detail pages count as PROJECTS.
      */

      if (
        targetPage === 'projects.html' &&
        currentPage.startsWith('project-')
      ) {
        isActive = true;
      }

      if (isActive) {
        link.classList.add('active');
      }

      nav.appendChild(link);

    });

    /*
      Expose current page for page-specific CSS.
    */

    document.body.dataset.page = currentPage;

  }


  /*
    Add Spider-Man to pages that don't already have him.
  */

  function ensureSpidey() {

    const main = document.querySelector('main');

    if (!main) return;

    const firstSection = main.querySelector('section');

    if (!firstSection) return;

    if (firstSection.querySelector('.spidey-hanger')) {
      return;
    }

    const spidey = document.createElement('div');

    spidey.className = 'spidey-hanger';

    spidey.innerHTML = `
      <img
        src="assets/spider-swing.png"
        alt="Spider-Man hanging upside down"
      >
    `;

    firstSection.prepend(spidey);

  }


  setupNavigation();
  ensureSpidey();

})();

/* ============================================================
   HUD STAT CALLOUTS — ALL 4 SYNCHRONIZED
   ============================================================ */

(function initHudStats() {

  const stats = document.querySelectorAll('.hero .stat');
  if (!stats.length) return;

  const labels = [
    'CONFIRMED',
    'VERIFIED',
    'TRACKED',
    'LOGGED'
  ];

  const container =
    document.querySelector('.hero .stat-strip') ||
    document.querySelector('.hero .hero-stats-row');

  if (!container) return;

  const observer = new IntersectionObserver((entries) => {

    if (!entries.some(entry => entry.isIntersecting)) return;

    observer.disconnect();

    stats.forEach((stat, index) => {

      const tag = document.createElement('div');
      tag.className = 'hud-tag';
      tag.textContent = '[ ' + labels[index] + ' ]';

      stat.appendChild(tag);

      requestAnimationFrame(() => {
        tag.classList.add('show');
      });

    });

  }, {
    threshold: 0.25
  });

  observer.observe(container);

})();

/* ============================================================
   FORCE ACTIVE NAV
   ============================================================ */

(function forceActiveNav() {

  const links = document.querySelectorAll('.nav-links a');

  if (!links.length) return;

  let page = window.location.pathname
    .split('/')
    .pop()
    .toLowerCase();

  if (!page || page === '/') {
    page = 'index.html';
  }

  links.forEach(link => {

    link.classList.remove('active');

    const href = link.getAttribute('href');

    if (!href) return;

    const target = href
      .split('/')
      .pop()
      .toLowerCase();

    let active = page === target;

    /* Project detail pages */
    if (
      target === 'projects.html' &&
      page.startsWith('project-')
    ) {
      active = true;
    }

    if (active) {
      link.classList.add('active');
    }

  });

})();


/* ============================================================
   ADD SOCIAL ICONS TO ALL NAVBARS
   ============================================================ */

(function addNavbarSocials() {

  const nav = document.querySelector('.nav');

  if (!nav) return;

  /* Already exists → do nothing */
  if (nav.querySelector('.nav-social')) return;

  const hireMe = nav.querySelector('.nav-cta');

  const social = document.createElement('div');

  social.className = 'nav-social';

  social.innerHTML = `
    
    <a
      href="https://www.linkedin.com/in/connect-to-devansh-singh/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LinkedIn"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2ZM8 19H5v-9h3ZM6.5 8.25A1.75 1.75 0 1 1 8.3 6.5a1.78 1.78 0 0 1-1.8 1.75ZM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19v5h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.86 3.36 3.66Z"/>
      </svg>
    </a>

    <a
      href="https://github.com/devanshs-dev"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2A10 10 0 0 0 8.84 21.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.34-3.37-1.34a2.64 2.64 0 0 0-1.11-1.46c-.91-.62.07-.61.07-.61a2.1 2.1 0 0 1 1.53 1 2.15 2.15 0 0 0 2.94.84 2.15 2.15 0 0 1 .64-1.35c-2.22-.25-4.55-1.12-4.55-4.94a3.87 3.87 0 0 1 1-2.69 3.6 3.6 0 0 1 .1-2.65s.84-.27 2.75 1a9.47 9.47 0 0 1 5 0c1.91-1.29 2.75-1 2.75-1a3.6 3.6 0 0 1 .1 2.65 3.87 3.87 0 0 1 1 2.69 3.6 3.6 0 0 1 .1 2.65s.84-.27 2.75-1a9.47 9.47 0 0 1 5 0c1.91-1.29 2.75-1 2.75-1a3.6 3.6 0 0 1 .1 2.65 3.87 3.87 0 0 1 .1 2.65s.84-.27 2.75-1A10 10 0 0 0 12 2Z"/>
      </svg>
    </a>

    <a
      href="mailto:imdevansh.08@gmail.com"
      aria-label="Email"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h16v16H4z"/>
        <path d="m4 4 8 9 8-9"/>
      </svg>
    </a>

  `;

  if (hireMe) {
    nav.insertBefore(social, hireMe);
  } else {
    nav.appendChild(social);
  }

})();


/* ============================================================
   ADD SOCIAL ICONS TO ALL PAGE NAVBARS
   ============================================================ */

(function addNavbarSocials() {

  const nav = document.querySelector('.nav');

  if (!nav) return;

  /* Don't create duplicates */
  if (nav.querySelector('.nav-social')) return;

  const hireMe = nav.querySelector('.nav-cta');

  if (!hireMe) return;

  const social = document.createElement('div');

  social.className = 'nav-social';

  social.innerHTML = `
    <a
      href="https://www.linkedin.com/in/connect-to-devansh-singh/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LinkedIn"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2ZM8 19H5v-9h3ZM6.5 8.25A1.75 1.75 0 1 1 8.3 6.5a1.78 1.78 0 0 1-1.8 1.75ZM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19v5h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.86 3.36 3.66Z"/>
      </svg>
    </a>

    <a
      href="https://github.com/devanshs-dev"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2A10 10 0 0 0 8.84 21.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.34-3.37-1.34a2.64 2.64 0 0 0-1.11-1.46c-.91-.62-.07-.61-.07-.61a2.1 2.1 0 0 1 1.53 1 2.15 2.15 0 0 0 2.94.84 2.15 2.15 0 0 1 .64-1.35c-2.22-.25-4.55-1.12-4.55-4.94a3.87 3.87 0 0 1 1-2.69 3.6 3.6 0 0 1 .1-2.65s.84-.27 2.75 1a9.47 9.47 0 0 1 5 0c1.91-1.29 2.75-1 2.75-1a3.6 3.6 0 0 1 .1 2.65s-.84.27-2.75 1a9.47 9.47 0 0 1 5 0c1.91-1.29 2.75-1 2.75-1a3.6 3.6 0 0 1 .1-2.65s.84-.27 2.75-1A10 10 0 0 0 12 2Z"/>
      </svg>
    </a>

    <a
      href="mailto:imdevansh.08@gmail.com"
      aria-label="Email"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h16v16H4z"/>
        <path d="m4 4 8 9 8-9"/>
      </svg>
    </a>
  `;

  /* Put icons immediately before the existing HIRE ME button */
  nav.insertBefore(social, hireMe);

})();