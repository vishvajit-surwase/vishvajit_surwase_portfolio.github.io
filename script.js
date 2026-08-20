'use strict';

// ========================================
// LOADER
// ========================================
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('out');
    boot();
  }, 1800);
});

function boot() {
  initBackground();
  initSpotlight();
  initTypewriter();
  initNavbar();
  initHamburger();
  initReveal();
  initSkillBars();
  initProjectExplosions();
  initAvatar3DRotation();
  initExperienceCalculator();
  initSmoothScroll();
}

// ========================================
// PERSISTENT BACKGROUND — Three.js
// Subtle floating particles, always visible
// ========================================
function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = window.innerWidth, H = window.innerHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(W, H);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 1000);
  camera.position.z = 6;

  const COUNT = window.innerWidth < 768 ? 600 : 1200;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  const vel = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    pos[i3]     = (Math.random() - 0.5) * 20;
    pos[i3 + 1] = (Math.random() - 0.5) * 14;
    pos[i3 + 2] = (Math.random() - 0.5) * 6;

    // Very slow drift
    vel[i3]     = (Math.random() - 0.5) * 0.003;
    vel[i3 + 1] = (Math.random() - 0.5) * 0.003;
    vel[i3 + 2] = 0;

    // Mostly dark with occasional warm orange tint
    const r = Math.random();
    if (r > 0.85) {
      // Warm particle — orange-ish
      col[i3]     = 0.98; col[i3+1] = 0.45; col[i3+2] = 0.09;
    } else {
      // Neutral dim particle
      const b = 0.12 + Math.random() * 0.18;
      col[i3] = b; col[i3+1] = b * 0.9; col[i3+2] = b * 0.8;
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.022,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Mouse influence
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 0.8;
    my = -(e.clientY / window.innerHeight - 0.5) * 0.5;
  });

  function tick() {
    requestAnimationFrame(tick);

    const p = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      p[i3]     += vel[i3];
      p[i3 + 1] += vel[i3 + 1];

      // Wrap around screen bounds
      if (p[i3] > 10)  p[i3] = -10;
      if (p[i3] < -10) p[i3] = 10;
      if (p[i3+1] > 7)  p[i3+1] = -7;
      if (p[i3+1] < -7) p[i3+1] = 7;
    }
    geo.attributes.position.needsUpdate = true;

    // Gentle scene tilt from mouse — very subtle
    scene.rotation.y += (mx * 0.05 - scene.rotation.y) * 0.02;
    scene.rotation.x += (my * 0.03 - scene.rotation.x) * 0.02;

    renderer.render(scene, camera);
  }
  tick();

  // Resize (use ResizeObserver — no page reload)
  const ro = new ResizeObserver(() => {
    const nw = window.innerWidth, nh = window.innerHeight;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
  });
  ro.observe(document.documentElement);
}

// ========================================
// SPOTLIGHT EFFECT (follows mouse)
// ========================================
function initSpotlight() {
  const sp = document.getElementById('spotlight');
  if (!sp) return;

  document.addEventListener('mousemove', e => {
    sp.style.left = e.clientX + 'px';
    sp.style.top  = e.clientY + 'px';
  });
}

// ========================================
// TYPEWRITER
// ========================================
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const roles = [
    'Automation Engineer',
    'RPA Bot Developer',
    'Python Developer',
    'AI Solutions Builder',
  ];

  let ri = 0, ci = 0, del = false;

  function tick() {
    const word = roles[ri];
    if (del) {
      el.textContent = word.slice(0, ci--);
      if (ci < 0) { del = false; ri = (ri + 1) % roles.length; setTimeout(tick, 350); return; }
      setTimeout(tick, 45);
    } else {
      el.textContent = word.slice(0, ci++);
      if (ci > word.length) { del = true; setTimeout(tick, 1800); return; }
      setTimeout(tick, 110);
    }
  }
  tick();
}

