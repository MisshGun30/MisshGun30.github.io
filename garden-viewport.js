// WKWebView может менять даже lvh при сворачивании панелей. Один холст
// высотой с экран покрывает оба положения панелей без изменения object-fit.
// Выполняется в head до первого кадра, чтобы не увеличивать фон после загрузки.
(() => {
  const touch = matchMedia('(pointer: coarse)');
  const root = document.documentElement;
  let width = innerWidth;
  let frame = 0;

  function measure() {
    width = innerWidth;
    if (touch.matches) {
      root.style.setProperty('--garden-viewport-height', `${screen.height || innerHeight}px`);
    } else {
      root.style.removeProperty('--garden-viewport-height');
    }
  }

  function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(measure);
  }

  measure();
  // Высота меняется при скролле, клавиатуре и панелях — это не новый холст.
  window.addEventListener('resize', () => { if (innerWidth !== width) schedule(); });
  window.addEventListener('orientationchange', schedule);
  touch.addEventListener('change', schedule);
})();
