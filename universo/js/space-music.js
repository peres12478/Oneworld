/* Música instrumental original de ASTRA/LAB. Complementa los FX de Web Audio.
   El navegador exige un gesto antes de empezar a reproducir la pista. */
(() => {
  'use strict';
  const toggle = document.getElementById('space-music-toggle');
  const range = document.getElementById('space-music-volume');
  if (!toggle || !range) return;
  const music = new Audio(new URL('assets/cosmos-original.ogg', document.baseURI).href);
  music.preload = 'auto'; music.loop = true; music.volume = Number(range.value)/100;
  let enabled = false; let autoUsed = false;
  function label() { toggle.textContent = enabled ? 'Ⅱ MÚSICA' : '▶ MÚSICA'; toggle.setAttribute('aria-pressed', String(enabled)); }
  function play() { enabled = true; label(); music.play().catch(() => { enabled = false; label(); }); }
  toggle.addEventListener('click', () => { autoUsed = true; if (enabled) { enabled = false; music.pause(); label(); } else play(); });
  range.addEventListener('input', () => { music.volume = Number(range.value)/100; });
  function firstGesture(event) {
    if (autoUsed || event.target.closest?.('#space-music-toggle, #space-music-volume')) return;
    autoUsed = true; play();
  }
  document.addEventListener('pointerdown', firstGesture, {once: true});
  document.addEventListener('keydown', e => { if (!autoUsed && !e.repeat && !['Tab','Escape'].includes(e.key)) firstGesture(e); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) music.pause(); else if (enabled) music.play().catch(() => {}); });
  window.addEventListener('pagehide', () => music.pause());
  window.SPACE_MUSIC_DIAGNOSTIC = { get playing() {return !music.paused;}, get source() {return music.src;} };
  label();
})();
