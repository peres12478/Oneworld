/* Detector de desconexión de Live Server: no necesita backend adicional.
 * El navegador no puede identificar de forma inequívoca una nueva instancia del
 * servidor estático. SessionStorage + heartbeat es la aproximación compatible.
 */
(function(){'use strict';
 const OP=window.OP;let disconnected=false,failures=0,busy=false;
 async function probe(){
  if(busy||location.protocol==='file:')return;busy=true;
  const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),2200);
  try{
   const response=await fetch('index.html?gle_ping='+Date.now(),{cache:'no-store',signal:ctrl.signal});
   if(!response.ok)throw new Error('Live Server no disponible');
   if(disconnected){OP.rewards.reset();location.reload();return;}
   failures=0;
  }catch(e){if(++failures>=2)disconnected=true;}
  finally{clearTimeout(timer);busy=false;}
 }
 function init(){setInterval(probe,1300);document.addEventListener('visibilitychange',()=>{if(!document.hidden)probe();});window.addEventListener('focus',probe);}
 OP.serverSession={init};
})();
