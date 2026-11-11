import { getVolume, setVolume, prepareVolume } from "./audio-volume.js";
import { readAudioSession, saveAudioSession, resumeAudio } from './audio-session.js';
import { musicMarkup, setupMusic, stopMusic, restoreMusic } from './music.js';
import { projectsMarkup, setupProjects } from './projects.js';
import { beginProjectTransition, finishProjectTransition, cancelProjectTransition, prepareProjectSound } from './project-transition.js';
import { portfolioMarkup, setupPortfolio, closePortfolio, restorePortfolioDocument, portfolioUrlMatchesView } from './portfolio.js';
import { beginPortfolioTransition, finishPortfolioTransition, cancelPortfolioTransition, preparePortfolioSound } from './portfolio-transition.js';
import { beginMusicTransition, finishMusicTransition, cancelMusicTransition } from './music-transition.js';
import { holdHomePiecesAway } from './scene-transition.js';
import { renderPoemBody } from './poetry-reader.js';
import { journeyMarkup, setupJourney, closeJourney, layoutJourneyTrail } from './journey.js';
import { mountJourneyMatch, unmountJourneyMatch } from './journey-match.js';
import { cancelJourneyReturn, playJourneyReturn, finishJourneyReturn } from './journey-return.js';
import { sections, poems, poetryCollection, socialLinks } from './content.js';
import { playSocialFlip, playSocialExit, cancelSocialFlip } from './social-transition.js';
import { transitionFor } from './route-transitions.js';
import { homeAppearance } from './appearance.js';
import { poetryGardenMarkup, layoutPoetryGarden } from './poetry-garden.js';
import { openPoemLeaf, closePoemLeaf } from './poetry-motion.js';
import { stopPoetryReveal } from './poetry-reveal.js';
import { stopPaperPhysics } from './poetry-physics.js';
import { cancelSceneTransition, playHomeExit, playPoetryEntry, finishSceneTransition, playPoetryReturn, finishPoetryExit, finishHomeReturn } from './scene-transition.js';
import { cancelLampTransition, playLampExit, finishLampEntry } from './lamp-transition.js';
import { prepareLampSound } from './lamp-sound.js';

history.scrollRestoration = 'manual';
document.documentElement.dataset.input = 'pointer';
document.addEventListener('pointerdown', () => { document.documentElement.dataset.input = 'pointer'; }, {capture:true,passive:true});
document.addEventListener('keydown', event => { if (event.key === 'Tab' || event.key.startsWith('Arrow')) document.documentElement.dataset.input = 'keyboard'; }, true);
const $ = selector => document.querySelector(selector);
const requestedHeading = new URLSearchParams(location.search).get('heading');
$('#home').dataset.headingLayout = ['left','card'].includes(requestedHeading) ? requestedHeading : homeAppearance.headingLayout;
const audio = $('#background-audio');
let selected = 0;
let wheelPosition = 0;
let routeToken = 0;
let currentRoute = 'home';
let audioMessageTimer;
let selectionMeasure,selectionMeasureKey='',selectionBounds;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const storage = { get(key) { try { return localStorage.getItem(key); } catch { return null; } }, set(key, value) { try { localStorage.setItem(key, value); } catch {} } };
$('.skip-link').addEventListener('click', event => { event.preventDefault(); $('#main').focus(); });
// Разрешение звука получаем в самом нажатии, до асинхронной смены раздела.
document.addEventListener('click',event=>{
  const trigger=event.target.closest('a,button');
  if(!trigger||motion.matches)return;
  const href=trigger.getAttribute('href');
  const wheelIndex=trigger.dataset.index;
  const target=href?.startsWith('#')?href.slice(1):
    trigger.id==='selected-label'?sections[selected].id:
    wheelIndex!==undefined?sections[Number(wheelIndex)]?.id:null;
  if(target!=='home'&&!sections.some(section=>section.id===target))return;
  const scene=transitionFor(currentRoute,target);
  if(scene==='lamps')prepareLampSound();
  if(scene==='tree-in'||scene==='storm')preparePortfolioSound();
  if(scene==='folder-in'||scene==='folder-close')prepareProjectSound();
},{capture:true});
$('.brand').addEventListener('click', event => {
  if (!location.hash || location.hash === '#home') {
    event.preventDefault();
    window.scrollTo({ top:0, behavior:'instant' });
  }
});

