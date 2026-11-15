/*
 * Catálogo completo de Frutas del Diablo obtenido en VIVO desde una API REST.
 * Fuente: Devil Fruits Tracker (fccview), por GitHub REST Contents API.
 * No se importa JSON local ni hay catálogo pregrabado o inventado.
 * GitHub Contents entrega el archivo en Base64; se descodifica en UTF-8.
 * Respaldo de transporte: URL pública raw del MISMO repositorio.
 */
(function () {
  'use strict';
  const OP = window.OP;
  const C = OP.config;
  const U = OP.util;

  function readable(text) {
    if (typeof text !== 'string') return '';
    const clean = text.trim();
    return /^(?:n\/?a|unknown|none|null|not known|unspecified)$/i.test(clean) ? '' : clean;
  }

  function fruitAlias(record) {
    const path = String(record.avatarSrc || '');
    const filename = path.split('/').pop()?.replace(/\.[^.]+$/, '') || '';
    // Ej.: Mera_Mera_no_Mi.jpg -> Mera Mera no Mi.
    return decodeURIComponent(filename).replace(/2C/g, ',').replace(/_/g, ' ').trim();
  }

  function normalized(record, index) {
    const alias = fruitAlias(record);
    const name = readable(record.englishName) || alias || readable(record.japaneseName) || `Fruta ${index + 1}`;
    const owner = readable(record.currentOwner) || 'No registrado';
    const previousOwner = readable(record.previousOwner) || 'No registrado';
    const description = readable(record.description) || 'La fuente no proporciona una descripción para esta fruta.';
    const sourceID = record._id?.$oid || record.id || alias || `${index}`;
    // El origen solo expone rutas relativas de imágenes. No inventamos URLs de frutas.
    const image = U.isValidImage(record.avatarSrc) ? record.avatarSrc : '';
    const debut = readable(record.usageDebut) || 'No registrado';
    return {
      id: `tracker-${sourceID}`,
      sourceId: String(sourceID),
      name,
      japaneseName: [alias, readable(record.japaneseName)].filter(Boolean).join(' · '),
      aliases: [alias, name, record.japaneseName, owner, previousOwner].filter(Boolean).join(' '),
      type: readable(record.type) || 'Desconocida',
      owner,
      previousOwner,
      description,
      meaning: alias,
      debut,
      image,
      imageSource: record.avatarSrc || '',
      // Esta ruta es relativa al sitio original. Se prueba como imagen
      // complementaria si existe el archivo público del repositorio.
      trackerImage: /^\/images\/fruits\/[\w.\-]+$/i.test(record.avatarSrc || '')
        ? 'https://raw.githubusercontent.com/fccview/devil-fruits-tracker/main/public' + record.avatarSrc
        : ''
    };
  }

  async function fetchWithTimeout(url, accept = 'application/json') {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), C.fetchTimeoutMs);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: accept },
        credentials: 'omit',
        signal: controller.signal,
        cache: 'no-cache'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status} desde ${new URL(url).hostname}`);
      return response;
    } finally {
      clearTimeout(timer);
    }
  }

  function decodeBase64Unicode(text) {
    const binary = atob(text.replace(/\s/g, ''));
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  }

  async function readFromContentsApi() {
    const response = await fetchWithTimeout(C.fruitsApi);
    const payload = await response.json();
    if (Array.isArray(payload)) return payload;
    if (payload?.encoding !== 'base64' || typeof payload.content !== 'string') {
      throw new Error('El servicio REST no entregó contenido JSON Base64');
    }
    return JSON.parse(decodeBase64Unicode(payload.content));
  }

  async function readFromPublicRaw() {
    const response = await fetchWithTimeout(C.fruitsRawFallback, 'application/json');
    return response.json();
  }

  async function loadAll(onProgress = () => {}) {
    let records;
    let transport = 'GitHub REST Contents API';
    try {
      records = await readFromContentsApi();
    } catch (firstError) {
      console.warn('No respondió la API REST principal. Probando el mismo catálogo por HTTPS:', firstError);
      try {
        records = await readFromPublicRaw();
        transport = 'JSON HTTPS del repositorio (respaldo)';
      } catch (secondError) {
        throw new Error(`No se pudo consultar el catálogo remoto. API: ${firstError.message}. Respaldo: ${secondError.message}`);
      }
    }
    if (!Array.isArray(records) || !records.length) {
      throw new Error('La respuesta del catálogo no contiene frutas');
    }
    const seen = new Map();
    records.forEach((r, i) => {
      if (!r || typeof r !== 'object') return;
      const fruit = normalized(r, i);
      seen.set(fruit.id, fruit);
    });
    if (!seen.size) throw new Error('La API devolvió un catálogo sin registros válidos');
    const fruits = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
    onProgress({ page: 1, loaded: fruits.length, total: fruits.length });
    return {
      fruits, mode: 'rest', source: 'DEVIL FRUITS TRACKER · EN VIVO',
      endpoint: transport === 'GitHub REST Contents API' ? C.fruitsApi : C.fruitsRawFallback,
      reportedTotal: fruits.length, live: true, transport
    };
  }

  OP.api = { loadAll, normalized, readFromContentsApi, readFromPublicRaw, fruitAlias };
})();
