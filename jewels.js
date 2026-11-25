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
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFShadowMap;
R.outputColorSpace=THREE.SRGBColorSpace;
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.08;
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(FOV,1,.1,200);
const camBase=new THREE.Vector3(0,0,10);
function layout(){
  const D=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;
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

/* ===== polish pass: visuals + feel (game logic untouched) ===== */
scene.fog=new THREE.Fog('#0b0820',20,42);
// 1. aurora ribbons drifting behind the board
const auroraT=(()=>{const c=document.createElement('canvas');c.width=256;c.height=64;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,256,0);gr.addColorStop(0,'rgba(120,255,220,0)');gr.addColorStop(.5,'rgba(160,120,255,.9)');gr.addColorStop(1,'rgba(255,120,200,0)');g.fillStyle=gr;g.fillRect(0,0,256,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
const aurora=[];
for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(36,4.2),new THREE.MeshBasicMaterial({map:auroraT,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending}));m.position.set(0,6+i*2.2,-12-i*1.5);m.rotation.z=(i-1)*.08;scene.add(m);aurora.push(m);}
// 2. shooting stars
const shoots=[];
const shootGeo=new THREE.BoxGeometry(2.6,.035,.02);
// 3. swap-wiggle when a swap does not match
let wig=0;
// 4. tap ring when selecting a gem
addEventListener('pointerdown',e=>{const p=cellAt(e.clientX,e.clientY);if(p&&state==='idle')ring(cx(p.c),cy(p.r),'#ffffff',.6*S);});
// 5. combo bar colour climbs with the chain
const cbf=$('cbf');
// 6. HUD score punch
let lastScore=0;
// 7. board breathes; tray hue lifts on combos
const _trySwap=trySwap;
trySwap=function(a,b){_trySwap(a,b);if(state==='wait'){wig=1;}};
const _update=update;
update=function(dt){_update(dt);wig=Math.max(0,wig-dt*2.2);
  if(comboT>0)trayMat.color.lerp(new THREE.Color(chain>=3?'#7a3fc4':'#4b2fa3'),Math.min(1,dt*3));
};
const _check=check;
check=function(){const before=chain;_check();if(chain>before&&chain>=2){ring(0,0,'#ffd66b',S*4.8);}};
const _render3=render3;
render3=function(dt,t){_render3(dt,t);
  // 8. gentle idle sway on every settled gem
  if(state==='idle')for(const g of cells()){if(g.o3)g.o3.rotation.y+=Math.sin(t*1.7+g.r*.9+g.c*1.3)*.03;}
  // 9. hover cursor
  R.domElement.style.cursor=(hov&&state==='idle'&&!drag)?'pointer':'default';
  // 10. invalid-swap wiggle
  board.position.x=Math.sin(t*46)*wig*.09;
  // 11. board breath
  board.scale.setScalar(1+.006*Math.sin(t*1.6)+(comboT>0?.01*Math.min(1,comboT):0));
  // 12. combo bar colour
  cbf.style.background=chain>=3?'linear-gradient(90deg,#c5b6ff,#ff6fb5)':chain>=2?'linear-gradient(90deg,#9fffe0,#ffd66b)':'linear-gradient(90deg,#ffd66b,#ff6fb5)';
  // 13. score punch
  if(score!==lastScore){lastScore=score;const sc=$('sc');sc.classList.remove('punch');void sc.offsetWidth;sc.classList.add('punch');}
  // 14. sleeping cat drops Zzz
  if(mood==='sleep'&&Math.random()<dt*.9)pop(cx(N/2),cy(-.5),'z',"#c5b6ff");
  // 15. aurora ribbons slide and breathe
  for(let i=0;i<aurora.length;i++){const a=aurora[i];a.position.x=Math.sin(t*.12+i*2)*4;a.material.opacity=.16+.08*Math.sin(t*.7+i);}
};
const _ambient=ambient;
ambient=function(dt,t){_ambient(dt,t);
  // 16. shooting stars now and then
  if(Math.random()<dt*.18){const m=new THREE.Mesh(shootGeo,new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false}));m.position.set(rnd(-10,6),rnd(4,9),-20);m.rotation.z=-.35;scene.add(m);shoots.push({m,life:0});}
  for(const s of shoots){s.life+=dt;s.m.position.x+=dt*14;s.m.position.y-=dt*5;s.m.material.opacity=Math.max(0,1-s.life*1.4)*.9;}
  for(const s of shoots.filter(s=>s.life>1.2)){scene.remove(s.m);s.m.material.dispose();}
  for(let i=shoots.length-1;i>=0;i--)if(shoots[i].life>1.2)shoots.splice(i,1);
  // 17. moon halo breathes
  moonGlow.scale.setScalar(12+.6*Math.sin(t*.9));
  // 18. stars twinkle individually (cheap: jitter the shared opacity)
  starMat.size=.2+.04*Math.sin(t*2.3);
};
// 19. vignette element
const vg=document.createElement('div');vg.id='vig';document.body.prepend(vg);
// 20. flash on big combo banner
const _say=say;
say=function(t,col){_say(t,col);if(/PURR|COMBO/.test(t)){vg.classList.remove('go');void vg.offsetWidth;vg.classList.add('go');}};