$('#wheel-items').innerHTML = sections.map((section, index) => `<button type="button" class="wheel-item" data-index="${index}" aria-pressed="${index === 0}"><span>${section.label}</span></button>`).join('');

// Каждый сектор занимает 60°. Геометрия диска — SVG, подписи — обычные кнопки.
const sectorStart = { x:400 + 398 * Math.cos(-Math.PI/6), y:400 + 398 * Math.sin(-Math.PI/6) };
const sectorEnd = { x:sectorStart.x, y:400 - 398 * Math.sin(-Math.PI/6) };
$('#wheel-disc').innerHTML = sections.map((_, index) => `<path class="wheel-sector" data-sector="${index}" d="M400 400 L${sectorStart.x} ${sectorStart.y} A398 398 0 0 1 ${sectorEnd.x} ${sectorEnd.y} Z" transform="rotate(${index * 60} 400 400)"/>`).join('')
  + '<circle cx="400" cy="400" r="398" fill="none" stroke="#b27b94" stroke-width="3"/><circle cx="400" cy="400" r="377" fill="none" stroke="#fff7fa" stroke-width="1.5"/><circle cx="400" cy="400" r="245" fill="none" stroke="#b27b94" stroke-opacity=".25"/><circle cx="400" cy="400" r="102" fill="#f9e9ef" stroke="#b27b94" stroke-opacity=".5"/>';

const wrapIndex = value => ((value % sections.length) + sections.length) % sections.length;
const wheelDisc = $('#wheel-disc');
const wheelItems = [...document.querySelectorAll('.wheel-item')];
const wheelSectors = [...wheelDisc.querySelectorAll('.wheel-sector')];
let renderedSelection = -1;

function updateWheel(delta = 0) {
  wheelPosition += delta;
  selected = wrapIndex(Math.round(wheelPosition));
  wheelDisc.style.transform = `rotate(${-wheelPosition * 60}deg)`;
  wheelItems.forEach((button, index) => {
    button.style.setProperty('--angle', `${(index - wheelPosition) * 60}deg`);
  });
  if (renderedSelection === selected) return;
  renderedSelection = selected;
  wheelItems.forEach((button, index) => {
    button.setAttribute('aria-pressed', String(index === selected));
    const distance = wrapIndex(index - selected);
    const visible = distance === 0 || distance === 1 || distance === sections.length - 1;
    button.setAttribute('aria-hidden', String(!visible));
    button.tabIndex = visible ? 0 : -1;
    wheelSectors[index].classList.toggle('is-selected', index === selected);
  });
  $('#section-counter').textContent = `${selected + 1}/${sections.length}`;
  $('#section-counter').setAttribute('aria-label', `Раздел ${selected + 1} из ${sections.length}`);
  $('#selected-label').textContent = sections[selected].label;
  $('#selected-caption').textContent = sections[selected].caption;
  $('#selected-label').setAttribute('aria-label', `Открыть раздел «${sections[selected].label}»`);
}

