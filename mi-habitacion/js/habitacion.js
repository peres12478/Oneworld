/* Habitación personal — TODO contenido editable en js/datos-personales.js.
   El personaje, sus colisiones y las ventanas no necesitan backend ni APIs. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const stage = $('room-stage'), world = $('bedroom-world');
  const astronaut = $('bedroom-astronaut'), shadow = $('bedroom-shadow');
  const prompt = $('room-prompt'), promptTitle = $('room-prompt-title');
  const overlay = $('room-overlay'), dialogTitle = $('dialog-title'), dialogBody = $('dialog-body');
  const info = window.DATOS_HABITACION || {};
  const points = [
    { x: 156, name: 'MI ESPACIO', action: 'exit' },
    { x: 810, name: 'MI GITHUB', action: 'projects' },
    { x: 1380, name: 'MIS PASIONES', action: 'passions' },
    { x: 1860, name: 'SOBRE MÍ', action: 'about' },
  ];
  const WIDTH = 2250;
  const keys = new Set();
  const state = { x: 390, y: 0, vy: 0, onGround: true, facing: 1, near: null, camera: 0, last: 0 };
  const text = v => typeof v === 'string' && v.trim() ? v.trim() : 'Pendiente de completar.';
  const safeHref = v => { try { const u = new URL(v); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
  function el(tag, className = '', value = '') { const item = document.createElement(tag); item.className = className; if (value) item.textContent = value; return item; }
  function paragraph(value, fallback) { dialogBody.append(el('p', 'info-description', value && String(value).trim() || fallback)); }
  function linkTo(url, label) { const href = safeHref(url); if (!href) { dialogBody.append(el('p', 'empty-link', 'Todavía no se ha agregado este enlace.')); return; }
    const link = el('a', 'external-link', label); link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer'; dialogBody.append(link); }
  function title(value) { dialogBody.append(el('h3', 'inner-heading', value)); }
  function cards(items, type) {
    if (!Array.isArray(items) || !items.length) { paragraph('', 'Aquí aparecerán las pasiones que quieras compartir.'); return; }
    const wrap = el('div', 'detail-grid');
    items.forEach(item => {
      const card = el('article', 'detail-card');
      card.append(el('strong', '', text(item.nombre)));
      card.append(el('p', '', text(item.descripcion)));
      wrap.append(card);
    });
    dialogBody.append(wrap);
  }
  function open(action) {
    if (action === 'exit') { window.location.href = new URL('../index.html', document.baseURI).href; return; }
    dialogBody.replaceChildren();
    $('dialog-eyebrow').textContent = 'MI HABITACIÓN · CONTENIDO PERSONAL';
    if (action === 'projects') {
      dialogTitle.textContent = 'Mi GitHub';
      dialogBody.append(el('p', 'github-handle', text(info.github?.nombre)));
      linkTo(info.github?.url, 'VER MIS PROYECTOS EN GITHUB ↗');
    } else if (action === 'passions') {
      dialogTitle.textContent = 'Mis pasiones';
      paragraph(info.pasiones?.introduccion, 'Este espacio es para contar qué cosas me apasionan y me motivan.');
      title('LO QUE ME INSPIRA');
      cards(info.pasiones?.intereses, 'passions');
    } else if (action === 'about') {
      dialogTitle.textContent = 'Sobre mí';
      title('¿QUIÉN SOY?');
      dialogBody.append(el('p', 'whoami', text(info.sobreMi?.nombre)));
      paragraph(info.sobreMi?.presentacion, 'Aquí escribiré una presentación personal.');
      title('FECHA DE NACIMIENTO');
      const raw = info.sobreMi?.fechaNacimiento || '';
      const valid = /^\d{4}-\d{2}-\d{2}$/.test(raw);
      dialogBody.append(el('p', 'birthdate', valid ? raw.split('-').reverse().join(' / ') : 'Fecha no publicada.'));
    }
    overlay.classList.remove('hidden');
    $('close-info').focus();
  }
  function close() { overlay.classList.add('hidden'); stage.focus({preventScroll: true}); }
  $('close-info').addEventListener('click', close);
  overlay.addEventListener('pointerdown', ev => { if (ev.target === overlay) close(); });
  document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => open(button.dataset.action)));
  $('room-prompt-enter').addEventListener('click', () => { if (state.near) open(state.near.action); });
  $('room-mobile-e').addEventListener('click', () => { if (state.near) open(state.near.action); });
  function normalized(k) { const n = String(k).toLowerCase(); return n === 'arrowleft' ? 'a' : n === 'arrowright' ? 'd' : ['arrowup', ' '].includes(n) ? 'w' : n; }
  function jump() { if (!state.onGround) return; state.y = 1; state.vy = 650; state.onGround = false; }
  function isTyping() { return ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName); }
  document.addEventListener('keydown', ev => {
    const k = normalized(ev.key);
    if (k === 'escape' && !overlay.classList.contains('hidden')) { ev.preventDefault(); close(); return; }
    if (!overlay.classList.contains('hidden') || isTyping()) return;
    if (['a','d','w','e','shift'].includes(k)) ev.preventDefault();
    if (k === 'e' && !ev.repeat && state.near) open(state.near.action);
    if (k === 'w' && !ev.repeat) jump();
    keys.add(k);
  });
  document.addEventListener('keyup', ev => keys.delete(normalized(ev.key)));
  window.addEventListener('blur', () => keys.clear());
  document.addEventListener('visibilitychange', () => { if (document.hidden) keys.clear(); });
  document.querySelectorAll('.touch-room [data-key]').forEach(button => {
    const k = button.dataset.key;
    button.addEventListener('pointerdown', e => { e.preventDefault(); try { button.setPointerCapture(e.pointerId); } catch {} if (k === 'w') jump(); else keys.add(k); });
    for (const evt of ['pointerup','pointercancel','lostpointercapture']) button.addEventListener(evt, () => keys.delete(k));
  });
  function tick(now) {
    const dt = state.last ? Math.min(.035, (now - state.last) / 1000) : 0; state.last = now;
    if (overlay.classList.contains('hidden')) {
      const dir = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0);
      if (dir) { state.x = Math.max(60, Math.min(WIDTH-60, state.x + dir * (keys.has('shift') ? 350 : 225) * dt)); state.facing = dir; }
      if (!state.onGround) { state.y += state.vy * dt; state.vy -= 1750 * dt; if (state.y <= 0) { state.y = 0; state.vy = 0; state.onGround = true; } }
      astronaut.classList.toggle('walking', !!dir && state.onGround); astronaut.classList.toggle('jumping', !state.onGround);
      const near = points.filter(p => Math.abs(p.x - state.x) <= 150).sort((a,b) => Math.abs(a.x-state.x)-Math.abs(b.x-state.x))[0] || null;
      if (near?.action !== state.near?.action) { state.near = near; prompt.classList.toggle('visible', !!near); promptTitle.textContent = near ? 'ABRIR: ' + near.name : 'INTERACTUAR'; }
      const max = Math.max(0, WIDTH - stage.clientWidth); const target = Math.min(max, Math.max(0, state.x - stage.clientWidth * .42));
      state.camera += (target - state.camera) * Math.min(1,dt*9);
      astronaut.style.left = state.x + 'px'; astronaut.style.bottom = `calc(var(--room-ground) + ${state.y}px)`; astronaut.style.setProperty('--facing',state.facing);
      shadow.style.left = state.x + 'px'; shadow.style.opacity = String(Math.max(.15, 1 - state.y/290));
      world.style.transform = `translate3d(${-state.camera.toFixed(1)}px,0,0)`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  window.ROOM_DIAGNOSTIC = { getState: () => ({...state}), open, close };
})();
