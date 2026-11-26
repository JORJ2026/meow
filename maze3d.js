import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { mzGen } from './mzgen.js';
import { makeCat, selectedCat } from './char3d.js';

// 3D maze: same levels, rules, enemies and progress as the 2D maze. 1 world unit = 1 tile.
const TS=32, RAD=9, DKC=['#ff4d6d','#3a86ff','#2ec27e'];
const MWN=['Hedge Garden','Pyramid Dunes','Ice Caverns','Magma Keep','Candy Castle','Moonlit Maze','Spooky Manor','Sky Garden','Space Hall','Coral Maze'];
const MLV=['Stroll','Wander','Tangle','Knot','Loop-de-Loop','Riddle','Warren','Spiral','Puzzle Box','Gauntlet'];
const WALLS=['#4b8a5a','#d9a85b','#bfe6ff','#8c3b2b','#ff8fd6','#5b6e4a','#3d3566','#6aa84f','#6f7fa8','#2a9d8f'];
const FLOORS=['#86c77a','#f1d08a','#dff3ff','#6b3a2a','#ffd0e8','#8fb86a','#4a3f78','#9fd59a','#9aaad0','#5fc1b5'];
const FOEC=['#ff8fd6','#7fe3ff','#ffd84a','#9be564','#c08bff','#ff9f43','#f2f2f2','#ff6b6b','#54a0ff','#8d6e63'];
const TCOL=['#ffd84a','#ff77b7','#7fe3ff','#ff4d6d','#c08bff'];
const $=id=>document.getElementById(id);
const hsh=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const PR=(()=>{try{return JSON.parse(localStorage.getItem('cq_prog')||'{}')||{};}catch(_){return {};}})();
PR.maze=PR.maze||{at:0,st:{}};
const saveP=()=>{try{localStorage.setItem('cq_prog',JSON.stringify(PR));}catch(_){}};

let i=parseInt(new URLSearchParams(location.search).get('i'));
if(!(i>=0&&i<=99))i=Math.min(99,PR.maze.at||0);
const M=mzGen(i);M.totT=M.treats.length;
const w=Math.floor(i/10),k=i%10,N=M.W*M.H;
$('lv').textContent=MWN[w]+' '+(k+1)+' \u00b7 '+MLV[k];

const Z={px:TS*1.5,py:TS*1.5,hx:0,hz:1,hp:5,inv:0,nip:0,pcd:0,keys:[0,0,0],got:0,score:0,mv:0,
  seen:new Uint8Array(N),t:0,over:null,shake:0};
let dirty=false;

// ---------- three.js scene ----------
const cvs=$('c');
const R=new THREE.WebGLRenderer({canvas:cvs,antialias:true});
R.setPixelRatio(Math.min(1.5,devicePixelRatio));R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFShadowMap;
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
const scene=new THREE.Scene();scene.background=new THREE.Color('#2a2050');scene.fog=new THREE.Fog('#2a2050',13,30);
const cam=new THREE.PerspectiveCamera(52,1,.1,120);
scene.add(new THREE.HemisphereLight('#e6f2ff','#4a3560',1.2));
const sun=new THREE.DirectionalLight('#fff3dc',1.8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-11,right:11,top:11,bottom:-11,near:1,far:60});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.0008;
scene.add(sun,sun.target);
const rim=new THREE.DirectionalLight('#ff8fd6',.5);rim.position.set(-6,5,-8);scene.add(rim);

const D=new THREE.Object3D(),col=new THREE.Color();
const walls=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:WALLS[w],roughness:.55}),N);
walls.castShadow=true;walls.receiveShadow=true;scene.add(walls);
const floor=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.12,1),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.9}),N);
floor.receiveShadow=true;scene.add(floor);
for(let key=0;key<N;key++){const x=key%M.W,y=(key-x)/M.W;
  col.set(M.mud.has(x+','+y)?'#7a5234':M.conv.get(x+','+y)?'#7fd6ff':FLOORS[w]);floor.setColorAt(key,col);}
function paint(key){const x=key%M.W,y=(key-x)/M.W,isW=M.g[y][x]==='#',on=Z.seen[key]===1;
  D.position.set(x+.5,isW&&on?.55:-6,y+.5);D.scale.set(1,isW&&on?1.1:.01,1);D.updateMatrix();walls.setMatrixAt(key,D.matrix);
  D.position.set(x+.5,-.06,y+.5);D.scale.set(1,!isW&&on?1:.01,1);D.updateMatrix();floor.setMatrixAt(key,D.matrix);}
