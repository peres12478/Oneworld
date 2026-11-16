/* Gear 5: animaciones originales SVG para el puño caricaturesco y el Tambor de
   la Liberación. No requiere imágenes ni servidores adicionales. La detección
   de golpes permanece en los módulos de habilidades y jefe. */
(function(){
  'use strict';
  const OP=window.OP, NS='http://www.w3.org/2000/svg';
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const smooth=n=>{const t=clamp(n,0,1);return t*t*(3-2*t);};
  const make=(tag,attrs={})=>{
    const e=document.createElementNS(NS,tag);
    Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v)));
    return e;
  };
  const attrs=(e,values)=>Object.entries(values).forEach(([k,v])=>e.setAttribute(k,String(v)));
  let layer,player,punch=null,drum=null,drumCooldown=0;
  const DRUM_COOLDOWN=12;

  function init(){
    player=document.getElementById('room-player');
    layer=make('svg',{class:'gear5-fx-layer',viewBox:'0 0 3250 560','aria-hidden':'true'});
    document.getElementById('room-world').append(layer);
  }
  function reset(){
    punch=null;drum=null;drumCooldown=0;
    if(layer)layer.replaceChildren();
    if(player)player.classList.remove('gear5-punching','drum-active','drum-landed');
  }

  function startPunch(){
    if(!layer||punch||drum)return false;
    const g=make('g',{class:'gear5-punch-group'});
    const cloud=make('g',{class:'gear5-fist-cloud'});
    const puff=make('g',{class:'gear5-white-puff'});
    puff.innerHTML=`<ellipse cx="-43" cy="0" rx="23" ry="29"/><ellipse cx="-19" cy="-16" rx="25" ry="26"/><ellipse cx="15" cy="-14" rx="33" ry="24"/><ellipse cx="43" cy="2" rx="24" ry="23"/><ellipse cx="14" cy="16" rx="47" ry="20"/>`;
    const outline=make('path',{fill:'none',stroke:'#30263a','stroke-width':'38','stroke-linecap':'round'});
    const skin=make('path',{fill:'none',stroke:'#ffc994','stroke-width':'30','stroke-linecap':'round'});
    const shine=make('path',{fill:'none',stroke:'#fff1c9','stroke-width':'5','stroke-linecap':'round',opacity:'.86'});
    const coil=make('path',{fill:'none',stroke:'#ffffff','stroke-width':'7','stroke-linecap':'round',opacity:'.72'});
    const fist=make('g',{class:'gear5-fist'});
    fist.innerHTML=`<path d="M-48,-23 Q-53,-43 -32,-49 Q-17,-62 -1,-48 Q20,-63 36,-46 Q59,-47 63,-24 Q77,-7 62,13 Q64,38 40,43 Q4,59 -31,43 Q-61,31 -62,4 Z" fill="#ffc990" stroke="#302439" stroke-width="6" stroke-linejoin="round"/>
      <path d="M-37,-38 Q-29,-22 -30,-11 M-9,-46 Q-1,-30 -3,-13 M23,-43 Q30,-29 25,-12 M46,-30 Q50,-14 40,-6" fill="none" stroke="#976454" stroke-width="4" stroke-linecap="round"/>
      <path d="M-45,8 Q-28,-4 -11,11 M-22,28 Q11,46 39,24" fill="none" stroke="#f3a573" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="-26" cy="-28" rx="14" ry="5" fill="#fff4d8" opacity=".8" transform="rotate(-22 -26 -28)"/>`;
    const speed=make('g',{class:'gear5-speed-lines'});
    speed.innerHTML='<path d="M-190 -56 l-120 -18 M-180 -22 l-150 -2 M-177 19 l-108 20 M-162 57 l-77 34"/>';
    const impact=make('g',{class:'gear5-comic-impact',opacity:0});
    impact.innerHTML=`<path d="M0 -105 L20 -47 69 -89 52 -23 122 -13 60 13 99 66 33 45 14 113 -12 52 -73 83 -50 19 -120 -11 -56 -29 -86 -92 -23 -58 Z" fill="#ffeeb0" stroke="#17243e" stroke-width="8" stroke-linejoin="round"/>
      <path d="M0 -79 L14 -34 50 -62 42 -14 83 -7 45 13 68 46 22 31 8 76 -14 36 -50 57 -35 9 -80 -8 -36 -23 -60 -61 -18 -42 Z" fill="#ff81a7" stroke="#fffdf5" stroke-width="4"/>
      <text y="12" text-anchor="middle" font-family="Impact,Arial Black,sans-serif" font-size="35" font-weight="900" fill="#12233d" stroke="#fff6df" stroke-width="1.2" paint-order="stroke">BOING!</text>`;
    cloud.append(puff,outline,skin,shine,coil,fist);
    g.append(speed,cloud,impact);
    layer.append(g);
    punch={g,cloud,puff,outline,skin,shine,coil,fist,speed,impact,impactAt:null,impactAge:0};
    player.classList.add('gear5-punching');
    return true;
  }

  function drawPunch({x,y,direction,t}){
    if(!punch)return 0;
    const baseX=x+52,baseY=y-120,dir=direction;
    // Se prepara, se dispara con un pequeño rebote y vuelve como una liga.
    let reach;
    if(t<.18)reach=11-8*smooth(t/.18);
    else if(t<.42){const p=smooth((t-.18)/.24);reach=5+451*p+22*Math.sin(Math.PI*p);}
    else if(t<.56)reach=456;
    else reach=456*(1-smooth((t-.56)/.34));
    reach=clamp(reach,0,472);
    const launch=clamp((t-.17)/.26,0,1);
    const tipX=baseX+dir*reach,tipY=baseY-7+Math.sin(t*16)*6;
    const wiggle=reach*0.11*Math.sin(t*22);
    const path=`M${baseX} ${baseY} C${baseX+dir*reach*.26} ${baseY-28-wiggle} ${baseX+dir*reach*.58} ${tipY+32+wiggle} ${tipX} ${tipY}`;
    attrs(punch.outline,{d:path});attrs(punch.skin,{d:path});
    attrs(punch.shine,{d:`M${baseX} ${baseY-8} Q${baseX+dir*reach*.48} ${baseY-40+wiggle} ${tipX-dir*19} ${tipY-10}`});
    attrs(punch.coil,{d:reach>105?`M${baseX+dir*reach*.35} ${baseY-34} q${dir*22} -21 ${dir*44} 4 t${dir*45} 0`:'',opacity:launch*.66});
    const size=(.43+2.25*smooth(reach/360))*(t>.54?1+.07*Math.sin((t-.54)*24):1);
    attrs(punch.fist,{transform:`translate(${tipX} ${tipY}) scale(${dir*size} ${size*(t>.37&&t<.56?.88:1)})`,opacity:reach<8?0:1});
    attrs(punch.speed,{transform:`translate(${tipX} ${tipY}) scale(${dir} 1)`,opacity:t>.25&&t<.57?.7:0});
    attrs(punch.puff,{transform:`translate(${tipX-dir*80} ${tipY+13}) scale(${.34+smooth(reach/360)*.9})`,opacity:t>.2&&t<.75?.42:0});
    attrs(punch.cloud,{opacity:t>.87?Math.max(0,1-(t-.87)/.14):1});
    if(punch.impactAt){
      const age=t-punch.impactAge;
      attrs(punch.impact,{transform:`translate(${punch.impactAt.x} ${punch.impactAt.y}) rotate(${-13+Math.sin(age*30)*6}) scale(${.55+smooth(age/.13)*.8})`,opacity:age<.32?1:Math.max(0,1-(age-.32)/.22)});
    }
    // No golpear durante la preparación o el regreso.
    return t>.22&&t<.56?reach:0;
  }
  function punchImpact({x,y}){
    if(!punch||punch.impactAt)return;
    punch.impactAt={x,y};
    punch.impactAge=OP.abilities.getState()?.t||.4;
    OP.sfx?.playGear5Impact?.();
  }
  function stopPunch(){
    if(!punch)return;
    punch.g.remove();punch=null;
    player.classList.remove('gear5-punching');
  }

  function startDrum(){
    if(!layer||drum||punch||drumCooldown>0)return false;
    drumCooldown=DRUM_COOLDOWN;
    const g=make('g',{class:'gear5-drum-group'});
    const trail=make('g',{class:'gear5-drum-trail'});
    trail.innerHTML='<circle cx="-35" cy="0" r="23"/><circle cx="25" cy="-21" r="17"/><circle cx="57" cy="13" r="13"/><circle cx="-8" cy="25" r="12"/>';
    const ripple=make('g',{class:'gear5-drum-ripple',opacity:0});
    ripple.innerHTML=`<ellipse class="gear5-ripple-ring" rx="160" ry="34" cx="0" cy="0"/>
      <ellipse class="gear5-ripple-secondary" rx="106" ry="21" cx="0" cy="0"/>
      <path class="gear5-rubber-floor" d="M-240 0 Q-166 -66 -92 -12 Q0 62 92 -12 Q166 -66 240 0"/>
      <text x="0" y="-100" text-anchor="middle" font-size="39" font-weight="1000" font-family="Impact,Arial Black,sans-serif" class="gear5-drum-text">¡BOOOM!</text>`;
    g.append(trail,ripple);layer.append(g);
    drum={g,trail,ripple,t:0,phase:'air',impact:0,x:0,y:0};
    player.classList.add('drum-active');
    OP.sfx?.playGear5Drum?.();
    return true;
  }
  function land({x,y}){
    if(!drum||drum.phase!=='air')return false;
    drum.phase='land';drum.impact=0;drum.x=x+52;drum.y=y;
    player.classList.remove('drum-active');player.classList.add('drum-landed');
    OP.sfx?.playGear5Land?.();
    OP.boss?.areaHit?.({x:x+52,y:y-94,radius:310,damage:2});
    return true;
  }
  function update(dt,state){
    drumCooldown=Math.max(0,drumCooldown-dt);
    if(!drum)return;
    drum.t+=dt;
    if(drum.phase==='air'){
      const centerX=state.x+52,centerY=state.y-112;
      const wobble=Math.sin(drum.t*15)*10;
      attrs(drum.trail,{transform:`translate(${centerX} ${centerY+40}) rotate(${wobble}) scale(${.8+.2*Math.sin(drum.t*12)})`,opacity:'.9'});
      attrs(drum.ripple,{opacity:0});
    }else{
      drum.impact+=dt;
      const p=smooth(drum.impact/.57);
      attrs(drum.trail,{opacity:Math.max(0,1-drum.impact/.15)});
      attrs(drum.ripple,{transform:`translate(${drum.x} ${drum.y-8}) scale(${.15+1.45*p} ${.42+.64*p})`,opacity:Math.max(0,1-smooth((drum.impact-.17)/.55))});
      if(drum.impact>.78){
        drum.g.remove();drum=null;player.classList.remove('drum-landed');
      }
    }
  }
  const status=()=>({cooldown:drumCooldown,ready:drumCooldown<=0&&!drum,drumming:Boolean(drum)});
  OP.gear5={init,reset,startPunch,drawPunch,punchImpact,stopPunch,startDrum,land,update,status};
})();
