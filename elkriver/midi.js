// Tiny Standard MIDI File player: parses .mid files and plays them with a WebAudio synth.
const noiseLen=44100;
function parseMidi(buf){const d=new DataView(buf);let p=0;const u32=()=>{const v=d.getUint32(p);p+=4;return v},u16=()=>{const v=d.getUint16(p);p+=2;return v};
 if(u32()!==0x4d546864)throw new Error('not midi');const hl=u32();u16();u16();let div=u16();p=8+hl;if(div&0x8000)div=480;
 const ev=[],tempos=[[0,500000]];let order=0;
 while(p+8<=d.byteLength){const id=u32(),len=u32(),end=Math.min(d.byteLength,p+len);if(id!==0x4d54726b){p=end;continue}
  let tick=0,run=0;
  try{while(p<end){let dl=0,b;do{b=d.getUint8(p++);dl=(dl<<7)|(b&127)}while(b&128&&p<end);tick+=dl;let st=d.getUint8(p);if(st<128){st=run}else p++;
   if(st===0xff){const ty=d.getUint8(p++);let l=0;do{b=d.getUint8(p++);l=(l<<7)|(b&127)}while(b&128);if(ty===0x51&&l===3)tempos.push([tick,(d.getUint8(p)<<16)|(d.getUint8(p+1)<<8)|d.getUint8(p+2)]);p+=l}
   else if(st===0xf0||st===0xf7){let l=0;do{b=d.getUint8(p++);l=(l<<7)|(b&127)}while(b&128);p+=l}
   else{run=st;const hi=st&0xf0,ch=st&15,a=d.getUint8(p++);if(hi===0xc0)ev.push({tick,o:order++,k:'p',ch,a});else if(hi===0xd0){}else{const bb=d.getUint8(p++);if(hi===0x90&&bb>0)ev.push({tick,o:order++,k:'on',ch,a,b:bb});else if(hi===0x80||hi===0x90)ev.push({tick,o:order++,k:'off',ch,a})}}}}catch(e){}
  p=end}
 tempos.sort((a,b)=>a[0]-b[0]||0);const tm=[];let sec=0,pt=0,pu=500000;for(const[tk,us]of tempos){sec+=(tk-pt)/div*pu/1e6;pt=tk;pu=us;tm.push([tk,sec,us])}
 const toSec=tk=>{let i=0;while(i+1<tm.length&&tm[i+1][0]<=tk)i++;return tm[i][1]+(tk-tm[i][0])/div*tm[i][2]/1e6};
 ev.sort((a,b)=>a.tick-b.tick||a.o-b.o);const prog=new Array(16).fill(0),open=new Map(),notes=[];
 for(const e of ev){if(e.k==='p'){prog[e.ch]=e.a;continue}const key=e.ch*128+e.a;if(e.k==='on'){const n={t:toSec(e.tick),d:0,ch:e.ch,n:e.a,v:e.b,pr:prog[e.ch]};notes.push(n);(open.get(key)||open.set(key,[]).get(key)).push(n)}else{const q=open.get(key);if(q&&q.length){const n=q.shift();n.d=toSec(e.tick)-n.t}}}
 let len=0;for(const n of notes){if(!n.d)n.d=.25;n.d=Math.max(.05,Math.min(n.d,8));len=Math.max(len,n.t+n.d)}
 notes.sort((a,b)=>a.t-b.t);return{notes,len}}
