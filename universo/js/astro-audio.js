/* Música espacial y efectos originales sintetizados con Web Audio API.
 * Solo se inician tras una interacción real del usuario (reglas autoplay). */
export class AstroAudio{
 constructor(button){this.button=button;this.enabled=true;this.ctx=null;this.scene='hangar';this.i=0;this.timer=null;
  button.addEventListener('click',()=>{this.enabled=!this.enabled;if(this.enabled)this.unlock();else this.suspend();this.updateButton();});this.updateButton();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.suspend();else if(this.ctx&&this.enabled)this.resume();});
  window.addEventListener('pagehide',()=>this.suspend());
 }
 updateButton(){this.button.textContent=this.enabled?'🔊 SONIDO ON':'🔇 SONIDO OFF';this.button.setAttribute('aria-pressed',String(this.enabled));}
 unlock(){if(!this.enabled)return;try{if(!this.ctx)this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.resume();}catch(e){this.button.title='El navegador no permite audio en este momento.';}}
 resume(){if(!this.ctx||!this.enabled)return;this.ctx.resume().catch(()=>{});if(!this.timer){this.timer=setInterval(()=>this.ambient(),720);this.ambient();}}
 suspend(){if(this.timer){clearInterval(this.timer);this.timer=null;}if(this.ctx&&this.ctx.state==='running')this.ctx.suspend().catch(()=>{});}
 setScene(scene){this.scene=scene;this.i=0;}
 note(freq,duration=.5,volume=.025,type='sine',start=0){if(!this.ctx||!this.enabled||this.ctx.state==='closed')return;try{let now=this.ctx.currentTime+start;let osc=this.ctx.createOscillator();let gain=this.ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,now);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),now+.07);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(now);osc.stop(now+duration+.03);}catch(e){}}
 ambient(){if(!this.enabled||!this.ctx||this.ctx.state!=='running')return;const melodies={hangar:[174.61,220,261.63,220,196,261.63,220,174.61],explore:[130.81,174.61,196,261.63,196,174.61,146.83,196],lab:[196,246.94,293.66,246.94,220,293.66,261.63,220],practices:[220,261.63,329.63,293.66,261.63,329.63,392,329.63],arcade:[220,330,440,330,246.94,369.99,493.88,369.99]};const seq=melodies[this.scene]||melodies.hangar,base=seq[(this.i++)%seq.length];this.note(base,1.08,.012,'sine');if(this.i%2===0)this.note(base/2,1.6,.008,'triangle');}
 play(type='interact'){if(!this.enabled||!this.ctx)return;const map={jump:[300,.16,.025,'sine'],door:[440,.38,.031,'triangle'],laser:[620,.11,.019,'sawtooth'],explore:[540,.24,.020,'sine'],select:[520,.14,.015,'triangle'],practice:[392,.32,.018,'sine']};const item=map[type]||map.select;this.note(...item);if(type==='door'){this.note(660,.32,.022,'sine',.12);}if(type==='practice'){this.note(587.33,.35,.017,'sine',.15);}}
}
