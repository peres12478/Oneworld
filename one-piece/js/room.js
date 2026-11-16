/* Sala lateral con cámara, gravedad, salto y contacto con el suelo; sin plataformas flotantes. */
(function () {
  'use strict';
  const OP = window.OP, U = OP.util, C = OP.config;
  const keys = new Set();
  const state = { active:false, x:220, y:0, vx:0, vy:0, ground:true, facing:1,
    lastTime:0, camera:0, character:'luffy', jumpPressed:false, doorNear:false, doorType:null, slamActive:false, zone:'lobby' };
  const worldH = 560;
  const playerHeight = 190;
  const gravity = 1450, jumpSpeed = -610, walkSpeed = 255, sprintSpeed = 370;
  const floorY = 446;
  let player, stage, viewport, cameraLayer, doorHint;
  const down = (...tests) => tests.some(k=>keys.has(k));
  const typing = el=>el && (el.matches('input, textarea, select')||el.isContentEditable);
  function keyDown(e) {
    if (!state.active || typing(e.target)) return;
    const k=e.key.toLowerCase();
    if (['a','d','w','s','arrowleft','arrowright','arrowup',' ','shift','e','f','g','t'].includes(k)) e.preventDefault();
    if (OP.doorPuzzle.isOpen()) { if(k === 'escape') OP.doorPuzzle.close(); return; }
    if (OP.boss.overlayOpen()) return;
    if (k === 'f' && !e.repeat) { fireAbility(); return; }
    if (k === 'g' && !e.repeat) { fireDrum(); return; }
    if (k === 'e' && !e.repeat && state.doorNear) { enterDoor(); return; }
    if ((k==='w'||k==='arrowup'||k===' ')&&!e.repeat) state.jumpPressed=true;
    keys.add(k);
  }
  function keyUp(e) { keys.delete(e.key.toLowerCase()); }
  function setCharacter(name) {
    player.dataset.character=name;
    player.classList.toggle('gear5', name==='luffy' && OP.rewards.isGear5());
    // Roger: rig limpio. Su ilustración original conserva la capa y las piernas
    // juntas, sin pedazos de tela roja pegados a las capas articuladas.
    // El vaivén del cuerpo, el salto y el polvo de pasos siguen animándose.
    ['body','leg-left','leg-right','arm-left','arm-right'].forEach(part=>{
      const image=player.querySelector(`[data-rig="${part}"]`);
      const source=(name==='roger' && part==='body')?OP.rewards.sprite('roger'):OP.rewards.rig(name,part);
      if(image.getAttribute('src')!==source)image.src=source;
    });
  }
  function start(character, nearDoor=false) {
    // nearDoor puede ser 'characters' al regresar de una isla.
    state.active=true;state.zone='lobby'; state.x=nearDoor==='characters' ? 1260 : nearDoor==='hachinosu' ? 570 : nearDoor ? C.roomWidth-390 : 305; state.y=floorY; state.vx=0; state.vy=0;
    state.ground=true;state.doorNear=false;state.doorType=null;state.camera=0;state.character=character;state.slamActive=false;
    state.lastTime=performance.now();state.facing=1;keys.clear();
    // Una derrota anterior nunca debe dejar invisible al nuevo personaje.
    player.classList.remove('hero-hurt','using-ability','luffy-ability','roger-ability','gear5-punching','drum-active','drum-landed');
    player.style.opacity='1'; player.style.visibility='visible';
    player.hidden=false;
    OP.gear5?.reset?.();
    cameraLayer.style.transform='translate3d(0,0,0)';
    setCharacter(character);
    stage.style.width=C.roomWidth+'px';
    OP.roomAnimation.reset();
    OP.abilities.reset();
    OP.boss.stop();OP.battleMusic?.leave();updateZoneLayout();
    stateRender('idle');updateGear5Hud();
  }
  function stop() { state.active=false;state.slamActive=false;keys.clear(); OP.abilities.reset(); OP.boss.stop(); OP.battleMusic?.leave(); }
  function updateZoneLayout(){
    const island=state.zone==='hachinosu';
    U.byId('room-screen').classList.toggle('hachinosu-mode',island);
    U.byId('room-area-label').textContent=island?'CAPÍTULO 02 · HACHINOSU':'CAPÍTULO 01 · EL PRIMER PASO';
    U.byId('room-area-heading').innerHTML=island?'ISLA <em>HACHINOSU.</em>':'RUMBO A <em>LA GRAND LINE.</em>';
    U.byId('room-area-description').textContent=island?
      'Enfréntate a Barbanegra. Salta cuando el suelo brille: ¡los pinchos surgen después de la advertencia!':
      'Un puerto legendario: Going Merry, Thousand Sunny y Oro Jackson esperan a sus capitanes.';
  }
  function enterHachinosu(){
    OP.abilities.reset();OP.gear5.reset();keys.clear();
    state.zone='hachinosu';state.x=1270;state.y=floorY;state.vx=0;state.vy=0;
    state.ground=true;state.camera=0;state.slamActive=false;state.doorNear=false;state.doorType=null;
    state.lastTime=performance.now();updateZoneLayout();OP.boss.start(state.character);OP.battleMusic?.enter();stateRender('idle');
  }
  function leaveHachinosu(){if(OP.boss.overlayOpen())return;OP.battleMusic?.leave();start(state.character,'hachinosu');}
  const isHachinosu=()=>state.zone==='hachinosu';
  const isBusy=()=>Boolean(state.slamActive||OP.abilities.active()||OP.gear5.status().drumming||OP.boss.overlayOpen());
  function refreshSkin(){if(!player)return;setCharacter(state.character);OP.poses.setCharacter(state.character);if(state.active)updateGear5Hud();}
  function pullToward(force){if(!state.active||state.zone!=='hachinosu')return;
    state.vx=U.clamp(state.vx+force,-620,620);
    // La fuerza gravitatoria también afecta la posición: sin esto la fricción anula la succión.
    state.x=U.clamp(state.x+force*.20,55,C.roomWidth-75);
  }
  function respawnNearBoss(){state.x=1290;state.y=floorY;state.vx=0;state.vy=0;state.ground=true;state.slamActive=false;keys.clear();OP.abilities.reset();}
  function fireAbility(){
    if(!state.active || OP.doorPuzzle.isOpen() || OP.boss.overlayOpen()) return;
    OP.abilities.fire({x:state.x,y:state.y,facing:state.facing,character:state.character});
  }
  function fireDrum(){
    if(!state.active||state.character!=='luffy'||!OP.rewards.isGear5()||!state.ground||state.slamActive||OP.doorPuzzle.isOpen()||OP.boss.overlayOpen()||OP.abilities.active())return false;
    if(!OP.gear5.startDrum())return false;
    state.slamActive=true;state.ground=false;state.vy=-800;state.jumpPressed=false;
    return true;
  }
  function updateGear5Hud(){
    const unlocked=state.character==='luffy'&&OP.rewards.isGear5();
    const hud=U.byId('gear5-hud'),mobile=U.byId('room-drum-button');
    hud.classList.toggle('hidden',!unlocked);mobile.classList.toggle('hidden',!unlocked);
    if(!unlocked)return;
    const cd=OP.gear5.status().cooldown;
    U.byId('gear5-hud-status').textContent=cd>0?`RECARGANDO · ${cd.toFixed(1)} s`:'LISTO · PULSA G';
    hud.classList.toggle('is-cooling',cd>0);mobile.disabled=cd>0||state.slamActive||OP.abilities.active();
  }
  function stateRender(anim) {
    // No sustituir className entero: borraba los estados de ataque en cada frame.
    ['idle','walk','run','jump','fall'].forEach(name=>player.classList.toggle('rig-'+name,name===anim));
    player.classList.toggle('gear5',state.character==='luffy'&&OP.rewards.isGear5());
    player.style.left=state.x+'px';player.style.top=(state.y-playerHeight)+'px';
    player.style.setProperty('--face', String(state.facing));
    player.style.setProperty('--speed-factor', String(Math.min(1.6,Math.abs(state.vx)/walkSpeed)));
    const doors=state.zone==='hachinosu'?[{type:'exit',x:1010}]:[{type:'home',x:151},{type:'hachinosu',x:520},{type:'characters',x:1435},{type:'fruits',x:C.roomWidth-270}];
    const nearest=doors.reduce((a,b)=>Math.abs(state.x-a.x)<Math.abs(state.x-b.x)?a:b);
    state.doorNear=Math.abs(state.x-nearest.x)<114 && Math.abs(state.y-floorY)<110;
    state.doorType=state.doorNear?nearest.type:null;
    doorHint.classList.toggle('hidden',!state.doorNear || OP.doorPuzzle.isOpen());
    if(state.doorNear) {
      const broken=OP.doorPuzzle.isBroken(nearest.type);
      const titles={home:'MUNDO PRINCIPAL',characters:'ISLAS Y PERSONAJES',fruits:'FRUTAS DEL DIABLO',hachinosu:'IR A HACHINOSU',exit:'VOLVER AL LOBBY'};
      U.byId('room-door-title').textContent=titles[nearest.type];
      U.byId('room-door-hint-caption').textContent=broken?'⚒ ¡FRANKY! BARCO AVERIADO':nearest.type==='home'?'🏠 REGRESA AL STICKMAN BLANCO':nearest.type==='hachinosu'?'☠ GOING MERRY · HACIA BARBANEGRA':nearest.type==='exit'?'⚓ ZARPA DE REGRESO':'⚓ BARCO LISTO PARA ZARPAR';
      U.byId('room-enter-button').textContent=broken?'E · RECONSTRUIR CON FRANKY':nearest.type==='home'?'E · MUNDO PRINCIPAL':nearest.type==='exit'?'E · VOLVER AL PUERTO':'E · SUBIR AL BARCO ↗';
    }
  }
  function enterDoor(){
    if(!state.doorNear)return;
    if(OP.doorPuzzle.isBroken(state.doorType)){OP.doorPuzzle.open(state.doorType);return;}
    if(state.doorType==='home'){stop(); window.location.assign('../index.html');return;}
    if(state.doorType==='exit'){leaveHachinosu();return;}
    if(state.doorType==='hachinosu'){enterHachinosu();return;}
    if(state.doorType==='characters')OP.ui.enterIslands();
    else OP.ui.enterAtlas();
  }
  function tick(ts) {
    // Programar el fotograma siguiente *antes* de las colisiones: una excepción
    // excepcional de una animación nunca deja los controles congelados para siempre.
    requestAnimationFrame(tick);
    const dt=Math.min(Math.max((ts-state.lastTime)/1000,0),.04);state.lastTime=ts;
    if (state.active && !OP.doorPuzzle.isOpen() && !OP.boss.overlayOpen()) {
      const inputX=Number(down('d','arrowright'))-Number(down('a','arrowleft'));
      const run=keys.has('shift'), desired=inputX*(run?sprintSpeed:walkSpeed);
      const accel=state.ground?1900:1050;
      const difference=desired-state.vx;
      state.vx += U.clamp(difference,-accel*dt,accel*dt);
      if(inputX) state.facing=inputX;
      if(state.jumpPressed && state.ground){state.vy=jumpSpeed;state.ground=false;}
      state.jumpPressed=false;
      const prevY=state.y;
      state.x=U.clamp(state.x+state.vx*dt,55,C.roomWidth-75);
      state.vy+=gravity*dt*(state.slamActive&&state.vy>0?1.9:1);
      state.y+=state.vy*dt;
      state.ground=false;
      if(state.vy>=0) {
        // No hay plataformas suspendidas: el único suelo jugable es el muelle.
        if(state.y>=floorY){
          state.y=floorY;state.vy=0;state.ground=true;
          if(state.slamActive){state.slamActive=false;OP.gear5.land({x:state.x,y:state.y});}
        }
      }
      const anim=!state.ground?(state.vy<0?'jump':'fall'):(Math.abs(state.vx)>65?(run?'run':'walk'):'idle');
      stateRender(anim);
      OP.roomAnimation.update({dt,x:state.x,y:state.y,vx:state.vx,vy:state.vy,grounded:state.ground,sprinting:run});
      OP.abilities.update(dt);
      OP.gear5.update(dt,state);
      OP.boss.update(dt,state);
      updateGear5Hud();
      const cameraTarget=U.clamp(state.x-viewport.clientWidth*.38,0,Math.max(0,C.roomWidth-viewport.clientWidth));
      state.camera+=(cameraTarget-state.camera)*(1-Math.exp(-7*dt));
      cameraLayer.style.transform=`translate3d(${-state.camera}px,0,0)`;
      U.byId('room-distance').textContent=state.zone==='hachinosu'?'☠ ENFRENTA A BARBANEGRA':Math.round((C.roomWidth-270-state.x)/20)+' m';
    }
  }
  function init() {
    player=U.byId('room-player');stage=U.byId('room-world');viewport=U.byId('room-viewport');
    cameraLayer=U.byId('room-camera');doorHint=U.byId('room-door-hint');
    OP.roomAnimation.init();
    document.addEventListener('keydown',keyDown);
    document.addEventListener('keyup',keyUp);
    window.addEventListener('blur',()=>keys.clear());
    document.querySelectorAll('[data-room-key]').forEach(el=>{
      const key=el.dataset.roomKey;
      const release=()=>{keys.delete(key);el.classList.remove('pressed');};
      el.addEventListener('pointerdown',e=>{e.preventDefault();keys.add(key);if(key==='w')state.jumpPressed=true;el.classList.add('pressed');el.setPointerCapture(e.pointerId);});
      el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);
      el.addEventListener('lostpointercapture',release);
    });
    U.byId('room-enter-button').addEventListener('click',enterDoor);
    U.byId('room-attack-button').addEventListener('click',fireAbility);
    U.byId('room-drum-button').addEventListener('click',fireDrum);
    state.lastTime=performance.now();requestAnimationFrame(tick);
  }
  OP.room={init,start,stop,refreshSkin,respawnNearBoss,pullToward,isHachinosu,isBusy,enterHachinosu,leaveHachinosu,
    inspect:()=>({active:state.active,zone:state.zone,x:state.x,y:state.y,doorType:state.doorType})};
})();
