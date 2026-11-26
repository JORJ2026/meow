import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { makeCat, makeDog, selectedCat } from './char3d.js';

// 3D pong: the cat (you) on the left, the dog on the right. First to 5 wins.
const HX=10, HZ=6, BR=.36, WIN=5, PL=2.7, CX=-8.9, DX=8.9, LIM=HZ-PL/2, W0=HZ-BR;
// five difficulty levels: the yarn ball serves, caps out and speeds up faster each level; the dog also reacts quicker
const LVLS=[{n:'Kitten',s0:5,smax:11,g:1.03,a:.15,ai:4.8},{n:'Tabby',s0:6.2,smax:13.5,g:1.05,a:.2,ai:5.8},{n:'Alley Cat',s0:7.5,smax:17,g:1.06,a:.25,ai:7},{n:'Tiger',s0:9.5,smax:21,g:1.07,a:.3,ai:8.6},{n:'Lion',s0:12,smax:26,g:1.08,a:.4,ai:10.5}];
let LV=2,S0=7.5,SMAX=17,AIS=7,GAIN=1.06,ADD=.25;
function setLevel(n){LV=Math.max(0,Math.min(4,n));const d=LVLS[LV];S0=d.s0;SMAX=d.smax;AIS=d.ai;GAIN=d.g;ADD=d.a;try{localStorage.setItem('cq_pong3d_lv',String(LV));}catch(_){}}
const TGT=new THREE.Vector3(0,.6,0);
const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

const cvs=$('c');
const R=new THREE.WebGLRenderer({canvas:cvs,antialias:true});
R.setPixelRatio(Math.min(1.5,devicePixelRatio));R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFShadowMap;
R.toneMapping=THREE.ACESFilmicToneMapping;
const scene=new THREE.Scene();scene.fog=new THREE.Fog('#1d1640',32,60);
const cam=new THREE.PerspectiveCamera(40,1,.1,120);let DIST=20,camD=20;
const U=new THREE.Vector3(-.35,.94,0).normalize();
const CAT_C=new THREE.Color('#ffd84a'),DOG_C=new THREE.Color('#ff77b7'),HOT_C=new THREE.Color('#ff9a3a');

// textures (drawn on canvas, no image files)
function cv(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);return c;}
function tex(c,rep){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);t.anisotropy=4;return t;}
const skyT=tex(cv(4,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#120c2e');gr.addColorStop(.55,'#2a1c5c');gr.addColorStop(1,'#5a2c6e');g.fillStyle=gr;g.fillRect(0,0,w,h);}));
scene.background=skyT;
const feltT=tex(cv(512,512,(g,w,h)=>{g.fillStyle='#2f8f5b';g.fillRect(0,0,w,h);for(let i=0;i<2600;i++){g.fillStyle=Math.random()<.5?'rgba(255,255,255,.04)':'rgba(0,40,20,.06)';g.fillRect(Math.random()*w,Math.random()*h,2,2);}const rg=g.createRadialGradient(w/2,h/2,30,w/2,h/2,w*.7);rg.addColorStop(0,'rgba(255,255,200,.14)');rg.addColorStop(1,'rgba(0,0,0,.22)');g.fillStyle=rg;g.fillRect(0,0,w,h);}),[4,3]);
const woodT=tex(cv(256,256,(g,w,h)=>{g.fillStyle='#8b5a2b';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=2){g.fillStyle='rgba(50,25,8,'+(.08+Math.random()*.28)+')';g.fillRect(0,y,w,1+Math.random()*2);}}),[3,1]);
const glowT=tex(cv(128,128,(g,w,h)=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.35)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,w,h);}));
const netT=tex(cv(64,32,(g,w,h)=>{g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=2.5;for(let x=0;x<=w;x+=16){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}for(let y=0;y<=h;y+=16){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}}),[8,2]);

// lights
const hemi=new THREE.HemisphereLight('#e6f2ff','#3a2a5a',1.1);scene.add(hemi);
const hemiT=new THREE.Color('#e6f2ff');
const sun=new THREE.DirectionalLight('#fff1d8',1.6);sun.castShadow=true;sun.position.set(-6,12,4);
sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-14,right:14,top:10,bottom:-10,near:1,far:40});
sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.0006;scene.add(sun);
const rimL=new THREE.DirectionalLight('#ff9ad5',.8);rimL.position.set(9,5,-7);scene.add(rimL);
const spot=new THREE.SpotLight('#fff4dc',250,40,.7,.8,1.2);spot.position.set(0,14,0);scene.add(spot,spot.target);
const ballLight=new THREE.PointLight('#ffb0d8',2,5,2);scene.add(ballLight);

// room + table
const floor=new THREE.Mesh(new THREE.PlaneGeometry(140,140),new THREE.MeshStandardMaterial({color:'#2a1f4e',roughness:.9}));
floor.rotation.x=-Math.PI/2;floor.position.y=-2.4;floor.receiveShadow=true;scene.add(floor);
const felt=new THREE.Mesh(new THREE.BoxGeometry(HX*2,.2,HZ*2),new THREE.MeshStandardMaterial({map:feltT,roughness:.95}));
felt.position.y=-.1;felt.receiveShadow=true;scene.add(felt);
const rim=new THREE.Mesh(new THREE.BoxGeometry(HX*2+.9,.5,HZ*2+.9),new THREE.MeshStandardMaterial({map:woodT,roughness:.55,emissive:'#ffd84a',emissiveIntensity:0}));
rim.position.y=-.45;rim.receiveShadow=true;scene.add(rim);
for(const [x,z] of [[-HX+1,-HZ+1],[HX-1,-HZ+1],[-HX+1,HZ-1],[HX-1,HZ-1]]){const l=new THREE.Mesh(new THREE.CylinderGeometry(.3,.22,2.2,14),new THREE.MeshStandardMaterial({map:woodT,roughness:.6}));l.position.set(x,-1.3,z);l.castShadow=true;scene.add(l);}
for(const [x,z] of [[-HX-.45,-HZ-.45],[HX+.45,-HZ-.45],[-HX-.45,HZ+.45],[HX+.45,HZ+.45]]){const o=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),new THREE.MeshStandardMaterial({color:x<0?'#ffd84a':'#ff77b7',emissive:x<0?'#ffd84a':'#ff77b7',emissiveIntensity:1.2}));o.position.set(x,.18,z);scene.add(o);}

