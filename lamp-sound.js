import { getVolume } from "./audio-volume.js";
// Атмосферные эффекты независимы от фоновой музыки, громкость регулируется общим ползунком.
let context;
let soundRevision=0;
const voices=new Set();
const audio=()=>document.querySelector('#background-audio');
const recordings=new Map(['match-strike.mp3','bulb-screw.wav','light-on.mp3'].map(name=>[name,{name}]));
function recordingBytes(recording) {
  recording.bytes??=fetch(new URL(`./assets/audio/${recording.name}`,import.meta.url))
    .then(response=>response.ok?response.arrayBuffer():null).catch(()=>null);
  return recording.bytes;
}
export function preloadJourneySounds() {
  recordings.forEach(recordingBytes);
}
let matchBuffer;

export function prepareLampSound() {
  if(getVolume(audio())===0)return;
  const AudioEngine=window.AudioContext || window.webkitAudioContext;
  if(!AudioEngine)return;
  try {
    context??=new AudioEngine();
    return context.resume().catch(()=>{});
  } catch { /* Переход работает и без доступного аудиоустройства. */ }
}

export function playLampSound(broken=false) {
  if(!context || context.state!=='running')return;
  const now=context.currentTime,level=Math.min(.32,getVolume(audio())*.8);
  if(!level)return;
  const output=context.createGain();output.gain.value=level;output.connect(context.destination);
  let active=0;
  const voice=(source,nodes,duration)=>{
    active++;voices.add(source);
    source.onended=()=>{
      voices.delete(source);source.disconnect();nodes.forEach(node=>node.disconnect());
      if(--active===0)output.disconnect();
    };
    source.start(now);source.stop(now+duration);
  };
  const duration=broken ? .15 : .085;
  const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate);
  const samples=buffer.getChannelData(0);
  for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.exp(-i/(samples.length*.16));
  const crack=context.createBufferSource();crack.buffer=buffer;
  const filter=context.createBiquadFilter();filter.type='highpass';filter.frequency.value=broken?1700:950;
  crack.connect(filter);filter.connect(output);voice(crack,[filter],duration);
  if(broken) [2350,3180,4270].forEach((frequency,index)=>{
    const ping=context.createOscillator(),envelope=context.createGain();
    ping.type='sine';ping.frequency.setValueAtTime(frequency,now);
    ping.frequency.exponentialRampToValueAtTime(frequency*.86,now+.22);
    envelope.gain.setValueAtTime(.13/(index+1),now);
    envelope.gain.exponentialRampToValueAtTime(.0001,now+.28+index*.035);
    ping.connect(envelope);envelope.connect(output);voice(ping,[envelope],.4);
  });
}

export function stopLampSound() {
  soundRevision++;
  voices.forEach(source=>{try{source.stop();}catch{}});voices.clear();
  if(context){void context.close().catch(()=>{});context=null;}
}

export async function playMatchStrike() {
  const resumed=prepareLampSound(),engine=context,revision=soundRevision;
  await resumed;
  if(!context || context!==engine || revision!==soundRevision || context.state!=='running')return;
  try {
    const bytes=await recordingBytes(recordings.get('match-strike.mp3'));
    if(!bytes || context!==engine || revision!==soundRevision)return;
    matchBuffer??=await engine.decodeAudioData(bytes.slice(0));
    if(context!==engine || revision!==soundRevision)return;
    const source=engine.createBufferSource(),gain=engine.createGain();
    source.buffer=matchBuffer;gain.gain.value=getVolume(audio());
    source.connect(gain);gain.connect(engine.destination);voices.add(source);
    source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();};
    source.start();
  } catch { /* Недоступная запись не блокирует сам переход. */ }
}

// Остальные короткие эффекты синтезируем: выдох, трение резьбы и щелчок света.
function noise({duration,frequency,endFrequency=frequency,volume=.5,pulse=0}) {
  if(!context || context.state!=='running')return;
  const now=context.currentTime,buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++) {
    const t=i/data.length,envelope=Math.sin(Math.PI*t)**1.4;
    data[i]=(Math.random()*2-1)*envelope*(pulse ? .15+.85*Math.sin(t*Math.PI*pulse)**4 : 1);
  }
  const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
  source.buffer=buffer;filter.type='bandpass';filter.Q.value=1.3;
  filter.frequency.setValueAtTime(frequency,now);filter.frequency.exponentialRampToValueAtTime(endFrequency,now+duration);
  gain.gain.value=getVolume(audio())*volume;
  source.connect(filter);filter.connect(gain);gain.connect(context.destination);voices.add(source);
  source.onended=()=>{voices.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};
  source.start(now);source.stop(now+duration);
}
export function playMatchOut() {
  soundRevision++;
  voices.forEach(source=>{try{source.stop();}catch{}});voices.clear();
  noise({duration:.45,frequency:1100,endFrequency:450,volume:.8});
}
async function playReturnRecording(name) {
  const resumed=prepareLampSound(),engine=context,revision=soundRevision;
  await resumed;
  if(!engine || engine!==context || revision!==soundRevision)return 0;
  try {
    const recording=recordings.get(name),bytes=await recordingBytes(recording);
    if(!bytes || engine!==context || revision!==soundRevision)return 0;
    recording.buffer??=await engine.decodeAudioData(bytes.slice(0));
    if(engine!==context || revision!==soundRevision)return 0;
    const source=engine.createBufferSource(),gain=engine.createGain();
    source.buffer=recording.buffer;gain.gain.value=getVolume(audio());
    source.connect(gain);gain.connect(engine.destination);voices.add(source);
    source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();};
    source.start();return recording.buffer.duration;
  } catch { return 0; }
}
export function playBulbScrew(){return playReturnRecording('bulb-screw.wav');}
export function playLightOn(){return playReturnRecording('light-on.mp3');}
