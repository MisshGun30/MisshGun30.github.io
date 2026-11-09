// Рост запускается только для видимых ветвей, подвес — только для видимых листов.
// Сохраняем просмотр в рамках вкладки; повторный скролл и смена ширины его не стирают.
const key = 'mishgun-poetry-growth-v1';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let saved = {};
try { saved = JSON.parse(sessionStorage.getItem(key) || '{}') || {}; } catch {}
const seenLeaves = new Set(Array.isArray(saved.leaves) ? saved.leaves : []);
const grownBranches = new Set(Array.isArray(saved.branches) ? saved.branches : []);
let observer = null;
let activeRow = null;
let generation = 0;
const tasks = new Set();

function persist() {
  try { sessionStorage.setItem(key, JSON.stringify({ leaves:[...seenLeaves], branches:[...grownBranches] })); } catch {}
}
function later(callback, delay, version) {
  const timer = setTimeout(() => { tasks.delete(timer); if (version === generation) callback(); }, Math.max(0,delay));
  tasks.add(timer);
  return timer;
}
export function stopPoetryReveal() {
  generation++;
  observer?.disconnect();
  observer = null;
  tasks.forEach(clearTimeout);
  tasks.clear();
  activeRow = null;
}

export function refreshPoetryReveal(row) {
  stopPoetryReveal();
  activeRow = row;
  const version = generation;
  const root = row.closest('.poetry-garden');
  root.classList.add('is-staged');
  row.querySelectorAll('.branch-trigger').forEach(node => node.remove());
  if (!root.dataset.revealNotBefore) root.dataset.revealNotBefore = String(performance.now()+360);
  const notBefore = Number(root.dataset.revealNotBefore);
  const leaves = new Map([...row.querySelectorAll('.poem-hanging')].map(leaf => [leaf.querySelector('[data-poem]').dataset.poem,leaf]));
  const visible = new Set();
  const scheduled = new Map();
  const groups = [...row.querySelectorAll('.branch-level')].map(svg => {
    const ids = svg.dataset.poems.split(',');
    const group = { svg, ids, key:ids.join('-'), finished:false, growing:false, readyAt:0 };
    group.finished = reduced.matches || grownBranches.has(group.key) || ids.some(id => seenLeaves.has(id));
    svg.classList.toggle('is-seen',group.finished);
    const marker = document.createElement('span');
    marker.className = 'branch-trigger';
    marker.setAttribute('aria-hidden','true');
    marker.style.top = `${leaves.get(ids[0]).offsetTop}px`;
    row.append(marker);
    group.marker = marker;
    return group;
  });
  const groupFor = new Map(groups.flatMap(group => group.ids.map(id => [id,group])));
  const updateComplete = () => {
    root.dataset.revealComplete = String([...leaves.keys()].every(id => seenLeaves.has(id)) && !row.querySelector('.is-hanging'));
  };
  function finishBranch(group) {
    group.finished = true;
    group.readyAt = 0;
    group.svg.classList.remove('is-growing');
    group.svg.classList.add('is-seen');
    grownBranches.add(group.key);
    persist();
  }
  function startBranch(group) {
    if (group.finished || group.growing) return;
    if (reduced.matches) { finishBranch(group); return; }
    group.growing = true;
    const delay = Math.max(0,notBefore-performance.now());
    group.readyAt = performance.now()+delay+1900;
    later(() => {
      if (group.finished) return;
      group.svg.classList.add('is-growing');
      grownBranches.add(group.key);
      persist();
    },delay,version);
    later(() => { if (!group.finished) finishBranch(group); },delay+1900,version);
  }
  function showLeaf(id, immediate = false) {
    const leaf = leaves.get(id), group = groupFor.get(id);
    if (seenLeaves.has(id)) return;
    if (immediate || reduced.matches) {
      finishBranch(group);
      leaf.classList.remove('is-pending','is-hanging');
      leaf.classList.add('is-seen');
      seenLeaves.add(id);
      persist();
      updateComplete();
      return;
    }
    startBranch(group);
    if (scheduled.has(id)) return;
    const delay = Math.max(0,group.readyAt-performance.now())+group.ids.indexOf(id)*85;
    scheduled.set(id,later(() => {
      scheduled.delete(id);
      if (!visible.has(id) || seenLeaves.has(id)) return;
      leaf.classList.remove('is-pending');
      leaf.classList.add('is-hanging');
      seenLeaves.add(id);
      persist();
      later(() => {
        leaf.classList.remove('is-hanging');
        leaf.classList.add('is-seen');
        updateComplete();
      },760,version);
      updateComplete();
    },delay,version));
  }
  leaves.forEach((leaf,id) => {
    if (reduced.matches) seenLeaves.add(id);
    leaf.classList.remove('is-hanging');
    leaf.classList.toggle('is-seen',seenLeaves.has(id));
    leaf.classList.toggle('is-pending',!seenLeaves.has(id));
  });
  // Tab к ещё не показанному стихотворению сразу раскрывает его без ожидания.
  root.onfocusin = event => {
    const button = event.target.closest('[data-poem]');
    if (button) showLeaf(button.dataset.poem,true);
  };
  if (reduced.matches) {
    groups.forEach(finishBranch);
    persist();
    updateComplete();
    return;
  }
  observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (version !== generation) return;
    if (entry.target.classList.contains('branch-trigger')) {
      if (entry.isIntersecting) startBranch(groups.find(group => group.marker === entry.target));
      return;
    }
    const id = entry.target.dataset.leafTrigger;
    if (entry.isIntersecting) { visible.add(id); showLeaf(id); }
    else {
      visible.delete(id);
      const timer = scheduled.get(id);
      if (timer) { clearTimeout(timer); tasks.delete(timer); scheduled.delete(id); }
    }
  }), { threshold:.08,rootMargin:'0px 0px -4% 0px' });
  groups.forEach(group => { if (!group.finished) observer.observe(group.marker); });
  row.querySelectorAll('[data-leaf-trigger]').forEach(marker => {
    if (!seenLeaves.has(marker.dataset.leafTrigger)) observer.observe(marker);
  });
  updateComplete();
}
reduced.addEventListener('change', () => {
  if (reduced.matches && activeRow?.isConnected) refreshPoetryReveal(activeRow);
});
