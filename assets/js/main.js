const canvas = document.getElementById('particles');
if(canvas){
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];

  function resize(){
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    particles = Array.from({length: 42}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.5
    }));
  }

  function draw(){
    ctx.clearRect(0,0,w,h);
    for(let i=0;i<particles.length;i++){
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if(p.x < 0 || p.x > w) p.vx *= -1;
      if(p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = 'rgba(230,199,124,.85)';
      ctx.fill();

      for(let j=i+1;j<particles.length;j++){
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if(d < 120){
          ctx.beginPath();
          ctx.moveTo(p.x,p.y);
          ctx.lineTo(q.x,q.y);
          ctx.strokeStyle = `rgba(230,199,124,${(1 - d/120) * .18})`;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize);
}