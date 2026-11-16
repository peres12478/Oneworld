/* Consulta REAL en navegador. No hay datos de demostración disfrazados de resultados de la API. */
export const SPACE_API='https://spacecatalog.org/api/v1';
const allowed=new Set(['planet','moon','black_hole']);
export async function readSpaceCategory(category,offset=0,limit=24){
 if(!allowed.has(category))throw new Error('Categoría no válida');
 const url=new URL(SPACE_API+'/objects');
 url.searchParams.set('category',category);url.searchParams.set('limit',String(limit));url.searchParams.set('offset',String(offset));
 const response=await fetch(url.toString(),{headers:{Accept:'application/json'}});
 if(!response.ok)throw new Error(`HTTP ${response.status}: ${response.status===429?'demasiadas solicitudes a la API':'servicio no disponible'}`);
 const json=await response.json();
 const records=Array.isArray(json)?json:[json.objects,json.items,json.data,json.results,json.records,json.data?.objects,json.data?.items,json.results?.items,json.body?.objects,json.collection?.items].find(Array.isArray);
 if(!Array.isArray(records))throw new Error('La API cambió el formato de su respuesta. Comprueba el endpoint.');
 const meta=json.meta||json.pagination||{};
 return {records:records.filter(x=>x&&typeof x==='object'), total:meta.total??meta.count??json.total??null,
  hasMore:typeof meta.has_more==='boolean'?meta.has_more:typeof json.has_more==='boolean'?json.has_more:records.length===limit,
  release:json.release?.id||json.release||'',url:url.toString()};
}
export async function readSpaceDetail(slug){
 if(!slug||!/^[\w-]{1,150}$/.test(String(slug)))throw new Error('ID del objeto no válido');
 const response=await fetch(`${SPACE_API}/objects/${encodeURIComponent(slug)}`);
 if(!response.ok)throw new Error('No fue posible consultar la ficha detallada.');
 const record=await response.json();return record.object||record.data||record;
}
export async function readWikipediaArticle(title){
 const url=new URL('https://es.wikipedia.org/w/api.php');
 Object.entries({action:'query',format:'json',prop:'extracts',exintro:'1',explaintext:'1',redirects:'1',titles:title,origin:'*'}).forEach(([k,v])=>url.searchParams.set(k,v));
 const response=await fetch(url.toString());if(!response.ok)throw new Error(`Wikipedia API: HTTP ${response.status}`);
 const data=await response.json();const pages=Object.values(data.query?.pages||{});
 const found=pages.find(p=>p.pageid&&p.extract);if(!found)throw new Error('No se encontró un resumen enciclopédico para este tema.');
 return {title:found.title,summary:found.extract,link:`https://es.wikipedia.org/wiki/${encodeURIComponent(found.title.replace(/ /g,'_'))}`};
}
