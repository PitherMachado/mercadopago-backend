let i=0;
const slides=document.querySelectorAll('.slide');
const counter=document.getElementById('counter');

function show(){
slides.forEach(s=>s.classList.remove('active'));
slides[i].classList.add('active');
counter.innerText=(i+1).toString().padStart(2,'0')+' / '+slides.length;
}

function next(){
if(i<slides.length-1){i++;show();}
}

function prev(){
if(i>0){i--;show();}
}

document.addEventListener('keydown',e=>{
if(e.key==='ArrowRight')next();
if(e.key==='ArrowLeft')prev();
});

show();

// simple particles
const c=document.getElementById('fx');
const ctx=c.getContext('2d');
let w,h,pts=[];
function resize(){
w=c.width=window.innerWidth;
h=c.height=window.innerHeight;
pts=Array.from({length:40},()=>({x:Math.random()*w,y:Math.random()*h}));
}
window.onresize=resize;
resize();

function loop(){
ctx.clearRect(0,0,w,h);
pts.forEach(p=>{
ctx.fillStyle='rgba(120,130,255,0.3)';
ctx.fillRect(p.x,p.y,2,2);
});
requestAnimationFrame(loop);
}
loop();
