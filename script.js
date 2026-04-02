
let i=0;
const slides=document.querySelectorAll('.slide');

function show(){
slides.forEach(s=>s.classList.remove('active'));
slides[i].classList.add('active');
}

function next(){if(i<slides.length-1){i++;show();}}
function prev(){if(i>0){i--;show();}}

document.addEventListener('keydown',e=>{
if(e.key==='ArrowRight')next();
if(e.key==='ArrowLeft')prev();
});

show();
