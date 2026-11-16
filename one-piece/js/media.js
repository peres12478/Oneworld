/*
 * Imágenes del catálogo y sustituciones visuales.
 * 1. Atributos de imagen HTTPS en la fuente principal.
 * 2. Imágenes complementarias publicadas por One Piece API (REST).
 * 3. Imágenes de referencia conocidas para frutas especiales.
 * 4. Emoji alusivo al poder, SI NINGUNA imagen funciona.
 * No se muestran ilustraciones genéricas como si pertenecieran a una fruta.
 * Si varias frutas reciben la misma URL, se descarta esa URL y se usa emoji.
 * No se sustituye información del catálogo por información inventada.
 */
(function () {
  'use strict';
  const OP = window.OP;
  const C = OP.config;
  const U = OP.util;
  const mounts = new Map();
  let enrichmentPending = null;

  function key(value) {
    return U.normalize(value).replace(/[^a-z0-9]/g, '');
  }

  function isNika(f) {
    const blob = U.normalize([f.name, f.japaneseName, f.meaning, f.aliases].join(' '));
    return /\bnika\b/.test(blob) && (/\bhito\b/.test(blob) || /\bgomu\b/.test(blob));
  }

  // URLs existentes de imágenes ilustrativas, no datos históricos del catálogo.
  // La primera imagen muestra una figura física licenciada de la fruta Nika.
  // Si un alojamiento rechaza el enlace directo, automáticamente se intenta
  // el siguiente candidato o se muestra el emoji correspondiente.
  function iconicCandidates(f) {
    const value = U.normalize([f.name, f.japaneseName, f.meaning].join(' '));
    if (isNika(f) || (value.includes('gomu gomu') && U.normalize(f.owner).includes('luffy'))) {
      return [{
        url: 'https://syokugan-ohkoku.com/shohin/2310001/2310001_3.png',
        label: 'Figura oficial de la fruta Nika (imagen referencial)',
        kind: 'referencial'
      }];
    }
    if (value.includes('mera mera') || value.includes('flame flame')) {
      return [{
        url: 'https://static.wikia.nocookie.net/onepiece/images/8/8c/Mera_Mera_no_Mi_Infobox.png/revision/latest/scale-to-width-down/217?cb=20240710204632',
        label: 'Ilustración de la Mera Mera no Mi',
        kind: 'fruta'
      }];
    }
    return [];
  }

  const POWER_SYMBOLS = [
    [/nika|sun god|dios del sol|sun sun|solar/, '☀️'],
    [/fire|flame|mera mera|fuego|burn|heat/, '🔥'],
    [/magma|lava|magu magu/, '🌋'],
    [/ice|snow|frost|hie hie|yuki yuki/, '❄️'],
    [/lightning|electric|thunder|goro goro/, '⚡'],
    [/light|pika pika|glint/, '✨'],
    [/shadow|darkness|yami yami|kage kage/, '🌑'],
    [/soul|soru soru|ghost|horo horo/, '👻'],
    [/flower|hana hana|petal/, '🌸'],
    [/dragon|seiryu|ryu ryu/, '🐉'],
    [/phoenix|fénix/, '🦅'],
    [/leopard|cat|neko neko/, '🐆'],
    [/wolf|dog|inu inu|canine/, '🐺'],
    [/snake|cobra|anaconda|hebi hebi/, '🐍'],
    [/bird|eagle|tori tori/, '🦅'],
    [/elephant|mammoth|zou zou/, '🐘'],
    [/rubber|gum gum|gomu gomu|elastic/, '🌀'],
    [/ocean|sea|water|wave|swim|sui sui/, '🌊'],
    [/sand|suna suna/, '🏜️'],
    [/smoke|soot|gas|cloud|moku moku|susu susu/, '🌫️'],
    [/poison|venom|toxic|doku doku/, '☠️'],
    [/thread|string|ito ito/, '🧵'],
    [/door|doa doa/, '🚪'],
    [/barrier|bari bari|shield/, '🛡️'],
    [/bomb|explode|bomu bomu/, '💥'],
    [/candy|sweet|sugar|pero pero/, '🍬'],
    [/mochi|food|biscuit|cookie/, '🍡'],
    [/gravity|float|levitat|zushi zushi|fuwa fuwa/, '🪐'],
    [/stone|rock|diamond|earth/, '💎'],
    [/mirror|reflect|kagami/, '🪞'],
    [/memory|memo memo|mind/, '🧠'],
    [/mark mark|target|aiming/, '🎯'],
    [/millet|grain|seed|rice/, '🌾'],
    [/pocket pocket|storage|carrying items/, '🧳'],
    [/pop pop|bubble|balloon/, '🫧'],
    [/pile pile|stack|heap/, '🧱'],
    [/time|clock|age/, '⏳'],
    [/love|mero mero|heart/, '💗'],
    [/weapon|sword|blade/, '⚔️'],
    [/healing|heal|chiyu chiyu/, '💚'],
    [/surgery|ope ope|op op/, '🩺'],
    [/sound|music|sing|uta uta/, '🎵'],
    [/invisibility|clear|suke suke/, '👁️'],
  ];

  // Algunas APIs reutilizan una imagen de muestra para toda una categoria.
  // Un mismo icono morado para veinte frutas crea un catalogo engañoso.
  function isPlaceholderImage(url) {
    if (!U.isValidImage(url)) return false;
    let path = '';
    try { path = decodeURIComponent(new URL(url).pathname).toLowerCase(); }
    catch (_) { return false; }
    return /(?:^|[\/_-])(?:generic|placeholder|noimage|no-image|unknown|default)(?:[\/_.-]|$)/.test(path);
  }

  function imageIdentity(url) {
    try {
      const u = new URL(url);
      return (u.origin + u.pathname).toLowerCase();
    } catch (_) { return String(url || '').toLowerCase(); }
  }

  function emojiFor(fruit) {
    const full = U.normalize([fruit.name, fruit.japaneseName, fruit.meaning, fruit.description].join(' '));
    for (const [pattern, emoji] of POWER_SYMBOLS) {
      if (pattern.test(full)) return emoji;
    }
    if (U.normalize(fruit.type).includes('zoan')) return '🐾';
    if (U.normalize(fruit.type).includes('logia')) return '🌪️';
    return '🍇';
  }

  function imageCandidates(fruit) {
    const candidates = [
      ...iconicCandidates(fruit),
      fruit.image ? {url: fruit.image, label:'Imagen entregada por el catalogo', kind:'fruta'} : null,
      // Prioridad a la ilustracion especifica del catalogo sobre otra API.
      fruit.trackerImage ? {url: fruit.trackerImage, label:'Imagen del repositorio del catalogo', kind:'fruta'} : null,
      fruit.illustrationImage ? {url: fruit.illustrationImage, label:'Imagen especifica de One Piece API', kind:'fruta'} : null
    ].filter(Boolean).filter(c => U.isValidImage(c.url) && !isPlaceholderImage(c.url));
    return [...new Map(candidates.map(c=>[imageIdentity(c.url),c])).values()];
  }

  function fallback(host, fruit) {
    host.replaceChildren();
    host.classList.add('missing-art');
    const emoji = U.make('span', 'fruit-power-emoji', emojiFor(fruit));
    emoji.title = 'Símbolo ilustrativo del poder (no es una fotografía de la fruta)';
    emoji.setAttribute('role', 'img');
    emoji.setAttribute('aria-label', 'Símbolo del poder de ' + fruit.name);
    host.append(emoji);
    host.title = 'Emoji relacionado con el poder; imagen real no disponible';
  }

  function draw(host, fruit, className = '') {
    if (!host || !fruit) return;
    host.replaceChildren();
    host.classList.remove('missing-art');
    const candidates = imageCandidates(fruit);
    if (!candidates.length) return fallback(host, fruit);
    let index = 0;
    function next() {
      if (index >= candidates.length) return fallback(host, fruit);
      const candidate = candidates[index++];
      const img = U.make('img', className || 'fruit-api-image');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';
      img.alt = candidate.label + ' — ' + fruit.name;
      img.title = candidate.label;
      img.onerror = next;
      host.replaceChildren(img);
      host.title = candidate.label;
      img.src = candidate.url;
    }
    next();
  }

  function mount(host, fruit, className = '') {
    mounts.set(host, { fruit, className });
    draw(host, fruit, className);
  }

  function refreshMounted() {
    for (const [host, item] of mounts) {
      if (!host.isConnected) {
        mounts.delete(host);
        continue;
      }
      draw(host, item.fruit, item.className);
    }
  }

  function fromRestName(value) {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return '';
    return value.romaji || value.en || '';
  }

  function restSignature(item) {
    const base = key(item.name?.romaji || '');
    const model = key(fromRestName(item.model));
    return {base, model, english: key(item.name?.en || ''), type: U.normalize(item.type)};
  }

  function matchRest(fruit, items) {
    const alias = key(fruit.meaning || '');
    const english = key(fruit.name);
    const type = U.normalize(fruit.type);
    const options = [];
    for (const rest of items) {
      if (!U.isValidImage(rest.image_url) || isPlaceholderImage(rest.image_url)) continue;
      const r = restSignature(rest);
      let score = 0;
      if (r.model && alias.includes(r.base) && alias.includes(r.model) && r.base) score = 130;
      else if (!r.model && alias === r.base && r.base) score = 110;
      else if (!r.model && english === r.english && english.length > 5) score = 100;
      else if (r.model && english === r.english && alias.includes(r.model)) score = 92;
      if (score && r.type && type && !type.includes(r.type) && !r.type.includes(type)) score -= 6;
      if (score > 0) options.push({rest,score});
    }
    options.sort((a,b)=>b.score-a.score);
    if (!options.length) return null;
    if (options.length > 1 && options[0].score === options[1].score) return null;
    return options[0].rest;
  }

  async function getRestPage(page) {
    const url = new URL(C.illustrationApi);
    url.searchParams.set('page', page);
    url.searchParams.set('limit', String(C.illustrationPageSize));
    const request = C.imageCorsProxy + url.toString();
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), C.fetchTimeoutMs);
    try {
      const response = await fetch(request, {
        method: 'GET',
        credentials: 'omit',
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      if (!response.ok) throw new Error('HTTP ' + response.status + ' en imágenes ' + page);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Formato inválido de imágenes');
      return data;
    } finally { clearTimeout(timeout); }
  }

  // Las imágenes son COMPLEMENTARIAS: un error no borra los datos de portadores.
  async function enrichImages(fruits) {
    if (enrichmentPending) return enrichmentPending;
    enrichmentPending = (async () => {
      const result = [];
      for (let p = 1; p <= 50; p++) {
        const page = await getRestPage(p);
        result.push(...page);
        if (page.length < C.illustrationPageSize) break;
      }
      // Primero emparejamos por nombre. Despues descartamos las URL usadas
      // por varias frutas: incluso una imagen sin "generic" puede ser comun.
      const found = fruits.map(fruit => ({fruit, match: matchRest(fruit, result)}));
      const frequency = new Map();
      for (const {match} of found) {
        if (!match) continue;
        const id = imageIdentity(match.image_url);
        frequency.set(id, (frequency.get(id) || 0) + 1);
      }
      let count = 0, repeated = 0;
      for (const {fruit, match} of found) {
        // No conservar resultados de sincronizaciones anteriores.
        delete fruit.illustrationImage;
        delete fruit.illustrationGeneric;
        if (!match) continue;
        if (frequency.get(imageIdentity(match.image_url)) > 1) {
          repeated++;
          continue;
        }
        fruit.illustrationImage = match.image_url;
        count++;
      }
      refreshMounted();
      return { images: count, from: result.length, repeatedDiscarded: repeated };
    })().finally(() => { enrichmentPending = null; });
    return enrichmentPending;
  }

  OP.media = { mount, draw, refreshMounted, enrichImages, emojiFor, imageCandidates, matchRest, isNika, isPlaceholderImage, imageIdentity };
})();
