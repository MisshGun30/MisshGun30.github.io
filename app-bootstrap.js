// Не создаём второе приложение и аудио, пока основной вход перенаправляется.
if (document.documentElement.dataset.sceneRedirect !== 'true') {
  await import('./app.js');
}
