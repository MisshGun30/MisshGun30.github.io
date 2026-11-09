import { prepareLampSound, playLampSound, preloadJourneySounds, stopLampSound } from './lamp-sound.js';
import { igniteJourneyMatch } from './journey-match.js';

// Неподвижный сад и четыре слоя света. Анимируются лишь их прозрачности.
const sources=['garden-unlit',...Array.from({length:4},(_,i)=>`lamp-light-${i+1}`),'lamp-burst-1','lamp-burst-3'];
const images=sources.map(name=>{
  const image=new Image();image.src=`assets/images/${name}.svg`;image.alt='';return image;
});
const ready=Promise.all(images.map(image=>image.decode())).then(()=>true,()=>false);
let current;

function fade(state,node,opacity,duration) {
  const start=getComputedStyle(node).opacity;
  node.style.opacity=String(opacity);
  const animation=node.animate([{opacity:start},{opacity}],{duration,easing:'ease-in-out'});
  state.animations.push(animation);
}
function wait(state,duration) {
  return new Promise(resolve=>{
    state.release=resolve;
    state.timer=setTimeout(()=>{state.release=null;resolve();},duration);
  });
}
function alignStage(state) {
  const original=document.querySelector('.garden > .garden-base'),style=getComputedStyle(original);
  state.stage.style.opacity=style.opacity;
  state.stage.style.transform=style.transform;
  state.stage.style.transformOrigin=style.transformOrigin;
  state.stage.querySelectorAll('img').forEach(image=>{image.style.objectPosition=style.objectPosition;});
  // Центр разлёта совпадает с лампочкой даже при обрезке фоновой картинки на телефоне.
  const width=original.clientWidth,height=original.clientHeight,scale=Math.max(width/1800,height/1200);
  const [px,py]=style.objectPosition.split(' ').map(value=>parseFloat(value)/100);
  [[1,847.04,906.28],[3,712.36,972.52]].forEach(([index,x,y])=>{
    state.stage.querySelector(`[data-burst="${index}"]`).style.transformOrigin=
      `${x*scale+(width-1800*scale)*px}px ${y*scale+(height-1200*scale)*py}px`;
  });
}

export function cancelLampTransition() {
  const state=current;
  if(!state)return;
  current=null;
  clearTimeout(state.timer);state.release?.();
  state.animations.forEach(animation=>animation.cancel());
  state.stage?.remove();state.veil?.remove();
  window.removeEventListener('resize',state.resize);
  document.body.classList.remove('lamps-are-leaving');
  delete document.body.dataset.lampStep;
  document.querySelector('[data-front-lamp-light]')?.style.removeProperty('opacity');
  state.main.inert=state.wasInert;
  if(state.wasBusy===null)state.main.removeAttribute('aria-busy');
  else state.main.setAttribute('aria-busy',state.wasBusy);
  if(!document.body.classList.contains('in-journey'))stopLampSound();
}

export async function playLampExit() {
  const main=document.querySelector('#main');
  const state={animations:[],main,wasInert:main.inert,wasBusy:main.getAttribute('aria-busy')};
  current=state;
  main.inert=true;
  main.setAttribute('aria-busy','true');
  prepareLampSound();
  preloadJourneySounds();
  // Не держим переход бесконечно, если изображение не загрузилось.
  const loaded=await Promise.race([ready,wait(state,1200).then(()=>false)]);
  clearTimeout(state.timer);state.release=null;
  if(current!==state)return;
  state.stage=document.createElement('div');state.stage.className='lamp-stage';
  images.forEach((source,index)=>{
    if(index===2)return; // Правый дорожный фонарь — перед фотокарточкой.
    const image=source.cloneNode();
    if(index>=1&&index<=4)image.dataset.lamp=String(index);
    if(index>4){image.className='lamp-burst';image.dataset.burst=index===5?'1':'3';}
    state.stage.append(image);
  });
  state.veil=document.createElement('div');state.veil.className='lamp-blackout';state.veil.setAttribute('aria-hidden','true');
  document.body.append(state.veil);
  if(loaded) {
    document.querySelector('.garden').prepend(state.stage);
    alignStage(state);
    document.body.classList.add('lamps-are-leaving');
  }
  state.resize=()=>alignStage(state);
  window.addEventListener('resize',state.resize);
  document.body.dataset.lampStep='0';
  await wait(state,300);
  if(current!==state)return;
  for(let index=1;index<=4;index++) {
    const broken=index===1||index===3;
    document.body.dataset.lampStep=String(index);
    const light=index===2?document.querySelector('[data-front-lamp-light]'):state.stage.querySelector(`[data-lamp="${index}"]`);
    if(loaded) {
      if(broken) {
        const burst=state.stage.querySelector(`[data-burst="${index}"]`);
        state.animations.push(burst.animate([
          {opacity:0,transform:'scale(.45)'},
          {opacity:1,transform:'scale(.7)',offset:.12},
          {opacity:.65,transform:'scale(1)',offset:.3},
          {opacity:0,transform:'translateY(7px) scale(1.35)'}
        ],{duration:420,easing:'ease-out'}));
        // Единственная короткая вспышка перед окончательным погасанием.
        light.style.opacity='0';
        state.animations.push(light.animate([{opacity:1},{opacity:1.5,offset:.15},{opacity:0}],{duration:210}));
      } else fade(state,light,0,200);
    }
    playLampSound(broken);
    fade(state,state.veil,[.23,.46,.72,1][index-1],index===4?620:430);
    await wait(state,index===3?1000:index===4?1050:500);
    if(current!==state)return;
  }
  // Теперь экран полностью чёрный. Маршрутизатор может заменить содержимое.
}

export async function finishLampEntry() {
  const state=current;
  if(!state?.veil)return;
  document.body.dataset.lampStep='reveal';
  state.stage.remove();
  window.removeEventListener('resize',state.resize);
  document.body.classList.remove('lamps-are-leaving');
  // Новый раздел уже смонтирован; сначала даём браузеру завершить его раскладку.
  await wait(state,80);
  if(current!==state)return;
  igniteJourneyMatch();
  fade(state,state.veil,0,1000);
  await wait(state,1020);
  if(current===state) {
    cancelLampTransition();
    document.querySelector('#section-title')?.focus({preventScroll:true});
  }
}

matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{
  if(event.matches) {
    cancelLampTransition();
    if(document.body.classList.contains('in-journey'))igniteJourneyMatch();
  }
});
