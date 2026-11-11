import { getVolume, setVolume, registerVolume, prepareVolume } from "./audio-volume.js";
import { musicTracks } from './music-data.js';
import { prepareInteractionSound, playInteractionSound } from './interaction-sound.js';

import { readAudioSession, saveAudioSession, resumeAudio } from './audio-session.js';
let restoreRoom = () => {};
export function restoreMusic() { restoreRoom(); }
let leaveRoom = async () => {};
export function stopMusic(mode) { return leaveRoom(mode); }

export function setupMusic(backgroundAudio) {
  const content = document.querySelector('#section-content');
  const player = new Audio(); registerVolume(player);
  player.preload = 'metadata';
  const find = selector => content.querySelector(selector);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let selected = null, source = null, flight = null;
  let phase = 'idle', busy = false, exiting = false, resumeBackground = false;
  let seeking = false;
  let operation = Promise.resolve(), departure = null, departureMode, armEngaged = false;

  const time = seconds => `${Math.floor((seconds || 0) / 60)}:${String(Math.floor((seconds || 0) % 60)).padStart(2, '0')}`;
  const progress = () => Number.isFinite(player.duration) && player.duration > 0 ? Math.min(1, Math.max(0, player.currentTime / player.duration)) : 0;
  // От внешней канавки к внутренней: угол зависит от позиции, включая перемотку.
  const grooveAngle = () => 24 + 18 * progress();
  const angle = value => `rotate(${value}deg)`;

  function updateProgress() {
    const seek = find('.deck-seek');
    if (!seek) return;
    if (!seeking) seek.value = progress() * 100;
    const clock = find('.deck-time');
    const position = time(player.currentTime);
    if (clock.textContent !== position) clock.textContent = position;
    if (phase === 'seated' && armEngaged) find('.tonearm').style.transform = angle(grooveAngle());
  }

  function update() {
    const panel = find('.turntable-panel');
    if (!panel) return;
    panel.dataset.phase = phase;
    panel.classList.toggle('is-playing', Boolean(selected && !player.paused));
    panel.classList.toggle('is-spinning', phase === 'lowering' || Boolean(selected && !player.paused));
    panel.classList.toggle('has-record', Boolean(selected && ['lowering', 'seated', 'lifting'].includes(phase)));
    find('.deck-toggle').disabled = !selected || busy || exiting;
    find('.deck-eject').disabled = !selected || busy || exiting;
    find('.deck-toggle').dataset.action = player.paused ? 'play' : 'pause';
    find('.deck-toggle').setAttribute('aria-label', player.paused ? 'Продолжить запись' : 'Поставить запись на паузу');
    const title = find('.deck-title');
    const titleText = selected?.title || 'Пока здесь тихо';
    if (title.textContent !== titleText) title.textContent = titleText;
    const action = { extracting: 'достаём пластинку', transferring: 'ставим пластинку', lowering: 'опускаем иглу', lifting: 'поднимаем иглу', returning: 'возвращаем пластинку', inserting: 'убираем в конверт' }[phase];
    find('.deck-subtitle').textContent = selected ? `V1zor · ${action || (player.paused ? 'на паузе' : selected.kind === 'song' ? 'песня' : 'бит')}` : 'Пластинка ждёт на полке';
    const seek = find('.deck-seek');
    seek.disabled = !selected || busy || exiting || !Number.isFinite(player.duration);
    updateProgress();
    content.querySelectorAll('[data-record]').forEach(button => {
      const active = button.dataset.record === selected?.id;
      button.disabled = busy || exiting;
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', `${active ? 'Вернуть в конверт:' : 'Слушать'} ${musicTracks.find(track => track.id === button.dataset.record).title}`);
      button.closest('.vinyl-card').classList.toggle('is-selected', active);
    });
  }
  function setPhase(value) { phase = value; update(); }
  function releaseTrack() {
    saveAudioSession('garden-record', null);
    selected = source = null;
    player.removeAttribute('src');
    player.load();
  }
  function restoreBackground() {
    const resume = resumeBackground;
    resumeBackground = false;
    if (resume) backgroundAudio.play().catch(() => {});
  }
  async function tween(element, frames, duration, easing = 'cubic-bezier(.4,0,.2,1)') {
    Object.assign(element.style, frames[frames.length - 1]);
    if (reduced()) return;
    const animation = element.animate(frames, { duration, easing });
    await animation.finished;
  }
  // Поворот меняет прямоугольник вокруг диска, но не его центр и диаметр.
  function circleRect(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 + scrollX,
      y: rect.top + rect.height / 2 + scrollY,
      diameter: parseFloat(getComputedStyle(element).width)
    };
  }

  function recordAngle(element) {
    const transform = getComputedStyle(element).transform;
    const matrix = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform);
    return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
  }

  async function carryRecord(element, sleeve, platter, rotation, returning = false) {
    const palette = getComputedStyle(element);
    const origin = returning ? platter : sleeve;
    const diameter = origin.diameter;
    const lift = Math.max(54, Math.min(100, platter.diameter * .32));
    const controlX = sleeve.x + (platter.x - sleeve.x) * .52;
    const controlY = Math.min(sleeve.y, platter.y) - lift * .65;
    const frames = Array.from({ length: 49 }, (_, index) => {
      const t = index / 48;
      const u = 1 - t;
      // Последняя касательная вертикальна и совпадает с осью шпинделя.
      const x = u ** 3 * sleeve.x + 3 * u ** 2 * t * controlX
        + 3 * u * t ** 2 * platter.x + t ** 3 * platter.x;
      const y = u ** 3 * sleeve.y + 3 * u ** 2 * t * controlY
        + 3 * u * t ** 2 * (platter.y - lift * 2) + t ** 3 * platter.y;
      const height = Math.sin(Math.PI * t);
      const size = (sleeve.diameter * u + platter.diameter * t) * (1 + height * .035);
      return {
        transform: `translate3d(${x - origin.x}px, ${y - origin.y}px, 0) rotate(${rotation}deg) scale(${size / diameter})`,
        boxShadow: `0 ${3 + height * 12}px ${5 + height * 17}px #4c35454a`
      };
    });
    if (returning) frames.reverse();

    flight = element.cloneNode(true);
    flight.classList.add('record-flight');
    Object.assign(flight.style, {
      animation: 'none',
      left: `${origin.x - diameter / 2}px`,
      top: `${origin.y - diameter / 2}px`,
      width: `${diameter}px`,
      height: `${diameter}px`
    }, frames[0]);
    for (const property of ['--sleeve-light', '--sleeve-ink']) flight.style.setProperty(property, palette.getPropertyValue(property));
    flight.setAttribute('aria-hidden', 'true');
    document.body.append(flight);
    if (returning) {
      setPhase('returning');
      element.remove();
    } else {
      source.closest('.vinyl-card').classList.add('record-out');
      setPhase('transferring');
    }
    await tween(flight, frames, 1400, 'cubic-bezier(.42,0,.28,1)');
  }
  async function moveArm(down) {
    const arm = find('.tonearm'), needle = arm.querySelector('span');
    if (down) {
      await tween(arm, [{ transform: getComputedStyle(arm).transform }, { transform: angle(grooveAngle()) }], 650);
      await tween(needle, [{ transform: 'rotate(5deg) translateY(-5px)' }, { transform: 'rotate(5deg) translateY(0px)' }], 250, 'ease-in-out');
      armEngaged = true;
    } else {
      await tween(needle, [{ transform: getComputedStyle(needle).transform }, { transform: 'rotate(5deg) translateY(-5px)' }], 250, 'ease-in-out');
      armEngaged = false;
      await tween(arm, [{ transform: getComputedStyle(arm).transform }, { transform: angle(-8) }], 650);
    }
  }
  async function play() {
    if (!selected || exiting) return;
    if (!backgroundAudio.paused) resumeBackground = true;
    backgroundAudio.pause();
    setVolume(player, getVolume(backgroundAudio));
    try { prepareVolume(); await player.play(); }
    catch (error) {
      if (error.name !== 'AbortError' && find('.deck-message')) find('.deck-message').textContent = 'Не удалось включить запись. Нажми ▶ ещё раз.';
      if (!exiting) restoreBackground();
    }
    update();
  }
  async function place(track, button, needleSound, saved) {
    find('.entry-disc')?.remove();
    selected = track;
    if(saved)resumeBackground = Boolean(saved.resumeBackground);
    source = button.querySelector('.vinyl-disc');
    player.src = track.src;
    find('.deck-message').textContent = '';
    const fromTranslate = getComputedStyle(source).translate;
    source.style.translate = fromTranslate;
    source.closest('.vinyl-card').classList.add('is-handling');
    setPhase('extracting');
    // Первый шаг происходит внутри конверта: его лицевая сторона закрывает диск.
    await tween(source, [{ translate: fromTranslate }, { translate: '108% 0px' }], 740, 'ease-in-out');
    const start = circleRect(source), deck = find('.deck-record');
    const rotation = recordAngle(source);
    await carryRecord(source, start, circleRect(deck), rotation);
    const disc = source.cloneNode(true);
    disc.style.removeProperty('translate');
    disc.style.removeProperty('transform');
    disc.style.setProperty('--record-start-angle', `${rotation}deg`);
    deck.replaceChildren(disc);
    const palette = getComputedStyle(source);
    for (const property of ['--sleeve-light', '--sleeve-ink']) deck.style.setProperty(property, palette.getPropertyValue(property));
    setPhase('lowering');
    flight.remove(); flight = null;
    // Игла опускается только после того, как диск лежит на проигрывателе.
    if (!exiting) {
      await moveArm(true);
      void playInteractionSound(needleSound, () => !exiting && selected === track && armEngaged);
    }
    setPhase('seated');
    if (saved && Number.isFinite(saved.time)) player.currentTime = Math.min(saved.time, Number.isFinite(player.duration) ? player.duration : saved.time);
    if (!exiting) {
      if(saved) {
        if(saved.playing) { backgroundAudio.pause(); setVolume(player, getVolume(backgroundAudio)); void resumeAudio(player, () => selected === track && !exiting); }
      } else await play();
    }
    if (!exiting && innerWidth <= 850) find('.turntable-panel').scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' });
  }
  async function eject(resume = true) {
    if (!selected) { if (resume) restoreBackground(); return; }
    player.pause();
    setPhase('lifting');
    if (armEngaged) await moveArm(false);
    const deck = find('.deck-record');
    const disc = deck.querySelector('.vinyl-disc');
    if (disc) {
      const start = circleRect(deck), end = circleRect(source);
      const rotation = recordAngle(disc);
      await carryRecord(disc, end, start, rotation, true);
      source.style.transform = angle(rotation);
      source.closest('.vinyl-card').classList.remove('record-out');
      flight.remove(); flight = null;
      setPhase('inserting');
      await tween(source, [{ translate: '108% 0px' }, { translate: '0px 0px' }], 740, 'ease-in-out');
    }
    source.style.removeProperty('translate');
    source.closest('.vinyl-card').classList.remove('is-handling', 'record-out');
    releaseTrack();
    setPhase('idle');
    if (resume) restoreBackground();
  }
  function run(action) {
    if (busy || exiting) return;
    busy = true; update();
    operation = action().catch(() => {
      player.pause(); flight?.remove(); flight = null;
      if (source) {
        source.style.removeProperty('translate');
        source.closest('.vinyl-card').classList.remove('is-handling', 'record-out');
      }
      releaseTrack(); armEngaged = false;
      find('.deck-record')?.replaceChildren();
      phase = 'idle'; restoreBackground();
      if (find('.deck-message')) find('.deck-message').textContent = 'Не удалось поставить пластинку. Попробуй выбрать её ещё раз.';
    }).finally(() => { busy = false; update(); });
  }
  leaveRoom = mode => {
    if (departure) {
      // При смене маршрута «удержать» и «освободить» — разные операции.
      return mode === departureMode ? departure : departure.then(() => leaveRoom(mode));
    }
    departureMode = mode;
    exiting = true; update();
    if (selected) player.pause();
    departure = (async () => {
      // При выходе во время переноса сначала завершаем движение, затем возвращаем диск.
      await operation;
      busy = true;
      if (mode === 'hold') {
        player.pause();
        if (armEngaged) {
          armEngaged = false;
          const arm = find('.tonearm');
          arm.style.transform = angle(-8);
          arm.querySelector('span').style.transform = 'rotate(5deg) translateY(-5px)';
        }
        return;
      }
      if (mode === 'clear') {
        player.pause();
        find('.deck-record')?.replaceChildren();
        if (source) {
          source.style.removeProperty('translate');
          source.closest('.vinyl-card').classList.remove('is-handling', 'record-out');
        }
        releaseTrack();
        armEngaged = false;
        setPhase('idle');
        restoreBackground();
        return;
      }
      await eject();
    })().finally(() => { busy = false; exiting = mode === 'hold'; departure = null; update(); });
    return departure;
  };
  content.addEventListener('click', event => {
    const button = event.target.closest('[data-record]');
    if (busy || exiting) return;
    if (button) {
      const track = musicTracks.find(item => item.id === button.dataset.record);
      if (selected?.id === track.id) run(() => eject());
      else {
        const needleSound = prepareInteractionSound('vinyl-needle');
        run(async () => {
          await eject(false);
          if (!exiting) await place(track, button, needleSound);
        });
      }
    } else if (event.target.closest('.deck-toggle')) { if (player.paused) play(); else player.pause(); }
    else if (event.target.closest('.deck-eject')) run(() => eject());
  });
  content.addEventListener('pointerdown', event => { if (event.target.matches('.deck-seek')) seeking = true; });
  window.addEventListener('pointerup', () => { seeking = false; });
  window.addEventListener('pointercancel', () => { seeking = false; });
  content.addEventListener('change', event => { if (event.target.matches('.deck-seek')) { seeking = false; updateProgress(); } });
  content.addEventListener('input', event => {
    if (event.target.matches('.deck-seek') && !busy && Number.isFinite(player.duration)) {
      player.currentTime = Number(event.target.value) / 100 * player.duration;
      updateProgress();
    }
  });
  ['play', 'pause', 'loadedmetadata'].forEach(name => player.addEventListener(name, update));
  ['timeupdate', 'seeked'].forEach(name => player.addEventListener(name, updateProgress));
  let lastSave = 0;
  const saveRecord = () => { if(selected)saveAudioSession('garden-record',{id:selected.id,time:player.currentTime,playing:!player.paused,resumeBackground}); };
  player.addEventListener('timeupdate', () => { if(performance.now()-lastSave>1000){lastSave=performance.now();saveRecord();} });
  window.addEventListener('pagehide',saveRecord);
  restoreRoom = () => {
    const saved = readAudioSession('garden-record');
    const track = musicTracks.find(item => item.id === saved?.id);
    const button = track && find(`[data-record="${track.id}"]`);
    if(button)run(() => place(track,button,undefined,saved));
  };
  player.addEventListener('ended', () => run(() => eject()));
  player.addEventListener('error', () => {
    if (!selected) return;
    if (find('.deck-message')) find('.deck-message').textContent = 'Не удалось загрузить запись. Попробуй выбрать её ещё раз.';
    restoreBackground();
  });
  backgroundAudio.addEventListener('play', () => { resumeBackground = false; player.pause(); update(); });
  backgroundAudio.addEventListener('volumechange', () => { setVolume(player, getVolume(backgroundAudio)); });
}
