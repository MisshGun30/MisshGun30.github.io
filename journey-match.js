import { createMatchClock } from './match-clock.js';
import { prepareLampSound, playMatchStrike, preloadJourneySounds, stopLampSound } from './lamp-sound.js';

let scene;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const coarse = matchMedia('(pointer:coarse)');
function restPosition(){return {x:innerWidth*.5,y:innerHeight*.5};}
function moveTo(x,y,near=false) {
  if(!scene)return;
  if(scene.reader){const rect=scene.reader.getBoundingClientRect();x=rect.left+28;y=rect.top+30;near=false;}
  scene.point={x:clamp(x,8,innerWidth-8),y:clamp(y,8,innerHeight-8)};
  scene.visual.classList.toggle('is-near-card',near);
  scene.visual.style.translate=`${scene.point.x-32}px ${scene.point.y-44-scene.burn*90}px`;
  scene.field.style.translate=`${scene.point.x}px ${scene.point.y}px`;
}
function clearCardLight() {
  document.querySelectorAll('.journey-card.is-match-lit').forEach(card=>card.classList.remove('is-match-lit'));
}
function returnMatch() {
  if(!scene)return;
  const {x,y}=scene.pointer||restPosition();moveTo(x,y);
  clearCardLight();
}
export function lightJourneyCard(card) {
  if(!scene)return;
  document.querySelectorAll('.journey-card.is-match-lit').forEach(node=>node.classList.toggle('is-match-lit',node===card));
  card.classList.add('is-match-lit');
  const rect=card.getBoundingClientRect();
  const point=coarse.matches?restPosition():scene.pointer||{x:rect.right-18,y:rect.top+45};
  if(!scene.transfer)moveTo(point.x,point.y,!coarse.matches);
}
function updateBurn(state) {
  if(!scene || scene.exiting)return;
  const previous=scene.phase;scene.phase=state;scene.burn=state.burn;
  scene.visual.dataset.burn=state.burn.toFixed(6);
  scene.visual.dataset.cycle=String(state.cycle);
  scene.visual.style.setProperty('--burn-offset',`${state.burn*90}px`);
  scene.visual.querySelector('.match-char').setAttribute('height',String(state.burn*90));
  scene.visual.querySelector('.match-burning').setAttribute('transform',`translate(0 ${state.burn*90})`);
  moveTo(scene.point.x,scene.point.y,scene.visual.classList.contains('is-near-card'));
  if(previous?.lit===state.lit && previous.cycle===state.cycle)return;
  document.body.classList.toggle('match-is-out',!state.lit);
  scene.visual.classList.toggle('is-out',!state.lit);
  if(!state.lit) {
    scene.focusBeforeDark=document.activeElement;
    scene.eclipse.showModal();
  } else {
    if(scene.eclipse.open)scene.eclipse.close();
    if(previous){strikeMatch();scene.focusBeforeDark?.focus({preventScroll:true});}
  }
}
export function igniteJourneyMatch() {
  if(!scene || scene.clock)return;
  document.body.classList.add('match-is-lit');
  strikeMatch();
  scene.clock=createMatchClock(updateBurn);
}
function strikeMatch() {
  if(navigator.userActivation?.hasBeenActive)playMatchStrike();
  else scene.pendingSound=true;
}

