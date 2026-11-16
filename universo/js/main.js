import {readSpaceCategory,readSpaceDetail,readWikipediaArticle,SPACE_API} from './space-api.js';
import {formulas,categories} from './physics.js';
import {AsteroidsGame} from './asteroids.js';
import {PhysicsPractices} from './physics-practices.js';
import {AstroAudio} from './astro-audio.js';

const $=id=>document.getElementById(id);
const dom={app:$('app'),hangar:$('screen-hangar'),world:$('hangar-world'),astro:$('astronaut'),shadow:$('astronaut-shadow'),prompt:$('hangar-prompt'),near:$('near-label'),
 api:$('api-state'), modal:$('detail-modal'),help:$('help-modal'),detailTitle:$('detail-title'),detailKind:$('detail-kind'),detailContent:$('detail-content'),detailSource:$('detail-source'),
 categoryCount:$('sky-count'),objectName:$('object-name'),objectType:$('object-type'),objectSequence:$('object-sequence'),art:$('celestial-art'),empty:$('empty-space'),
 formulaGrid:$('formula-grid'),formulaSearch:$('formula-search'),labCategories:$('lab-categories'), formulaCount:$('formula-count')};
const astroSound=new AstroAudio($('sound-button'));
const practices=new PhysicsPractices({canvas:$('practice-canvas'),selector:$('practice-selector'),inputs:$('practice-inputs'),results:$('practice-results'),title:$('practice-title'),topic:$('practice-topic'),equation:$('practice-equation'),description:$('practice-description'),note:$('practice-note'),play:$('practice-play'),reset:$('practice-reset'),time:$('practice-time')});
const keys=new Set();const sites=[{x:92,el:$('site-home'),screen:'home',title:'MI ESPACIO'},{x:365,el:$('site-explore'),screen:'explore',title:'COHETE EXPLORADOR'},{x:1120,el:$('site-lab'),screen:'lab',title:'LABORATORIO DE FÍSICA'},{x:1880,el:$('site-arcade'),screen:'arcade',title:'ARCADE DE ASTEROIDES'}];
const SPACE_WIDTH=2310;let scene='hangar',modalOpen=false,helpOpen=false,nearSite=null;
const pilot={x:530,y:0,vy:0,ground:true,facing:1,camera:0,last:0};
const sky={category:'planet',records:[],offset:0,index:0,loading:false,hasMore:false,cache:new Map(),request:0};
let selectedFormulaCategory='todas',labRendered=false;
const esc=str=>String(str??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const typeName={planet:'Planeta',moon:'Luna',black_hole:'Agujero negro'};
const nf=(n,decimals=2)=>typeof n==='number'&&Number.isFinite(n)?new Intl.NumberFormat('es-CO',{maximumFractionDigits:decimals}).format(n):'No registrado';
const displayValue=(v,suffix='')=>v!==undefined&&v!==null&&v!==''?typeof v==='number'?nf(v)+suffix:String(v)+suffix:'No registrado';
function signal(kind,text){dom.api.className='connection '+kind;dom.api.textContent='● '+text;}
function goto(where){if(where==='home'){astroSound.play('door');window.location.assign(new URL('../index.html',document.baseURI).href);return;}if(scene==='practices'&&where!=='practices')practices.deactivate();astroSound.setScene(where);astroSound.play('select');if(modalOpen)closeModal();if(helpOpen)closeHelp();if(scene==='arcade'&&where!=='arcade')game.stop();keys.clear();scene=where;dom.app.dataset.scene=where;
 document.querySelectorAll('.screen').forEach(el=>el.classList.toggle('active',el.id==='screen-'+where));
 $('control-hint').innerHTML=where==='hangar'?'<span><kbd>A</kbd><kbd>D</kbd> MOVER</span><span><kbd>W</kbd> SALTAR</span><span><kbd>E</kbd> ENTRAR</span><span><kbd>Q</kbd> INVESTIGAR</span>':where==='explore'?'<span><kbd>A</kbd><kbd>D</kbd> VIAJAR</span><span><kbd>Q</kbd><kbd>E</kbd> INSPECCIONAR</span><span><kbd>1–3</kbd> TIPO</span><span><kbd>ESC</kbd> REGRESAR</span>':where==='lab'?'<span><kbd>Q</kbd> BUSCAR</span><span><kbd>ESC</kbd> REGRESAR</span>':where==='practices'?'<span><kbd>CLIC</kbd> AJUSTAR PARÁMETROS</span><span><kbd>▶</kbd> INICIAR/PAUSAR</span><span><kbd>ESC</kbd> LABORATORIO</span>':'<span><kbd>A</kbd><kbd>D</kbd> MOVER</span><span><kbd>F</kbd> DISPARAR</span><span><kbd>ESC</kbd> REGRESAR</span>';
 if(where==='explore')loadSky(false);else if(where==='lab')renderLab();else if(where==='practices'){practices.activate();}else if(where==='arcade'){showGameOverlay('ASTEROID DEFENDER','Controla tu cohete de juguete y protege la órbita.');game.draw(0);}
}
function enterSite(site){if(!site)return;astroSound.unlock();astroSound.play('door');goto(site.screen);}
sites.forEach(site=>site.el.addEventListener('click',()=>enterSite(site)));
$('hangar-enter').addEventListener('click',()=>enterSite(nearSite));
document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>goto(b.dataset.back||'hangar')));
$('practice-door').addEventListener('click',()=>{astroSound.unlock();astroSound.play('practice');goto('practices');});
document.addEventListener('pointerdown',()=>astroSound.unlock(),{once:true});
function jump(){if(!pilot.ground)return;pilot.vy=680;pilot.ground=false;astroSound.play('jump');}
const controls=(k)=>k==='arrowleft'?'a':k==='arrowright'?'d':k==='arrowup'?'w':k===' '?'space':k;
function typing(){const el=document.activeElement;return el&&(['INPUT','TEXTAREA','SELECT'].includes(el.tagName)||el.isContentEditable);}
document.addEventListener('keydown',event=>{const k=controls(event.key.toLowerCase());
 if(k==='escape'){event.preventDefault();if(modalOpen)closeModal();else if(helpOpen)closeHelp();else if(scene==='practices')goto('lab');else if(scene!=='hangar')goto('hangar');return;}
 if(helpOpen||modalOpen)return;
 if(typing()){if(scene==='lab'&&k==='enter')event.preventDefault();return;}
 astroSound.unlock();
 if(['a','d','w','space','q','e','f','shift','1','2','3'].includes(k))event.preventDefault();
 if(scene==='hangar'){
  if(k==='e'&&!event.repeat)enterSite(nearSite);
  if((k==='w'||k==='space')&&!event.repeat)jump();
  if(k==='q'&&!event.repeat)showHelp();
 }else if(scene==='explore'){
  if((k==='a'||k==='d')&&!event.repeat)stepSky(k==='a'?-1:1);
  if((k==='q'||k==='e')&&!event.repeat)inspectSky();
  if(['1','2','3'].includes(k)&&!event.repeat)selectCategory(['planet','moon','black_hole'][+k-1]);
 }else if(scene==='lab'){
  if(k==='q'&&!event.repeat)dom.formulaSearch.focus();
 }else if(scene==='practices'){
  if(k==='space'&&!event.repeat&&document.activeElement===document.body)practices.toggle();
 }else if(scene==='arcade'){
  if((k==='f'||k==='space')&&!event.repeat)game.fire();
 }
 keys.add(k);
});
document.addEventListener('keyup',e=>keys.delete(controls(e.key.toLowerCase())));
window.addEventListener('blur',()=>{keys.clear();game.move('a',false);game.move('d',false);});
function tickHangar(dt){const direction=(keys.has('d')?1:0)-(keys.has('a')?1:0);
 if(direction){pilot.facing=direction;pilot.x=Math.max(60,Math.min(SPACE_WIDTH-60,pilot.x+direction*(keys.has('shift')?350:228)*dt));}
 if(!pilot.ground){pilot.y+=pilot.vy*dt;pilot.vy-=1750*dt;if(pilot.y<=0){pilot.y=0;pilot.vy=0;pilot.ground=true;}}
 dom.astro.classList.toggle('walking',direction!==0&&pilot.ground);dom.astro.classList.toggle('jumping',!pilot.ground);dom.astro.style.left=pilot.x+'px';dom.astro.style.bottom='calc(var(--hangar-ground) + '+pilot.y+'px)';dom.astro.style.setProperty('--facing',pilot.facing);
 dom.shadow.style.left=pilot.x+'px';dom.shadow.style.opacity=String(Math.max(.2,1-pilot.y/300));
 const nearest=sites.filter(s=>Math.abs(s.x-pilot.x)<135).sort((a,b)=>Math.abs(a.x-pilot.x)-Math.abs(b.x-pilot.x))[0]||null;
 if(nearSite!==nearest){nearSite=nearest;dom.prompt.classList.toggle('visible',!!nearest);$('hangar-prompt-title').textContent=nearest?'ENTRAR: '+nearest.title:'EXPLORAR';dom.near.textContent=nearest?'PULSA E PARA ENTRAR':'CAMINA HACIA UNA ESTACIÓN';sites.forEach(s=>s.el.classList.toggle('is-near',s===nearest));}
 const width=dom.hangar.clientWidth,goal=Math.max(0,Math.min(SPACE_WIDTH-width,pilot.x-width*.40));pilot.camera+=(goal-pilot.camera)*Math.min(1,dt*7);
 dom.world.style.transform='translate3d('+(-pilot.camera).toFixed(2)+'px,0,0)';
}
function frame(t){const dt=pilot.last?Math.min(.04,(t-pilot.last)/1000):.016;pilot.last=t;
 if(scene==='hangar')tickHangar(dt);if(scene==='practices')practices.tick(dt);
 if(scene==='arcade'){game.move('a',keys.has('a'));game.move('d',keys.has('d'));if(keys.has('f')||keys.has('space'))game.fire();}
 requestAnimationFrame(frame);
}

