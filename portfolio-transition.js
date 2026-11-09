import { portfolioSceneGeometry } from './portfolio-board.js';
import { createTreeFallPlan, TREE_BREAK, TREE_COVER_MS, treeFallTransform } from './portfolio-tree-motion.js';
import { createPortfolioWeather } from './portfolio-weather.js';
import { preparePortfolioSound, portfolioSoundtrack } from './portfolio-weather-sound.js';

export { preparePortfolioSound };
let current;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

function animate(state,node,keyframes,options) {
  const animation=node.animate(keyframes,{fill:'both',easing:'cubic-bezier(.25,.7,.2,1)',...options});
  state.animations.push(animation);
  return animation.finished.catch(()=>{});
}


function blendPetals(state,visible) {
  document.querySelectorAll('#petals,#petals-back').forEach(node=>{
    void animate(state,node,[{opacity:visible?0:1},{opacity:visible?1:0}],
      {duration:visible?1200:1100,delay:visible?450:0,easing:'linear'});
  });
}

function moveHomeAside(state) {
  const home=document.querySelector('#home');
  const headingDirection=home.dataset.headingLayout==='card'?1:-1;
  for(const [selector,direction]of[['.wheel-wrap',-1],['.wheel-selection',-1],['.home-right',1],['.home-left',headingDirection]]){
    const node=home.querySelector(selector),rect=node.getBoundingClientRect();
    // Фактические размеры учитывают и большой экран, и вертикальную компоновку.
    const distance=Math.max(0,direction<0?rect.right:innerWidth-rect.left)+80;
    void animate(state,node,[{translate:'0px 0px'},{translate:`${direction*distance}px 0px`}],
      {duration:700,easing:'cubic-bezier(.3,0,.2,1)'});
  }
}

function setupFallingTree(state) {
  const r=state.geometry.scene;
  state.fallPlan=createTreeFallPlan(state.geometry,document.documentElement.clientWidth,innerHeight);
  state.world=document.createElement('div');state.world.className='portfolio-tree-world';
  state.world.style.perspective=state.fallPlan.perspective+'px';
  state.tree=document.createElement('div');state.tree.className='portfolio-falling-tree';
  state.tree.innerHTML='<img src="assets/images/portfolio-falling-tree.svg" alt=""><img class="portfolio-falling-papers" src="assets/images/home-poem-leaves.svg" alt="">';
  // Поворот вокруг места слома. Камера, размер слоя и координаты пня неподвижны.
  Object.assign(state.tree.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',
    transformOrigin:(TREE_BREAK.x*state.geometry.scale)+'px '+(TREE_BREAK.y*state.geometry.scale)+'px'});
  state.world.append(state.tree);
  state.cover=document.createElement('div');state.cover.className='portfolio-canopy-cover';
  const width=state.fallPlan.width,height=state.fallPlan.height;
  state.coverRadius=Math.hypot(width*.65,height*.8)+1;
  state.coverFull='circle('+state.coverRadius+'px at 65% 20%)';
  state.cover.style.clipPath='circle(0px at 65% 20%)';
  state.fracture=document.createElementNS('http://www.w3.org/2000/svg','svg');
  state.fracture.classList.add('portfolio-tree-fracture');
  state.fracture.setAttribute('viewBox','0 0 '+width+' '+height);
  const p=state.fallPlan.pivot,k=state.geometry.scale;
  state.fracture.innerHTML='<path pathLength="1" d="M'+(p.x-22*k)+' '+(p.y-3*k)+' l'+(12*k)+' '+(9*k)+' '+(8*k)+' '+(-13*k)+' '+(11*k)+' '+(14*k)+' '+(12*k)+' '+(-12*k)+'"/>';
  for(let i=0;i<5;i++){
    const chip=document.createElementNS('http://www.w3.org/2000/svg','g');
    chip.setAttribute('data-splinter',String(i));chip.style.opacity='0';
    chip.innerHTML='<path d="M'+p.x+' '+p.y+' l'+(5*k)+' '+(-13*k)+' '+(4*k)+' '+(17*k)+'Z" fill="#d2b49b" stroke="#866659" stroke-width="1"/>';
    state.fracture.append(chip);
  }
  state.root.prepend(state.world,state.cover,state.fracture);
  state.assets=Promise.all(['portfolio-falling-tree.svg','garden-without-near-tree.svg','portfolio-tree-canopy.svg'].map(name=>{
    const img=new Image();img.src='assets/images/'+name;return img.decode().catch(()=>{});
  }));
}
async function strikeTree(state) {
  const bolt=state.root.querySelector('.portfolio-lightning');
  const width=document.documentElement.clientWidth,height=innerHeight;
  const {x,y}=state.geometry.strike;
  bolt.setAttribute('viewBox',`0 0 ${width} ${height}`);
  const paths=bolt.querySelectorAll('path');
  paths[0].setAttribute('d',`M${x-65} -15 ${x-25} ${y*.27} ${x-50} ${y*.39} ${x+10} ${y*.62} ${x-12} ${y*.74} ${x} ${y}`);
  paths[1].setAttribute('d',`M${x-50} ${y*.39} ${x-105} ${y*.53} ${x-94} ${y*.66}`);
  paths[2].setAttribute('d',`M${x+10} ${y*.62} ${x+58} ${y*.71} ${x+42} ${y*.83}`);
  void animate(state,bolt,[{opacity:0},{opacity:1,offset:.15},{opacity:1}],{duration:340});
  await animate(state,paths[0],[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:180,easing:'linear'});
  if(current!==state)return;
  state.root.dataset.phase='tree-break';
  void state.sound.thunder();
  void state.sound.treeBreak();
  state.fracture.style.opacity='1';
  state.flash.style.background='radial-gradient(circle 110px at '+x+'px '+y+'px,#fff9e9 0%,#c6dfff66 30%,transparent 100%)';
  void animate(state,state.flash,[{opacity:1},{opacity:0}],{duration:280});
  await Promise.all([
    ...[...paths].slice(1).map(path=>animate(state,path,[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:80,easing:'linear'})),
    animate(state,state.fracture.querySelector('path'),[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:160,easing:'linear'})
  ]);
  if(current!==state)return;
  state.fracture.querySelectorAll('[data-splinter]').forEach((chip,i)=>void animate(state,chip,
    [{opacity:1,translate:'0px 0px'},{opacity:0,translate:((i-2)*17)+'px '+(22+i%3*15)+'px'}],{duration:480,easing:'cubic-bezier(.2,.4,.6,1)'}));
  void animate(state,bolt,[{opacity:1},{opacity:0}],{duration:120});

}

