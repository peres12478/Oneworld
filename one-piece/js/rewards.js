/* Recompensas de la PARTIDA de esta pestaña. No usar localStorage permanente. */
(function(){'use strict';
 const OP=window.OP,KEY='grand-line-explorer-v213-current-run';
 const empty=()=>({luffy:false,roger:false,gear5:false});
 let saved=empty();
 try {const value=JSON.parse(sessionStorage.getItem(KEY)||'{}');saved={luffy:value.luffy===true,roger:value.roger===true,gear5:value.luffy===true&&value.gear5===true};}
 catch(e){console.warn('Partida temporal en memoria:',e);}
 // Borrar las recompensas persistentes de versiones anteriores.
 try{localStorage.removeItem('grand-line-explorer-v211-boss-rewards');}catch(e){}
 const notify=()=>window.dispatchEvent(new Event('gle:rewards-changed'));
 function save(){try{sessionStorage.setItem(KEY,JSON.stringify(saved));}catch(e){console.warn('Almacenamiento temporal no disponible',e);}notify();}
 function has(character){return saved[character]===true;}
 function isGear5(){return has('luffy')&&saved.gear5===true;}
 function unlock(character){if(!['luffy','roger'].includes(character))return false;
   const wasUnlocked=has(character);saved[character]=true;if(character==='luffy'&&!wasUnlocked)saved.gear5=true;save();return !wasUnlocked;}
 function setGear5(value){if(!has('luffy'))return false;saved.gear5=Boolean(value);save();return true;}
 function toggleGear5(){return setGear5(!isGear5());}
 function reset(){saved=empty();try{sessionStorage.removeItem(KEY);}catch(e){}notify();}
 function sprite(character){return character==='luffy'&&isGear5()?'assets/luffy-gear5.png':OP.config.characters[character].src;}
 function rig(character,part){return `assets/${character==='luffy'&&isGear5()?'luffy-gear5':character}-${part}.png`;}
 OP.rewards={has,isGear5,unlock,setGear5,toggleGear5,reset,sprite,rig};
})();
