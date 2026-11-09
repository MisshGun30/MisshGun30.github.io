// Временная пластинка связывает фон главной с музыкальной страницей.
import { recordFrame as frame, recordFallFrames } from './music-flight.js';
let active = null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');

function focusView() {
  const target=document.querySelector('#home').hidden
    ? (document.querySelector('#section-view').classList.contains('social-view')?'#social-title':'#section-title')
    : (document.documentElement.dataset.input === 'keyboard' ? '.wheel-item[aria-pressed="true"]' : '#main');
  document.querySelector(target)?.focus({preventScroll:true});
}

export function cancelMusicTransition(focus=false) {
  if (!active) return;
  const state=active;active=null;
  state.animation?.cancel();
  if (state.source) state.source.style.visibility = state.sourceVisibility;
  state.disc.remove();
  state.main.inert=state.wasInert;
  if(state.wasBusy===null)state.main.removeAttribute('aria-busy');
  else state.main.setAttribute('aria-busy',state.wasBusy);
  window.removeEventListener('resize',state.resize);
  window.removeEventListener('keydown',state.key);
  document.removeEventListener('visibilitychange',state.visibility);
  state.resolve?.();
  if(focus)focusView();
}

function gardenRecord() {
  const image = document.querySelector('.home-music-props');
  const rect = image.getBoundingClientRect();
  const scale = Math.max(rect.width / 1800, rect.height / 1200);
  const positions = getComputedStyle(image).objectPosition.split(' ');
  const fraction = (value, fallback) => value?.endsWith('%') ? parseFloat(value) / 100 : fallback;
  const x = rect.left + (rect.width - 1800 * scale) * fraction(positions[0], .5) + 1288 * scale;
  const y = rect.top + (rect.height - 1200 * scale) * fraction(positions[1], .5) + 910 * scale;
  return { x: Math.max(24, Math.min(innerWidth - 24, x)), y: Math.max(24, Math.min(innerHeight - 24, y)), size: Math.max(24, 50 * scale), flat: .61 };
}

function playerPosition() {
  const rect = document.querySelector('.turntable-platter')?.getBoundingClientRect();
  if (!rect) return { x: innerWidth * .72, y: innerHeight + 100, size: 180 };
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, size: rect.width };
}

function smoothScroll(state, destination, duration = 950) {
  const start = scrollY;
  const limit = document.documentElement.scrollHeight - innerHeight;
  const delta = Math.max(0, Math.min(limit, destination)) - start;
  if (Math.abs(delta) < 12) return;
  const started = performance.now();
  return new Promise(resolve => {
    function step(now) {
      if (active !== state) { resolve(); return; }
      const t = Math.min(1, (now - started) / duration);
      window.scrollTo({top:start + delta * (t * t * (3 - 2 * t)), behavior:'instant'});
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}

export async function beginMusicTransition(fromHome) {
  cancelMusicTransition();
  if(reduced.matches)return;
  const disc = document.createElement('div');
  disc.className = 'music-transition-disc';
  disc.setAttribute('aria-hidden', 'true');
  disc.innerHTML = '<span>V1zor<small>музыка</small></span>';
  document.body.append(disc);
  const main=document.querySelector('#main');
  const state = { disc, main, wasInert:main.inert, wasBusy:main.getAttribute('aria-busy'), animation: null, resolve: null };
  active = state;
  main.inert=true;main.setAttribute('aria-busy','true');
  const viewportWidth = innerWidth;
  state.resize = () => { if(innerWidth !== viewportWidth) cancelMusicTransition(true); };
  state.key=event=>{if(event.key==='Escape')cancelMusicTransition(true);};
  state.visibility=()=>{if(document.hidden)cancelMusicTransition();};
  window.addEventListener('resize',state.resize);
  window.addEventListener('keydown',state.key);
  document.addEventListener('visibilitychange',state.visibility);
  disc.style.opacity = '0';
  if (!fromHome) await smoothScroll(state, scrollY + playerPosition().y - innerHeight / 2);
  if (active !== state) return;
  const source = !fromHome && document.querySelector('.deck-record .vinyl-disc, .entry-disc');
  let startTurn = 0;
  if (source) {
    const label = source.querySelector('.vinyl-label, .entry-disc > span');
    if (label) disc.replaceChildren(label.cloneNode(true));
    const style = getComputedStyle(source);
    const matrix = new DOMMatrixReadOnly(style.transform === 'none' ? undefined : style.transform);
    startTurn = Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
    state.source = source;
    state.sourceVisibility=source.style.visibility;
    source.style.visibility = 'hidden';
  }
  const start = fromHome ? gardenRecord() : playerPosition();
  const cover = { x: innerWidth / 2, y: innerHeight / 2, size: Math.hypot(innerWidth, innerHeight) * 2.1 };
  state.coverTurn = startTurn + 18;
  state.animation = disc.animate([
    { transform: frame(start, startTurn), opacity: source ? 1 : 0, easing: 'ease-out' },
    { transform: frame({...start, y:start.y - Math.min(36, start.size * .35), flat: .94, size:start.size * 1.22}, startTurn + 8), opacity: 1, offset: .28, easing: 'cubic-bezier(.35,0,.25,1)' },
    { transform: frame(cover, startTurn + 18), opacity: 1 }
  ], { duration: 1650, fill: 'forwards' });
  await new Promise(resolve => { state.resolve = resolve; state.animation.finished.then(resolve, resolve); });
  if (active === state) state.resolve = null;
}

export async function finishMusicTransition(toMusic,{fall=false}={}) {
  const state = active;
  if (!state) return;
  const turn = state.coverTurn ?? 18;
  if(fall) {
    state.disc.dataset.phase='fall';
    const covering=state.animation;
    state.animation=state.disc.animate(recordFallFrames(innerWidth,innerHeight,turn),
      {duration:1250,easing:'linear',fill:'forwards'});
    covering?.cancel();
    await new Promise(resolve=>{state.resolve=resolve;state.animation.finished.then(resolve,resolve);});
    if(active===state)cancelMusicTransition(true);
    return;
  }
  // Пока экран закрыт пластинкой, показываем проигрыватель для её посадки.
  if (toMusic) document.querySelector('.turntable-platter')?.scrollIntoView({ block: 'center', behavior: 'instant' });
  const cover = { x: innerWidth / 2, y: innerHeight / 2, size: Math.hypot(innerWidth, innerHeight) * 2.1 };
  const target = toMusic ? playerPosition() : gardenRecord();
  state.animation = state.disc.animate([
    { transform: frame(cover, turn), opacity: 1, easing: 'cubic-bezier(.3,0,.3,1)' },
    { transform: frame({...target, y:target.y - Math.min(36, target.size * .35), flat:.94, size:target.size * 1.22}, turn - 10), opacity: 1, offset: .72, easing: 'ease-in-out' },
    { transform: frame(target, turn - 18), opacity: 0 }
  ], { duration: 1500, fill: 'forwards' });
  await new Promise(resolve => { state.resolve = resolve; state.animation.finished.then(resolve, resolve); });
  if (active === state) {
    if (toMusic) {
      const platter = document.querySelector('.turntable-platter');
      if (platter && !platter.querySelector('.entry-disc')) {
        const record = document.createElement('span');
        record.className = 'entry-disc';
        record.setAttribute('aria-hidden', 'true');
        record.innerHTML = '<span>V1zor</span>';
        platter.append(record);
      }
      await smoothScroll(state, 0, 1100);
    }
    if (active === state) cancelMusicTransition(true);
  }
}
reduced.addEventListener('change',event=>{if(event.matches)cancelMusicTransition(true);});