function createStage(fromHome) {
  const root=document.createElement('div');
  root.className='portfolio-light-stage';
  root.setAttribute('aria-hidden','true');
  root.innerHTML='<canvas class="portfolio-weather-canvas"></canvas><svg class="portfolio-lightning" viewBox="0 0 1000 1000" preserveAspectRatio="none"><path pathLength="1" d="M660 -20 610 150 648 180 568 350 605 332 510 565 552 540 446 830 475 680 400 730"/><path pathLength="1" d="M568 350 485 375 510 425 405 510"/><path pathLength="1" d="M552 540 650 630 625 690 710 790"/></svg><div class="portfolio-storm-flash"></div>';
  document.body.append(root);
  const main=document.querySelector('#main');
  const state={root,main,wasInert:main.inert,wasBusy:main.getAttribute('aria-busy'),animations:[],
    flash:root.querySelector('.portfolio-storm-flash'),sound:portfolioSoundtrack()};
  state.geometry=portfolioSceneGeometry(!fromHome);
  state.weather=createPortfolioWeather(root.querySelector('canvas'),state.geometry);
  state.garden=document.querySelector('.garden-base');
  state.originalSrc=state.garden.getAttribute('src');
  if(fromHome)setupFallingTree(state);
  main.inert=true;
  main.setAttribute('aria-busy','true');
  document.body.classList.add('portfolio-light-moving');
  const viewportWidth = innerWidth;
  state.resize = () => { if(innerWidth !== viewportWidth) cancelPortfolioTransition(true); };
  state.key=event=>{if(event.key==='Escape')cancelPortfolioTransition(true);};
  state.visibility=()=>{if(document.hidden)cancelPortfolioTransition();};
  window.addEventListener('resize',state.resize);
  window.addEventListener('keydown',state.key);
  document.addEventListener('visibilitychange',state.visibility);
  current=state;
  return state;
}

export function cancelPortfolioTransition(restoreFocus=false) {
  const state=current;
  if(!state)return;
  current=null;
  state.animations.forEach(animation=>animation.cancel());
  state.weather.stop();
  state.sound.stop();
  state.garden.setAttribute('src',state.originalSrc);
  state.root.remove();
  state.main.inert=state.wasInert;
  if(state.wasBusy===null)state.main.removeAttribute('aria-busy');
  else state.main.setAttribute('aria-busy',state.wasBusy);
  document.body.classList.remove('portfolio-light-moving');
  window.removeEventListener('resize',state.resize);
  window.removeEventListener('keydown',state.key);
  document.removeEventListener('visibilitychange',state.visibility);
  if(restoreFocus)focusView();
}

function focusView() {
  const selector=document.querySelector('#home').hidden
    ? (document.querySelector('#section-view').classList.contains('social-view')?'#social-title':'#section-title')
    : (document.documentElement.dataset.input === 'keyboard' ? '.wheel-item[aria-pressed="true"]' : '#main');
  document.querySelector(selector)?.focus({preventScroll:true});
}