// instrument families by GM program: [wave, cutoff, attack, release, decay-to, gain]
function inst(p){if(p<8)return['triangle',3500,.005,.18,.25,.9];if(p<16)return['sine',5000,.003,.4,.1,.8];if(p<24)return['square',1800,.01,.1,.8,.35];if(p<32)return['sawtooth',2200,.004,.12,.3,.45];if(p<40)return['sawtooth',520,.005,.08,.7,.85];if(p<56)return['sawtooth',1500,.12,.3,.9,.3];if(p<64)return['sawtooth',2500,.03,.12,.8,.35];if(p<80)return['sine',4500,.04,.15,.9,.7];if(p<88)return['square',3200,.01,.1,.8,.3];if(p<104)return['sawtooth',1300,.2,.4,.9,.28];return['triangle',3000,.01,.15,.4,.6]}
function createMidiMusic({base='audio/midi/',volume=.3,onSong,onEnd}={}){
 let ctx=null,master=null,noise=null,list=null,cache={},run=false,timer=0,song=null,t0=0,idx=0,last=-1,voices=0,active=new Set(),muted=false,loading=false;
 const ensure=()=>{if(ctx)return;const AC=window.AudioContext||window.webkitAudioContext;ctx=new AC();const comp=ctx.createDynamicsCompressor();master=ctx.createGain();master.gain.value=muted?0:volume;master.connect(comp);comp.connect(ctx.destination);noise=ctx.createBuffer(1,noiseLen,ctx.sampleRate);const nd=noise.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1};
 const track=(node,stopAt)=>{active.add(node);voices++;node.onended=()=>{active.delete(node);voices--};node.stop(stopAt)};
 const nz=(at,dur,hp,g,lp)=>{const s=ctx.createBufferSource();s.buffer=noise;const f=ctx.createBiquadFilter();f.type=lp?'lowpass':'highpass';f.frequency.value=hp;const e=ctx.createGain();e.gain.setValueAtTime(g,at);e.gain.exponentialRampToValueAtTime(.001,at+dur);s.connect(f);f.connect(e);e.connect(master);s.start(at,Math.random()*.5);track(s,at+dur+.02)};
 const tone=(at,f0,f1,dur,g,type='sine')=>{const o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,at);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),at+dur*.6);const e=ctx.createGain();e.gain.setValueAtTime(g,at);e.gain.exponentialRampToValueAtTime(.001,at+dur);o.connect(e);e.connect(master);o.start(at);track(o,at+dur+.02)};
 const drum=(n,at,v)=>{if(n===35||n===36)tone(at,160,42,.28,v*1.1);else if(n===38||n===40||n===39){nz(at,.17,1400,v*.7);tone(at,200,120,.1,v*.4,'triangle')}else if(n===37||n===31||n===33)nz(at,.05,2500,v*.5);else if(n===42||n===44||n===69||n===70)nz(at,.045,7000,v*.35);else if(n===46)nz(at,.22,6500,v*.3);else if(n===49||n===57||n===55||n===52)nz(at,.7,5000,v*.35);else if(n===51||n===53||n===59||n===56)nz(at,.3,8000,v*.22);else if(n>=41&&n<=50)tone(at,90+(n-41)*22,50+(n-41)*10,.25,v*.8);else nz(at,.06,3000,v*.3)};
 const note=(n,at)=>{const v=n.v/127;if(n.ch===9){drum(n.n,at,v);return}if(voices>56)return;const[w,cut,atk,rel,dec,g]=inst(n.pr),f=440*Math.pow(2,(n.n-69)/12),o=ctx.createOscillator();o.type=w;o.frequency.value=f;const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.frequency.value=cut;const e=ctx.createGain(),pk=Math.max(.01,v*g*.5),dur=Math.max(.06,n.d),sus=Math.max(.0008,pk*dec);e.gain.setValueAtTime(0,at);e.gain.linearRampToValueAtTime(pk,at+atk);e.gain.exponentialRampToValueAtTime(sus,at+Math.max(atk+.02,Math.min(dur,1.3)));e.gain.setValueAtTime(sus,at+dur);e.gain.exponentialRampToValueAtTime(.0005,at+dur+rel);o.connect(fl);fl.connect(e);e.connect(master);o.start(at);track(o,at+dur+rel+.03)};
 const load=async f=>{if(cache[f])return cache[f];let r=await fetch(base+f);if(!r.ok)r=await fetch(base+f+'.txt');if(!r.ok)throw new Error('fetch');return cache[f]=parseMidi(await r.arrayBuffer())};
 const killAll=()=>{for(const o of [...active]){try{o.onended=null;o.stop()}catch(e){}}active.clear();voices=0};
 let token=0;
 async function begin(id){const my=++token;loading=true;let s;try{s=await load(id+'.mid')}catch(e){loading=false;if(my===token&&run&&onEnd)setTimeout(()=>{if(my===token&&run)onEnd()},3000);return}loading=false;if(my!==token||!run)return;killAll();song=s;idx=0;t0=ctx.currentTime+.3;if(onSong)onSong(id)}
 function tick(){if(!run||!song)return;const now=ctx.currentTime;if(ctx.state==='suspended')return;const ns=song.notes;while(idx<ns.length&&t0+ns[idx].t<now+.4){const at=t0+ns[idx].t;if(at>=now-.03)note(ns[idx],Math.max(at,now));idx++}if(idx>=ns.length&&now>t0+song.len+.8){song=null;if(onEnd)onEnd()}}
 return{get playing(){return run&&ctx&&ctx.state==='running'},
  play(id){ensure();ctx.resume();run=true;token++;song=null;killAll();clearInterval(timer);timer=setInterval(tick,70);master.gain.value=muted?0:volume;begin(id)},
  stop(){run=false;token++;clearInterval(timer);song=null;if(ctx)killAll()},
  pause(){if(ctx&&run)ctx.suspend()},resume(){if(ctx&&run)ctx.resume()},
  setMuted(m){muted=m;if(master)master.gain.value=m?0:volume},
  setVolume(v){volume=v;if(master&&!muted)master.gain.value=v}}}
window.ERBMidi={create:createMidiMusic};