function selectCategory(cat){if(!typeName[cat])return;astroSound.play('select');if(sky.loading){sky.request++;sky.loading=false;}sky.category=cat;sky.index=0;document.querySelectorAll('[data-category]').forEach(b=>b.classList.toggle('chosen',b.dataset.category===cat));loadSky(false);}
document.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>selectCategory(b.dataset.category)));
$('reload-space').addEventListener('click',()=>{sky.cache.delete(sky.category);loadSky(false);});
$('load-more').addEventListener('click',()=>loadSky(true));
$('prev-object').addEventListener('click',()=>{astroSound.unlock();astroSound.play('select');stepSky(-1);});$('next-object').addEventListener('click',()=>{astroSound.unlock();astroSound.play('select');stepSky(1);});$('inspect-object').addEventListener('click',()=>{astroSound.unlock();astroSound.play('explore');inspectSky();});
function skyRecord(){return sky.records[sky.index]||null;}
async function loadSky(more){const cat=sky.category;if(sky.loading)return;
 if(!more&&sky.cache.has(cat)){const saved=sky.cache.get(cat);sky.records=[...saved.records];sky.offset=saved.offset;sky.hasMore=saved.hasMore;sky.index=0;updateSky();signal('online','ASTRONOMÍA · API conectada');return;}
 sky.loading=true;const request=++sky.request;dom.categoryCount.textContent='Consultando '+typeName[cat].toLowerCase()+'s…';$('load-more').disabled=true;signal('waiting','ASTRONOMÍA · conectando');
 try{const offset=more?sky.records.length:0;const result=await readSpaceCategory(cat,offset,24);
  if(request!==sky.request||sky.category!==cat)return;
  if(more){const known=new Set(sky.records.map(x=>x.slug||x.id||x.name));sky.records.push(...result.records.filter(x=>!known.has(x.slug||x.id||x.name)));sky.index=Math.min(sky.records.length-1,offset);}
  else{sky.records=result.records;sky.index=0;}
  sky.offset=sky.records.length;sky.hasMore=result.hasMore&&result.records.length>0;
  sky.cache.set(cat,{records:[...sky.records],offset:sky.offset,hasMore:sky.hasMore});
  signal('online','API CONECTADA · SpaceCatalog');dom.categoryCount.textContent=`${sky.records.length}${result.total?' / '+nf(result.total,0):''} registros cargados de ${typeName[cat].toLowerCase()}s`;
 }catch(err){if(request!==sky.request)return;signal('offline','API SIN CONEXIÓN');dom.categoryCount.textContent='Error de conexión: '+err.message;if(!more)sky.records=[];sky.hasMore=false;}
 finally{if(request===sky.request){sky.loading=false;updateSky();}}
}
function updateSky(){const item=skyRecord(),has=sky.records.length>0;
 $('load-more').disabled=!sky.hasMore||sky.loading;$('load-more').style.display=sky.hasMore?'inline-flex':'none';
 $('prev-object').disabled=!has||sky.index<=0;$('next-object').disabled=!has||sky.index>=sky.records.length-1;
 $('inspect-object').disabled=!has;dom.empty.classList.toggle('hidden',has);
 if(!has){dom.objectName.textContent='Esperando consulta astronómica';dom.objectType.textContent='Sin resultados disponibles';dom.objectSequence.textContent='API';dom.art.className='celestial-art planet-art';return;}
 const name=item.name||item.englishName||item.slug||'Objeto sin nombre';dom.objectName.textContent=name;
 dom.objectSequence.textContent=`OBJETO ${String(sky.index+1).padStart(2,'0')} / ${sky.records.length}`;
 dom.objectType.textContent=typeName[item.category]||typeName[sky.category];
 const style=sky.category==='black_hole'?'blackhole-art':sky.category==='moon'?'moon-art':'planet-art';
 let variant='';const lower=name.toLowerCase();
 if(/jupiter|júpiter|saturn|saturno/.test(lower))variant=' gas-giant';
 else if(/mars|marte|red planet/.test(lower))variant=' mars';
 else if(/earth|tierra/.test(lower))variant=' earth';
 else if(/uranus|neptune|neptuno/.test(lower))variant=' ice';
 dom.art.className='celestial-art '+style+variant;dom.art.setAttribute('aria-label','Representación ilustrativa de '+name);
}
function stepSky(by){if(!sky.records.length)return;const next=sky.index+by;if(next<0)return;
 if(next>=sky.records.length){if(sky.hasMore)loadSky(true);return;}
 sky.index=next;updateSky();}
