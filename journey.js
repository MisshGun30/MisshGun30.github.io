import { journey } from './journey-data.js';
import { journeyLayout } from './journey-layout.js';
import { journeyPhotos } from './journey-photos.js';
import { lightJourneyCard, moveMatchToReader } from './journey-match.js';

// Координаты остановок на виде сверху. На телефоне их перестраивает CSS.
const positions = journeyLayout.map(stop=>stop.plan);
const links = {
  1: [['Мои стихи','#poems'],['Результаты и достижения','#portfolio']],
  2: [['Олимпиады и конкурсы','#portfolio']],
  3: [['Школьный Бум — как это было','https://t.me/inschool30']],
  6: [['Пульс рынка','#projects'],['Моя музыка','#music']]
};
const escape = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const number = index => String(index + 1).padStart(2,'0');
function photo(index, extra = '', loading = 'lazy') {
  const image=journeyPhotos[index][0];
  const src = loading === 'eager' ? image.src : image.src.replace(/([^/]+)$/,'card-thumbs/$1');
  return `<div class="journey-photo ${extra}"><img src="${src}" alt="${escape(image.alt)}" decoding="async" loading="${loading}"></div>`;
}

export function journeyMarkup() {
  return `<div class="journey-intro"><p>От Астрахани до Петербурга. От первых увлечений до своих проектов.</p><p>Семь остановок — нажми на карточку, чтобы прочитать историю.</p></div>
    <div class="journey-map" aria-label="Семь остановок моего пути">
      <svg class="journey-trail" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true"><path class="trail-edge" d="M35 805C260 805 390 625 500 540S730 390 965 575"/><path class="trail-center" d="M35 805C260 805 390 625 500 540S730 390 965 575"/></svg>
      ${journey.map((stop,index)=>`<div class="journey-stop" style="--stop-x:${positions[index][0]}%;--stop-y:${positions[index][1]}%;--path-row:${index+1};--phone-x:${index%2?72:28}%;--phone-y:${14+index*12}%;--card-turn:${[-5,4,-3,5,-4,3,-2][index]}deg"><span class="journey-stone" aria-hidden="true">${number(index)}</span><button class="journey-card" data-journey="${index}" type="button" aria-haspopup="dialog">${photo(index)}<span class="journey-card-period">${escape(stop.period)}</span><h2>${escape(stop.title)}</h2><span class="journey-read">Открыть историю ↗</span></button></div>`).join('')}
      <svg class="journey-trail journey-trail-responsive" aria-hidden="true"><path class="trail-edge"/><path class="trail-center"/></svg>
      <svg class="journey-connections" aria-hidden="true"><path/></svg>
      <svg class="journey-trail journey-trail-phone" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="trail-edge" d="M28 9C28 14 72 18 72 26S28 30 28 38S72 42 72 50S28 54 28 62S72 66 72 74S28 78 28 86V95"/><path class="trail-center" d="M28 9C28 14 72 18 72 26S28 30 28 38S72 42 72 50S28 54 28 62S72 66 72 74S28 78 28 86V95"/></svg><p class="journey-continues">А дальше — посмотрим…</p>
    </div>`;
}

