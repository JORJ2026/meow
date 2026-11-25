import * as THREE from 'https://esm.sh/three@0.160.0';
const $=id=>document.getElementById(id);
const N=8,S=1,FOV=38;
const KINDS=[
 {e:'🐟',c:'#6fdcff',l:'#effcff',d:'#0b5fae',s:0},
 {e:'🧶',c:'#ff8fd6',l:'#ffeaf7',d:'#9c1859',s:1},
 {e:'🐭',c:'#e8f0f4',l:'#ffffff',d:'#55707e',s:2},
 {e:'🐾',c:'#ffc66b',l:'#fff4de',d:'#b9500a',s:3},
 {e:'🥛',c:'#e6ffd6',l:'#ffffff',d:'#4f8f29',s:4},
 {e:'💖',c:'#ff6f88',l:'#ffe0e6',d:'#9e1229',s:1},
 {e:'⭐',c:'#fff19a',l:'#fffdea',d:'#cc9100',s:2}];
const rnd=(a,b)=>a+Math.random()*(b-a);
let W=0,H=0,camDist=10,pxCell=50;
let G=[],DEAD=[],P=[],state='idle',timer=0,score=0,best=0,chain=0,comboT=0,sel=null,pend=null,drag=null,hov=null,hint,idleT=0;
let shake=0,mood='idle',moodT=0,last=performance.now();
let yaw=0,pitch=.5236,orb=null;
addEventListener('contextmenu',e=>e.preventDefault());
try{best=+localStorage.getItem('cj-best')||0;}catch(e){}

// ---------- renderer / scene / camera ----------
const R=new THREE.WebGLRenderer({canvas:$('c'),antialias:true});
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
R.outputColorSpace=THREE.SRGBColorSpace;
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.08;
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(FOV,1,.1,200);
const camBase=new THREE.Vector3(0,0,10);
function layout(){
  const D=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;
  R.setPixelRatio(D);R.setSize(W,H,false);
  cam.aspect=W/H;cam.updateProjectionMatrix();
  const t=Math.tan(THREE.MathUtils.degToRad(FOV/2));
  const half=(N/2+.75)*S;
  camDist=Math.max(half/t,half/(t*cam.aspect))*1.05;
  camBase.set(0,camDist*.5,camDist*.866);
  pxCell=H/(2*camDist*t)*S;
}
addEventListener('resize',layout);layout();

// ---------- helpers ----------
function gradTex(stops){const c=document.createElement('canvas');c.width=4;c.height=256;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,256);stops.forEach(([o,col])=>gr.addColorStop(o,col));g.fillStyle=gr;g.fillRect(0,0,4,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function radialTex(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function emojiTex(e){const c=document.createElement('canvas');c.width=c.height=160;const g=c.getContext('2d');g.font='118px "Apple Color Emoji","Segoe UI Emoji",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=8;g.shadowOffsetY=5;g.fillText(e,80,84);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function markTex(col){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.strokeStyle=col;g.lineWidth=10;g.shadowColor=col;g.shadowBlur=16;g.beginPath();g.roundRect(18,18,92,92,26);g.stroke();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function pts(arr){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(arr,3));return g;}
function rrShape(sh,x,y,w,h,r){sh.moveTo(x+r,y);sh.lineTo(x+w-r,y);sh.quadraticCurveTo(x+w,y,x+w,y+r);sh.lineTo(x+w,y+h-r);sh.quadraticCurveTo(x+w,y+h,x+w-r,y+h);sh.lineTo(x+r,y+h);sh.quadraticCurveTo(x,y+h,x,y+h-r);sh.lineTo(x,y+r);sh.quadraticCurveTo(x,y,x+r,y);return sh;}
function xtrude(sh,depth,bev){const g=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelThickness:bev,bevelSize:bev*.9,bevelSegments:3,curveSegments:10});g.center();return g;}
const wx=x=>(x-(N-1)/2)*S, wy=y=>-(y-(N-1)/2)*S;
const cx=c=>wx(c), cy=r=>wy(r);

// ---------- lights & sky ----------
scene.background=gradTex([[0,'#2c1878'],[.55,'#170c42'],[1,'#0a0522']]);
const GLOW=radialTex();
scene.add(new THREE.HemisphereLight('#d9c8ff','#2a1b55',1.1));
const sun=new THREE.DirectionalLight('#fff0d6',2.3);
sun.position.set(-4,9,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-6,right:6,top:6,bottom:-6,near:1,far:40});
sun.shadow.bias=-.0008;scene.add(sun);
const rim=new THREE.DirectionalLight('#ff8fd6',.7);rim.position.set(5,-2,-4);scene.add(rim);