function reveal(tx,ty){for(let y=Math.max(0,ty-4);y<=Math.min(M.H-1,ty+4);y++)for(let x=Math.max(0,tx-5);x<=Math.min(M.W-1,tx+5);x++){const key=y*M.W+x;if(!Z.seen[key]){Z.seen[key]=1;paint(key);dirty=true;}}}
for(let key=0;key<N;key++)paint(key);

const TGEO=new THREE.CylinderGeometry(.16,.2,.12,16);
M.treats.forEach(q=>{const m=new THREE.Mesh(TGEO,new THREE.MeshStandardMaterial({color:TCOL[q.kind],emissive:TCOL[q.kind],emissiveIntensity:.35,roughness:.4}));m.position.set(q.x+.5,.25,q.y+.5);scene.add(m);q.mesh=m;});
M.keys.forEach(q=>{const m=new THREE.Mesh(new THREE.TorusGeometry(.2,.07,10,20),new THREE.MeshStandardMaterial({color:DKC[q.c],emissive:DKC[q.c],emissiveIntensity:.4}));m.position.set(q.x+.5,.4,q.y+.5);scene.add(m);q.mesh=m;});
M.doors.forEach(d=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.9,.9,.9),new THREE.MeshStandardMaterial({color:DKC[d.c],roughness:.4}));m.position.set(d.x+.5,.45,d.y+.5);m.castShadow=true;scene.add(m);d.mesh=m;});
M.spikes.forEach(s=>{const m=new THREE.Mesh(new THREE.ConeGeometry(.3,.6,4),new THREE.MeshStandardMaterial({color:'#dfe6ff',metalness:.6,roughness:.3}));m.position.set(s.x+.5,0,s.y+.5);scene.add(m);s.mesh=m;});
M.nips.forEach(q=>{const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.2,1),new THREE.MeshStandardMaterial({color:'#b48cff',emissive:'#b48cff',emissiveIntensity:.6}));m.position.set(q.x+.5,.35,q.y+.5);scene.add(m);q.mesh=m;});
M.portals.forEach(p=>[p.a,p.b].forEach(c=>{const m=new THREE.Mesh(new THREE.TorusGeometry(.35,.06,10,24),new THREE.MeshBasicMaterial({color:'#9fe8ff'}));m.rotation.x=Math.PI/2;m.position.set(c[0]+.5,.05,c[1]+.5);scene.add(m);}));
const goal=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,1.6,24),new THREE.MeshStandardMaterial({color:'#ffd84a',emissive:'#ffb23a',emissiveIntensity:.8}));goal.position.set(M.gx+.5,.8,M.gy+.5);scene.add(goal);
M.foes.forEach(f=>{const g=new THREE.Group();const b=new THREE.Mesh(new THREE.SphereGeometry(.34,18,14),new THREE.MeshStandardMaterial({color:FOEC[f.v%10],roughness:.5}));b.position.y=.4;b.castShadow=true;g.add(b);
  for(const sx of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.06,10,8),new THREE.MeshBasicMaterial({color:'#111'}));e.position.set(sx*.12,.46,-.3);g.add(e);}
  scene.add(g);f.mesh=g;});
const cat=makeCat(selectedCat());scene.add(cat);

// ---------- rules (ported from the 2D maze) ----------
function say(s,c){const el=$('say');el.textContent=s;el.style.color=c||'#fff';el.classList.remove('on');void el.offsetWidth;el.classList.add('on');}
function solid(x,y,open){
  if(x<0||y<0||x>=M.W||y>=M.H)return true;if(M.g[y][x]==='#')return true;
  for(const d of M.doors)if(d.x===x&&d.y===y&&!d.open){
    if(open&&Z.keys[d.c]>0){Z.keys[d.c]--;d.open=true;d.mesh.visible=false;say('UNLOCKED!','#ffd84a');return false;}
    if(open&&Z.t-(d.hint||-99)>60){d.hint=Z.t;say('needs a '+['red','blue','green'][d.c]+' key','#fff');}
    return true;}
  return false;
}
function hitAt(px,py,open){for(const [dx,dy] of [[-RAD,-RAD],[RAD,-RAD],[-RAD,RAD],[RAD,RAD]])if(solid(Math.floor((px+dx)/TS),Math.floor((py+dy)/TS),open))return true;return false;}
let hurt=function hurtFn(nm){if(Z.inv>0||Z.nip>0||Z.over)return;Z.hp--;Z.inv=100;Z.shake=.5;say(nm||'OUCH!','#ff4d6d');
  if(Z.hp<=0){Z.over='dead';setTimeout(()=>end(),800);}}