/* ===== background pass 2: 20 more sky / scenery upgrades (visual only, wrapped so it can never break the game) ===== */
try{(function(){
const bgG=new THREE.Group();scene.add(bgG);              // 12. everything below sits in one group that parallaxes with the camera
const hexes=a=>new THREE.Color(a);
// 1. richer five-stop night sky
scene.background=gradTex([[0,'#3d2096'],[.28,'#2a1478'],[.55,'#1a0c4c'],[.82,'#110830'],[1,'#06031a']]);
// 2. far dim star layer (small, blue-white)
const s2=new Float32Array(300*3);for(let i=0;i<300;i++){s2[i*3]=rnd(-55,55);s2[i*3+1]=rnd(-16,34);s2[i*3+2]=rnd(-55,-30);}
const s2m=new THREE.PointsMaterial({color:'#bcd2ff',size:.11,transparent:true,opacity:.65,depthWrite:false,fog:false});bgG.add(new THREE.Points(pts(s2),s2m));
// 3. coloured star layer (pink / gold)
const s3=new Float32Array(60*3);for(let i=0;i<60;i++){s3[i*3]=rnd(-40,40);s3[i*3+1]=rnd(-10,28);s3[i*3+2]=rnd(-42,-24);}
const s3m=new THREE.PointsMaterial({color:'#ffc8e8',size:.26,map:GLOW,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});bgG.add(new THREE.Points(pts(s3),s3m));
// 4. nebula clouds
const neb=[];[['#ff4fa3',-14,3],['#4fd1ff',13,-2],['#8a5cff',0,9],['#ff9d4f',-6,-8],['#4fffc4',9,10]].forEach(([c,x,y],i)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:c,transparent:true,opacity:.13,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));s.position.set(x,y,-36-i);s.scale.setScalar(24+i*3);bgG.add(s);neb.push(s);});
// 5. ringed planet
const planet=new THREE.Group();
planet.add(new THREE.Mesh(new THREE.SphereGeometry(2.1,36,28),new THREE.MeshStandardMaterial({color:'#7a63e8',emissive:'#2b1a7a',emissiveIntensity:.5,roughness:.9,fog:false})));
const ringM=new THREE.Mesh(new THREE.RingGeometry(3,4.6,72),new THREE.MeshBasicMaterial({color:'#e7c9ff',transparent:true,opacity:.5,side:THREE.DoubleSide,depthWrite:false,fog:false}));ringM.rotation.x=-1.25;planet.add(ringM);
planet.rotation.z=.35;planet.position.set(-14,-4.5,-30);bgG.add(planet);
// 6. three layered ridge silhouettes
[['#1d1053',-9.2,-17,1.1],['#150b3c',-10.6,-21,1.7],['#0f0829',-12,-25,2.4]].forEach(([col,base,z,amp],i)=>{const sh=new THREE.Shape();sh.moveTo(-50,-22);for(let x=-50;x<=50;x+=2){sh.lineTo(x,base+Math.sin(x*.28+i*2)*amp+Math.sin(x*.09+i)*amp*1.4);}sh.lineTo(50,-22);const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:col,fog:false}));m.position.z=z;bgG.add(m);});
// 7. horizon glow behind the ridges
const hz=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:'#ff7ac8',transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));hz.position.set(0,-8.5,-27);hz.scale.set(70,12,1);bgG.add(hz);
// 8. rising paper lanterns
const lan=[];for(let i=0;i<9;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:i%2?'#ffb36b':'#ff8fa8',transparent:true,opacity:.75,blending:THREE.AdditiveBlending,depthWrite:false}));s.scale.setScalar(.55);s.position.set(rnd(-12,12),rnd(-9,9),rnd(-14,-8));bgG.add(s);lan.push({s,sp:rnd(.25,.5),ph:rnd(0,6)});}
// 9. fireflies orbiting the board
const FF=40,ffp=new Float32Array(FF*3),ffs=[];for(let i=0;i<FF;i++){ffs.push({a:rnd(0,6.28),r:rnd(4.5,8),y:rnd(-5,5),sp:rnd(.15,.5),ph:rnd(0,6)});}
const ffg=pts(ffp);const ffm=new THREE.PointsMaterial({color:'#fff0a8',size:.34,map:GLOW,transparent:true,opacity:.85,depthWrite:false,blending:THREE.AdditiveBlending});scene.add(new THREE.Points(ffg,ffm));
// 10. drifting petals / snow
const PT=70,ptp=new Float32Array(PT*3);for(let i=0;i<PT;i++){ptp[i*3]=rnd(-14,14);ptp[i*3+1]=rnd(-10,10);ptp[i*3+2]=rnd(-10,-3);}
const ptg=pts(ptp);scene.add(new THREE.Points(ptg,new THREE.PointsMaterial({color:'#ffd3ec',size:.12,transparent:true,opacity:.7,depthWrite:false})));
// 11. four-point sparkle crosses twinkling out of phase
const spT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.translate(32,32);g.fillStyle='#fff';g.beginPath();for(let k=0;k<4;k++){g.rotate(Math.PI/2);g.moveTo(0,0);g.quadraticCurveTo(3,3,0,30);g.quadraticCurveTo(-3,3,0,0);}g.fill();const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;})();
const sparks=[];for(let i=0;i<26;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:spT,color:i%3?'#ffffff':'#ffe08a',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));s.position.set(rnd(-24,24),rnd(-8,16),rnd(-34,-18));bgG.add(s);sparks.push({s,ph:rnd(0,6),sp:rnd(.8,2),sz:rnd(.7,1.6)});}
// 13. god rays from the moon
const rays=new THREE.Group();rays.position.copy(moon.position);
const rayT=gradTex([[0,'rgba(255,230,170,.55)'],[1,'rgba(255,230,170,0)']]);
for(let i=0;i<5;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(2.4+i*.4,38),new THREE.MeshBasicMaterial({map:rayT,transparent:true,opacity:.07,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));m.position.y=-19;const h=new THREE.Group();h.add(m);h.rotation.z=(i-2)*.28;rays.add(h);}
bgG.add(rays);
// 14. wireframe gems drifting far behind
const gm=[];for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.OctahedronGeometry(rnd(.5,1)),new THREE.MeshBasicMaterial({color:['#ff6fb5','#6fd8ff','#ffd66b','#8fffc4'][i%4],wireframe:true,transparent:true,opacity:.35,fog:false}));m.position.set(rnd(-18,18),rnd(-8,10),rnd(-22,-14));bgG.add(m);gm.push({m,sp:rnd(.2,.6)});}
// 15. constellation lines that fade in and out
const cpts=[[-16,8],[-13,10],[-10,8.4],[-8,10.6],[-5,9]].map(([x,y])=>new THREE.Vector3(x,y,-30));
const cl=new THREE.Line(new THREE.BufferGeometry().setFromPoints(cpts),new THREE.LineBasicMaterial({color:'#bcd2ff',transparent:true,opacity:0,fog:false}));bgG.add(cl);
// 16. glow pool under the board (pulses on combos)
const pool=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:'#8f6bff',transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));pool.position.set(0,0,-1.4);pool.scale.setScalar(15);scene.add(pool);
// 17. full-screen colour wash that follows the combo chain
const wash=new THREE.Mesh(new THREE.PlaneGeometry(160,100),new THREE.MeshBasicMaterial({color:'#7a3fc4',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));wash.position.z=-46;bgG.add(wash);
// 18. slow colour cycle on the ambient light
const hemi=scene.children.find(o=>o.isHemisphereLight);const cA=hexes('#d9c8ff'),cB=hexes('#bfe9ff'),cC=hexes('#ffd1ee'),tmp=new THREE.Color();
// 19. comets with a glowing tail
const comets=[];
function comet(){const g=new THREE.Group(),n=7;for(let i=0;i<n;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:i?'#9fd8ff':'#ffffff',transparent:true,opacity:(1-i/n)*.8,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));s.scale.setScalar(1.2*(1-i/n)+.2);s.position.set(-i*.9,i*.28,0);g.add(s);}
 g.position.set(rnd(-22,-8),rnd(6,13),-26);bgG.add(g);comets.push({g,life:0});}
