import { extinguishJourneyMatch, restoreJourneyMatch } from './journey-match.js';
import { prepareLampSound, playMatchOut, playBulbScrew, playLightOn, stopLampSound } from './lamp-sound.js';

let current;
function wait(state,ms) {
  return new Promise(resolve=>{state.release=resolve;state.timer=setTimeout(()=>{state.release=null;resolve();},ms);});
}
function fade(state,to,duration) {
  const from=getComputedStyle(state.veil).opacity;state.veil.style.opacity=String(to);
  state.animations.push(state.veil.animate([{opacity:from},{opacity:to}],{duration,easing:'ease-in-out'}));
}
export function cancelJourneyReturn() {
  if(!current)return;
  const state=current;current=null;
  clearTimeout(state.timer);state.release?.();state.animations.forEach(animation=>animation.cancel());
  state.veil.remove();document.querySelector('#main').inert=state.wasInert;
  delete document.body.dataset.journeyReturn;
  restoreJourneyMatch();
  stopLampSound();
}
export async function playJourneyReturn() {
  const veil=document.createElement('div');veil.className='journey-return-veil';veil.setAttribute('aria-hidden','true');
  const state={veil,animations:[],wasInert:document.querySelector('#main').inert};current=state;
  document.body.append(veil);document.querySelector('#main').inert=true;
  document.body.dataset.journeyReturn='out';
  await prepareLampSound();
  if(current!==state)return;
  extinguishJourneyMatch();playMatchOut();fade(state,1,650);
  await wait(state,700);if(current!==state)return;
  document.body.dataset.journeyReturn='screw';
  const duration=await playBulbScrew();if(current!==state)return;
  await wait(state,Math.max(2000,duration*1000)+100);
  // Открываем выбранную страницу, когда кадр ещё полностью чёрный.
}
export async function finishJourneyReturn() {
  const state=current;if(!state)return;
  document.body.dataset.journeyReturn='light';
  const duration=await playLightOn();if(current!==state)return;
  fade(state,0,800);
  await wait(state,Math.max(900,duration*1000+100));
  if(current===state) {
    cancelJourneyReturn();
    const target = !document.querySelector('#home').hidden
      ? (document.documentElement.dataset.input === 'keyboard' ? '.wheel-item[aria-pressed="true"]' : '#main')
      : document.querySelector('#section-view').classList.contains('social-view') ? '#social-title' : '#section-title';
    document.querySelector(target)?.focus({preventScroll:true});
  }
}
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{
  if(event.matches)cancelJourneyReturn();
});
