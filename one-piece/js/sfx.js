/* Efectos de sonido originales de Grand Line Explorer.
   Generados localmente con Web Audio API: NO descarga audios, ni necesita
   Python, bibliotecas externas, permisos especiales o archivos .mp3.
   - playPunch: silbido y golpe grave para el puño de Luffy.
   - playSword: corte metálico + crujidos eléctricos para el Haki de Roger.
   - playDoorBreak: impacto de piedra, madera y escombros.
   El contexto solo se crea al pulsar F o el botón de acción, de modo
   que cumple la política de reproducción de Edge y Chrome. */
(function () {
  'use strict';
  const OP = window.OP;
  const AudioClass = window.AudioContext || window.webkitAudioContext;
  let ctx = null, master = null, noiseBuffer = null;
  let enabled = true, volume = 0.65;
  let toggle, slider;

  function setup() {
    if (!AudioClass || !enabled) return false;
    if (!ctx) {
      try {
        ctx = new AudioClass();
        master = ctx.createGain();
        master.gain.value = volume * 0.48;
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -15;
        limiter.knee.value = 10;
        limiter.ratio.value = 9;
        limiter.attack.value = 0.002;
        limiter.release.value = 0.17;
        master.connect(limiter);
        limiter.connect(ctx.destination);
        noiseBuffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * 1.5), ctx.sampleRate);
        const pcm = noiseBuffer.getChannelData(0);
        // Ruido blanco: sirve como base de silbidos, golpes y crujidos.
        for (let i = 0; i < pcm.length; i++) pcm[i] = Math.random() * 2 - 1;
      } catch (error) {
        console.warn('Efectos de sonido no disponibles en este navegador:', error);
        ctx = null;
        return false;
      }
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(error => console.warn('No se pudo activar audio:', error));
    }
    return true;
  }

  function gainAt(start, duration, peak, attack = 0.012, decay = 0.6) {
    const gain = ctx.createGain();
    const up = Math.min(attack, duration * 0.25);
    const down = Math.max(up, duration * decay);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), start + Math.max(0.002, up));
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.24), start + down);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    gain.connect(master);
    return gain;
  }

  function oscillator({when, duration, from, to, peak, type='sine', attack=0.012}) {
    const source = ctx.createOscillator();
    source.type = type;
    source.frequency.setValueAtTime(from, when);
    source.frequency.exponentialRampToValueAtTime(Math.max(20, to), when + duration);
    source.connect(gainAt(when, duration, peak, attack));
    source.start(when);
    source.stop(when + duration + 0.012);
  }

  function noise({when, duration, from, to, peak, filter='bandpass', q=0.6, attack=0.015}) {
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    const tone = ctx.createBiquadFilter();
    tone.type = filter;
    tone.Q.value = q;
    tone.frequency.setValueAtTime(Math.max(30, from), when);
    tone.frequency.exponentialRampToValueAtTime(Math.max(30, to), when + duration);
    source.connect(tone);
    tone.connect(gainAt(when, duration, peak, attack));
    source.start(when);
    source.stop(when + duration + 0.012);
  }

  function playPunch() {
    if (!setup()) return;
    const now = ctx.currentTime + 0.008;
    // Movimiento rápido del brazo elástico.
    noise({when:now, duration:0.30, from:500, to:2400, peak:0.23, q:0.75, attack:0.028});
    oscillator({when:now + 0.07, duration:0.19, from:155, to:58, peak:0.34, type:'sine', attack:0.005});
    // Impacto seco que refuerza el puñetazo, sin sonido de disparo.
    noise({when:now + 0.08, duration:0.105, from:2900, to:420, peak:0.32, filter:'lowpass', attack:0.003});
    oscillator({when:now + 0.12, duration:0.10, from:100, to:57, peak:0.22, type:'triangle', attack:0.004});
  }

  function playSword() {
    if (!setup()) return;
    const now = ctx.currentTime + 0.008;
    // Filo atravesando el aire.
    noise({when:now, duration:0.43, from:620, to:3800, peak:0.40, q:0.95, attack:0.035});
    noise({when:now + 0.09, duration:0.23, from:3100, to:900, peak:0.17, filter:'highpass', attack:0.009});
    // Vibración metálica y chispas cortas de Haki.
    oscillator({when:now + 0.03, duration:0.31, from:1150, to:470, peak:0.13, type:'triangle'});
    oscillator({when:now + 0.12, duration:0.22, from:690, to:250, peak:0.13, type:'sawtooth'});
    for (const offset of [0.115, 0.205, 0.295]) {
      noise({when:now + offset, duration:0.055, from:3700, to:1050, peak:0.15, filter:'highpass', attack:0.002});
    }
  }

  function playDoorBreak() {
    if (!setup()) return;
    const now = ctx.currentTime + 0.004;
    // Crujido inicial y derrumbe con resonancia grave.
    oscillator({when:now, duration:0.46, from:165, to:43, peak:0.43, type:'sine', attack:0.004});
    noise({when:now, duration:0.39, from:2500, to:260, peak:0.55, filter:'lowpass', attack:0.003});
    noise({when:now + 0.025, duration:0.24, from:2900, to:570, peak:0.33, q:0.45, attack:0.005});
    // Pequeños fragmentos que caen después de la fractura.
    for (const [delay, size] of [[0.16,0.23],[0.26,0.17],[0.40,0.12],[0.55,0.08]]) {
      noise({when:now + delay, duration:0.08 + size*0.3, from:2500, to:500, peak:size, filter:'lowpass', attack:0.003});
    }
  }

  function playBossHit() {
    if(!setup())return;const now=ctx.currentTime+.005;
    noise({when:now,duration:.2,from:950,to:210,peak:.36,filter:'lowpass',attack:.004});
    oscillator({when:now,duration:.24,from:126,to:50,peak:.25,type:'triangle'});
  }
  function playDarkness(){
    if(!setup())return;const now=ctx.currentTime+.005;
    oscillator({when:now,duration:.36,from:178,to:51,peak:.18,type:'sawtooth'});
    noise({when:now,duration:.33,from:300,to:1100,peak:.14,filter:'bandpass',attack:.018});
  }
  function playGear5Punch(){
    if(!setup())return;const now=ctx.currentTime+.004;
    oscillator({when:now,duration:.33,from:550,to:114,peak:.26,type:'sine',attack:.015});
    oscillator({when:now+.17,duration:.33,from:95,to:340,peak:.25,type:'triangle',attack:.008});
    noise({when:now+.15,duration:.32,from:700,to:2900,peak:.25,filter:'bandpass'});
  }
  function playGear5Impact(){
    if(!setup())return;const now=ctx.currentTime+.005;
    oscillator({when:now,duration:.24,from:184,to:58,peak:.42,type:'sine',attack:.004});
    oscillator({when:now+.04,duration:.29,from:690,to:122,peak:.15,type:'triangle',attack:.004});
    noise({when:now,duration:.24,from:2300,to:290,peak:.35,filter:'lowpass',attack:.004});
  }
  function playGear5Drum(){
    if(!setup())return;const now=ctx.currentTime+.004;
    for(const [delay,pitch] of [[0,96],[.13,123],[.26,146]])
      oscillator({when:now+delay,duration:.19,from:pitch*1.8,to:pitch*.55,peak:.19,type:'sine',attack:.004});
  }
  function playGear5Land(){
    if(!setup())return;const now=ctx.currentTime+.004;
    oscillator({when:now,duration:.48,from:185,to:35,peak:.5,type:'sine',attack:.004});
    noise({when:now,duration:.39,from:2400,to:125,peak:.41,filter:'lowpass',attack:.005});
    oscillator({when:now+.07,duration:.25,from:540,to:155,peak:.15,type:'triangle',attack:.004});
  }

  function setEnabled(value) {
    enabled = Boolean(value);
    if (toggle) {
      toggle.textContent = enabled ? 'FX ON' : 'FX OFF';
      toggle.setAttribute('aria-pressed', String(enabled));
      toggle.setAttribute('aria-label', enabled ? 'Silenciar efectos' : 'Activar efectos');
      toggle.classList.toggle('sfx-muted', !enabled);
    }
    if (master && ctx) master.gain.setTargetAtTime(enabled ? volume * 0.48 : 0, ctx.currentTime, 0.025);
  }

  function init() {
    toggle = document.getElementById('sfx-toggle');
    slider = document.getElementById('sfx-volume');
    if (toggle) toggle.addEventListener('click', () => setEnabled(!enabled));
    if (slider) slider.addEventListener('input', () => {
      volume = Math.max(0, Math.min(1, Number(slider.value) / 100));
      slider.setAttribute('aria-valuetext', Math.round(volume * 100) + '%');
      if (master && ctx) master.gain.setTargetAtTime(enabled ? volume * 0.48 : 0, ctx.currentTime, 0.025);
    });
    setEnabled(true);
  }

  OP.sfx = {
    init, playPunch, playSword, playDoorBreak, playBossHit, playDarkness,
    playGear5Punch, playGear5Impact, playGear5Drum, playGear5Land,
    getStatus: () => ({supported:Boolean(AudioClass), enabled, volume, state:ctx?.state || 'no iniciado'})
  };
})();