// 20. moon drifts on a slow arc and turns
const _amb=ambient;
let nextComet=6,twT=0;
ambient=function(dt,t){_amb(dt,t);
 // 12 parallax
 bgG.position.x=-Math.sin(yaw)*3.2;bgG.position.y=Math.sin(pitch-.4)*-1.2;
 // 4 nebula drift
 neb.forEach((s,i)=>{s.position.x+=Math.sin(t*.05+i)*.004;s.material.opacity=.11+.04*Math.sin(t*.3+i*1.7);});
 // 5 planet spin
 planet.rotation.y+=dt*.08;
 // 8 lanterns
 lan.forEach(l=>{l.s.position.y+=dt*l.sp;l.s.position.x+=Math.sin(t*.6+l.ph)*dt*.25;if(l.s.position.y>10){l.s.position.y=-10;l.s.position.x=rnd(-12,12);}l.s.material.opacity=.55+.25*Math.sin(t*2+l.ph);});
 // 9 fireflies
 for(let i=0;i<FF;i++){const f=ffs[i];f.a+=dt*f.sp;ffp[i*3]=Math.cos(f.a)*f.r;ffp[i*3+1]=f.y+Math.sin(t*.8+f.ph)*1.2;ffp[i*3+2]=Math.sin(f.a)*f.r*.4-2;}
 ffg.attributes.position.needsUpdate=true;ffm.opacity=.6+.3*Math.sin(t*3);
 // 10 petals
 for(let i=0;i<PT;i++){ptp[i*3+1]-=dt*(.4+(i%5)*.08);ptp[i*3]+=Math.sin(t*.7+i)*dt*.3;if(ptp[i*3+1]<-10){ptp[i*3+1]=10;ptp[i*3]=rnd(-14,14);}}
 ptg.attributes.position.needsUpdate=true;
 // 11 sparkles
 sparks.forEach(p=>{const k=Math.max(0,Math.sin(t*p.sp+p.ph));p.s.material.opacity=k*k;p.s.scale.setScalar(p.sz*(.6+k));p.s.material.rotation=t*.2+p.ph;});
 // 13 rays sway
 rays.children.forEach((h,i)=>{h.rotation.z=(i-2)*.28+Math.sin(t*.15+i)*.04;h.children[0].material.opacity=.05+.03*Math.sin(t*.4+i*1.3);});
 // 14 wire gems
 gm.forEach(g=>{g.m.rotation.x+=dt*g.sp;g.m.rotation.y+=dt*g.sp*1.3;});
 // 15 constellation
 cl.material.opacity=Math.max(0,Math.sin(t*.25))*.45;
 // 16 pool pulse
 pool.material.opacity=.2+.05*Math.sin(t*1.2)+(comboT>0?.18*Math.min(1,comboT):0);pool.scale.setScalar(15+(comboT>0?1.5:0)*Math.sin(t*6));
 // 17 wash follows the chain
 const want=chain>=3?.12:chain>=2?.07:0;wash.material.opacity+=(want-wash.material.opacity)*Math.min(1,dt*3);wash.material.color.set(chain>=3?'#ff4fa3':'#4fd1ff');
 // 18 ambient colour cycle
 if(hemi){const k=(Math.sin(t*.07)+1)/2,k2=(Math.sin(t*.043+1)+1)/2;tmp.copy(cA).lerp(cB,k*.5).lerp(cC,k2*.4);hemi.color.copy(tmp);}
 // 19 comets
 nextComet-=dt;if(nextComet<=0){comet();nextComet=rnd(8,16);}
 for(const c of comets){c.life+=dt;c.g.position.x+=dt*5;c.g.position.y-=dt*1.1;c.g.children.forEach((s,i)=>{s.material.opacity=Math.max(0,(1-i/7)*.8*(1-c.life/6));});}
 for(let i=comets.length-1;i>=0;i--)if(comets[i].life>6){bgG.remove(comets[i].g);comets.splice(i,1);}
 // 20 moon arc
 moon.position.y=8+Math.sin(t*.05)*.5;moon.rotation.y+=dt*.04;moonGlow.position.copy(moon.position);rays.position.copy(moon.position);
};
})();}catch(err){console.warn('background pass 2 skipped',err);}
