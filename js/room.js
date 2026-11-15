/* Sala lateral con cámara, gravedad, salto y contacto con el suelo y las plataformas. */
(function () {
  'use strict';
  const OP = window.OP, U = OP.util, C = OP.config;
  const keys = new Set();
  const state = { active:false, x:220, y:0, vx:0, vy:0, ground:true, facing:1,
    lastTime:0, camera:0, character:'luffy', jumpPressed:false, doorNear:false, doorType:null };
  const worldH = 560;
  const playerHeight = 190;
  const gravity = 1450, jumpSpeed = -610, walkSpeed = 255, sprintSpeed = 370;
  const floorY = 446;
  const platforms = [
    { x:680, w:180, y:345 }, { x:1150, w:185, y:322 },
    { x:1640, w:195, y:340 }, { x:2180, w:170, y:342 }
  ];
  let player, stage, viewport, cameraLayer, doorHint;
  const down = (...tests) => tests.some(k=>keys.has(k));
  const typing = el=>el && (el.matches('input, textarea, select')||el.isContentEditable);
  function keyDown(e) {
    if (!state.active || typing(e.target)) return;
    const k=e.key.toLowerCase();
    if (['a','d','w','s','arrowleft','arrowright','arrowup',' ','shift','e','f'].includes(k)) e.preventDefault();
    if (OP.doorPuzzle.isOpen()) { if(k === 'escape') OP.doorPuzzle.close(); return; }
    if (k === 'f' && !e.repeat) { fireAbility(); return; }
    if (k === 'e' && !e.repeat && state.doorNear) { enterDoor(); return; }
    if ((k==='w'||k==='arrowup'||k===' ')&&!e.repeat) state.jumpPressed=true;
    keys.add(k);
  }
  function keyUp(e) { keys.delete(e.key.toLowerCase()); }
  function setCharacter(name) {
    player.dataset.character=name;
    ['body','leg-left','leg-right','arm-left','arm-right'].forEach(part=>{
      player.querySelector(`[data-rig="${part}"]`).src=`assets/${name}-${part}.png`;
    });
  }
  function start(character, nearDoor=false) {
    // nearDoor puede ser 'characters' al regresar de una isla.
    state.active=true; state.x=nearDoor==='characters' ? 1260 : nearDoor ? C.roomWidth-390 : 230; state.y=floorY; state.vx=0; state.vy=0;
    state.ground=true;state.doorNear=false;state.doorType=null;state.camera=0;state.character=character;
    state.lastTime=performance.now();state.facing=1;keys.clear();setCharacter(character);
    stage.style.width=C.roomWidth+'px';
    OP.roomAnimation.reset();
    OP.abilities.reset();
    stateRender('idle');
  }
  function stop() { state.active=false; keys.clear(); OP.abilities.reset(); }
  function fireAbility(){
    if(!state.active || OP.doorPuzzle.isOpen()) return;
    OP.abilities.fire({x:state.x,y:state.y,facing:state.facing,character:state.character});
  }
  function stateRender(anim) {
    const nextClass='room-player rig-'+anim;
    if(player.className !== nextClass) player.className=nextClass;
    player.style.left=state.x+'px';player.style.top=(state.y-playerHeight)+'px';
    player.style.setProperty('--face', String(state.facing));
    player.style.setProperty('--speed-factor', String(Math.min(1.6,Math.abs(state.vx)/walkSpeed)));
    const doors=[{type:'characters',x:1435},{type:'fruits',x:C.roomWidth-270}];
    const nearest=doors.reduce((a,b)=>Math.abs(state.x-a.x)<Math.abs(state.x-b.x)?a:b);
    state.doorNear=Math.abs(state.x-nearest.x)<114 && Math.abs(state.y-floorY)<110;
    state.doorType=state.doorNear?nearest.type:null;
    doorHint.classList.toggle('hidden',!state.doorNear || OP.doorPuzzle.isOpen());
    if(state.doorNear) {
      const broken=OP.doorPuzzle.isBroken(nearest.type);
      U.byId('room-door-title').textContent=nearest.type==='characters'?'ISLAS Y PERSONAJES':'FRUTAS DEL DIABLO';
      U.byId('room-door-hint-caption').textContent=broken?'✦ EL PORTAL ESTÁ DESTRUIDO':'✦ PUERTA DESCUBIERTA';
      U.byId('room-enter-button').textContent=broken?'E · RECONSTRUIR PUERTA':'E · ENTRAR POR LA PUERTA ↗';
    }
  }
  function enterDoor(){
    if(!state.doorNear)return;
    if(OP.doorPuzzle.isBroken(state.doorType)){OP.doorPuzzle.open(state.doorType);return;}
    if(state.doorType==='characters')OP.ui.enterIslands();
    else OP.ui.enterAtlas();
  }
  function tick(ts) {
    const dt=Math.min(Math.max((ts-state.lastTime)/1000,0),.04);state.lastTime=ts;
    if (state.active && !OP.doorPuzzle.isOpen()) {
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
      state.vy+=gravity*dt;
      state.y+=state.vy*dt;
      state.ground=false;
      if(state.vy>=0) {
        let landing=floorY;
        for (const p of platforms) {
          if(state.x>p.x+15&&state.x<p.x+p.w-15&&prevY<=p.y+4&&state.y>=p.y) landing=Math.min(landing,p.y);
        }
        if(state.y>=landing){state.y=landing;state.vy=0;state.ground=true;}
      }
      const anim=!state.ground?(state.vy<0?'jump':'fall'):(Math.abs(state.vx)>65?(run?'run':'walk'):'idle');
      stateRender(anim);
      OP.roomAnimation.update({dt,x:state.x,y:state.y,vx:state.vx,vy:state.vy,grounded:state.ground,sprinting:run});
      OP.abilities.update(dt);
      const cameraTarget=U.clamp(state.x-viewport.clientWidth*.38,0,Math.max(0,C.roomWidth-viewport.clientWidth));
      state.camera+=(cameraTarget-state.camera)*(1-Math.exp(-7*dt));
      cameraLayer.style.transform=`translate3d(${-state.camera}px,0,0)`;
      U.byId('room-distance').textContent=Math.round((C.roomWidth-270-state.x)/20)+' m';
    }
    requestAnimationFrame(tick);
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
    state.lastTime=performance.now();requestAnimationFrame(tick);
  }
  OP.room={init,start,stop};
})();
