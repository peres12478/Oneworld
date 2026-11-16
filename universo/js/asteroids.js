/* Arcade de asteroides completamente local: física de juego, sin datos astronómicos inventados. */
export class AsteroidsGame{
 constructor(canvas,{onUpdate,onEnd,onSfx}={}){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.updateUI=onUpdate||(()=>{});this.onEnd=onEnd||(()=>{});this.onSfx=onSfx||null;
  this.running=false;this.keys=new Set();this.ship={x:canvas.width/2,y:canvas.height-65};this.points=0;this.lives=3;this.rocks=[];this.bullets=[];this.last=0;this.spawnClock=0;this.shotClock=0;this.frameId=0;this.stars=Array.from({length:100},(_,i)=>({x:(i*251+73)%canvas.width,y:(i*131+17)%canvas.height,r:i%11===0?2:1}));this.draw(0);}
 start(){this.stop();this.running=true;this.points=0;this.lives=3;this.ship.x=this.canvas.width/2;this.rocks=[];this.bullets=[];this.spawnClock=0;this.shotClock=0;this.last=0;this.updateUI(this.points,this.lives);this.frameId=requestAnimationFrame(t=>this.loop(t));}
 stop(){this.running=false;this.keys.clear();if(this.frameId)cancelAnimationFrame(this.frameId);this.frameId=0;}
 move(dir,on){if(on)this.keys.add(dir);else this.keys.delete(dir);}
 fire(){if(!this.running||this.shotClock>0)return;this.bullets.push({x:this.ship.x,y:this.ship.y-42});this.shotClock=.16;this.beep(520,.05);}
 beep(freq=440,duration=.05){if(this.onSfx){this.onSfx(freq,duration);return;}try{if(!this.audio)this.audio=new (window.AudioContext||window.webkitAudioContext)();const osc=this.audio.createOscillator();const amp=this.audio.createGain();osc.type='triangle';osc.frequency.value=freq;amp.gain.setValueAtTime(.032,this.audio.currentTime);amp.gain.exponentialRampToValueAtTime(.0001,this.audio.currentTime+duration);osc.connect(amp);amp.connect(this.audio.destination);osc.start();osc.stop(this.audio.currentTime+duration);}catch(e){}}
 loop(t){if(!this.running)return;const dt=this.last?Math.min(.045,(t-this.last)/1000):.016;this.last=t;this.tick(dt);this.draw(t);if(this.running)this.frameId=requestAnimationFrame(n=>this.loop(n));}
 tick(dt){const w=this.canvas.width,h=this.canvas.height;
  if(this.keys.has('a'))this.ship.x-=390*dt;if(this.keys.has('d'))this.ship.x+=390*dt;this.ship.x=Math.max(33,Math.min(w-33,this.ship.x));
  this.shotClock=Math.max(0,this.shotClock-dt);if(this.keys.has('f'))this.fire();
  this.spawnClock+=dt;const interval=Math.max(.37,.95-this.points/5000);if(this.spawnClock>=interval){this.spawnClock=0;this.rocks.push({x:28+Math.random()*(w-56),y:-30,r:18+Math.random()*19,speed:96+Math.random()*92+this.points/9,angle:Math.random()*6,spin:(Math.random()-.5)*2});}
  for(const b of this.bullets)b.y-=650*dt;for(const a of this.rocks){a.y+=a.speed*dt;a.angle+=a.spin*dt;}
  this.bullets=this.bullets.filter(b=>b.y>-20);
  for(const a of this.rocks){for(const b of this.bullets){if(Math.hypot(b.x-a.x,b.y-a.y)<a.r+6){a.dead=true;b.dead=true;this.points+=100;this.beep(240+Math.random()*180,.08);break;}}
   if(!a.dead&&a.y>h-78&&Math.abs(a.x-this.ship.x)<a.r+24){a.dead=true;this.lives--;this.beep(90,.21);}
   else if(!a.dead&&a.y>h+30){a.dead=true;this.lives--;}}
  this.rocks=this.rocks.filter(a=>!a.dead);this.bullets=this.bullets.filter(b=>!b.dead);this.updateUI(this.points,this.lives);
  if(this.lives<=0){this.stop();this.onEnd(this.points);}
 }
 draw(time){const c=this.ctx,w=this.canvas.width,h=this.canvas.height;c.clearRect(0,0,w,h);const bg=c.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#020a21');bg.addColorStop(1,'#112449');c.fillStyle=bg;c.fillRect(0,0,w,h);
  this.stars.forEach(s=>{c.fillStyle='rgba(187,222,255,.7)';c.fillRect(s.x,((s.y+(time||0)*.012)%h),s.r,s.r);});
  c.save();c.translate(w*.68,135);let haze=c.createRadialGradient(0,0,10,0,0,195);haze.addColorStop(0,'#55b4dc27');haze.addColorStop(1,'#55b4dc00');c.fillStyle=haze;c.beginPath();c.arc(0,0,195,0,7);c.fill();c.restore();
  for(const b of this.bullets){c.fillStyle='#a7fbff';c.shadowColor='#5cf9ff';c.shadowBlur=15;c.fillRect(b.x-3,b.y-14,6,21);c.shadowBlur=0;}
  for(const a of this.rocks){c.save();c.translate(a.x,a.y);c.rotate(a.angle);c.beginPath();for(let i=0;i<10;i++){const angle=i*Math.PI*2/10;const rad=a.r*(i%2?.83:1.12);i?c.lineTo(Math.cos(angle)*rad,Math.sin(angle)*rad):c.moveTo(Math.cos(angle)*rad,Math.sin(angle)*rad);}c.closePath();c.fillStyle='#776979';c.fill();c.lineWidth=4;c.strokeStyle='#d9ab8b';c.stroke();c.fillStyle='#504458';c.beginPath();c.arc(-a.r*.2,-a.r*.18,a.r*.23,0,7);c.fill();c.restore();}
  c.save();c.translate(this.ship.x,this.ship.y);c.shadowColor='#63d0ff';c.shadowBlur=20;c.fillStyle='#ffb05e';c.beginPath();c.moveTo(-10,29);c.lineTo(0,53+Math.random()*16);c.lineTo(10,29);c.fill();c.shadowBlur=0;
  c.fillStyle='#ed6073';c.beginPath();c.moveTo(-21,14);c.lineTo(-32,38);c.lineTo(-7,26);c.fill();c.beginPath();c.moveTo(21,14);c.lineTo(32,38);c.lineTo(7,26);c.fill();
  c.fillStyle='#e5f8ff';c.strokeStyle='#7ca3cb';c.lineWidth=4;c.beginPath();c.moveTo(0,-43);c.bezierCurveTo(-27,-18,-19,19,-15,34);c.lineTo(15,34);c.bezierCurveTo(19,19,27,-18,0,-43);c.fill();c.stroke();c.fillStyle='#4bb5e7';c.beginPath();c.arc(0,-12,10,0,Math.PI*2);c.fill();c.restore();
 }
}
