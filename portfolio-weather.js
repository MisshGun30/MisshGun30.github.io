// Рисуем только во время перехода: один canvas вместо сотен элементов в DOM.
const clamp=value=>Math.min(1,Math.max(0,value));
const smooth=value=>{const t=clamp(value);return t*t*(3-2*t);};

export function createPortfolioWeather(canvas,geometry) {
  const width=document.documentElement.clientWidth,height=innerHeight;
  const ratio=Math.min(devicePixelRatio||1,1.25);
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
  const ctx=canvas.getContext('2d');
  if(!ctx)return {play(){},stop(){}};
  ctx.scale(ratio,ratio);
  const drops=[];
  let rainClock=0,rainCarry=0,dropIndex=0,previous=performance.now();
  let mode='storm',started=performance.now(),frame,last=0,stopped=false;

  function rain(time,dt,ending=false) {
    rainClock+=dt;
    const density=ending?1-smooth(time/.45):smooth(rainClock/1.25);
    rainCarry+=dt*density*(width<600?32:65);
    while(rainCarry>=1){
      rainCarry--;const i=dropIndex++;
      drops.push({x:((i*137.508)%997)/997*(width+40),y:-12,speed:650+(i%7)*90,size:1.8+(i%3)*.6});
    }
    ctx.fillStyle='#d6e9f5';
    for(let i=drops.length-1;i>=0;i--){
      const drop=drops[i];drop.y+=drop.speed*dt;drop.x-=26*dt;
      if(drop.y>height+12){drops.splice(i,1);continue;}
      ctx.globalAlpha=.55;ctx.beginPath();
      ctx.ellipse(drop.x,drop.y,drop.size,drop.size*2.5,.12,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fbfdff';ctx.fillRect(drop.x-.6,drop.y-1.5,1.1,3);ctx.fillStyle='#d6e9f5';
    }
    ctx.globalAlpha=1;
  }

  function draw(now) {
    if(stopped)return;
    frame=requestAnimationFrame(draw);
    if(now-last<30)return;last=now;
    const dt=Math.min(.06,(now-previous)/1000);previous=now;
    const time=(now-started)/1000;
    ctx.clearRect(0,0,width,height);
    rain(time,dt,mode==='clearing');
  }
  frame=requestAnimationFrame(draw);
  return {
    play(next){
      mode=next;started=performance.now();previous=started;last=0;
      if(next==='storm'){rainClock=0;rainCarry=0;}
      cancelAnimationFrame(frame);draw(started);
    },
    stop(){stopped=true;cancelAnimationFrame(frame);drops.length=0;ctx.clearRect(0,0,width,height);}
  };
}