const starPos=new Float32Array(240*3);
for(let i=0;i<240;i++){starPos[i*3]=rnd(-40,40);starPos[i*3+1]=rnd(-14,30);starPos[i*3+2]=rnd(-45,-20);}
const starMat=new THREE.PointsMaterial({color:'#ffffff',size:.2,transparent:true,opacity:.8,depthWrite:false});
scene.add(new THREE.Points(pts(starPos),starMat));
const moon=new THREE.Mesh(new THREE.SphereGeometry(1.6,32,24),new THREE.MeshStandardMaterial({color:'#fff1d0',emissive:'#ffe6a8',emissiveIntensity:.7,roughness:1}));
moon.position.set(9,8,-26);scene.add(moon);
const moonGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:'#ffd98a',transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false}));
moonGlow.position.copy(moon.position);moonGlow.scale.setScalar(12);scene.add(moonGlow);
const clouds=[];
for(let i=0;i<6;i++){const g=new THREE.Group();const n=3+(i%3);
  for(let k=0;k<n;k++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:'#b9a6ff',transparent:true,opacity:.28,depthWrite:false}));s.position.set(k*2.2-n,rnd(-.3,.3),0);s.scale.set(rnd(4,6),rnd(2,3),1);g.add(s);}
  g.position.set(rnd(-16,16),rnd(-3,7),-18-(i%3)*4);scene.add(g);clouds.push({g,sp:rnd(.3,.8)});}
const motePos=new Float32Array(70*3);
for(let i=0;i<70;i++){motePos[i*3]=rnd(-6,6);motePos[i*3+1]=rnd(-5,5);motePos[i*3+2]=rnd(-3,1.5);}
const moteGeo=pts(motePos);
scene.add(new THREE.Points(moteGeo,new THREE.PointsMaterial({color:'#ffffff',size:.07,transparent:true,opacity:.7,depthWrite:false})));

// ---------- board: tray + wells ----------
const board=new THREE.Group();scene.add(board);
const trayGeo=new THREE.ExtrudeGeometry(rrShape(new THREE.Shape(),-N/2-.3,-N/2-.3,N+.6,N+.6,.6),{depth:.3,bevelEnabled:true,bevelThickness:.06,bevelSize:.06,bevelSegments:4,curveSegments:12});
trayGeo.translate(0,0,-.36);
const trayMat=new THREE.MeshPhysicalMaterial({color:'#4b2fa3',roughness:.3,metalness:.1,clearcoat:.8,clearcoatRoughness:.2,emissive:'#8a5cff',emissiveIntensity:.14});
const tray=new THREE.Mesh(trayGeo,trayMat);tray.receiveShadow=true;tray.castShadow=true;board.add(tray);
const wellGeo=new THREE.ExtrudeGeometry(rrShape(new THREE.Shape(),-.44,-.44,.88,.88,.22),{depth:.03,bevelEnabled:false,curveSegments:8});
const wells=new THREE.InstancedMesh(wellGeo,new THREE.MeshStandardMaterial({color:'#1e1048',roughness:.8}),N*N);
wells.receiveShadow=true;
{const m4=new THREE.Matrix4();let wi=0;for(let r=0;r<N;r++)for(let c=0;c<N;c++){m4.makeTranslation(wx(c),wy(r),0);wells.setMatrixAt(wi++,m4);}}
board.add(wells);

