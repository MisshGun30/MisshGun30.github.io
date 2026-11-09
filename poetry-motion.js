import { nudgePaper } from './poetry-physics.js';
import { prepareInteractionSound, playInteractionSound } from './interaction-sound.js';

// Один бумажный лист проходит путь от настоящего подвеса до окна чтения и назад.
const dialog=document.querySelector('#poem-dialog');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const OPEN=1800,CLOSE=1700;
let activeButton=null,activeLeaf=null,ghost=null,flightAnimation=null,threadAnimation=null;
let motions=[],closing=false,revision=0;
const clamp=value=>Math.max(0,Math.min(1,value));
const smooth=value=>value*value*(3-2*value);
function animate(node,frames,options) {
  const animation=node.animate(frames,{fill:'both',...options});motions.push(animation);return animation;
}
function cancelMotions(){motions.forEach(animation=>animation.cancel());motions=[];flightAnimation=null;}
function sourceMatrix(width,height) {
  const [a,b,c]=['a','b','c'].map(key=>activeButton.querySelector('.paper-point--'+key).getBoundingClientRect());
  return new DOMMatrix([(b.x-a.x)/width,(b.y-a.y)/width,(c.x-a.x)/height,(c.y-a.y)/height,a.x,a.y]);
}
function readerMatrix(width,height) {
  const rect=dialog.getBoundingClientRect();
  return new DOMMatrix([rect.width/width,0,0,rect.height/height,rect.x,rect.y]);
}
function blend(from,to,amount) {
  const a=from.toFloat64Array(),b=to.toFloat64Array();
  return new DOMMatrix(a.map((value,index)=>value+(b[index]-value)*amount));
}
function tilt(matrix,width,height,x,y) {
  const perspective=new DOMMatrix();perspective.m34=-1/1100;
  return matrix.translate(width/2,height/2).multiply(perspective).rotate(x,y,0).translate(-width/2,-height/2);
}
function makeGhost() {
  const style=getComputedStyle(activeButton);
  const width=parseFloat(style.width),height=parseFloat(style.height);
  const node=activeButton.cloneNode(true);
  node.classList.remove('is-reading');node.classList.add('poem-flight-paper');
  node.removeAttribute('data-poem');node.removeAttribute('aria-controls');node.removeAttribute('aria-haspopup');
  node.setAttribute('aria-hidden','true');node.setAttribute('inert','');node.tabIndex=-1;
  node.querySelectorAll('.paper-point').forEach(point=>point.remove());
  ['--paper-tie','--paper-tone','--paper-edge','--rope'].forEach(property=>{
    const value=style.getPropertyValue(property);if(value)node.style.setProperty(property,value);
  });
  Object.assign(node.style,{width:width+'px',height:height+'px',transform:'none',rotate:'none',opacity:'1'});
  const titleStyle=getComputedStyle(activeButton.querySelector('h2')),title=node.querySelector('h2');
  ['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','margin'].forEach(property=>title.style[property]=titleStyle[property]);
  dialog.append(node);ghost=node;
  return {width,height};
}
function ghostSize(){return {width:parseFloat(ghost.style.width),height:parseFloat(ghost.style.height)};}
function flightFrames(from,to,width,height,opening) {
  // Промежуточная поза: лист уже перед нами, но ещё сохраняет форму карточки.
  const source=opening?from:to,reader=readerMatrix(width,height);
  const angle=Math.atan2(source.b,source.a);
  const scale=Math.min(Math.hypot(reader.a,reader.b),Math.hypot(reader.c,reader.d))*.88;
  const near=new DOMMatrix().translate(reader.e+reader.a*width/2,reader.f+reader.d*height/2)
    .rotate(angle*180/Math.PI).scale(scale).translate(-width/2,-height/2);
  return Array.from({length:81},(_,index)=>{
    const t=index/80;
    let matrix;
    if(opening){
      const approach=smooth(clamp((t-.14)/.46));
      matrix=t<.6?blend(from,near,approach):blend(near,to,smooth(clamp((t-.6)/.4)));
      matrix=new DOMMatrix().translate(0,18*smooth(clamp(t/.14))*(1-approach)).multiply(matrix);
    }else{
      matrix=t<.4?blend(from,near,smooth(t/.4)):blend(near,to,smooth(clamp((t-.4)/.52)));
    }
    const roll=Math.sin(Math.PI*t)* (opening?1:1-clamp(t/.92));
    return {offset:t,transform:tilt(matrix,width,height,roll*(opening?10:-7),roll*(opening?-13:9)).toString()};
  });
}
function contents(){return [...dialog.querySelectorAll('.poem-reader-bar,.poem-reader-page')];}
function previewNodes(){return [...ghost.querySelectorAll('.eyebrow,.poem-card-heading,.poem-preview,.poem-card-bottom')];}
function skin(from,to,duration,delay=0) {
  animate(dialog,[from,to],{duration,delay,easing:'ease-in-out'});
}
function settleReading() {
  cancelMotions();ghost?.remove();ghost=null;
  dialog.classList.remove('has-paper-flight','is-closing');
  dialog.dataset.paperState='reading';
}
export async function openPoemLeaf(button) {
  if(dialog.open)return;
  const token=++revision;
  cancelMotions();ghost?.remove();threadAnimation?.cancel();threadAnimation=null;
  activeButton=button;activeLeaf=button.closest('.poem-hanging');closing=false;
  document.body.classList.add('poem-petals-paused');
  // Держим только этот подвес для точной геометрии; весь остальной сад качается.
  activeLeaf.classList.add('is-reader-source');
  dialog.classList.add('has-paper-flight');dialog.dataset.paperState='opening';
  dialog.showModal();dialog.scrollTop=0;
  void playInteractionSound(prepareInteractionSound('poem-paper-rustle'), () => token === revision && dialog.open);
  if(reduced.matches){button.classList.add('is-reading');settleReading();return;}
  const {width,height}=makeGhost();
  const from=sourceMatrix(width,height),to=readerMatrix(width,height);
  button.classList.add('is-reading');
  flightAnimation=animate(ghost,flightFrames(from,to,width,height,true),{duration:OPEN,easing:'linear'});
  animate(ghost,[{opacity:1},{opacity:0}],{duration:320,delay:OPEN-320,easing:'ease-in-out'});
  animate(ghost,[{filter:getComputedStyle(button).filter},{filter:'drop-shadow(8px 20px 20px #80526838)'},{filter:'drop-shadow(3px 6px 9px #80526816)'}],{duration:OPEN,easing:'ease-in-out'});
  previewNodes().forEach(node=>animate(node,[{opacity:1},{opacity:0}],{duration:400,delay:OPEN*.6,easing:'ease-in-out'}));
  contents().forEach(node=>animate(node,[{opacity:0},{opacity:1}],{duration:360,delay:OPEN-420,easing:'ease-out'}));
  skin({backgroundColor:'#fffcf500',borderColor:'transparent',boxShadow:'0 0 0 #51333f00'},
    {backgroundColor:'#fffcf5',borderColor:'#c8b0a25c',boxShadow:'0 25px 100px #51333f22'},340,OPEN-400);
  ghost.querySelectorAll('.paper-tie path').forEach(node=>animate(node,[{opacity:1},{opacity:0}],{duration:220,delay:80,easing:'ease-in'}));
  const thread=activeLeaf.querySelector('.poem-thread');
  threadAnimation=thread.animate([
    {transform:'none'},
    {transform:'rotate(-4deg)',offset:.4},
    {transform:'rotate(2deg)',offset:.7},
    {transform:'none'}
  ],{duration:800,delay:80,easing:'ease-in-out',fill:'forwards'});
  await flightAnimation.finished.catch(()=>{});
  if(token===revision&&dialog.open&&!closing)settleReading();
}
export async function closePoemLeaf() {
  if(!dialog.open||closing)return;
  closing=true;const token=++revision;
  document.body.classList.remove('poem-petals-paused');
  if(reduced.matches||!activeButton?.isConnected){dialog.close();return;}
  const content=contents().map(node=>({node,opacity:getComputedStyle(node).opacity}));
  const surface={backgroundColor:getComputedStyle(dialog).backgroundColor,borderColor:getComputedStyle(dialog).borderColor,boxShadow:getComputedStyle(dialog).boxShadow};
  let from,opacity;
  const previewOpacity=new Map(ghost?previewNodes().map(node=>[node,getComputedStyle(node).opacity]):[]);
  if(ghost){from=new DOMMatrix(getComputedStyle(ghost).transform);opacity=getComputedStyle(ghost).opacity;}
  cancelMotions();
  dialog.classList.add('has-paper-flight','is-closing');dialog.dataset.paperState='closing';
  if(!ghost){const size=makeGhost();from=readerMatrix(size.width,size.height);opacity=0;}
  const {width,height}=ghostSize(),to=sourceMatrix(width,height);
  flightAnimation=animate(ghost,flightFrames(from,to,width,height,false),{duration:CLOSE,easing:'linear'});
  animate(ghost,[{opacity},{opacity:1}],{duration:220,easing:'ease-out'});
  animate(ghost,[{opacity:1},{opacity:0}],{duration:180,delay:CLOSE-180,easing:'ease-in-out',fill:'forwards'});
  animate(activeButton,[{opacity:0},{opacity:1}],{duration:180,delay:CLOSE-180,easing:'ease-in-out'});
  previewNodes().forEach(node=>animate(node,[{opacity:previewOpacity.get(node)||0},{opacity:1}],{duration:CLOSE*.3,easing:'ease-in-out'}));
  content.forEach(({node,opacity})=>animate(node,[{opacity},{opacity:0}],{duration:250,easing:'ease-in'}));
  skin(surface,{backgroundColor:'#fffcf500',borderColor:'transparent',boxShadow:'0 0 0 #51333f00'},320,80);
  ghost.querySelectorAll('.paper-tie path').forEach(node=>animate(node,[{opacity:0},{opacity:1}],{duration:180,delay:CLOSE*.78,easing:'ease-out'}));
  const thread=activeLeaf.querySelector('.poem-thread'),threadFrom=getComputedStyle(thread).transform;
  threadAnimation?.cancel();
  threadAnimation=thread.animate([
    {transform:threadFrom},
    {transform:'rotate(-2deg)',offset:.78},
    {transform:'none'}
  ],{duration:300,delay:CLOSE-300,easing:'cubic-bezier(.2,.65,.25,1)',fill:'both'});
  await flightAnimation.finished.catch(()=>{});
  if(token===revision&&dialog.open)dialog.close();
}
function finish() {
  document.body.classList.remove('poem-petals-paused');
  const leaf=activeLeaf,settle=closing;
  revision++;cancelMotions();ghost?.remove();ghost=null;
  threadAnimation?.cancel();threadAnimation=null;
  activeButton?.classList.remove('is-reading');activeLeaf?.classList.remove('is-reader-source');
  activeButton=null;activeLeaf=null;closing=false;
  dialog.classList.remove('has-paper-flight','is-closing');delete dialog.dataset.paperState;
  if(settle&&leaf?.isConnected)nudgePaper(leaf,.2);
}
dialog.addEventListener('close',finish);
dialog.addEventListener('cancel',event=>{event.preventDefault();closePoemLeaf();});
reduced.addEventListener('change',()=>{
  if(!reduced.matches)return;
  revision++;cancelMotions();threadAnimation?.cancel();threadAnimation=null;
  if(closing&&dialog.open)dialog.close();
  else if(dialog.open)settleReading();
});
