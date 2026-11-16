/* Modo pagina: consultas reales a las mismas fuentes que los mundos interactivos.
 * Ningun dato API simulado se utiliza como resultado de consulta.
 * Las 43 formulas escolares y las fichas complementarias se identifican como locales.
 */
import {formulas,categories as physicsCategories} from '../../universo/js/physics.js';
import {consultPhysicsAPIs} from '../../universo/js/physics-live-api.js';
import {readSpaceCategory,readSpaceDetail} from '../../universo/js/space-api.js';

const SPACE_BASE='https://spacecatalog.org/api/v1';
export const PHYSICS_CATEGORIES=physicsCategories;
export const FORMULAS=formulas;
const SPACE_DEFAULT_PAGE=24;
const spaceAllowed=new Set(['planet','moon','black_hole','exoplanet','galaxy','asteroid']);

async function getJson(url,timeout=17000){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);
 try{const response=await fetch(url,{method:'GET',headers:{Accept:'application/json'},credentials:'omit',signal:controller.signal});
  if(!response.ok)throw Error(`HTTP ${response.status} · ${new URL(url).hostname}`);
  const data=await response.json();if(data?.error)throw Error(data.error.message||'La API devolvió un error');return data;
 }finally{clearTimeout(timer);}
}
function collect(json){
 if(Array.isArray(json))return json;
 for(const arr of [json?.objects,json?.items,json?.data,json?.results,json?.records,json?.data?.objects,json?.data?.items,json?.results?.items,json?.body?.objects]){
  if(Array.isArray(arr))return arr;
 }
 throw Error('La API devolvió una respuesta con formato desconocido');
}
export async function loadSpace(category,offset=0){
 if(!spaceAllowed.has(category))throw Error('Categoría desconocida');
 if(['planet','moon','black_hole'].includes(category)){
  const r=await readSpaceCategory(category,offset,SPACE_DEFAULT_PAGE);
  return {items:r.records,total:r.total,hasMore:r.hasMore,source:'SpaceCatalog',url:r.url};
 }
 const url=new URL(`${SPACE_BASE}/objects`);
 url.searchParams.set('category',category);url.searchParams.set('offset',String(offset));url.searchParams.set('limit',String(SPACE_DEFAULT_PAGE));
 const j=await getJson(url.toString());const items=collect(j);const m=j?.pagination||j?.meta||{};
 return {items,total:m.total??m.count??j.total??null,hasMore:typeof m.has_more==='boolean'?m.has_more:typeof j.has_more==='boolean'?j.has_more:items.length===SPACE_DEFAULT_PAGE,source:'SpaceCatalog',url:url.toString()};
}
export async function searchSpace(term,category){
 if(!term||term.trim().length<2)throw Error('Escribe al menos dos caracteres para buscar en la API');
 const url=new URL(`${SPACE_BASE}/search`);
 url.searchParams.set('q',term.trim());url.searchParams.set('limit','40');
 if(spaceAllowed.has(category))url.searchParams.set('category',category);
 const j=await getJson(url.toString());const raw=collect(j);
 const items=raw.map(x=>x?.object||x).filter(x=>x&&typeof x==='object');
 return {items,total:items.length,hasMore:false,source:'SpaceCatalog · búsqueda remota',url:url.toString()};
}
export {readSpaceDetail};

export async function loadCollection(route,onProgress=()=>{}){
 switch(route){
  case 'onepiece:fruits':{
   if(!window.OP?.api?.loadAll)throw Error('No se pudo iniciar el módulo de One Piece');
   const r=await window.OP.api.loadAll(onProgress);
   return {items:r.fruits,source:r.transport==='JSON HTTPS del repositorio (respaldo)'?'JSON HTTPS de respaldo (API principal no disponible)':(r.source||'Devil Fruits Tracker API'),total:r.fruits.length,endpoint:r.endpoint,fallback:r.transport==='JSON HTTPS del repositorio (respaldo)'};
  }
  case 'onepiece:characters':case 'onepiece:islands':{
   if(!window.OP?.charactersAPI?.loadAll)throw Error('No se pudo iniciar el módulo de personajes One Piece');
   const r=await window.OP.charactersAPI.loadAll(onProgress);
   const items=route.endsWith('characters')?r.people:r.islands;
   if(!items.length)throw Error('La API de '+(route.endsWith('characters')?'personajes':'islas')+' no devolvió registros para este catálogo.');
   return {items,source:'One Piece API REST',total:items.length,endpoint:r.transport};
  }
  case 'dragonball:characters':{
   if(!window.DRAGON_BALL_API)throw Error('No se pudo iniciar Dragon Ball API');
   const r=await window.DRAGON_BALL_API.loadCharacters();
   return {items:r.items,source:'Dragon Ball API REST',total:r.items.length,endpoint:'https://dragonball-api.com/api/characters'};
  }
  case 'dragonball:transformations':{
   if(!window.DRAGON_BALL_API)throw Error('No se pudo iniciar Dragon Ball API');
   const r=await window.DRAGON_BALL_API.loadTransformations();
   return {items:r.items,source:'Dragon Ball API + fichas complementarias identificadas',total:r.items.length,endpoint:'https://dragonball-api.com/api/transformations'};
  }
  case 'universo:physics':return {items:formulas,source:'Catálogo escolar local (43 fórmulas); Wikipedia/Wikidata al verificar',total:formulas.length,local:true};
  default:{
   if(route.startsWith('universo:'))return loadSpace(route.split(':')[1]);
   throw Error('Colección no disponible');
  }
 }
}
export async function fetchRemoteDetail(route,item){
 if(route==='dragonball:characters'&&item?.id!=null)return await window.DRAGON_BALL_API.getCharacter(item.id);
 if(route==='dragonball:transformations'&&item?.id!=null&&item.source!=='editorial')return await window.DRAGON_BALL_API.getTransformation(item.id);
 if(route.startsWith('universo:')&&route!=='universo:physics'&&item?.slug)return await readSpaceDetail(item.slug);
 return item;
}
export async function verifyPhysics(){return await consultPhysicsAPIs(formulas);}
