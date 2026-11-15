/* Habilidades de la SALA: Luffy extiende un brazo; Roger corta con espada y Haki.
   La animacion es vectorial y solo visual: no afecta las consultas a las APIs.
   Se comprueba el impacto contra la posicion REAL de ambas puertas. */
(function(){
  'use strict';
  const OP=window.OP;
  const NS='http://www.w3.org/2000/svg';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
  const doors=[{type:'characters',x:1452},{type:'fruits',x:3007}];
  let root, player, svg, parts, attack=null, cooling=0;
  const make=(tag,attributes={})=>{
    const el=document.createElementNS(NS,tag);
    Object.entries(attributes).forEach(([k,v])=>el.setAttribute(k,v));
    return el;
  };
  const attr=(node,values)=>Object.entries(values).forEach(([k,v])=>node.setAttribute(k,v));

  function init(){
    root=document.getElementById('room-world');
    player=document.getElementById('room-player');
    svg=make('svg',{'class':'room-ability-layer',viewBox:'0 0 3250 560','aria-hidden':'true'});
    root.append(svg);
  }
  function reset(){
    attack=null;
    cooling=0;
    if(svg)svg.replaceChildren();
    if(player)player.classList.remove('using-ability','luffy-ability','roger-ability');
  }
  function setupLuffy(){
    const group=make('g',{'class':'rubber-strike'});
    const outline=make('path',{fill:'none',stroke:'#24212a','stroke-width':31,'stroke-linecap':'round'});
    const skin=make('path',{fill:'none',stroke:'#edac81','stroke-width':24,'stroke-linecap':'round'});
    const shine=make('path',{fill:'none',stroke:'#ffd8ad','stroke-width':4,'stroke-linecap':'round',opacity:'.8'});
    const fist=make('g');
    fist.innerHTML=`<path d="M-13,-18 C-6,-29 4,-31 10,-25 C17,-31 25,-24 24,-17 C32,-14 32,-5 27,0 C32,10 19,24 9,25 L-11,19 C-22,15 -26,4 -23,-7 Z" fill="#f3bc91" stroke="#2e2630" stroke-width="4" stroke-linejoin="round"/>
      <path d="M-2,-19 L-1,-6 M10,-20 L10,-7 M21,-15 L18,-4" fill="none" stroke="#9d6f5c" stroke-width="2.3" stroke-linecap="round"/>
      <path d="M-16,7 Q-7,2 -1,10" fill="none" stroke="#fff2ce" stroke-width="3" opacity=".65"/>`;
    group.append(outline,skin,shine,fist);svg.append(group);
    return {group,outline,skin,shine,fist};
  }
  function setupRoger(){
    const group=make('g',{'class':'sword-strike'});
    group.innerHTML=`<path d="M-27,8 L13,-6" stroke="#2b2038" stroke-width="14" stroke-linecap="round"/>
      <path d="M-25,8 L14,-6" stroke="#996a43" stroke-width="7" stroke-linecap="round"/>
      <path d="M8,-25 L23,15" stroke="#1d1828" stroke-width="10" stroke-linecap="round"/>
      <path d="M8,-25 L23,15" stroke="#ecd383" stroke-width="6" stroke-linecap="round"/>
      <path d="M16,-5 Q86,-25 172,-64 L149,-18 Q90,3 22,7 Z" fill="#dcefff" stroke="#212c48" stroke-width="5" stroke-linejoin="round"/>
      <path d="M28,-1 Q96,-28 162,-53" stroke="#fffdf1" stroke-width="5" stroke-linecap="round" opacity=".88"/>`;
    const slash=make('path',{'class':'haki-arc',fill:'none',stroke:'#dfbaff','stroke-width':'8','stroke-linecap':'round'});
    const inner=make('path',{'class':'haki-core',fill:'none',stroke:'#fff1d7','stroke-width':'3','stroke-linecap':'round'});
    const lightning1=make('path',{'class':'haki-spark',fill:'none',stroke:'#c9a1ff','stroke-width':'5','stroke-linejoin':'round'});
    const lightning2=make('path',{'class':'haki-spark',fill:'none',stroke:'#ffd16f','stroke-width':'4','stroke-linejoin':'round'});
    svg.append(group,slash,inner,lightning1,lightning2);
    return {group,slash,inner,lightning1,lightning2};
  }
  function fire({x,y,facing,character}){
    if(!svg||attack||cooling>0||OP.doorPuzzle.isOpen())return false;
    const direction=facing>=0?1:-1;
    attack={x,y,direction,character,t:0,hit:false};
    svg.replaceChildren();
    parts=character==='roger'?setupRoger():setupLuffy();
    player.classList.add('using-ability',character==='roger'?'roger-ability':'luffy-ability');
    return true;
  }
  function collision(reach){
    if(!attack||attack.hit||attack.y<210||reach<22)return;
    const origin=attack.x+52;
    for(const door of doors){
      if(OP.doorPuzzle.isBroken(door.type))continue;
      const distance=(door.x-origin)*attack.direction;
      // Colision del puño o de la onda de Haki con el volumen de la puerta.
      if(distance>=-25&&distance<=reach+38){
        attack.hit=true;
        OP.doorPuzzle.breakDoor(door.type);
        break;
      }
    }
  }
  function drawLuffy(){
    const a=attack,t=a.t;
    // Retroceso, extension elastica, impacto y regreso.
    let reach;
    if(t<.11)reach=12-8*smooth(t/.11);
    else if(t<.32)reach=4+342*smooth((t-.11)/.21);
    else if(t<.41)reach=346;
    else reach=346*(1-smooth((t-.41)/.28));
    const baseX=a.x+52,baseY=a.y-120,dir=a.direction;
    const tipX=baseX+dir*reach;
    const tipY=baseY-6-Math.sin(Math.PI*clamp(t/.7,0,1))*13;
    const curve=`M${baseX} ${baseY} C${baseX+dir*reach*.28} ${baseY-24} ${baseX+dir*reach*.62} ${tipY+22} ${tipX} ${tipY}`;
    attr(parts.outline,{d:curve});attr(parts.skin,{d:curve});
    attr(parts.shine,{d:`M${baseX} ${baseY-8} Q${baseX+dir*reach*.6} ${baseY-20} ${tipX-dir*6} ${tipY-7}`});
    attr(parts.fist,{transform:`translate(${tipX} ${tipY}) scale(${dir} 1)`,opacity:reach<5?0:1});
    collision(reach);
    parts.group.style.opacity=t>.61?String(Math.max(0,1-(t-.61)/.12)):'1';
  }
  function drawRoger(){
    const a=attack,t=a.t,dir=a.direction;
    const startX=a.x+52,startY=a.y-125;
    const sweep=smooth(clamp((t-.07)/.34,0,1));
    const deg=-72+110*sweep;
    attr(parts.group,{transform:`translate(${startX} ${startY}) scale(${dir} 1) rotate(${deg})`});
    // Estela curva; los relampagos cambian de longitud al avanzar el corte.
    const spread=clamp((t-.13)/.34,0,1);
    const length=spread*325;
    const endX=startX+dir*length;
    const endY=startY-16-40*Math.sin(spread*Math.PI);
    const trail=`M${startX+dir*48} ${startY-24} Q${startX+dir*length*.65} ${startY-133} ${endX} ${endY}`;
    attr(parts.slash,{d:trail,opacity:t<.17||t>.68?0:.7});
    attr(parts.inner,{d:trail,opacity:t<.17||t>.68?0:1});
    attr(parts.lightning1,{d:`M${startX+dir*53} ${startY-32} l${dir*43} -26 l${dir*11} 13 l${dir*73} -42 l${dir*18} 18 l${dir*85} -27`,opacity:t<.2||t>.6?0:.88});
    attr(parts.lightning2,{d:`M${startX+dir*65} ${startY+22} l${dir*49} -36 l${dir*22} 13 l${dir*72} -38 l${dir*23} 13`,opacity:t<.24||t>.67?0:.8});
    parts.group.style.opacity=t>.62?String(Math.max(0,1-(t-.62)/.17)):'1';
    collision(length);
  }
  function update(dt){
    cooling=Math.max(0,cooling-dt);
    if(!attack)return;
    attack.t+=dt;
    if(attack.character==='roger')drawRoger();else drawLuffy();
    if(attack.t> (attack.character==='roger'?.79:.71)){
      attack=null;cooling=.19;
      svg.replaceChildren();
      player.classList.remove('using-ability','roger-ability','luffy-ability');
    }
  }
  OP.abilities={init,reset,fire,update,active:()=>Boolean(attack),getState:()=>attack};
})();
