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

  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  function initNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25 });
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
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const dmx = nodes[i].x - mouse.x, dmy = nodes[i].y - mouse.y;
      const mdist = Math.sqrt(dmx * dmx + dmy * dmy);
      if (mdist < MOUSE_RADIUS) {
        const opacity = (1 - mdist / MOUSE_RADIUS) * 0.55;
        ctx.strokeStyle = `rgba(232,56,61,${opacity})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    requestAnimationFrame(tick);
  }
  tick();
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

// spider-sense pulse on hover
document.querySelectorAll('a, button, .teaser-card, .rec-card').forEach(el => {
  el.addEventListener('mouseenter', (e) => {
    const ring = document.createElement('div');
    ring.className = 'pulse-ring active';
    document.body.appendChild(ring);
    const rect = el.getBoundingClientRect();
    ring.style.left = (rect.left + rect.width / 2) + 'px';
    ring.style.top = (rect.top + rect.height / 2) + 'px';
    setTimeout(() => ring.remove(), 600);
  });
});

// web-shooter click trail
document.querySelectorAll('a[href]').forEach(link => {
  link.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || this.target === '_blank') return;
    e.preventDefault();
    const rect = this.getBoundingClientRect();
    const startX = window.innerWidth / 2, startY = window.innerHeight - 20;
    const endX = rect.left + rect.width / 2, endY = rect.top + rect.height / 2;
    const line = document.createElement('div');
    line.className = 'web-line';
    const dx = endX - startX, dy = endY - startY;
    const len = Math.sqrt(dx * dx + dy * dy);
    line.style.width = len + 'px';
    line.style.left = startX + 'px';
    line.style.top = startY + 'px';
    line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
    document.body.appendChild(line);
    setTimeout(() => { window.location.href = href; }, 180);
  });
});

// wall-crawl nav dots active state
const dots = document.querySelectorAll('.nav-dots a');
if (dots.length) {
  const dotSections = Array.from(dots).map(d => document.querySelector(d.getAttribute('href')));
  window.addEventListener('scroll', () => {
    let current = 0;
    dotSections.forEach((sec, i) => {
      if (sec && window.scrollY >= sec.offsetTop - window.innerHeight / 2) current = i;
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  });
}