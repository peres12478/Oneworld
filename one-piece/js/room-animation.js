/* Visual-only procedural animation for the side-scrolling room.
   No physics or collision logic lives here. Values follow actual velocity
   and are smoothed every animation frame (no snapping CSS keyframes). */
(function () {
  'use strict';
  const OP = window.OP;
  const PI2 = Math.PI * 2;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const ease = (value, target, rate, dt) => value + (target - value) * (1 - Math.exp(-rate * dt));
  const state = {
    phase: 0, blend: 0, idleClock: 0, impact: 0,
    bodyY: 0, bodyTilt: 0, armL: 0, armR: 0,
    legL: 0, legR: 0, footL: 0, footR: 0, wasGrounded: true,
    lastDust: 0
  };
  let root = null;
  let player = null;
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

  function init() {
    root = document.getElementById('room-world');
    player = document.getElementById('room-player');
  }

  function reset() {
    state.phase = 0;
    state.blend = 0;
    state.idleClock = 0;
    state.impact = 0;
    state.bodyY = 0;
    state.bodyTilt = 0;
    state.armL = state.armR = state.legL = state.legR = 0;
    state.footL = state.footR = 0;
    state.wasGrounded = true;
    state.lastDust = 0;
    if (root) root.querySelectorAll('.step-dust').forEach(e => e.remove());
  }

  function effect(x, y, strength) {
    if (!root || (reduced && reduced.matches)) return;
    const puff = document.createElement('span');
    puff.className = 'step-dust';
    puff.style.left = (x - 12) + 'px';
    puff.style.top = (y - 8) + 'px';
    puff.style.setProperty('--dust-size', `${8 + Math.round(strength * 9)}px`);
    root.appendChild(puff);
    puff.addEventListener('animationend', () => puff.remove(), { once: true });
    // Avoid leaving orphaned elements when a tab pauses an animation.
    if (root.querySelectorAll('.step-dust').length > 18) root.querySelector('.step-dust').remove();
  }

  function set(name, value) {
    player.style.setProperty(name, value);
  }

  function update({ dt, x, y, vx, vy, grounded, sprinting }) {
    if (!player) return;
    dt = clamp(dt || 0, 0, 0.05);
    state.idleClock += dt;
    const speed = Math.abs(vx);
    const pace = clamp(speed / (sprinting ? 370 : 255), 0, 1);
    const targetBlend = grounded ? clamp(speed / 92, 0, 1) : 0;
    state.blend = ease(state.blend, targetBlend, grounded ? 11 : 9, dt);

    // A full cycle corresponds to a measured traveled distance. The gait
    // stays synchronized with the character, even during acceleration.
    const prevPhase = state.phase;
    if (grounded && speed > 3) {
      const cycleDistance = sprinting ? 120 : 148;
      state.phase += PI2 * speed / cycleDistance * dt;
    }
    if (!state.wasGrounded && grounded) {
      state.impact = 1;
      effect(x, y, clamp(Math.abs(vy) / 700 + 0.4, 0.4, 1));
    }
    state.wasGrounded = grounded;
    state.impact = Math.max(0, state.impact - dt * 4.7);

    const reducedMotion = Boolean(reduced && reduced.matches);
    const step = Math.sin(state.phase), stepOpposite = Math.sin(state.phase + Math.PI);
    const walk = state.blend * (0.7 + 0.3 * pace);
    const legSwing = (sprinting ? 22 : 15) * walk;
    const armSwing = (sprinting ? 13 : 9) * walk;
    const airborne = !grounded;

    // Opposite arm/leg movement, with subtle foot lift during the swing phase.
    let legL = legSwing * step, legR = legSwing * stepOpposite;
    let armL = -armSwing * step, armR = -armSwing * stepOpposite;
    let liftL = Math.max(0, step) * 3.8 * walk;
    let liftR = Math.max(0, stepOpposite) * 3.8 * walk;
    let bob = -Math.abs(Math.sin(state.phase)) * 2.0 * walk;
    let bodyLean = Math.sign(vx) * (sprinting ? 2.3 : 1.1) * walk;
    let stretch = 1 - state.impact * 0.035;

    if (airborne) {
      const upward = vy < 0;
      legL = upward ? 10 : -6;
      legR = upward ? -11 : 8;
      armL = upward ? -8 : 5;
      armR = upward ? 7 : -5;
      liftL = liftR = 0;
      bob = upward ? -3 : 1;
      bodyLean = upward ? -4 : 3;
      stretch = upward ? 1.024 : 1.006;
    } else if (walk < 0.1) {
      // A tiny breathing motion replaces the frozen idle sprite.
      bob += Math.sin(state.idleClock * 2.1) * 1.0;
      armL += Math.sin(state.idleClock * 1.3) * 0.7;
      armR -= Math.sin(state.idleClock * 1.3) * 0.7;
    }
    if (reducedMotion) {
      bob = 0; legL = legR = armL = armR = liftL = liftR = bodyLean = 0; stretch = 1;
    }

    state.legL = ease(state.legL, legL, airborne ? 13 : 15, dt);
    state.legR = ease(state.legR, legR, airborne ? 13 : 15, dt);
    state.armL = ease(state.armL, armL, airborne ? 11 : 12, dt);
    state.armR = ease(state.armR, armR, airborne ? 11 : 12, dt);
    state.footL = ease(state.footL, liftL, 17, dt);
    state.footR = ease(state.footR, liftR, 17, dt);
    state.bodyY = ease(state.bodyY, bob + state.impact * 5, 14, dt);
    state.bodyTilt = ease(state.bodyTilt, bodyLean, 9, dt);

    set('--rig-leg-l', `${state.legL.toFixed(3)}deg`);
    set('--rig-leg-r', `${state.legR.toFixed(3)}deg`);
    set('--rig-arm-l', `${state.armL.toFixed(3)}deg`);
    set('--rig-arm-r', `${state.armR.toFixed(3)}deg`);
    set('--rig-foot-l', `${state.footL.toFixed(2)}px`);
    set('--rig-foot-r', `${state.footR.toFixed(2)}px`);
    set('--rig-body-y', `${state.bodyY.toFixed(2)}px`);
    set('--rig-body-tilt', `${state.bodyTilt.toFixed(2)}deg`);
    set('--rig-body-scale', stretch.toFixed(3));
    set('--rig-shadow-alpha', airborne ? '0.32' : '0.85');
    set('--rig-shadow-scale', airborne ? '0.75' : '1');

    // A little dust only while running or at the moment of landing.
    if (grounded && speed > 205 && state.idleClock - state.lastDust > 0.25) {
      state.lastDust = state.idleClock;
      effect(x, y, sprinting ? 0.65 : 0.35);
    }
  }
  OP.roomAnimation = { init, reset, update };
})();