$('#previous-section').addEventListener('click', () => updateWheel(-1));
$('#next-section').addEventListener('click', () => updateWheel(1));
$('#selected-label').addEventListener('click', () => {
  if(sections[selected].id==='about')prepareLampSound();
  location.hash = sections[selected].id;
});
let dragStart = null;
let dragged = false;
let suppressClick = false;
const wheel = $('#wheel');
wheel.addEventListener('pointerdown', event => {
  if (event.button !== 0 || dragStart) return;
  const box = wheel.getBoundingClientRect();
  const centerX = box.left + box.width / 2;
  const centerY = box.top + box.height / 2;
  dragStart = { x:event.clientX, y:event.clientY, centerX, centerY, angle:Math.atan2(event.clientY-centerY,event.clientX-centerX), position:wheelPosition, pointer:event.pointerId };
  dragged = false;
  suppressClick = false;
});
window.addEventListener('pointermove', event => {
  if (!dragStart || event.pointerId !== dragStart.pointer) return;
  if (Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) > 10) {
    if (!dragged) wheel.setPointerCapture(event.pointerId);
    dragged = true;
    wheel.classList.add('is-dragging');
    const angle = Math.atan2(event.clientY - dragStart.centerY, event.clientX - dragStart.centerX);
    const difference = Math.atan2(Math.sin(angle-dragStart.angle),Math.cos(angle-dragStart.angle));
    wheelPosition = dragStart.position - difference / (Math.PI/3);
    updateWheel();
  }
});
window.addEventListener('pointerup', event => {
  if (!dragStart || event.pointerId !== dragStart.pointer) return;
  suppressClick = dragged;
  wheel.classList.remove('is-dragging');
  wheelPosition = Math.round(wheelPosition);
  updateWheel();
  dragStart = null;
  dragged = false;
  if (wheel.hasPointerCapture(event.pointerId)) wheel.releasePointerCapture(event.pointerId);
});
window.addEventListener('pointercancel', event => {
  if (!dragStart || event.pointerId !== dragStart.pointer) return;
  wheelPosition = Math.round(dragStart.position);
  dragStart = null; dragged = false; suppressClick = false;
  wheel.classList.remove('is-dragging'); updateWheel();
});
$('#wheel-items').addEventListener('click', event => {
  const item = event.target.closest('[data-index]');
  if (!item || suppressClick) { suppressClick = false; return; }
  const index = Number(item.dataset.index);
  if(sections[index].id==='about')prepareLampSound();
  location.hash = sections[index].id;
});
wheel.addEventListener('keydown', event => {
  suppressClick = false;
  if (['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'].includes(event.key)) {
    event.preventDefault(); updateWheel(['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1);
    document.querySelector(`.wheel-item[data-index="${selected}"]`).focus({ preventScroll: true });
  }
});
updateWheel();

function aboutMarkup() {
  return journeyMarkup();
}
function poemsMarkup() {
  return poetryGardenMarkup(poems, poetryCollection);
}
function contactMarkup() {
  const links = socialLinks.map(({ label, detail, url }) => `
    <li><a href="${url}"${url.startsWith('mailto:') ? '' : ' target="_blank" rel="noopener noreferrer"'}>
      <span><strong>${label}</strong><small>${detail}</small></span>
    </a></li>`).join('');
  return `<article class="social-card" aria-labelledby="social-title">
    <h1 id="social-title" tabindex="-1">${sections.find(section => section.id === 'contact').title}</h1>
    <ul class="social-links">${links}</ul>
  </article>`;
}
const renderers = { about: aboutMarkup, poems: poemsMarkup, music: musicMarkup, projects: projectsMarkup, portfolio: portfolioMarkup, contact: contactMarkup };
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold:.12 });

