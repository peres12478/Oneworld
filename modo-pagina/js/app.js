import {loadCollection,loadSpace,searchSpace,fetchRemoteDetail,verifyPhysics,PHYSICS_CATEGORIES} from './api-client.js';

const VIEWS={
 inicio:{name:'Descubrir',kicker:'DESCUBRE ONEWORLD',title:'Curiosidad sin límites',subtitle:'Consulta mundos, descubre historias y aprende a tu ritmo. Una biblioteca de datos y experiencias en un solo lugar.',highlights:['4 DESTINOS','3 UNIVERSOS DE CONOCIMIENTO']},
 habitacion:{name:'Mi habitación',kicker:'ESPACIO PERSONAL',title:'Un poco más sobre mí',subtitle:'Mis pasiones, mis proyectos y la persona detrás de OneWorld. Una sección personal que no utiliza ninguna API.',highlights:['PROYECTOS','PASIONES','SOBRE MÍ']},
 universo:{name:'Universo',kicker:'ASTRONOMÍA · SPACE CATALOG',title:'Un universo por descubrir',subtitle:'Planetas, lunas, agujeros negros y otros cuerpos celestes, con información obtenida directamente de una API astronómica.',highlights:['DATOS ASTRONÓMICOS','BUSCAR EN LA API']},
 onepiece:{name:'One Piece',kicker:'LA GRAND LINE · ARCHIVO PIRATA',title:'El océano de las historias',subtitle:'Investiga las Frutas del Diablo, conoce personajes y explora islas mediante las mismas fuentes de datos del juego.',highlights:['FRUTAS DEL DIABLO','PERSONAJES E ISLAS']},
 dragonball:{name:'Dragon Ball',kicker:'LOS GUERREROS Z · ARCHIVO',title:'El poder de la curiosidad',subtitle:'Encuentra personajes, consulta su información y conoce las transformaciones registradas en Dragon Ball API.',highlights:['PERSONAJES','TRANSFORMACIONES']}
};
const TABS={
 universo:[['planet','Planetas'],['moon','Lunas'],['black_hole','Agujeros negros'],['exoplanet','Exoplanetas'],['galaxy','Galaxias'],['asteroid','Asteroides'],['physics','Fórmulas de física']],
 onepiece:[['fruits','Frutas del Diablo'],['characters','Personajes'],['islands','Islas']],
 dragonball:[['characters','Personajes'],['transformations','Transformaciones']]
};
const DEFAULT_TAB={universo:'planet',onepiece:'fruits',dragonball:'characters'};
const SPACE_ICONS={planet:'◎',moon:'☾',black_hole:'◉',exoplanet:'◌',galaxy:'✧',asteroid:'◇'};
const SPACE_LABELS={planet:'Planeta',moon:'Luna',black_hole:'Agujero negro',exoplanet:'Exoplaneta',galaxy:'Galaxia',asteroid:'Asteroide'};
const $=id=>document.getElementById(id);
const store=new Map();
const state={section:'inicio',tab:'',route:'',query:'',filter:'all',visibleLimit:12,remote:null,loading:false,token:0,detailToken:0,detailOpen:false,physicsVerified:null,physicsLoading:false,focusReturn:null};
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain=s=>String(s??'').replace(/<[^>]*>/g,' ').trim();
const norm=s=>plain(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const nfmt=n=>new Intl.NumberFormat('es-CO',{maximumFractionDigits:2}).format(Number(n));
const short=(s,max=130)=>plain(s).length>max?plain(s).slice(0,max-1)+'…':plain(s);
const safeUrl=s=>{if(!s)return '';try{const u=new URL(String(s),location.href);return u.protocol==='https:'||u.protocol==='http:'?u.href:''}catch{return ''}};
const safeImage=s=>{if(!s)return '';try{const u=new URL(String(s),location.href);return (u.protocol==='https:'||u.protocol==='http:')?u.href:''}catch{return ''}};
const tooltip=document.querySelector('#toast');let toastTimer;
function toast(message){tooltip.hidden=false;tooltip.textContent=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{tooltip.hidden=true},3900)}
function setConnection(type,message){const box=$('connection-pill');box.className='connection-pill '+type;box.querySelector('span').textContent=message}
function setSourceNote(text){$('source-note').textContent=text}
function showSkeleton(){const grid=$('results-grid');grid.replaceChildren();for(let i=0;i<6;i++){const d=document.createElement('div');d.className='skeleton skeleton-card';grid.append(d)}$('results-line').textContent='Consultando la fuente...';$('load-more').classList.add('hidden')}
function stateRoute(){return `${state.section}:${state.tab}`}
function parseHash(){const parts=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);const section=VIEWS[parts[0]]?parts[0]:'inicio';const allowed=TABS[section]?.map(x=>x[0])||[];return {section,tab:allowed.includes(parts[1])?parts[1]:(DEFAULT_TAB[section]||'')}}
function currentHash(section,tab){return '#/'+section+(tab?'/'+tab:'')}
function selectSection(section,tab,scroll=true,fromHash=false){
 if(!VIEWS[section])section='inicio';if(TABS[section]){const allowed=TABS[section].map(x=>x[0]);tab=allowed.includes(tab)?tab:DEFAULT_TAB[section]}else tab='';
 const changing=state.section!==section||state.tab!==tab;
 if(changing){state.token++;state.query='';state.filter='all';state.visibleLimit=12;state.remote=null;}
 state.section=section;state.tab=tab;state.route=tab?`${section}:${tab}`:'';
 if(!fromHash&&location.hash!==currentHash(section,tab))history.pushState(null,'',currentHash(section,tab));
 document.querySelectorAll('[data-section]').forEach(btn=>{const active=btn.dataset.section===section;btn.classList.toggle('active',active);if(btn.matches('.side-link,.mobile-nav button'))btn.setAttribute('aria-current',active?'page':'false')});
 const v=VIEWS[section];$('breadcrumb-name').textContent=v.name.toUpperCase();$('hero').dataset.realm=section;$('hero-eyebrow').textContent=v.kicker;$('hero-title').innerHTML=e(v.title)+'<span>.</span>';$('hero-subtitle').textContent=v.subtitle;$('hero-highlights').replaceChildren(...v.highlights.map(t=>{let x=document.createElement('span');x.textContent='✦ '+t;return x}));
 $('intro-section').classList.toggle('hidden',section!=='inicio');$('room-section').classList.toggle('hidden',section!=='habitacion');$('collection-section').classList.toggle('hidden',!TABS[section]);
 if(TABS[section]){renderTabs();$('search-input').value=state.query;renderCategoryControls();loadActiveRoute()}
 else if(section==='habitacion')renderRoom();
 if(scroll)window.scrollTo({top:0,behavior:'smooth'});
}
function renderTabs(){const box=$('category-tabs');box.replaceChildren();for(const [slug,label] of TABS[state.section]){const b=document.createElement('button');b.type='button';b.role='tab';b.textContent=label;b.className=slug===state.tab?'active':'';b.setAttribute('aria-selected',String(slug===state.tab));b.addEventListener('click',()=>selectSection(state.section,slug,false));box.append(b)}
 $('collection-title').textContent=TABS[state.section].find(t=>t[0]===state.tab)?.[1]||'Catálogo';$('search-input').placeholder=state.tab==='physics'?'Buscar fórmulas o conceptos...':state.section==='universo'?'Buscar nombre, designación o categoría...':'Buscar por nombre, tipo, raza...';
 $('search-form').querySelector('button').textContent=state.section==='universo'&&state.tab!=='physics'?'Buscar en API':'Buscar';
}
function renderCategoryControls(){const box=$('category-filter');box.replaceChildren();const opt=document.createElement('option');opt.value='all';opt.textContent='Todos';box.append(opt);box.value='all';state.filter='all'}
function filterValue(item){const r=state.route;if(r==='onepiece:fruits')return String(item.type||'Sin tipo');if(r==='dragonball:characters')return String(item.race||'Sin raza');if(r==='dragonball:transformations')return item.source==='editorial'?'Ficha complementaria':'API';if(r==='universo:physics')return PHYSICS_CATEGORIES.find(c=>c[0]===item.cat)?.[1]||item.cat;if(r.startsWith('universo:'))return item.class||item.object_type||'No especificado';return ''}
function fillFilterOptions(items){const box=$('category-filter');const vals=[...new Set(items.map(filterValue).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
 const previously=state.filter;box.replaceChildren();const opt=document.createElement('option');opt.value='all';opt.textContent='Todos';box.append(opt);
 for(const v of vals){const option=document.createElement('option');option.value=v;option.textContent=short(v,36);box.append(option)}
 box.value=vals.includes(previously)?previously:'all';state.filter=box.value;
}
async function loadActiveRoute(force=false){
 const route=stateRoute();const token=++state.token;state.route=route;state.remote=null;state.visibleLimit=12;state.loading=true;
 if(force)store.delete(route);
 const cached=store.get(route);
 if(cached){state.loading=false;setConnection(cached.local?'pending':cached.fallback?'partial':'connected',cached.local?'Catálogo local · referencias externas':cached.fallback?'Fuente HTTPS de respaldo':`${nfmt(cached.total??cached.items.length)} recibidos de la API`);fillFilterOptions(cached.items);renderResults();if(route==='universo:physics')startPhysicsVerification();return}
 showSkeleton();setConnection('loading','Consultando API...');setSourceNote('Recuperando datos de la fuente original; no se utilizan resultados de demostración.');
 try{
  const data=await loadCollection(route,progress=>{if(state.token===token){$('results-line').textContent=`Consultando API · ${progress.loaded||0} registros recibidos...`}});
  store.set(route,{...data,items:data.items||[]});
  if(state.token!==token)return;
  state.loading=false;setConnection(data.local?'pending':data.fallback?'partial':'connected',data.local?'Fórmulas locales · verificando APIs':data.fallback?'Fuente HTTPS de respaldo':`${nfmt(data.total??data.items.length)} recibidos de la API`);
  fillFilterOptions(data.items);renderResults();if(route==='universo:physics')startPhysicsVerification();
 }catch(err){if(state.token!==token)return;state.loading=false;store.delete(route);setConnection('error','API sin conexión');showError(err.message||'No se pudo consultar la API',true)}
}
function showError(msg,retry=false){const grid=$('results-grid');grid.innerHTML='<div class="empty-box"><div class="empty-icon">⌁</div><h3>No se pudieron cargar los datos</h3><p>'+e(msg)+'</p>'+(retry?'<button id="inline-retry" type="button">↻ Reintentar conexión</button>':'')+'</div>';$('results-line').textContent='La consulta no devolvió resultados verificables.';$('load-more').classList.add('hidden');if(retry)$('inline-retry').addEventListener('click',()=>loadActiveRoute(true));setSourceNote('La aplicación no sustituye los resultados de la API por datos ficticios. Comprueba la conexión y vuelve a intentarlo.')}
function localizedName(x){const name=x?.name;if(typeof name==='string')return name;if(name&&typeof name==='object')return name.en||name.romaji||name.jp||'Sin nombre';return x?.title||x?.slug||'Sin nombre'}
function humanType(s){return SPACE_LABELS[s]||String(s||'Objeto astronómico').replaceAll('_',' ')}
function itemLabel(item){const r=state.route;if(r==='onepiece:fruits')return item.name||'Fruta desconocida';if(r==='universo:physics')return item.title||'Fórmula';return localizedName(item)}
function itemInfo(item){const r=state.route;
 if(r==='onepiece:fruits')return {category:item.type||'Fruta del Diablo',subtitle:item.owner&&item.owner!=='No registrado'?`Portador: ${item.owner}`:'Fruta del Diablo',description:item.description||'',image:item.image||item.trackerImage||'',source:'API',emoji:'🍈'};
 if(r==='onepiece:characters')return {category:'Personaje',subtitle:item.affiliation||item.origin||'One Piece',description:[item.occupation,item.origin].filter(x=>x&&x!=='No registrado').join(' · '),image:item.image||'',source:'API',emoji:'🏴‍☠️'};
 if(r==='onepiece:islands')return {category:'Isla',subtitle:'One Piece API',description:item.description||'',image:item.image_url||item.image||'',source:'API',emoji:'🏝️'};
 if(r==='dragonball:characters')return {category:item.race||'Personaje',subtitle:item.affiliation||'Dragon Ball',description:item.description||'',image:item.image||'',source:'API',emoji:'⚡'};
 if(r==='dragonball:transformations')return {category:'Transformación',subtitle:item.owner&&item.owner!=='Consultar ficha'?`Portador: ${item.owner}`:'Consultar para ver portador',description:item.note||('Ki: '+(item.ki||'No registrado')),image:item.image||'',source:item.source==='editorial'?'LOCAL':'API',emoji:'✳'};
 if(r==='universo:physics')return {category:PHYSICS_CATEGORIES.find(c=>c[0]===item.cat)?.[1]||'Física',subtitle:item.formula,description:item.concept,source:'LOCAL',emoji:'∑'};
 if(r.startsWith('universo:'))return {category:humanType(item.category||state.tab),subtitle:humanType(item.class||item.object_type||'Objeto astronómico'),description:item.description||item.distance_ly&&`Distancia: ${nfmt(item.distance_ly)} años luz`||'',source:'API',image:'',emoji:'☄'};
 return {category:'Registro',subtitle:'',description:'',source:'API',emoji:'✦'}
}
function createVisual(item,info){const route=state.route;const div=document.createElement('div');div.className='card-visual'+(route.startsWith('onepiece:')?' pirate-visual':route.startsWith('dragonball:')?' dragon-visual':route==='universo:physics'?' formula-visual':' space-visual');
 const label=document.createElement('span');label.className='visual-label'+(info.source==='LOCAL'?' editorial':'');label.textContent=info.source==='LOCAL'?'CONTENIDO LOCAL':'DATOS DE API';div.append(label);
 if(route==='universo:physics'){const el=document.createElement('span');el.className='formula-symbol';el.textContent=item.formula;div.append(el)}
 else if(route.startsWith('universo:')){const el=document.createElement('span');el.className='celestial '+state.tab;div.append(el)}
 else if(safeImage(info.image)){const img=document.createElement('img');img.src=safeImage(info.image);img.loading='lazy';img.alt=`Ilustración de ${itemLabel(item)}`;img.referrerPolicy='no-referrer';img.addEventListener('error',()=>{img.remove();const alt=document.createElement('span');alt.className='art-emoji';alt.textContent=info.emoji;div.append(alt)});div.append(img)}
 else{const alt=document.createElement('span');alt.className='art-emoji';alt.textContent=info.emoji;div.append(alt)}return div}
function createCard(item,index){const info=itemInfo(item),card=document.createElement('article');card.className='result-card';card.style.animationDelay=Math.min(index,9)*35+'ms';card.append(createVisual(item,info));
 const part=document.createElement('div');part.className='card-content';part.innerHTML=`<span class="card-overline">${e(info.category)}</span><h3>${e(itemLabel(item))}</h3><p>${e(short(info.description||info.subtitle||'Consulta todos los datos de esta ficha.',132))}</p><div class="card-footer"><small>${e(short(info.subtitle,28))}</small><button class="view-btn" type="button" aria-label="Ver información de ${e(itemLabel(item))}">Ver ficha ↗</button></div>`;
 part.querySelector('.view-btn').addEventListener('click',()=>openDetail(item));card.append(part);return card;
}
function searchIndex(item){const i=itemInfo(item);return norm([itemLabel(item),i.category,i.subtitle,i.description,item.owner,item.ki,item.maxKi,item.formula,item.variables,item.concept,item.designations?.join(' '),item.slug].filter(Boolean).join(' '))}
function currentItems(){if(state.remote)return state.remote.items;return store.get(state.route)?.items||[]}
function renderResults(){if(state.loading)return;const raw=currentItems();const q=norm(state.query),selected=state.filter;
 const filtered=raw.filter(item=>(state.remote||!q||searchIndex(item).includes(q))&&(selected==='all'||filterValue(item)===selected));
 const visible=filtered.slice(0,state.visibleLimit);const grid=$('results-grid');grid.replaceChildren();
 if(!visible.length){grid.innerHTML='<div class="empty-box"><div class="empty-icon">⌕</div><h3>Sin coincidencias</h3><p>No hay registros que coincidan con tu búsqueda en los datos cargados. Prueba otro término o cambia de categoría.</p><button id="clear-search" type="button">Limpiar búsqueda</button></div>';grid.querySelector('button').addEventListener('click',()=>{state.query='';state.remote=null;state.filter='all';$('search-input').value='';$('category-filter').value='all';renderResults()})}
 else{const frag=document.createDocumentFragment();visible.forEach((item,i)=>frag.append(createCard(item,i)));grid.append(frag)}
 const data=store.get(state.route)||{},apiMore=state.route.startsWith('universo:')&&state.tab!=='physics'&&!state.remote&&data.hasMore;
 $('results-line').textContent=`${nfmt(visible.length)} de ${nfmt(filtered.length)} registros ${state.remote?'encontrados por búsqueda remota': 'visibles'}${data.total&&data.total>raw.length?` · ${nfmt(data.total)} reportados por la API`:''}`;
 const more=filtered.length>visible.length||apiMore;$('load-more').classList.toggle('hidden',!more);$('load-more').disabled=false;$('load-more').innerHTML=filtered.length>visible.length?'Mostrar más <span>↓</span>':'Cargar más desde la API <span>↓</span>';
 setSourceNote(data.local?'Fórmulas escolares almacenadas localmente. Wikipedia y Wikidata se utilizan como referencias externas verificables, no como origen de todas las fórmulas.':`${state.remote?'Búsqueda realizada directamente en SpaceCatalog. ':''}Fuente: ${data.source||'API externa'}. ${data.fallback?'La API REST principal no respondió; se consultó el archivo JSON público del mismo repositorio. ':'La conexión se indica solo cuando llega una respuesta válida. '}${state.section==='universo'?'Los dibujos astronómicos son ilustraciones conceptuales.':''}`);
}
async function loadMore(){const items=currentItems(),q=norm(state.query);const matched=items.filter(item=>(!q||searchIndex(item).includes(q))&&(state.filter==='all'||filterValue(item)===state.filter));
 if(matched.length>state.visibleLimit){state.visibleLimit+=12;renderResults();return}
 if(!state.route.startsWith('universo:')||state.tab==='physics'||state.remote)return;
 const current=store.get(state.route);if(!current?.hasMore)return;
 const token=state.token;const btn=$('load-more');btn.disabled=true;btn.textContent='Consultando API...';
 try{const page=await loadSpace(state.tab,current.items.length);if(state.token!==token)return;
  const seen=new Set(current.items.map(x=>String(x.slug||x.id||x.name)));
  let added=0;for(const item of page.items){const key=String(item.slug||item.id||item.name);if(!seen.has(key)){current.items.push(item);seen.add(key);added++}}
  current.hasMore=page.hasMore&&added>0;current.total=page.total??current.total;
  state.visibleLimit+=12;fillFilterOptions(current.items);renderResults();
 }catch(err){if(state.token===token){toast('No se pudieron cargar más objetos: '+err.message);renderResults()}}
}
function formatDate(iso){if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||''))return iso||'No indicada';const dt=new Date(iso+'T12:00:00Z');return isNaN(dt.getTime())?iso:new Intl.DateTimeFormat('es-CO',{dateStyle:'long',timeZone:'UTC'}).format(dt)}
function renderRoom(){const data=window.DATOS_HABITACION||{},g=data.github||{},p=data.pasiones||{},about=data.sobreMi||{},link=safeUrl(g.url);
 const box=$('personal-content');box.replaceChildren();const container=document.createElement('div');container.className='personal-grid';
 const github=document.createElement('article');github.className='personal-card profile-card';github.innerHTML=`<span class="personal-icon">⌘</span><span class="mini-title">MI CÓDIGO</span><h3>GitHub</h3><p>Explora el perfil y los repositorios donde comparto lo que construyo.</p><p><strong>${e(g.nombre||'Perfil por completar')}</strong></p>`;
 if(link){const a=document.createElement('a');a.className='button-link';a.href=link;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Ver mi GitHub ↗';github.append(a)}else{const msg=document.createElement('p');msg.textContent='Aún no se ha indicado una URL de GitHub.';github.append(msg)}
 const self=document.createElement('article');self.className='personal-card';self.innerHTML=`<span class="personal-icon">◷</span><span class="mini-title">SOBRE MÍ</span><h3>${e(about.nombre||'Quién soy')}</h3>${about.fechaNacimiento?`<span class="birth-pill">✧ ${e(formatDate(about.fechaNacimiento))}</span>`:''}<p>${e(about.presentacion||'Descripción personal pendiente de completar.')}</p>`;
 const interests=document.createElement('article');interests.className='personal-card interests-card';interests.innerHTML=`<span class="personal-icon">♄</span><span class="mini-title">MIS PASIONES</span><h3>Lo que me mueve a aprender</h3><p>${e(p.introduccion||'Un espacio para mis pasiones e intereses.')}</p>`;const cards=document.createElement('div');cards.className='interests-grid';
 for(const it of Array.isArray(p.intereses)?p.intereses:[]){const sub=document.createElement('div');sub.className='interest-chip';sub.innerHTML=`<strong>${e(it.nombre||'Interés')}</strong><p>${e(it.descripcion||'')}</p>`;cards.append(sub)}interests.append(cards);container.append(github,self,interests);box.append(container);
}
function fact(label,value){if(value==null||value===''||value==='No registrado')return null;const x=document.createElement('div');x.className='detail-fact';const a=document.createElement('span');a.textContent=label;const b=document.createElement('strong');b.textContent=Array.isArray(value)?value.join(', '):String(value);x.append(a,b);return x}
function detailsFor(item){const r=state.route;const info=itemInfo(item),details=[];let description=info.description||'',link='',source='API EXTERNA';
 if(r==='onepiece:fruits'){description=item.description||'';details.push(['Tipo',item.type],['Portador actual',item.owner],['Portador anterior',item.previousOwner],['Debut',item.debut],['Nombre japonés',item.japaneseName]);link='https://github.com/fccview/devil-fruits-tracker'}
 else if(r==='onepiece:characters'){description=info.description;details.push(['Origen',item.origin],['Afiliación',item.affiliation],['Ocupación',item.occupation],['Edad',item.age],['Recompensa',item.bounty?nfmt(item.bounty)+' berries':null],['Estado',item.status],['Debut',item.debut]);link='https://www.onepieceapi.com/documentation'}
 else if(r==='onepiece:islands'){description=typeof item.description==='string'?item.description:description;details.push(['Región',item.region],['Mar',item.sea],['Tipo',item.type]);link='https://www.onepieceapi.com/documentation'}
 else if(r==='dragonball:characters'){description=item.description||'';details.push(['Raza',item.race],['Ki',item.ki],['Ki máximo',item.maxKi],['Género',item.gender],['Afiliación',item.affiliation],['Planeta de origen',item.originPlanet?.name],['Transformaciones',Array.isArray(item.transformations)?item.transformations.length+' disponibles':null]);link=`https://dragonball-api.com/api/characters/${item.id}`}
 else if(r==='dragonball:transformations'){source=item.source==='editorial'?'FICHA COMPLEMENTARIA LOCAL':'DRAGON BALL API';description=item.note||item.description||'';details.push(['Ki',item.ki],['Personaje',item.character?.name||item.owner],['Origen del portador',item.ownerSource==='pending'?'Por confirmar en detalle':item.ownerSource]);link=item.source==='editorial'?'':`https://dragonball-api.com/api/transformations/${item.id}`}
 else if(r==='universo:physics'){source='FÓRMULA ESCOLAR · DATOS LOCALES';description=item.concept||'';details.push(['Fórmula',item.formula],['Variables',item.variables],['Ejemplo',item.example],['Tema',info.category]);const ref=state.physicsVerified?.linked?.get(item.id);link=ref?.wikipedia||'';if(ref?.wikidata?.tex)details.push(['Expresión adicional en Wikidata',ref.wikidata.tex])}
 else if(r.startsWith('universo:')){description=item.description||'';details.push(['Categoría',item.category],['Clasificación',item.class||item.object_type],['Distancia',item.distance_ly!=null?nfmt(item.distance_ly)+' años luz':null],['Masa solar',item.mass_msun!=null?nfmt(item.mass_msun)+' M☉':null],['Constelación',item.constellation],['Descubierto',item.discovered],['Ascensión recta',item.ra_deg!=null?nfmt(item.ra_deg)+'°':null],['Declinación',item.dec_deg!=null?nfmt(item.dec_deg)+'°':null],['Designaciones',item.designations]);link=item.slug?`https://spacecatalog.org/objects/${encodeURIComponent(item.slug)}`:'https://spacecatalog.org/'}
 return {info,description,details:details.filter(x=>x[1]!=null&&x[1]!==''&&x[1]!=='No registrado'),link:safeUrl(link),source};
}
function drawDetail(item,isLoading){if(!state.detailOpen)return;const v=detailsFor(item),body=$('detail-body');body.replaceChildren();const visual=createVisual(item,v.info);visual.classList.add('detail-cover');if(state.route.startsWith('universo:'))visual.classList.add('space-cover');visual.querySelector('.visual-label')?.remove();body.append(visual);
 const txt=document.createElement('div');txt.className='detail-text';const eyebrow=document.createElement('span');eyebrow.className='detail-eyebrow';eyebrow.textContent=v.source;const title=document.createElement('h2');title.id='detail-title';title.textContent=itemLabel(item);txt.append(eyebrow,title);
 const description=document.createElement('p');description.className='desc';description.textContent=v.description||'La fuente no dispone de una descripción para este registro.';txt.append(description);
 const facts=document.createElement('div');facts.className='detail-facts';for(const [k,val] of v.details){const f=fact(k,val);if(f)facts.append(f)}txt.append(facts);
 if(v.link){const anchor=document.createElement('a');anchor.className='external-detail';anchor.href=v.link;anchor.target='_blank';anchor.rel='noopener noreferrer';anchor.textContent='Consultar fuente externa ↗';txt.append(anchor)}
 const secondary=document.createElement('p');secondary.className='detail-secondary';secondary.textContent=isLoading?'Consultando detalles adicionales en la API...':'Los campos no suministrados por la fuente se omiten. Los contenidos locales se identifican expresamente.';txt.append(secondary);body.append(txt);
}
async function openDetail(item){state.focusReturn=document.activeElement;state.detailOpen=true;const token=++state.detailToken,route=state.route;
 $('detail-overlay').classList.remove('hidden');$('detail-overlay').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';$('detail-source').textContent='FICHA DE INFORMACIÓN';drawDetail(item,route.startsWith('dragonball:')||route.startsWith('universo:')&&route!=='universo:physics');$('detail-drawer').focus();
 if((route.startsWith('dragonball:')&&item.source!=='editorial')||(route.startsWith('universo:')&&route!=='universo:physics')){
  try{const detail=await fetchRemoteDetail(route,item);if(state.detailToken===token&&state.detailOpen&&route===state.route){drawDetail({...item,...detail},false)}}
  catch(err){if(state.detailToken===token&&state.detailOpen){drawDetail(item,false);const p=document.createElement('p');p.className='detail-secondary';p.textContent='No se pudo ampliar la ficha desde la API: '+err.message;$('detail-body').querySelector('.detail-text').append(p)}}
 }
}
function closeDetail(){if(!state.detailOpen)return;state.detailOpen=false;state.detailToken++;$('detail-overlay').classList.add('hidden');$('detail-overlay').setAttribute('aria-hidden','true');document.body.style.overflow='';state.focusReturn?.focus?.()}
async function startPhysicsVerification(){if(state.physicsVerified){setConnection('connected',`${state.physicsVerified.wikiPages} referencias verificadas`);return}if(state.physicsLoading)return;state.physicsLoading=true;setConnection('loading','Consultando Wikipedia y Wikidata...');
 try{const result=await verifyPhysics();state.physicsVerified=result;if(state.route==='universo:physics'){setConnection('connected',`Wikipedia · ${result.wikiPages} referencias`);setSourceNote(`43 fórmulas escolares locales. API Wikipedia conectada: ${result.wikiPages} fichas vinculadas. Wikidata: ${result.wikidataFormulas} expresiones adicionales.${result.wikidataFailure?' Algunas consultas a Wikidata no respondieron.':''}`)}}
 catch(err){if(state.route==='universo:physics'){setConnection('error','Sin conexión a referencias');setSourceNote('Las 43 fórmulas locales permanecen disponibles. La API de Wikipedia o Wikidata no respondió: '+err.message)}}
 finally{state.physicsLoading=false}
}
function bind(){document.querySelectorAll('[data-section]').forEach(b=>b.addEventListener('click',()=>selectSection(b.dataset.section,undefined,true)));
 $('search-input').addEventListener('input',evt=>{state.query=evt.target.value;state.visibleLimit=12;if(state.remote)state.remote=null;renderResults()});
 $('search-form').addEventListener('submit',async evt=>{evt.preventDefault();state.query=$('search-input').value.trim();state.visibleLimit=12;
  if(state.section==='universo'&&state.tab!=='physics'&&state.query.length>=2){const route=state.route,token=state.token;setConnection('loading','Buscando en SpaceCatalog...');showSkeleton();try{const r=await searchSpace(state.query,state.tab);if(route!==state.route||token!==state.token)return;state.remote=r;setConnection('connected',`${nfmt(r.items.length)} resultados de búsqueda API`);state.loading=false;renderResults()}catch(err){if(route!==state.route)return;state.loading=false;setConnection('error','Error de búsqueda');showError(err.message,false)}}else renderResults();
  $('results-grid').scrollIntoView({behavior:'smooth',block:'start'})});
 $('category-filter').addEventListener('change',evt=>{state.filter=evt.target.value;state.visibleLimit=12;renderResults()});
 $('refresh-button').addEventListener('click',()=>{state.query='';state.filter='all';state.remote=null;$('search-input').value='';loadActiveRoute(true)});
 $('load-more').addEventListener('click',loadMore);
 $('detail-close').addEventListener('click',closeDetail);$('detail-backdrop').addEventListener('click',closeDetail);
 document.addEventListener('keydown',evt=>{if(evt.key==='Escape'&&state.detailOpen){closeDetail();return}if((evt.key==='/'||evt.ctrlKey&&evt.key.toLowerCase()==='k')&&!/^(input|textarea|select)$/i.test(document.activeElement?.tagName||'')&&!state.detailOpen){if(!TABS[state.section])return;evt.preventDefault();$('search-input').focus()}});
 window.addEventListener('popstate',()=>{const r=parseHash();selectSection(r.section,r.tab,false,true)});
}
// Start without a connection claim; sources are requested only when the user opens a collection.
bind();const initial=parseHash();selectSection(initial.section,initial.tab,false,true);
