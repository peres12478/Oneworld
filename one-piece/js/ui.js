/* Interfaz: selección -> sala lateral -> atlas de frutas. Las frutas llegan desde Devil Fruits Tracker. */
(function () {
  'use strict';
  const OP=window.OP, U=OP.util;
  const discovered=new Set();
  let fruits=[], selectedCharacter=null, area='selection', searching=false, detailOpen=false, filter='all', loading=false;
  const toggle=(id,hidden)=>U.byId(id).classList.toggle('hidden',hidden);
  function refreshFormButtons(){
    const available=selectedCharacter==='luffy'&&OP.rewards.has('luffy');
    document.querySelectorAll('[data-gear-toggle]').forEach(button=>{
      button.classList.toggle('hidden',!available);button.disabled=!available;button.hidden=!available;
      button.textContent=OP.rewards.isGear5()?'↩ LUFFY NORMAL':'☁ ACTIVAR GEAR 5';
      button.setAttribute('aria-pressed',String(OP.rewards.isGear5()));
    });
    if(selectedCharacter==='luffy'){
      U.byId('companion-sprite').src=OP.rewards.sprite('luffy');
      OP.movement.refreshSkin?.();OP.poses.setCharacter('luffy');
    }
  }
  function switchForm(){
    if(selectedCharacter!=='luffy'||!OP.rewards.has('luffy'))return;
    if(OP.room.isBusy?.())return;
    OP.rewards.toggleGear5();
  }
  function showArea(which){
    area=which;
    toggle('select-screen',which!=='selection');
    toggle('room-screen',which!=='room');
    toggle('game-screen',which!=='atlas');
    toggle('islands-screen',which!=='islands');
    toggle('island-scene-screen',which!=='island');
    refreshFormButtons();
  }
  function updateCatalog(list){
    fruits=list.slice();U.byId('fruit-count').textContent=fruits.length;
    OP.world.setFruits(fruits);renderResults();
  }
  function updateStatus(result){
    const chip=U.byId('api-status');
    const pending=result.mode==='loading', errored=result.mode==='error';
    chip.className='status-chip '+(pending?'status-loading':errored?'status-demo':'status-online');
    U.byId('api-status-text').textContent=result.source;
    chip.title=errored?(result.error||'Error de conexión; reintentar'):pending?'Consultando el catálogo completo de Devil Fruits Tracker':`Fuente: ${result.endpoint} · ${result.reportedTotal||fruits.length} registros`;
    toggle('api-error',!errored);
    if(errored) U.byId('api-error-message').textContent=result.error||'No se pudo acceder a One Piece API.';
  }
  function chooseCharacter(character){
    selectedCharacter=character;U.byId('defeat-banner')?.classList.add('hidden');OP.doorPuzzle.resetAll();discovered.clear();U.byId('discovered-count').textContent='00';
    U.byId('companion-sprite').src=OP.rewards.sprite(character);
    U.byId('companion-frame').dataset.character=character;
    OP.poses.setCharacter(character);
    showArea('room');OP.room.start(character);
    // Dar el foco al escenario tras una derrota; el botón de selección deja de capturarlo.
    U.byId('room-viewport').focus({preventScroll:true});
    refreshFormButtons();
  }
  function enterIslands(){
    if(area!=='room')return;
    OP.room.stop();OP.islands.enter(selectedCharacter);
  }
  function enterAtlas(){
    if(area!=='room')return;
    OP.room.stop();showArea('atlas');OP.movement.start(selectedCharacter);
    if(!fruits.length&&!loading)refreshCatalog();
  }
  function leaveAtlas(){
    if(area!=='atlas')return;
    closeAllOverlays();OP.movement.stop();showArea('room');OP.room.start(selectedCharacter,true);
  }
  function showDefeat(){
    backToSelection();const banner=U.byId('defeat-banner');banner?.classList.remove('hidden');
  }
  function backToSelection(){
    closeAllOverlays();OP.movement.stop();OP.room.stop();selectedCharacter=null;showArea('selection');
  }
  function toggleSearch(){if(area!=='atlas')return;if(searching)closeSearch();else openSearch();}
  function openSearch(){
    if(area!=='atlas')return;
    if(detailOpen)closeDetail();searching=true;filter='all';
    U.byId('fruit-search').value='';
    document.querySelectorAll('.filter-pill').forEach(e=>e.classList.toggle('active',e.dataset.filter==='all'));
    ['search-backdrop','search-panel','search-companion'].forEach(id=>toggle(id,false));
    U.byId('search-panel').setAttribute('aria-hidden','false');
    OP.movement.setThinking(true);renderResults();U.byId('fruit-search').focus();
  }
  function closeSearch(){
    if(!searching)return;searching=false;
    ['search-backdrop','search-panel','search-companion'].forEach(id=>toggle(id,true));
    U.byId('search-panel').setAttribute('aria-hidden','true');OP.movement.setThinking(false);
    if(area==='atlas')U.byId('viewport').focus({preventScroll:true});
  }
  function matchingFruits(){
    const q=U.normalize(U.byId('fruit-search').value);
    return fruits.filter(f=>{
      if(filter!=='all'&&!U.normalize(f.type).includes(U.normalize(filter)))return false;
      return !q||[f.name,f.japaneseName,f.type,f.owner,f.meaning,f.aliases].some(v=>U.normalize(v).includes(q));
    });
  }
  function createSearchRow(fruit){
    const row=U.make('button','result-card');row.type='button';
    const thumb=U.make('span','result-thumb');OP.media.mount(thumb,fruit,'');
    const copy=U.make('span','result-copy');
    copy.append(U.make('strong','',fruit.name),U.make('small','',`${fruit.type} · ${fruit.owner}`));
    row.append(thumb,copy,U.make('span','result-arrow','↗'));
    row.addEventListener('click',()=>{
      const node=OP.world.focusFruit(fruit);closeSearch();OP.movement.teleportNear(node);openDetail(fruit);
    });
    return row;
  }
  function renderResults(){
    const matches=matchingFruits(),list=U.byId('search-results');list.replaceChildren();
    U.byId('search-result-count').textContent=matches.length+' FRUTA'+(matches.length!==1?'S':'')+' ENCONTRADA'+(matches.length!==1?'S':'');
    if(!matches.length){
      const empty=U.make('div','search-empty');
      empty.append(U.make('strong','',loading?'Cargando frutas de la API...':fruits.length?'No se encontró ninguna fruta':'No hay datos de la API'),
                   U.make('p','',fruits.length?'Prueba otro nombre o filtro.':'Consulta el estado de conexión y pulsa SINCRONIZAR DATOS.'));
      list.append(empty);return;
    }
    const fragment=document.createDocumentFragment();
    // Se muestran TODOS los resultados, no se trunca a 70.
    matches.forEach(f=>fragment.append(createSearchRow(f)));
    list.append(fragment);
  }
  function openDetail(fruit){
    if(!fruit||area!=='atlas')return;
    if(searching)closeSearch();detailOpen=true;OP.movement.setPanelOpen(true);
    toggle('detail-backdrop',false);toggle('detail-panel',false);
    U.byId('detail-panel').setAttribute('aria-hidden','false');
    U.byId('detail-name').textContent=fruit.name;
    U.byId('detail-japanese').textContent=fruit.japaneseName||fruit.meaning||'FRUTA DEL DIABLO';
    U.byId('detail-type').textContent=fruit.type;
    U.byId('detail-owner').textContent=fruit.owner;
    U.byId('detail-previous-owner').textContent=fruit.previousOwner||'No registrado';
    U.byId('detail-debut').textContent=fruit.debut||'No registrado';
    U.byId('detail-description').textContent=fruit.description;
    OP.media.mount(U.byId('detail-image-host'),fruit,'detail-source-image');
    discovered.add(fruit.id);
    U.byId('discovered-count').textContent=String(discovered.size).padStart(2,'0');
  }
  function closeDetail(){
    if(!detailOpen)return;detailOpen=false;OP.movement.setPanelOpen(false);
    toggle('detail-backdrop',true);toggle('detail-panel',true);
    U.byId('detail-panel').setAttribute('aria-hidden','true');
    if(area==='atlas')U.byId('viewport').focus({preventScroll:true});
  }
  function closeAllOverlays(){closeSearch();closeDetail();}
  function setNearby(fruit){toggle('proximity-notice',!fruit);if(fruit)U.byId('proximity-name').textContent=fruit.name;}
  function inspectNearby(){if(area==='atlas'&&!searching&&!detailOpen)openDetail(OP.movement.getNearest());}
  async function refreshCatalog(){
    if(loading)return;
    loading=true;U.byId('reload-api').disabled=true;
    updateStatus({mode:'loading',source:'DEVIL FRUITS TRACKER · CARGANDO...'});
    try {
      const result=await OP.api.loadAll(({loaded,total})=>{
        U.byId('api-status-text').textContent=`API REST · ${loaded}${total?' / '+total:''}`;
      });
      updateCatalog(result.fruits);updateStatus(result);
      // La consulta de imágenes es opcional y NO retrasa el catálogo ni los portadores.
      OP.media.enrichImages(result.fruits)
        .then(info => console.info('Imágenes complementarias de la API:', info))
        .catch(error => console.warn('No se pudieron enriquecer imágenes; se conservan los emojis:', error));
    } catch(error){
      console.error('No hay frutas sin una respuesta completa de la API:',error);
      updateCatalog([]);
      updateStatus({mode:'error',source:'ERROR DE API',error:error.message});
    } finally {loading=false;U.byId('reload-api').disabled=false;}
  }
  function init(){
    document.querySelectorAll('.character-card[data-character]').forEach(b=>b.addEventListener('click',()=>chooseCharacter(b.dataset.character)));
    U.byId('change-character').addEventListener('click',backToSelection);
    U.byId('defeat-dismiss').addEventListener('click',()=>U.byId('defeat-banner').classList.add('hidden'));
    U.byId('room-change-character').addEventListener('click',backToSelection);
    document.querySelectorAll('[data-gear-toggle]').forEach(button=>button.addEventListener('click',switchForm));
    U.byId('new-game-button').addEventListener('click',()=>{OP.rewards.reset();OP.doorPuzzle.resetAll();U.byId('new-game-button').textContent='✓ PROGRESO REINICIADO';setTimeout(()=>U.byId('new-game-button').textContent='↻ NUEVA PARTIDA',1800);});
    window.addEventListener('gle:rewards-changed',()=>{refreshFormButtons();OP.room.refreshSkin();OP.islands.refreshAvatar?.();});
    document.addEventListener('keydown',event=>{if(event.key.toLowerCase()==='t'&&!event.repeat&&!(event.target?.matches('input, textarea, select'))&&['room','island','islands','atlas'].includes(area)){event.preventDefault();switchForm();}});
    U.byId('leave-atlas').addEventListener('click',leaveAtlas);
    U.byId('search-button').addEventListener('click',toggleSearch);
    U.byId('close-search').addEventListener('click',closeSearch);
    U.byId('close-detail').addEventListener('click',closeDetail);
    U.byId('detail-continue').addEventListener('click',closeDetail);
    U.byId('search-backdrop').addEventListener('click',closeSearch);
    U.byId('detail-backdrop').addEventListener('click',closeDetail);
    U.byId('fruit-search').addEventListener('input',renderResults);
    U.byId('reload-api').addEventListener('click',refreshCatalog);
    U.byId('retry-api').addEventListener('click',refreshCatalog);
    document.querySelectorAll('.filter-pill').forEach(b=>b.addEventListener('click',()=>{
      filter=b.dataset.filter;
      document.querySelectorAll('.filter-pill').forEach(t=>t.classList.toggle('active',t===b));
      renderResults();
    }));
  }
  OP.ui={init,chooseCharacter,enterAtlas,enterIslands,leaveAtlas,backToSelection,showDefeat,showArea,updateCatalog,updateStatus,
    refreshCatalog,toggleSearch,closeAllOverlays,openDetail,setNearby,inspectNearby};
})();
