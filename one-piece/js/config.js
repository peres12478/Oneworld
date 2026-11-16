/* Configuración global de Grand Line Explorer (solo navegador, sin Python). */
(function () {
  'use strict';
  const OP = window.OP = window.OP || {};
  OP.config = {
    // Servicio REST público con la ficha completa (portadores, habilidades, debut).
    fruitsApi: 'https://api.github.com/repos/fccview/devil-fruits-tracker/contents/scripts/data/fruits.json?ref=main',
    // Mismo conjunto de datos vía HTTPS, si la API pública limita solicitudes.
    fruitsRawFallback: 'https://raw.githubusercontent.com/fccview/devil-fruits-tracker/main/scripts/data/fruits.json',
    fetchTimeoutMs: 16000,
    // API visual complementaria: proporciona image_url. La información de
    // portadores y debut sigue llegando de Devil Fruits Tracker.
    illustrationApi: 'https://www.onepieceapi.com/api/devil-fruits',
    imageCorsProxy: 'https://proxy.cors.dev/',
    illustrationPageSize: 20,
    worldWidth: 3900,
    worldHeight: 3300,
    avatarSpeed: 280,
    sprintMultiplier: 1.65,
    roomWidth: 3250,
    characters: {
      luffy: { name: 'MONKEY D. LUFFY', shortName: 'LUFFY', src: 'assets/luffy.png' },
      roger: { name: 'GOL D. ROGER', shortName: 'ROGER', src: 'assets/roger.png' }
    }
  };
  OP.util = {
    byId(id) { return document.getElementById(id); },
    clamp(n, min, max) { return Math.max(min, Math.min(max, n)); },
    normalize(value) {
      return (value || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    },
    isValidImage(url) {
      try { const u = new URL(url); return u.protocol === 'https:'; } catch (_) { return false; }
    },
    make(tag, className, text) {
      const el = document.createElement(tag);
      if (className) el.className = className;
      if (text != null) el.textContent = text;
      return el;
    }
  };
})();
