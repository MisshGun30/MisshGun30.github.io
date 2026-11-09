export const TREE_BREAK={x:1474,y:950};
export const TREE_COVER_MS=200;
// Трещина 160 мс → падение 1400 мс → перекрытие 200 мс → завершение 650 мс.
export const TREE_BREAK_SOUND_MS=160+1400+TREE_COVER_MS+650;
export function treeRotation(axis,angle) {
  const t=angle*Math.PI/180,c=Math.cos(t),s=Math.sin(t),v=1-c,[x,z]=axis;
  return [c+x*x*v,-z*s,x*z*v,z*s,c,-x*s,x*z*v,x*s,c+z*z*v];
}
// Обратная проекция луча из неподвижной камеры на плоскость падающей кроны.
export function treeSourcePoint(plan,screen,angle) {
  const r=treeRotation(plan.axis,angle),u=screen.x-plan.width/2,v=screen.y-plan.height/2;
  const a=r[0]+u/plan.perspective*r[6],b=r[1]+u/plan.perspective*r[7];
  const c=r[3]+v/plan.perspective*r[6],d=r[4]+v/plan.perspective*r[7];
  const ex=u-(plan.pivot.x-plan.width/2),ey=v-(plan.pivot.y-plan.height/2),det=a*d-b*c;
  if(Math.abs(det)<1e-8)return null;
  const x=(ex*d-b*ey)/det,y=(a*ey-ex*c)/det;
  if(r[6]*x+r[7]*y>=plan.perspective)return null;
  return {x:TREE_BREAK.x+x/plan.scale,y:TREE_BREAK.y+y/plan.scale};
}
export function createTreeFallPlan(geometry,width,height) {
  const scale=geometry.scale,pivot={x:geometry.scene.left+TREE_BREAK.x*scale,y:geometry.scene.top+TREE_BREAK.y*scale};
  const perspective=Math.max(220,950*scale*.55),aim=width/2-pivot.x,norm=Math.hypot(perspective,aim);
  return {width,height,scale,pivot,perspective,axis:[-perspective/norm,aim/norm],coverStart:52,coverEnd:58};
}
export const treeFallTransform=(plan,angle)=>`rotate3d(${plan.axis[0]},0,${plan.axis[1]},${angle}deg)`;
