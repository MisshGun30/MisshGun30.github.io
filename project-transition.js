import { projectPropGeometry, projectFlightFrames, PROJECT_TIMING as TIME } from './project-geometry.js';
import { projectSoundtrack, prepareProjectSound } from './project-sound.js';
import { stopProjectPageMotion } from './projects.js';
export { prepareProjectSound };

let current;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
function animate(state, node, frames, options) {
  const animation = node.animate(frames, { fill: 'both', easing: 'cubic-bezier(.25,.7,.2,1)', ...options });
  state.animations.push(animation);
  return animation.finished.catch(() => {});
}
const hold = (state, duration) => animate(state, state.root, [{ opacity: 1 }, { opacity: 1 }], { duration });

function createStage() {
  const root = document.createElement('div');
  root.className = 'project-transition'; root.setAttribute('aria-hidden', 'true');
  root.innerHTML = '<div class="project-flight-case"><img src="assets/images/project-case.svg" alt=""></div><div class="project-cover-space"><div class="project-cover-leaf"><span></span><i></i><i></i></div></div><div class="project-blackout"></div>';
  document.body.append(root);
  const main = document.querySelector('#main');
  const state = { root, main, animations: [], wasInert: main.inert, wasBusy: main.getAttribute('aria-busy'),
    flying: root.querySelector('.project-flight-case'), cover: root.querySelector('.project-cover-leaf'),
    black: root.querySelector('.project-blackout'), sound: projectSoundtrack(),
    source: document.querySelector('#home-project-case'), spring: document.querySelector('#home-project-spring') };
  state.sourceVisibility = state.source.style.visibility;
  main.inert = true; main.setAttribute('aria-busy', 'true');
  document.body.classList.add('project-is-moving');
  const viewportWidth = innerWidth;
  state.resize = () => { if(innerWidth !== viewportWidth) cancelProjectTransition(true); };
  state.key = event => { if (event.key === 'Escape') cancelProjectTransition(true); };
  state.visibility = () => { if (document.hidden) cancelProjectTransition(); };
  window.addEventListener('resize', state.resize);
  window.addEventListener('keydown', state.key);
  document.addEventListener('visibilitychange', state.visibility);
  current = state;
  return state;
}

function focusView() {
  const target=document.querySelector('#home').hidden
    ? (document.querySelector('#section-view').classList.contains('social-view')?'#social-title':'#section-title')
    : (document.documentElement.dataset.input === 'keyboard' ? '.wheel-item[aria-pressed="true"]' : '#main');
  document.querySelector(target)?.focus({ preventScroll: true });
}
export function cancelProjectTransition(focus = false) {
  stopProjectPageMotion();
  const state = current;
  if (!state) return;
  current = null;
  state.animations.forEach(animation => animation.cancel());
  state.sound.stop();
  state.source.style.visibility = state.sourceVisibility;
  state.root.remove();
  state.main.inert = state.wasInert;
  if (state.wasBusy === null) state.main.removeAttribute('aria-busy');
  else state.main.setAttribute('aria-busy', state.wasBusy);
  document.body.classList.remove('project-is-moving');
  window.removeEventListener('resize', state.resize);
  window.removeEventListener('keydown', state.key);
  document.removeEventListener('visibilitychange', state.visibility);
  if (focus) focusView();
}

export async function beginProjectTransition(fromHome) {
  cancelProjectTransition();
  if (reduced.matches) return;
  const state = createStage();
  if (fromHome) {
    state.root.dataset.phase = 'compress';
    const asset = state.flying.querySelector('img').decode().catch(() => {});
    void animate(state, state.source, [{ translate: '0px 0px' }, { translate: '0px 28px' }], { duration: TIME.compress, easing: 'ease-in' });
    await animate(state, state.spring, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(.45)' }], { duration: TIME.compress, easing: 'ease-in' });
    await asset;
    if (current !== state) return;
    const geometry = projectPropGeometry();
    const rect = state.source.getBoundingClientRect();
    const start = { x: rect.left, y: rect.top, scale: rect.width / 240 };
    // При сильном обрезании фонового сада старт остаётся у соответствующего края.
    if (rect.right < 0 || rect.left > innerWidth || rect.bottom < 0 || rect.top > innerHeight) {
      start.x = Math.max(-geometry.width / 2, Math.min(innerWidth - geometry.width / 2, geometry.x));
      start.y = Math.max(0, Math.min(innerHeight - geometry.height / 2, geometry.y));
      start.scale = geometry.width / 240;
    }
    state.source.style.visibility = 'hidden';
    state.flying.style.opacity = '1';
    state.root.dataset.phase = 'launch';
    void state.sound.play('spring', () => current === state && state.root.dataset.phase === 'launch');
    void animate(state, state.spring, [{ transform: 'scaleY(.45)' }, { transform: 'scaleY(1.6)', offset: .24 },
      { transform: 'scaleY(.8)', offset: .55 }, { transform: 'scaleY(1)' }], { duration: TIME.launch });
    await Promise.all([
      animate(state, state.flying, projectFlightFrames(start, innerWidth, innerHeight), { duration: TIME.launch, easing: 'linear' }),
      // Затемнение завершается во время движения, чтобы удар не обрывался стоп-кадром.
      animate(state, state.black, [{ opacity: 0 }, { opacity: 0, offset: .84 }, { opacity: 1 }],
        { duration: TIME.launch, easing: 'linear' })
    ]);
  } else {
    state.root.dataset.phase = 'closing';
    state.cover.style.opacity = '1';
    void state.sound.play('folder', () => current === state && state.root.dataset.phase === 'closing');
    await animate(state, state.cover, [{ transform: 'rotateY(-105deg)' }, { transform: 'rotateY(0deg)' }], { duration: TIME.close, easing: 'cubic-bezier(.4,0,.35,1)' });
  }
  if (current !== state) return;
  if (!fromHome) await animate(state, state.black, [{ opacity: 0 }, { opacity: 1 }], { duration: TIME.blackout, easing: 'linear' });
  if (current !== state) return;
  state.root.dataset.phase = 'covered';
  await hold(state, TIME.hold);
}

export async function finishProjectTransition(toProjects) {
  const state = current;
  if (!state) return;
  state.animations.forEach(animation => { if (animation.effect?.target === state.flying) animation.cancel(); });
  state.flying.style.opacity = '0';
  if (toProjects) {
    state.root.dataset.phase = 'opening';
    state.cover.style.opacity = '1';
    void state.sound.play('folder', () => current === state && ['opening', 'unfold'].includes(state.root.dataset.phase));
    await animate(state, state.black, [{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: 'linear' });
    if (current !== state) return;
    const opening = animate(state, state.cover, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-105deg)' }], { duration: TIME.open, easing: 'cubic-bezier(.4,0,.35,1)' });
    await hold(state, TIME.open * .4);
    if (current !== state) return;
    state.root.dataset.phase = 'unfold';
    await opening;
  } else {
    state.root.dataset.phase = 'garden-return';
    state.cover.style.opacity = '0';
    await animate(state, state.black, [{ opacity: 1 }, { opacity: 0 }], { duration: TIME.return, easing: 'linear' });
  }
  if (current === state) { cancelProjectTransition(); focusView(); }
}
reduced.addEventListener('change', event => { if (event.matches) cancelProjectTransition(true); });
