import { getVolume } from "./audio-volume.js";
// Пользовательские записи: нормализация/обрезка выполнены в WAV-копиях.
import { TREE_BREAK_SOUND_MS } from './portfolio-tree-motion.js';
let context;
const recordings=new Map();
function recording(name) {
  if(!context)return Promise.resolve(null);
  if(!recordings.has(name))recordings.set(name,fetch(new URL(`./assets/audio/portfolio-${name}.wav`,import.meta.url))
    .then(response=>{if(!response.ok)throw new Error('Audio unavailable');return response.arrayBuffer();})
    .then(bytes=>context.decodeAudioData(bytes)).catch(()=>{recordings.delete(name);return null;}));
  return recordings.get(name);
}
export function preparePortfolioSound() {
  const Engine=window.AudioContext||window.webkitAudioContext;
  if(!Engine)return;
  try { context??=new Engine();void context.resume().catch(()=>{});['rain','thunder','tree-break'].forEach(recording); }
  catch { /* Переход работает и без аудиоустройства. */ }
}

export function portfolioSoundtrack() {
  const engine=context,voices=new Set(),nodes=new Set(),beds=[];
  const audio=document.querySelector('#background-audio');
  let stopped=false,output;
  if(engine) {
    output=engine.createGain();output.gain.value=getVolume(audio)*.55;output.connect(engine.destination);
  }
  const update=()=>{if(output)output.gain.setTargetAtTime(getVolume(audio)*.55,engine.currentTime,.035);};
  audio.addEventListener('volumechange',update);
  const ready=()=>!stopped&&engine?.state==='running';
  const cue=action=>()=>{
    if(ready())action();
    else if(engine&&!stopped)void engine.resume().then(()=>{if(ready())action();}).catch(()=>{});
  };
  async function playRecording(name,bed=false,maxDuration) {
    if(!engine||stopped)return;
    try {
      await engine.resume();const buffer=await recording(name);
      if(!buffer||!ready())return;
      const source=engine.createBufferSource(),gain=engine.createGain();
      source.buffer=buffer;gain.gain.value=.8;
      if(bed){gain.gain.setValueAtTime(.0001,engine.currentTime);gain.gain.linearRampToValueAtTime(.8,engine.currentTime+(name==='rain'?1.25:.5));}
      source.connect(gain).connect(output);voices.add(source);nodes.add(gain);
      if(bed)beds.push(gain);
      source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();nodes.delete(gain);};
      if(maxDuration)source.start(0,0,Math.min(buffer.duration,maxDuration));
      else source.start();
    }catch { /* Недоступный звук не блокирует сцену. */ }
  }
  function noise(duration,frequency,level,loop=false) {
    if(!ready())return;
    const length=loop?2:duration,now=engine.currentTime;
    const buffer=engine.createBuffer(1,Math.ceil(engine.sampleRate*length),engine.sampleRate);
    const samples=buffer.getChannelData(0);
    for(let i=0;i<samples.length;i++) {
      const t=i/samples.length;
      const crackle=loop&&frequency===1200 ? .15+.85*Math.sin(t*93)**18 : 1;
      samples[i]=(Math.random()*2-1)*(loop?crackle:Math.exp(-t*7));
    }
    const source=engine.createBufferSource(),filter=engine.createBiquadFilter(),gain=engine.createGain();
    source.buffer=buffer;source.loop=loop;filter.type='lowpass';filter.frequency.value=frequency;
    gain.gain.setValueAtTime(loop ? .0001 : level,now);
    if(loop)gain.gain.linearRampToValueAtTime(level,now+.4);
    source.connect(filter).connect(gain).connect(output);voices.add(source);nodes.add(filter);nodes.add(gain);
    source.onended=()=>{voices.delete(source);source.disconnect();filter.disconnect();gain.disconnect();nodes.delete(filter);nodes.delete(gain);};
    source.start();if(!loop)source.stop(now+duration);
    return gain;
  }
  function ping(frequency,delay) {
    if(!ready())return;
    const now=engine.currentTime+delay,source=engine.createOscillator(),gain=engine.createGain();
    source.frequency.setValueAtTime(frequency,now);source.frequency.exponentialRampToValueAtTime(frequency*.7,now+.3);
    gain.gain.setValueAtTime(.11,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.35);
    source.connect(gain).connect(output);voices.add(source);nodes.add(gain);
    source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();nodes.delete(gain);};
    source.start(now);source.stop(now+.4);
  }
  return {
    burst:cue(()=>{noise(.45,7000,.8);[2100,3220,4600].forEach((frequency,i)=>ping(frequency,i*.025));}),
    fire:()=>playRecording('fire',true),
    rain:()=>playRecording('rain',true),
    extinguish(){if(beds[0]&&ready())beds[0].gain.setTargetAtTime(.0001,engine.currentTime,.8);return playRecording('hiss');},
    thunder:()=>playRecording('thunder'),
    treeBreak:()=>playRecording('tree-break',false,TREE_BREAK_SOUND_MS/1000),
    fade(){if(ready())beds.forEach(gain=>gain.gain.setTargetAtTime(.0001,engine.currentTime,.4));},
    stop(){
      stopped=true;audio.removeEventListener('volumechange',update);
      voices.forEach(source=>{try{source.stop();}catch{}});voices.clear();
      nodes.forEach(node=>node.disconnect());nodes.clear();output?.disconnect();
    }
  };
}
