let active = null;
let departure = null;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

export function cancelSocialFlip() {
  if(departure) {
    const state=departure;departure=null;
    state.animations.forEach(animation=>animation.cancel());
    state.section.inert=state.wasInert;
  }
  if (!active) return;
  const { home, section, portrait, overlay, animations } = active;
  active = null;
  animations.forEach(animation => animation.cancel());
  overlay?.remove();
  portrait.classList.remove('social-portrait-detached');
  section.classList.remove('social-preparing', 'social-returning');
  home.classList.remove('social-returning');
  home.inert = false;
  section.inert = false;
}

export async function playSocialExit() {
  const section=document.querySelector('#section-view');
  const state={section,wasInert:section.inert,animations:[]};
  departure=state;section.inert=true;
  section.querySelectorAll('.social-card,.back-link,.section-nav').forEach(node=>{
    const distance=innerWidth-node.getBoundingClientRect().left+80;
    state.animations.push(node.animate([{translate:'0px 0px'},{translate:`${distance}px 0px`}],
      {duration:700,easing:'cubic-bezier(.3,0,.2,1)',fill:'forwards'}));
  });
  await Promise.all(state.animations.map(animation=>animation.finished.catch(()=>{})));
}

function scrollForFlip(state, end) {
  const start = scrollY;
  if (start === end) return;
  const started = performance.now();
  return new Promise(resolve => {
    function step(now) {
      if (active !== state) { resolve(); return; }
      const t = Math.min((now - started) / 330, 1);
      scrollTo({ top: start + (end - start) * t * t * (3 - 2 * t), behavior: 'instant' });
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}

export async function playSocialFlip(home, section, { returning = false, layoutHome } = {}) {
  const portrait = home.querySelector('.portrait');
  const state = { home, section, portrait, overlay: null, animations: [] };
  active = state;
  home.inert = true;
  if (returning) {
    section.inert = true;
    await scrollForFlip(state, 0);
  } else {
    const top = portrait.getBoundingClientRect().top;
    if (top < -12 || top >= innerHeight - 110) {
      await scrollForFlip(state, Math.max(0, scrollY + top - 95));
    }
  }
  if (active !== state) return;

  // На время измерения обе сцены существуют в одной системе координат.
  if (returning) {
    home.classList.add('social-returning');
    section.classList.add('social-returning');
    layoutHome();
  } else {
    section.classList.add('social-preparing');
  }
  const card = section.querySelector('.social-card');
  const target = card.getBoundingClientRect();
  const source = portrait.getBoundingClientRect();
  const width = portrait.offsetWidth;
  const height = portrait.offsetHeight;
  const endX = target.left + target.width / 2;
  const endY = target.top + scrollY + target.height / 2;
  const startX = source.left + source.width / 2;
  const startY = source.top + source.height / 2;
  const sx = width / target.width;
  const sy = height / target.height;

  const overlay = document.createElement('div');
  overlay.className = 'social-flip';
  overlay.inert = true;
  overlay.setAttribute('aria-hidden', 'true');
  Object.assign(overlay.style, { width: `${target.width}px`, height: `${target.height}px` });

  const front = document.createElement('div');
  front.className = 'home-right social-flip-front';
  front.style.setProperty('--scene-scale', getComputedStyle(home).getPropertyValue('--scene-scale'));
  Object.assign(front.style, { width: `${width}px`, height: `${height}px`, transform: `scale(${1 / sx}, ${1 / sy})` });
  const photo = portrait.cloneNode(true);
  photo.querySelector('.photo-tape').remove();
  front.append(photo);

  const back = card.cloneNode(true);
  back.classList.add('social-flip-back');
  back.removeAttribute('aria-labelledby');
  back.querySelector('#social-title').removeAttribute('id');
  overlay.append(front, back);
  document.body.append(overlay);
  state.overlay = overlay;
  portrait.classList.add('social-portrait-detached');

  const wheelWrap = home.querySelector('.wheel-wrap');
  const distance = Math.max(120, wheelWrap.getBoundingClientRect().right + 100);
  const totalDuration = 1150;
  // В обратную сторону короткие движения начинаются с задержкой, чтобы
  // колесо и лента закончили движение одновременно с карточкой.
  const track = (node, frames, duration, easing = 'linear') => node.animate(frames, {
    duration, easing, fill: 'both',
    direction: returning ? 'reverse' : 'normal',
    delay: returning ? totalDuration - duration : 0
  });
  const rollEase = 'cubic-bezier(.37,0,.52,1)';
  const moveLeft = [{ translate: '0px' }, { translate: `${-distance}px` }];
  const heading = home.querySelector('.home-left');
  const tape = portrait.querySelector('.photo-tape');
  state.animations.push(
    track(wheelWrap, moveLeft, 850, rollEase),
    track(home.querySelector('.wheel-selection'), [{ translate: '0px' }, { translate: `${-distance - 230}px`, opacity: 0 }], 850, rollEase),
    track(home.querySelector('#wheel'), [{ rotate: '0deg' }, { rotate: `${-360 * distance / (Math.PI * wheelWrap.offsetWidth)}deg` }], 850, rollEase),
    track(heading, [{ opacity: 1 }, { opacity: 0, translate: '0px -22px' }], 460),
    track(tape, [{ opacity: 1 }, { opacity: 0, rotate: '-12deg' }], 600)
  );
  if (returning) {
    state.animations.push(section.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, fill: 'forwards' }));
  }

  const frame = (x, y, tilt, turn, scaleX, scaleY) =>
    `translate(${x}px, ${y}px) translate(-50%, -50%) perspective(1250px) rotateZ(${tilt}deg) rotateY(${turn}deg) scale(${scaleX}, ${scaleY})`;
  const flight = track(overlay, [
    { transform: frame(startX, startY, 3, 0, sx, sy), easing: 'ease-out' },
    { offset: .23, transform: frame(startX - 12, startY - 25, -3, 16, sx * 1.04, sy * 1.04), easing: 'ease-in-out' },
    { transform: frame(endX, endY, 0, 180, 1, 1) }
  ], totalDuration);
  state.animations.push(flight);
  await flight.finished.catch(() => {});
  return active === state;
}

let viewportWidth = innerWidth;
window.addEventListener('resize', () => { if(innerWidth !== viewportWidth) { viewportWidth=innerWidth;cancelSocialFlip(); } });
reduced.addEventListener('change', () => { if (reduced.matches) cancelSocialFlip(); });
