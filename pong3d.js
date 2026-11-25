import * as THREE from 'https://esm.sh/three@0.160.0';
import { makeCat, makeDog, selectedCat } from './char3d.js';

// 3D pong: the cat (you) on the left, the dog on the right. First to 5 wins.
const HX=10, HZ=6, BR=.36, WIN=5, S0=7, SMAX=17, PL=2.7, CX=-8.9, DX=8.9, LIM=HZ-PL/2, W0=HZ-BR, AIS=7;
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
  const sp=Math.min(SMAX,Math.hypot(P.vx,P.vz)*1.06+.25);
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
  const again=document.createElement('button');again.className='on';again.textContent='Rematch';again.onclick=()=>location.reload();b.appendChild(again);
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