// Страница меняется под крупным планом ствола; на возврате — под вспышкой.
export async function beginPortfolioTransition(fromHome) {
  cancelPortfolioTransition();
  if(reduced.matches)return;
  const state=createStage(fromHome);
  if(fromHome) {
    state.root.dataset.phase='storm';
    if(!document.querySelector('#home').hidden)moveHomeAside(state);
    blendPetals(state,false);
    state.sound.rain();
    state.weather.play('storm');
    await animate(state,state.root,[{opacity:1},{opacity:1}],{duration:1100});
    if(current!==state)return;
    await state.assets;
    if(current!==state)return;
    state.root.dataset.phase='tree-strike';
    await strikeTree(state);
    if(current!==state)return;
    state.root.dataset.phase='tree-fall';
    state.garden.src='assets/images/garden-without-near-tree.svg';
    state.tree.style.opacity='1';
    document.querySelectorAll('.home-poem-leaves').forEach(node=>void animate(state,node,[{opacity:1},{opacity:0}],{duration:180}));
    const pose=angle=>treeFallTransform(state.fallPlan,angle);
    void animate(state,state.tree,[{transform:pose(0)},{transform:pose(state.fallPlan.coverStart)}],{duration:1400,easing:'cubic-bezier(.55,.02,.85,.55)'});
    const foliage=animate(state,state.cover,[{opacity:0,clipPath:'circle(0px at 65% 20%)'},{opacity:1,clipPath:state.coverFull}],{duration:300,delay:1100,easing:'cubic-bezier(.4,0,.8,1)'});
    await animate(state,state.root,[{opacity:1},{opacity:1}],{duration:650});
    if(current!==state)return;
    state.root.dataset.phase='tree-approach';
    await foliage;
    if(current!==state)return;
    state.root.dataset.phase='tree-covered';
    state.fracture.style.opacity='0';
    // Непрерывное падение под кроной: 100 мс до замены страницы + 100 мс после.
    state.coverMotion=animate(state,state.tree,[{transform:pose(state.fallPlan.coverStart)},{transform:pose(state.fallPlan.coverEnd)}],{duration:TREE_COVER_MS,easing:'linear'});
    await animate(state,state.root,[{opacity:1},{opacity:1}],{duration:TREE_COVER_MS/2});

  } else {
    state.root.dataset.phase='storm';
    blendPetals(state,false);
    state.sound.rain();
    state.weather.play('storm');
    await animate(state,state.root,[{opacity:1},{opacity:1}],{duration:1600});
    if(current!==state)return;
    state.root.dataset.phase='lightning-strike';
    const bolt=state.root.querySelector('.portfolio-lightning');
    void animate(state,bolt,[{opacity:0},{opacity:1,offset:.2},{opacity:1}],{duration:260});
    const paths=[...bolt.querySelectorAll('path')];
    await animate(state,paths[0],[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:180,easing:'linear'});
    if(current!==state)return;
    await Promise.all(paths.slice(1).map(path=>animate(state,path,[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:80,easing:'linear'})));
    if(current!==state)return;
    state.root.dataset.phase='lightning';
    await state.sound.thunder();
    if(current!==state)return;
    void animate(state,bolt,[{opacity:1},{opacity:0}],{duration:180});
    await animate(state,state.flash,[{opacity:1},{opacity:1}],{duration:500,easing:'linear'});
  }
}

export async function finishPortfolioTransition(toPortfolio,{restoreHomeScroll=true}={}) {
  const state=current;
  if(!state)return;
  if(toPortfolio) {
    await state.coverMotion;
    if(current!==state)return;
    state.root.dataset.phase='tree-landing';
    const pose=angle=>treeFallTransform(state.fallPlan,angle);
    void animate(state,state.tree,[{transform:pose(state.fallPlan.coverEnd),opacity:1},{transform:pose(112),opacity:1,offset:.8},{transform:pose(118),opacity:0}],{duration:650,easing:'cubic-bezier(.25,0,.65,1)'});
    await animate(state,state.cover,[{clipPath:state.coverFull,opacity:1},{clipPath:'circle(0px at 50% 150%)',opacity:1}],{duration:650,easing:'cubic-bezier(.25,0,.65,1)'});
    if(current!==state)return;
    state.root.dataset.phase='clearing';
    state.sound.fade();
    state.weather.play('clearing');
    blendPetals(state,true);
    await animate(state,state.root,[{opacity:1},{opacity:1}],{duration:Math.max(1800,innerHeight/650*1000+600)});
  } else {
    if(restoreHomeScroll)window.scrollTo({top:0,behavior:'instant'});
    state.root.dataset.phase='garden-return';
    state.weather.play('clearing');
    blendPetals(state,true);
    void animate(state,state.flash,[{opacity:1},{opacity:0}],{duration:220});
    state.sound.fade();
    await animate(state,state.root,[{opacity:1},{opacity:1}],{duration:Math.max(1800,innerHeight/650*1000+600)});
  }
  if(current===state) {
    cancelPortfolioTransition();
    focusView();
  }
}

reduced.addEventListener('change',event=>{if(event.matches)cancelPortfolioTransition(true);});

