// В перелёте участвует сам падающий DOM-лепесток, без нового рисунка или клона.
let flight=null;
const smooth=t=>t*t*(3-2*t);
function snapshot(node) {
  const style=getComputedStyle(node),rect=node.getBoundingClientRect();
  const matrix=new DOMMatrix(style.transform);
  return {x:rect.left+rect.width/2,y:rect.top+rect.height/2,angle:Math.atan2(matrix.b,matrix.a)*180/Math.PI,
    opacity:Number(style.opacity),width:node.offsetWidth,height:node.offsetHeight};
}
function putBack(state,time,play=true) {
  state.animation?.cancel();state.animation=null;
  const {node,parent,next,css}=state;
  node.style.cssText=css;node.removeAttribute('data-flight-petal');
  parent.insertBefore(node,next?.parentNode===parent?next:null);
  node.getAnimations().forEach(animation=>{animation.currentTime=time;play?animation.play():animation.pause();});
}
function lift(state,pose) {
  const {node}=state;
  document.body.append(node);node.dataset.flightPetal='true';
  Object.assign(node.style,{position:'fixed',left:'0px',top:'0px',width:`${pose.width}px`,height:`${pose.height}px`,
    margin:'0',animation:'none',zIndex:'20',filter:'none',opacity:String(pose.opacity),transformOrigin:'50% 50%',pointerEvents:'none'});
}
function transform(pose,scale=1) {
  return `translate(${pose.x}px,${pose.y}px) translate(-50%,-50%) rotate(${pose.angle}deg) scale(${scale})`;
}
function stopCamera(state) {
  state.camera?.forEach(animation=>animation.cancel());state.camera=[];
  state.pausedParticles?.forEach(animation=>animation.play());state.pausedParticles=[];
}
function recycleAbove(state) {
  putBack(state,0,false);
  state.node.style.setProperty('--delay','0s');
  state.node.getAnimations().forEach(animation=>{animation.currentTime=0;animation.play();});
}
export function cancelPetalFlight() {
  if(!flight)return;
  const state=flight;flight=null;
  stopCamera(state);
  // Прерванный перелёт возвращает тот же лепесток на естественную траекторию.
  putBack(state,state.time+performance.now()-state.started);
}
export function beginPetalFlight(mode='approach') {
  cancelPetalFlight();
  // Передний слой гарантирует, что лепесток не скрыт за непрозрачной карточкой.
  const candidates=[...document.querySelectorAll('#petals .petal')].map(node=>({node,pose:snapshot(node)}))
    .filter(({pose:p})=>p.opacity>.12&&p.x>12&&p.x<innerWidth-12&&p.y>8&&p.y<innerHeight*.82)
    .sort((a,b)=>mode==='gust'?a.pose.x-b.pose.x:
      Math.hypot(a.pose.x-innerWidth*.58,a.pose.y-innerHeight*.4)-Math.hypot(b.pose.x-innerWidth*.58,b.pose.y-innerHeight*.4));
  if(!candidates.length)return false;
  const {node,pose}=candidates[0];
  const natural=node.getAnimations()[0];
  const state={node,parent:node.parentNode,next:node.nextSibling,css:node.style.cssText,time:Number(natural?.currentTime||0),started:performance.now(),pose};
  natural?.pause();flight=state;lift(state,pose);
  state.cover={x:mode==='gust'?Math.max(innerWidth*.56,pose.x+Math.min(160,innerWidth*.18)):innerWidth/2,
    y:innerHeight/2,angle:pose.angle+(mode==='gust'?85:0)};
  state.scale=Math.hypot(innerWidth,innerHeight)*3/Math.min(pose.width,pose.height);
  const duration=mode==='gust'?1700:1450;
  const cameraFrames=[];
  const frames=Array.from({length:91},(_,i)=>{
    const t=i/90,e=smooth(t),wind=mode==='gust';
    const approach=wind?smooth(Math.max(0,(t-.38)/.62)):e;
    const position=e;
    // Порыв несёт крайний левый лепесток только вправо, без дуги с откатом.
    const current={x:pose.x+(state.cover.x-pose.x)*position,y:pose.y+(state.cover.y-pose.y)*position-(wind?Math.sin(Math.PI*t)*30:0),angle:pose.angle+(wind?85*e:0)};
    const scale=Math.exp(Math.log(state.scale)*approach);
    cameraFrames.push({t,position,scale});
    return {offset:t,transform:transform(current,scale),opacity:pose.opacity+(1-pose.opacity)*Math.min(1,t/.35)};
  });
  if(mode==='approach') {
    // Камера движется относительно целого сада. Сам лепесток не летит к ней
    // и не получает отдельного поворота/бокового ускорения.
    state.pausedParticles=[...document.querySelectorAll('#petals .petal,#petals-back .petal')].flatMap(p=>p.getAnimations());
    state.pausedParticles.forEach(animation=>animation.pause());
    state.camera=[['#petals',1],['#petals-back',.6],['.garden',.2]].map(([selector,depth])=>{
      const layer=document.querySelector(selector);
      const keys=cameraFrames.map(({t,position,scale})=>{
        const z=scale**depth;
        const x=pose.x+(state.cover.x-pose.x)*position,y=pose.y+(state.cover.y-pose.y)*position;
        return {offset:t,transformOrigin:'0px 0px',transform:`matrix(${z},0,0,${z},${x-z*pose.x},${y-z*pose.y})`};
      });
      return layer.animate(keys,{duration,easing:'linear',fill:'forwards'});
    });
  }
  state.animation=node.animate(frames,{duration,easing:'linear',fill:'forwards'});
  return true;
}
// Для проектов лепесток падает целиком за экран, не ищет точку в листопаде.
export function petalFallFrames({cover,scale,pose},width,height) {
  const endScale=Math.max(1,Math.min(width/pose.width,height/pose.height)*.42);
  const endY=height+Math.hypot(pose.width,pose.height)*endScale/2+32;
  return Array.from({length:81},(_,i)=>{
    const t=i/80,e=smooth(t);
    const point={x:cover.x+width*.08*e,y:cover.y+(endY-cover.y)*t*t,
      angle:cover.angle+24*e};
    return {offset:t,transform:transform(point,Math.exp(Math.log(scale)*(1-e)+Math.log(endScale)*e)),opacity:1};
  });
}

