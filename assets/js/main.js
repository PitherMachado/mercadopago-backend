const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const canvas = document.getElementById('network-bg');
const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas && ctx) {
  let w, h, dpr;
  let particles = [];

  const PARTICLE_COUNT = 92;
  const LINK_DISTANCE = 165;

  const mouse = {
    x: null,
    y: null,
    active: false
  };

  const lightOrb = {
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    radius: 230,
    speed: 0.009,
    resetTarget() {
      this.tx = Math.random() * w;
      this.ty = Math.random() * h;
    }
  };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.baseX = Math.random() * w;
      this.baseY = Math.random() * h;
      this.x = this.baseX;
      this.y = this.baseY;
      this.vx = (Math.random() - 0.5) * 0.16;
      this.vy = (Math.random() - 0.5) * 0.16;
      this.z = Math.random() * 1 + 0.25;
      this.phase = Math.random() * Math.PI * 2;

      if (!initial) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
      }
    }

    move(time) {
      this.baseX += this.vx * this.z;
      this.baseY += this.vy * this.z;

      if (this.baseX < -35) this.baseX = w + 35;
      if (this.baseX > w + 35) this.baseX = -35;
      if (this.baseY < -35) this.baseY = h + 35;
      if (this.baseY > h + 35) this.baseY = -35;

      const floatX = Math.cos(time * 0.00042 + this.phase) * 2.8 * this.z;
      const floatY = Math.sin(time * 0.00052 + this.phase) * 2.8 * this.z;

      let parallaxX = 0;
      let parallaxY = 0;

      if (mouse.active) {
        const mx = (mouse.x / w - 0.5);
        const my = (mouse.y / h - 0.5);
        parallaxX = -mx * 14 * this.z;
        parallaxY = -my * 14 * this.z;
      }

      this.x = this.baseX + floatX + parallaxX;
      this.y = this.baseY + floatY + parallaxY;
    }

    draw() {
      const size = 0.8 + this.z * 1.5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(242,217,142,${0.24 + this.z * 0.24})`;
      ctx.shadowBlur = 6 + this.z * 6;
      ctx.shadowColor = 'rgba(242,217,142,.12)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
  }

  createParticles();
  lightOrb.x = w * 0.35;
  lightOrb.y = h * 0.30;
  lightOrb.resetTarget();

  function drawDepthGlow() {
    const g1 = ctx.createRadialGradient(w * 0.16, h * 0.18, 0, w * 0.16, h * 0.18, 360);
    g1.addColorStop(0, 'rgba(242,217,142,.045)');
    g1.addColorStop(1, 'rgba(242,217,142,0)');

    const g2 = ctx.createRadialGradient(w * 0.84, h * 0.74, 0, w * 0.84, h * 0.74, 420);
    g2.addColorStop(0, 'rgba(94,234,212,.024)');
    g2.addColorStop(1, 'rgba(94,234,212,0)');

    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);
  }

  function drawTravelingLight() {
    const dx = lightOrb.tx - lightOrb.x;
    const dy = lightOrb.ty - lightOrb.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 24) lightOrb.resetTarget();

    lightOrb.x += dx * lightOrb.speed;
    lightOrb.y += dy * lightOrb.speed;

    let px = lightOrb.x;
    let py = lightOrb.y;

    if (mouse.active) {
      px += (mouse.x - w / 2) * 0.012;
      py += (mouse.y - h / 2) * 0.012;
    }

    const gradient = ctx.createRadialGradient(px, py, 0, px, py, lightOrb.radius);
    gradient.addColorStop(0, 'rgba(255,255,255,.05)');
    gradient.addColorStop(0.18, 'rgba(242,217,142,.07)');
    gradient.addColorStop(0.42, 'rgba(94,234,212,.03)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(px, py, lightOrb.radius, 0, Math.PI * 2);
    ctx.fill();

    return { x: px, y: py };
  }

  function connectParticles(lightPos) {
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const pa = particles[a];
        const pb = particles[b];

        const dx = pa.x - pb.x;
        const dy = pa.y - pb.y;
        const dist = Math.hypot(dx, dy);

        if (dist < LINK_DISTANCE) {
          const midX = (pa.x + pb.x) / 2;
          const midY = (pa.y + pb.y) / 2;
          const lightDist = Math.hypot(midX - lightPos.x, midY - lightPos.y);

          let alpha = (1 - dist / LINK_DISTANCE) * 0.10;
          if (lightDist < lightOrb.radius) {
            alpha += (1 - lightDist / lightOrb.radius) * 0.11;
          }

          if (mouse.active) {
            const mouseDist = Math.hypot(midX - mouse.x, midY - mouse.y);
            if (mouseDist < 150) alpha += (1 - mouseDist / 150) * 0.05;
          }

          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.strokeStyle = `rgba(242,217,142,${Math.min(alpha, 0.22)})`;
          ctx.lineWidth = 0.4 + ((pa.z + pb.z) / 2) * 0.34;
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(242,217,142,.05)';
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  function animate(time = 0) {
    ctx.clearRect(0, 0, w, h);
    drawDepthGlow();
    for (const p of particles) {
      p.move(time);
      p.draw();
    }
    const lightPos = drawTravelingLight();
    connectParticles(lightPos);
    requestAnimationFrame(animate);
  }

  animate();
}
