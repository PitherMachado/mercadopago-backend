const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const canvas = document.getElementById('scene-bg');
const ctx = canvas?.getContext('2d');

if (canvas && ctx) {
  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let mouse = { x: 0, y: 0, active: false };

  const COUNT = 95;
  const LINK_DISTANCE = 170;

  const orb = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    radius: 260,
    speed: 0.008,
    setTarget() {
      this.tx = Math.random() * width;
      this.ty = Math.random() * height;
    }
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.baseX = Math.random() * width;
      this.baseY = Math.random() * height;
      this.x = this.baseX;
      this.y = this.baseY;
      this.vx = (Math.random() - 0.5) * 0.18;
      this.vy = (Math.random() - 0.5) * 0.18;
      this.z = 0.35 + Math.random() * 1.25;
      this.phase = Math.random() * Math.PI * 2;
      if (!initial) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
      }
    }

    move(time) {
      this.baseX += this.vx * this.z;
      this.baseY += this.vy * this.z;

      if (this.baseX < -40) this.baseX = width + 40;
      if (this.baseX > width + 40) this.baseX = -40;
      if (this.baseY < -40) this.baseY = height + 40;
      if (this.baseY > height + 40) this.baseY = -40;

      const floatX = Math.cos(time * 0.00038 + this.phase) * 3 * this.z;
      const floatY = Math.sin(time * 0.0005 + this.phase) * 3 * this.z;

      let parallaxX = 0;
      let parallaxY = 0;
      if (mouse.active) {
        const mx = mouse.x / width - 0.5;
        const my = mouse.y / height - 0.5;
        parallaxX = -mx * 20 * this.z;
        parallaxY = -my * 20 * this.z;
      }

      this.x = this.baseX + floatX + parallaxX;
      this.y = this.baseY + floatY + parallaxY;
    }

    draw() {
      const size = 0.9 + this.z * 1.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,216,142,${0.18 + this.z * 0.18})`;
      ctx.shadowBlur = 8 + this.z * 7;
      ctx.shadowColor = 'rgba(240,216,142,.14)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function buildParticles() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function drawAmbient() {
    const glow1 = ctx.createRadialGradient(width * 0.18, height * 0.16, 0, width * 0.18, height * 0.16, 380);
    glow1.addColorStop(0, 'rgba(240,216,142,.05)');
    glow1.addColorStop(1, 'rgba(240,216,142,0)');

    const glow2 = ctx.createRadialGradient(width * 0.84, height * 0.74, 0, width * 0.84, height * 0.74, 420);
    glow2.addColorStop(0, 'rgba(94,234,212,.03)');
    glow2.addColorStop(1, 'rgba(94,234,212,0)');

    const glow3 = ctx.createRadialGradient(width * 0.52, height * 0.38, 0, width * 0.52, height * 0.38, 580);
    glow3.addColorStop(0, 'rgba(255,255,255,.025)');
    glow3.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = glow3;
    ctx.fillRect(0, 0, width, height);
  }

  function drawOrb() {
    const dx = orb.tx - orb.x;
    const dy = orb.ty - orb.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 26) orb.setTarget();

    orb.x += dx * orb.speed;
    orb.y += dy * orb.speed;

    let px = orb.x;
    let py = orb.y;
    if (mouse.active) {
      px += (mouse.x - width / 2) * 0.012;
      py += (mouse.y - height / 2) * 0.012;
    }

    const gradient = ctx.createRadialGradient(px, py, 0, px, py, orb.radius);
    gradient.addColorStop(0, 'rgba(255,255,255,.05)');
    gradient.addColorStop(0.18, 'rgba(240,216,142,.07)');
    gradient.addColorStop(0.45, 'rgba(94,234,212,.03)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(px, py, orb.radius, 0, Math.PI * 2);
    ctx.fill();

    return { x: px, y: py };
  }

  function connect(light) {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const p1 = particles[a];
        const p2 = particles[b];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < LINK_DISTANCE) {
          const mx = (p1.x + p2.x) / 2;
          const my = (p1.y + p2.y) / 2;
          const orbDist = Math.hypot(mx - light.x, my - light.y);

          let alpha = (1 - dist / LINK_DISTANCE) * 0.11;

          if (orbDist < orb.radius) {
            alpha += (1 - orbDist / orb.radius) * 0.12;
          }

          if (mouse.active) {
            const mouseDist = Math.hypot(mx - mouse.x, my - mouse.y);
            if (mouseDist < 150) {
              alpha += (1 - mouseDist / 150) * 0.06;
            }
          }

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(240,216,142,${Math.min(alpha, 0.22)})`;
          ctx.lineWidth = 0.4 + ((p1.z + p2.z) / 2) * 0.32;
          ctx.stroke();
        }
      }
    }
  }

  function animate(time = 0) {
    ctx.clearRect(0, 0, width, height);
    drawAmbient();

    for (const particle of particles) {
      particle.move(time);
      particle.draw();
    }

    const light = drawOrb();
    connect(light);

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  resize();
  buildParticles();
  orb.x = width * 0.34;
  orb.y = height * 0.28;
  orb.setTarget();
  animate();
}
