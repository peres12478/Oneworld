/* Background music: Wikimedia Commons MediaWiki API + licensed music stream.
   This is not an official One Piece track. Sound starts only after a click;
   browser autoplay restrictions remain enabled. No Python or tokens required. */
(function () {
  'use strict';
  const OP = window.OP;
  const TRACK = {
    file: 'File:Netherworld Shanty (MacLeod, Kevin ) (ISRC USUAN1100138).oga',
    title: 'Netherworld Shanty',
    artist: 'Kevin MacLeod',
    license: 'CC BY 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Netherworld_Shanty_(MacLeod,_Kevin_)_(ISRC_USUAN1100138).oga',
    fallback: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Netherworld_Shanty_%28MacLeod%2C_Kevin_%29_%28ISRC_USUAN1100138%29.oga'
  };
  let audio, button, message, volume, dock;

  function updateStatus(messageText) { if (message) message.textContent = messageText; }
  function updateButtons() {
    const playing = !!audio && !audio.paused;
    dock.classList.toggle('music-playing', playing);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Pausar musica' : 'Reproducir musica');
    button.textContent = playing ? '\u275a\u275a' : '\u25b6';
  }

  function commonsApiUrl() {
    const params = new URLSearchParams({
      action: 'query', prop: 'imageinfo', iiprop: 'url|mime|extmetadata',
      titles: TRACK.file, format: 'json', formatversion: '2', origin: '*'
    });
    return `https://commons.wikimedia.org/w/api.php?${params}`;
  }

  async function lookupTrack() {
    // The request fetches the ACTUAL audio URL and its Wikimedia metadata.
    // origin=* is the documented way to enable cross-site MediaWiki API calls.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(commonsApiUrl(), {
        signal: controller.signal, headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Commons HTTP ' + response.status);
      const data = await response.json();
      const file = data?.query?.pages?.find(page => page.title === TRACK.file || page.imageinfo)?.imageinfo?.[0];
      if (!file || !/^audio\//.test(file.mime || '')) throw new Error('Archivo de audio no encontrado');
      const url = file.url;
      if (!url || new URL(url).protocol !== 'https:') throw new Error('URL de audio insegura');
      // We select a known CC BY track; never substitute unrelated search results.
      if (audio.paused) audio.src = url;
      dock.dataset.source = 'commons-api';
      updateStatus('Pista obtenida de Wikimedia Commons');
      return true;
    } catch (err) {
      // Source failure should not break the fruit API or the game.
      console.warn('La API de Wikimedia no respondio; se usa el archivo del mismo autor:', err);
      dock.dataset.source = 'commons-fallback';
      if (audio.paused) audio.src = TRACK.fallback;
      updateStatus('Pista disponible · fuente alternativa');
      return false;
    } finally { clearTimeout(timeout); }
  }

  function toggle() {
    if (!audio) return;
    if (!audio.paused) { audio.pause(); return; }
    // Called directly from the click handler so the browser accepts playback.
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(err => {
        updateStatus('No se pudo reproducir. Verifica la conexion.');
        console.warn('Error de reproduccion de musica:', err);
        updateButtons();
      });
    }
  }

  function init() {
    audio = document.getElementById('music-audio');
    button = document.getElementById('music-toggle');
    message = document.getElementById('music-state');
    volume = document.getElementById('music-volume');
    dock = document.getElementById('music-dock');
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = 0.34;
    audio.src = TRACK.fallback;
    volume.value = 34;
    button.addEventListener('click', toggle);
    volume.addEventListener('input', () => {
      audio.volume = Number(volume.value) / 100;
      volume.setAttribute('aria-valuetext', volume.value + '%');
    });
    audio.addEventListener('play', () => { updateButtons(); updateStatus('Reproduciendo · ambiente pirata'); });
    audio.addEventListener('pause', () => { updateButtons(); updateStatus('Pausada · pulsa para escuchar'); });
    audio.addEventListener('error', () => {
      updateButtons();
      updateStatus('Audio no disponible. Comprueba la conexion.');
    });
    updateButtons();
    lookupTrack();
  }
  OP.audio = { init, lookupTrack, toggle, track: TRACK };
})();
