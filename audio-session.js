import { prepareVolume } from "./audio-volume.js";
export function readAudioSession(key) {
  try { return JSON.parse(sessionStorage.getItem(key) || 'null'); } catch { return null; }
}

export function saveAudioSession(key, state) {
  try {
    if (state) sessionStorage.setItem(key, JSON.stringify(state));
    else sessionStorage.removeItem(key);
  } catch {}
}

// Safari может потребовать новое нажатие после перезагрузки документа.
export async function resumeAudio(media, stillCurrent = () => true) {
  if (!stillCurrent()) return;
  try { prepareVolume(); await media.play(); }
  catch (error) {
    if (error.name !== 'NotAllowedError' || !stillCurrent()) return;
    const controller = new AbortController();
    const retry = () => {
      controller.abort();
      if (stillCurrent()) void media.play().catch(() => {});
    };
    document.addEventListener('pointerdown', retry, {signal: controller.signal, capture:true});
    document.addEventListener('keydown', retry, {signal: controller.signal, capture:true});
  }
}
