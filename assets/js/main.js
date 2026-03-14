
const year = document.getElementById('year');
if(year) year.textContent = new Date().getFullYear();

const canvas = document.getElementById('network-bg');
const ctx = canvas.getContext('2d');

let w,h;
let particles=[];

function resize(){
w=canvas.width=window.innerWidth;
h=canvas.height=window.innerHeight;
}
window.addEventListener('resize',resize);
resize();

class Particle{
constructor(){
this.x=Math.random()*w;
this.y=Math.random()*h;
this.vx=(Math.random()-.5)*0.3;
this.vy=(Math.random()-.5)*0.3;
}

move(){
this.x+=this.vx;
this.y+=this.vy;
if(this.x<0||this.x>w)this.vx*=-1;
if(this.y<0||this.y>h)this.vy*=-1;
}

draw(){
ctx.beginPath();
ctx.arc(this.x,this.y,2,0,Math.PI*2);
ctx.fillStyle="rgba(230,199,124,.7)";
ctx.fill();
}
}

for(let i=0;i<90;i++)particles.push(new Particle());

function connect(){
for(let a=0;a<particles.length;a++){
for(let b=a+1;b<particles.length;b++){
let dx=particles[a].x-particles[b].x;
let dy=particles[a].y-particles[b].y;
let dist=Math.sqrt(dx*dx+dy*dy);
if(dist<140){
ctx.strokeStyle="rgba(230,199,124,"+(1-dist/140)*0.25+")";
ctx.lineWidth=1;
ctx.beginPath();
ctx.moveTo(particles[a].x,particles[a].y);
ctx.lineTo(particles[b].x,particles[b].y);
ctx.stroke();
}
}
}
}

function animate(){
ctx.clearRect(0,0,w,h);
particles.forEach(p=>{
p.move();
p.draw();
});
connect();
requestAnimationFrame(animate);
}

animate();