// ---------- gems ----------
function shapeStar(){const sh=new THREE.Shape();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?.19:.4;const x=Math.cos(a)*q,y=Math.sin(a)*q;i?sh.lineTo(x,y):sh.moveTo(x,y);}sh.closePath();return sh;}
function shapeHex(){const sh=new THREE.Shape();for(let i=0;i<6;i++){const a=i*Math.PI/3+Math.PI/6,x=Math.cos(a)*.4,y=Math.sin(a)*.4;i?sh.lineTo(x,y):sh.moveTo(x,y);}sh.closePath();return sh;}
const GEO=[];
GEO[0]=xtrude(rrShape(new THREE.Shape(),-.36,-.36,.72,.72,.18),.2,.06);GEO[0].userData.fz=.16;
GEO[1]=new THREE.SphereGeometry(.42,36,24);GEO[1].scale(1,1,.6);GEO[1].userData.fz=.25;
GEO[2]=new THREE.OctahedronGeometry(.46,0);GEO[2].scale(1,1,.7);GEO[2].userData.fz=.32;
GEO[3]=xtrude(shapeHex(),.2,.06);GEO[3].userData.fz=.16;
GEO[4]=xtrude(shapeStar(),.18,.05);GEO[4].userData.fz=.14;
const EMO=KINDS.map(d=>emojiTex(d.e));
const gemRoot=new THREE.Group();board.add(gemRoot);
function makeGem(k){
  const d=KINDS[k],geo=GEO[d.s];
  const mat=new THREE.MeshPhysicalMaterial({color:d.c,roughness:.12,metalness:.05,clearcoat:1,clearcoatRoughness:.08,emissive:d.d,emissiveIntensity:.16});
  const grp=new THREE.Group();
  const body=new THREE.Mesh(geo,mat);body.castShadow=true;body.receiveShadow=true;grp.add(body);
  const face=new THREE.Mesh(new THREE.PlaneGeometry(.62,.62),new THREE.MeshBasicMaterial({map:EMO[k],transparent:true,depthWrite:false}));
  face.position.z=geo.userData.fz+.02;face.renderOrder=2;grp.add(face);
  grp.userData.mat=mat;
  return grp;
}
function place(g,t){
  if(!g.o3){g.o3=makeGem(g.k);g.o3.userData.g=g;gemRoot.add(g.o3);}
  const o=g.o3,live=G[g.r]&&G[g.r][g.c]===g;
  const isSel=live&&sel&&sel.r===g.r&&sel.c===g.c;
  const bob=live&&state==='idle'?Math.sin(t*2+g.c*.7+g.r*1.3)*.025:0;
  o.position.set(wx(g.x),wy(g.y)+bob,.2);
  const sc=g.s*(isSel?1+.07*Math.sin(t*7):1);
  const sy=1+Math.min(.22,Math.abs(g.vy||0)*.05);
  o.scale.set(sc/Math.sqrt(sy),sc*sy,sc);
  o.rotation.set(0,g.spin||0,-Math.max(-.25,Math.min(.25,(g.vx||0)*.03)));
  o.userData.mat.emissiveIntensity=.16+(g.glint||0)*1.1;
}

// ---------- markers (selection, hover, hint) ----------
function marker(col){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:markTex(col),transparent:true,depthWrite:false}));m.visible=false;m.renderOrder=3;scene.add(m);return m;}
const selM=marker('#ffffff'),hovM=marker('#ffffff'),hintA=marker('#fff6aa'),hintB=marker('#fff6aa');
hovM.material.opacity=.35;

// ---------- particles (pooled) ----------
const dotGeo=new THREE.SphereGeometry(.05,8,6);
const dotPool=[];for(let i=0;i<220;i++){const m=new THREE.Mesh(dotGeo,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false}));m.visible=false;scene.add(m);dotPool.push({m,busy:false});}
const ringGeo=new THREE.RingGeometry(.4,.5,40);
const ringPool=[];for(let i=0;i<8;i++){const m=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide}));m.visible=false;scene.add(m);ringPool.push({m,busy:false});}
const takeDot=()=>dotPool.find(d=>!d.busy)||null;
const takeRing=()=>ringPool.find(d=>!d.busy)||null;
function release(q){if(q.d){q.d.busy=false;q.d.m.visible=false;}if(q.rg){q.rg.busy=false;q.rg.m.visible=false;}if(q.el)q.el.remove();}
function say(t,col){const b=$('banner');b.textContent=t;b.style.color=col;b.classList.remove('show');void b.offsetWidth;b.classList.add('show');}
function mood_(m,t){mood=m;moodT=t||0;}
function spark(x,y,col,n){for(let i=0;i<n;i++){const d=takeDot();if(!d)return;const a=rnd(0,6.28),v=rnd(1.2,3.6);d.busy=true;d.m.visible=true;d.m.material.color.set(col);d.m.material.opacity=1;d.m.position.set(x,y,.4);d.m.scale.setScalar(rnd(.7,1.4));
  P.push({k:'d',d,x,y,z:.4,vx:Math.cos(a)*v,vy:Math.sin(a)*v+1,vz:rnd(0,1.5),life:0,max:rnd(.4,.8),g:-7});}}