async function renderRoute(initial = false) {
  const token = ++routeToken;
  const requestedId = location.hash.slice(1) || 'home';
  const id = requestedId === 'photos' ? 'portfolio' : requestedId;
  if (requestedId === 'photos') history.replaceState(null, '', '#portfolio');
  const section = sections.find(item => item.id === id);
  const source=currentRoute,target=section?.id??'home';
  const scene=initial||motion.matches?'none':transitionFor(source,target);
  const approach=scene==='petal-in',lampExit=scene==='lamps';
  const musicExit=scene==='music-in',musicLeaving=scene==='music-out';
  const musicReturning=musicLeaving&&target==='home';
  const portfolioExit=scene==='tree-in',portfolioLeaving=scene==='storm';
  const projectExit=scene==='folder-in',projectLeaving=scene==='folder-close';
  const matchLeaving=scene==='match-out',poetryLeaving=scene==='poetry-wind';
  const socialSceneExit=source==='contact'&&['petal-in','music-in','folder-in','tree-in'].includes(scene);
  const musicHeld=source==='music'&&source!==target&&scene!=='none';
  let socialHomeReady = false;
  cancelSceneTransition();
  cancelProjectTransition();
  cancelPortfolioTransition();
  closePortfolio();
  cancelSocialFlip();
  cancelMusicTransition();
  cancelLampTransition();
  cancelJourneyReturn();
  if(!matchLeaving)unmountJourneyMatch();
  closeJourney();
  await stopMusic(musicHeld ? 'hold' : undefined);
  if (token !== routeToken) return;
  stopPoetryReveal();
  stopPaperPhysics();
  if (!section && id !== 'home') history.replaceState(null, '', '#home');
  if ($('#poem-dialog').open) $('#poem-dialog').close();
  document.body.classList.remove('transitioning');
  // Табличка освобождает сад до выстрела предмета или грозы.
  if(socialSceneExit&&!approach) {
    await playSocialExit();
    if(token!==routeToken)return;
  }
  switch(scene) {
    case 'lamps': await playLampExit(); break;
    case 'petal-in':
      if(source==='home')await playHomeExit(true);
      else await Promise.all([playSocialExit(),playPoetryEntry()]);
      break;
    case 'music-in':
      if(source==='home')await Promise.all([playHomeExit(false),beginMusicTransition(true)]);
      else await beginMusicTransition(true);
      break;
    case 'folder-in':
      if(source==='home')await Promise.all([playHomeExit(false),beginProjectTransition(true)]);
      else await beginProjectTransition(true);
      break;
    case 'tree-in': await beginPortfolioTransition(true); break;
    case 'folder-close': await beginProjectTransition(false); break;
    case 'storm': await beginPortfolioTransition(false); break;
    case 'music-out': await beginMusicTransition(false); break;
    case 'match-out': await playJourneyReturn(); break;
    case 'poetry-wind': await playPoetryReturn(); break;
    case 'social-flip-in':
      $('#section-content').innerHTML=contactMarkup();
      await playSocialFlip($('#home'),$('#section-view')); break;
    case 'social-flip-back':
      socialHomeReady = await playSocialFlip($('#home'),$('#section-view'),{returning:true,layoutHome}); break;
  }
  if (token !== routeToken) return;
  if(musicHeld) {
    await stopMusic('clear');
    if(token!==routeToken)return;
  }
  if(matchLeaving)unmountJourneyMatch({keepSound:true});
  observer.disconnect();
  currentRoute=target;
  const inside = Boolean(section);
  // На обороте фотокарточки остаётся тот же сад, что и на главной.
  document.body.classList.toggle('in-garden', inside && section.id !== 'contact');
  document.body.classList.toggle('in-poems', section?.id === 'poems');
  document.body.classList.toggle('in-journey', section?.id === 'about');
  const gardenSource=section?.id==='about'?'assets/images/garden-unlit.svg':'assets/images/garden.svg';
  if($('.garden-base').getAttribute('src')!==gardenSource)$('.garden-base').setAttribute('src',gardenSource);
  document.body.classList.toggle('in-music', section?.id === 'music');
  document.body.classList.toggle('in-portfolio', section?.id === 'portfolio');
  document.body.classList.toggle('in-projects', section?.id === 'projects');
  $('#section-view').classList.toggle('social-view', section?.id === 'contact');
  $('#section-view').classList.toggle('projects-view', section?.id === 'projects');
  $('#section-view').classList.toggle('achievements-view', section?.id === 'portfolio');
  $('#section-view').setAttribute('aria-labelledby', section?.id === 'contact' ? 'social-title' : 'section-title');
  $('#home').hidden = inside;
  $('#section-view').hidden = !inside;
  // Обратный переворот уже подготовил главную: не скрываем её на кадр повторного layout.
  if (!inside && !socialHomeReady) {
    $('#home').dataset.layoutReady = 'false';
    layoutHome();
  }
  if (section) {
    selected = sections.indexOf(section); wheelPosition = selected; updateWheel();
    $('#section-kicker').textContent = section.id === 'poems' ? 'Стихотворения' : section.label;
    $('#section-title').textContent = section.title;
    $('#section-note').textContent = section.note;
    $('#section-content').innerHTML = renderers[section.id]();
    if (section.id === 'portfolio') restorePortfolioDocument();
    if(section.id==='music' && initial)restoreMusic();
    if(section.id==='about') {
      mountJourneyMatch({deferIgnition:lampExit && Boolean(document.querySelector('.lamp-blackout'))});
      requestAnimationFrame(layoutJourneyTrail);
    }
    if (section.id === 'poems') {
      $('.poetry-garden').dataset.revealNotBefore = String(performance.now()+(approach ? 900 : 360));
      requestAnimationFrame(layoutPoetryGarden);
    }
    $('#section-nav').innerHTML = sections.map(item => `<a href="#${item.id}" ${item.id === section.id ? 'aria-current="page"' : ''}>${item.id === 'poems' ? 'Стихотворения' : item.label}</a>`).join('');
    document.title = `${section.id === 'poems' ? 'Стихотворения' : section.label} — MishGun`;
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    $('#section-view').classList.remove('entering');
    void $('#section-view').offsetWidth;
    $('#section-view').classList.add('entering');
  } else {
    $('#section-content').replaceChildren();
    document.title = 'Михаил Борознов (MishGun) — стихи, музыка и проекты';
  }
  window.scrollTo({ top:0, behavior:'instant' });
  cancelSocialFlip();
  document.body.classList.remove('transitioning');
  if (projectExit || projectLeaving) {
    cancelSceneTransition();
    void finishProjectTransition(projectExit);
  }
  else if (portfolioExit || portfolioLeaving) {
    cancelSceneTransition();
    void finishPortfolioTransition(portfolioExit,{restoreHomeScroll:target==='home'});
  }
  else if (musicExit || musicLeaving) {
    cancelSceneTransition();
    if (musicReturning) holdHomePiecesAway();
    void finishMusicTransition(musicExit,{fall:musicLeaving&&!musicReturning}).then(() => {
      if (musicReturning && token === routeToken) finishHomeReturn();
    });
  }
  else if (lampExit) void finishLampEntry();
  else if (approach) finishSceneTransition(true);
  if (poetryLeaving) {
    if (!section) finishHomeReturn();
    else finishPoetryExit(section.id === 'projects' ? 'fall' : 'return');
  }
  if (matchLeaving) void finishJourneyReturn();
  if (!initial) { if (section) $(section.id === 'contact' ? '#social-title' : '#section-title').focus({ preventScroll:true }); else (document.documentElement.dataset.input === 'keyboard' ? document.querySelector(`.wheel-item[data-index="${selected}"]`) : $('#main')).focus({ preventScroll:true }); }
}
// История с параметром документа может вызвать popstate без hashchange.
// Один адрес обрабатываем один раз, даже если браузер прислал оба события.
let lastRouteUrl = location.href;
function onRouteChange() {
  if (location.href === lastRouteUrl && portfolioUrlMatchesView()) return;
  lastRouteUrl = location.href;
  void renderRoute();
}
window.addEventListener('hashchange', onRouteChange);
window.addEventListener('popstate', onRouteChange);
setupJourney();
setupMusic(audio);
setupPortfolio();
setupProjects();
renderRoute(true);

