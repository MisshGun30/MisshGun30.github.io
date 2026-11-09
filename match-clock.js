export const MATCH_BURN_MS=20*60*1000;
export const MATCH_DARK_MS=2000;

// Время считаем по часам, а не числу срабатываний таймера: фоновые вкладки его замедляют.
export function matchPhase(elapsed) {
  const total=MATCH_BURN_MS+MATCH_DARK_MS;
  const cycle=Math.floor(Math.max(0,elapsed)/total),time=Math.max(0,elapsed)%total;
  return {cycle,lit:time<MATCH_BURN_MS,burn:Math.min(1,time/MATCH_BURN_MS),
    next:time<MATCH_BURN_MS?MATCH_BURN_MS-time:total-time};
}

export function createMatchClock(update,{now=()=>performance.now(),schedule=setTimeout,clear=clearTimeout}={}) {
  const start=now();let timer,stopped=false;
  function tick() {
    if(stopped)return;
    const state=matchPhase(now()-start);update(state);
    timer=schedule(tick,Math.min(1000,state.next));
  }
  tick();
  return {refresh(){clear(timer);tick();},stop(){stopped=true;clear(timer);}};
}
