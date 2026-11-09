export function recordFrame(point,turn=0) {
  return `translate(${point.x}px, ${point.y}px) translate(-50%, -50%) scaleY(${point.flat??1}) rotate(${turn}deg) scale(${point.size/100})`;
}

export function recordFallFrames(width,height,turn) {
  const startSize=Math.hypot(width,height)*2.1,endSize=Math.min(width,height)*.48;
  const endY=height+endSize/2+32;
  return Array.from({length:81},(_,i)=>{
    const t=i/80,e=t*t*(3-2*t);
    const point={x:width/2+width*.08*e,y:height/2+(endY-height/2)*t*t,
      size:Math.exp(Math.log(startSize)*(1-e)+Math.log(endSize)*e)};
    return {offset:t,transform:recordFrame(point,turn+45*e),opacity:1};
  });
}
