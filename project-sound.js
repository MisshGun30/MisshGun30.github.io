let context;
const buffers = new Map();
let pageSound;

function load(name) {
  if (!context) return Promise.resolve(null);
  if (!buffers.has(name)) buffers.set(name, fetch(new URL(`./assets/audio/project-${name}.wav`, import.meta.url))
    .then(response => { if (!response.ok) throw new Error('Audio unavailable'); return response.arrayBuffer(); })
    .then(bytes => context.decodeAudioData(bytes)).catch(() => { buffers.delete(name); return null; }));
  return buffers.get(name);
}

export function prepareProjectSound(names = ['spring', 'folder', 'page']) {
  const Engine = window.AudioContext || window.webkitAudioContext;
  if (!Engine) return;
  try {
    context ??= new Engine();
    void context.resume().catch(() => {});
    names.forEach(load);
  } catch { /* Отсутствие аудиоустройства не мешает навигации. */ }
}

export function projectSoundtrack(autoStop = false) {
  const engine = context, voices = new Set();
  const audio = document.querySelector('#background-audio');
  let stopped = false;
  const output = engine?.createGain();
  if (output) { output.gain.value = audio.volume * .55; output.connect(engine.destination); }
  const update = () => { if (output) output.gain.setTargetAtTime(audio.volume * .55, engine.currentTime, .025); };
  audio.addEventListener('volumechange', update);
  function stop() {
    if (stopped) return;
    stopped = true;
    audio.removeEventListener('volumechange', update);
    voices.forEach(source => { try { source.stop(); } catch {} source.disconnect(); });
    voices.clear();
    output?.disconnect();
  }
  return {
    async play(name, valid = () => true) {
      if (!engine || stopped) return false;
      try {
        await engine.resume();
        const buffer = await load(name);
        if (!buffer || stopped || !valid() || engine.state !== 'running') return false;
        const source = engine.createBufferSource();
        source.buffer = buffer;
        source.connect(output);
        voices.add(source);
        source.onended = () => {
          source.disconnect(); voices.delete(source);
          if (autoStop && !voices.size) stop();
        };
        source.start();
        return true;
      } catch { return false; }
    },
    stop
  };
}

export function stopProjectPageSound() { pageSound?.stop(); pageSound = null; }
export function playProjectPageSound() {
  stopProjectPageSound();
  prepareProjectSound(['page']);
  const sound = projectSoundtrack(true);
  pageSound = sound;
  void sound.play('page').then(started => { if (!started) sound.stop(); });
}
