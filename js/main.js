const cursor = document.getElementById('cursor');

if (cursor && window.matchMedia('(min-width: 901px)').matches) {
  window.addEventListener('mousemove', (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
    cursor.classList.add('active');
  });

  document.querySelectorAll('a, button, .teaser-card, .rec-card').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}


/* ============================================================
   BACKGROUND WEB CANVAS
   ============================================================ */

const canvas = document.getElementById('web-canvas');

if (canvas) {
  const ctx = canvas.getContext('2d');

  let w;
  let h;
  let nodes = [];

  const NODE_COUNT = 46;
  const LINK_DIST = 150;
  const MOUSE_RADIUS = 180;

  let mouse = {
    x: -9999,
    y: -9999
  };

  let animationFrame = null;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

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

  function tick() {
    ctx.clearRect(0, 0, w, h);

    for (const node of nodes) {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > w) {
        node.vx *= -1;
      }

      if (node.y < 0 || node.y > h) {
        node.vy *= -1;
      }
    }

    const linkDistSq = LINK_DIST * LINK_DIST;
    const mouseRadiusSq = MOUSE_RADIUS * MOUSE_RADIUS;

    for (let i = 0; i < nodes.length; i++) {

      const current = nodes[i];

      for (let j = i + 1; j < nodes.length; j++) {

        const other = nodes[j];

        const dx = current.x - other.x;
        const dy = current.y - other.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < linkDistSq) {
          const dist = Math.sqrt(distSq);
          const opacity = (1 - dist / LINK_DIST) * 0.16;

          ctx.strokeStyle = `rgba(243,243,245,${opacity})`;
          ctx.lineWidth = 1;

          ctx.beginPath();
          ctx.moveTo(current.x, current.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }

      const dmx = current.x - mouse.x;
      const dmy = current.y - mouse.y;
      const mouseDistSq = dmx * dmx + dmy * dmy;

      if (mouseDistSq < mouseRadiusSq) {
        const mouseDist = Math.sqrt(mouseDistSq);
        const opacity =
          (1 - mouseDist / MOUSE_RADIUS) * 0.55;

        ctx.strokeStyle = `rgba(232,56,61,${opacity})`;
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(current.x, current.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    animationFrame = requestAnimationFrame(tick);
  }

  function stopCanvas() {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  function startCanvas() {
    if (animationFrame === null && !document.hidden) {
      animationFrame = requestAnimationFrame(tick);
    }
  }

  resize();
  initNodes();
  startCanvas();

  window.addEventListener('resize', () => {
    resize();
    initNodes();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopCanvas();
    } else {
      startCanvas();
    }
  });
}


window.addEventListener('load', () => {
  const revealEls = document.querySelectorAll('.reveal');

  if (!revealEls.length) return;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
});


/* ============================================================
   MOBILE MENU
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener('click', () => {

    menu.classList.toggle('open');

    toggle.textContent =
      menu.classList.contains('open')
        ? 'CLOSE'
        : 'MENU';

  });

});


/* ============================================================
   HUD STAT CALLOUTS
   ============================================================ */

(function initHudStats() {

  const stats = document.querySelectorAll('.stat');

  if (!stats.length) {
    return;
  }

  const labels = [
    'CONFIRMED',
    'VERIFIED',
    'TRACKED',
    'LOGGED'
  ];

  const observer = new IntersectionObserver(
    (entries) => {

      if (!entries.some((entry) => entry.isIntersecting)) {
        return;
      }

      observer.disconnect();

      stats.forEach((stat, index) => {

        const tag = document.createElement('div');

        tag.className = 'hud-tag';
        tag.textContent = `[ ${labels[index]} ]`;

        stat.appendChild(tag);

        requestAnimationFrame(() => {
          tag.classList.add('show');
        });

        tag.addEventListener(
          'animationend',
          () => tag.remove(),
          { once: true }
        );

      });

    },
    {
      threshold: 0.25
    }
  );

  const container =
    document.querySelector('.hero .stat-strip') ||
    document.querySelector('.hero .hero-stats-row') ||
    document.querySelector('.hero');

  if (container) {
    observer.observe(container);
  }

})();


/* ============================================================
   COMIC PANEL PAGE TRANSITION
   ============================================================ */

(function initComicTransition() {

  const flash = document.createElement('div');

  flash.id = 'comic-transition';

  document.body.appendChild(flash);

  document.addEventListener('click', (event) => {

    const link = event.target.closest('a');

    if (!link) {
      return;
    }

    const href = link.getAttribute('href');

    if (!href) {
      return;
    }

    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('http') ||
      link.target === '_blank'
    ) {
      return;
    }

    if (!href.endsWith('.html')) {
      return;
    }

    event.preventDefault();

    flash.classList.add('active');

    setTimeout(() => {
      window.location.href = href;
    }, 220);

  });

})();


/* ============================================================
   CASE FILES CAROUSEL
   ============================================================ */

(function initCaseFilesCarousel() {

  const track = document.getElementById('cfTrack');

  if (!track) {
    return;
  }

  const slides = Array.from(track.children);

  const dotsWrap = document.getElementById('cfDots');
  const prevBtn = document.getElementById('cfPrev');
  const nextBtn = document.getElementById('cfNext');

  if (!dotsWrap || !prevBtn || !nextBtn || !slides.length) {
    return;
  }

  slides.forEach((_, index) => {

    const dot = document.createElement('div');

    dot.className =
      `cf-dot${index === 0 ? ' active' : ''}`;

    dot.addEventListener('click', () => {
      scrollToSlide(index);
    });

    dotsWrap.appendChild(dot);

  });

  const dots = Array.from(dotsWrap.children);

  function scrollToSlide(index) {

    const slide = slides[index];

    if (!slide) {
      return;
    }

    track.scrollTo({
      left: slide.offsetLeft - track.offsetLeft,
      behavior: 'smooth'
    });

  }

  function updateActive() {

    let closest = 0;
    let minDistance = Infinity;

    slides.forEach((slide, index) => {

      const distance =
        Math.abs(
          slide.offsetLeft - track.scrollLeft
        );

      if (distance < minDistance) {
        minDistance = distance;
        closest = index;
      }

    });

    dots.forEach((dot, index) => {
      dot.classList.toggle(
        'active',
        index === closest
      );
    });

    return closest;
  }

  let scrollTimer;

  track.addEventListener(
    'scroll',
    () => {

      clearTimeout(scrollTimer);

      scrollTimer = setTimeout(
        updateActive,
        80
      );

    },
    { passive: true }
  );

  prevBtn.addEventListener('click', () => {

    const current = updateActive();

    scrollToSlide(
      Math.max(0, current - 1)
    );

  });

  nextBtn.addEventListener('click', () => {

    const current = updateActive();

    scrollToSlide(
      Math.min(
        slides.length - 1,
        current + 1
      )
    );

  });

  updateActive();

})();


/* ============================================================
   ACTIVE NAVIGATION
   ============================================================ */

(function initActiveNav() {

  const links = document.querySelectorAll(
    '.nav-links a'
  );

  if (!links.length) {
    return;
  }

  let currentPage =
    window.location.pathname
      .split('/')
      .pop()
      .toLowerCase();

  if (!currentPage || currentPage === '/') {
    currentPage = 'index.html';
  }

  links.forEach((link) => {

    link.classList.remove('active');

    const href =
      link.getAttribute('href');

    if (!href) {
      return;
    }

    const target =
      href.split('/').pop().toLowerCase();

    let active =
      currentPage === target;

    /* Project detail pages count as PROJECTS */
    if (
      target === 'projects.html' &&
      currentPage.startsWith('project-')
    ) {
      active = true;
    }

    if (active) {
      link.classList.add('active');
    }

  });

})();

(function pinSpideyCorner() {

  function pinSpidey() {

    const currentPage =
      document.body.dataset.page ||
      window.location.pathname.split('/').pop().toLowerCase();

    if (currentPage === 'index.html' || currentPage === '') return;

    const spidey = document.querySelector('.spidey-hanger');
    if (!spidey) return;

    document.body.appendChild(spidey);

    const isMobile = window.matchMedia('(max-width: 900px)').matches;

    spidey.style.cssText = `
  position: fixed !important;
  left: auto !important;
  right: ${isMobile ? '10px' : '35px'} !important;
  top: ${isMobile ? '70px' : '90px'} !important;
  width: ${isMobile ? '52px' : '110px'} !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  display: block !important;
  z-index: 500 !important;
  pointer-events: none !important;
`;

    const img = spidey.querySelector('img');
    if (img) img.style.cssText = 'width:100%; height:auto; display:block;';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pinSpidey);
  } else {
    pinSpidey();
  }

})();