function near(x,y,d){return Math.abs(x*TS+16-Z.px)<d&&Math.abs(y*TS+16-Z.py)<d;}
function step(){
  Z.t++;if(Z.inv>0)Z.inv--;if(Z.nip>0)Z.nip--;if(Z.pcd>0)Z.pcd--;
  let ix=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),iy=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
  if(!ix&&!iy){ix=joy.x;iy=joy.y;}
  const tx=Math.floor(Z.px/TS),ty=Math.floor(Z.py/TS),key=tx+','+ty;
  const sp=2.6*(Z.nip>0?1.5:1)*(M.mud.has(key)?.55:1);
  let moved=false;if(ix&&iy){ix*=.75;iy*=.75;}
  if(ix){const nx=Z.px+ix*sp;if(!hitAt(nx,Z.py,true)){Z.px=nx;moved=true;}else{const cy=(Math.floor(Z.py/TS)+.5)*TS;if(!iy){const ny=Z.py+Math.max(-1.6,Math.min(1.6,cy-Z.py));if(!hitAt(Z.px,ny,false))Z.py=ny;}}
    if(!iy){const cy=(Math.floor(Z.py/TS)+.5)*TS;Z.py+=Math.max(-1.1,Math.min(1.1,(cy-Z.py)*.25));}}
  if(iy){const ny=Z.py+iy*sp;if(!hitAt(Z.px,ny,true)){Z.py=ny;moved=true;}else{const cx=(Math.floor(Z.px/TS)+.5)*TS;if(!ix){const nx=Z.px+Math.max(-1.6,Math.min(1.6,cx-Z.px));if(!hitAt(nx,Z.py,false))Z.px=nx;}}
    if(!ix){const cx=(Math.floor(Z.px/TS)+.5)*TS;Z.px+=Math.max(-1.1,Math.min(1.1,(cx-Z.px)*.25));}}
  if(ix||iy){Z.hx=ix;Z.hz=iy;}
  Z.mv=moved?Z.mv+1:0;
  const belt=M.conv.get(key);if(belt){const nx=Z.px+belt[0]*1.1,ny=Z.py+belt[1]*1.1;if(!hitAt(nx,Z.py,false))Z.px=nx;if(!hitAt(Z.px,ny,false))Z.py=ny;}
  reveal(Math.floor(Z.px/TS),Math.floor(Z.py/TS));
  const ntx=Math.floor(Z.px/TS),nty=Math.floor(Z.py/TS);
  for(const q of M.treats)if(!q.got&&near(q.x,q.y,15)){q.got=true;Z.got++;const pts=[10,25,25,15,100][q.kind];Z.score+=pts;
    if(q.kind===3&&Z.hp<5){Z.hp++;say('+\u2665','#ff77b7');}else say('+'+pts,'#ffd84a');}
  for(const q of M.keys)if(!q.got&&near(q.x,q.y,15)){q.got=true;Z.keys[q.c]++;q.mesh.visible=false;say(['RED','BLUE','GREEN'][q.c]+' KEY!',DKC[q.c]);}
  for(const q of M.nips)if(!q.got&&near(q.x,q.y,16)){q.got=true;Z.nip=420;q.mesh.visible=false;say('CATNIP ZOOM!','#c08bff');}
  for(const q of M.spikes){if(q.x===ntx&&q.y===nty&&((Z.t+q.ph)%120)<60&&Math.abs(q.x*TS+16-Z.px)<13&&Math.abs(q.y*TS+16-Z.py)<13)hurt('SPIKES!');}
  if(Z.pcd<=0)for(const p of M.portals){for(const [a,b] of [[p.a,p.b],[p.b,p.a]])if(near(a[0],a[1],12)){Z.px=b[0]*TS+16;Z.py=b[1]*TS+16;Z.pcd=70;say('WHOOSH!','#9fe8ff');break;}}
  for(const f of M.foes){
    if(f.dead)continue;f.tm++;
    const cx=Math.floor(f.x/TS),cy=Math.floor(f.y/TS),ccx=(cx+.5)*TS,ccy=(cy+.5)*TS;
    if((f.dx===0&&f.dy===0)||(Math.abs(f.x-ccx)<=f.sp&&Math.abs(f.y-ccy)<=f.sp)){
      f.x=ccx;f.y=ccy;const ds=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>!solid(cx+a,cy+b,false));
      let ch=ds.filter(([a,b])=>!(a===-f.dx&&b===-f.dy));if(!ch.length)ch=ds;
      if(Math.abs(Z.px-f.x)+Math.abs(Z.py-f.y)<190&&f.v%3===0){ch.sort((p,q)=>(Math.abs(Z.px-(f.x+p[0]*TS))+Math.abs(Z.py-(f.y+p[1]*TS)))-(Math.abs(Z.px-(f.x+q[0]*TS))+Math.abs(Z.py-(f.y+q[1]*TS))));ch=[ch[0]];}
      const pk=ch[Math.floor(hsh(f.tm*1.3+f.v)*ch.length)]||[0,0];f.dx=pk[0];f.dy=pk[1];}
    f.x+=f.dx*f.sp;f.y+=f.dy*f.sp;
    if(Math.abs(f.x-Z.px)<15&&Math.abs(f.y-Z.py)<14){if(Z.nip>0){f.dead=true;f.mesh.visible=false;Z.score+=50;say('STOMP!','#fff');}else hurt('CHOMP!');}
  }
  if(near(M.gx,M.gy,17))win();
}
let win=function winFn(){
  if(Z.over)return;Z.over='win';
  const r=M.totT?Z.got/M.totT:1,stars=r>=.8?3:r>=.5?2:1;Z.stars=stars;
  PR.maze.st[i]=Math.max(PR.maze.st[i]||0,stars);PR.maze.at=Math.max(PR.maze.at||0,i+1);saveP();
  setTimeout(()=>end(),700);
}
function end(){
  const win=Z.over==='win';
  $('ttl').textContent=win?'MAZE SOLVED! \ud83e\udde9':'OUT OF HEARTS! \ud83d\ude3f';
  $('fin').textContent=win?'\ud83c\udf70 '+Z.got+' / '+M.totT+'   score '+Z.score+'   '+'\u2605'.repeat(Z.stars)+'\u2606'.repeat(3-Z.stars):'\ud83c\udf70 '+Z.got+' / '+M.totT+'   score '+Z.score;
  const b=$('btns');b.innerHTML='';
  const add=(t,fn,on)=>{const x=document.createElement('button');x.textContent=t;if(on)x.className='on';x.onclick=fn;b.appendChild(x);};
  if(win&&i<99)add('Next \u25b6',()=>go(i+1),true);
  add(win?'Replay':'Try again',()=>go(i),!win);
  add('Menu',()=>{location.href='index.html';});
  $('over').classList.remove('hide');
}
function go(n){location.href='maze3d.html?i='+n;}

