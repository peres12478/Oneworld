/* Movimiento WASD / flechas + animación vía requestAnimationFrame y controles táctiles. */
(function () {
  'use strict';
  const OP = window.OP;
  const U = OP.util;
  const C = OP.config;
  const input = new Set();
  const state = {
    active: false, thinking: false, panelOpen: false, character: 'luffy',
    x: C.worldWidth / 2, y: C.worldHeight / 2,
    cameraX: 0, cameraY: 0, lastTime: 0, nextNearCheck: 0,
    facing: 'right', nearest: null
  };
  let player, world, viewport;

  function isTypingTarget(target) {
    return target && (target.matches('input, textarea, select') || target.isContentEditable);
  }

  function keyDown(event) {
    if (!state.active) return;
    const key = event.key.toLowerCase();
    if (key === 'escape') {
      OP.ui.closeAllOverlays();
      return;
    }
    if (isTypingTarget(event.target)) return;
    if (key === 'q' && !event.repeat) {
      event.preventDefault();
      OP.ui.toggleSearch();
      return;
    }
    if (key === 'e' && !event.repeat) {
      event.preventDefault();
      if (!state.thinking && !state.panelOpen) OP.ui.inspectNearby();
      return;
    }
    if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(key)) {
      event.preventDefault();
      input.add(key);
    }
  }

  function keyUp(event) { input.delete(event.key.toLowerCase()); }
  function clearKeys() { input.clear(); }

  function initTouchControls() {
    document.querySelectorAll('[data-key]').forEach(button => {
      const key = button.dataset.key;
      const release = event => {
        event.preventDefault();
        input.delete(key);
        button.classList.remove('pressed');
      };
      button.addEventListener('pointerdown', event => {
        event.preventDefault();
        if (state.active) input.add(key);
        button.classList.add('pressed');
        button.setPointerCapture(event.pointerId);
      });
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', () => { input.delete(key); button.classList.remove('pressed'); });
    });
    document.querySelector('[data-action="inspect"]').addEventListener('click', () => OP.ui.inspectNearby());
  }

  function init() {
    player = U.byId('player');
    world = U.byId('world');
    viewport = U.byId('viewport');
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    window.addEventListener('blur', clearKeys);
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearKeys(); });
    initTouchControls();
    state.lastTime = performance.now();
    requestAnimationFrame(tick);
  }

  function start(character) {
    state.active = true;
    state.character = character;
    state.thinking = false;
    state.panelOpen = false;
    state.x = C.worldWidth / 2;
    state.y = C.worldHeight / 2;
    state.facing = 'right';
    state.nearest = null;
    state.cameraX = U.clamp(state.x - viewport.clientWidth / 2, 0, Math.max(0, C.worldWidth - viewport.clientWidth));
    state.cameraY = U.clamp(state.y - viewport.clientHeight / 2, 0, Math.max(0, C.worldHeight - viewport.clientHeight));
    player.dataset.character = character;
    U.byId('player-sprite').src = C.characters[character].src;
    U.byId('player-name').textContent = C.characters[character].shortName;
    U.byId('hud-avatar').src = C.characters[character].src;
    U.byId('hud-name').textContent = C.characters[character].name;
    clearKeys();
    updatePlayer(false, false);
    updateCamera(1);
    updateNear();
  }

  function stop() { state.active = false; state.thinking = false; state.panelOpen = false; clearKeys(); }
  function setThinking(value) {
    state.thinking = Boolean(value);
    clearKeys();
    player.classList.toggle('is-thinking', state.thinking);
    player.classList.remove('is-moving', 'is-running');
  }
  function setPanelOpen(value) { state.panelOpen = Boolean(value); clearKeys(); }

  function updatePlayer(moving, running) {
    player.style.left = state.x + 'px';
    player.style.top = state.y + 'px';
    player.dataset.facing = state.facing;
    player.classList.toggle('is-moving', moving && !state.thinking);
    player.classList.toggle('is-running', running && moving && !state.thinking);
    U.byId('coords').textContent = `X ${String(Math.round(state.x)).padStart(4,'0')} · Y ${String(Math.round(state.y)).padStart(4,'0')}`;
  }

  function updateCamera(dt) {
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    const targetX = U.clamp(state.x - width / 2, 0, Math.max(0, C.worldWidth - width));
    const targetY = U.clamp(state.y - height / 2, 0, Math.max(0, C.worldHeight - height));
    const alpha = 1 - Math.exp(-8 * dt);
    state.cameraX += (targetX - state.cameraX) * alpha;
    state.cameraY += (targetY - state.cameraY) * alpha;
    world.style.transform = `translate3d(${-state.cameraX}px, ${-state.cameraY}px, 0)`;
  }

  function updateNear() {
    const next = OP.world.findNearest(state.x, state.y);
    if ((next && next.id) !== (state.nearest && state.nearest.id)) {
      state.nearest = next;
      OP.ui.setNearby(next);
    }
  }

  function tick(time) {
    const dt = Math.min((time - state.lastTime) / 1000 || 0, 0.04);
    state.lastTime = time;
    if (state.active) {
      let dx = 0, dy = 0;
      const canWalk = !state.thinking && !state.panelOpen;
      if (canWalk) {
        if (input.has('a') || input.has('arrowleft')) dx--;
        if (input.has('d') || input.has('arrowright')) dx++;
        if (input.has('w') || input.has('arrowup')) dy--;
        if (input.has('s') || input.has('arrowdown')) dy++;
      }
      const moving = dx !== 0 || dy !== 0;
      const running = input.has('shift');
      if (moving) {
        // Normalizar diagonal evita que se mueva más rápido al pulsar dos teclas.
        const magnitude = Math.hypot(dx, dy);
        const speed = C.avatarSpeed * (running ? C.sprintMultiplier : 1);
        state.x = U.clamp(state.x + dx / magnitude * speed * dt, 64, C.worldWidth - 64);
        state.y = U.clamp(state.y + dy / magnitude * speed * dt, 80, C.worldHeight - 65);
        if (dx) state.facing = dx < 0 ? 'left' : 'right';
      }
      updatePlayer(moving, running);
      updateCamera(dt);
      if (time > state.nextNearCheck) { updateNear(); state.nextNearCheck = time + 100; }
    }
    requestAnimationFrame(tick);
  }

  function teleportNear(node) {
    if (!node) return;
    state.x = U.clamp(node.x - 100, 64, C.worldWidth - 64);
    state.y = U.clamp(node.y + 74, 80, C.worldHeight - 65);
    state.nearest = null;
    updatePlayer(false, false);
    updateCamera(1);
    updateNear();
  }
  function getNearest() { return state.nearest; }
  OP.movement = { init, start, stop, setThinking, setPanelOpen, teleportNear, getNearest };
})();
