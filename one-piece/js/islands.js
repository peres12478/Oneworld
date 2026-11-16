/* Navegación: sala -> puerta de personajes -> islas -> personajes -> ficha. */
(function(){
 'use strict';
 const OP=window.OP,U=OP.util;
 let cache=null,loading=false,error='',selectedIsland=null,peopleInIsland=[],explorer='luffy';
 const move={active:false,x:115,vx:0,last:0,camera:0,near:null,pressed:new Set(),worldWidth:1200};
 let sceneViewport,sceneTrack,sceneAvatar;
 const byId=U.byId;
 const sprite=()=>OP.rewards.sprite(explorer);
 function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 function imageNode(url,name,klass=''){
   const wrap=U.make('span','island-person-image '+klass);
   const fallback=U.make('span','image-initial',name.slice(0,1).toUpperCase()||'?');
   wrap.append(fallback);
   if(U.isValidImage(url)){
     const img=U.make('img','');img.loading='lazy';img.alt='Retrato: '+name;img.referrerPolicy='no-referrer';
     img.addEventListener('load',()=>fallback.classList.add('hidden'));
     img.addEventListener('error',()=>img.remove());
     img.src=url;wrap.append(img);
   }
   return wrap;
 }
 function islandCard(island){
   const b=U.make('button','island-card');b.type='button';b.dataset.island=island.id;
   const art=U.make('span','island-art');art.innerHTML=OP.islandArt.markup(island);
   const tag=U.make('span','island-art-tag',island.sea);art.append(tag);
   const meta=cache?OP.charactersAPI.islandMetadata(cache.islands,island):null;
   // La ilustración SVG siempre es nuestra; una imagen remota de isla se usa
   // solo como capa muy tenue si la API trae una URL válida.
   if(meta&&U.isValidImage(meta.image_url)){
     const img=U.make('img','island-remote-image');img.alt='';img.loading='lazy';
     img.addEventListener('error',()=>img.remove());img.src=meta.image_url;art.prepend(img);
   }
   const body=U.make('span','island-card-body');
   const title=U.make('strong','',island.name);
   const subtitle=U.make('span','island-card-description',island.subtitle);
   const bottom=U.make('span','island-card-bottom');
   const people=cache?OP.charactersAPI.forIsland(cache.people,island):null;
   bottom.append(U.make('span','',people?`${people.length} personajes encontrados`:'Explorar isla'),U.make('span','','ENTRAR ↗'));
   body.append(title,subtitle,bottom);b.append(art,body);
   b.addEventListener('click',()=>openIsland(island.id));return b;
 }
 function renderIslands(){
   const q=U.normalize(byId('islands-filter').value),el=byId('island-grid');el.replaceChildren();
   const islands=OP.islandData.filter(island=>[island.name,island.sea,island.subtitle,...island.aliases].some(v=>U.normalize(v).includes(q)));
   islands.forEach(island=>el.append(islandCard(island)));
   byId('island-result-label').textContent=islands.length+' ISLAS Y TERRITORIOS';
   if(!islands.length)el.append(U.make('p','island-empty','No se encontró una isla con ese nombre.'));
 }
 function status(text,kind='loading'){
   const chip=byId('characters-status');chip.className='characters-status '+kind;
   byId('characters-status-text').textContent=text;
   byId('characters-retry').classList.toggle('hidden',kind!=='error');
 }
 async function loadCharacters(){
   if(loading)return;
   loading=true;error='';status('CONECTANDO CON ONE PIECE API...','loading');
   try {
     cache=await OP.charactersAPI.loadAll(({loaded})=>status('API REST · '+loaded+' PERSONAJES RECIBIDOS','loading'));
     status(cache.count+' PERSONAJES · API EN VIVO','online');
     renderIslands();if(selectedIsland)renderIslandPeople();
   }catch(e){
     error=e.message;status('API DE PERSONAJES NO DISPONIBLE','error');
     byId('islands-error-text').textContent=error;
     console.error('Error al consultar personajes/islas de la API:',e);
     if(selectedIsland)renderIslandPeople();
   }finally{loading=false;}
 }
 function enter(character){
   explorer=character;selectedIsland=null;move.active=false;
   OP.ui.showArea('islands');renderIslands();
   if(cache)status(cache.count+' PERSONAJES · API EN VIVO','online');
   else if(!loading)loadCharacters();
 }
 function leave(){move.active=false;closeProfile();selectedIsland=null;
   OP.ui.showArea('room');OP.room.start(explorer,'characters');
 }
 function openIsland(id){
   selectedIsland=OP.islandData.find(i=>i.id===id);
   if(!selectedIsland)return;
   move.active=true;move.x=115;move.vx=0;move.camera=0;move.last=performance.now();move.pressed.clear();
   byId('island-name').textContent=selectedIsland.name;
   byId('island-subtitle').textContent=selectedIsland.subtitle;
   byId('island-region').textContent=selectedIsland.sea;
   byId('island-backdrop-art').innerHTML=OP.islandArt.markup(selectedIsland);
   byId('island-character-avatar').src=sprite();
   byId('island-character-name').textContent=explorer==='luffy'&&OP.rewards.isGear5()?'LUFFY · GEAR 5':OP.config.characters[explorer].shortName;
   OP.ui.showArea('island');renderIslandPeople();
 }
 function refreshAvatar(){if(!sceneAvatar)return;
   byId('island-character-avatar').src=sprite();
   byId('island-character-name').textContent=explorer==='luffy'&&OP.rewards.isGear5()?'LUFFY · GEAR 5':OP.config.characters[explorer].shortName;
 }
 function renderIslandPeople(){
   if(!selectedIsland)return;
   const layer=byId('character-stand-layer');layer.replaceChildren();
   const title=byId('island-characters-counter');
   if(!cache){
     peopleInIsland=[];
     title.textContent=error?'No se pudo cargar la API':'Consultando personajes de la API...';
     byId('island-stage-message').textContent=error?'La API no respondió. Vuelve a las islas y pulsa REINTENTAR.':'Buscando las fichas de los personajes...';
   }else{
     peopleInIsland=OP.charactersAPI.forIsland(cache.people,selectedIsland);
     title.textContent=peopleInIsland.length+' PERSONAJES · DATOS DE LA API';
     byId('island-stage-message').textContent=peopleInIsland.length?'Camina junto a un personaje y pulsa E para inspeccionarlo.':'La API no encontró fichas para este territorio.';
   }
   move.worldWidth=Math.max(1120,Math.max(peopleInIsland.length,2)*255+340);
   sceneTrack.style.width=move.worldWidth+'px';
   peopleInIsland.forEach((person,i)=>{
     const b=U.make('button','character-stand');b.type='button';b.dataset.personId=person.id;
     b.style.left=(230+i*255)+'px';
     b.append(imageNode(person.image,person.name,'character-portrait'));
     const words=U.make('span','character-stand-caption');
     words.append(U.make('strong','',person.name),U.make('small','',person.relationship==='Origen registrado en la API'?'ORIGEN · API':'PERSONAJE ASOCIADO'));
     b.append(words);b.addEventListener('click',()=>openProfile(person));layer.append(b);
   });
   move.x=Math.max(75,Math.min(move.x,move.worldWidth-80));updateWalking(0);
 }
 function closeProfile(){byId('character-detail').classList.add('hidden');}
 function openProfile(person){
   if(!person)return;
   move.pressed.clear();move.vx=0;
   const modal=byId('character-detail');modal.classList.remove('hidden');
   byId('profile-photo').replaceChildren(imageNode(person.image,person.name,'profile-image'));
   byId('profile-name').textContent=person.name;
   byId('profile-region').textContent=selectedIsland.name;
   byId('profile-link-type').textContent=person.relationship;
   const biography=OP.characterDescriptions.get(person);
   byId('profile-description').textContent=biography.text;
   byId('profile-description-source').textContent=biography.source;
   byId('profile-origin').textContent=person.origin;
   byId('profile-affiliation').textContent=person.affiliation;
   byId('profile-occupation').textContent=person.occupation;
   byId('profile-debut').textContent=person.debut;
   byId('profile-status').textContent=person.status;
   byId('profile-age').textContent=person.age;
   byId('profile-bounty').textContent=person.bounty===null?'No registrada':person.bounty.toLocaleString('es-CO')+' ฿';
 }
 function backToIslands(){closeProfile();move.active=false;selectedIsland=null;OP.ui.showArea('islands');renderIslands();}
 function getNear(){
   if(!peopleInIsland.length)return null;
   let near=null,dist=Infinity;
   peopleInIsland.forEach((person,i)=>{const d=Math.abs(move.x-(230+i*255));if(d<dist){dist=d;near=person;}});
   return dist<126?near:null;
 }
 function updateWalking(dt){
   const view=sceneViewport.clientWidth||1000;
   const target=U.clamp(move.x-view*.33,0,Math.max(0,move.worldWidth-view));
   move.camera+=(target-move.camera)*(dt?1-Math.exp(-9*dt):1);
   sceneTrack.style.transform=`translate3d(${-move.camera}px,0,0)`;
   sceneAvatar.style.left=move.x+'px';
   sceneAvatar.classList.toggle('walking',Math.abs(move.vx)>12);
   sceneAvatar.classList.toggle('is-backwards',move.vx<0);
   const near=getNear();move.near=near;
   byId('island-inspect-hint').classList.toggle('hidden',!near);
   if(near)byId('island-near-name').textContent=near.name;
 }
 function tick(t){
   const dt=Math.min(.04,(t-move.last)/1000||0);move.last=t;
   if(move.active && byId('character-detail').classList.contains('hidden')){
     const dx=Number(move.pressed.has('d')||move.pressed.has('arrowright'))-Number(move.pressed.has('a')||move.pressed.has('arrowleft'));
     const speed=move.pressed.has('shift')?340:235;
     move.vx+=(dx*speed-move.vx)*Math.min(1,9*dt);
     move.x=U.clamp(move.x+move.vx*dt,75,move.worldWidth-90);
     updateWalking(dt);
   }
   requestAnimationFrame(tick);
 }
 function keydown(e){
   if(!move.active)return;
   if(e.target && e.target.matches('input, textarea, select'))return;
   const k=e.key.toLowerCase();
   if(k==='escape'){
     e.preventDefault();if(!byId('character-detail').classList.contains('hidden'))closeProfile();else backToIslands();return;
   }
   if(['a','d','arrowleft','arrowright','shift','e'].includes(k))e.preventDefault();
   if(k==='e'&&!e.repeat){if(byId('character-detail').classList.contains('hidden'))openProfile(move.near);return;}
   move.pressed.add(k);
 }
 function keyup(e){move.pressed.delete(e.key.toLowerCase());}
 function init(){
   sceneViewport=byId('island-scene-viewport');sceneTrack=byId('island-walking-track');sceneAvatar=byId('island-explorer');
   byId('islands-filter').addEventListener('input',renderIslands);
   byId('characters-retry').addEventListener('click',loadCharacters);
   byId('islands-leave').addEventListener('click',leave);
   byId('island-scene-back').addEventListener('click',backToIslands);
   byId('character-profile-close').addEventListener('click',closeProfile);
   byId('character-detail-backdrop').addEventListener('click',closeProfile);
   byId('island-inspect-button').addEventListener('click',()=>openProfile(move.near));
   document.addEventListener('keydown',keydown);document.addEventListener('keyup',keyup);
   window.addEventListener('blur',()=>move.pressed.clear());
   document.querySelectorAll('[data-island-key]').forEach(button=>{
     const key=button.dataset.islandKey;
     button.addEventListener('pointerdown',e=>{e.preventDefault();move.pressed.add(key);button.setPointerCapture(e.pointerId);});
     const stop=()=>move.pressed.delete(key);
     button.addEventListener('pointerup',stop);button.addEventListener('pointercancel',stop);
     button.addEventListener('lostpointercapture',stop);
   });
   move.last=performance.now();requestAnimationFrame(tick);
 }
 OP.islands={init,enter,leave,openIsland,backToIslands,loadCharacters,renderIslands,renderIslandPeople,openProfile,refreshAvatar};
})();