$('#section-content').addEventListener('click', event => {
  const button = event.target.closest('[data-poem]');
  if (!button) return;
  const poem = poems[Number(button.dataset.poem)];
  $('#poem-title').textContent = poem.untitled ? '***' : poem.title;
  $('#poem-date').textContent = [poem.untitled ? 'Без названия' : '', poem.date].filter(Boolean).join(' · ');
  $('#poem-date').hidden = !$('#poem-date').textContent;
  renderPoemBody($('#poem-body'),poem);
  openPoemLeaf(button);
});
$('.dialog-close').addEventListener('click', closePoemLeaf);
$('#poem-dialog').addEventListener('click', event => { if (event.target === $('#poem-dialog')) { const box = event.target.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closePoemLeaf(); } });
let poetryLayoutFrame;
window.addEventListener('resize', () => {
  if (location.hash !== '#poems') return;
  cancelAnimationFrame(poetryLayoutFrame);
  poetryLayoutFrame = requestAnimationFrame(() => {
    if (location.hash === '#poems') layoutPoetryGarden();
  });
});

function updateAudioState() {
  const playing = !audio.paused && !audio.ended;
  $('#sound-toggle').setAttribute('aria-pressed', String(playing));
  $('#sound-label').textContent = playing ? 'Выключить музыку' : 'Включить музыку';
}
function message(text) { clearTimeout(audioMessageTimer); $('#audio-message').textContent = text; audioMessageTimer = setTimeout(() => { $('#audio-message').textContent = ''; }, 6000); }
async function startAudio() {
  storage.set('garden-sound','on');
  try { prepareVolume(); await audio.play(); }
  catch { message('Не удалось включить музыку. Попробуй нажать на кнопку звука ещё раз.'); }
  updateAudioState();
}
const backgroundSession = readAudioSession('garden-background');
setVolume(audio, Number.isFinite(backgroundSession?.volume) ? backgroundSession.volume : .22);
$('#volume').value = getVolume(audio);
if(Number.isFinite(backgroundSession?.time))audio.currentTime = backgroundSession.time;
let lastBackgroundSave = 0;
function saveBackground() { saveAudioSession('garden-background', {time:audio.currentTime,volume:getVolume(audio),playing:!audio.paused}); }
audio.addEventListener('timeupdate', () => { if(performance.now()-lastBackgroundSave>1000){lastBackgroundSave=performance.now();saveBackground();} });
window.addEventListener('pagehide', saveBackground);
audio.addEventListener('volumechange', saveBackground);
audio.addEventListener('play', updateAudioState);
audio.addEventListener('pause', updateAudioState);
audio.addEventListener('error', () => message('Музыка пока недоступна. Сад можно исследовать и в тишине.'));
$('#sound-toggle').addEventListener('click', () => { if (audio.paused) startAudio(); else { audio.pause(); storage.set('garden-sound','off'); } });
$('#volume').addEventListener('input', event => { setVolume(audio, event.target.value); prepareVolume(); });
$('#enter-sound').addEventListener('click', () => { storage.set('garden-entered','yes'); $('#welcome').close(); startAudio(); });
$('#enter-silent').addEventListener('click', () => { storage.set('garden-entered','yes'); storage.set('garden-sound','off'); $('#welcome').close(); });
$('#welcome').addEventListener('cancel', () => { storage.set('garden-entered','yes'); storage.set('garden-sound','off'); });
if (!storage.get('garden-entered')) $('#welcome').showModal();
else if(storage.get('garden-sound') === 'on' && !readAudioSession('garden-record')?.id) {
  void resumeAudio(audio, () => storage.get('garden-sound') === 'on' && !readAudioSession('garden-record')?.id);
}