const WL=new THREE.MeshBasicMaterial({color:'#e9fff0'});
const GL=new THREE.MeshBasicMaterial({color:'#bff7d6',transparent:true,opacity:.14,depthWrite:false});
const line=(w,d,x,z,m)=>{const q=new THREE.Mesh(new THREE.BoxGeometry(w,.02,d),m||WL);q.position.set(x,.01,z);scene.add(q);};
line(HX*2,.1,0,HZ-.15);line(HX*2,.1,0,-HZ+.15);line(.1,HZ*2,0,0);
line(HX*2,.5,0,HZ-.15,GL);line(HX*2,.5,0,-HZ+.15,GL);
const cc=new THREE.Mesh(new THREE.RingGeometry(1.5,1.56,64),new THREE.MeshBasicMaterial({color:'#e9fff0',transparent:true,opacity:.8}));cc.rotation.x=-Math.PI/2;cc.position.y=.012;scene.add(cc);
for(let z=-HZ+.8;z<HZ-.5;z+=1.2){const n=new THREE.Mesh(new THREE.BoxGeometry(.08,.5,.3),WL);n.position.set(0,.25,z);scene.add(n);}

// net: mesh curtain, posts and top rail
const netM=new THREE.MeshBasicMaterial({map:netT,transparent:true,opacity:.35,side:THREE.DoubleSide,depthWrite:false});
const net=new THREE.Mesh(new THREE.PlaneGeometry(HZ*2,.9),netM);net.rotation.y=Math.PI/2;net.position.set(0,.45,0);scene.add(net);
const railM=new THREE.MeshStandardMaterial({color:'#ffffff'});
const rail=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,HZ*2+.1),railM);rail.position.set(0,.9,0);scene.add(rail);
for(const z of [-HZ-.05,HZ+.05]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.95,8),railM);p.position.set(0,.47,z);scene.add(p);}

// stars and dust motes
const SN=300,sp2=new Float32Array(SN*3);
for(let i=0;i<SN;i++){const a=rnd(0,Math.PI*2),r=rnd(40,70);sp2[i*3]=Math.cos(a)*r;sp2[i*3+1]=rnd(10,40);sp2[i*3+2]=Math.sin(a)*r;}
const starG=new THREE.BufferGeometry();starG.setAttribute('position',new THREE.BufferAttribute(sp2,3));
const stars=new THREE.Points(starG,new THREE.PointsMaterial({color:'#ffffff',size:.35,transparent:true,opacity:.8,fog:false,depthWrite:false}));scene.add(stars);
const MN=120,mp=new Float32Array(MN*3);
for(let i=0;i<MN;i++){mp[i*3]=rnd(-14,14);mp[i*3+1]=rnd(0,5);mp[i*3+2]=rnd(-9,9);}
const moteG=new THREE.BufferGeometry();moteG.setAttribute('position',new THREE.BufferAttribute(mp,3));
const motes=new THREE.Points(moteG,new THREE.PointsMaterial({color:'#ffe9b0',size:.06,transparent:true,opacity:.6,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(motes);

// yarn ball + trail + glow + shadow
const ball=new THREE.Group();
const yarn=new THREE.Mesh(new THREE.SphereGeometry(BR,24,18),new THREE.MeshStandardMaterial({color:'#ff77b7',roughness:.7}));
yarn.castShadow=true;ball.add(yarn);
for(let k=0;k<3;k++){const t=new THREE.Mesh(new THREE.TorusGeometry(BR*.92,.035,8,28),new THREE.MeshStandardMaterial({color:'#ffd6ea'}));t.rotation.set(k*.9,k*1.3,k*.6);ball.add(t);}
const gSpr=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,color:'#ff77b7',transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false}));gSpr.scale.setScalar(1.5);ball.add(gSpr);
scene.add(ball);
const shadowM=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:glowT,color:'#05020f',transparent:true,opacity:.5,depthWrite:false}));
shadowM.rotation.x=-Math.PI/2;shadowM.position.y=.02;scene.add(shadowM);
const TRN=9,trail=[];const TG=new THREE.SphereGeometry(BR*.55,10,8);
for(let k=0;k<TRN;k++){const m=new THREE.Mesh(TG,new THREE.MeshBasicMaterial({color:'#ff77b7',transparent:true,opacity:0}));scene.add(m);trail.push(m);}

// paddles: the selected cat and the dog (sprites are 2x the old height)
function fit(obj,x,rotY){const h=new THREE.Group();h.add(obj);const b=new THREE.Box3().setFromObject(obj);
  const k=2.9/Math.max(.01,b.max.y-b.min.y);h.scale.setScalar(k);h.position.set(x,-b.min.y*k,0);h.rotation.y=rotY;h.userData.k=k;h.userData.y0=h.position.y;scene.add(h);return h;}
const catObj=makeCat(selectedCat()), dogObj=makeDog();
const catH=fit(catObj,CX-.5,-Math.PI/2), dogH=fit(dogObj,DX+.5,Math.PI/2);
const padGlow=c=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:glowT,color:c,transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending}));m.rotation.x=-Math.PI/2;m.position.y=.03;m.scale.set(2.6,PL+1.6,1);scene.add(m);return m;};
const catGlow=padGlow('#ffd84a'),dogGlow=padGlow('#ff77b7');
const bar=(c,x)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.25,.04,PL),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.45}));m.position.set(x,.03,0);scene.add(m);return m;};
const catBar=bar('#ffd84a',CX), dogBar=bar('#ff77b7',DX);
const catY0=catH.userData.y0, dogY0=dogH.userData.y0;

// effects: one list of short-lived objects
const PG=new THREE.SphereGeometry(.09,8,6),SQ=new THREE.BoxGeometry(.12,.04,.12);
const RG=new THREE.RingGeometry(.3,.36,40);RG.rotateX(-Math.PI/2);
let FX=[];const _v=new THREE.Vector3();
const pm=(c,o)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o==null?1:o,depthWrite:false});
function fx(m,o){o=Object.assign({v:null,g:0,max:.6,s0:1,s1:1,grow:false,op:1},o);scene.add(m);FX.push({m,life:0,v:o.v,g:o.g,max:o.max,s0:o.s0,s1:o.s1,grow:o.grow,op:o.op});}
function burst(x,z,c,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(PG,pm(c));m.position.set(x,.3,z);fx(m,{v:new THREE.Vector3(rnd(-3,3),rnd(1,4),rnd(-3,3)),g:12});}}
function ring(x,z,c,max,s1){const m=new THREE.Mesh(RG,pm(c,.9));m.position.set(x,.05,z);fx(m,{max:max||.45,grow:true,s0:1,s1:s1||4});}
function mist(x,y,z){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,color:'#9fe8ff',transparent:true,opacity:.6,depthWrite:false,blending:THREE.AdditiveBlending}));s.position.set(x,y,z);s.scale.setScalar(.4);fx(s,{v:new THREE.Vector3(rnd(-.4,.4),rnd(.2,.8),rnd(-.4,.4)),max:.55,grow:true,s0:.4,s1:1.8,op:.6});}
function confetti(n){const cols=['#ffd84a','#ff77b7','#77f0ff','#9dff77','#ffffff'];for(let i=0;i<n;i++){const m=new THREE.Mesh(SQ,pm(cols[i%cols.length]));m.position.set(rnd(-3,3),rnd(2,4),rnd(-3,3));m.rotation.set(rnd(0,3),rnd(0,3),rnd(0,3));fx(m,{v:new THREE.Vector3(rnd(-1,1),rnd(2,5),rnd(-1,1)),g:5,max:1.8});}}
const wallSparks=(x,z)=>burst(x,z,'#fff3b0',6);