function ring(x,y,col,r){const rg=takeRing();if(!rg)return;rg.busy=true;rg.m.visible=true;rg.m.material.color.set(col);rg.m.position.set(x,y,.4);P.push({k:'r',rg,x,y,r,life:0,max:.5});}
function pop(x,y,t,col){const el=document.createElement('div');el.className='pop';el.textContent=t;el.style.color=col;$('pops').appendChild(el);P.push({k:'t',x,y,el,life:0,max:.9});}
function updateParts(dt){
  for(const q of P){
    q.life+=dt;const p=q.life/q.max;
    if(q.k==='d'){q.vy+=(q.g||0)*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.z+=(q.vz||0)*dt;q.d.m.position.set(q.x,q.y,q.z);q.d.m.material.opacity=1-p;}
    else if(q.k==='r'){q.rg.m.scale.setScalar(q.r*(1.4+p*.8));q.rg.m.material.opacity=1-p;q.rg.m.lookAt(cam.position);}
    else if(q.k==='t'){q.y+=dt*.6;const v=new THREE.Vector3(q.x,q.y,.5).project(cam);q.el.style.left=((v.x+1)/2*W)+'px';q.el.style.top=((1-v.y)/2*H)+'px';q.el.style.opacity=1-p;}
  }
  const keep=[];for(const q of P){if(q.life<q.max)keep.push(q);else release(q);}P=keep;
}

// ---------- game logic (unchanged) ----------
const mk=(k,r,c)=>({k,r,c,x:c,y:r,s:1,vx:0,vy:0,glint:0,spin:0});
const cells=()=>{const a=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(G[r][c])a.push(G[r][c]);return a;};
const inB=p=>p.r>=0&&p.r<N&&p.c>=0&&p.c<N;
const adj=(a,b)=>Math.abs(a.r-b.r)+Math.abs(a.c-b.c)===1;

