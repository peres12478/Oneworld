/* Puertas destruibles y puzzle 3x3 real de intercambiar piezas.
   No se puede entrar por una puerta rota: reparar antes de utilizarla.
   Una pieza muestra el recorte CORRECTO de una ilustracion SVG, no un numero aleatorio. */
(function(){
  'use strict';
  const OP=window.OP;
  const broken={characters:false,fruits:false};
  const progress={characters:null,fruits:null};
  const names={characters:'ISLAS Y PERSONAJES',fruits:'FRUTAS DEL DIABLO'};
  const selectors={characters:'.room-door-characters',fruits:'.room-door-fruits'};
  let active=null,board=[],selected=-1,moves=0,solved=false,modal,grid,message;
  const el=id=>document.getElementById(id);
  function doorEl(type){return document.querySelector(selectors[type]);}
  function cracks(){return `<svg class="portal-cracks" viewBox="0 0 160 245" aria-hidden="true"><path d="M80 0 L70 43 L99 75 L80 95 L105 126 L76 149 L62 189 L42 245 M99 75 L132 82 L146 119 M76 149 L20 161 L11 202" stroke="#ffe1ad" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M80 0 L70 43 L99 75 L80 95 L105 126 L76 149 L62 189 L42 245" stroke="#19293c" stroke-width="2" fill="none"/></svg>`;}
  function init(){
    modal=el('door-puzzle-modal');grid=el('door-puzzle-grid');message=el('door-puzzle-message');
    for(const type of Object.keys(broken)){
      const scene=doorEl(type);scene.querySelector('.portal-frame').insertAdjacentHTML('beforeend',cracks());
    }
    el('door-puzzle-close').addEventListener('click',close);
    el('door-puzzle-later').addEventListener('click',close);
    el('door-puzzle-shuffle').addEventListener('click',()=>{if(active){shuffle();render();}});
    modal.querySelector('.door-puzzle-backdrop').addEventListener('click',close);
    document.addEventListener('keydown',e=>{
      if(!active)return;
      if(e.key==='Escape'){e.preventDefault();close();}
    });
  }
  const isBroken=type=>Boolean(type && broken[type]);
  const isOpen=()=>Boolean(active);
  function resetAll(){
    close();
    Object.keys(broken).forEach(type=>{
      broken[type]=false;progress[type]=null;
      const scene=doorEl(type);
      scene?.classList.remove('is-broken','just-broken');
    });
  }
  function breakDoor(type){
    if(!Object.prototype.hasOwnProperty.call(broken,type)||broken[type])return false;
    broken[type]=true;progress[type]=null;
    const scene=doorEl(type);
    scene.classList.add('is-broken','just-broken');
    scene.addEventListener('animationend',()=>scene.classList.remove('just-broken'),{once:true});
    // El impacto se ve primero, luego aparece el menu de reconstruccion.
    window.setTimeout(()=>{
      if(broken[type]&&!active&&!el('room-screen').classList.contains('hidden'))open(type);
    },650);
    return true;
  }
  function shuffle(){
    board=[0,1,2,3,4,5,6,7,8];
    // Intercambios por parejas aseguran un reto resoluble con cualquier orden.
    for(let i=0;i<13;i++){
      const a=Math.floor(Math.random()*9);let b=Math.floor(Math.random()*9);
      if(a===b)b=(b+1)%9;
      [board[a],board[b]]=[board[b],board[a]];
    }
    if(board.every((v,i)=>v===i)) [board[0],board[8]]=[board[8],board[0]];
    selected=-1;moves=0;solved=false;
  }
  function tile(id,position){
    const b=document.createElement('button');
    b.type='button';b.className='door-puzzle-piece';
    b.setAttribute('aria-label',`Pieza ${id+1}, posicion ${position+1}`);
    b.dataset.piece=String(id);
    b.style.backgroundPosition=`${(id%3)*50}% ${Math.floor(id/3)*50}%`;
    if(position===selected)b.classList.add('selected');
    const number=document.createElement('span');number.textContent=id+1;
    b.append(number);
    b.addEventListener('click',()=>choose(position));
    return b;
  }
  function render(){
    if(!active)return;
    grid.replaceChildren(...board.map((part,index)=>tile(part,index)));
    el('door-puzzle-moves').textContent=`${moves} MOVIMIENTO${moves===1?'':'S'}`;
    message.textContent=selected===-1?'Selecciona dos piezas para intercambiarlas.':`Pieza ${board[selected]+1} seleccionada. Escoge dónde colocarla.`;
  }
  function choose(i){
    if(solved||!active)return;
    if(selected===-1){selected=i;render();return;}
    if(selected===i){selected=-1;render();return;}
    [board[i],board[selected]]=[board[selected],board[i]];
    moves++;selected=-1;render();
    if(board.every((v,i)=>v===i)){
      solved=true;
      grid.classList.add('is-solved');
      message.textContent=`¡PUERTA RECONSTRUIDA! ${moves} movimientos. Ya puedes entrar.`;
      window.setTimeout(()=>finish(),1000);
    }
  }
  function open(type){
    if(!isBroken(type)||active)return false;
    active=type;
    OP.abilities.reset();
    if(progress[type]){board=[...progress[type].board];moves=progress[type].moves;selected=-1;solved=false;}
    else shuffle();
    grid.classList.remove('is-solved');
    el('door-puzzle-title').innerHTML='RECONSTRUYE <em>LA PUERTA</em>';
    el('door-puzzle-description').textContent=`${names[type]} quedó destruida tras el ataque. Reconstruye el portal para poder entrar.`;
    modal.classList.remove('hidden');modal.setAttribute('aria-hidden','false');
    modal.dataset.kind=type;
    render();
    const first=grid.querySelector('button');if(first)first.focus({preventScroll:true});
    return true;
  }
  function close(){
    if(!modal)return;
    if(active && !solved)progress[active]={board:[...board],moves};
    active=null;
    modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');
    const view=el('room-viewport');if(!el('room-screen').classList.contains('hidden'))view.focus({preventScroll:true});
  }
  function finish(){
    if(!active||!solved)return;
    const type=active;
    broken[type]=false;progress[type]=null;
    doorEl(type).classList.remove('is-broken','just-broken');
    close();
    const note=el('room-door-hint-caption');
    note.textContent='✦ ¡PORTAL RECONSTRUIDO!';
  }
  OP.doorPuzzle={init,breakDoor,isBroken,isOpen,open,close,resetAll,
    debug:()=>({active,broken:{...broken},board:[...board],moves,solved})};
})();
