// iOS управляет громкостью media-элемента системно. Для ползунка используем GainNode.
const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const levels = new WeakMap();
const channels = new Map();
let context;
export function getVolume(media) { return levels.get(media) ?? media.volume; }
export function registerVolume(media) { if (!channels.has(media)) channels.set(media, null); }
export function setVolume(media, value) {
  const volume = Math.max(0, Math.min(1, Number(value)));
  if (!Number.isFinite(volume)) return;
  registerVolume(media);
  levels.set(media, volume);
  const channel = channels.get(media);
  if (ios) {
    media.muted = volume === 0;
    if (channel) channel.gain.gain.setTargetAtTime(volume, context.currentTime, .015);
    media.dispatchEvent(new Event('volumechange'));
  } else media.volume = volume;
}
export function prepareVolume() {
  if (!ios) return;
  const Engine = window.AudioContext || window.webkitAudioContext;
  if (!Engine) return;
  try {
    context ??= new Engine();
    for (const [media, channel] of channels) {
      if (channel) continue;
      const gain = context.createGain();
      gain.gain.value = getVolume(media);
      const source = context.createMediaElementSource(media);
      source.connect(gain).connect(context.destination);
      channels.set(media, {source, gain});
    }
    if (context.state !== 'running') void context.resume().catch(() => {});
  } catch { /* Без Web Audio остаётся системное управление звуком. */ }
}
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', prepareVolume, {capture:true,passive:true});
  document.addEventListener('keydown', prepareVolume, {capture:true});
}