// ---------- input: keys, or drag anywhere to steer ----------
const keys={};
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=1;if(e.key.startsWith('Arrow'))e.preventDefault();});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=0;});
let drag=null,joy={x:0,y:0};
cvs.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};try{cvs.setPointerCapture(e.pointerId);}catch(_){}});
cvs.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  joy.x=Math.abs(dx)<8?0:Math.max(-1,Math.min(1,dx/40));joy.y=Math.abs(dy)<8?0:Math.max(-1,Math.min(1,dy/40));});
const release=()=>{drag=null;joy={x:0,y:0};};
cvs.addEventListener('pointerup',release);cvs.addEventListener('pointercancel',release);

// ---------- camera, sizing, loop ----------
let camX=Z.px/TS,camZ=Z.py/TS;
function size(){const W=innerWidth,H=innerHeight;R.setSize(W,H,false);cam.aspect=W/H;cam.fov=cam.aspect<1?Math.min(88,2*Math.atan(Math.tan(52*Math.PI/360)/cam.aspect*.85)*180/Math.PI):52;cam.updateProjectionMatrix();}
addEventListener('resize',size);size();
reveal(1,1);
const hpEl=$('hp'),trEl=$('tr'),kyEl=$('ky'),scEl=$('sc');
let acc=0,last=performance.now();
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(!Z.over){acc+=dt;while(acc>=1/60&&!Z.over){step();acc-=1/60;}}
  Z.shake*=.85;
  const t=now;
  camX+=(Z.px/TS-camX)*Math.min(1,dt*8);camZ+=(Z.py/TS-camZ)*Math.min(1,dt*8);
  const sh=Z.shake>0?(Math.random()-.5)*Z.shake*.3:0;
  cam.position.set(camX+sh,8.2,camZ+6.4);cam.lookAt(camX,0,camZ-1.2);
  sun.position.set(camX+5,12,camZ+7);sun.target.position.set(camX,0,camZ);sun.target.updateMatrixWorld();
  cat.position.set(Z.px/TS,Z.mv>0?Math.abs(Math.sin(t*.02))*.08:0,Z.py/TS);
  cat.rotation.y=Math.atan2(-Z.hx,-Z.hz);
  cat.visible=!(Z.inv>0&&((Z.inv>>2)&1));
  for(const f of M.foes){if(f.dead)continue;f.mesh.position.set(f.x/TS,Math.abs(Math.sin(t*.005+f.v))*.1,f.y/TS);
    if(f.dx||f.dy)f.mesh.rotation.y=Math.atan2(-f.dx,-f.dy);}
  for(const q of M.treats){const key=q.y*M.W+q.x;q.mesh.visible=!q.got&&Z.seen[key]===1;q.mesh.rotation.y=t*.002;}
  for(const q of M.keys){q.mesh.rotation.y=t*.003;}
  for(const d of M.doors){d.mesh.visible=!d.open&&Z.seen[d.y*M.W+d.x]===1;}
  for(const s of M.spikes){const on=((Z.t+s.ph)%120)<60;s.mesh.visible=Z.seen[s.y*M.W+s.x]===1;s.mesh.position.y=on?.3:.02;s.mesh.scale.y=on?1:.3;}
  for(const q of M.nips)q.mesh.rotation.y=t*.004;
  goal.rotation.y=t*.001;goal.scale.y=1+Math.sin(t*.004)*.05;
  if(dirty){walls.instanceMatrix.needsUpdate=true;floor.instanceMatrix.needsUpdate=true;dirty=false;}
  hpEl.textContent='\u2764\ufe0f'.repeat(Math.max(0,Z.hp));
  trEl.textContent='\ud83c\udf70 '+Z.got+'/'+M.totT;
  kyEl.innerHTML=Z.keys.map((n,j)=>n?'<i style="background:'+DKC[j]+'"></i>':'').join('');
  scEl.textContent='\u2b50 '+Z.score;
  R.render(scene,cam);
}
requestAnimationFrame(frame);