// state
const P={cs:0,ds:0,bx:0,bz:0,vx:0,vz:0,serve:1.1,sd:1,cz:0,dz:0,dTgt:0,aiErr:0,tgt:null,over:null,hist:[],shake:0,catHop:0,spray:0,
  droop:0,cheer:0,sq:0,dn:0,fc:0,fd:0,pvz:0,sp:0};
const keys={};
function say(s,c){const el=$('say');el.textContent=s;el.style.color=c||'#fff';el.classList.remove('on');void el.offsetWidth;el.classList.add('on');}
// HUD: score pips and a bump on each score
const pipsEl=$('pips');
for(const [w,c] of [['c','#ffd84a'],['d','#ff77b7']]){const row=document.createElement('div');row.className='pr';row.dataset.w=w;
  for(let i=0;i<WIN;i++){const d=document.createElement('i');d.style.setProperty('--c',c);row.appendChild(d);}pipsEl.appendChild(row);}
function bump(el){el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
function updPips(){for(const [w,n] of [['c',P.cs],['d',P.ds]]){[...pipsEl.querySelector('[data-w='+w+']').children].forEach((d,i)=>d.classList.toggle('on',i<n));}}
function updHud(){$('cs').textContent=P.cs;$('ds').textContent=P.ds;updPips();}

function hit(plane,dirX,off){
  off=clamp(off,-1,1);
  const sp=Math.min(SMAX,Math.hypot(P.vx,P.vz)*GAIN+ADD);
  P.vz=clamp(off*sp*.75,-sp*.9,sp*.9);
  P.vx=dirX*Math.sqrt(Math.max(9,sp*sp-P.vz*P.vz));
  P.bx=plane+dirX*BR*1.05;
  burst(P.bx,P.bz,dirX>0?'#ffd84a':'#ff77b7',10);
  ring(P.bx,P.bz,dirX>0?'#ffd84a':'#ff77b7');
  P.sq=1;P.shake=Math.max(P.shake,.25);
  rim.material.emissive.set(dirX>0?'#ffd84a':'#ff77b7');rim.material.emissiveIntensity=.6;
  if(dirX>0){P.catHop=.3;P.fc=1;}
  else{P.spray=.35;P.fd=1;P.dn=1;}
}
function point(who){
  if(who==='c')P.cs++;else P.ds++;
  P.shake=.5;updHud();
  bump($(who==='c'?'cs':'ds'));
  const flash=$('flash');flash.classList.remove('on');void flash.offsetWidth;flash.classList.add('on');
  say(who==='c'?'POINT! 🐾':'THEY SCORE!',who==='c'?'#ffd84a':'#ff77b7');
  burst(clamp(P.bx,-HX,HX),clamp(P.bz,-HZ,HZ),who==='c'?'#ffd84a':'#ff77b7',16);
  ring(clamp(P.bx,-HX,HX),clamp(P.bz,-HZ,HZ),who==='c'?'#ffd84a':'#ff77b7',.7,6);
  if(who==='c')P.droop=1.2;
  if(P.cs>=WIN||P.ds>=WIN){P.over=P.cs>=WIN?'win':'lose';end();return;}
  P.serve=1.1;P.sd=who==='c'?1:-1;P.bx=0;P.bz=0;P.vx=0;P.vz=0;P.aiErr=rnd(-.8,.8);P.hist=[];
}
function sub(h){
  // your paddle: mouse/touch target, or left/right keys
  steer(h);
  // dog AI: predict where the ball crosses its line
  let tz=0;
  if(P.vx>0){const t=(DX-P.bx)/P.vx;let zp=P.bz+P.vz*t;const L=2*W0;let s=((zp+W0)%(2*L)+2*L)%(2*L);if(s>L)s=2*L-s;tz=clamp(s-W0+P.aiErr,-LIM,LIM);}
  P.dTgt=tz;P.dz+=clamp(P.dTgt-P.dz,-AIS*h,AIS*h);P.dz=clamp(P.dz,-LIM,LIM);
  // ball
  P.bx+=P.vx*h;P.bz+=P.vz*h;
  if(P.bz>W0){P.bz=2*W0-P.bz;P.vz=-Math.abs(P.vz);}
  else if(P.bz<-W0){P.bz=-2*W0-P.bz;P.vz=Math.abs(P.vz);}
  if(P.vx<0&&P.bx<=CX+BR&&P.bx>=CX-1.6&&Math.abs(P.bz-P.cz)<=PL/2+BR)hit(CX,1,(P.bz-P.cz)/(PL/2));
  else if(P.vx>0&&P.bx>=DX-BR&&P.bx<=DX+1.6&&Math.abs(P.bz-P.dz)<=PL/2+BR)hit(DX,-1,(P.bz-P.dz)/(PL/2));
  if(P.bx<-HX)point('d');else if(P.bx>HX)point('c');
}
function end(){
  const win=P.over==='win';
  P.cheer=2.5;if(win)confetti(120);
  $('ttl').textContent=win?'YOU WIN! 🐾':'DOG WINS 🐶';
  const b=$('btns');b.innerHTML='';
  if(win&&LV<4){const nx=document.createElement('button');nx.className='on';nx.textContent='Next level \u25b6 '+LVLS[LV+1].n;nx.onclick=()=>{location.href='pong3d.html?lv='+(LV+1);};b.appendChild(nx);}
  const again=document.createElement('button');again.className=win&&LV<4?'':'on';again.textContent='Rematch';again.onclick=()=>{location.href='pong3d.html?lv='+LV;};b.appendChild(again);
  const chg=document.createElement('button');chg.textContent='Levels';chg.onclick=()=>{location.href='pong3d.html';};b.appendChild(chg);
  const menu=document.createElement('a');menu.href='index.html';menu.textContent='Menu';b.appendChild(menu);
  $('over').classList.remove('hide');
}

// input: mouse/touch steers your paddle by ray-casting onto the table; keys also work
// Keys always win while held. The pointer steers only while pressed (mouse button or touch),
// and every release, blur or tab switch clears both, so the paddle can never get stuck.
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),hp=new THREE.Vector3();
let drag=false;
function track(e){const r=cvs.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));
  ray.setFromCamera(ndc,cam);if(ray.ray.intersectPlane(plane,hp))P.tgt=clamp(hp.z,-LIM,LIM);}
