// Равномерный бумажный лист: центр тяжести должен быть под отверстием.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let states=[],observer=null,frame=0,last=0;
let previousScroll=scrollY,previousScrollTime=performance.now();

function geometry(width,height,tie) {
  const px=width*tie,py=13,dx=width/2-px,dy=height/2-py;
  const angle=Math.atan2(dx,dy),c=Math.cos(angle),s=Math.sin(angle);
  const points=[[0,0],[width,0],[width,height],[0,height]].map(([x,y])=>[
    px+(x-px)*c-(y-py)*s,py+(x-px)*s+(y-py)*c
  ]);
  return {angle,px,dx,dy,minX:Math.min(...points.map(p=>p[0])),maxX:Math.max(...points.map(p=>p[0])),
    minY:Math.min(...points.map(p=>p[1])),maxY:Math.max(...points.map(p=>p[1]))};
}

export function layoutPaper(leaf) {
  const card=leaf.querySelector('.poem-card'),space=leaf.querySelector('.poem-paper-space');
  const tie=parseFloat(getComputedStyle(leaf).getPropertyValue('--paper-tie'))/100;
  const available=leaf.clientWidth-18;
  const maximumWidth=Math.min(420,available);
  let width=maximumWidth,g,height;
  // Подбираем ширину по габаритам ПОВЁРНУТОГО листа, а не обрезаем углы.
  for(let i=0;i<9;i++) {
    card.style.width=`${width}px`;
    height=card.offsetHeight;
    g=geometry(width,height,tie);
    const next=width*available/(g.maxX-g.minX);
    if(Math.abs(next-width)<.35) break;
    width=Math.min(maximumWidth,next);
  }
  width=card.offsetWidth;height=card.offsetHeight;g=geometry(width,height,tie);
  const left=(leaf.clientWidth-(g.maxX-g.minX))/2-g.minX,top=9-g.minY;
  card.style.left=`${left}px`;card.style.top=`${top}px`;
  leaf.style.setProperty('--tie-x',`${left+g.px}px`);
  leaf.style.setProperty('--hole-depth',`${top+13}px`);
  card.style.setProperty('--rest-angle',`${g.angle*180/Math.PI}deg`);
  card.style.setProperty('--wind-angle','0deg');leaf.style.setProperty('--rope-angle','0deg');
  card.style.rotate = '0deg';leaf.querySelector('.poem-pendant').style.rotate = '0deg';
  card.dataset.restAngle=String(g.angle*180/Math.PI);
  space.style.height=`${g.maxY-g.minY+18}px`;
  const r=Math.hypot(g.dx,g.dy),inertia=(width*width+height*height)/12+r*r;
  return {card,leaf,pendant:leaf.querySelector('.poem-pendant'),theta:0,velocity:0,frequency:1200*r/inertia,visible:false,
    scrollDirection:Math.sign(g.dx)||1,limit:innerWidth<620 ? .04 : .065};
}

export function stopPaperPhysics() {
  cancelAnimationFrame(frame);frame=0;last=0;observer?.disconnect();observer=null;states=[];
}
function tick(time) {
  frame=0;
  if(reduced.matches||document.hidden||document.querySelector('#poem-dialog').open)return;
  const dt=last?Math.min(.032,(time-last)/1000):1/60;last=time;
  states.forEach((state,index)=>{
    if(!state.visible||!state.leaf.classList.contains('is-seen')||state.leaf.classList.contains('is-reader-source'))return;
    const wind=.035*Math.sin(time/1700+index*2.1)+.018*Math.sin(time/790+index);
    state.velocity+=(-state.frequency*Math.sin(state.theta)-1.45*state.velocity+wind)*dt;
    state.theta+=state.velocity*dt;
    if(Math.abs(state.theta)>state.limit) {
      state.theta=Math.sign(state.theta)*state.limit;
      if(Math.sign(state.velocity)===Math.sign(state.theta))state.velocity*=-.2;
    }
    const degrees=state.theta*180/Math.PI;
    state.card.style.rotate = `${degrees*.3}deg`;
    state.pendant.style.rotate = `${degrees*.7}deg`;
  });
  if(states.some(state=>state.visible))frame=requestAnimationFrame(tick);
}
function start(){if(!frame&&!reduced.matches&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}}
export function startPaperPhysics(next) {
  stopPaperPhysics();states=next;
  previousScroll=scrollY;previousScrollTime=performance.now();
  observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{const state=states.find(item=>item.leaf===entry.target);if(state){state.visible=entry.isIntersecting;state.leaf.classList.toggle('is-physics-visible',entry.isIntersecting);}});
    start();
  },{rootMargin:'80px'});
  states.forEach(state=>observer.observe(state.leaf));
}
export function nudgePaper(leaf,strength=.18) {
  if(reduced.matches)return;
  const state=states.find(item=>item.leaf===leaf);
  if(!state)return;
  state.velocity=Math.max(-.45,Math.min(.45,state.velocity+strength*state.scrollDirection));
  start();
}
window.addEventListener('scroll',()=>{
  const time=performance.now(),delta=scrollY-previousScroll,elapsed=Math.max(16,Math.min(80,time-previousScrollTime));
  previousScroll=scrollY;previousScrollTime=time;
  if(!states.length||reduced.matches||document.hidden||document.querySelector('#poem-dialog').open||
    document.body.matches('.home-is-leaving,.poems-is-leaving,.arriving-at-home,.arriving-at-poems'))return;
  const speed=Math.max(-6,Math.min(6,delta/elapsed));
  states.forEach((state,index)=>{
    if(!state.visible||!state.leaf.classList.contains('is-seen')||state.leaf.classList.contains('is-reader-source'))return;
    const direction=state.scrollDirection*(index%2?1:-1),impulse=speed*.07*(.75+index%3*.12);
    state.velocity=Math.max(-.45,Math.min(.45,state.velocity+impulse*direction));
  });
  start();
},{passive:true});
document.addEventListener('visibilitychange',start);
document.querySelector('#poem-dialog').addEventListener('close',start);
reduced.addEventListener('change',()=>{
  if(reduced.matches){cancelAnimationFrame(frame);frame=0;states.forEach(state=>{state.theta=0;state.velocity=0;state.card.style.setProperty('--wind-angle','0deg');state.leaf.style.setProperty('--rope-angle','0deg');});}
  else start();
});