let dialog, source, current = 0;
let trailObserver,trailFrame;
export function layoutJourneyTrail() {
  const map=document.querySelector('.journey-map');
  if(!map)return;
  if(!trailObserver)trailObserver=new ResizeObserver(()=>{
    cancelAnimationFrame(trailFrame);trailFrame=requestAnimationFrame(drawTrail);
  });
  trailObserver.disconnect();trailObserver.observe(map);drawTrail();
}
function drawTrail() {
  const map=document.querySelector('.journey-map');
  if(!map)return;
  const rect=map.getBoundingClientRect(),svg=map.querySelector('.journey-trail-responsive');
  const points=[...map.querySelectorAll('.journey-stone')].map(stone=>{
    const r=stone.getBoundingClientRect();return {x:r.left+r.width/2-rect.left,y:r.top+r.height/2-rect.top};
  });
  const responsive=matchMedia('(max-width: 1100px)').matches;
  svg.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);
  let d=`M${points[0].x} 10C${points[0].x-45} 55 ${points[0].x-45} ${points[0].y-70} ${points[0].x} ${points[0].y}`;
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],gap=b.y-a.y;
    d+=`C${a.x} ${a.y+gap*.7} ${b.x} ${b.y-gap*.7} ${b.x} ${b.y}`;
  }
  const last=points.at(-1);d+=`Q${last.x+40} ${last.y+70} ${rect.width*.55} ${rect.height-15}`;
  if(responsive)svg.querySelectorAll('path').forEach(path=>path.setAttribute('d',d));
  const connections=map.querySelector('.journey-connections');
  connections.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);
  let line=`M${points[0].x} ${points[0].y}`;
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i];
    line+=responsive ? `C${a.x} ${a.y+(b.y-a.y)*.7} ${b.x} ${b.y-(b.y-a.y)*.7} ${b.x} ${b.y}`
      : `C${a.x+(b.x-a.x)*.45} ${a.y} ${b.x-(b.x-a.x)*.45} ${b.y} ${b.x} ${b.y}`;
  }
  connections.querySelector('path').setAttribute('d',line);
}
function showStory(index) {
  current = index;
  for (const neighbor of [index - 1, index + 1]) {
    journeyPhotos[neighbor]?.forEach(image => { const preload = new Image(); preload.src = image.src; void preload.decode().catch(() => {}); });
  }
  const stop = journey[index];
  const extras=journeyPhotos[index].slice(1).map(image=>`<figure><img src="${image.src}" alt="${escape(image.alt)}" decoding="async"><figcaption>${escape(image.alt)}</figcaption></figure>`).join('');
  dialog.querySelector('.journey-reader-content').innerHTML = `<div class="journey-reader-photo">${photo(index, '', 'eager')}${extras?`<div class="journey-extra-photos">${extras}</div>`:''}</div><article class="journey-story"><p class="journey-card-period">${number(index)} / 07 · ${escape(stop.period)}</p><h2 id="journey-story-title" tabindex="-1">${escape(stop.title)}</h2>${stop.paragraphs.map(p=>`<p>${escape(p)}</p>`).join('')}<div class="journey-story-links">${(links[index]||[]).map(([label,url])=>url?`<a href="${url}" ${url.startsWith('https://')?'target="_blank" rel="noopener noreferrer"':''}>${label} ↗</a>`:`<span class="journey-future-link">${label}<small>Переход появится позже</small></span>`).join('')}</div></article>`;
  dialog.querySelector('[data-story-prev]').disabled = index === 0;
  dialog.querySelector('[data-story-next]').disabled = index === journey.length - 1;
  dialog.querySelector('.journey-reader-count').textContent = `${number(index)} / 07`;
  dialog.scrollTop = 0;
}
export function setupJourney() {
  dialog = document.createElement('dialog');
  dialog.className = 'journey-dialog';
  dialog.setAttribute('aria-labelledby','journey-story-title');
  dialog.innerHTML = '<div class="journey-reader-bar"><span>Мой путь</span><button type="button" data-story-close aria-label="Закрыть историю">Закрыть ×</button></div><div class="journey-reader-content"></div><nav class="journey-reader-nav" aria-label="Истории"><button type="button" data-story-prev>← Предыдущая</button><span class="journey-reader-count"></span><button type="button" data-story-next>Следующая →</button></nav>';
  document.body.append(dialog);
  document.querySelector('#section-content').addEventListener('click',event=>{
    const button = event.target.closest('[data-journey]');
    if(!button)return;
    lightJourneyCard(button);
    source = button;
    showStory(Number(button.dataset.journey));
    dialog.showModal();
    moveMatchToReader(dialog);
    dialog.querySelector('[data-story-close]').focus({preventScroll:true});
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches)dialog.animate([{opacity:0},{opacity:1}],{duration:450,easing:'ease-out'});
  });
  dialog.querySelector('[data-story-close]').addEventListener('click',()=>dialog.close());
  dialog.querySelector('[data-story-prev]').addEventListener('click',()=>{showStory(current-1);dialog.querySelector('h2').focus({preventScroll:true});});
  dialog.querySelector('[data-story-next]').addEventListener('click',()=>{showStory(current+1);dialog.querySelector('h2').focus({preventScroll:true});});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{moveMatchToReader(null);if(source?.isConnected)source.focus({preventScroll:true});});
}
export function closeJourney() { trailObserver?.disconnect();cancelAnimationFrame(trailFrame);if(dialog?.open)dialog.close(); }

