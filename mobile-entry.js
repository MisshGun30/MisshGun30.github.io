// На телефонах основной адрес открывает согласованный режим общей сцены.
// Во вложенном окне остаётся само приложение, без повторного перенаправления.
(() => {
  if (window.self !== window.top || !matchMedia('(pointer: coarse)').matches) return;
  const target = new URL('stable-scroll.html', location.href);
  target.search = location.search;
  target.hash = location.hash;
  document.documentElement.dataset.sceneRedirect = 'true';
  document.documentElement.style.visibility = 'hidden';
  location.replace(target.href);
})();