function findMatches(){
  const m=new Set();
  for(let r=0;r<N;r++){let run=1;for(let c=1;c<=N;c++){const same=c<N&&G[r][c].k===G[r][c-1].k;if(same)run++;else{if(run>=3)for(let j=c-run;j<c;j++)m.add(G[r][j]);run=1;}}}
  for(let c=0;c<N;c++){let run=1;for(let r=1;r<=N;r++){const same=r<N&&G[r][c].k===G[r-1][c].k;if(same)run++;else{if(run>=3)for(let j=r-run;j<r;j++)m.add(G[j][c]);run=1;}}}
  return m;
}
function swapG(a,b){const A=G[a.r][a.c],B=G[b.r][b.c];G[a.r][a.c]=B;G[b.r][b.c]=A;A.r=b.r;A.c=b.c;B.r=a.r;B.c=a.c;}
function pairs(){const a=[];for(let r=0;r<N;r++)for(let c=0;c<N;c++)for(const [dr,dc] of [[0,1],[1,0]]){const b={r:r+dr,c:c+dc};if(inB(b))a.push([{r,c},b]);}return a;}
function hasMove(){
  for(const [a,b] of pairs()){swapG(a,b);const ok=findMatches().size>0;swapG(a,b);if(ok)return true;}
  return false;
}
function findHint(){
  for(const [a,b] of pairs()){swapG(a,b);const ok=findMatches().size>0;swapG(a,b);if(ok)return [a,b];}
  return null;
}
function shuffle(){
  let tries=0;
  do{
    const ks=cells().map(g=>g.k).sort(()=>Math.random()-.5);
    cells().forEach((g,i)=>g.k=ks[i]);tries++;
  }while((findMatches().size||!hasMove())&&tries<300);
  for(const g of cells())spark(cx(g.c),cy(g.r),KINDS[g.k].c,3);
  say('SHUFFLE 🐾','#c5b6ff');
}
function newBoard(){
  G=[];
  for(let r=0;r<N;r++){G.push([]);for(let c=0;c<N;c++){
    let k;do{k=Math.floor(Math.random()*KINDS.length);}while((c>1&&G[r][c-1].k===k&&G[r][c-2].k===k)||(r>1&&G[r-1][c].k===k&&G[r-2][c].k===k));
    const g=mk(k,r,c);g.y=r-6-c*.2;G[r][c]=g;
  }}
  if(!hasMove())shuffle();
}
function trySwap(a,b){
  chain=0;hint=undefined;idleT=0;swapG(a,b);
  if(findMatches().size){state='fall';}
  else{pend={a,b};state='wait';timer=.25;mood_('idle');}
}
function gravity(){
  for(let c=0;c<N;c++){
    let w=N-1;
    for(let r=N-1;r>=0;r--){const g=G[r][c];if(g){if(r!==w){G[w][c]=g;G[r][c]=null;g.r=w;}w--;}}
    for(let r=w;r>=0;r--){const g=mk(Math.floor(Math.random()*KINDS.length),r,c);g.y=r-(w+1);G[r][c]=g;}
  }
}
function addScore(p){
  const before=score;score+=p;
  if(score>best){best=score;try{localStorage.setItem('cj-best',best);}catch(e){}}
  const m=Math.floor(score/500);
  if(m>Math.floor(before/500)){
    const cols=['#ff8fd6','#6fdcff','#ffd66b','#9dff9a','#c5b6ff'];
    for(let i=0;i<60;i++){const d=takeDot();if(!d)break;d.busy=true;d.m.visible=true;d.m.material.color.set(cols[i%5]);d.m.material.opacity=1;d.m.scale.setScalar(rnd(1.2,2.2));
      P.push({k:'d',d,x:rnd(-4.2,4.2),y:rnd(4.5,6),z:rnd(.5,2),vx:rnd(-.5,.5),vy:rnd(-1,-2.5),vz:0,life:0,max:rnd(2,3.2),g:-.8});}
    say('PURR-FECT! ✨','#9ff7ff');
  }
}
function check(){
  const m=findMatches();
  if(m.size){
    chain++;comboT=2.5;
    const pts=m.size*10*chain;addScore(pts);
    let sx=0,sy=0;for(const g of m){sx+=g.c;sy+=g.r;}
    pop(cx(sx/m.size),cy(sy/m.size),'+'+pts,'#fff6b0');
    for(const g of m){G[g.r][g.c]=null;g.s=1;DEAD.push(g);spark(cx(g.c),cy(g.r),KINDS[g.k].c,12);ring(cx(g.c),cy(g.r),KINDS[g.k].l,.75*S);}
    if(chain>=2)say('COMBO x'+chain+'!','#ffd66b');
    shake=Math.min(12,chain*3);
    mood_(chain>=3?'wow':'happy',1);
    state='clear';timer=.22;
  }else{
    if(!hasMove())shuffle();
    state='idle';
  }
}
function update(dt){
  const k=1-Math.exp(-dt*16);let settled=true;
  for(const g of cells()){
    const x0=g.x,y0=g.y;
    g.x+=(g.c-g.x)*k;g.y+=(g.r-g.y)*k;
    g.vx=dt>0?(g.x-x0)/dt:0;g.vy=dt>0?(g.y-y0)/dt:0;
    if(Math.abs(g.x-g.c)<.004&&Math.abs(g.y-g.r)<.004){g.x=g.c;g.y=g.r;g.vx=g.vy=0;}else settled=false;
    if(g.glint>0)g.glint=Math.max(0,g.glint-dt*1.4);
    else if(Math.random()<dt*.08)g.glint=1;
  }
  for(const g of DEAD){g.s=Math.max(0,g.s-dt*6);g.spin+=dt*9;}
  DEAD=DEAD.filter(g=>g.s>0);
  timer-=dt;
  if(state==='wait'&&timer<=0){swapG(pend.a,pend.b);pend=null;state='fall';}
  else if(state==='clear'&&timer<=0){gravity();state='fall';}
  else if(state==='fall'&&settled&&!DEAD.length){check();}
  if(state==='idle'&&!drag){
    idleT+=dt;
    if(hint===undefined&&idleT>6)hint=findHint();
  }
  if(comboT>0)comboT=Math.max(0,comboT-dt*(chain>0?1:4));
  if(moodT>0){moodT-=dt;if(moodT<=0)mood='idle';}
  if(idleT>14&&mood==='idle')mood='sleep';
  if(shake>0)shake=Math.max(0,shake-dt*40);
}

