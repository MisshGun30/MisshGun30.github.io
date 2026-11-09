import { beginPetalFlight, finishPetalFlight, cancelPetalFlight } from './petal-flight.js';
// Выход с главной и обратный пролёт через лепесток между садом и стихотворениями.
let revision = 0;
let animations = [];
let timers = [];
let release = null;
let gustPaused=[];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

export function cancelSceneTransition() {
  revision++;
  timers.forEach(clearTimeout);
  timers = [];
  animations.forEach(animation => animation.cancel());
  animations = [];
  gustPaused.forEach(animation=>animation.play());gustPaused=[];
  cancelPetalFlight();
  document.body.classList.remove('home-is-leaving','scene-to-poems','arriving-at-poems','poems-is-leaving','arriving-at-home');
  release?.();
  release = null;
}
function later(callback, delay, version) {
  timers.push(setTimeout(() => { if (version === revision) callback(); },delay));
}
function homePieces() {
  const home = document.querySelector('#home');
  return [
    ['.wheel-wrap',-1],['.wheel-selection',-1],['.home-right',1],
    ['.home-left',home.dataset.headingLayout === 'card' ? 1 : -1]
  ].map(([selector,direction]) => {
    const node=home.querySelector(selector),rect=node.getBoundingClientRect();
    const distance=direction<0 ? rect.right+80 : innerWidth-rect.left+80;
    return {node,direction,distance};
  });
}

export function holdHomePiecesAway() {
  homePieces().forEach(({node,direction,distance}) => {
    animations.push(node.animate([{translate:`${direction*distance}px 0px`,opacity:0}], {duration:0,fill:'forwards'}));
  });
}

export function playHomeExit(toPoems) {
  const version = revision;
  document.body.classList.add('home-is-leaving');
  homePieces().forEach(({node,direction,distance}) => {
    animations.push(node.animate([
      { translate:'0px 0px',opacity:1 },
      { translate:`${direction*distance}px 0px`,opacity:0 }
    ], { duration:toPoems?820:700,easing:'cubic-bezier(.3,0,.2,1)',fill:'forwards' }));
  });
  if (toPoems) return playPoetryEntry();
  return new Promise(resolve => {
    release = resolve;
    later(() => { release = null; resolve(); },700,version);
  });
}

export function playPoetryEntry() {
  const version=revision;
  document.body.classList.add('scene-to-poems');
  if(!beginPetalFlight())document.body.classList.add('transitioning');
  return new Promise(resolve=>{
    release=resolve;
    later(()=>{release=null;resolve();},1460,version);
  });
}

export function playPoetryReturn() {
  const version=revision;
  document.body.classList.add('poems-is-leaving');
  // Сначала порыв подхватывает видимые открытки вместе с нитями.
  if(!beginPetalFlight('gust'))document.body.classList.add('transitioning');
  document.querySelectorAll('.poem-hanging').forEach((leaf,index)=>{
    const pendant=leaf.querySelector('.poem-pendant'),rect=pendant.getBoundingClientRect();
    if(rect.bottom<0||rect.top>innerHeight||leaf.classList.contains('is-pending'))return;
    animations.push(pendant.animate([
      {offset:0,transform:getComputedStyle(pendant).transform,opacity:1},
      {offset:.3,transform:`translate(22px,-5px) rotate(${8+index%3*2}deg)`,opacity:1},
      {offset:1,transform:`translate(${innerWidth*1.1}px,${-innerHeight*.3}px) rotate(${35+index%3*9}deg)`,opacity:0}
    ],{duration:1250,delay:index%3*55,easing:'cubic-bezier(.3,0,.65,1)',fill:'forwards'}));
    animations.push(leaf.querySelector('.poem-branch-knot').animate([{opacity:1},{opacity:0}],
      {duration:300,delay:250,easing:'ease-in',fill:'forwards'}));
  });
  document.querySelectorAll('#petals .petal,#petals-back .petal').forEach((petal,index)=>{
    const normal=petal.getAnimations();normal.forEach(animation=>animation.pause());gustPaused.push(...normal);
    animations.push(petal.animate([
      {translate:'0px 0px',rotate:'0deg',opacity:getComputedStyle(petal).opacity},
      {translate:`${innerWidth*(.8+index%4*.16)}px ${-80-index%5*18}px`,rotate:`${90+index%5*30}deg`,opacity:0}
    ],{duration:1250+index%4*60,easing:'cubic-bezier(.3,0,.65,1)',fill:'forwards'}));
  });
  document.querySelectorAll('.section-heading,.back-link,.poetry-afterword,.section-nav').forEach(node=>{
    animations.push(node.animate([{translate:'0px 0px',opacity:1},{translate:'60px -4px',opacity:0}],
      {duration:900,delay:180,easing:'ease-in',fill:'forwards'}));
  });
  document.querySelectorAll('.garden-base, .home-lantern-plane').forEach(layer => {
    animations.push(layer.animate([
      {transform:getComputedStyle(layer).transform,transformOrigin:'76% 25%',opacity:.58,filter:'blur(2px)'},
      {transform:'scale(1.03)',transformOrigin:'76% 25%',opacity:.88,filter:'blur(0px)'}
    ],{duration:1700,easing:'cubic-bezier(.25,.5,.25,1)',fill:'forwards'}));
  });
  return new Promise(resolve=>{
    release=resolve;
    later(()=>{release=null;resolve();},1710,version);
  });
}

function clearPoetryWind() {
  animations.forEach(animation=>animation.cancel());animations=[];
  gustPaused.forEach(animation=>animation.play());gustPaused=[];
}

export function finishPoetryExit(petalMode='return') {
  if (reduced.matches) { cancelSceneTransition(); return; }
  const version=revision;
  // Страница уже заменена под лепестком: убираем порыв и раскрываем её.
  clearPoetryWind();
  finishPetalFlight(petalMode);
  later(cancelSceneTransition,1400,version);
}

export function finishHomeReturn() {
  if (reduced.matches) { cancelSceneTransition(); return; }
  const version=revision;
  document.body.classList.add('arriving-at-home');
  // Ветер заканчивается под закрывшим кадр лепестком; дальше прежний возврат.
  clearPoetryWind();
  finishPetalFlight();
  homePieces().forEach(({node,direction,distance})=>{
    animations.push(node.animate([
      {translate:`${direction*distance}px 0px`,opacity:0},
      {translate:'0px 0px',opacity:1}
    ],{duration:1000,delay:80,easing:'cubic-bezier(.2,.65,.25,1)',fill:'both'}));
  });
  later(cancelSceneTransition,1400,version);
}

export function finishSceneTransition(toPoems) {
  const version = revision;
  if (!toPoems || reduced.matches) { cancelSceneTransition(); return; }
  document.body.classList.add('arriving-at-poems');
  // Под лепестком меняем дальний план на крупный план ветви.
  finishPetalFlight('through');
  later(cancelSceneTransition,1400,version);
}
reduced.addEventListener('change', () => { if (reduced.matches) cancelSceneTransition(); });

