/* Dragon Ball Explorer V2.20 — ilustraciones del usuario, rayo rosado y relámpagos de Freezer.
 * Todo se ejecuta en el navegador: API pública mediante fetch, sin backend local.
 */
(function () {
 'use strict';
 const $=id=>document.getElementById(id);
 const el={stage:$('db-stage'),world:$('db-world'),hero:$('hero'),heroImg:$('hero-sprite'),boss:$('boss'),bossImg:$('boss-sprite'),fx:$('fx-layer'),select:$('select-screen'),searchLayer:$('catalog-layer'),detailLayer:$('detail-layer'),detail:$('catalog-detail'),search:$('catalog-search'),owner:$('catalog-owner'),ownerBox:$('owner-filter-box'),cards:$('catalog-grid'),source:$('catalog-source'),apiState:$('api-status'),apiCounts:$('api-counts'),banner:$('battle-banner'),toast:$('mode-toast'),hud:$('battle-hud'),interact:$('interact-banner'),interactLabel:$('interact-label'),cinematic:$('cinematic'),beacons:$('explorer-beacons'),capsules:$('capsule-layer'),returnPod:$('explorer-return'),heading:$('scene-heading'),music:$('db-music'),loss:$('loss-message')};
 const H=Object.freeze({hub:3200,battle:2450,base:98,speed:260,run:408,gravity:1710,jump:738}), HP=[11,24,32], PODS=[{x:650,kind:'battle',name:'COMBATIR A FREEZER'},{x:1450,kind:'characters',name:'EXPLORAR PERSONAJES · API'},{x:2200,kind:'transformations',name:'EXPLORAR TRANSFORMACIONES · API'},{x:2850,kind:'home',name:'REGRESAR AL MUNDO INICIAL'}], FIGHTERS={goku:{name:'GOKU',special:'¡KAMEHAMEHA!'},vegeta:{name:'VEGETA',special:'¡MASENKO!'}};
 const keys=new Set(),shots=[],cache={characters:null,transformations:null};
 let mode='select',returnMode='hub',catalogKind='characters',camera=0,lastTime=0,epoch=0,near=null,nearestRecord=null,records=[],worldWidth=H.hub,musicEnabled=true,selectedCard=null,apiLoading=false;
 let deathBall=null; // Solo fases II y III: carga 3s, atracción y proyectil pesado.
 let pinkBeam=null, lightning=null; // Ataques nuevos con telegráficas visibles y limpieza por fase/derrota.
 let hero={name:'goku',x:350,y:0,vy:0,facing:1,hp:8,maxHp:8,invincible:0,ssj:false,lastKi:-10,lastSpecial:-12,temporary:false};
 let boss={x:1120,phase:0,hp:HP[0],lastShot:0,lastVolley:0,lastDeathBall:0,lastBeam:0,lastLightning:0,lastContact:0,majorRestUntil:0,stunnedUntil:0};
 let unlocked={goku:false,vegeta:false};
 const keyStorage='dragon-ball-explorer-ssj-v217';
 try{unlocked={...unlocked,...JSON.parse(sessionStorage.getItem(keyStorage)||'{}')};}catch(_){}
 const api=window.DRAGON_BALL_API, audio=window.DB_AUDIO;
 const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
 const normalize=api.normalize;
 const seconds=()=>performance.now()/1000;
 const text=(id,value)=>{$(id).textContent=String(value);};
 const make=(tag,cls,label)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(label!==undefined)node.textContent=String(label??'');return node;};
 const clear=node=>node.replaceChildren();
 const fromApi=(item)=>item.source!=='editorial';
 const image=(src,alt,klass)=>{const img=make('img',klass);img.alt=alt||'';img.loading='lazy';img.referrerPolicy='no-referrer'; if(typeof src==='string'&&(/^https:\/\//.test(src)||src.startsWith('assets/')))img.src=src;else img.src='assets/dragon-ball-star.svg';img.onerror=()=>{img.src='assets/dragon-ball-star.svg';img.onerror=null;};return img;};
 const gotoHome=()=>window.location.assign(new URL('../index.html',document.baseURI).href);
 function persist(){try{sessionStorage.setItem(keyStorage,JSON.stringify(unlocked));}catch(_){}}
 function note(message){el.toast.textContent=message;el.toast.classList.add('visible');clearTimeout(note.timer);note.timer=setTimeout(()=>el.toast.classList.remove('visible'),2600);}
 function shout(message){el.banner.textContent=message;el.banner.classList.add('show');clearTimeout(shout.timer);shout.timer=setTimeout(()=>el.banner.classList.remove('show'),2600);}
 function cinema(title,sub,caption){text('cinematic-title',title);text('cinematic-sub',sub);text('cinematic-caption',caption);el.cinematic.classList.add('show');clearTimeout(cinema.timer);cinema.timer=setTimeout(()=>el.cinematic.classList.remove('show'),1200);}
 function resetFx(){if(deathBall){deathBall.node.remove();deathBall=null;}if(pinkBeam){pinkBeam.node.remove();pinkBeam=null;}if(lightning){lightning.node.remove();lightning=null;}el.stage.classList.remove('beam-active','lightning-active');el.boss.classList.remove('charging-death-ball','charging-pink-beam');for(const s of shots)s.node.remove();shots.length=0;el.fx.replaceChildren();el.hero.classList.remove('hurt','casting','thinking');el.boss.classList.remove('hurt','attacking','phase-three');el.cinematic.classList.remove('show');el.banner.classList.remove('show');el.toast.classList.remove('visible');clearTimeout(shout.timer);clearTimeout(note.timer);}
 function updateRig(type,base){const avatar=type==='hero'?el.hero:el.boss;const img=type==='hero'?el.heroImg:el.bossImg;img.src='assets/'+base+'.png';avatar.querySelectorAll('[data-'+type+'-rig]').forEach(part=>{part.hidden=true;part.removeAttribute('src');});}
 function sprite(){updateRig('hero',hero.name+'-'+(hero.ssj?'ssj':'normal'));el.heroImg.alt=FIGHTERS[hero.name].name+(hero.ssj?' Super Saiyajin':'');el.hero.classList.toggle('ssj',hero.ssj);}
 function refreshSelection(){document.querySelectorAll('[data-unlock]').forEach(n=>n.textContent=unlocked[n.dataset.unlock]?'✓ Super Saiyajin conseguido':'Super Saiyajin por conquistar');}
 function setWidth(width){worldWidth=width;el.world.style.width=width+'px';camera=0;el.world.style.transform='translate3d(0px,0px,0px)';}
 function updateHud(){text('hero-name',FIGHTERS[hero.name].name);text('hero-form-label',hero.ssj?'SUPER SAIYAJIN':'NORMAL');text('hero-health-text',hero.hp+'/'+hero.maxHp);$('hero-health').style.width=(100*hero.hp/hero.maxHp)+'%';text('boss-name','FREEZER · FASE '+['I','II','III'][boss.phase]);text('boss-stage-label',(boss.phase+1)+' / 3');text('boss-health-text',boss.hp+'/'+HP[boss.phase]);$('boss-health').style.width=(100*boss.hp/HP[boss.phase])+'%';text('boss-hint',boss.phase===2?'VULNERABLE SOLO ANTE SUPER SAIYAJIN':'EMPERADOR DEL MAL');text('power-hint',hero.ssj?'F · KI SUPERIOR':'F · KI');
   const able=hero.temporary||unlocked[hero.name];text('skill-status',mode==='battle'?(able?(hero.ssj?'T · Desactivar / G · '+FIGHTERS[hero.name].special:'T · Activar Super Saiyajin'):'F · Ki / Super Saiyajin en fase II'):mode==='explore'?'Q · Buscador / E · Ficha':'E · Entrar en cápsula');}
 function controlsPaused(){return !el.searchLayer.hidden||!el.detailLayer.hidden;}
 function setScene(next){mode=next;keys.clear();near=null;nearestRecord=null;el.interact.classList.remove('visible');el.stage.classList.remove('mode-hub','mode-battle','mode-explore');el.stage.classList.add('mode-'+next);el.capsules.hidden=next!=='hub';el.returnPod.hidden=next!=='explore';el.beacons.hidden=next!=='explore';el.boss.hidden=next!=='battle';el.hud.hidden=next!=='battle';$('switch-fighter').disabled=next==='battle';
   text('location-label',next==='hub'?'PUERTO DE NAMEK':next==='battle'?'ARENA DE FREEZER':catalogKind==='characters'?'MUNDO DE PERSONAJES':'MUNDO DE TRANSFORMACIONES');
   text('scene-hint',next==='hub'?'Tres cápsulas para viajar; E para entrar.':next==='battle'?'F dispara Ki · W salta · T transforma · G ataque especial.':'Explora con A/D · E ficha · Q buscar · cápsula izquierda para volver.');
   el.heading.textContent=next==='hub'?'PUERTO DE NAMEK · 3 CÁPSULAS SAIYAJIN':next==='battle'?'COMBATE CONTRA FREEZER · PLANETA NAMEK':catalogKind==='characters'?'DATOS REALES · PERSONAJES · DRAGON BALL API':'DATOS REALES · TRANSFORMACIONES · DRAGON BALL API';
   text('game-info',next==='hub'?'Exploración libre':next==='battle'?'¡Batalla en Namek!':next==='explore'?'Consulta API en el mapa':'Elige guerrero');updateHud();}
 function select(name){hero.name=name;hero.ssj=false;hero.temporary=!!unlocked[name];el.select.hidden=true;el.loss.hidden=true;el.hero.hidden=false;sprite();audio?.start?.();enterHub(true);verifyAPI();}
 function enterHub(initial=false){epoch++;resetFx();hero.x=initial?340:350;hero.y=0;hero.vy=0;hero.facing=1;hero.hp=8;hero.invincible=0;hero.temporary=!!unlocked[hero.name];if(!unlocked[hero.name])hero.ssj=false;sprite();setWidth(H.hub);setScene('hub');el.select.hidden=true;el.hero.hidden=false;audio?.hub?.();render();if(!initial)note('Puerto de Namek: puedes volver a entrar en la cápsula.');}
 function fight(){epoch++;resetFx();setWidth(H.battle);hero.x=400;hero.y=0;hero.vy=0;hero.facing=1;hero.hp=8;hero.invincible=0;hero.temporary=!!unlocked[hero.name];if(!unlocked[hero.name])hero.ssj=false;sprite();boss={x:1130,phase:0,hp:HP[0],lastShot:seconds()+1.5,lastVolley:seconds(),lastDeathBall:seconds(),lastBeam:seconds()-7.4,lastLightning:seconds()-8.5,lastContact:0,majorRestUntil:seconds()+2,stunnedUntil:0};updateRig('boss','freezer-forma-1');el.bossImg.alt='Freezer primera forma, con cuernos';setScene('battle');audio?.effect?.('enter');audio?.fight?.();shout('¡FREEZER TE DESAFÍA EN NAMEK!');render();}
 function endFight(victory){if(mode!=='battle')return;const ownEpoch=++epoch;resetFx();mode='ending';keys.clear();if(victory){unlocked[hero.name]=true;persist();hero.temporary=true;refreshSelection();audio?.effect?.('win');cinema('¡VICTORIA!','SUPER SAIYAJIN PERMANENTE',FIGHTERS[hero.name].name+' VENCE A FREEZER');}else{audio?.effect?.('lose');cinema('¡JA, JA, JA!','FREEZER TE DERROTÓ','VUELVE A LA CÁPSULA PARA INTENTARLO');}
   setTimeout(()=>{if(epoch!==ownEpoch)return;enterHub();shout(victory?'¡SUPER SAIYAJIN DESBLOQUEADO!':'¡HAS PERDIDO! FREEZER TE ESPERA EN SU ARENA.');},victory?1850:1450);
 }
 function nextPhase(){if(boss.phase===2){endFight(true);return;}boss.phase++;boss.hp=HP[boss.phase];resetFx();boss.lastShot=seconds()+1.25;boss.lastVolley=seconds();boss.lastDeathBall=seconds()-7.5;boss.lastBeam=seconds()-(boss.phase===1?6.9:5.9);boss.lastLightning=seconds()-(boss.phase===1?7.0:6.5);boss.majorRestUntil=seconds()+1.75;updateRig('boss','freezer-forma-'+(boss.phase+1));el.bossImg.alt=['','Freezer, forma monstruosa con cabeza alargada','Freezer, forma final lisa de Namek'][boss.phase];el.boss.classList.toggle('phase-three',boss.phase===2);audio?.effect?.('transformEnemy');
   if(boss.phase===1){hero.temporary=true;shout('¡FASE II! ¡YA PUEDES TRANSFORMARTE!');note('Pulsa T para activar Super Saiyajin provisional.');}
   else{shout('¡FREEZER FINAL! ¡NECESITAS SUPER SAIYAJIN!');note('Transforma tu personaje con T antes del último combate.');}updateHud();}
 function shock(x,y,color){const n=make('i','impact-effect');n.style.left=x+'px';n.style.bottom=(H.base+y)+'px';if(color)n.style.borderColor=color;el.fx.appendChild(n);setTimeout(()=>n.remove(),380);}
 function damageBoss(power){if(mode!=='battle')return;if(boss.phase===2&&!hero.ssj){note('¡Freezer final solo recibe golpes de un Super Saiyajin!');return;}boss.hp=Math.max(0,boss.hp-power);el.boss.classList.add('hurt');setTimeout(()=>el.boss.classList.remove('hurt'),180);shock(boss.x,112);audio?.effect?.('hit');if(boss.hp<=0)nextPhase();else updateHud();}
 function damageHero(power=1){if(mode!=='battle'||seconds()<hero.invincible)return;hero.hp=Math.max(0,hero.hp-power);hero.invincible=seconds()+.85;el.hero.classList.add('hurt');setTimeout(()=>el.hero.classList.remove('hurt'),460);audio?.effect?.('hurt');updateHud();if(hero.hp<=0)endFight(false);}
 function shot(owner,kind='ki'){if(mode!=='battle')return;const now=seconds();if(owner==='hero'&&now-hero.lastKi<(hero.ssj?.22:.37))return;if(owner==='hero')hero.lastKi=now;
   const face=owner==='hero'?hero.facing:Math.sign(hero.x-boss.x)||-1;
   spawn(owner,owner==='hero'?hero.x+face*55:boss.x+face*48,owner==='hero'?hero.y+112:105,face,owner==='hero'?(hero.ssj?850:710):530,owner==='hero'?(hero.ssj?2:1):1,kind);audio?.effect?.(owner==='hero'?'ki':'enemyKi');
   if(owner==='boss'){el.boss.classList.add('attacking');setTimeout(()=>el.boss.classList.remove('attacking'),260);}}
 function spawn(owner,x,y,face,speed,power,kind){const n=make('span','projectile '+(owner==='boss'?'enemy ':hero.ssj?'ssj-shot ':'')+(kind==='beam'?'beam '+(hero.name==='vegeta'?'vegeta-beam':''):kind==='deathball'?'death-ball-shot':''));el.fx.appendChild(n);shots.push({node:n,owner,x,y,velocity:speed*face,power,kind,born:seconds()});}
 function special(){if(mode!=='battle'||!hero.ssj)return note('Necesitas Super Saiyajin para utilizar G.');const t=seconds();if(t-hero.lastSpecial<10)return note('Especial recargándose: '+Math.ceil(10-(t-hero.lastSpecial))+' s');hero.lastSpecial=t;cinema(FIGHTERS[hero.name].special,'¡ATAQUE DEFINITIVO!',hero.name==='goku'?'¡KAME... HAME... HAAAA!':'¡MASENKOOOO!');spawn('hero',hero.x+hero.facing*80,hero.y+115,hero.facing,920,4,'beam');audio?.effect?.('beam');}
 function transform(){if(!['battle','hub','explore'].includes(mode))return;if(!hero.temporary&&!unlocked[hero.name])return note('Super Saiyajin se activa en la fase II de Freezer.');hero.ssj=!hero.ssj;sprite();updateHud();audio?.effect?.(hero.ssj?'ssj':'transformOff');if(hero.ssj){shout('¡¡SUPER SAIYAJIN!!');el.hero.classList.add('transforming');setTimeout(()=>el.hero.classList.remove('transforming'),1100);}else note('Forma normal');}
 function jump(){if(hero.y>0||hero.vy||!['hub','battle','explore'].includes(mode)||controlsPaused())return;hero.vy=H.jump;hero.y=.1;audio?.effect?.('jump');}
 // La esfera no aparece en la fase I. En las otras fases la preparación dura 3s,
 // atrae al jugador y después lanza una bola que quita 3/8 puntos de vida.
 function beginDeathBall(t){
   if(mode!=='battle'||boss.phase===0||deathBall)return;
   const face=Math.sign(hero.x-boss.x)||-1, node=make('div','death-ball-charge');
   const orb=make('span','death-ball-orb'), timer=make('span','death-ball-countdown','3.0 s');
   node.append(orb,timer);el.fx.appendChild(node);
   deathBall={node,started:t,face,phase:boss.phase,session:epoch};
   boss.lastDeathBall=t;el.boss.classList.add('charging-death-ball');
   shout('¡ESFERA GIGANTE!');
   note('¡Cuidado! La esfera te atrae durante 3 segundos. Corre y salta para esquivarla.');
   audio?.effect?.('deathBallCharge');
 }
 function updateDeathBall(t,dt){
   if(!deathBall)return;
   const attack=deathBall;
   if(mode!=='battle'||attack.session!==epoch||attack.phase!==boss.phase){
     attack.node.remove();deathBall=null;el.boss.classList.remove('charging-death-ball');return;
   }
   const elapsed=Math.max(0,t-attack.started),progress=clamp(elapsed/3,0,1);
   attack.node.style.left=(boss.x+attack.face*78)+'px';
   attack.node.style.bottom=(H.base+175)+'px';
   attack.node.style.setProperty('--growth',(.28+progress*.95).toFixed(3));
   attack.node.querySelector('.death-ball-countdown').textContent=Math.max(0,3-elapsed).toFixed(1)+' s';
   if(progress<1){
     // La atracción se limita a la arena y sigue siendo contrarrestable corriendo.
     const dx=boss.x-hero.x,dist=Math.abs(dx);
     if(dist>108&&dist<1200){
       const strength=105+progress*105;
       hero.x=clamp(hero.x+Math.sign(dx)*strength*dt,55,worldWidth-70);
     }
     // El núcleo también atrae ataques de Ki cercanos (efecto de gravedad).
     const coreX=boss.x+attack.face*78;
     for(let i=shots.length-1;i>=0;i--){
       const projectile=shots[i];
       if(projectile.kind==='deathball')continue;
       const offset=coreX-projectile.x;
       if(Math.abs(offset)>300)continue;
       projectile.x+=Math.sign(offset)*Math.min(Math.abs(offset),190*dt);
       if(Math.abs(offset)<32){projectile.node.remove();shots.splice(i,1);}
     }
     return;
   }
   attack.node.remove();deathBall=null;el.boss.classList.remove('charging-death-ball');
   const face=Math.sign(hero.x-boss.x)||attack.face;
   spawn('boss',boss.x+face*125,150,face,boss.phase===2?425:350,3,'deathball');
   audio?.effect?.('deathBallLaunch');
   shout('¡¡ESFERA DE LA MUERTE!!');
 }
 // Rayo rosa horizontal en TODAS las fases. Un aviso de 1.4 segundos
 // permite saltar antes de la descarga; el impacto dura menos que un salto.
 function startPinkBeam(t){
   if(mode!=='battle'||pinkBeam||deathBall||lightning)return;
   const face=Math.sign(hero.x-boss.x)||-1;
   const node=make('div','pink-beam-attack warning');
   node.dataset.facing=face<0?'left':'right';
   node.append(make('span','beam-glow'),make('span','beam-warning-label','¡SALTA!'));
   const origin=boss.x+face*70;
   node.style.left=(face<0?0:origin)+'px';
   node.style.width=Math.max(100,face<0?origin:worldWidth-origin)+'px';
   node.style.bottom=(H.base+66)+'px';
   el.fx.appendChild(node);
   pinkBeam={node,face,origin,phase:boss.phase,session:epoch,started:t,active:false,hit:false};
   boss.lastBeam=t;
   el.boss.classList.add('charging-pink-beam');
   shout('¡FREEZER PREPARA EL RAYO ROSADO!');
   note('¡SALTA! El rayo recorre el suelo tras la advertencia.');
   audio?.effect?.('pinkBeamCharge');
 }
 function updatePinkBeam(t){
   const a=pinkBeam;if(!a)return;
   if(mode!=='battle'||epoch!==a.session||boss.phase!==a.phase){a.node.remove();pinkBeam=null;el.boss.classList.remove('charging-pink-beam');el.stage.classList.remove('beam-active');return;}
   const elapsed=t-a.started;
   if(elapsed>=1.38&&!a.active){
     a.active=true;a.node.classList.remove('warning');a.node.classList.add('firing');
     el.stage.classList.add('beam-active');el.boss.classList.remove('charging-pink-beam');
     audio?.effect?.('pinkBeamFire');shout('¡¡RAYO DE LA MUERTE!!');
   }
   if(a.active&&elapsed<1.75){
     const inPath=a.face<0?hero.x<a.origin:hero.x>a.origin;
     // Un salto despeja el haz bajo: más de 94px sobre el suelo es seguro.
     if(!a.hit&&inPath&&hero.y<94){a.hit=true;shock(hero.x,112,'#ff70df');damageHero(boss.phase===2?3:2);}
   }
   if(elapsed>=1.75){a.node.remove();pinkBeam=null;el.stage.classList.remove('beam-active');boss.majorRestUntil=t+1.0;}
 }
 // Descarga dirigida: una marca en el suelo avisa dónde caerá el rayo.
 // Se puede evitar moviéndose fuera de la marca o saltando a tiempo.
 function startLightning(t){
   if(mode!=='battle'||lightning||pinkBeam||deathBall)return;
   const x=clamp(hero.x,110,worldWidth-110),node=make('div','freezer-lightning warning');
   node.append(make('span','lightning-bolt'),make('span','lightning-ground'),make('span','lightning-label','⚡ ¡CUIDADO!'));
   node.style.left=x+'px';node.style.bottom=(H.base+2)+'px';
   el.fx.appendChild(node);
   lightning={node,x,started:t,phase:boss.phase,session:epoch,active:false,hit:false};
   boss.lastLightning=t;
   shout('¡RAYOS EN NAMEK!');audio?.effect?.('lightningWarn');
 }
 function updateLightning(t){
   const a=lightning;if(!a)return;
   if(mode!=='battle'||epoch!==a.session||a.phase!==boss.phase){a.node.remove();lightning=null;el.stage.classList.remove('lightning-active');return;}
   const elapsed=t-a.started;
   if(elapsed>=1.07&&!a.active){a.active=true;a.node.classList.remove('warning');a.node.classList.add('firing');el.stage.classList.add('lightning-active');audio?.effect?.('lightningStrike');}
   if(a.active&&elapsed<1.54&&Math.abs(hero.x-a.x)<104&&hero.y<108&&!a.hit){a.hit=true;shock(hero.x,78,'#bdc8ff');damageHero(2);}
   if(elapsed>=1.54){a.node.remove();lightning=null;el.stage.classList.remove('lightning-active');boss.majorRestUntil=t+.7;}
 }
 // Si te quedas junto al enemigo, una onda de energía del suelo te hiere.
 // Elevarte con W o Espacio evita el contacto.
 function contactShock(t){
   if(Math.abs(hero.x-boss.x)>139||hero.y>=108||t-boss.lastContact<1.55)return;
   boss.lastContact=t;
   hero.x=clamp(hero.x+(hero.x<boss.x?-50:50),55,worldWidth-70);
   shock(hero.x,57,'#ff97f0');audio?.effect?.('contactShock');damageHero(1);
 }
 function bossAI(t,dt){
   if(mode!=='battle')return;
   // Resolver siempre el efecto activo aunque el jugador se aleje: evita congelarlo.
   if(pinkBeam){updatePinkBeam(t);return;}
   if(lightning){updateLightning(t);return;}
   if(deathBall){updateDeathBall(t,dt);return;}
   if(Math.abs(hero.x-boss.x)>980||t<boss.stunnedUntil)return;
   contactShock(t);
   if(mode!=='battle')return;
   if(t>boss.majorRestUntil){
     if(t-boss.lastBeam>[10.7,8.6,7.4][boss.phase]){startPinkBeam(t);return;}
     if(t-boss.lastLightning>[13.2,10.7,8.5][boss.phase]){startLightning(t);return;}
     if(boss.phase>0&&t-boss.lastDeathBall>(boss.phase===1?11.5:10)){beginDeathBall(t);return;}
   }
   const cadence=[2.05,1.45,.87][boss.phase];
   if(t-boss.lastShot>cadence){boss.lastShot=t;shot('boss');}
   if(boss.phase>0&&t-boss.lastVolley>(boss.phase===1?6.5:4.4)){
     boss.lastVolley=t;const saved=epoch;
     for(let i=0;i<2+boss.phase;i++)setTimeout(()=>{
       if(mode==='battle'&&saved===epoch&&!deathBall&&!pinkBeam&&!lightning)
         spawn('boss',boss.x+(Math.sign(hero.x-boss.x)||-1)*50,65+i*40,Math.sign(hero.x-boss.x)||-1,475+i*60,1,'ki');
     },i*240);
   }
 }
 function moveShots(dt){for(let i=shots.length-1;i>=0;i--){
   const s=shots[i];s.x+=s.velocity*dt;s.node.style.left=s.x+'px';s.node.style.bottom=(H.base+s.y)+'px';
   const heavy=s.kind==='deathball';
   const hit=s.owner==='hero'
     ?Math.abs(s.x-boss.x)<(s.kind==='beam'?110:60)&&Math.abs(s.y-110)<110
     :Math.abs(s.x-hero.x)<(heavy?91:54)&&Math.abs(s.y-(hero.y+104))<(heavy?96:65);
   if(hit&&mode==='battle'){
     if(s.owner==='hero')damageBoss(s.power);
     else{
       if(heavy){hero.x=clamp(hero.x+Math.sign(s.velocity)*110,55,worldWidth-70);shock(hero.x,hero.y+120,'#f682fd');audio?.effect?.('deathBallHit');}
       damageHero(s.power);
     }
     s.node.remove();shots.splice(i,1);continue;
   }
   if(s.x<-100||s.x>worldWidth+100||seconds()-s.born>4.6){s.node.remove();shots.splice(i,1);}
 }}
 function startExplorer(kind){epoch++;resetFx();catalogKind=kind;setScene('explore');setWidth(1100);hero.x=360;hero.y=0;hero.vy=0;el.beacons.replaceChildren();records=[];el.returnPod.hidden=false;el.hero.classList.remove('thinking');returnMode='explore';text('catalog-title',kind==='characters'?'BUSCAR PERSONAJES':'BUSCAR TRANSFORMACIONES');el.ownerBox.hidden=kind==='characters';
   if(cache[kind])buildMap(cache[kind]);else {el.heading.textContent='CONECTANDO CON DRAGON BALL API...';note('Cargando '+(kind==='characters'?'personajes':'transformaciones')+' directamente desde la API...');fetchCatalog(kind).then(result=>{if(mode==='explore'&&catalogKind===kind)buildMap(result);}).catch(()=>{if(mode==='explore')note('No se pudo conectar a la API. Pulsa el botón ↻ API para reintentar.');});}}
 function buildMap(result){el.owner.replaceChildren();const defaultOwner=make('option',null,'Todos los personajes');defaultOwner.value='';el.owner.appendChild(defaultOwner);if(catalogKind==='transformations'){for(const owner of [...new Set(result.items.map(x=>x.owner||'No identificado'))].sort()){const option=make('option',null,owner);option.value=owner;el.owner.appendChild(option);}}records=result.items.map((item,index)=>({...item,_mapX:360+index*200,_idx:index}));setWidth(Math.max(1300,560+records.length*200));el.beacons.replaceChildren();for(const item of records){const b=make('div','explorer-beacon');b.style.left=item._mapX+'px';b.dataset.index=item._idx;const art=image(item.image,item.name,'beacon-avatar');b.appendChild(art);b.appendChild(make('strong','beacon-title',item.name));b.appendChild(make('small','beacon-meta',catalogKind==='characters'?(item.race||'PERSONAJE · API'):(item.owner||'TRANSFORMACIÓN')));if(!fromApi(item))b.appendChild(make('span','editorial-label','FICHA LOCAL'));b.addEventListener('click',()=>{hero.x=item._mapX;showDetail(item);});el.beacons.appendChild(b);}el.heading.textContent=(catalogKind==='characters'?'EXPLORADOR DE PERSONAJES':'EXPLORADOR DE TRANSFORMACIONES')+' · '+records.length+' FICHAS';note(records.length+' fichas visibles · camina y pulsa E para inspeccionar; Q para buscar.');text('scene-hint',records.length+' registros en mapa · E inspeccionar · Q buscar');}
 function interact(){if(!['hub','explore'].includes(mode)||controlsPaused())return;if(mode==='hub'){if(!near)return;if(near.kind==='home')return gotoHome();if(near.kind==='battle')return fight();return startExplorer(near.kind);}if(hero.x<235)return enterHub();if(nearestRecord)return showDetail(nearestRecord);}
 function mapSearch(){if(mode!=='explore'||!el.detailLayer.hidden)return;el.searchLayer.hidden=false;el.hero.classList.add('thinking');keys.clear();el.search.value='';el.ownerBox.hidden=catalogKind==='characters';filterSearch();el.search.focus({preventScroll:true});}
 function closeSearch(){el.searchLayer.hidden=true;el.hero.classList.remove('thinking');keys.clear();el.stage.focus({preventScroll:true});}
 function closeDetail(){el.detailLayer.hidden=true;el.hero.classList.remove('thinking');keys.clear();el.stage.focus({preventScroll:true});}
 function filterSearch(){const q=normalize(el.search.value),owner=el.owner.value;const found=records.filter(it=>(!q||normalize([it.name,it.owner,it.race,it.description].join(' ')).includes(q))&&(!owner||it.owner===owner));el.cards.replaceChildren();text('catalog-count',`${found.length} de ${records.length} registros`);if(!records.length){text('catalog-state','No hay datos de la API. Comprueba la conexión y pulsa ↻ API.');return;}text('catalog-state','Selecciona una ficha para desplazarte hasta ella en el mapa.');for(const item of found){const b=make('button','catalog-card');b.type='button';b.appendChild(image(item.image,item.name,'card-img'));b.appendChild(make('strong',null,item.name));b.appendChild(make('small',null,fromApi(item)?'API Dragon Ball':'Ficha local identificada'));b.addEventListener('click',()=>{closeSearch();hero.x=item._mapX;hero.y=0;hero.vy=0;showDetail(item);});el.cards.appendChild(b);}}
 async function showDetail(item){selectedCard=item;el.detailLayer.hidden=false;el.hero.classList.add('thinking');keys.clear();el.detail.replaceChildren();const wrap=make('div','detail-flex');wrap.appendChild(image(item.image,item.name,'detail-img'));const body=make('div','db-detail-copy');body.appendChild(make('p','detail-source',fromApi(item)?'● REGISTRO DE DRAGON BALL API':'● FICHA EDITORIAL LOCAL · NO VIENE DE LA API'));body.appendChild(make('h3',null,item.name));const info=catalogKind==='characters'?`Raza: ${item.race||'—'} · Ki: ${item.ki||'—'} · Ki máximo: ${item.maxKi||'—'} · Afiliación: ${item.affiliation||'—'}`:`Portador: ${item.ownerSource==='pending'?'Pendiente de consultar la ficha individual de la API':item.owner||'Por confirmar'} · Ki: ${item.ki||'—'}`;const infoLine=make('p','detail-facts',info);body.appendChild(infoLine);body.appendChild(make('p','db-description',item.description||item.note||'Esta ficha no proporciona descripción adicional.'));wrap.appendChild(body);el.detail.appendChild(wrap);
   if(!fromApi(item)||!Number.isInteger(Number(item.id)))return;const extra=make('p','detail-facts','Consultando ficha individual de la API...');body.appendChild(extra);try{const remote=catalogKind==='characters'?await api.getCharacter(item.id):await api.getTransformation(item.id);if(selectedCard!==item||el.detailLayer.hidden)return;if(catalogKind==='characters'){extra.textContent='Planeta de origen: '+(remote.originPlanet?.name||'No disponible')+' · Transformaciones: '+(remote.transformations?.length??0);if(remote.transformations?.length)body.appendChild(make('p','detail-facts',remote.transformations.map(t=>t.name).join(' · ')));}else{if(remote.character?.name){item.owner=remote.character.name;item.ownerSource='api';infoLine.textContent=`Portador: ${item.owner} · Ki: ${item.ki||'—'}`;const visible=el.beacons.querySelector(`[data-index="${item._idx}"] .beacon-meta`);if(visible)visible.textContent=item.owner;}
     extra.textContent='Personaje asociado según API: '+(remote.character?.name||'No indicado en el registro');}}catch(_){extra.textContent='No fue posible obtener detalles adicionales; se muestran los datos del listado de API.';}}
 async function fetchCatalog(kind,force=false){if(cache[kind]&&!force)return cache[kind];const result=kind==='characters'?await api.loadCharacters():await api.loadTransformations();cache[kind]=result;return result;}
 async function verifyAPI(force=false){if(apiLoading)return;apiLoading=true;el.apiState.className='api-badge pending';el.apiState.textContent='◌ API: conectando...';const results=await Promise.allSettled(['characters','transformations'].map(k=>fetchCatalog(k,force)));const [a,b]=results;const good=results.filter(x=>x.status==='fulfilled').length;const countA=a.status==='fulfilled'?a.value.items.length:'ERROR';const countB=b.status==='fulfilled'?b.value.items.filter(x=>fromApi(x)).length:'ERROR';el.apiState.className='api-badge '+(good===2?'connected':good===1?'partial':'disconnected');el.apiState.textContent=good===2?'● API CONECTADA':good===1?'◐ API PARCIAL':'● API SIN CONEXIÓN';el.apiCounts.textContent=`Personajes ${countA} · Transformaciones ${countB} (API)`;el.apiState.title=good===2?'Ambos catálogos recibidos de la API':results.map((r,i)=>r.status==='rejected'?['Personajes','Transformaciones'][i]+': '+r.reason.message:'').filter(Boolean).join('; ');apiLoading=false;if(mode==='explore'&&cache[catalogKind])buildMap(cache[catalogKind]);}
 function render(){el.hero.style.left=hero.x+'px';el.hero.style.bottom='calc(var(--floor) - 8px + '+hero.y+'px)';el.hero.style.setProperty('--face',hero.facing);el.boss.style.left=boss.x+'px';el.boss.style.setProperty('--face',Math.sign(hero.x-boss.x)||-1);const width=el.stage.clientWidth;camera+=(clamp(hero.x-width*.38,0,Math.max(0,worldWidth-width))-camera)*.14;el.world.style.transform='translate3d('+(-camera).toFixed(1)+'px,0,0)';near=null;nearestRecord=null;if(mode==='hub'){near=PODS.filter(p=>Math.abs(hero.x-p.x)<160).sort((a,b)=>Math.abs(hero.x-a.x)-Math.abs(hero.x-b.x))[0]||null;}else if(mode==='explore'){if(hero.x<235)near={kind:'return',name:'VOLVER AL PUERTO'};nearestRecord=records.filter(r=>Math.abs(hero.x-r._mapX)<95).sort((a,b)=>Math.abs(hero.x-a._mapX)-Math.abs(hero.x-b._mapX))[0]||null;if(nearestRecord)near={kind:'record',name:'INSPECCIONAR · '+nearestRecord.name};}el.interact.classList.toggle('visible',!!near&&!controlsPaused());if(near)el.interactLabel.textContent=near.name;el.hero.classList.toggle('walking',keys.has('a')||keys.has('d'));el.hero.classList.toggle('running',keys.has('shift')&&(keys.has('a')||keys.has('d')));el.hero.classList.toggle('jumping',hero.y>0);}
 function frame(timestamp){if(!lastTime)lastTime=timestamp;const dt=clamp((timestamp-lastTime)/1000,0,.034);lastTime=timestamp;try{if(['hub','battle','explore'].includes(mode)&&!controlsPaused()){const input=Number(keys.has('d'))-Number(keys.has('a'));if(input){hero.x=clamp(hero.x+input*(keys.has('shift')?H.run:H.speed)*dt,55,worldWidth-70);hero.facing=input;}if(hero.y>0||hero.vy){hero.y+=hero.vy*dt;hero.vy-=H.gravity*dt;if(hero.y<=0){hero.y=0;hero.vy=0;}}if(mode==='battle'){bossAI(timestamp/1000,dt);moveShots(dt);}}render();}catch(error){console.error('Dragon Ball render recuperable:',error);}requestAnimationFrame(frame);}
 function keyName(k){k=String(k).toLowerCase();return k==='arrowleft'?'a':k==='arrowright'?'d':k==='arrowup'||k===' '?'w':k;}
 document.addEventListener('keydown',e=>{const typing=e.target instanceof Element&&e.target.closest('input,textarea,select,[contenteditable]');const k=keyName(e.key);if(typing){if(k==='escape'){closeSearch();closeDetail();}return;}if(['a','d','w','shift','e','f','g','t','q'].includes(k))e.preventDefault();if(k==='escape'){if(!el.detailLayer.hidden){closeDetail();return;}if(!el.searchLayer.hidden){closeSearch();return;}}
   if(!['hub','battle','explore'].includes(mode)||controlsPaused())return;if(k==='w'&&!e.repeat)jump();if(k==='e'&&!e.repeat)interact();if(k==='q'&&!e.repeat)mapSearch();if(k==='f'&&!e.repeat)shot('hero');if(k==='g'&&!e.repeat)special();if(k==='t'&&!e.repeat)transform();keys.add(k);
 });
 document.addEventListener('keyup',e=>keys.delete(keyName(e.key)));window.addEventListener('blur',()=>{keys.clear();audio?.pause?.();});window.addEventListener('focus',()=>audio?.resume?.());document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();audio?.pause?.();}else audio?.resume?.();});
 document.querySelectorAll('.mobile-controls [data-press]').forEach(b=>{const k=b.dataset.press;b.addEventListener('pointerdown',e=>{e.preventDefault();if(k==='a'||k==='d'){keys.add(k);try{b.setPointerCapture(e.pointerId);}catch(_){}}else if(k==='w')jump();else if(k==='e')interact();else if(k==='q')mapSearch();else if(k==='f')shot('hero');else if(k==='t')transform();else if(k==='g')special();});['pointerup','pointercancel','lostpointercapture'].forEach(t=>b.addEventListener(t,()=>keys.delete(k)));});
 document.querySelectorAll('[data-pick]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.pick)));
 $('top-home').addEventListener('click',gotoHome);$('selection-home').addEventListener('click',gotoHome);$('interact-button').addEventListener('click',interact);
 $('reset-db-progress').addEventListener('click',()=>{unlocked={goku:false,vegeta:false};persist();refreshSelection();el.loss.hidden=true;note('Recompensas reiniciadas');});
 $('catalog-close').addEventListener('click',closeSearch);$('detail-close').addEventListener('click',closeDetail);
 el.searchLayer.addEventListener('click',e=>{if(e.target===el.searchLayer)closeSearch();});el.detailLayer.addEventListener('click',e=>{if(e.target===el.detailLayer)closeDetail();});
 el.search.addEventListener('input',filterSearch);el.owner.addEventListener('change',filterSearch);
 $('catalog-retry').addEventListener('click',()=>verifyAPI(true));$('api-retry').addEventListener('click',()=>verifyAPI(true));
 $('switch-fighter').addEventListener('click',()=>{if(mode==='battle'||mode==='ending')return note('Termina el combate antes de cambiar guerrero.');epoch++;resetFx();keys.clear();el.searchLayer.hidden=true;el.detailLayer.hidden=true;el.hero.hidden=true;el.select.hidden=false;mode='select';audio?.pause?.();refreshSelection();});
 $('music-toggle').addEventListener('click',()=>{musicEnabled=!musicEnabled;audio?.enabled?.(musicEnabled);$('music-toggle').textContent=musicEnabled?'♫ Música ON':'♫ Música OFF';$('music-toggle').setAttribute('aria-pressed',String(musicEnabled));});
 refreshSelection();setScene('hub');mode='select';el.hero.hidden=true;el.boss.hidden=true;el.hud.hidden=true;requestAnimationFrame(frame);verifyAPI();
 // Diagnostic only: harmless read-only state + explicit test inputs for browser QA.
 window.DRAGON_BALL_DIAGNOSTIC={getState:()=>({mode,hero:{...hero},boss:{...boss},deathBall:deathBall?{phase:deathBall.phase,elapsed:seconds()-deathBall.started}:null,apiStatus:el.apiState.textContent,records:records.length,near:near?.kind,unlocked:{...unlocked}}),select,enterHub,fight,hitBoss:damageBoss,hitHero:damageHero,transform,special,startExplorer,openSearch:mapSearch,interact,verifyAPI,startDeathBall:()=>beginDeathBall(seconds()),startPinkBeam:()=>startPinkBeam(seconds()),startLightning:()=>startLightning(seconds()),getThreats:()=>({beam:pinkBeam?.active?'firing':pinkBeam?'warning':null,lightning:lightning?.active?'firing':lightning?'warning':null,deathBall:!!deathBall})};
 // La sesión se guarda solo en la pestaña. Detectar una desconexión de Live Server
 // permite resetearla al reconectar. Un reinicio demasiado rápido no es observable
 // desde una página frontend estática, sin modificar el servidor.
 (function monitorServer(){
   if(location.protocol==='file:'||location.protocol==='about:')return;
   let disconnected=false,failures=0,busy=false;
   async function check(){if(busy)return;busy=true;const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),2500);
     try{const response=await fetch('index.html?db_ping='+Date.now(),{cache:'no-store',signal:controller.signal});if(!response.ok)throw Error('Servidor no disponible');
       if(disconnected){sessionStorage.removeItem(keyStorage);location.reload();return;}failures=0;
     }catch(_){if(++failures>=2)disconnected=true;}
     finally{clearTimeout(timeout);busy=false;}}
   setInterval(check,1600);window.addEventListener('focus',check);
   document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});
 })();
})();