// Лепестки — лёгкие декоративные элементы. На небольшом экране их меньше.
// Для возврата прежней плотности поменять 'fuller' на 'original'.
const petalSettings = {
  density: 'fuller',
  original: { mobile:13, desktop:26 },
  fuller: { mobile:19, desktop:38 }
};
const mobilePetals = matchMedia('(width < 760px)');
let petalCount, petalTimer;
function createPetals() {
  clearTimeout(petalTimer);
  const preset = petalSettings[petalSettings.density];
  const count = motion.matches ? 0 : mobilePetals.matches ? preset.mobile : preset.desktop;
  if (count === petalCount) return;
  if (document.querySelector('[data-flight-petal]') || $('#poem-dialog').open) {
    petalTimer = setTimeout(createPetals, 200);
    return;
  }
  petalCount = count;
  $('#petals').replaceChildren();
  $('#petals-back').replaceChildren();
  for (let index = 0; index < count; index++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    const values = { x:`${Math.random()*100}%`, size:`${5+Math.random()*8}px`, duration:`${12+Math.random()*13}s`, delay:`${-Math.random()*25}s`, drift:`${-130+Math.random()*260}px`, spin:`${100+Math.random()*500}deg`, blur: index % 6 === 0 ? '1.3px' : '0px' };
    Object.entries(values).forEach(([key,value]) => petal.style.setProperty(`--${key}`,value));
    (index % 2 === 0 ? $('#petals-back') : $('#petals')).append(petal);
  }
}
motion.addEventListener('change', createPetals);
mobilePetals.addEventListener('change', () => {
  clearTimeout(petalTimer);
  petalTimer = setTimeout(createPetals, 180);
});
createPetals();