/* ===== polish pass: visuals + feel (rules untouched) ===== */
// night sky dome with twinkling stars
{const sp=new Float32Array(300*3);for(let s=0;s<300;s++){const a=hsh(s*3.1)*6.283,b=.25+hsh(s*7.7)*1.2;sp[s*3]=Math.cos(a)*Math.cos(b)*60;sp[s*3+1]=Math.sin(b)*40+8;sp[s*3+2]=Math.sin(a)*Math.cos(b)*60;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(sp,3));
 scene.add(new THREE.Points(g,new THREE.PointsMaterial({color:'#ffffff',size:.35,sizeAttenuation:true,transparent:true,opacity:.75,depthWrite:false})));}
// goal beacon: warm light and a ring on the ground
const beacon=new THREE.PointLight('#ffd84a',2.2,6,2);beacon.position.set(M.gx+.5,1.6,M.gy+.5);scene.add(beacon);
const goalRing=new THREE.Mesh(new THREE.RingGeometry(.5,.62,36),new THREE.MeshBasicMaterial({color:'#ffd84a',transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));
goalRing.rotation.x=-Math.PI/2;goalRing.position.set(M.gx+.5,.07,M.gy+.5);scene.add(goalRing);
// particle pool (sparkles, dust, confetti, hurt puffs)
const pGeo=new THREE.BoxGeometry(.09,.09,.09);const parts=[];
function puff(x,y,z,n,col,up,spread){for(let i=0;i<n;i++){const m=new THREE.Mesh(pGeo,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:1}));m.position.set(x,y,z);scene.add(m);
  parts.push({m,v:new THREE.Vector3((Math.random()-.5)*spread,up*(.5+Math.random()*.6),(Math.random()-.5)*spread),life:0,max:.6+Math.random()*.5});}}