function closeModal(){dom.modal.classList.add('hidden');modalOpen=false;}
function showModal(title,kind,content,source){astroSound.play('explore');dom.detailTitle.textContent=title;dom.detailKind.textContent=kind;dom.detailContent.innerHTML=content;dom.detailSource.textContent=source;dom.modal.classList.remove('hidden');modalOpen=true;}
$('close-detail').addEventListener('click',closeModal);$('detail-dismiss').addEventListener('click',closeModal);dom.modal.addEventListener('click',e=>{if(e.target===dom.modal)closeModal();});
async function inspectSky(){const current=skyRecord();if(!current||modalOpen)return;
 const name=current.name||current.englishName||current.slug||'Objeto';
 showModal(name,'ASTRONOMÍA · '+(typeName[sky.category]||''),'<p class="loading-text">Consultando ficha completa en SpaceCatalog…</p>','API · SpaceCatalog');
 let item=current;let status='Datos obtenidos de la consulta de listado';
 try{if(current.slug){item=await readSpaceDetail(current.slug);status='Ficha individual obtenida en vivo desde la API';}}catch(e){status='Ficha del listado disponible; detalle individual no respondió';}
 if(!modalOpen)return;
 const fields=[
 ['Categoría',typeName[item.category]||typeName[sky.category]],['Clasificación',item.class||item.object_type||item.type],
 ['Constelación',item.constellation],['Distancia',displayValue(item.distance_ly,' años luz')],['Masa solar',displayValue(item.mass_msun,' M☉')],
 ['Masa',displayValue(item.mass_kg,' kg')],['Radio',displayValue(item.radius_km,' km')],['Magnitud aparente',item.apparent_magnitude??item.mag],
 ['Ascensión recta',displayValue(item.ra_deg,'°')],['Declinación',displayValue(item.dec_deg,'°')],
 ['Descubrimiento',item.discovered],['Designaciones',(item.designations||[]).join(', ')],
 ];
 let stats=fields.filter(([k,v])=>v!==null&&v!==undefined&&v!==''&&v!=='No registrado').map(([k,v])=>`<div class="fact"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('');
 const reference=item.source&&typeof item.source==='object'?item.source:null;
 const sourceLabel=reference?.name||reference?.id||reference?.catalog||null;
 const sourceLicense=reference?.license||reference?.licence||null;
 if(sourceLabel)stats+=`<div class="fact"><span>Catálogo original</span><strong>${esc(sourceLabel)}</strong></div>`;
 if(sourceLicense)stats+=`<div class="fact"><span>Licencia de datos</span><strong>${esc(sourceLicense)}</strong></div>`;
 const text=item.description||item.summary||item.properties?.description||'';
 const props=item.properties&&typeof item.properties==='object'?Object.entries(item.properties).filter(([k,v])=>v!==null&&typeof v!=='object'&&k!=='description').slice(0,15):[];
 const extra=props.length?`<h3>Información adicional del catálogo</h3><div class="facts">${props.map(([k,v])=>`<div class="fact"><span>${esc(k.replaceAll('_',' '))}</span><strong>${esc(v)}</strong></div>`).join('')}</div>`:'';
 dom.detailContent.innerHTML=`<p class="modal-description">${esc(text||'La API no incluye una descripción extensa para este cuerpo celeste. Los campos siguientes contienen únicamente valores disponibles en la respuesta.')}</p><div class="facts">${stats||'<p>La API no ha suministrado propiedades físicas adicionales.</p>'}</div>${extra}<p class="data-note">Visualización espacial ilustrativa; las distancias y tamaños en pantalla no están a escala. Los campos ausentes no se inventan.</p>`;
 dom.detailSource.textContent=status;
}

function renderLab(){if(!labRendered){dom.labCategories.innerHTML=categories.map(([key,label])=>`<button class="lab-cat ${key===selectedFormulaCategory?'chosen':''}" data-labcat="${key}" type="button">${esc(label)}</button>`).join('');dom.labCategories.addEventListener('click',e=>{const btn=e.target.closest('[data-labcat]');if(btn){selectedFormulaCategory=btn.dataset.labcat;dom.labCategories.querySelectorAll('button').forEach(b=>b.classList.toggle('chosen',b===btn));updateFormulas();}});dom.formulaSearch.addEventListener('input',updateFormulas);dom.formulaGrid.addEventListener('click',e=>{const btn=e.target.closest('[data-formula]');if(btn)inspectFormula(btn.dataset.formula);});labRendered=true;}updateFormulas();}
function updateFormulas(){const query=dom.formulaSearch.value.trim().toLowerCase();const filtered=formulas.filter(x=>(selectedFormulaCategory==='todas'||x.cat===selectedFormulaCategory)&&(!query||[x.title,x.formula,x.cat,x.concept,x.variables].join(' ').toLowerCase().includes(query)));
 dom.formulaCount.textContent=`${filtered.length} / ${formulas.length} FÓRMULAS`;
 dom.formulaGrid.innerHTML=filtered.map((x,i)=>`<button type="button" class="formula-card" data-formula="${esc(x.id)}"><span class="formula-number">FÓRMULA ${String(i+1).padStart(2,'0')} · ${esc(categories.find(c=>c[0]===x.cat)?.[1]||'')}</span><strong>${esc(x.title)}</strong><span class="formula-equation">${esc(x.formula)}</span><p>${esc(x.concept)}</p><span class="formula-open">CONSULTAR ↗</span></button>`).join('')||'<div class="no-formula">No se encontraron fórmulas con ese filtro.</div>';
}
async function inspectFormula(id){const x=formulas.find(x=>x.id===id);if(!x)return;
 showModal(x.title,'LABORATORIO · '+categories.find(c=>c[0]===x.cat)?.[1],`<div class="big-equation">${esc(x.formula)}</div><div class="formula-section"><h3>¿Qué representa?</h3><p>${esc(x.concept)}</p><h3>Variables y unidades</h3><p>${esc(x.variables)}</p><h3>Ejemplo resuelto</h3><p>${esc(x.example)}</p></div><div class="wiki-section" id="wiki-live"><span class="loading-text">Consultando explicación complementaria en Wikipedia API…</span></div>`,'FÓRMULA: catálogo educativo local · consulta externa: pendiente');
 try{const doc=await readWikipediaArticle(x.wiki);const container=$('wiki-live');if(!container||!modalOpen)return;
  container.innerHTML=`<h3>Contexto enciclopédico · API EN LÍNEA</h3><p>${esc(doc.summary.slice(0,1350))}${doc.summary.length>1350?'…':''}</p><a href="${esc(doc.link)}" target="_blank" rel="noopener noreferrer">Leer artículo completo ↗</a>`;
  dom.detailSource.textContent='Fórmula curricular local · explicación consultada EN VIVO en Wikipedia API';
 }catch(e){const container=$('wiki-live');if(!container||!modalOpen)return;container.innerHTML=`<h3>Consulta adicional no disponible</h3><p>No se pudo obtener el resumen desde Wikipedia. La fórmula escolar se puede estudiar sin conexión.</p><a href="https://es.wikipedia.org/w/index.php?search=${encodeURIComponent(x.wiki)}" target="_blank" rel="noopener noreferrer">Buscar el tema en Wikipedia ↗</a>`;dom.detailSource.textContent='Fórmula curricular local · Wikipedia API no disponible';}
}

const game=new AsteroidsGame($('asteroid-canvas'),{onSfx:(freq)=>astroSound.play(freq<180?'jump':'laser'),onUpdate:(score,lives)=>{$('game-score').textContent=String(score).padStart(4,'0');$('game-lives').textContent='♥'.repeat(Math.max(lives,0))||'—';},onEnd:(score)=>showGameOverlay('FIN DE LA MISIÓN',`Puntuación: ${score} puntos. ¿Quieres intentarlo nuevamente?`)});
function showGameOverlay(title,detail){$('game-message').textContent=title;$('game-submessage').textContent=detail;$('game-overlay').classList.remove('hidden');}
function startArcade(){astroSound.unlock();astroSound.play('door');$('game-overlay').classList.add('hidden');game.start();}
$('game-start').addEventListener('click',startArcade);$('game-restart').addEventListener('click',startArcade);
function showHelp(){dom.help.classList.remove('hidden');helpOpen=true;}
function closeHelp(){dom.help.classList.add('hidden');helpOpen=false;}
$('help-button').addEventListener('click',showHelp);$('close-help').addEventListener('click',closeHelp);$('help-dismiss').addEventListener('click',closeHelp);dom.help.addEventListener('click',e=>{if(e.target===dom.help)closeHelp();});
function mobileMove(key){if(scene==='hangar'){if(key==='w')jump();else if(key==='e')enterSite(nearSite);else if(key==='q')showHelp();}
 else if(scene==='explore'){if(key==='a')stepSky(-1);else if(key==='d')stepSky(1);else if(key==='q'||key==='e')inspectSky();}
 else if(scene==='lab'){if(key==='q')dom.formulaSearch.focus();}
 else if(scene==='arcade'){if(key==='e'||key==='q'||key==='w')game.fire();}}
[['touch-left','a'],['touch-right','d']].forEach(([id,key])=>{const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);if(scene==='hangar'||scene==='arcade')keys.add(key);else mobileMove(key);});['pointerup','pointercancel','lostpointercapture'].forEach(evt=>el.addEventListener(evt,()=>keys.delete(key)));});
$('touch-jump').addEventListener('click',()=>mobileMove('w'));$('touch-action').addEventListener('click',()=>mobileMove('e'));$('touch-query').addEventListener('click',()=>mobileMove('q'));
$('hangar-world').style.width=SPACE_WIDTH+'px';pilot.camera=0;requestAnimationFrame(frame);
window.ASTRA_DIAGNOSTIC={getState:()=>({scene,pilot:{...pilot},sky:{category:sky.category,records:sky.records.length,index:sky.index},game:{running:game.running,points:game.points,lives:game.lives},practice:{name:practices.current,t:practices.t,running:practices.running,values:{...practices.values}}}),goto,selectCategory};
