/*
 * Una segunda API REAL para el nuevo universo de islas y personajes.
 * Documentación: https://www.onepieceapi.com/documentation
 * Endpoints: /api/characters (paginado) y /api/islands.
 * Es el mismo proxy CORS HTTPS GET que ya utilizamos para las imágenes.
 * No hay personajes de demostración ni perfiles inventados.
 */
(function () {
  'use strict';
  const OP=window.OP, C=OP.config, U=OP.util;
  let pending=null, cached=null;
  const base='https://www.onepieceapi.com/api/';
  const pageSize=100;
  function localized(value) {
    if(typeof value==='string')return value.trim();
    if(value && typeof value==='object') return String(value.en || value.romaji || value.jp || '').trim();
    return '';
  }
  function field(value) {
    if(typeof value==='string')return value;
    if(typeof value==='number')return String(value);
    if(Array.isArray(value))return value.map(field).filter(Boolean).join(', ');
    return localized(value);
  }
  function normalizePerson(record,index){
    const extra=record.extra_data && typeof record.extra_data==='object' ? record.extra_data : {};
    const name=localized(record.name);
    if(!name)return null;
    const bounties=Array.isArray(record.bounties)?record.bounties:[];
    const active=bounties.find(b=>b.is_active && Number.isFinite(Number(b.amount)));
    const known=bounties.filter(b=>Number.isFinite(Number(b.amount))).sort((a,b)=>Number(b.amount)-Number(a.amount));
    return {
      id: String(record.id || `api-${index}`), name,
      altNames:[localized(record.name?.romaji),localized(record.name?.jp)].filter(Boolean),
      image:U.isValidImage(record.image_url)?record.image_url:'',
      origin:field(extra.origin)||'No registrado',
      affiliation:field(extra.affiliation||extra.affiliations)||'No registrado',
      occupation:field(extra.occupation||extra.occupations)||'No registrado',
      debut:field(extra.first_appearance||extra.firstAppearance)||'No registrado',
      epithet:field(extra.epithet||extra.nickname)||'',
      status:field(record.status)||'No registrado',
      age:record.age==null?'No registrado':String(record.age),
      bounty:active?Number(active.amount):(known.length?Number(known[0].amount):null),
      source:'One Piece API REST', raw:record
    };
  }
  function fetchJson(upstream,signal){
    const req=C.imageCorsProxy + upstream;
    return fetch(req,{method:'GET',credentials:'omit',signal,headers:{Accept:'application/json'}})
      .then(async response=>{
        if(!response.ok)throw new Error('HTTP '+response.status+' desde '+upstream);
        const data=await response.json();
        if(!Array.isArray(data))throw new Error('La API no entregó una lista JSON: '+upstream);
        return data;
      });
  }
  async function getPage(resource,page,limit=pageSize){
    const url=new URL(base+resource);
    url.searchParams.set('page',String(page));url.searchParams.set('limit',String(limit));
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),Math.max(C.fetchTimeoutMs,25000));
    try{return await fetchJson(url.toString(),controller.signal);}
    finally{clearTimeout(timer);}
  }
  async function readAll(resource,onProgress=()=>{}){
    const all=[],ids=new Set();
    let effectiveSize=pageSize;
    // Algunos proveedores limitan internamente el tamaño de página solicitado.
    // Por ello NO suponemos que una respuesta con 20 < 100 sea la última página:
    // comprobamos también la página 2. Esto evita perder cientos de personajes.
    for(let page=1;page<=100;page++){
      const records=await getPage(resource,page);
      if(page===1&&records.length)effectiveSize=records.length;
      if(page>1&&!records.length)return all;
      let fresh=0;
      for(const record of records){
        const id=String(record.id||JSON.stringify(record.name||record));
        if(!ids.has(id)){ids.add(id);all.push(record);fresh++;}
      }
      if(page>1&&!fresh){
        // La fuente podría estar ignorando ?page=: no hay que repetir sin fin.
        throw new Error('La API repitió la misma página de '+resource+' en vez de paginar.');
      }
      onProgress({resource,page,loaded:all.length});
      if(page>1&&records.length<effectiveSize)return all;
    }
    throw new Error('Se alcanzó el máximo seguro de páginas de '+resource+' sin llegar al final.');
  }
  async function loadAll(onProgress=()=>{}){
    if(cached)return cached;
    if(pending)return pending;
    pending=(async()=>{
      // Las islas no deben perderse si falla esta petición secundaria.
      const islandsPromise=readAll('islands').catch(error=>{
        console.warn('No se pudieron obtener las imágenes de islas:',error);return [];
      });
      const records=await readAll('characters',onProgress);
      if(!records.length)throw new Error('La API no devolvió personajes.');
      const seen=new Map();
      records.forEach((r,i)=>{
        const character=normalizePerson(r,i);
        if(character)seen.set(character.id,character);
      });
      const islands=await islandsPromise;
      cached={people:[...seen.values()],islands,source:'ONE PIECE API · EN VIVO',transport:base,
        count:seen.size};
      return cached;
    })().finally(()=>{pending=null;});
    return pending;
  }
  const cleanName=text=>U.normalize(text).replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,' ').trim();
  function locatePerson(people,wanted){
    const q=cleanName(wanted);
    let found=people.find(person=>cleanName(person.name)===q || person.altNames.some(a=>cleanName(a)===q));
    if(found)return found;
    // El dataset puede invertir nombres/usar sobrenombres; solo aceptar
    // concordancias fuertes para no atribuir una ficha equivocada.
    if(q.length<5)return null;
    const matches=people.filter(person=>{
      const target=cleanName(person.name);
      return target.endsWith(' '+q) || target.startsWith(q+' ');
    });
    return matches.length===1?matches[0]:null;
  }
  function belongToIsland(person,island){
    const origin=cleanName(person.origin);
    if(!origin||origin==='no registrado')return false;
    const names=[island.name,...(island.aliases||[])].map(cleanName);
    return names.some(name=>name.length>4 && (origin===name || origin.includes(name)));
  }
  function forIsland(people,island){
    const gathered=[],seen=new Set();
    // Las asociaciones con una isla se curan editorialmente en island-data.js,
    // los DATOS de cada personaje sí se resuelven desde la API.
    island.people.forEach(wanted=>{
      const person=locatePerson(people,wanted);
      if(person && !seen.has(person.id)){gathered.push({...person,relationship:'Personaje asociado a esta isla'});seen.add(person.id);}
    });
    // Además agregamos todas las personas cuyo origen coincide de forma inequívoca.
    for(const person of people){
      if(!seen.has(person.id)&&belongToIsland(person,island)){
        gathered.push({...person,relationship:'Origen registrado en la API'});seen.add(person.id);
      }
    }
    return gathered;
  }
  function islandMetadata(islands,island){
    const names=[island.name,...(island.aliases||[])].map(cleanName);
    return islands.find(i=>names.includes(cleanName(localized(i.name))))||null;
  }
  OP.charactersAPI={loadAll,readAll,getPage,normalizePerson,forIsland,islandMetadata,locatePerson,localized,belongToIsland};
})();