function steer(h){
  const dir=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0);
  if(dir){P.tgt=null;P.cz+=dir*13*h;}
  else if(drag&&P.tgt!=null)P.cz+=clamp(P.tgt-P.cz,-16*h,16*h);
  P.cz=clamp(P.cz,-LIM,LIM);
}
function release(){drag=false;P.tgt=null;for(const k in keys)keys[k]=0;}
cvs.addEventListener('pointerdown',e=>{if(P.over)return;drag=true;track(e);});
cvs.addEventListener('pointermove',e=>{if(drag&&!P.over&&(e.buttons||e.pointerType==='touch'))track(e);});
addEventListener('pointerup',release);addEventListener('pointercancel',release);
addEventListener('blur',release);
document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
addEventListener('keydown',e=>{keys[e.code]=1;if(/Arrow|Space/.test(e.code))e.preventDefault();});
addEventListener('keyup',e=>{keys[e.code]=0;});

// sizing: keep the whole table and the bigger sprites in view
function size(){const W=innerWidth,H=innerHeight;R.setSize(W,H,false);cam.aspect=W/H;
  const vf=Math.tan(THREE.MathUtils.degToRad(cam.fov/2)),hf=vf*cam.aspect;
  DIST=clamp(Math.max(8.5/hf,12.5/vf),14,60);camD=DIST;cam.updateProjectionMatrix();}
addEventListener('resize',size);size();
updHud();

let acc=0,last=performance.now(),T=0,serveTick=0;
const H=1/120;
const hemiGoal=new THREE.Color();
const _c=new THREE.Color();
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;
  if(!P.over){
    if(P.serve>0){P.serve-=dt;
      if(P.serve<=0){P.vx=P.sd*S0;P.vz=rnd(-2.5,2.5);}
      acc=0;
      // paddles still move during the serve pause
      steer(dt);
      // serve pulse rings on the centre spot
      serveTick-=dt;if(serveTick<=0){ring(0,0,'#ffffff',.6,3);serveTick=.5;}
    }else{acc+=dt;while(acc>=H&&!P.over&&P.serve<=0){sub(H);acc-=H;}if(P.serve>0)acc=0;}
  }
  // wall sparks: the ball's z direction flipped near a rail
  if(Math.sign(P.vz)!==Math.sign(P.pvz)&&P.pvz!==0&&Math.abs(P.bz)>W0-.05)wallSparks(P.bx,P.bz);
  P.pvz=P.vz;
  P.hist.push([P.bx,P.bz]);if(P.hist.length>TRN*2)P.hist.shift();
  // ball: spin, squash, glow that heats up with speed
  ball.position.set(P.bx,BR,P.bz);
  const spd=Math.min(1,Math.hypot(P.vx,P.vz)/SMAX);
  yarn.rotation.z-=P.vx*dt*.4;yarn.rotation.x+=P.vz*dt*.4;
  ball.rotation.copy(yarn.rotation);
  P.sq=Math.max(0,P.sq-dt*6);
  ball.scale.set(1+P.sq*.35,1-P.sq*.3,1+P.sq*.35+spd*.12);
  gSpr.material.color.lerpColors(DOG_C,HOT_C,spd);gSpr.material.opacity=.4+.3*spd;gSpr.scale.setScalar(1.3+spd*.6+P.sq*.4);
  ballLight.position.set(P.bx,1.2,P.bz);ballLight.color.lerpColors(DOG_C,HOT_C,spd);ballLight.intensity=2+spd*2;
  shadowM.position.x=P.bx;shadowM.position.z=P.bz;shadowM.scale.setScalar(1.1+.2*spd);
  if(Math.random()<.3*spd+.05&&!P.over){const g=new THREE.Mesh(PG,pm(spd>.5?'#ffb35c':'#ffd6ea',.8));g.scale.setScalar(.5);g.position.set(P.bx+rnd(-.2,.2),BR+rnd(-.2,.2),P.bz+rnd(-.2,.2));fx(g,{v:new THREE.Vector3(rnd(-.3,.3),rnd(.2,.6),rnd(-.3,.3)),max:.35,grow:true,s0:.6,s1:0});}
  for(let k=0;k<TRN;k++){const p=P.hist[P.hist.length-1-k*2];const m=trail[k];
    if(p&&!P.over){m.position.set(p[0],BR*.6,p[1]);m.material.opacity=(1-k/TRN)*.35;}else m.material.opacity=0;}
  // paddles: hop, bob, breathing, cheer, droop
  const bob=Math.sin(T*2.4)*.03;
  const kc=catH.userData.k,kd=dogH.userData.k;
  const breathC=1+.025*Math.sin(T*3),breathD=1+.025*Math.sin(T*3+1);
  catH.scale.set(kc,kc*breathC,kc);dogH.scale.set(kd,kd*breathD,kd);
  catH.position.z=P.cz;dogH.position.z=P.dz;catBar.position.z=P.cz;dogBar.position.z=P.dz;
  catGlow.position.z=P.cz;dogGlow.position.z=P.dz;
  const hop=P.catHop>0?Math.sin((1-P.catHop/.3)*Math.PI)*.35:0;
  if(P.catHop>0)P.catHop-=dt;
  const cheerCat=(P.cheer>0&&P.over==='win')?Math.abs(Math.sin(T*9))*.8:0;
  const cheerDog=(P.cheer>0&&P.over==='lose')?Math.abs(Math.sin(T*9))*.8:0;
  catH.position.y=catY0+hop+bob+cheerCat;dogH.position.y=dogY0-bob+cheerDog;
  if(P.cheer>0)P.cheer-=dt;
  P.fc=Math.max(0,P.fc-dt*3);P.fd=Math.max(0,P.fd-dt*3);P.dn=Math.max(0,P.dn-dt*4);P.droop=Math.max(0,P.droop-dt);
  catGlow.material.opacity=.4+.1*Math.sin(T*2)+P.fc*.5;dogGlow.material.opacity=.4+.1*Math.sin(T*2+1)+P.fd*.5;
  // rim glow fades back after a hit
  rim.material.emissiveIntensity=Math.max(0,rim.material.emissiveIntensity-dt*2);
  catObj.userData.tail.rotation.y=Math.sin(T*(6+(P.vx<0?8:0)))*.5;
  catObj.userData.head.rotation.y=clamp((P.bz-P.cz)*.2,-.6,.6);
  dogObj.userData.tail.rotation.y=Math.sin(T*5)*.5;
  const headTgt=(P.droop>0?.35:0)-P.dn*.3;
  dogObj.userData.head.rotation.x+=(headTgt-dogObj.userData.head.rotation.x)*Math.min(1,dt*10);
  dogObj.userData.bottle.rotation.z=P.spray>0?-.9+Math.sin(T*30)*.12:0;
  if(P.spray>0){P.spray-=dt;if(Math.random()<.6){dogObj.userData.bottle.getWorldPosition(_v);mist(_v.x,_v.y,_v.z);}}
  // ambient light leans warm when the cat leads, cool when the dog leads
  const lead=clamp(.5+(P.cs-P.ds)/(WIN*2),0,1);
  hemiGoal.lerpColors(_c.set('#b8d8ff'),_c.set('#fff0d0'),lead);hemi.color.lerp(hemiGoal,Math.min(1,dt*2));
  // table: soft twinkle, dust drift, close-up dolly on match point
  stars.material.opacity=.6+.25*Math.sin(T*2);
  motes.rotation.y=T*.02;motes.position.y=Math.sin(T*.3)*.2;
  net.material.opacity=.25+.3*Math.exp(-Math.abs(P.bx)*1.5);
  // particles
  for(const f of FX){f.life+=dt;const p=f.life/f.max;if(f.v){f.m.position.addScaledVector(f.v,dt);f.v.y-=f.g*dt;}
    if(f.grow)f.m.scale.setScalar(f.s0+(f.s1-f.s0)*p);f.m.material.opacity=f.op*(1-p);}
  FX=FX.filter(f=>{if(f.life>=f.max){scene.remove(f.m);f.m.material.dispose();return false;}return true;});
  // camera: idle sway, dolly-in at match point, shake on hit
  P.shake*=.85;const sh=P.shake>.01?(Math.random()-.5)*P.shake*.4:0;
  const wantD=(!P.over&&(P.cs===WIN-1||P.ds===WIN-1))?DIST*.84:DIST;
  camD+=(wantD-camD)*Math.min(1,dt*2);
  const sw=Math.sin(T*.35)*1.1;
  cam.position.copy(U).multiplyScalar(camD).add(TGT);
  cam.position.x+=sh;cam.position.z+=sw+sh;
  cam.lookAt(TGT);
  R.render(scene,cam);
}
requestAnimationFrame(frame);