const vg=document.createElement('div');vg.id='vig';document.body.prepend(vg);
const flash=document.createElement('div');flash.id='hurtfx';document.body.prepend(flash);
// hurt: red flash + puff, bump the heart counter
const _hurt=hurt;
hurt=function(nm){const before=Z.hp;_hurt(nm);if(Z.hp<before){flash.classList.remove('go');void flash.offsetWidth;flash.classList.add('go');puff(Z.px/TS,.5,Z.py/TS,14,'#ff4d6d',2.2,1.6);hpEl.classList.remove('bump');void hpEl.offsetWidth;hpEl.classList.add('bump');}};
// win: confetti burst on the goal
const _win=win;
win=function(){const was=Z.over;_win();if(!was&&Z.over==='win'){for(const c of ['#ffd84a','#ff77b7','#7fe3ff','#9be564','#c08bff'])puff(M.gx+.5,.8,M.gy+.5,10,c,4.5,3.2);}};
// per-frame extras loop
let lastGot=0,lastNip=0,zoom=0,stepT=0,lastHp=Z.hp;
const cvBase=cam.fov;
function extras(now){
  const t=now/1000,dt=1/60;
  // beacon pulse and ring ripple
  beacon.intensity=2+.6*Math.sin(t*3);
  const rs=1+((t*.8)%1)*.9;goalRing.scale.set(rs,rs,1);goalRing.material.opacity=.8*(1-((t*.8)%1));
  // pickups: sparkle when collected
  if(Z.got>lastGot){for(let k=lastGot;k<Z.got;k++)puff(Z.px/TS,.4,Z.py/TS,6,'#ffd84a',2,1.2);lastGot=Z.got;}
  // catnip zoom: nudge FOV while zoomed
  const zt=Z.nip>0?1:0;zoom+=(zt-zoom)*.08;
  if(Math.abs(cam.fov-(cvBase-zoom*4))>.01){cam.fov=cvBase-zoom*4;cam.updateProjectionMatrix();}
  // footstep dust while moving
  if(Z.mv>0){stepT+=dt;if(stepT>.22){stepT=0;puff(Z.px/TS,.05,Z.py/TS,2,'#ffffff',.4,.4);}}
  // pulse emissives of pickups, doors, portals
  for(const q of M.treats){if(q.mesh&&!q.got)q.mesh.material.emissiveIntensity=.3+.25*Math.sin(t*4+q.x);}
  for(const q of M.keys){if(q.mesh)q.mesh.material.emissiveIntensity=.3+.3*Math.sin(t*3+q.y);}
  // cat bounce when moving
  cat.scale.y=1+(Z.mv>0?Math.sin(t*18)*.03:0);
  // sparkle/dust particles update
  for(let p=parts.length-1;p>=0;p--){const q=parts[p];q.life+=dt;if(q.life>=q.max){scene.remove(q.m);q.m.material.dispose();parts.splice(p,1);continue;}
    q.v.y-=6*dt;q.m.position.addScaledVector(q.v,dt);q.m.material.opacity=1-q.life/q.max;q.m.rotation.x+=dt*6;}
  // foes: little waddle
  for(const f of M.foes){if(f.mesh&&!f.dead)f.mesh.rotation.z=Math.sin(t*12+f.v)*.08;}
  requestAnimationFrame(extras);
}
requestAnimationFrame(extras);