// При сближении правой карточки и подписи колесо плавно переезжает вниз.
// Расчёт использует фактическую высоту рамки, включая её наклон и подпись.
function measureAllSectionText(labelStyle,captionStyle) {
  const key=[labelStyle.font,labelStyle.letterSpacing,labelStyle.whiteSpace,
    captionStyle.font,captionStyle.letterSpacing,captionStyle.maxWidth,captionStyle.whiteSpace].join('|');
  if(key===selectionMeasureKey)return selectionBounds;
  if(!selectionMeasure){
    selectionMeasure=document.createElement('div');
    selectionMeasure.setAttribute('aria-hidden','true');selectionMeasure.inert=true;
    selectionMeasure.style.cssText='position:fixed;left:-10000px;top:0;visibility:hidden;pointer-events:none;contain:layout style;';
    selectionMeasure.append(document.createElement('span'),document.createElement('span'));
    document.body.append(selectionMeasure);
  }
  const [label,caption]=selectionMeasure.children;
  [label,caption].forEach((node,index)=>{
    const style=index?captionStyle:labelStyle;
    Object.assign(node.style,{display:'block',width:'max-content',maxWidth:index?style.maxWidth:'none',
      font:style.font,lineHeight:style.lineHeight,letterSpacing:style.letterSpacing,whiteSpace:style.whiteSpace,
      overflowWrap:style.overflowWrap,wordBreak:style.wordBreak,textTransform:style.textTransform});
  });
  const bounds={width:0,labelHeight:0,captionHeight:0};
  sections.forEach(section=>{
    label.textContent=section.label;caption.textContent=section.caption;
    const a=label.getBoundingClientRect(),b=caption.getBoundingClientRect();
    bounds.width=Math.max(bounds.width,a.width,b.width);
    bounds.labelHeight=Math.max(bounds.labelHeight,a.height);
    bounds.captionHeight=Math.max(bounds.captionHeight,b.height);
  });
  selectionMeasureKey=key;selectionBounds=bounds;
  return bounds;
}
function layoutHome() {
  const home = $('#home');
  if (home.hidden && !home.classList.contains('social-returning')) return;
  const width = home.clientWidth;
  const desktop = width >= 1000;
  const availableHeight = document.documentElement.clientHeight - $('.site-header').offsetHeight - $('.site-footer').offsetHeight;
  // На широком экране масштаб ограничивает весь доступный экран, включая footer.
  // Заголовок с карточкой и колесо центрируются независимо, освобождая место.
  const heightLimit = desktop ? availableHeight / 850 : Infinity;
  const widthLimit = desktop ? (width - 32) / 1240 : Infinity;
  const scale = Math.min(1.1, .48 + width / 2800, (width - 24) / 650, heightLimit, widthLimit) * (width < 760 ? .92 : 1);
  const diameter = 800 * scale;
  const visible = diameter * .45;
  const cardWidth = diameter * .67;
  const introLeft = $('.brand').getBoundingClientRect().left - home.getBoundingClientRect().left;
  home.style.setProperty('--scene-scale', scale);
  home.style.setProperty('--wheel-size', `${diameter}px`);
  home.style.setProperty('--intro-left', `${introLeft}px`);
  home.style.setProperty('--intro-width', `${Math.min(510 * scale, width - introLeft - 24)}px`);
  const portrait = $('.portrait');
  const angle = Math.PI / 60;
  const card = { width: portrait.offsetWidth * Math.cos(angle) + portrait.offsetHeight * Math.sin(angle),
    height: portrait.offsetHeight * Math.cos(angle) + portrait.offsetWidth * Math.sin(angle) };
  const protrusion = (card.width - cardWidth) / 2;
  const edge = Math.max(12, width * .018);
  const cardLeft = Math.max(edge + protrusion, width - cardWidth - protrusion - edge);
  const homeLeft = home.getBoundingClientRect().left;
  const labelStyle=getComputedStyle($('#selected-label')),captionStyle=getComputedStyle($('#selected-caption'));
  const textBounds=measureAllSectionText(labelStyle,captionStyle);
  const textRight = $('.selection-copy').getBoundingClientRect().left-homeLeft+textBounds.width;
  const textGap = cardLeft - protrusion - textRight;
  // Запас 10px берём для самого широкого текста среди ВСЕХ разделов.
  const progress = Math.max(0, Math.min(1, (10 - textGap) / (110 * scale)));
  // Ускорение/торможение при переносе без скачка на фиксированном breakpoint.
  const eased = progress * progress * (3 - 2 * progress);
  const cardHeading = home.dataset.headingLayout === 'card';
  const titleHeight = $('.home-left').getBoundingClientRect().height;
  const introBottom = $('.home-left').getBoundingClientRect().bottom - home.getBoundingClientRect().top;
  const fitViewport = desktop && progress === 0 && cardHeading;
  const cardCenter = fitViewport
    ? (availableHeight + titleHeight + 24 * scale) / 2
    : cardHeading
    ? Math.max(titleHeight + 24 * scale + card.height / 2 + 28 * scale, diameter / 2 + 28 * scale)
    : introBottom + 36 * scale + Math.max(diameter / 2, card.height / 2);
  const fullDrop = card.height / 2 + diameter / 2 + 44 * scale;
  const textTopOffset = Math.min(parseFloat(labelStyle.top)-textBounds.labelHeight/2,parseFloat(captionStyle.top)-textBounds.captionHeight/2);
  const clearDrop = Math.min(fullDrop, card.height / 2 + 10 - textTopOffset);
  // Первые 10px сближения освобождают место для текста, затем опускается весь диск.
  const clearProgress = Math.max(0, Math.min(1, (10 - textGap) / 10));
  const clearEased = clearProgress * clearProgress * (3 - 2 * clearProgress);
  const wheelCenter = fitViewport ? availableHeight / 2 : cardCenter + clearEased * clearDrop + eased * (fullDrop - clearDrop);
  home.style.setProperty('--card-left', `${cardLeft}px`);
  home.style.setProperty('--card-center', `${cardCenter}px`);
  home.style.setProperty('--heading-top', `${cardCenter - card.height / 2 - titleHeight - 24 * scale}px`);
  home.style.setProperty('--wheel-center', `${wheelCenter.toFixed(3)}px`);
  home.style.setProperty('--scene-height', `${fitViewport ? availableHeight : Math.ceil(Math.max(cardCenter + card.height / 2, wheelCenter + diameter / 2) + 46 * scale)}px`);
  home.dataset.stackProgress = progress.toFixed(3);
  home.dataset.textGap = textGap.toFixed(2);
  home.dataset.maxSelectionWidth = textBounds.width.toFixed(2);
  requestAnimationFrame(() => { home.dataset.layoutReady = 'true'; });
}
let layoutFrame;
function scheduleHomeLayout() { cancelAnimationFrame(layoutFrame); layoutFrame = requestAnimationFrame(layoutHome); }
let homeLayoutWidth = innerWidth;
window.addEventListener('resize', () => {
  if (innerWidth === homeLayoutWidth && matchMedia('(pointer:coarse)').matches) return;
  homeLayoutWidth = innerWidth;
  scheduleHomeLayout();
});
$('.portrait img').addEventListener('load', scheduleHomeLayout);
scheduleHomeLayout();