// ---------- input ----------
const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,0,1),-.2),hit=new THREE.Vector3(),ndc=new THREE.Vector2();
function cellAt(x,y){
  ndc.set(x/W*2-1,-(y/H)*2+1);ray.setFromCamera(ndc,cam);
  if(!ray.ray.intersectPlane(plane,hit))return null;
  const c=Math.floor(hit.x/S+N/2),r=Math.floor(-hit.y/S+N/2);
  return inB({r,c})?{r,c}:null;
}
addEventListener('pointerdown',e=>{
  idleT=0;hint=undefined;
  const p=cellAt(e.clientX,e.clientY);
  if(!p||e.button===2||e.shiftKey){orb={x:e.clientX,y:e.clientY,yaw0:yaw,pitch0:pitch};return;}
  if(state!=='idle')return;
  drag={p,x:e.clientX,y:e.clientY,moved:false};
});
addEventListener('pointermove',e=>{
  if(orb){yaw=Math.max(-1.2,Math.min(1.2,orb.yaw0-(e.clientX-orb.x)*.005));pitch=Math.max(.1,Math.min(1.35,orb.pitch0+(e.clientY-orb.y)*.004));return;}
  hov=cellAt(e.clientX,e.clientY);
  if(drag&&hov&&Math.random()<.3)spark(cx(hov.c),cy(hov.r),'#fff6b0',1);
  if(!drag||drag.moved)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(Math.hypot(dx,dy)<pxCell*.3)return;
  drag.moved=true;sel=null;
  const q=Math.abs(dx)>Math.abs(dy)?{r:drag.p.r,c:drag.p.c+Math.sign(dx)}:{r:drag.p.r+Math.sign(dy),c:drag.p.c};
  if(inB(q)&&state==='idle')trySwap({r:drag.p.r,c:drag.p.c},q);
});
addEventListener('pointerup',e=>{
  if(orb){orb=null;return;}
  if(!drag)return;const d=drag;drag=null;
  if(d.moved||state!=='idle')return;
  if(sel&&adj(sel,d.p)){const a=sel;sel=null;trySwap(a,d.p);}
  else sel=(sel&&sel.r===d.p.r&&sel.c===d.p.c)?null:d.p;
});

// ---------- per-frame rendering ----------
const camOff=new THREE.Vector3();
function render3(dt,t){
  const alive=new Set(cells());for(const g of DEAD)alive.add(g);
  for(const o of [...gemRoot.children]){if(!alive.has(o.userData.g)){gemRoot.remove(o);o.userData.mat.dispose();}}
  for(const g of alive)place(g,t);
  // markers
  const idle=state==='idle';
  selM.visible=!!(sel&&idle);
  if(sel){selM.position.set(cx(sel.c),cy(sel.r),.42);selM.material.opacity=.55+.4*Math.sin(t*6);}
  const showHov=!!(hov&&idle&&!drag&&!(sel&&hov.r===sel.r&&hov.c===sel.c));
  hovM.visible=showHov;
  if(showHov)hovM.position.set(cx(hov.c),cy(hov.r),.42);
  const showHint=!!(hint&&idle);
  hintA.visible=hintB.visible=showHint;
  if(showHint){const a=.4+.5*Math.sin(t*6);
    hintA.position.set(cx(hint[0].c),cy(hint[0].r),.42);hintB.position.set(cx(hint[1].c),cy(hint[1].r),.42);
    hintA.material.opacity=hintB.material.opacity=a;}
  trayMat.emissiveIntensity=.12+.08*Math.sin(t*2);
  starMat.opacity=.6+.25*Math.sin(t*1.3);
  // HUD (DOM)
  $('sc').textContent='🐾 '+score;
  $('bs').textContent='BEST '+best;
  $('cbf').style.transform='scaleX('+Math.max(0,Math.min(1,comboT/2.5)).toFixed(3)+')';
  $('mood').textContent={idle:'😺',happy:'😻',wow:'🙀',sleep:'😴'}[mood]||'😺';
}
function ambient(dt,t){
  for(let i=0;i<70;i++){motePos[i*3+1]+=dt*(.25+(i%5)*.05);if(motePos[i*3+1]>5)motePos[i*3+1]=-5;}
  moteGeo.attributes.position.needsUpdate=true;
  for(const c of clouds){c.g.position.x+=dt*c.sp;if(c.g.position.x>18)c.g.position.x=-18;}
  moon.material.emissiveIntensity=.7+.05*Math.sin(t*.8);
}
let last2=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;const t=now/1000;
  update(dt);
  updateParts(dt);
  ambient(dt,t);
  camOff.set(Math.sin(t*.35)*.18+(Math.random()-.5)*shake*.02,(Math.random()-.5)*shake*.02,0);
  const rad=camDist,cp=Math.cos(pitch);
  cam.position.set(Math.sin(yaw)*rad*cp+camOff.x,Math.sin(pitch)*rad+camOff.y,Math.cos(yaw)*rad*cp);
  cam.lookAt(0,0,0);
  render3(dt,t);
  R.render(scene,cam);
  requestAnimationFrame(frame);
}
newBoard();
state='fall';
requestAnimationFrame(frame);