/* ===== variety pass: per-level palettes, floor patterns, wall heights/tints, themed props, treat shapes, route trail ===== */
try{(function(){
const fc=new THREE.Color(),tmp=new THREE.Color();
const shift=((k*37+w*11)%100)/100;                       // per-level hue/lightness nudge so no two levels look alike
walls.material.color.set('#ffffff'); // colour now lives in per-instance colours
scene.background.offsetHSL((shift-.5)*.05,0,0);scene.fog.color.copy(scene.background);
// route = open cells; start/goal distance gives a gradient along the way
const dist=(x,y)=>Math.abs(x-1)+Math.abs(y-1),maxD=dist(M.W-2,M.H-2)||1;
const opn=(x,y)=>x>=0&&y>=0&&x<M.W&&y<M.H&&M.g[y][x]!=='#';
const room=(x,y)=>opn(x,y)&&opn(x+1,y)&&opn(x-1,y)&&opn(x,y+1)&&opn(x,y-1)&&opn(x+1,y+1)&&opn(x-1,y-1)&&opn(x+1,y-1)&&opn(x-1,y+1);
const pat=(k+w)%5;
function floorCol(x,y){
  const key=x+','+y;
  if(M.mud.has(key))return fc.set('#7a5234');
  if(M.conv.get(key))return fc.set('#7fd6ff');
  fc.set(FLOORS[w]);
  const d=dist(x,y)/maxD;
  if(pat===0)fc.offsetHSL(0,0,((x+y)&1)?.05:-.04);                                   // checker
  else if(pat===1)fc.offsetHSL(0,0,(y&1)?.045:-.03);                                  // stripes
  else if(pat===2)fc.offsetHSL(((x+2*y)%3-1)*.012,0,((x+2*y)%3-1)*.03);              // diagonal bands
  else if(pat===3)fc.offsetHSL(.04*Math.sin(x*.9)*Math.cos(y*.9),0,.035*Math.sin(x*.9+y*.9)); // waves
  else fc.offsetHSL(0,0,(hsh(x*13.1+y*7.7)-.5)*.1);                                   // speckle
  fc.offsetHSL((d-.5)*.07,0,-.02+d*.03);                                             // slow hue drift from start to far end
  if(room(x,y))fc.offsetHSL(0,.05,.06);                                              // open rooms are lighter
  if(Math.abs(x-M.gx)+Math.abs(y-M.gy)<3)fc.lerp(tmp.set('#ffe8a0'),.35);          // golden pool around the goal
  return fc;
}
for(let key=0;key<N;key++){const x=key%M.W,y=(key-x)/M.W;if(M.g[y][x]!=='#')floor.setColorAt(key,floorCol(x,y));}
if(floor.instanceColor)floor.instanceColor.needsUpdate=true;
// walls: height + tint variety (outer ring taller), set once when painted
const baseWall=new THREE.Color(WALLS[w]).offsetHSL((shift-.5)*.07,.02*(k%3),((k%4)-1.5)*.025);
paint=function(key){const x=key%M.W,y=(key-x)/M.W,isW=M.g[y][x]==='#',on=Z.seen[key]===1;
  const edge=x===0||y===0||x===M.W-1||y===M.H-1,hh=on&&isW?(edge?1.6:1+hsh(key*1.7)*.55):.01;
  D.position.set(x+.5,isW&&on?hh*.5:-6,y+.5);D.scale.set(1,hh,1);D.updateMatrix();walls.setMatrixAt(key,D.matrix);
  if(isW){fc.copy(baseWall).offsetHSL((hsh(key*3.3)-.5)*.035,0,(hsh(key*5.9)-.5)*.1+(edge?-.05:0));walls.setColorAt(key,fc);}
  D.position.set(x+.5,-.06,y+.5);D.scale.set(1,!isW&&on?1:.01,1);D.updateMatrix();floor.setMatrixAt(key,D.matrix);};
for(let key=0;key<N;key++)paint(key);
if(walls.instanceColor)walls.instanceColor.needsUpdate=true;walls.instanceMatrix.needsUpdate=true;floor.instanceMatrix.needsUpdate=true;
// treat shapes by kind
const TG=[null,new THREE.SphereGeometry(.17,12,10),new THREE.OctahedronGeometry(.2),new THREE.TorusGeometry(.14,.06,8,14),new THREE.DodecahedronGeometry(.22)];
M.treats.forEach(q=>{if(TG[q.kind]&&q.mesh){q.mesh.geometry=TG[q.kind];if(q.kind===3)q.mesh.rotation.x=Math.PI/2;}});
// themed props scattered on free floor, revealed with the fog of war
const taken=new Set([...M.treats,...M.keys,...M.nips,...M.spikes,...M.doors].map(q=>q.x+','+q.y));
M.portals.forEach(p=>{taken.add(p.a.join(','));taken.add(p.b.join(','));});taken.add('1,1');taken.add(M.gx+','+M.gy);
const mt=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.7},o||{}));
const P=(g,c,y,o)=>{const m=new THREE.Mesh(g,mt(c,o));m.position.y=y;return m;};
const B=[
 [()=>{const g=new THREE.Group();g.add(P(new THREE.CylinderGeometry(.02,.02,.3,5),'#3d8a4a',.15));g.add(P(new THREE.SphereGeometry(.1,8,6),'#ff7eb6',.34));return g;},()=>P(new THREE.SphereGeometry(.2,8,6),'#2f7a3c',.12)],
 [()=>{const g=new THREE.Group();g.add(P(new THREE.CylinderGeometry(.07,.08,.5,6),'#3f9a4a',.25));const a=P(new THREE.BoxGeometry(.28,.06,.06),'#3f9a4a',.3);g.add(a);return g;},()=>P(new THREE.ConeGeometry(.2,.28,4),'#c9a15a',.14)],
 [()=>P(new THREE.OctahedronGeometry(.2),'#bfe6ff',.25,{emissive:'#7fc8ff',emissiveIntensity:.35}),()=>P(new THREE.SphereGeometry(.16,8,6),'#ffffff',.1)],
 [()=>P(new THREE.DodecahedronGeometry(.16),'#4a2a22',.14),()=>P(new THREE.SphereGeometry(.08,8,6),'#ff6a2a',.08,{emissive:'#ff3300',emissiveIntensity:.9})],
 [()=>{const g=new THREE.Group();g.add(P(new THREE.CylinderGeometry(.025,.025,.34,5),'#ffffff',.17));g.add(P(new THREE.SphereGeometry(.13,8,6),'#ff5fa8',.38));return g;},()=>P(new THREE.TorusGeometry(.1,.04,6,10),'#ffd84a',.06)],
 [()=>{const g=new THREE.Group();g.add(P(new THREE.CylinderGeometry(.04,.05,.2,6),'#f2eede',.1));const c=P(new THREE.SphereGeometry(.14,8,6),'#8fb8ff',.22,{emissive:'#6a8cff',emissiveIntensity:.5});c.scale.y=.6;g.add(c);return g;},()=>P(new THREE.IcosahedronGeometry(.1),'#cfd8ff',.1)],
 [()=>{const m=P(new THREE.SphereGeometry(.17,10,8),'#ff8a2a',.14);m.scale.y=.75;return m;},()=>P(new THREE.BoxGeometry(.18,.3,.06),'#8a8fa0',.15)],
 [()=>{const g=new THREE.Group();for(const dx of [-.08,0,.08])g.add(Object.assign(P(new THREE.SphereGeometry(.1,8,6),'#ffffff',.1),{position:new THREE.Vector3(dx,.1,0)}));return g;},()=>P(new THREE.ConeGeometry(.1,.3,5),'#7ad07a',.15)],
 [()=>P(new THREE.CylinderGeometry(.06,.1,.5,6),'#8fb8ff',.25,{emissive:'#5a7aff',emissiveIntensity:.4}),()=>P(new THREE.SphereGeometry(.12,10,8),'#c08bff',.14)],
 [()=>{const g=new THREE.Group();for(const a of [-.4,0,.4]){const c=P(new THREE.ConeGeometry(.05,.34,5),'#ff7a6a',.17);c.rotation.z=a;g.add(c);}return g;},()=>P(new THREE.SphereGeometry(.12,8,6),'#ffd2e0',.08)]
];
const deco=[];const cells=[];
for(let y=1;y<M.H-1;y++)for(let x=1;x<M.W-1;x++)if(opn(x,y)&&!taken.has(x+','+y)&&!M.mud.has(x+','+y)&&!M.conv.has(x+','+y))cells.push([x,y]);
const want=Math.min(cells.length,Math.floor(N/11));
for(let n=0;n<want;n++){const c=cells.splice(Math.floor(hsh(n*9.1+i*3.7)*cells.length),1)[0];if(!c)break;
  const mk=B[w][hsh(n*2.3+i)<.5?0:1](),o=(hsh(n*5.1)-.5)*.5,o2=(hsh(n*6.7)-.5)*.5;
  mk.position.x=c[0]+.5+o;mk.position.z=c[1]+.5+o2;mk.rotation.y=hsh(n*1.9)*6.28;mk.scale.setScalar(.8+hsh(n*4.3)*.7);mk.visible=false;scene.add(mk);deco.push({m:mk,key:c[1]*M.W+c[0]});}
// route trail: tiles you have walked on pick up a coloured tint that changes per level
const trail=new THREE.Color().setHSL((shift+.55)%1,.55,.62),seenCell=new Set();let lastCell='';
function tick(){requestAnimationFrame(tick);
  for(const d of deco)d.m.visible=Z.seen[d.key]===1;
  const x=Math.floor(Z.px/TS),y=Math.floor(Z.py/TS),ck=x+','+y;
  if(ck!==lastCell){lastCell=ck;if(opn(x,y)&&!seenCell.has(ck)&&!M.mud.has(ck)&&!M.conv.get(ck)){seenCell.add(ck);const key=y*M.W+x;floor.getColorAt(key,tmp);tmp.lerp(trail,.4);floor.setColorAt(key,tmp);floor.instanceColor.needsUpdate=true;}}
}
requestAnimationFrame(tick);
})();}catch(err){console.warn('maze variety skipped',err);}
