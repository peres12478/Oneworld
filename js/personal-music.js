/* Música original en Mi espacio y Mi habitación, sin conexión de red.
   El navegador requiere interacción del usuario antes de reproducir audio. */
(() => {
  'use strict';
  const button = document.getElementById('music-toggle');
  const volume = document.getElementById('music-volume');
  const track = document.body.dataset.musicSrc;
  if (!button || !volume || !track) return;
  const player = new Audio(new URL(track, document.baseURI).href);
  player.loop = true;
  player.preload = 'auto';
  player.volume = Number(volume.value) / 100;
  let enabled = false, autoUsed = false;
  const sync = () => { button.textContent = enabled ? 'Ⅱ Música' : '▶ Música'; button.setAttribute('aria-pressed', String(enabled)); };
  const start = () => { enabled = true; const attempt = player.play(); if (attempt && typeof attempt.catch === 'function') attempt.catch(() => { enabled = false; sync(); }); sync(); };
  button.addEventListener('click', () => {
    autoUsed = true;
    if (enabled) { enabled = false; player.pause(); sync(); } else start();
  });
  volume.addEventListener('input', () => { player.volume = Number(volume.value) / 100; });
  const autoStart = event => {
    if (autoUsed || event.target.closest?.('#music-toggle, #music-volume')) return;
    autoUsed = true;
    start();
  };
  document.addEventListener('pointerdown', autoStart, { once: true });
  document.addEventListener('keydown', event => { if (!event.repeat && !autoUsed && !['Tab','Escape'].includes(event.key)) autoStart(event); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) player.pause(); else if (enabled) player.play().catch(() => {}); });
  window.addEventListener('pagehide', () => player.pause());
  window.PERSONAL_MUSIC = { get isPlaying() { return !player.paused; }, get source() { return player.src; } };
  sync();
})();
