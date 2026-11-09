// Одна сцена на маршрут: сначала учитываем особое назначение, затем исходную страницу.
export function transitionFor(from,to) {
  if(from===to)return 'none';
  if(to==='about')return 'lamps';
  if(from==='about')return 'match-out';
  if(from==='poems')return 'poetry-wind';
  if(from==='music')return 'music-out';
  if(from==='projects')return 'folder-close';
  if(from==='portfolio')return 'storm';
  if(from==='contact'&&to==='home')return 'social-flip-back';
  if(from==='home'||from==='contact')return {
    poems:'petal-in',music:'music-in',projects:'folder-in',portfolio:'tree-in',contact:'social-flip-in'
  }[to]??'none';
  return 'none';
}
