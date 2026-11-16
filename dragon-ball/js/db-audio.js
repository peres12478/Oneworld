/* Audio original Dragon Ball Explorer: música local y efectos Web Audio API.
   No se incluyen pistas ni efectos originales de la serie. */
(function(){'use strict';
 const music=document.getElementById('db-music');let context=null,muted=false,volume=.34;
 function ctx(){try{context ||= new (window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')context.resume().catch(()=>{});return context;}catch(_){return null;}}
 function tone(f,seconds=.12,type='triangle',gain=.11,delay=0,to){const c=ctx();if(!c||muted)return;const oscillator=c.createOscillator(),v=c.createGain(),start=c.currentTime+delay;oscillator.type=type;oscillator.frequency.setValueAtTime(Math.max(35,f),start);if(to)oscillator.frequency.exponentialRampToValueAtTime(Math.max(35,to),start+seconds);v.gain.setValueAtTime(.0002,start);v.gain.exponentialRampToValueAtTime(gain,start+.014);v.gain.exponentialRampToValueAtTime(.0001,start+seconds);oscillator.connect(v);v.connect(c.destination);oscillator.start(start);oscillator.stop(start+seconds+.02);}
 function noise(length=.18,gain=.06,delay=0){const c=ctx();if(!c||muted)return;const buffer=c.createBuffer(1,Math.floor(c.sampleRate*length),c.sampleRate),channel=buffer.getChannelData(0);for(let i=0;i<channel.length;i++)channel[i]=(Math.random()*2-1)*Math.exp(-i/channel.length*5);const node=c.createBufferSource(),v=c.createGain(),start=c.currentTime+delay;node.buffer=buffer;v.gain.setValueAtTime(gain,start);v.gain.exponentialRampToValueAtTime(.0001,start+length);node.connect(v);v.connect(c.destination);node.start(start);node.stop(start+length+.01);}
 function effect(name){if(muted)return;switch(name){
 case 'ki':tone(480,.16,'sawtooth',.12,0,1100);tone(920,.11,'triangle',.06,.03,350);break;
 case 'enemyKi':tone(260,.21,'sawtooth',.095,0,90);noise(.11,.025);break;
 case 'pinkBeamCharge':for(let i=0;i<9;i++)tone(115+i*43,.18,'sawtooth',.038,i*.13,280+i*40);noise(.45,.055);break;
 case 'pinkBeamFire':tone(295,.75,'sawtooth',.16,0,75);tone(510,.58,'square',.068,0,130);noise(.5,.15);break;
 case 'lightningWarn':tone(680,.16,'triangle',.065,0,330);tone(740,.16,'triangle',.06,.21,410);break;
 case 'lightningStrike':noise(.46,.2);tone(85,.44,'sawtooth',.13,0,55);tone(175,.25,'square',.065,0,90);break;
 case 'contactShock':tone(115,.25,'sawtooth',.085,0,55);noise(.13,.08);break;
 case 'deathBallCharge':for(let i=0;i<11;i++){tone(72+i*14,.30,'sawtooth',.045,i*.235,170+i*24);if(i%3===0)noise(.16,.045,i*.235);}break;
 case 'deathBallLaunch':tone(125,.8,'sawtooth',.19,0,55);tone(350,.65,'triangle',.12,0,90);noise(.58,.17);break;
 case 'deathBallHit':tone(95,.74,'sawtooth',.18,0,43);noise(.68,.21);break;
 case 'hit':tone(145,.16,'square',.08,0,60);noise(.2,.11);break;
 case 'hurt':tone(210,.19,'sawtooth',.1,0,105);break;
 case 'beam':for(let i=0;i<8;i++)tone(105+i*88,.32,'sawtooth',.045,i*.036,950+i*55);noise(.60,.09);break;
 case 'ssj':for(let i=0;i<12;i++){const f=75+i*32;tone(f,.24,'sawtooth',.055,i*.077,Math.min(1250,f*2.9));if(i%2===0)noise(.11,.028,i*.077);}tone(690,.9,'triangle',.11,.2,1350);break;
 case 'transformOff':tone(650,.44,'triangle',.07,0,160);break;
 case 'transformEnemy':tone(90,.75,'sawtooth',.12,0,355);noise(.6,.06);break;
 case 'enter':tone(420,.14,'triangle',.07,0,670);tone(680,.21,'triangle',.07,.12,880);break;
 case 'win':for(let i=0;i<4;i++)tone([390,490,580,780][i],.28,'triangle',.085,i*.17);break;
 case 'lose':for(let i=0;i<3;i++)tone([300,220,130][i],.34,'sawtooth',.075,i*.17);break;
 case 'jump':tone(230,.1,'triangle',.027,0,360);break;
 }}
 function swap(file){if(music.getAttribute('src')!==file){music.setAttribute('src',file);music.load();}resume();}
 function start(){enabled(!muted);swap('assets/namek-adventure.ogg');}
 function fight(){swap('assets/namek-battle.ogg');}
 function hub(){swap('assets/namek-adventure.ogg');}
 function pause(){music.pause();}
 function resume(){if(muted||document.hidden)return;music.volume=volume;const p=music.play();if(p?.catch)p.catch(()=>{});}
 function enabled(on){muted=!on;if(muted)music.pause();else resume();}
 window.DB_AUDIO={effect,start,fight,hub,pause,resume,enabled};
})();
