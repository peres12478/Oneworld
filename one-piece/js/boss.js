/* Barbanegra: jefe recurrente en la isla Hachinosu.
 * Ataques: contacto, proyectiles y picos advertidos por marcas luminosas.
 * Todo comparte la física y requestAnimationFrame de room.js.
 */
(function(){'use strict';
 const OP=window.OP,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const maxHp=8, maxHearts=5, startX=1760, floorY=446, RESPAWN=28;
 let active=false,hero='luffy',x=startX,hp=maxHp,hearts=maxHearts,hurtCooldown=0,bossCooldown=0;
 let shotCooldown=1.6,spikeCooldown=3.5,voidCooldown=10,stunned=0,respawnIn=0,time=0,direction=-1,defeated=false;
 let projectiles=[],spikes=[],vortex=null;
 let root,boss,bossBar,hud,health,modal,heading,description,button,toast;
 let defeatTimer=null;
 const el=id=>document.getElementById(id);
 function init(){
   root=el('room-world');boss=el('blackbeard-boss');bossBar=el('blackbeard-health');
   hud=el('room-boss-hud');health=el('room-player-health');
   modal=el('room-reward-modal');heading=el('room-reward-heading');description=el('room-reward-description');
   button=el('room-reward-continue');toast=el('room-boss-notice');
   button.addEventListener('click',closeReward);
   document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlayOpen())closeReward();});
   renderHealth();
 }
 function clearProjectiles(){projectiles.forEach(p=>p.el.remove());projectiles=[];}
 function clearSpikes(){spikes.forEach(p=>p.el.remove());spikes=[];}
 function start(character){
   stop();hero=character;active=true;hp=maxHp;hearts=maxHearts;respawnIn=0;
   hurtCooldown=0;bossCooldown=0;shotCooldown=2.1;spikeCooldown=3.2;voidCooldown=9.5;stunned=0;defeated=false;
   x=startX;time=0;direction=-1;
   boss.classList.remove('boss-vanished','boss-wounded','boss-cartoon-squashed');
   boss.classList.remove('hidden');hud.classList.remove('hidden');
   toast.textContent='☠ HACHINOSU · PINCHOS, ORBES Y AGUJERO NEGRO: ¡ESQUIVA Y CONTRAATACA!';
   renderHealth();render();
 }
 function clearVortex(){if(vortex){vortex.el.remove();vortex=null;}}
 function stop(){
   if(defeatTimer!==null){clearTimeout(defeatTimer);defeatTimer=null;}
   active=false;respawnIn=0;clearProjectiles();clearSpikes();clearVortex();defeated=false;
   el('room-player')?.classList.remove('hero-hurt');
   el('boss-defeat-overlay')?.classList.add('hidden');
   if(boss)boss.classList.add('hidden');if(hud)hud.classList.add('hidden');
   if(modal)modal.classList.add('hidden');if(modal)modal.setAttribute('aria-hidden','true');
   if(toast)toast.textContent='';
 }
 function renderHealth(){bossBar.style.width=`${Math.max(0,hp/maxHp*100)}%`;
   health.textContent='♥ '.repeat(hearts)+'♡ '.repeat(maxHearts-hearts);}
 function render(){boss.style.left=(x-70)+'px';boss.style.top=(floorY-224)+'px';
   boss.style.setProperty('--boss-face',String(direction));boss.style.setProperty('--boss-bob',`${Math.sin(time*2.7)*4}px`);}
 function hurtPlayer(){
   if(hurtCooldown>0||!active)return false;
   hearts=Math.max(0,hearts-1);hurtCooldown=1.12;
   const player=el('room-player');player.classList.remove('hero-hurt');void player.offsetWidth;player.classList.add('hero-hurt');
   renderHealth();OP.sfx?.playBossHit?.();
   if(hearts<=0){
     active=false;defeated=true;clearProjectiles();clearSpikes();clearVortex();
     toast.textContent='☠ ¡ZEHAHAHAHA! ¡HAS PERDIDO! · BARBANEGRA TE ESPERA EN HACHINOSU';
     const laugh=el('boss-defeat-overlay');if(laugh)laugh.classList.remove('hidden');
     OP.battleMusic?.lose();
     if(defeatTimer!==null)clearTimeout(defeatTimer);
     defeatTimer=window.setTimeout(()=>{defeatTimer=null;if(defeated){if(laugh)laugh.classList.add('hidden');OP.ui.showDefeat();}},1850);
   }
   return true;
 }
 function castVortex(target){
   clearVortex();const center=clamp(target,1250,2290);
   const node=document.createElement('div');node.className='blackbeard-vortex vortex-charging';
   node.innerHTML='<b>☠</b><small>¡AGUJERO NEGRO!</small>';root.append(node);
   vortex={el:node,x:center,t:0,phase:'warning'};
   toast.textContent='⚠ ¡AGUJERO NEGRO! ¡ALÉJATE O CORRE CONTRA LA ATRACCIÓN!';
   OP.sfx?.playDarkness?.();
 }
 function updateVortex(dt,player){
   if(!vortex)return;vortex.t+=dt;
   const v=vortex;v.el.style.left=(v.x-135)+'px';v.el.style.top=(floorY-98)+'px';
   if(v.phase==='warning'&&v.t>=1.1){v.phase='active';v.t=0;v.el.classList.replace('vortex-charging','vortex-active');}
   if(v.phase==='active'){
     const distance=v.x-(player.x+52),abs=Math.abs(distance);
     if(abs<570&&abs>13){const acceleration=(1-abs/650)*(hp<=4?950:750)*dt; OP.room.pullToward?.(Math.sign(distance)*acceleration);}
     if(abs<80&&player.y>floorY-75){hurtPlayer();if(!active)return;}
     if(v.t>3.7){v.phase='ending';v.t=0;v.el.classList.replace('vortex-active','vortex-ending');}
   }
   if(v.phase==='ending'&&v.t>.55)clearVortex();
 }
 function shoot(target){
   const dir=target>=x?1:-1;
   const node=document.createElement('div');node.className='blackbeard-dark-orb';root.append(node);
   projectiles.push({el:node,x:x+dir*30,y:floorY-112,vx:dir*(hp<=4?340:284),life:3.2});
   OP.sfx?.playDarkness?.();
 }
 function createSpike(cx){
   const node=document.createElement('div');node.className='blackbeard-spikes spike-warning';node.setAttribute('aria-hidden','true');
   node.style.left=(cx-61)+'px';node.style.top=(floorY-96)+'px';
   node.innerHTML='<span class="spike-mark">!</span><span class="spike-needles"></span>';
   root.append(node);spikes.push({el:node,x:cx,phase:'warning',t:0});
 }
 function castSpikes(pc){
   // Nunca salen sin advertencia: una zona bajo el jugador y, en fase 2, otra desplazada.
   const center=clamp(pc,1280,2300);
   createSpike(center);
   if(hp<=4)createSpike(clamp(center+(Math.random()>.5?185:-185),1230,2340));
   toast.textContent='⚠ ¡SALTA! EL SUELO DE HACHINOSU ESTÁ A PUNTO DE EXPLOTAR';
 }
 function updateSpikes(dt,player){
   for(let i=spikes.length-1;i>=0;i--){
     if(!active)return;
     const hazard=spikes[i];if(!hazard)continue;hazard.t+=dt;
     if(hazard.phase==='warning'&&hazard.t>=.95){
       hazard.phase='active';hazard.t=0;hazard.el.classList.replace('spike-warning','spike-active');
       OP.sfx?.playDarkness?.();
     }else if(hazard.phase==='active'){
       // Sólo golpea al héroe en el suelo. Saltar alto o subirse a una plataforma evita el daño.
       if(Math.abs(player.x+52-hazard.x)<65&&player.y>floorY-72){hurtPlayer();if(!active)return;}
       if(hazard.t>=.73){hazard.phase='retract';hazard.t=0;hazard.el.classList.replace('spike-active','spike-retract');}
     }else if(hazard.phase==='retract'&&hazard.t>=.42){hazard.el.remove();spikes.splice(i,1);}
   }
 }
 function update(dt,player){
   if(!OP.room.isHachinosu()||el('room-screen').classList.contains('hidden'))return;
   if(!active){
     if(defeated)return;
     if(respawnIn>0&&!overlayOpen()){
       respawnIn=Math.max(0,respawnIn-dt);
       const rounded=Math.ceil(respawnIn);
       if(rounded>0)toast.textContent=`☠ BARBANEGRA REAPARECE EN ${rounded} s · PUEDES VOLVER AL LOBBY CON E`;
       if(respawnIn===0)start(hero);
     }
     return;
   }
   time+=dt;hurtCooldown=Math.max(0,hurtCooldown-dt);bossCooldown=Math.max(0,bossCooldown-dt);stunned=Math.max(0,stunned-dt);
   shotCooldown-=dt;spikeCooldown-=dt;voidCooldown-=dt;
   const pc=player.x+52,distance=pc-x;
   if(Math.abs(distance)<780){
     direction=distance<0?-1:1;
     if(stunned===0&&Math.abs(distance)>151)x=clamp(x+Math.sign(distance)*(hp<=4?105:82)*dt,1570,2260);
     if(stunned===0&&Math.abs(distance)<84&&player.y>floorY-67){hurtPlayer();if(!active)return;}
     if(stunned===0&&shotCooldown<=0){shoot(pc);shotCooldown=hp<=4?1.37:2.05;}
     if(stunned===0&&spikeCooldown<=0){castSpikes(pc);spikeCooldown=hp<=4?3.05:4.45;}
     if(stunned===0&&voidCooldown<=0){castVortex(pc);voidCooldown=10;}
   }
   for(let i=projectiles.length-1;i>=0;i--){
     const shot=projectiles[i];shot.x+=shot.vx*dt;shot.life-=dt;
     shot.el.style.left=shot.x+'px';shot.el.style.top=shot.y+'px';
     if(Math.abs(shot.x-pc)<39&&Math.abs((player.y-111)-shot.y)<47){hurtPlayer();if(!active)return;shot.life=0;}
     if(shot.life<=0){shot.el.remove();projectiles.splice(i,1);}
   }
   if(!active)return;updateSpikes(dt,player);if(!active)return;updateVortex(dt,player);if(!active)return;render();
 }
 function applyDamage(damage,fromDir,cartoon){
   if(!active||bossCooldown>0)return false;
   hp=Math.max(0,hp-damage);bossCooldown=.32;
   if(cartoon){stunned=1.1;x=clamp(x+fromDir*93,1570,2290);
     boss.classList.remove('boss-cartoon-squashed');void boss.offsetWidth;boss.classList.add('boss-cartoon-squashed');}
   boss.classList.remove('boss-wounded');void boss.offsetWidth;boss.classList.add('boss-wounded');
   OP.sfx?.playBossHit?.();renderHealth();
   if(hp<=0)win();
   else if(hp<=4)toast.textContent='☠ FASE 2 · MÁS PINCHOS Y PROYECTILES · ¡CUIDADO!';
   return true;
 }
 function hit({origin,dir,reach,hitY,kind='normal'}){
   if(!active||reach<20||Math.abs(hitY-(floorY-123))>120)return false;
   const distance=(x-origin)*dir;
   if(distance < -42 || distance > reach+38)return false;
   return applyDamage(1,dir,kind==='gear5');
 }
 function areaHit({x:attackX,y,radius=310,damage=2}){
   if(!active||Math.abs(attackX-x)>radius||Math.abs(y-(floorY-123))>145)return false;
   return applyDamage(damage,Math.sign(x-attackX)||1,true);
 }
 function win(){
   active=false;respawnIn=RESPAWN;clearProjectiles();clearSpikes();clearVortex();
   boss.classList.add('boss-vanished');
   const newReward=OP.rewards.unlock(hero);OP.room.refreshSkin();
   hud.classList.add('hidden');
   if(newReward){
     heading.textContent=hero==='luffy'?'¡LUFFY DESPIERTA EL GEAR 5!':'¡ROGER DESBLOQUEA SU ESPADA MEJORADA!';
     description.textContent=hero==='luffy'?
       '¡Gear 5 desbloqueado! Pulsa T o el botón de forma para alternar entre Luffy normal y Gear 5. Con Gear 5 activo, F lanza un puño gigante y G activa el Tambor de la Liberación.':
       '¡Espada de Haki mejorada! Los ataques de Roger ahora alcanzan enemigos a distancia con F.';
   }else{
     heading.textContent='¡BARBANEGRA HA CAÍDO OTRA VEZ!';
     description.textContent='¡Ganaste otra batalla en Hachinosu! Tus recompensas permanecen disponibles durante esta partida y el jefe volverá a aparecer en 28 segundos.';
   }
   el('room-reward-icon').textContent=hero==='luffy'?'☁':'⚔';
   toast.textContent='✦ VICTORIA EN HACHINOSU · BARBANEGRA VOLVERÁ A APARECER';
   modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');button.focus({preventScroll:true});
 }
 function closeReward(){
   if(!modal)return;modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');
   if(boss&&!active)boss.classList.add('hidden');
   if(!el('room-screen').classList.contains('hidden'))el('room-viewport').focus({preventScroll:true});
 }
 const overlayOpen=()=>Boolean(defeated||(modal&&!modal.classList.contains('hidden')));
 OP.boss={init,start,stop,update,hit,areaHit,overlayOpen,getStatus:()=>({active,hp,hearts,x,hero,stunned,respawnIn,spikes:spikes.length,vortex:Boolean(vortex),defeated})};
})();
