const buffers = new Map();
let context;
let active;

// Подготовка начинается в обработчике нажатия, пока браузер разрешает звук.
export function prepareInteractionSound(name) {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  try {
    context ??= new AudioEngine();
    const ready = context.state === 'running' ? Promise.resolve() : context.resume();
    if (!buffers.has(name)) {
      const url = new URL(`./assets/audio/${name}.wav`, import.meta.url);
      buffers.set(name, fetch(url).then(response => {
        if (!response.ok) throw new Error(`Cannot load ${name}`);
        return response.arrayBuffer();
      }).then(bytes => context.decodeAudioData(bytes)).catch(() => {
        buffers.delete(name);
      }));
    }
    return Promise.all([ready, buffers.get(name)]).then(([, buffer]) => buffer).catch(() => undefined);
  } catch {
    return undefined;
  }
}

export async function playInteractionSound(prepared, isCurrent) {
  const buffer = await prepared;
  if (!buffer || context.state !== 'running' || !isCurrent()) return;
  const volume = document.querySelector('#background-audio').volume;
  if (!volume) return;
  const source = context.createBufferSource();
  const gain = context.createGain();
  source.buffer = buffer;
  gain.gain.value = volume;
  source.connect(gain).connect(context.destination);
  source.onended = () => {
    source.disconnect();
    gain.disconnect();
    if (active === source) active = null;
  };
  active?.stop();
  source.start();
  active = source;
}