/* ===== 50 levels in 10 worlds, overworld map, world scenery around the table ===== */
(function(){
  const CQ=window.CQMap;
  const PW=[
   {n:'Living Room',  sky:['#120c2e','#2a1c5c','#5a2c6e'],floor:'#2a1f4e',fog:'#1d1640',g:'#6a4a8a',deco:'🛋🧶🪴',k:['crowd','lamps','plants','bunting']},
   {n:'Backyard',     sky:['#3a8ad8','#8ad0ff','#e8f8ff'],floor:'#3f8f3f',fog:'#8ac8e8',g:'#4fae4f',deco:'🌳🌻🦋',k:['crowd','trees','butterflies','bunting']},
   {n:'Beach Club',   sky:['#2ac0e8','#8ae8ff','#fff0c8'],floor:'#e8d090',fog:'#bfe8f0',g:'#f5e2a8',deco:'⛱🐚🌊',k:['crowd','palms','umbrellas','gulls']},
   {n:'Snow Lodge',   sky:['#2a3a7a','#7aa8e0','#e0f0ff'],floor:'#e8f2ff',fog:'#9ab8e0',g:'#f4fbff',deco:'❄⛄🌲',k:['crowd','pines','snow','lamps']},
   {n:'Candy Arena',  sky:['#c05aa8','#ff9ad0','#ffe0f0'],floor:'#ffb3d9',fog:'#e08ac0',g:'#ff8fc8',deco:'🍭🍬🎈',k:['crowd','lollies','balloons','bunting']},
   {n:'Desert Court', sky:['#d0603a','#ffb04a','#ffe8b0'],floor:'#e0b060',fog:'#e0a070',g:'#e6c27a',deco:'🌵🐪☀',k:['crowd','cacti','pyramids','dust']},
   {n:'Coral Dome',   sky:['#06304a','#127a9a','#3ad0d0'],floor:'#d8c890',fog:'#0a4a6a',g:'#2ad0c0',deco:'🐠🪸🐙',k:['crowd','coral','fish','bubbles']},
   {n:'Neon Arcade',  sky:['#08051a','#3a1a8a','#ff3ab0'],floor:'#140c30',fog:'#140a30',g:'#3a2a6a',deco:'🕹🌃🎵',k:['crowd','towers','lasers','lamps']},
   {n:'Haunted Hall', sky:['#08040e','#22123a','#5a2a7a'],floor:'#2a1a3a',fog:'#140a22',g:'#4a2d63',deco:'👻🕯🦇',k:['crowd','ghosts','candles','bats']},
   {n:'Space Station',sky:['#000008','#120a40','#4a1aa0'],floor:'#1a1a3a',fog:'#05031a',g:'#46e0ff',deco:'🪐🛰⭐',k:['crowd','planets','crystals','lasers']}];
  const PSN=['Rally','Volley','Spin','Smash','Champion'];
  const N=50,pName=i=>PW[Math.floor(i/5)].n+' '+(i%5+1)+' · '+PSN[i%5];
  const PP=(()=>{try{return JSON.parse(localStorage.getItem('cq_pong3d')||'null')||{at:0,st:{}};}catch(_){return{at:0,st:{}};}})();PP.st=PP.st||{};
  const saveP=()=>{try{localStorage.setItem('cq_pong3d',JSON.stringify(PP));}catch(_){}};
  const QS=new URLSearchParams(location.search);
  let L=parseInt(QS.get('L'));const hasL=L>=0&&L<N;
  if(!hasL){const ol=QS.get('lv');L=(ol!==null&&+ol>=0&&+ol<=4)?Math.round(+ol*12.25):Math.min(N-1,PP.at||0);}
  // interpolate the five old tiers across 50 levels
  function apply(i){const f=i/(N-1)*4,a=Math.floor(Math.min(3,f)),k=f-a,A=LVLS[a],B=LVLS[a+1],m=(x,y)=>x+(y-x)*k;
    LV=Math.min(4,Math.round(f));S0=m(A.s0,B.s0);SMAX=m(A.smax,B.smax);AIS=m(A.ai,B.ai);GAIN=m(A.g,B.g);ADD=m(A.a,B.a);}
  const hud=document.createElement('div');hud.id='lvtag';document.body.appendChild(hud);
  let started=false;
  function begin(){apply(L);hud.textContent='🏓 '+pName(L);const r=document.getElementById('cqres');if(r)r.remove();P.over=null;P.serve=1.1;started=true;}
  const goL=i=>{location.href='pong3d.html?L='+i;};
  end=function(){
    const win=P.over==='win';P.cheer=2.5;if(win)confetti(120);
    let st=0;if(win){st=P.ds===0?3:P.ds<=2?2:1;PP.st[L]=Math.max(PP.st[L]||0,st);PP.at=Math.max(PP.at,L+1);saveP();}
    setTimeout(()=>CQ.result({title:win?'YOU WIN! 🐾':'DOG WINS 🐶',sub:pName(L)+'\n'+P.cs+' – '+P.ds,stars:win?st:null,
      next:win&&L<N-1?()=>goL(L+1):null,retry:()=>goL(L),map:openMap}),win?900:600);
  };
  let prevOver=null;
  function openMap(){const r=document.getElementById('cqres');if(r)r.remove();
    CQ.open({title:'🏓 Kitty Pong 3D',worlds:PW.map(t=>({n:t.n,c1:t.sky[2],c2:t.sky[1],g:t.g,deco:t.deco})),
      levels:w=>[0,1,2,3,4].map(k=>w*5+k),name:pName,isOpen:i=>i<=PP.at,stars:i=>PP.st[i]||0,cur:L,
      go:i=>{if(i===L&&!started){begin();return;}goL(i);},
      onOpen:()=>{prevOver=P.over;P.over='pick';},
      onClose:()=>{if(!started)begin();else P.over=prevOver;}});}
  CQ.button(openMap,{style:'right:58px'});
  addEventListener('keydown',e=>{if(e.code==='KeyM'&&!CQ.isOpen()){e.preventDefault();openMap();}},true);
  apply(L);
  if(hasL)begin();else{P.over='pick';setTimeout(openMap,60);}

  // ---- theme ----
  const TH=PW[Math.floor(L/5)];
  scene.background=tex(cv(4,256,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,TH.sky[0]);gr.addColorStop(.55,TH.sky[1]);gr.addColorStop(1,TH.sky[2]);g.fillStyle=gr;g.fillRect(0,0,w,h);}));
  scene.fog.color.set(TH.fog);floor.material.color.set(TH.floor);
  const SC=[],add=(m,fn)=>{scene.add(m);if(fn)SC.push({m,fn,p:Math.random()*6.28,b:m.position.clone()});return m;};
  const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6},o||{}));
  const G=(c,op)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op==null?.9:op,depthWrite:false});
  const FY=-2.4;
  // a spot around the table, outside the play area (ring between r0 and r1, avoiding the camera side)
  const spot=(r0,r1)=>{let x,z;do{const a=rnd(0,Math.PI*2),r=rnd(r0,r1);x=Math.cos(a)*r*1.25;z=Math.sin(a)*r;}while(z>6&&Math.abs(x)<14);return[x,z];};
  const K={
    crowd(){ // bleachers behind the table with a bouncing audience
      for(const side of [-1,1]){const st=new THREE.Group();for(let r=0;r<3;r++){const b=new THREE.Mesh(new THREE.BoxGeometry(26,.6,1.4),M(TH.g));b.position.set(0,FY+.3+r*.8,-12-side*0-r*1.4);st.add(b);}
        if(side>0){scene.add(st);}}
      const cols=['#ffd84a','#ff77b7','#77f0ff','#9dff77','#ffffff','#ff9a3a','#c08bff'];
      for(let r=0;r<3;r++)for(let k=0;k<11;k++){const g=new THREE.Group();const c=cols[(k+r)%cols.length];
        const bd=new THREE.Mesh(new THREE.SphereGeometry(.38,12,8),M(c));bd.scale.y=1.2;g.add(bd);
        const hd=new THREE.Mesh(new THREE.SphereGeometry(.3,12,8),M(c));hd.position.y=.6;g.add(hd);
        for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.ConeGeometry(.1,.22,4),M(c));e.position.set(s*.16,.88,0);g.add(e);}
        g.position.set(-11+k*2.2+(r%2)*1.1,FY+1.1+r*.8,-12-r*1.4);
        add(g,(m,t,o)=>{const ex=P.cheer>0?2.2:1;m.position.y=o.b.y+Math.abs(Math.sin(t*(3+ex*2)+o.p))*.18*ex;m.rotation.z=Math.sin(t*2+o.p)*.08;});}
      // sweeping spotlights on the floor
      for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.CircleGeometry(2.2,32),G(['#ffd84a','#ff77b7','#77f0ff'][i],.18));c.rotation.x=-Math.PI/2;c.position.y=FY+.02;
        add(c,(m,t,o)=>{m.position.x=Math.sin(t*.4+i*2.1)*18;m.position.z=Math.cos(t*.33+i*1.7)*10;});}
    },
    bunting(){for(const z of [-9,9])for(let k=0;k<16;k++){const f=new THREE.Mesh(new THREE.ConeGeometry(.35,.7,3),M(['#ff77b7','#ffd84a','#77f0ff','#9dff77'][k%4]));f.rotation.x=Math.PI;f.position.set(-15+k*2,5.2-Math.sin(k/15*Math.PI)*.8,z);
      add(f,(m,t,o)=>{m.rotation.z=Math.sin(t*2.5+k*.6)*.25;});}
      for(const x of [-16,16])for(const z of [-9,9]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,7.6,6),M('#e0e0f0'));p.position.set(x,FY+3.8,z);scene.add(p);}},
    lamps(){for(let i=0;i<8;i++){const g=new THREE.Group();const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,4,6),M('#3a3a4a'));p.position.y=2;g.add(p);const b=new THREE.Mesh(new THREE.SphereGeometry(.35,12,8),G('#ffe6a0'));b.position.y=4.1;g.add(b);
      const [x,z]=spot(15,22);g.position.set(x,FY,z);add(g,(m,t,o)=>{m.children[1].material.opacity=.6+.35*Math.sin(t*2+o.p);});}},
    plants(){for(let i=0;i<8;i++){const g=new THREE.Group();const pot=new THREE.Mesh(new THREE.CylinderGeometry(.6,.45,.9,10),M('#c0603a'));pot.position.y=.45;g.add(pot);for(let k=0;k<6;k++){const l=new THREE.Mesh(new THREE.ConeGeometry(.2,1.6,5),M('#3fa04a'));l.position.set(0,1.4,0);l.rotation.set(rnd(-.6,.6),0,rnd(-.6,.6));g.add(l);}
      const [x,z]=spot(13,20);g.position.set(x,FY,z);add(g,(m,t,o)=>{m.rotation.y=Math.sin(t*.8+o.p)*.15;});}},
    trees(){for(let i=0;i<12;i++){const g=new THREE.Group();const tr=new THREE.Mesh(new THREE.CylinderGeometry(.25,.35,2.4,7),M('#7a5230'));tr.position.y=1.2;g.add(tr);const c=new THREE.Mesh(new THREE.IcosahedronGeometry(1.6,0),M(['#3f9a4a','#57b85a','#2f8a3c'][i%3],{flatShading:true}));c.position.y=3.2;g.add(c);
      const [x,z]=spot(16,28);g.position.set(x,FY,z);g.scale.setScalar(rnd(.9,1.6));add(g,(m,t,o)=>{m.children[1].rotation.z=Math.sin(t*.9+o.p)*.06;});}},
    butterflies(){for(let i=0;i<10;i++){const g=new THREE.Group();for(const s of [-1,1]){const w=new THREE.Mesh(new THREE.PlaneGeometry(.35,.3),new THREE.MeshBasicMaterial({color:['#ffd84a','#ff77b7','#77f0ff'][i%3],side:THREE.DoubleSide}));w.position.x=s*.18;g.add(w);}
      const [x,z]=spot(11,18);g.position.set(x,rnd(0,3),z);add(g,(m,t,o)=>{m.position.x=o.b.x+Math.sin(t*.5+o.p)*3;m.position.z=o.b.z+Math.cos(t*.4+o.p)*2;m.position.y=o.b.y+Math.sin(t*2+o.p)*.5;m.children[0].rotation.y=Math.sin(t*16)*1.1;m.children[1].rotation.y=-Math.sin(t*16)*1.1;});}},
    palms(){for(let i=0;i<8;i++){const g=new THREE.Group();for(let k=0;k<5;k++){const s=new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,1,7),M('#a07a4a'));s.position.set(k*.12,.5+k*.95,0);g.add(s);}
      for(let k=0;k<6;k++){const l=new THREE.Mesh(new THREE.BoxGeometry(2.4,.05,.5),M('#3fa04a'));l.position.set(.6,5,0);l.rotation.set(0,k*1.05,-.4);g.add(l);}
      const [x,z]=spot(16,26);g.position.set(x,FY,z);add(g,(m,t,o)=>{m.rotation.z=Math.sin(t*.7+o.p)*.04;});}},
    umbrellas(){for(let i=0;i<6;i++){const g=new THREE.Group();const p=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,3,6),M('#ffffff'));p.position.y=1.5;g.add(p);const c=new THREE.Mesh(new THREE.ConeGeometry(1.6,.8,8),M(['#ff6b6b','#ffd84a','#5dd0ff'][i%3]));c.position.y=3.1;g.add(c);
      const [x,z]=spot(13,20);g.position.set(x,FY,z);add(g,(m,t,o)=>{m.children[1].rotation.y=t*.3+o.p;});}},
    gulls(){for(let i=0;i<7;i++){const g=new THREE.Group();for(const s of [-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(.7,.04,.2),M('#ffffff'));w.position.x=s*.35;g.add(w);}
      g.position.set(rnd(-25,25),rnd(7,12),rnd(-25,-8));add(g,(m,t,o)=>{m.position.x=o.b.x+Math.sin(t*.25+o.p)*10;m.position.y=o.b.y+Math.sin(t+o.p);m.children[0].rotation.z=Math.sin(t*8+o.p)*.5;m.children[1].rotation.z=-Math.sin(t*8+o.p)*.5;});}},
    pines(){for(let i=0;i<14;i++){const g=new THREE.Group();for(let k=0;k<3;k++){const c=new THREE.Mesh(new THREE.ConeGeometry(1.4-k*.35,1.8,7),M(k===2?'#f4fbff':'#2f6a4a'));c.position.y=1+k*1.1;g.add(c);}
      const [x,z]=spot(16,28);g.position.set(x,FY,z);g.scale.setScalar(rnd(1,1.8));add(g,(m,t,o)=>{m.rotation.z=Math.sin(t*.6+o.p)*.03;});}},
    snow(){for(let i=0;i<120;i++){const f=new THREE.Mesh(new THREE.OctahedronGeometry(.08),G('#ffffff',.85));f.position.set(rnd(-28,28),rnd(-2,14),rnd(-24,14));add(f,(m,t,o)=>{m.position.y-=.035;m.position.x=o.b.x+Math.sin(t+o.p)*.6;if(m.position.y<FY)m.position.y=14;});}},
    lollies(){for(let i=0;i<9;i++){const g=new THREE.Group();const st=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,4,6),M('#ffffff'));st.position.y=2;g.add(st);const c=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,.3,20),M(['#ff4f9a','#6fdcff','#ffd84a'][i%3]));c.rotation.x=Math.PI/2;c.position.y=4.2;g.add(c);
      const [x,z]=spot(14,24);g.position.set(x,FY,z);add(g,(m,t,o)=>{m.children[1].rotation.y=t*1.2+o.p;});}},
    balloons(){for(let i=0;i<14;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(.5,14,10),M(['#ff4f9a','#6fdcff','#ffd84a','#8aff8a'][i%4],{roughness:.3}));b.scale.y=1.2;const [x,z]=spot(12,24);b.position.set(x,rnd(-2,14),z);
      add(b,(m,t,o)=>{m.position.y+=.02;m.position.x=o.b.x+Math.sin(t*.8+o.p)*.6;if(m.position.y>16)m.position.y=FY;});}},
    cacti(){for(let i=0;i<10;i++){const g=new THREE.Group(),c=M('#3f9a4a');const b=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,3,8),c);b.position.y=1.5;g.add(b);for(const s of [-1,1]){const a=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,1.2,8),c);a.position.set(s*.55,1.9+s*.3,0);g.add(a);}
      const [x,z]=spot(15,26);g.position.set(x,FY,z);add(g,(m,t,o)=>{m.scale.y=1+Math.sin(t*1.5+o.p)*.02;});}},
    pyramids(){for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.ConeGeometry(7,7,4),M('#d8a860',{flatShading:true}));p.rotation.y=Math.PI/4;p.position.set((i-1)*20,FY+3.5,-38);scene.add(p);}
      const s=new THREE.Mesh(new THREE.SphereGeometry(4,24,16),G('#fff0a0',1));s.position.set(18,14,-46);add(s,(m,t)=>{m.position.y=14+Math.sin(t*.2)*.8;});},
    dust(){for(let i=0;i<50;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(.06,5,4),G('#fff0c0',.6));d.position.set(rnd(-28,28),rnd(-2,5),rnd(-20,14));add(d,(m,t,o)=>{m.position.x+=.06;if(m.position.x>28)m.position.x=-28;m.position.y=o.b.y+Math.sin(t+o.p)*.4;});}},
    coral(){for(let i=0;i<14;i++){const g=new THREE.Group(),c=['#ff6f61','#ff9ad0','#ffd84a','#9a6aff'][i%4];for(let k=0;k<5;k++){const br=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,rnd(1.2,2.6),6),M(c));br.position.set(rnd(-.5,.5),1,rnd(-.4,.4));br.rotation.z=rnd(-.5,.5);g.add(br);}
      const [x,z]=spot(13,24);g.position.set(x,FY,z);add(g,(m,t,o)=>{m.rotation.z=Math.sin(t*1.3+o.p)*.08;});}},
    fish(){for(let i=0;i<12;i++){const g=new THREE.Group(),c=['#ff8a3a','#ffd84a','#6fdcff','#ff6fa8'][i%4];const b=new THREE.Mesh(new THREE.SphereGeometry(.4,12,8),M(c));b.scale.set(1.6,1,.6);g.add(b);const tl=new THREE.Mesh(new THREE.ConeGeometry(.32,.5,4),M(c));tl.rotation.z=Math.PI/2;tl.position.x=-.75;g.add(tl);
      const r=rnd(14,22),y=rnd(1,7),sp=rnd(.15,.3)*(i%2?1:-1);add(g,(m,t,o)=>{const a=t*sp+o.p;m.position.set(Math.cos(a)*r*1.2,y+Math.sin(t*2+o.p)*.3,Math.sin(a)*r);m.rotation.y=-a+(sp>0?-Math.PI/2:Math.PI/2);m.children[1].rotation.y=Math.sin(t*12)*.5;});}},
    bubbles(){for(let i=0;i<40;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(rnd(.08,.25),8,6),G('#d8f8ff',.45));const [x,z]=spot(11,22);b.position.set(x,rnd(FY,12),z);add(b,(m,t,o)=>{m.position.y+=.03;if(m.position.y>12)m.position.y=FY;});}},
    towers(){for(let i=0;i<16;i++){const h=rnd(6,18),g=new THREE.Group();const w=rnd(2,4);const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,2.4),M('#1a1438'));b.position.y=h/2;g.add(b);const n=new THREE.Mesh(new THREE.BoxGeometry(w+.06,.2,2.46),G(['#ff3ab0','#3ae0ff','#ffe03a'][i%3],.95));n.position.y=h*.7;g.add(n);
      const [x,z]=spot(22,34);g.position.set(x,FY,z);add(g,(m,t,o)=>{m.children[1].material.opacity=Math.sin(t*5+o.p)>-.5?.95:.15;});}},
    lasers(){for(let i=0;i<6;i++){const b=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,30,6),G(['#ff3ab0','#3ae0ff','#9dff77'][i%3],.5));b.position.set((i-2.5)*6,10,-16);add(b,(m,t,o)=>{m.rotation.z=Math.sin(t*.8+o.p)*.7;m.material.opacity=.25+.3*Math.max(0,Math.sin(t*3+o.p));});}},
    ghosts(){for(let i=0;i<8;i++){const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.SphereGeometry(.7,14,10,0,6.3,0,1.9),G('#f0eaff',.7)));for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.09,6,4),new THREE.MeshBasicMaterial({color:'#1a1030'}));e.position.set(s*.22,.1,.64);g.add(e);}
      const [x,z]=spot(13,22);g.position.set(x,rnd(1,6),z);add(g,(m,t,o)=>{m.position.y=o.b.y+Math.sin(t*1.2+o.p)*.8;m.position.x=o.b.x+Math.sin(t*.4+o.p)*2;m.lookAt(0,1,0);m.children[0].material.opacity=.35+.35*Math.sin(t*2+o.p);});}},
    candles(){for(let i=0;i<16;i++){const g=new THREE.Group(),h=rnd(.6,1.6);const c=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,h,8),M('#f4ead0'));c.position.y=h/2;g.add(c);const f=new THREE.Mesh(new THREE.ConeGeometry(.11,.32,6),G('#ffb84a'));f.position.y=h+.16;g.add(f);
      const [x,z]=spot(11,16);g.position.set(x,FY,z);add(g,(m,t,o)=>{m.children[1].scale.set(1+Math.sin(t*20+o.p)*.15,1+Math.sin(t*13+o.p)*.25,1);});}},
    bats(){for(let i=0;i<10;i++){const g=new THREE.Group();g.add(new THREE.Mesh(new THREE.SphereGeometry(.2,8,6),M('#1a1022')));for(const s of [-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(.7,.04,.32),M('#2a1a3a'));w.position.x=s*.4;g.add(w);}
      g.position.set(rnd(-24,24),rnd(5,12),rnd(-22,-6));add(g,(m,t,o)=>{m.position.x=o.b.x+Math.sin(t*.6+o.p)*7;m.position.y=o.b.y+Math.sin(t*1.7+o.p);m.children[1].rotation.z=Math.sin(t*18)*.8;m.children[2].rotation.z=-Math.sin(t*18)*.8;});}},
    planets(){[['#ff8a3a',4,[-24,14,-40]],['#46e0ff',2,[22,18,-34]],['#c08bff',3,[28,6,-44]]].forEach(([c,r,p],k)=>{const pl=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),M(c,{emissive:c,emissiveIntensity:.3}));pl.position.set(...p);add(pl,(m,t)=>{m.rotation.y=t*.15;});
      if(!k){const rg=new THREE.Mesh(new THREE.TorusGeometry(r*1.6,.25,6,40),G('#ffd8a0',.6));rg.rotation.x=1.2;rg.position.set(...p);scene.add(rg);}});
      const sat=new THREE.Group();sat.add(new THREE.Mesh(new THREE.BoxGeometry(.8,.8,.8),M('#cfd8e8')));sat.add(new THREE.Mesh(new THREE.BoxGeometry(3,.06,.8),M('#3a6ad8')));add(sat,(m,t)=>{m.position.set(Math.sin(t*.25)*22,12,Math.cos(t*.25)*16-6);m.rotation.y=t;});},
    crystals(){for(let i=0;i<12;i++){const c=new THREE.Mesh(new THREE.OctahedronGeometry(rnd(.5,1.1)),M(['#46e0ff','#c08bff','#ff6fd8'][i%3],{emissive:'#6040ff',emissiveIntensity:.45,flatShading:true}));c.scale.y=1.8;const [x,z]=spot(13,22);c.position.set(x,FY+1.6,z);
      add(c,(m,t,o)=>{m.rotation.y=t*.7+o.p;m.position.y=o.b.y+Math.sin(t+o.p)*.4;});}}
  };
  TH.k.forEach(k=>{try{K[k]&&K[k]();}catch(e){console.warn('scenery',k,e);}});
  (function anim(now){const t=now/1000;for(const o of SC)o.fn(o.m,t,o);requestAnimationFrame(anim);})(0);
})();
