import { poetryArtMarkup } from './poetry-art.js';
// Мягкая сакура из тех же цветов и лепестков, что и garden.svg.
import { refreshPoetryReveal } from './poetry-reveal.js';
import { layoutPaper, startPaperPhysics } from './poetry-physics.js';
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
let variationSeed;
try { variationSeed=Number(sessionStorage.getItem('mishgun-poetry-variation-v1')); } catch {}
if (!Number.isInteger(variationSeed) || variationSeed<=0) {
  variationSeed=1+Math.floor(Math.random()*0x7ffffffe);
  try { sessionStorage.setItem('mishgun-poetry-variation-v1',String(variationSeed)); } catch {}
}
function randomSequence(salt) {
  let state=(variationSeed^salt)>>>0;
  return () => {
    state=(state+0x6d2b79f5)>>>0;
    let value=Math.imul(state^(state>>>15),state|1);
    value^=value+Math.imul(value^(value>>>7),value|61);
    return ((value^(value>>>14))>>>0)/4294967296;
  };
}
function shuffle(values,random) {
  const result=[...values];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
const directionBags=new Map();
function growthDirection(level) {
  const block=Math.floor(level/3);
  if(!directionBags.has(block)) {
    const bag=shuffle(['left','right','both'],randomSequence(0x4173+block*997));
    if(block>0&&bag[0]===growthDirection(block*3-1)) [bag[0],bag[1]]=[bag[1],bag[0]];
    directionBags.set(block,bag);
  }
  return directionBags.get(block)[level%3];
}
function blossom(x,y,size=1,turn=0) {
  return `<g transform="translate(${x} ${y}) rotate(${turn}) scale(${size*1.4})">${[0,72,144,216,288].map((angle,i)=>`<ellipse rx="4" ry="9" cy="-6" fill="${['#f9d4e3','#f5d0df','#fce3ed','#efb8cc','#fce5ed'][i]}" transform="rotate(${angle})"/>`).join('')}<circle r="2.4" fill="#c48e9e"/></g>`;
}
function cluster(x,y,scale=1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">${[[-17,-12,25],[8,-25,23],[27,-2,21],[-8,9,20]].map(([x,y,r],i)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${['#f6d5e2','#edbdd0','#fbe5ec','#e0a1bc'][i]}" opacity=".38"/>`).join('')}${[[-24,-7,.7,12],[3,-22,.85,-17],[27,-3,.68,35],[0,8,.8,3],[-12,-35,.5,20]].map(args=>blossom(...args)).join('')}</g>`;
}
function controls(points,i) {
  const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(points.length-1,i+2)];
  return [b,[b[0]+(c[0]-a[0])/6,b[1]+(c[1]-a[1])/6],[c[0]-(d[0]-b[0])/6,c[1]-(d[1]-b[1])/6],c];
}
function curve(points) {
  return `M${points[0].join(' ')} `+points.slice(1).map((_,i)=>{const [,a,b,c]=controls(points,i);return `C${a.join(' ')} ${b.join(' ')} ${c.join(' ')}`;}).join(' ');
}
function radius(width,index,total,level) {
  return (Math.min(17,Math.max(9,width*.012))*(1-index/(total-1))+2.5*index/(total-1))*(level ? .9 : 1);
}
function stemRadius(width,index,total,level) {
  return radius(width,growthDirection(level)==='right'?total-1-index:index,total,level);
}
function wood(points,width,level) {
  const upper=points.map(([x,y],i)=>[x,y-stemRadius(width,i,points.length,level)]);
  const lower=points.map(([x,y],i)=>[x,y+stemRadius(width,i,points.length,level)]).reverse();
  const shape = `<path d="${curve(upper)} ${curve(lower).replace(/^M/,'L')}Z" fill="#9b7a87"/><path d="${curve(upper)}" fill="none" stroke="#c49ba9" stroke-width="1.2" opacity=".55"/>`;
  return `<g class="branch-stem-half branch-stem-left">${shape}</g><g class="branch-stem-half branch-stem-right">${shape}</g>`;
}
function branchPoint(points,x) {
  const index=Math.max(0,points.findIndex((p,i)=>i<points.length-1&&x>=p[0]&&x<=points[i+1][0]));
  const p=controls(points,index);
  const at=(t,axis)=>(1-t)**3*p[0][axis]+3*(1-t)**2*t*p[1][axis]+3*(1-t)*t*t*p[2][axis]+t**3*p[3][axis];
  let lo=0,hi=1;
  for(let step=0;step<16;step++){const mid=(lo+hi)/2;if(at(mid,0)<x)lo=mid;else hi=mid;}
  return [x,at((lo+hi)/2,1)];
}
function branchArtwork(width,anchors,level) {
  const points=[[-width*.3,85],...anchors,[width*1.3,42]];
  // Рисунок строится в реальных пикселях: цветы не растягиваются вместе с SVG.
  const count=Math.max(1,Math.ceil(width/260));
  const random=randomSequence(0x5391+level*131+count*53);
  const twigOrder=shuffle(Array.from({length:count},(_,i)=>i),random);
  const bloomOrder=shuffle(Array.from({length:count},(_,i)=>i),random);
  if(count>1&&twigOrder.every((value,i)=>value===bloomOrder[i])) bloomOrder.push(bloomOrder.shift());
  let art=wood(points,width,level);
  for(let index=0;index<count;index++) {
    const seed=(index*37+level*19)%101/100;
    const x=width*(index+.38+seed*.18)/count;
    const [,y]=branchPoint(points,x);
    const direction=index%2 ? -1 : 1,down=(index+level)%2===1;
    const fx=x+direction*(19+seed*16),fy=y+(down ? 16+seed*8 : -30-seed*19);
    const twigDelay=Math.round(720+twigOrder.indexOf(index)*35+random()*20);
    const bloomDelay=Math.round(1240+bloomOrder.indexOf(index)*42+random()*20);
    art+=`<g class="branch-offshoot ${down?'branch-offshoot--down':'branch-offshoot--up'}" style="--twig-delay:${twigDelay}ms;--bloom-delay:${bloomDelay}ms"><path class="offshoot-stem" pathLength="1" d="M${x} ${y}Q${x+direction*13} ${y+(down?12:-22)} ${fx} ${fy}" fill="none" stroke="#9b7a87" stroke-width="${2.4+seed}" stroke-linecap="round"/><g transform="translate(${fx} ${fy})"><g class="branch-bloom">${cluster(0,0,down ? .5+seed*.12 : .7+seed*.22)}</g></g></g>`;
  }
  return art;
}
const wrapping=`<svg class="thread-wrap" viewBox="0 0 22 36" aria-hidden="true"><path class="rope-front" d="M7 3C9 10 12 21 15 29M11 3C13 11 16 21 18 28"/><path class="rope-knot" d="m12 28 5 3m-1-4-4 5m2-2-3 6m4-5 5 3"/></svg>`;
const paperTie=`<svg class="paper-tie" viewBox="0 0 24 32" aria-hidden="true"><circle cx="12" cy="15" r="4"/><path d="m10 15 4 2m0-3-3 4m1-1-2 7m3-7 4 5"/></svg>`;
export function poetryGardenMarkup(poems,collection={}) {
  const ties=[50,18,82,50,20,50,80],anchors=[59,85,71,49,64,82,57];
  return `<div class="poetry-garden" aria-label="Коллекция стихотворений на ветвях сакуры"><div class="poetry-row"><svg class="poetry-branch" aria-hidden="true" preserveAspectRatio="none"></svg>${poems.map((poem,index)=>`<div class="poem-hanging" style="--paper-tie:${ties[index]}%;--tie-x:50%;--anchor:${anchors[index]}px;--thread:${[75,72,91,80,78,96,71][index]}px;--coil:24px;--sway:${1.1+index%3*.2}deg;--breeze-duration:${6.8+index%4*.8}s;--breeze-delay:${-index*1.7}s"><span class="poem-visibility-marker" data-leaf-trigger="${index}" aria-hidden="true"></span><span class="poem-branch-knot" aria-hidden="true">${wrapping}</span><div class="poem-drop"><div class="poem-pendant"><span class="poem-thread" aria-hidden="true"></span><div class="poem-paper-space"><button type="button" class="poem-card" data-poem="${index}" aria-label="Читать стихотворение «${escapeHTML(poem.title)}»" aria-haspopup="dialog" aria-controls="poem-dialog"><i class="paper-point paper-point--a" aria-hidden="true"></i><i class="paper-point paper-point--b" aria-hidden="true"></i><i class="paper-point paper-point--c" aria-hidden="true"></i><span class="paper-watermark" aria-hidden="true">${poetryArtMarkup(poem.artwork)}</span>${paperTie}${[1,5].includes(index)?'<span class="paper-fold" aria-hidden="true"></span>':''}<span class="paper-light" aria-hidden="true"></span><span class="eyebrow">${escapeHTML(poem.date)}</span><div class="poem-card-heading"><h2>${poem.untitled ? '<span class="untitled-mark" aria-label="Без названия">***</span>' : escapeHTML(poem.title)}</h2></div><p class="poem-preview">${escapeHTML(poem.excerpt)}</p><span class="poem-card-bottom"><span class="read-more">Читать полностью <span aria-hidden="true">↗</span></span><span class="leaf-signature">Борознов Михаил</span></span></button></div></div></div></div>`).join('')}</div></div><div class="poetry-afterword"><p>${escapeHTML(collection.intro||'')}</p>${collection.profileUrl?`<a class="text-link" href="${escapeHTML(collection.profileUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(collection.profileLabel)}</a>`:`<p>${escapeHTML(collection.profileTeaser||'')}</p>`}</div>`;
}
const layoutWidths=new WeakMap();
export function layoutPoetryGarden() {
  if(!document.body.classList.contains('in-poems'))return;
  const row=document.querySelector('.poetry-row');
  if(!row)return;
  const width=row.clientWidth;
  if(layoutWidths.get(row)===width)return;
  layoutWidths.set(row,width);
  const physics=[...row.querySelectorAll('.poem-hanging')].map(layoutPaper);
  const svg=row.querySelector('.poetry-branch'),height=row.clientHeight,levels=[];
  [...row.querySelectorAll('.poem-hanging')].forEach(leaf=>{
    const style=getComputedStyle(leaf),top=leaf.offsetTop;
    let level=levels.find(item=>Math.abs(item.top-top)<1);
    if(!level){level={top,anchors:[],leaves:[]};levels.push(level);}
    level.anchors.push([leaf.offsetLeft+parseFloat(style.getPropertyValue('--tie-x')),parseFloat(style.getPropertyValue('--anchor'))]);
    level.leaves.push(leaf);
  });
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  svg.innerHTML=levels.map((level,index)=>{
    level.leaves.forEach((leaf,i)=>leaf.style.setProperty('--coil',`${stemRadius(width,i+1,level.leaves.length+2,index)*2+3}px`));
    return `<g class="branch-level" data-growth="${growthDirection(index)}" data-leaves="${level.anchors.length}" data-offshoots="${Math.ceil(width/260)}" data-poems="${level.leaves.map(leaf=>leaf.querySelector('[data-poem]').dataset.poem).join(',')}" transform="translate(0 ${level.top})">${branchArtwork(width,level.anchors,index)}</g>`;
  }).join('');
  refreshPoetryReveal(row);
  startPaperPhysics(physics);
}