// ========================================
// NAVBAR — scroll state + active links
// ========================================
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Intersection observer for active links
  const sections = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nl');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nl[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(s => obs.observe(s));
}

// ========================================
// HAMBURGER
// ========================================
function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const mnav = document.getElementById('mob-nav');
  if (!btn || !mnav) return;

  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('open');
    mnav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mnav.querySelectorAll('.mob-nl, .mob-resume').forEach(el => {
    el.addEventListener('click', () => {
      btn.classList.remove('open');
      mnav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ========================================
// SCROLL REVEAL — IntersectionObserver
// ========================================
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('in'), i * 80);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

// ========================================
// SKILL BARS
// ========================================
function initSkillBars() {
  const fills = document.querySelectorAll('.fill');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const w = e.target.dataset.w || '80';
        setTimeout(() => { e.target.style.width = w + '%'; }, 250);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(f => obs.observe(f));
}

// ========================================
// IMAGE EXPLOSION EFFECT
// Like the shirt website — pixel-sampled particles
// ========================================
function initProjectExplosions() {
  document.querySelectorAll('.proj-img-wrap').forEach(wrap => {
    const canvas = wrap.querySelector('.explode-canvas');
    const img    = wrap.querySelector('.proj-img');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let raf = null;
    let exploding = false;
    let initialized = false;

    function resize() {
      canvas.width  = wrap.offsetWidth;
      canvas.height = wrap.offsetHeight;
    }

    // Palette per project type based on data-project or fallback
    const PALETTE = [
      '#f97316', '#fb923c', '#fbbf24',
      '#e2e8f0', '#94a3b8', '#6366f1',
    ];

    function makeParticles() {
      resize();
      particles = [];
      const W = canvas.width, H = canvas.height;
      const COUNT = Math.floor(W * H / 200); // density

      // Try pixel-sampling the image
      let pixels = null;
      if (img && img.complete && img.naturalWidth > 0) {
        try {
          const off = document.createElement('canvas');
          off.width = img.naturalWidth;
          off.height = img.naturalHeight;
          off.getContext('2d').drawImage(img, 0, 0);
          pixels = off.getContext('2d').getImageData(0, 0, off.width, off.height).data;
        } catch (_) {}
      }

      for (let i = 0; i < COUNT; i++) {
        const ox = Math.random() * W;
        const oy = Math.random() * H;

        let color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        if (pixels) {
          const sx = Math.floor((ox / W) * img.naturalWidth);
          const sy = Math.floor((oy / H) * img.naturalHeight);
          const idx = (sy * img.naturalWidth + sx) * 4;
          const r = pixels[idx], g = pixels[idx+1], b = pixels[idx+2];
          color = `rgb(${r},${g},${b})`;
        }

        const angle  = Math.random() * Math.PI * 2;
        const speed  = 2 + Math.random() * 5;
        const size   = 1.2 + Math.random() * 3.5;
        const spin   = (Math.random() - 0.5) * 0.3;

        particles.push({
          ox, oy,
          x: ox, y: oy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          tx: ox + Math.cos(angle) * speed * 55,
          ty: oy + Math.sin(angle) * speed * 55,
          size, color, spin,
          progress: 0,
          shape: Math.random() > 0.6 ? 'square' : 'circle',
          rotation: Math.random() * Math.PI * 2,
        });
      }
      initialized = true;
    }

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function easeIn(t)  { return t * t * t; }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let done = true;

      particles.forEach(p => {
        p.progress = Math.min(1, p.progress + (exploding ? 0.025 : 0.035));
        p.rotation += p.spin;

        const t = exploding ? easeOut(p.progress) : easeOut(p.progress);
        if (exploding) {
          p.x = p.ox + (p.tx - p.ox) * t;
          p.y = p.oy + (p.ty - p.oy) * t;
        } else {
          p.x = p.tx + (p.ox - p.tx) * t;
          p.y = p.ty + (p.oy - p.ty) * t;
        }

        if (p.progress < 1) done = false;

        const alpha = exploding
          ? 0.85 * (1 - p.progress * 0.2)
          : 0.85 * (1 - p.progress * 0.1);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 5;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'square') {
          const s = p.size;
          ctx.fillRect(-s / 2, -s / 2, s, s);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (!done) {
        raf = requestAnimationFrame(draw);
      } else {
        if (!exploding) ctx.clearRect(0, 0, canvas.width, canvas.height);
        raf = null;
      }
    }

    function explode() {
      if (raf) cancelAnimationFrame(raf);
      exploding = true;
      makeParticles();
      particles.forEach(p => { p.progress = 0; p.x = p.ox; p.y = p.oy; });
      draw();
    }

    function reassemble() {
      if (!initialized || !particles.length) return;
      if (raf) cancelAnimationFrame(raf);
      exploding = false;
      particles.forEach(p => { p.progress = 0; p.x = p.tx; p.y = p.ty; });
      draw();
    }

    wrap.addEventListener('mouseenter', explode);
    wrap.addEventListener('mouseleave', reassemble);
    wrap.addEventListener('touchstart', () => { explode(); }, { passive: true });
    wrap.addEventListener('touchend',   () => { reassemble(); }, { passive: true });
  });
}

// ========================================
// SMOOTH SCROLL
// ========================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ========================================
// RESUME DOWNLOAD
// ========================================
window.downloadResume = function () {
  const el = document.getElementById('ats-resume');
  if (!el || typeof html2pdf === 'undefined') return;
  el.style.display = 'block';
  html2pdf().set({
    margin: 0,
    filename: 'Vishvajit_Surwase_Resume.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(el).save().then(() => { el.style.display = 'none'; });
};

// ========================================
// DYNAMIC EXPERIENCE CALCULATOR — Joined June 16, 2025
// Calculates exact live experience to show visitors (e.g. 1.2+ Yrs)
// ========================================
function initExperienceCalculator() {
  const joinDate = new Date(2025, 5, 16); // June 16, 2025 (month is 0-indexed: 5 = June)
  const now = new Date();

  // Calculate difference in fractional years
  const diffTime = Math.max(0, now - joinDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffYears = Math.max(1.0, (diffDays / 365.25)).toFixed(1);

  // Update experience chips dynamically
  const expChip = document.getElementById('exp-chip-val');
  if (expChip) {
    expChip.textContent = `${diffYears}+`;
  }
}

// ========================================
// CONTACT FORM — Triggers Gmail / Email App with Feeded Data
// ========================================
window.handleForm = function (e) {
  e.preventDefault();
  const name    = document.getElementById('f-name').value;
  const email   = document.getElementById('f-email').value;
  const message = document.getElementById('f-msg').value;

  // Construct mailto URL with feeded data
  const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
  const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

  const mailtoUrl = `mailto:vishvajit1686@gmail.com?subject=${subject}&body=${body}`;

  // Open email application automatically
  window.location.href = mailtoUrl;

  const btn = document.getElementById('f-submit');
  btn.textContent = '🚀 Opening Email App...';
  btn.style.background = '#16a34a';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Send Message →';
    btn.style.background = '';
    btn.disabled = false;
    e.target.reset();
  }, 4000);
};

// ========================================
// 3D ROTATING AVATAR — 240 frames from 'scrolled images' folder
// Dynamic black background removal + Mouse/Scroll 360° rotation
// ========================================
window._transparentAvatarFrames = [];

function initAvatar3DRotation() {
  const canvas = document.getElementById('avatar-3d-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const TOTAL_FRAMES = 240;
  const processedFrames = [];
  window._transparentAvatarFrames = processedFrames;

  let currentFrameIdx = 0;
  let targetFrameIdx  = 0;
  let isMouseActive   = false;
  let mouseTimer      = null;

  // --- Dynamic Black Background Removal ---
  function removeBlackBackground(img) {
    const off = document.createElement('canvas');
    const w = img.naturalWidth || img.width || 400;
    const h = img.naturalHeight || img.height || 400;
    off.width = w;
    off.height = h;
    const octx = off.getContext('2d');
    octx.drawImage(img, 0, 0, w, h);

    try {
      const imgData = octx.getImageData(0, 0, w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i+1], b = d[i+2];
        const maxVal = Math.max(r, g, b);
        // Strips dark background
        if (maxVal < 26) {
          d[i + 3] = 0;
        } else if (maxVal < 52) {
          // Soft edge feathering
          d[i + 3] = Math.floor(((maxVal - 26) / 26) * 255);
        }
      }
      octx.putImageData(imgData, 0, 0);
    } catch (_) {
      // CORS or canvas fallback
    }
    return off;
  }

  // --- Load all 240 frames ---
  let loadedCount = 0;
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    const num = String(i).padStart(3, '0');
    img.src = `scrolled images/ezgif-frame-${num}.jpg`;

    img.onload = () => {
      const cleanedCanvas = removeBlackBackground(img);
      processedFrames[i - 1] = cleanedCanvas;
      loadedCount++;
      if (loadedCount === 1) renderFrame(0);
    };

    img.onerror = () => {
      loadedCount++;
    };
  }

  function drawImageCover(c, img) {
    const cw = c.canvas.width, ch = c.canvas.height;
    const iw = img.width || img.naturalWidth, ih = img.height || img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const nw = iw * scale, nh = ih * scale;
    const cx = (cw - nw) / 2;
    const cy = (ch - nh) / 2;
    c.drawImage(img, cx, cy, nw, nh);
  }

  function renderFrame(idx) {
    const validIdx = Math.floor((idx % TOTAL_FRAMES + TOTAL_FRAMES) % TOTAL_FRAMES);
    const frame = processedFrames[validIdx];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (frame) {
      drawImageCover(ctx, frame);
      const ph = document.getElementById('avatar-ph');
      if (ph) ph.style.display = 'none';
    }
  }

  // --- Interaction: Combined Mouse Move + Mouse Scroll + Drag Controls ---
  let scrollAcc = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartFrame = 0;

  // 1. Mouse Wheel Scroll
  window.addEventListener('wheel', e => {
    scrollAcc += e.deltaY * 0.18;
    targetFrameIdx = scrollAcc;
  }, { passive: true });

  // 2. Page Scroll Position
  window.addEventListener('scroll', () => {
    targetFrameIdx = scrollAcc + (window.scrollY * 0.35);
  }, { passive: true });

  // 3. Mouse Movement across Screen (Cursor Tracking)
  window.addEventListener('mousemove', e => {
    if (!isDragging) {
      // Mouse X maps to subtler head tilt angle
      const mouseRatio = (e.clientX / window.innerWidth - 0.5);
      targetFrameIdx = scrollAcc + (mouseRatio * 40);
    }
  }, { passive: true });

  // 4. Direct Mouse Drag on Avatar Centerpiece
  const avatarCenterEl = document.getElementById('avatar-center');
  if (avatarCenterEl) {
    avatarCenterEl.addEventListener('mousedown', e => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartFrame = targetFrameIdx;
      document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', e => {
      if (isDragging) {
        const dx = e.clientX - dragStartX;
        targetFrameIdx = dragStartFrame + (dx * 0.8);
        scrollAcc = targetFrameIdx;
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = '';
      }
    });
  }

  // 5. Mobile Touch Swipe Support
  let touchStartY = 0;
  window.addEventListener('touchstart', e => {
    if (e.touches[0]) touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (e.touches[0]) {
      const dy = touchStartY - e.touches[0].clientY;
      scrollAcc += dy * 0.25;
      targetFrameIdx = scrollAcc;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  // Smooth 60FPS render loop with lerp inertia
  function animLoop() {
    requestAnimationFrame(animLoop);

    const diff = targetFrameIdx - currentFrameIdx;
    currentFrameIdx += diff * 0.12;

    renderFrame(currentFrameIdx);
  }
  animLoop();
}