export function mountJourneyMatch({deferIgnition=false}={}) {
  unmountJourneyMatch();
  preloadJourneySounds();
  const visual=document.createElement('div');visual.className='journey-match';visual.setAttribute('aria-hidden','true');
  visual.innerHTML=`<div class="match-aura"></div><svg viewBox="0 0 64 166" aria-hidden="true">
    <defs><linearGradient id="match-wood"><stop stop-color="#c58d50"/><stop offset=".5" stop-color="#eed3a1"/><stop offset="1" stop-color="#9f6f3d"/></linearGradient>
    <linearGradient id="match-fire" x2="0" y2="1"><stop stop-color="#fff4b9"/><stop offset=".45" stop-color="#ffc15b"/><stop offset="1" stop-color="#dc6235"/></linearGradient></defs>
    <rect x="29" y="52" width="6" height="90" rx="2" fill="url(#match-wood)"/>
    <rect class="match-char" x="28.5" y="52" width="7" height="0" rx="2" fill="#342a28"/>
    <g class="match-burning"><ellipse cx="32" cy="51" rx="5" ry="6" fill="#eb8545"/>
    <g class="match-flame"><path d="M32 53C8 47 24 25 29 9C29 25 49 32 44 45Q40 54 32 53Z" fill="url(#match-fire)"/>
    <path d="M32 51Q21 44 32 29Q42 45 35 51Z" fill="#fff5ca"/><ellipse cx="32" cy="50" rx="4" ry="3" fill="#c8c6fc" opacity=".7"/></g></g>
    <path class="match-smoke" d="M32 49q-10-12 0-22t-4-23" fill="none" stroke="#d4c9bc" stroke-width="1.5"/>
    </svg>`;
  const field=document.createElement('div');field.className='match-light-field';field.setAttribute('aria-hidden','true');
  field.innerHTML='<div class="match-shade"></div><i class="match-curtain curtain-top"></i><i class="match-curtain curtain-bottom"></i><i class="match-curtain curtain-left"></i><i class="match-curtain curtain-right"></i>';
  const eclipse=document.createElement('dialog');eclipse.className='match-eclipse';eclipse.setAttribute('aria-label','Спичка погасла');
  eclipse.addEventListener('cancel',event=>event.preventDefault());
  const initialPoint = restPosition();
  visual.style.translate = `${initialPoint.x-32}px ${initialPoint.y-44}px`;
  field.style.translate = `${initialPoint.x}px ${initialPoint.y}px`;
  document.body.append(field,visual,eclipse);
  scene={visual,field,eclipse,burn:0,point:restPosition(),controller:new AbortController()};
  const {signal}=scene.controller;
  document.addEventListener('pointerover',event=>{
    if(event.pointerType==='touch')return;
    const card=event.target.closest('.journey-card');if(card)lightJourneyCard(card);else clearCardLight();
  },{signal});
  document.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch')return;
    const near=Boolean(event.target.closest('.journey-card'));
    scene.pointer={x:event.clientX+14,y:event.clientY+12};
    if(scene.reader || scene.transfer)return;
    cancelAnimationFrame(scene.frame);
    scene.frame=requestAnimationFrame(()=>{if(scene)moveTo(scene.pointer.x,scene.pointer.y,near);});
  },{signal,passive:true});
  document.addEventListener('focusin',event=>{
    if(scene.reader||scene.transfer||coarse.matches)return;
    if(event.target.matches(':focus-visible')&&event.target.closest('a,button,input')) {
      scene.pointer=null;
      const rect=event.target.getBoundingClientRect();moveTo(rect.left+rect.width/2,rect.top+rect.height/2);
    }
    const card=event.target.closest('.journey-card');if(card)lightJourneyCard(card);
  },{signal});
  const unlockAudio=event=>{
    prepareLampSound();
    if(scene.pendingSound){
      scene.pendingSound=false;
      if(!event.target.closest('a[href^="#"]'))void playMatchStrike();
    }
  };
  document.addEventListener('pointerdown',event=>{
    if(event.pointerType==='touch'){scene.pointer=null;}
    else {scene.pointer={x:event.clientX+14,y:event.clientY+12};if(!scene.reader&&!scene.transfer)moveTo(scene.pointer.x,scene.pointer.y);}
    unlockAudio(event);
  },{signal,capture:true});
  document.addEventListener('keydown',unlockAudio,{signal,capture:true});
  window.addEventListener('resize',returnMatch,{signal});
  document.addEventListener('scroll',()=>{if(scene.reader)moveTo(0,0);},{signal,capture:true,passive:true});
  window.addEventListener('scroll',()=>{
    if(matchMedia('(pointer:coarse)').matches){scene.pointer=null;returnMatch();}
  },{signal,passive:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)scene?.clock?.refresh();},{signal});
  returnMatch();
  if(!deferIgnition)igniteJourneyMatch();
}

// Окно истории — верхний слой браузера, поэтому переносим спичку внутрь него.
export function moveMatchToReader(dialog) {
  if(!scene)return;
  const from=getComputedStyle(scene.visual).translate;
  if(coarse.matches)scene.pointer=null;
  scene.transfer?.cancel();
  scene.reader?.classList.remove('reader-lit');scene.readerObserver?.disconnect();
  scene.reader=dialog;
  scene.visual.classList.toggle('reader-pinned',Boolean(dialog));
  scene.visual.classList.add('match-transferring');
  scene.field.classList.toggle('reader-light-field',Boolean(dialog));
  cancelAnimationFrame(scene.frame);
  if(dialog){
    dialog.classList.add('reader-lit');
    scene.readerObserver=new ResizeObserver(()=>moveTo(0,0));scene.readerObserver.observe(dialog);
  }
  (dialog||document.body).append(scene.field,scene.visual);returnMatch();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const state=scene,to=scene.visual.style.translate;
    const animation=scene.visual.animate([{translate:from},{translate:to}],
      {duration:720,easing:'cubic-bezier(.22,.68,.25,1)'});
    scene.transfer=animation;
    animation.finished.then(()=>{
      if(scene===state&&scene.transfer===animation){scene.transfer=null;scene.visual.classList.remove('match-transferring');if(!scene.reader)returnMatch();}
    }).catch(()=>{});
  } else scene.visual.classList.remove('match-transferring');
}
export function extinguishJourneyMatch() {
  if(!scene)return;
  scene.exiting=true;scene.visual.classList.add('match-blowing');
  scene.visual.querySelector('.match-smoke').setAttribute('transform',`translate(0 ${scene.burn*90})`);
}
export function restoreJourneyMatch() {
  if(!scene)return;
  scene.exiting=false;scene.visual.classList.remove('match-blowing');scene.clock?.refresh();
}
export function unmountJourneyMatch({keepSound=false}={}) {
  if(!scene)return;
  scene.controller.abort();scene.clock?.stop();cancelAnimationFrame(scene.frame);
  scene.transfer?.cancel();
  scene.readerObserver?.disconnect();scene.reader?.classList.remove('reader-lit');
  scene.eclipse.remove();scene.visual.remove();scene.field.remove();scene=null;
  document.body.classList.remove('match-is-lit','match-is-out');
  if(!keepSound)stopLampSound();
}
