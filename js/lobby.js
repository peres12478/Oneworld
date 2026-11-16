/*
 * Escenario principal (separado del videojuego One Piece).
 * Sin framework de juego, sin backend: HTML/CSS/JavaScript + Tailwind por CDN.
 */
(function(){
 'use strict';
 const C = window.MAIN_LOBBY_CONFIG;
 if(!C) { console.error('Falta js/lobby-config.js'); return; }
 const stage=document.getElementById('hub-stage');
 const world=document.getElementById('hub-world');
 const player=document.getElementById('hub-stickman');
 const shadow=document.getElementById('hub-player-shadow');
 const zone=document.getElementById('one-piece-door-zone');
 const portal=document.getElementById('one-piece-portal');
 const dbZone=document.getElementById('dragon-ball-door-zone');
 const dbPortal=document.getElementById('dragon-ball-portal');
 const promptTitle=document.getElementById('portal-prompt-title');
 const promptDescription=document.getElementById('portal-prompt-description');
 const transitionEmblem=document.getElementById('transition-emblem');
 const transitionTitle=document.getElementById('transition-title');
 const prompt=document.getElementById('portal-prompt');
 const promptEnter=document.getElementById('prompt-enter');
 const mobileEnter=document.getElementById('mobile-enter');
 const transition=document.getElementById('enter-transition');
 const title=document.getElementById('hub-title');
 if(C.title) title.textContent=C.title;
 if(C.browserTitle) document.title=C.browserTitle;
 document.documentElement.style.setProperty('--stage-width',C.worldWidth+'px');
 zone.style.left=C.doorX+'px';
 dbZone.style.left=C.dragonDoorX+'px';
 const doors=[
  {id:'one-piece',x:C.doorX,zone,button:portal,href:C.worldOnePiece,title:'ONE PIECE',description:'El mundo pirata te espera',transition:'RUMBO A LA GRAND LINE...',emblem:'assets/sombrero-paja-emblema.svg'},
  {id:'dragon-ball',x:C.dragonDoorX,zone:dbZone,button:dbPortal,href:C.worldDragonBall,title:'DRAGON BALL',description:'¡El desafío de Freezer te espera!',transition:'¡RUMBO AL PLANETA NAMEK!',emblem:'assets/esfera-dragon-4.svg'}
 ];
 const keys=new Set();
 const state={x:C.startX,y:0,vy:0,facing:1,camera:0,onGround:true,entering:false,near:false,nearWorld:null,last:0};
 const PLAYER_RADIUS=28;
 const MIN_X=PLAYER_RADIUS,MAX_X=C.worldWidth-PLAYER_RADIUS;
 const MOVE_SPEED=250, RUN_SPEED=390, JUMP_SPEED=700, GRAVITY=1750;
 const NEAR_DISTANCE=165;
 function normalizeKey(key){
   const k=String(key).toLowerCase();
   return k==='arrowleft'?'a':k==='arrowright'?'d':k==='arrowup'||k===' '?'w':k;
 }
 function isTyping(){
   const el=document.activeElement;
   return Boolean(el&&(['INPUT','TEXTAREA','SELECT'].includes(el.tagName)||el.isContentEditable));
 }
 function jump(){
   if(state.entering||!state.onGround)return;
   state.onGround=false;state.vy=JUMP_SPEED;state.y=Math.max(1,state.y);
   player.classList.remove('landing');
 }
 function enterWorld(selected){
   if(state.entering||!selected)return;
   state.entering=true;
   keys.clear();
   transitionEmblem.src=selected.emblem;
   transitionTitle.textContent=selected.transition;
   transition.classList.add('show');
   transition.setAttribute('aria-hidden','false');
   window.setTimeout(()=>{window.location.assign(new URL(selected.href,document.baseURI).href);},430);
 }
 function enterNearest(){enterWorld(doors.find(door=>door.id===state.nearWorld));}
 doors.forEach(door=>door.button.addEventListener('click',()=>enterWorld(door)));
 promptEnter.addEventListener('click',enterNearest);
 mobileEnter.addEventListener('click',enterNearest);
 document.addEventListener('keydown',event=>{
   if(isTyping()||state.entering)return;
   const key=normalizeKey(event.key);
   if(['a','d','w','shift','e'].includes(key))event.preventDefault();
   if(key==='e'){if(!event.repeat)enterNearest();return;}
   if(key==='w'&&!event.repeat)jump();
   keys.add(key);
 });
 document.addEventListener('keyup',event=>keys.delete(normalizeKey(event.key)));
 window.addEventListener('blur',()=>keys.clear());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)keys.clear();});
 document.querySelectorAll('.mobile-movement [data-key]').forEach(button=>{
   const key=button.dataset.key;
   const down=event=>{
     event.preventDefault();if(state.entering)return;
     try{button.setPointerCapture(event.pointerId);}catch(e){}
     if(key==='w')jump();else keys.add(key);
   };
   const up=event=>{event.preventDefault();keys.delete(key);};
   button.addEventListener('pointerdown',down);
   button.addEventListener('pointerup',up);
   button.addEventListener('pointercancel',up);
   button.addEventListener('lostpointercapture',()=>keys.delete(key));
 });
 function update(dt){
   const left=keys.has('a'),right=keys.has('d');
   const direction=(right?1:0)-(left?1:0);
   const running=direction!==0&&keys.has('shift');
   if(direction){
     state.facing=direction;
     state.x=Math.max(MIN_X,Math.min(MAX_X,state.x+direction*(running?RUN_SPEED:MOVE_SPEED)*dt));
   }
   if(!state.onGround){
     state.y+=state.vy*dt;
     state.vy-=GRAVITY*dt;
     if(state.y<=0){
       state.y=0;state.vy=0;state.onGround=true;
       player.classList.add('landing');
       window.setTimeout(()=>player.classList.remove('landing'),260);
     }
   }
   player.classList.toggle('jumping',!state.onGround);
   player.classList.toggle('walking',Boolean(direction)&&state.onGround&&!running);
   player.classList.toggle('running',running&&state.onGround);
   const nearest=doors.filter(door=>Math.abs(state.x-door.x)<=NEAR_DISTANCE)
    .sort((a,b)=>Math.abs(state.x-a.x)-Math.abs(state.x-b.x))[0]||null;
   if(state.nearWorld!==(nearest?.id||null)){
     state.near=!!nearest;
     state.nearWorld=nearest?.id||null;
     doors.forEach(door=>door.zone.classList.toggle('is-near',door===nearest));
     prompt.classList.toggle('visible',!!nearest);
     prompt.setAttribute('aria-hidden',String(!nearest));
     if(nearest){promptTitle.textContent='ENTRAR A '+nearest.title;promptDescription.textContent=nearest.description;}
   }
   const w=stage.clientWidth;
   const cameraTarget=Math.max(0,Math.min(C.worldWidth-w,state.x-w*.45));
   state.camera+=(cameraTarget-state.camera)*Math.min(1,dt*9);
   player.style.left=state.x+'px';
   player.style.bottom='calc(var(--ground) - 3px + '+state.y+'px)';
   player.style.setProperty('--facing',state.facing);
   shadow.style.left=state.x+'px';
   shadow.style.opacity=String(Math.max(.2,1-state.y/260));
   shadow.style.transform='translateX(-50%) scale('+Math.max(.48,1-state.y/440)+')';
   world.style.transform='translate3d('+(-state.camera).toFixed(2)+'px,0,0)';
 }
 function frame(now){
   if(!state.last)state.last=now;
   const dt=Math.min(.04,Math.max(0,(now-state.last)/1000));
   state.last=now;
   if(!state.entering)update(dt);
   requestAnimationFrame(frame);
 }
 state.camera=Math.max(0,Math.min(C.worldWidth-stage.clientWidth,state.x-stage.clientWidth*.45));
 update(0);
 requestAnimationFrame(frame);
 // Solo datos de lectura para permitir pruebas de regresión sin alterar el juego.
 window.MAIN_HUB_DIAGNOSTIC={getState:()=>({...state,pressed:[...keys]}),enter:enterNearest,doors:doors.map(({id,x,href})=>({id,x,href}))};
})();
