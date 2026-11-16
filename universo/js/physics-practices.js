/* ASTRA/LAB: cinco simulaciones interactivas en unidades SI. No usan la API. */
const G=9.81;
const RAD=Math.PI/180;
const EXPERIMENTS={
 projectile:{title:'Tiro parabólico',topic:'CINEMÁTICA · 2D',equation:'x = v₀ cos θ · t · y = v₀ sin θ · t − ½gt²',description:'Un proyectil sale del suelo con velocidad y ángulo elegidos. Ignoramos la resistencia del aire.',note:'Modelo sin resistencia del aire; mismo nivel de partida y llegada. g = 9,81 m/s².',duration:12,params:[['speed','Rapidez inicial',10,45,24,1,'m/s'],['angle','Ángulo de lanzamiento',15,75,45,1,'°']]},
 newton:{title:'Segunda ley de Newton',topic:'DINÁMICA · MOVIMIENTO',equation:'F = m · a  →  a = F / m',description:'Empuja un carrito sobre un riel horizontal ideal. Aumenta la fuerza o la masa y observa la aceleración.',note:'Sin rozamiento y con fuerza neta horizontal constante. El carrito parte del reposo.',duration:7,params:[['force','Fuerza neta',4,50,16,1,'N'],['mass','Masa del carrito',1,20,5,1,'kg']]},
 hooke:{title:'Ley de Hooke',topic:'ELASTICIDAD · OSCILACIONES',equation:'F = −k · x  ·  T = 2π√(m/k)',description:'Un resorte horizontal ideal mueve una masa. Modifica la rigidez y la masa para observar la frecuencia.',note:'Sin rozamiento. El desplazamiento inicial es de 0,20 m y la fuerza apunta al equilibrio.',duration:30,params:[['k','Constante elástica',8,80,28,1,'N/m'],['mass','Masa',1,10,3,1,'kg']]},
 pendulum:{title:'Péndulo simple',topic:'MOVIMIENTO PERIÓDICO',equation:'T ≈ 2π√(L/g)',description:'Observa cómo la longitud afecta al período de un péndulo. Usa ángulos pequeños para la aproximación.',note:'Modelo ideal de ángulo pequeño (5°–25°), sin rozamiento. El período mostrado es aproximado.',duration:30,params:[['length','Longitud de la cuerda',.5,3,1.6,.1,'m'],['angle','Ángulo inicial',5,25,17,1,'°']]},
 ohm:{title:'Ley de Ohm',topic:'ELECTRICIDAD · CIRCUITOS',equation:'V = I · R  →  I = V / R',description:'Conecta una fuente ideal y una resistencia. Controla voltaje y resistencia para ver el flujo de corriente.',note:'Circuito ideal de corriente continua, con resistencia constante y sin efectos térmicos.',duration:60,params:[['voltage','Voltaje de la fuente',3,24,12,1,'V'],['resistance','Resistencia',2,40,8,1,'Ω']]}
};
const TWO=Math.PI*2;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function n(v,d=2){return Number(v).toLocaleString('es-CO',{maximumFractionDigits:d,minimumFractionDigits:d});}
export class PhysicsPractices{
 constructor({canvas,selector,inputs,results,title,topic,equation,description,note,play,reset,time}={}){
  Object.assign(this,{canvas,selector,inputs,results,title,topic,equation,description,note,play,reset,time});
  this.ctx=canvas.getContext('2d');this.current='projectile';this.active=false;this.running=false;this.t=0;this.last=0;this.frame=0;this.values={};
  selector.addEventListener('click',e=>{const button=e.target.closest('[data-practice]');if(button)this.select(button.dataset.practice);});
  inputs.addEventListener('input',e=>{if(!e.target.matches('input[type=range]'))return;const key=e.target.dataset.param;this.values[key]=Number(e.target.value);this.t=0;this.running=false;this.refreshButtons();this.syncLabels();this.draw();this.updateResults();});
  play.addEventListener('click',()=>this.toggle());reset.addEventListener('click',()=>this.restart());
  this.select('projectile');
 }
 select(id){if(!EXPERIMENTS[id])return;this.current=id;const ex=EXPERIMENTS[id];this.t=0;this.running=false;this.last=0;this.values=Object.fromEntries(ex.params.map(([key,,,,value])=>[key,value]));
  this.title.textContent=ex.title;this.topic.textContent=ex.topic;this.equation.textContent=ex.equation;this.description.textContent=ex.description;this.note.textContent=ex.note;
  this.selector.querySelectorAll('[data-practice]').forEach(b=>{b.classList.toggle('chosen',b.dataset.practice===id);b.setAttribute('aria-pressed',String(b.dataset.practice===id));});
  this.inputs.innerHTML=ex.params.map(([key,label,min,max,value,step,unit])=>`<div class="practice-control"><label for="p-${key}"><span>${label}</span><output id="out-${key}" for="p-${key}"></output></label><input id="p-${key}" data-param="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" aria-label="${label}"></div>`).join('');
  this.syncLabels();this.refreshButtons();this.draw();this.updateResults();
 }
 syncLabels(){const ex=EXPERIMENTS[this.current];for(const [key,, , , , ,unit] of ex.params){const out=this.inputs.querySelector(`#out-${key}`);if(out)out.textContent=`${n(this.values[key],this.values[key]%1?1:0)} ${unit}`;}}
 refreshButtons(){this.play.textContent=this.running?'Ⅱ PAUSAR':'▶ INICIAR';this.play.setAttribute('aria-pressed',String(this.running));this.time.textContent=`t = ${n(this.t)} s`;}
 activate(){this.active=true;this.last=0;this.draw();this.updateResults();}
 deactivate(){this.active=false;this.running=false;this.last=0;this.refreshButtons();}
 toggle(){this.running=!this.running;if(this.t>=EXPERIMENTS[this.current].duration)this.t=0;this.last=0;this.refreshButtons();}
 restart(){this.running=false;this.t=0;this.last=0;this.refreshButtons();this.draw();this.updateResults();}
 tick(dt){if(!this.active||!this.running)return;if(this.running){this.t+=Math.max(0,Math.min(.045,dt));if(this.current==='projectile'){
  const {speed,angle}=this.values;const flight=2*speed*Math.sin(angle*RAD)/G;if(this.t>=flight){this.t=flight;this.running=false;}}
  if(this.t>=EXPERIMENTS[this.current].duration){this.t=EXPERIMENTS[this.current].duration;this.running=false;}
  this.refreshButtons();this.updateResults();}this.draw();}
 updateResults(){const v=this.values,t=this.t;let entries=[];
  if(this.current==='projectile'){const vx=v.speed*Math.cos(v.angle*RAD),vy=v.speed*Math.sin(v.angle*RAD),flight=2*vy/G;
   entries=[['Tiempo de vuelo',`${n(flight)} s`],['Alcance horizontal',`${n(vx*flight)} m`],['Altura máxima',`${n(vy*vy/(2*G))} m`],['Posición actual',`(${n(vx*t)} m, ${n(Math.max(0,vy*t-.5*G*t*t))} m)`]];}
  if(this.current==='newton'){const a=v.force/v.mass;entries=[['Aceleración',`${n(a)} m/s²`],['Velocidad actual',`${n(a*t)} m/s`],['Recorrido desde reposo',`${n(.5*a*t*t)} m`]];}
  if(this.current==='hooke'){const w=Math.sqrt(v.k/v.mass),x=.2*Math.cos(w*t);entries=[['Fuerza elástica',`${n(-v.k*x)} N`],['Desplazamiento',`${n(x,3)} m`],['Período',`${n(TWO/w)} s`],['Frecuencia',`${n(w/TWO)} Hz`]];}
  if(this.current==='pendulum'){const w=Math.sqrt(G/v.length),angle=v.angle*Math.cos(w*t);entries=[['Ángulo actual',`${n(angle)}°`],['Período aproximado',`${n(TWO/w)} s`],['Frecuencia aproximada',`${n(w/TWO)} Hz`],['Longitud',`${n(v.length,1)} m`]];}
  if(this.current==='ohm'){const I=v.voltage/v.resistance;entries=[['Corriente eléctrica',`${n(I)} A`],['Potencia disipada',`${n(v.voltage*I)} W`],['Ley de Ohm',`${n(v.voltage,0)} V = ${n(I)} A × ${n(v.resistance,0)} Ω`]];}
  this.results.innerHTML=entries.map(([a,b])=>`<div class="practice-result"><span>${a}</span><strong>${b}</strong></div>`).join('');
 }
 draw(){if(!this.ctx)return;const c=this.ctx,W=this.canvas.width,H=this.canvas.height;
  const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#091d3d');bg.addColorStop(1,'#050b21');c.fillStyle=bg;c.fillRect(0,0,W,H);
  c.strokeStyle='#3b86ab24';c.lineWidth=1;for(let x=0;x<W;x+=50){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}for(let y=0;y<H;y+=50){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
  c.fillStyle='#83e9ed';c.font='bold 13px system-ui';c.fillText('ASTRA / SIMULACIÓN FÍSICA',25,30);c.fillStyle='#9fbbd2';c.font='12px system-ui';c.fillText(EXPERIMENTS[this.current].topic,25,52);
  switch(this.current){case'projectile':this.drawProjectile(c,W,H);break;case'newton':this.drawNewton(c,W,H);break;case'hooke':this.drawHooke(c,W,H);break;case'pendulum':this.drawPendulum(c,W,H);break;case'ohm':this.drawOhm(c,W,H);break;}
 }
 drawProjectile(c,W,H){const {speed,angle}=this.values;const vx=speed*Math.cos(angle*RAD),vy=speed*Math.sin(angle*RAD),tf=2*vy/G,range=vx*tf,h=vy*vy/(2*G),scaleX=(W-140)/Math.max(45,range*1.12),scaleY=(H-148)/Math.max(12,h*1.24),x0=70,y0=H-73;
  c.fillStyle='#263f57';c.fillRect(0,y0,W,H-y0);c.strokeStyle='#67d7dd';c.lineWidth=3;c.beginPath();c.moveTo(25,y0);c.lineTo(W-25,y0);c.stroke();c.fillStyle='#96b8c9';c.font='12px system-ui';c.fillText('0 m',x0-13,y0+25);c.fillText(`${n(range)} m`,W-154,y0+25);
  c.beginPath();for(let i=0;i<=90;i++){const t=tf*i/90,x=x0+vx*t*scaleX,y=y0-(vy*t-.5*G*t*t)*scaleY;if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}c.strokeStyle='#78e9ee';c.lineWidth=3;c.setLineDash([10,8]);c.stroke();c.setLineDash([]);
  const t=Math.min(this.t,tf),x=x0+vx*t*scaleX,y=y0-Math.max(0,vy*t-.5*G*t*t)*scaleY;
  c.fillStyle='#ffce7d';c.shadowColor='#ffa947';c.shadowBlur=19;c.beginPath();c.arc(x,y,12,0,TWO);c.fill();c.shadowBlur=0;
  c.strokeStyle='#ffc98588';c.setLineDash([5,5]);c.beginPath();c.moveTo(x,y);c.lineTo(x,y0);c.stroke();c.setLineDash([]);this.tag(c,x+18,y-13,`x ${n(vx*t,1)} m`, '#ffd194');this.tag(c,x+18,y+8,`y ${n(Math.max(0,vy*t-.5*G*t*t),1)} m`,'#8ef6ef');
 }
 drawNewton(c,W,H){const a=this.values.force/this.values.mass,dis=.5*a*this.t*this.t,x=clamp(85+dis*9,85,W-100),ground=H-115;
  c.fillStyle='#233a53';c.fillRect(0,ground,W,H-ground);c.strokeStyle='#9fe0e9';c.lineWidth=6;c.beginPath();c.moveTo(40,ground);c.lineTo(W-30,ground);c.stroke();
  for(let j=1;j<14;j++){const tx=65+j*60;c.strokeStyle='#a0d0d350';c.lineWidth=1;c.beginPath();c.moveTo(tx,ground);c.lineTo(tx,ground+15);c.stroke();}
  c.fillStyle='#84d5f2';c.fillRect(x-55,ground-96,110,76);c.fillStyle='#275783';c.fillRect(x-44,ground-82,88,52);c.fillStyle='#f7d68d';for(const wheel of [-35,35]){c.beginPath();c.arc(x+wheel,ground-11,14,0,TWO);c.fill();}
  c.strokeStyle='#f7c16f';c.lineWidth=8;c.beginPath();c.moveTo(x-105,ground-58);c.lineTo(x-62,ground-58);c.stroke();c.fillStyle='#f7c16f';c.beginPath();c.moveTo(x-55,ground-58);c.lineTo(x-70,ground-72);c.lineTo(x-70,ground-44);c.fill();
  this.tag(c,40,95,`F = ${n(this.values.force,0)} N`,'#fbd38d');this.tag(c,40,121,`m = ${n(this.values.mass,0)} kg`,'#adebf4');this.tag(c,40,147,`a = ${n(a)} m/s²`,'#9cf5ce');this.tag(c,W-210,80,`x = ${n(dis)} m`,'#ddf4ff');
 }
 drawHooke(c,W,H){const k=this.values.k,m=this.values.mass,omega=Math.sqrt(k/m),xDisp=.2*Math.cos(omega*this.t),anchor=100,base=445,y=235,px=base+xDisp*630;
  c.fillStyle='#244e71';c.fillRect(anchor-35,y-94,30,184);c.strokeStyle='#bbd5e8';c.lineWidth=4;for(let yy=y-82;yy<y+80;yy+=13){c.beginPath();c.moveTo(anchor-35,yy);c.lineTo(anchor-60,yy+15);c.stroke();}
  c.strokeStyle='#93e1ee';c.lineWidth=5;c.beginPath();c.moveTo(anchor,y);const coils=13;for(let i=0;i<=coils*2;i++){const s=i/(coils*2),xx=anchor+(px-anchor-50)*s,yy=y+(i===0||i===coils*2?0:(i%2?31:-31));c.lineTo(xx,yy);}c.lineTo(px-50,y);c.stroke();
  c.fillStyle='#ffbb78';c.fillRect(px-49,y-58,98,116);c.fillStyle='#b95d5a';c.fillRect(px-35,y-43,70,83);c.strokeStyle='#85d9ec';c.lineWidth=2;c.beginPath();c.moveTo(base,y+104);c.lineTo(px,y+104);c.stroke();
  c.fillStyle='#bde5fa';c.font='13px system-ui';c.fillText('POSICIÓN DE EQUILIBRIO',base-93,y+133);this.tag(c,50,85,`x = ${n(xDisp,3)} m`,'#fbd38d');this.tag(c,50,110,`F = ${n(-k*xDisp)} N`,'#90f7e9');this.tag(c,50,135,`T = ${n(TWO/omega)} s`,'#bfddff');
 }
 drawPendulum(c,W,H){const L=this.values.length,theta0=this.values.angle*RAD,angle=theta0*Math.cos(Math.sqrt(G/L)*this.t),pivotX=W/2,pivotY=107,scale=clamp(L*145,100,290),bx=pivotX+Math.sin(angle)*scale,by=pivotY+Math.cos(angle)*scale;
  c.fillStyle='#748da7';c.fillRect(pivotX-110,pivotY-22,220,22);c.strokeStyle='#5ac9f2';c.lineWidth=4;c.beginPath();c.moveTo(pivotX,pivotY);c.lineTo(bx,by);c.stroke();c.strokeStyle='#7ac6d255';c.setLineDash([5,6]);c.beginPath();c.moveTo(pivotX,pivotY);c.lineTo(pivotX,pivotY+scale);c.stroke();c.setLineDash([]);
  c.shadowColor='#fece81';c.shadowBlur=18;c.fillStyle='#e9b968';c.beginPath();c.arc(bx,by,29,0,TWO);c.fill();c.shadowBlur=0;c.strokeStyle='#fff2c1';c.lineWidth=3;c.stroke();
  c.strokeStyle='#8ae8f1';c.lineWidth=2;c.beginPath();c.arc(pivotX,pivotY,40,Math.PI/2-angle,Math.PI/2,angle>0?false:true);c.stroke();
  this.tag(c,40,86,`L = ${n(L,1)} m`,'#99ebf3');this.tag(c,40,112,`θ = ${n(angle/RAD,1)}°`,'#ffd18d');this.tag(c,40,138,`T ≈ ${n(TWO*Math.sqrt(L/G))} s`,'#a4f5de');
 }
 drawOhm(c,W,H){const V=this.values.voltage,R=this.values.resistance,I=V/R,phase=this.t*Math.max(1,I)*1.5,p={x:W/2,y:H/2};
  c.strokeStyle='#87c9d7';c.lineWidth=9;c.lineJoin='round';c.strokeRect(160,132,W-320,H-238);c.fillStyle='#122f55';c.fillRect(155,243,38,62);
  c.strokeStyle='#eff7ff';c.lineWidth=5;c.beginPath();c.moveTo(143,260);c.lineTo(203,260);c.moveTo(150,279);c.lineTo(195,279);c.stroke();this.tag(c,99,331,`FUENTE ${n(V,0)} V`,'#a0f6f2');
  const ry=132;c.strokeStyle='#f6c176';c.lineWidth=6;c.beginPath();for(let j=0;j<=12;j++){const x=W/2-115+j*19,yy=ry+(j===0||j===12?0:j%2?-20:20);j?c.lineTo(x,yy):c.moveTo(x,yy);}c.stroke();this.tag(c,W/2-85,92,`${n(R,0)} Ω`,'#ffda9b');
  const rect=[[160,132],[W-160,132],[W-160,H-106],[160,H-106]];const perimeter=2*((W-320)+(H-238));
  for(let i=0;i<15;i++){let d=((i/15*perimeter+phase*80)%perimeter);let x,y;if(d<W-320){x=160+d;y=132;}else if((d-=W-320)<H-238){x=W-160;y=132+d;}else if((d-=H-238)<W-320){x=W-160-d;y=H-106;}else{x=160;y=H-106-(d-(W-320));}c.fillStyle='#80f7ff';c.shadowColor='#7deefe';c.shadowBlur=15;c.beginPath();c.arc(x,y,5,0,TWO);c.fill();}
  c.shadowBlur=0;this.tag(c,W/2-55,H/2,`I = ${n(I)} A`,'#99f7f6');this.tag(c,W/2-70,H/2+27,`P = ${n(V*I)} W`,'#ffd692');
 }
 tag(c,x,y,text,color){c.fillStyle=color;c.font='bold 14px system-ui';c.fillText(text,clamp(x,18,740),clamp(y,30,440));}
}