export function finishPetalFlight(mode='return') {
  if(!flight)return;
  const state=flight;
  stopCamera(state);
  if(mode==='fall') {
    state.animation?.cancel();
    state.animation=state.node.animate(petalFallFrames(state,innerWidth,innerHeight),
      {duration:1250,easing:'linear',fill:'forwards'});
    state.animation.finished.then(()=>{
      if(flight!==state)return;
      flight=null;
      // Ту же частицу сохраняем в скрытом слое проектов после ухода за край.
      recycleAbove(state);
    }).catch(()=>{});
    return;
  }
  if(mode==='through') {
    state.animation?.cancel();
    // Камера продолжает движение вперёд: поверхность расходится из центра,
    // а не уменьшается обратно до исходного лепестка.
    const frames=Array.from({length:81},(_,i)=>{
      const t=i/80,e=smooth(t),hole=27*e;
      return {offset:t,transform:transform(state.cover,state.scale*(1+.65*e)),
        maskImage:`radial-gradient(ellipse at 50% 50%,transparent ${hole}%,#000 ${hole+1.2}%)`,
        opacity:1-smooth(Math.max(0,(t-.75)/.25))};
    });
    state.animation=state.node.animate(frames,{duration:850,easing:'linear',fill:'forwards'});
    state.animation.finished.then(()=>{
      if(flight!==state)return;
      flight=null;
      // Пролетевший лист остаётся позади камеры. Частицу переиспользуем только
      // за верхней границей экрана, чтобы она не возникла снова на прежнем месте.
      recycleAbove(state);
    }).catch(()=>{});
    return;
  }
  // Возвращаем лист в случайную ВИДИМУЮ точку настоящего потока частиц.
  // Конечная поза снимается с его обычной CSS-анимации, чтобы не было скачка.
  putBack(state,0,false);
  state.node.style.setProperty('--delay','0s');
  state.node.style.setProperty('--x','50%');
  const duration=parseFloat(getComputedStyle(state.node).getPropertyValue('--duration'))||18;
  const targetTime=duration*1000*(.2+Math.random()*.4);
  state.node.getAnimations().forEach(animation=>{animation.currentTime=targetTime;animation.pause();});
  const initial=snapshot(state.node),desiredX=innerWidth*(.12+Math.random()*.76);
  state.node.style.setProperty('--x',`${50+(desiredX-initial.x)/innerWidth*100}%`);
  const target=snapshot(state.node);
  target.angle+=Math.round((state.cover.angle-target.angle)/360)*360;
  state.css=state.node.style.cssText;state.time=targetTime;state.started=performance.now();
  lift(state,target);
  const frames=Array.from({length:81},(_,i)=>{
    const t=i/80,e=smooth(t),position=smooth(Math.min(1,t/.9));
    const current={x:state.cover.x+(target.x-state.cover.x)*position,y:state.cover.y+(target.y-state.cover.y)*position,angle:state.cover.angle+(target.angle-state.cover.angle)*e};
    return {offset:t,transform:transform(current,Math.exp(Math.log(state.scale)*(1-e))),opacity:1+(target.opacity-1)*Math.max(0,(t-.65)/.35)};
  });
  state.animation=state.node.animate(frames,{duration:1150,easing:'linear',fill:'forwards'});
  state.animation.finished.then(()=>{
    if(flight!==state)return;
    flight=null;putBack(state,targetTime);
  }).catch(()=>{});
}
