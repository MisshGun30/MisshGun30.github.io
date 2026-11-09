// Мобильный режим: прокрутка принадлежит окну сцены, внешняя страница не скроллится.
// Внутри загружается тот же index.html, со всеми исходными анимациями и звуком.
const frame = document.querySelector('#garden-frame');
const source = new URL('index.html', location.href);
source.search = location.search;
source.hash = location.hash || '#home';
let cleanup = () => {};

frame.addEventListener('load', () => {
  cleanup();
  const scene = frame.contentWindow;
  if (scene.location.href === 'about:blank') return;
  const sync = () => {
    const hash = scene.location.hash || '#home';
    const address = `${location.pathname}${scene.location.search}${hash}`;
    if (`${location.pathname}${location.search}${location.hash}` !== address) history.replaceState(null, '', address);
    document.title = scene.document.title;
  };
  const title = new MutationObserver(sync);
  title.observe(scene.document.querySelector('title'), {childList:true,subtree:true,characterData:true});
  title.observe(scene.document.querySelector('#achievement-dialog'), {childList:true,subtree:true,attributes:true,attributeFilter:['open']});
  scene.addEventListener('hashchange', sync);
  scene.addEventListener('popstate', sync);
  sync();
  cleanup = () => {
    title.disconnect();
    scene.removeEventListener('hashchange', sync);
    scene.removeEventListener('popstate', sync);
  };
});

// Ссылку на раздел можно скопировать, открыть заново и изменить в адресной строке.
window.addEventListener('hashchange', () => {
  const target = new URL(source);
  target.search = location.search;
  target.hash = location.hash || '#home';
  if (frame.contentWindow.location.hash !== target.hash) frame.contentWindow.location.replace(target.href);
});
frame.src = source.href;
