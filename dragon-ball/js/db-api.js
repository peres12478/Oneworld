/* Dragon Ball API pública: https://dragonball-api.com/api.
 * No se reemplaza una respuesta fallida con resultados de muestra: el proyecto
 * académico debe evidenciar una consulta real y su estado.
 */
(function(){
'use strict';
const BASE='https://dragonball-api.com/api';
// La lista /transformations NO incluye el portador. Nunca inventar relaciones
// a partir de IDs: la API confirma al personaje en /transformations/{id}.
// Formas complementarias que la API puede omitir. No son datos devueltos por la API.
const SUPPLEMENTAL=[
{id:'local-ssg-goku',name:'Goku Super Saiyajin Dios',owner:'Goku',group:'Saiyajin',note:'Cabello rojo y aura divina; transformación Super Saiyan God.'},
{id:'local-ssg-vegeta',name:'Vegeta Super Saiyajin Dios',owner:'Vegeta',group:'Saiyajin',note:'Transformación divina de cabello rojo.'},
{id:'local-blue-evolved',name:'Vegeta Super Saiyajin Blue Evolucionado',owner:'Vegeta',group:'Saiyajin',note:'Variante más poderosa del Super Saiyajin Blue de Vegeta.'},
{id:'local-rose',name:'Goku Black Super Saiyajin Rosé',owner:'Goku Black',group:'Saiyajin',note:'Transformación de Goku Black con aura rosada.'},
{id:'local-ultra-ego',name:'Vegeta Ultra Ego',owner:'Vegeta',group:'Saiyajin',note:'Estado de combate desarrollado por Vegeta en el manga.'},
{id:'local-black-freezer',name:'Black Freezer',owner:'Freezer',group:'Freezer',note:'Nueva transformación negra y plateada de Freezer, presentada en el manga.'},
{id:'local-ui-sign',name:'Goku Ultra Instinto Señal',owner:'Goku',group:'Saiyajin',note:'Etapa inicial del Ultra Instinto.'},
{id:'local-ssj-god-goku',name:'Goku Kaioken',owner:'Goku',group:'Técnica',note:'Técnica de aumento temporal de poder, no transformación racial.'},
{id:'local-broly-wrath',name:'Broly Poder Iracundo',owner:'Broly',group:'Saiyajin',note:'Poder similar al del gran simio sin convertirse físicamente en uno.'}
];
const normalize=o=>String(o||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
async function request(url){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),11000);
 try{const r=await fetch(url,{headers:{Accept:'application/json'},signal:controller.signal});if(!r.ok)throw Error('HTTP '+r.status);return await r.json();}
 finally{clearTimeout(timer);}
}
async function paginated(url){
 let current=url;const visited=new Set(),all=[];
 while(current&&!visited.has(current)){
  visited.add(current);
  const response=await request(current);
  if(Array.isArray(response)){all.push(...response);break;}
  const rows=response?.items||response?.data||[];
  if(!Array.isArray(rows))throw Error('La API devolvió un formato inesperado');
  all.push(...rows);
  const next=response?.links?.next;
  current=typeof next==='string'&&next?new URL(next,BASE).href:null;
 }
 return all;
}
async function loadCharacters(){
 const items=await paginated(BASE+'/characters?limit=100');
 if(!items.length)throw Error('La API de personajes no devolvió registros');
 return {items,source:'api',message:items.length+' personajes recibidos en vivo desde Dragon Ball API.'};
}
async function loadTransformations(){
 const items=await paginated(BASE+'/transformations?limit=100');
 if(!items.length)throw Error('La API de transformaciones no devolvió registros');
 return {items:mergeTransformations(items),source:'api',message:items.length+' transformaciones consultadas en vivo y '+SUPPLEMENTAL.length+' fichas complementarias locales claramente identificadas.'};
}
function mergeTransformations(remote){
 const base=remote.filter(t=>t&&!t.deletedAt).map(t=>({...t,
   owner:t.character?.name||t.characterName||'Consultar ficha',
   ownerSource:t.character?.name||t.characterName?'api':'pending',source:'api'}));
 const known=new Set(base.map(t=>normalize(t.name)));
 const extra=SUPPLEMENTAL.filter(t=>!known.has(normalize(t.name))).map(t=>({...t,source:'editorial',ownerSource:'editorial',image:null,ki:'—'}));
 return [...base,...extra];
}
async function getCharacter(id){return await request(BASE+'/characters/'+encodeURIComponent(id));}
async function getTransformation(id){return await request(BASE+'/transformations/'+encodeURIComponent(id));}
window.DRAGON_BALL_API={loadCharacters,loadTransformations,getCharacter,getTransformation,normalize};
})();
