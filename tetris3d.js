import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { makeCat, makeDog, selectedCat } from './char3d.js';
const $=id=>document.getElementById(id);
const COLS=10,ROWS=20,FOV=40,SCORE=[0,100,300,500,800];
const rnd=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const PIECES=[
 {e:'🐟',c:'#6fdcff',d:'#0b5fae',m:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]]},
 {e:'🍗',c:'#ffc66b',d:'#b9500a',m:[[0,1,1,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
 {e:'🥛',c:'#e6ffd6',d:'#4f8f29',m:[[0,1,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
 {e:'🦐',c:'#ff8fd6',d:'#9c1859',m:[[0,1,1,0],[1,1,0,0],[0,0,0,0],[0,0,0,0]]},
 {e:'💖',c:'#ff6f88',d:'#9e1229',m:[[1,1,0,0],[0,1,1,0],[0,0,0,0],[0,0,0,0]]},
 {e:'🧶',c:'#b8a4ff',d:'#4a2fa0',m:[[1,0,0,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]},
 {e:'🐭',c:'#e8f0f4',d:'#55707e',m:[[0,0,1,0],[1,1,1,0],[0,0,0,0],[0,0,0,0]]}];

// ---------- assets ----------
function gradTex(stops){const c=document.createElement('canvas');c.width=4;c.height=256;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,0,256);stops.forEach(([o,col])=>gr.addColorStop(o,col));g.fillStyle=gr;g.fillRect(0,0,4,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function labelCanvas(p,cv){const g=cv.getContext('2d'),s=cv.width;g.clearRect(0,0,s,s);
  const gr=g.createLinearGradient(0,0,0,s);gr.addColorStop(0,'#ffffff');gr.addColorStop(.28,p.c);gr.addColorStop(1,p.d);
  g.fillStyle=gr;g.beginPath();g.roundRect(s*.05,s*.05,s*.9,s*.9,s*.17);g.fill();
  g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=s*.04;g.beginPath();g.roundRect(s*.12,s*.12,s*.76,s*.76,s*.12);g.stroke();
  g.font=Math.round(s*.56)+'px "Apple Color Emoji","Segoe UI Emoji",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(p.e,s/2,s*.57);return cv;}
function labelTex(p){const cv=labelCanvas(p,document.createElement('canvas'));cv.width=cv.height=256;labelCanvas(p,cv);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
function rr(x,y,w,h,r){const s=new THREE.Shape();s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
const BODY_GEO=new THREE.ExtrudeGeometry(rr(-.46,-.46,.92,.92,.16),{depth:.46,bevelEnabled:true,bevelThickness:.05,bevelSize:.04,bevelSegments:3,curveSegments:8});
BODY_GEO.center();
const FACE_GEO=new THREE.PlaneGeometry(.84,.84);
const BOX_GEO=new THREE.BoxGeometry(.92,.92,.6);
const PGEO=new THREE.BoxGeometry(.14,.14,.14);
const MAT=PIECES.map(p=>({
  body:new THREE.MeshPhysicalMaterial({color:p.c,metalness:.55,roughness:.28,clearcoat:1,clearcoatRoughness:.1,emissive:p.d,emissiveIntensity:.18}),
  face:new THREE.MeshBasicMaterial({map:labelTex(p),transparent:true}),
  ghost:new THREE.MeshBasicMaterial({color:p.c,transparent:true,opacity:.2,depthWrite:false})}));
function blockMesh(t){const g=new THREE.Group();const b=new THREE.Mesh(BODY_GEO,MAT[t].body);b.castShadow=true;b.receiveShadow=true;g.add(b);const f=new THREE.Mesh(FACE_GEO,MAT[t].face);f.position.z=.29;g.add(f);return g;}
const cellX=c=>c-COLS/2+.5, cellY=r=>ROWS/2-r-.5;

// ---------- renderer / scene ----------
const R=new THREE.WebGLRenderer({canvas:$('c'),antialias:true});
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFShadowMap;
R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
const scene=new THREE.Scene();
scene.background=gradTex([[0,'#2c1878'],[.55,'#170c42'],[1,'#0a0522']]);
const cam=new THREE.PerspectiveCamera(FOV,1,.1,200);
scene.add(new THREE.HemisphereLight('#d9c8ff','#2a1b55',1.2));
const sun=new THREE.DirectionalLight('#fff0d6',2.2);
sun.position.set(-5,14,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-12,right:12,top:14,bottom:-14,near:1,far:60});sun.shadow.bias=-.0008;scene.add(sun);
const rim=new THREE.DirectionalLight('#ff8fd6',.6);rim.position.set(6,-3,-6);scene.add(rim);
// characters standing beside the well: your selected cat (left) and the spray dog (right)
const CH={cat:makeCat(selectedCat()),dog:makeDog(),hop:9,spray:0};
const CHY=ROWS/2-1.7;CH.cat.position.set(-COLS/2-1.5,CHY,0);CH.cat.rotation.y=Math.PI;scene.add(CH.cat);
CH.dog.position.set(COLS/2+1.5,CHY,0);CH.dog.rotation.y=Math.PI;scene.add(CH.dog);
// little ledges so the pair stands level with the top row
for(const sx of [-1,1]){const ld=new THREE.Mesh(new THREE.BoxGeometry(1.7,.22,1.1),new THREE.MeshStandardMaterial({color:'#4a3a8c',roughness:.6}));ld.position.set(sx*(COLS/2+1.5),CHY-.12,0);ld.receiveShadow=true;scene.add(ld);}
const SPRAY_GEO=new THREE.SphereGeometry(.07,8,6),SPRAY_MAT=new THREE.MeshBasicMaterial({color:'#9ff7ff',transparent:true,opacity:.85});
function spritz(n){for(let i=0;i<n;i++){const m=new THREE.Mesh(SPRAY_GEO,SPRAY_MAT);const b=CH.dog.userData.bottle;b.getWorldPosition(m.position);scene.add(m);parts.push({m,v:new THREE.Vector3(rnd(-4,-2.2),rnd(-.2,1.6),rnd(-.3,.3)),life:0,max:rnd(.45,.7)});}}

// well: floor, grid, glass sides
const floor=new THREE.Mesh(new THREE.PlaneGeometry(COLS+.4,ROWS+.4),new THREE.MeshStandardMaterial({color:'#1b1040',roughness:.9}));
floor.position.z=-.55;floor.receiveShadow=true;scene.add(floor);
{const gp=[];for(let x=0;x<=COLS;x++)gp.push(x-COLS/2,-ROWS/2,-.54,x-COLS/2,ROWS/2,-.54);
 for(let y=0;y<=ROWS;y++)gp.push(-COLS/2,y-ROWS/2,-.54,COLS/2,y-ROWS/2,-.54);
 const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(gp,3));
 scene.add(new THREE.LineSegments(gg,new THREE.LineBasicMaterial({color:'#9a7cff',transparent:true,opacity:.22})));}
const glass=new THREE.MeshPhysicalMaterial({color:'#b9a6ff',transparent:true,opacity:.14,roughness:.05,depthWrite:false,side:THREE.DoubleSide});
for(const s of [-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(.05,ROWS+.2,1.2),glass);w.position.set(s*(COLS/2+.03),0,0);scene.add(w);}

// ---------- camera / layout ----------
let W=0,H=0,dist=30,unitPx=40,yaw=0,pitch=.42,orb=null,shake=0;
function layout(){
  const D=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;
  R.setPixelRatio(D);R.setSize(W,H,false);cam.aspect=W/H;cam.updateProjectionMatrix();
  const t=Math.tan(THREE.MathUtils.degToRad(FOV/2));
  dist=Math.max(12.5/t,7.4/(t*cam.aspect));
  unitPx=H/(2*dist*t);
}
addEventListener('resize',layout);

// ---------- game state ----------
let stack=[],cur=null,queue=[],bag=[],hold=null,canHold=true,state='play',score=0,lines=0,level=1,best=0,fallT=0,lockT=0,clr=null,stackDirty=true;
let parts=[];
try{best=+localStorage.getItem('ct3-best')||0;}catch(e){}
const newStack=()=>Array.from({length:ROWS},()=>Array(COLS).fill(-1));
function refill(){if(!bag.length)bag=[0,1,2,3,4,5,6].sort(()=>Math.random()-.5);return bag.pop();}
function nextType(){while(queue.length<4)queue.push(refill());return queue.shift();}
function rotCW(m){const o=[];for(let r=0;r<4;r++){o.push([]);for(let c=0;c<4;c++)o[r].push(m[3-c][r]);}return o;}
function valid(m,x,y){for(let r=0;r<4;r++)for(let c=0;c<4;c++){if(!m[r][c])continue;const X=x+c,Y=y+r;if(X<0||X>=COLS||Y>=ROWS)return false;if(Y>=0&&stack[Y][X]>=0)return false;}return true;}
const grounded=()=>!!cur&&!valid(cur.m,cur.x,cur.y+1);
function say(t,col){const b=$('banner');b.textContent=t;b.style.color=col;b.classList.remove('show');void b.offsetWidth;b.classList.add('show');}
function updateBest(){if(score>best){best=score;try{localStorage.setItem('ct3-best',best);}catch(e){}}}
function gameOver(){if(state==='over')return;state='over';cur=null;updateBest();$('fin').textContent='SCORE '+score+' · LINES '+lines;$('over').hidden=false;}
function spawn(t){
  cur={t,m:PIECES[t].m.map(r=>r.slice()),x:3,y:-1};fallT=0;lockT=0;
  if(!valid(cur.m,cur.x,cur.y))gameOver();
}
function spawnNext(){spawn(nextType());}
function move(dx,dy){
  if(!cur||state!=='play')return false;
  if(valid(cur.m,cur.x+dx,cur.y+dy)){cur.x+=dx;cur.y+=dy;if(dx&&grounded())lockT=0;return true;}
  return false;
}
function rotate(){
  if(!cur||state!=='play')return;
  const m=rotCW(cur.m);
  for(const k of [0,-1,1,-2,2])if(valid(m,cur.x+k,cur.y)){cur.m=m;cur.x+=k;if(grounded())lockT=0;return;}
}
function hardDrop(){if(!cur||state!=='play')return;while(move(0,1))score+=2;lock();}
function holdPiece(){
  if(!cur||!canHold||state!=='play')return;
  const t=cur.t;
  if(hold===null){hold=t;cur=null;spawnNext();}else{const h=hold;hold=t;spawn(h);}
  canHold=false;
}
function burst(rows){
  for(const r of rows)for(let c=0;c<COLS;c++){const t=stack[r][c];if(t<0)continue;
    for(let i=0;i<4;i++){const m=new THREE.Mesh(PGEO,MAT[t].body);m.position.set(cellX(c),cellY(r),.3);scene.add(m);
      parts.push({m,v:new THREE.Vector3(rnd(-2.2,2.2),rnd(0,3.2),rnd(1,3)),life:0,max:rnd(.6,1)});}}
}
function lock(){
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
    if(!cur.m[r][c])continue;
    const X=cur.x+c,Y=cur.y+r;
    if(Y<0){gameOver();return;}
    stack[Y][X]=cur.t;
  }
  stackDirty=true;canHold=true;
  const full=[];for(let r=0;r<ROWS;r++)if(stack[r].every(v=>v>=0))full.push(r);
  cur=null;
  if(full.length){
    const n=full.length;
    score+=SCORE[n]*level;lines+=n;level=Math.floor(lines/10)+1;
    burst(full);shake=n>=3?.5:.25;CH.spray=n>=3?1.6:.9;CH.hop=0;
    say(['','SINGLE','DOUBLE','TRIPLE','KITTY-TRIS!'][n],n===4?'#ffd84a':'#9ff7ff');
    state='clear';clr={rows:full,t:0};
  }else{spawnNext();CH.hop=0;}
  updateBest();
}
function restart(){
  stack=newStack();cur=null;queue=[];bag=[];hold=null;canHold=true;
  score=0;lines=0;level=1;clr=null;state='play';stackDirty=true;
  $('over').hidden=true;spawnNext();
}
function update(dt){
  if(state==='over')return;
  if(state==='clear'){
    clr.t+=dt;
    if(clr.t>=.25){
      stack=stack.filter((_,i)=>!clr.rows.includes(i));
      while(stack.length<ROWS)stack.unshift(Array(COLS).fill(-1));
      stackDirty=true;clr=null;state='play';spawnNext();
    }
    return;
  }
  if(!cur){spawnNext();return;}
  const di=Math.max(.06,.8-(level-1)*.07);
  fallT+=dt;
  while(fallT>=di){fallT-=di;if(!move(0,1))break;}
  if(grounded()){lockT+=dt;if(lockT>=.5)lock();}else lockT=0;
}
function updateParts(dt){
  const keep=[];
  for(const p of parts){
    p.life+=dt;
    if(p.life>=p.max){scene.remove(p.m);continue;}
    p.v.y-=9*dt;p.m.position.addScaledVector(p.v,dt);p.m.rotation.x+=dt*5;p.m.rotation.y+=dt*3;
    keep.push(p);
  }
  parts=keep;
}

// ---------- rendering of the stack, active piece, ghost ----------
const stackG=new THREE.Group();scene.add(stackG);
const actG=new THREE.Group();scene.add(actG);
function rebuildStack(){
  stackG.clear();
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const t=stack[r][c];if(t<0)continue;
    const m=blockMesh(t);m.position.set(cellX(c),cellY(r),0);stackG.add(m);}
}
function rebuildActive(){
  actG.clear();
  if(!cur||state!=='play')return;
  let gy=cur.y;while(valid(cur.m,cur.x,gy+1))gy++;
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){
    if(!cur.m[r][c])continue;
    if(gy!==cur.y){const gm=new THREE.Mesh(BOX_GEO,MAT[cur.t].ghost);gm.position.set(cellX(cur.x+c),cellY(gy+r),0);actG.add(gm);}
    const m=blockMesh(cur.t);m.position.set(cellX(cur.x+c),cellY(cur.y+r),0);actG.add(m);
  }
}

// ---------- mini previews (next / hold) ----------
function drawMini(cv,t){
  const g=cv.getContext('2d'),W2=cv.width,H2=cv.height;g.clearRect(0,0,W2,H2);
  if(t==null)return;
  const m=PIECES[t].m;let x0=9,y0=9,x1=0,y1=0;
  for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(m[r][c]){x0=Math.min(x0,c);x1=Math.max(x1,c);y0=Math.min(y0,r);y1=Math.max(y1,r);}
  const bw=x1-x0+1,bh=y1-y0+1,s=Math.min((W2-12)/bw,(H2-12)/bh);
  const ox=(W2-bw*s)/2,oy=(H2-bh*s)/2;
  for(let r=y0;r<=y1;r++)for(let c=x0;c<=x1;c++){if(!m[r][c])continue;
    const x=ox+(c-x0)*s+2,y=oy+(r-y0)*s+2,w=s-4;
    g.fillStyle=PIECES[t].c;g.beginPath();g.roundRect(x,y,w,w,w*.2);g.fill();
    g.font=Math.round(w*.6)+'px "Apple Color Emoji","Segoe UI Emoji",system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(PIECES[t].e,x+w/2,y+w/2+1);}
}

// ---------- input ----------
const ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,0,1),0),hit=new THREE.Vector3(),ndc=new THREE.Vector2();
function cellAt(x,y){
  ndc.set(x/W*2-1,-(y/H)*2+1);ray.setFromCamera(ndc,cam);
  if(!ray.ray.intersectPlane(plane,hit))return null;
  const c=Math.floor(hit.x+COLS/2),r=Math.floor(ROWS/2-hit.y);
  return(c>=0&&c<COLS&&r>=0&&r<ROWS)?{c,r}:null;
}
let gest=null;
addEventListener('pointerdown',e=>{
  if(state==='over')return;
  const p=cellAt(e.clientX,e.clientY);
  if(e.button===2||e.shiftKey||!p){orb={x:e.clientX,y:e.clientY,yaw0:yaw,pitch0:pitch};return;}
  gest={sx:e.clientX,sy:e.clientY,lx:e.clientX,ly:e.clientY,t0:performance.now(),moved:false};
});
addEventListener('pointermove',e=>{
  if(orb){yaw=clamp(orb.yaw0-(e.clientX-orb.x)*.005,-1.2,1.2);pitch=clamp(orb.pitch0+(e.clientY-orb.y)*.004,.1,1.35);return;}
  if(!gest||state!=='play')return;
  if(Math.hypot(e.clientX-gest.sx,e.clientY-gest.sy)>8)gest.moved=true;
  const step=Math.max(14,unitPx*.9);
  while(e.clientX-gest.lx>=step){move(1,0);gest.lx+=step;}
  while(gest.lx-e.clientX>=step){move(-1,0);gest.lx-=step;}
  while(e.clientY-gest.ly>=step){if(move(0,1))score+=1;gest.ly+=step;}
  while(gest.ly-e.clientY>=step*2){gest.ly-=step*2;}
});
addEventListener('pointerup',e=>{
  if(orb){orb=null;return;}
  if(!gest)return;const g=gest;gest=null;
  const dx=e.clientX-g.sx,dy=e.clientY-g.sy,dt=performance.now()-g.t0;
  if(!g.moved&&dt<350){rotate();return;}
  if(dy<-60&&-dy>Math.abs(dx)){holdPiece();return;}
  if(dy>60&&dy>Math.abs(dx)*1.5&&dt<260)hardDrop();
});
addEventListener('pointercancel',()=>{orb=null;gest=null;});
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{
  if(state==='over'){if(e.code==='Space'||e.code==='Enter'){e.preventDefault();restart();}return;}
  if(state!=='play')return;
  const k=e.code;
  if(k==='ArrowLeft'){e.preventDefault();move(-1,0);}
  else if(k==='ArrowRight'){e.preventDefault();move(1,0);}
  else if(k==='ArrowUp'||k==='KeyX'){e.preventDefault();rotate();}
  else if(k==='ArrowDown'){e.preventDefault();if(move(0,1))score+=1;}
  else if(k==='Space'){e.preventDefault();hardDrop();}
  else if(k==='KeyC'||k==='ShiftLeft'||k==='ShiftRight'){holdPiece();}
});
$('over').addEventListener('click',restart);

// ---------- loop ----------
let last=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  update(dt);updateParts(dt);
  if(stackDirty){rebuildStack();stackDirty=false;}
  rebuildActive();
  if(shake>0)shake=Math.max(0,shake-dt*2);
  const sh=shake*.25,cp=Math.cos(pitch),rad=dist;
  cam.position.set(Math.sin(yaw)*rad*cp+(Math.random()-.5)*sh,Math.sin(pitch)*rad+(Math.random()-.5)*sh,Math.cos(yaw)*rad*cp);
  cam.lookAt(0,0,0);
  $('sc').textContent='🐾 '+score;$('ln').textContent='LINES '+lines;$('lv').textContent='LV '+level;$('bs').textContent='BEST '+best;
  drawMini($('nx'),queue[0]);drawMini($('hd'),hold);
  CH.hop+=dt;const hk=CH.hop/.5;CH.cat.position.y=CHY+(hk<1?Math.sin(hk*Math.PI)*.7:0);CH.cat.userData.tail.rotation.y=Math.sin(now*.006)*.5;
  CH.spray=Math.max(0,CH.spray-dt);
  CH.dog.userData.bottle.rotation.z=CH.spray>0?-.9+Math.sin(now*.03)*.12:0;
  if(CH.spray>0&&Math.random()<.85)spritz(2);
  R.render(scene,cam);
  requestAnimationFrame(frame);
}
layout();
restart();
requestAnimationFrame(frame);

/* ===== polish pass: visuals + feel (rules untouched) ===== */
scene.fog=new THREE.Fog('#0b0820',24,46);
// starfield
{const sp=new Float32Array(260*3);for(let i=0;i<260;i++){sp[i*3]=rnd(-30,30);sp[i*3+1]=rnd(-14,20);sp[i*3+2]=rnd(-30,-12);}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
 scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:'#ffffff',size:.18,transparent:true,opacity:.7,depthWrite:false})));}
// well rim glow (shifts toward red as the stack rises)
const rimM=new THREE.LineBasicMaterial({color:'#9a7cff',transparent:true,opacity:.6});
{const corners=[[-COLS/2,-ROWS/2],[COLS/2,-ROWS/2],[COLS/2,ROWS/2],[-COLS/2,ROWS/2],[-COLS/2,-ROWS/2]];
 const p3=[];for(let i=0;i<4;i++)p3.push(corners[i][0],corners[i][1],-.5,corners[i+1][0],corners[i+1][1],-.5);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p3,3));scene.add(new THREE.LineSegments(g,rimM));}
// landing dust puffs
const dustGeo=new THREE.SphereGeometry(.09,8,6);
function dust(x,y,n,col){for(let i=0;i<n;i++){const m=new THREE.Mesh(dustGeo,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.6,depthWrite:false}));m.position.set(x+rnd(-.4,.4),y,.2);scene.add(m);parts.push({m,v:new THREE.Vector3(rnd(-1,1),rnd(.3,1.2),rnd(-.2,.2)),life:0,max:rnd(.35,.6)});}}
// stack height -> danger 0..1 (top 6 rows)
function danger(){for(let r=0;r<ROWS;r++)if(stack[r].some(v=>v>=0))return clamp(1-r/6,0,1);return 0;}
// lock: dust at the piece, level-up banner, clear flourish
let lvlSeen=1;
const _lock=lock;
lock=function(){
  const x=cur?cur.x:0,y=cur?cur.y:0,m=cur?cur.m:null;
  _lock();
  if(m){let sx=0,sy=0,n=0;for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(m[r][c]){sx+=x+c;sy+=y+r;n++;}
    if(n)dust(cellX(Math.round(sx/n)),cellY(Math.round(sy/n))-.4,6,'#d9c8ff');}
  if(state==='play'&&level>lvlSeen){lvlSeen=level;say('LEVEL '+level+' 🐾','#c5b6ff');}
  if(state==='clear')for(let i=0;i<3;i++)dust(rnd(-2,2),rnd(-3,3),4,'#ffd66b');
};
// hard drop: extra shake and dust for big drops
const _hard=hardDrop;
hardDrop=function(){const b=score;_hard();if(score-b>=10){shake=Math.max(shake,.4);dust(0,-ROWS/2+1,6,'#9ff7ff');}};
// vignette + score punch elements
const vg=document.createElement('div');vg.id='vig';document.body.prepend(vg);
const scEl=$('sc');let scSeen=0;
// extras loop, separate from the game loop
let exT=0;
function extras(now){
  const t=now/1000;exT=t;
  const d=danger();
  rimM.color.setRGB(.6+.4*d,.49-.3*d,1-.7*d);
  rimM.opacity=.5+.2*Math.sin(t*2)*(d>0?1:.3)+d*.3;
  // sway the view a touch
  if(!orb&&!gest)yaw+=(Math.sin(t*.25)*.12-yaw)*.02;
  // characters: gentle idle bob
  if(state!=='over'){CH.cat.rotation.z=Math.sin(t*1.8)*.03;CH.dog.rotation.z=Math.sin(t*1.5+1)*.03;}
  // score punch
  if(score!==scSeen){scSeen=score;scEl.classList.remove('punch');void scEl.offsetWidth;scEl.classList.add('punch');}
  requestAnimationFrame(extras);
}
requestAnimationFrame(extras);

/* ===== levels, difficulty, overworld map + world scenery ===== */
const TW=[
 {n:'Starry Attic',    sky:['#2c1878','#170c42','#0a0522'],fog:'#0b0820',g:'#4a3a8c',deco:'⭐🌙🪐',k:['blocks','moon','lanterns','stars']},
 {n:'Fishy Harbor',    sky:['#3aa0d8','#1a5a9a','#0a2a50'],fog:'#0d2a4a',g:'#2a6a9a',deco:'🐟⚓🚤',k:['blocks','fish','bubbles','buoys']},
 {n:'Yarn Forest',     sky:['#5ac28a','#2a7a4a','#0e3a24'],fog:'#103a26',g:'#3a8a4a',deco:'🌲🧶🍄',k:['blocks','trees','yarn','fireflies']},
 {n:'Snowy Rooftops',  sky:['#9ad4ff','#5a8ac8','#22305a'],fog:'#2a3a6a',g:'#cfe6ff',deco:'❄⛄🏠',k:['blocks','houses','snow','moon']},
 {n:'Candy Clouds',    sky:['#ffb6e0','#d880c8','#5a2a7a'],fog:'#5a2a6a',g:'#ff8fc8',deco:'🍭🍬☁',k:['blocks','lollies','balloons','clouds']},
 {n:'Sunset Dunes',    sky:['#ffb04a','#d0603a','#3a1a3a'],fog:'#4a2030',g:'#e0a050',deco:'🌵🐪🏜',k:['blocks','cacti','pyramids','dust']},
 {n:'Coral Reef',      sky:['#3ad0d0','#1a7a9a','#062a40'],fog:'#08304a',g:'#e0c890',deco:'🐠🐚🪸',k:['blocks','coral','fish','bubbles']},
 {n:'Neon City',       sky:['#ff3ab0','#3a1a8a','#08051a'],fog:'#100828',g:'#3a2a6a',deco:'🌃🎵🚦',k:['blocks','towers','lanterns','stars']},
 {n:'Haunted Pantry',  sky:['#6a3a8a','#2a1844','#0a0614'],fog:'#140a22',g:'#4a2d63',deco:'👻🕯🦇',k:['blocks','ghosts','candles','bats']},
 {n:'Cosmic Catnip',   sky:['#4a1aa0','#120a40','#000008'],fog:'#05031a',g:'#46e0ff',deco:'🪐🛰🌌',k:['blocks','planets','crystals','stars']}];
const TSN=['Warm-up','Stack Up','Dig Out','Speed Run','Boss Stack'];
const TLV=50,DIFF=[{n:'Easy',sp:1.4,lk:.8,gb:-1},{n:'Normal',sp:1,lk:.5,gb:0},{n:'Hard',sp:.7,lk:.35,gb:2}];
let DF=1;try{const v=localStorage.getItem('ct3-diff');if(v!==null&&+v>=0&&+v<=2)DF=+v;}catch(e){}
const TP=(()=>{try{return JSON.parse(localStorage.getItem('ct3-prog')||'null')||{at:0,st:{}};}catch(e){return{at:0,st:{}};}})();TP.st=TP.st||{};
const saveTP=()=>{try{localStorage.setItem('ct3-prog',JSON.stringify(TP));}catch(e){}};
const QS=new URLSearchParams(location.search);
let LID=parseInt(QS.get('L'));const ENDLESS=QS.get('endless')==='1';
if(!(LID>=0&&LID<TLV))LID=Math.min(TLV-1,TP.at||0);
const tName=i=>TW[Math.floor(i/5)].n+' '+(i%5+1)+' · '+TSN[i%5];
// level recipe: goal lines, starting speed tier, garbage rows
function recipe(i){const w=Math.floor(i/5),s=i%5;
  return{goal:8+s*2+Math.floor(w/2)*2+(s===4?4:0),spd:1+w+(s===3?3:Math.floor(s/2)),garb:Math.max(0,Math.min(9,(s===2?4:s===4?3:s>=1?1:0)+Math.floor(w/2)+DIFF[DF].gb))};}
let RC=recipe(LID);
let lvT=0,paused=false,won=false;
const tierNow=()=>ENDLESS?level:RC.spd+Math.floor(lines/10);
function addGarbage(n){for(let k=0;k<n;k++){const hole=Math.floor(Math.random()*COLS);stack.shift();stack.push(Array.from({length:COLS},(_,c)=>c===hole?-1:Math.floor(Math.random()*7)));}stackDirty=true;}
const _restart=restart;
restart=function(){RC=recipe(LID);_restart();lvT=0;won=false;lvlSeen=1;CQres();if(!ENDLESS){addGarbage(RC.garb);say((LID+1)+'. '+TSN[LID%5],'#ffd84a');}};
function CQres(){const r=document.getElementById('cqres');if(r)r.remove();}
update=function(dt){
  if(paused||state==='pause'||(window.CQMap&&CQMap.isOpen()))return;
  if(state==='over'||won)return;
  if(state==='clear'){clr.t+=dt;if(clr.t>=.25){stack=stack.filter((_,i)=>!clr.rows.includes(i));while(stack.length<ROWS)stack.unshift(Array(COLS).fill(-1));stackDirty=true;clr=null;state='play';
      if(!ENDLESS&&lines>=RC.goal){levelWin();return;}spawnNext();}return;}
  if(!cur){spawnNext();return;}
  lvT+=dt;
  const di=Math.max(.05,(.8-(tierNow()-1)*.07))*DIFF[DF].sp;
  fallT+=dt;while(fallT>=di){fallT-=di;if(!move(0,1))break;}
  if(grounded()){lockT+=dt;if(lockT>=DIFF[DF].lk)lock();}else lockT=0;
};
function levelWin(){
  won=true;state='over';cur=null;updateBest();
  const par=RC.goal*7*(DF===2?.85:1),st=lvT<=par?3:lvT<=par*1.6?2:1;
  TP.st[LID]=Math.max(TP.st[LID]||0,st);TP.at=Math.max(TP.at,LID+1);saveTP();
  say('LEVEL CLEAR!','#ffd84a');CH.hop=0;CH.spray=0;shake=.3;
  for(let i=0;i<8;i++)dust(rnd(-4,4),rnd(-8,8),5,['#ffd84a','#9ff7ff','#ff8fd6'][i%3]);
  setTimeout(()=>CQMap.result({title:'Level clear! 🐾',sub:tName(LID)+'\n🐾 '+score+' · '+lines+' lines · '+Math.round(lvT)+'s · '+DIFF[DF].n,stars:st,
    next:LID<TLV-1?()=>goL(LID+1):null,retry:()=>goL(LID),map:openMap}),900);
}
const goL=i=>{location.href='tetris3d.html?L='+i;};
gameOver=function(){if(state==='over')return;state='over';cur=null;updateBest();
  if(ENDLESS){$('fin').textContent='SCORE '+score+' · LINES '+lines+' · '+DIFF[DF].n;$('over').hidden=false;return;}
  setTimeout(()=>CQMap.result({title:'Stacked out! 🙀',sub:tName(LID)+'\n'+lines+' / '+RC.goal+' lines',retry:()=>goL(LID),map:openMap}),500);};
// HUD: goal pill
const goalEl=document.createElement('span');goalEl.className='pill';goalEl.id='gl';$('hud').appendChild(goalEl);
(function hud(){goalEl.textContent=ENDLESS?'∞ '+DIFF[DF].n:'🎯 '+Math.min(lines,RC.goal)+'/'+RC.goal;if(!ENDLESS)$('lv').textContent=(LID+1)+'. '+TW[Math.floor(LID/5)].n;requestAnimationFrame(hud);})();
// map
function mapCfg(){return{title:'🧶 Kitty Tetris 3D',
  worlds:TW.map(t=>({n:t.n,c1:t.sky[0],c2:t.sky[1],g:t.g,deco:t.deco})),
  levels:w=>[0,1,2,3,4].map(k=>w*5+k),name:tName,isOpen:i=>i<=TP.at,stars:i=>TP.st[i]||0,cur:LID,
  go:i=>{if(i===LID&&!ENDLESS&&state==='pause'){restart();return;}goL(i);},
  diff:{label:'Difficulty',opts:DIFF.map(d=>d.n),get:()=>DF,set:n=>{DF=n;try{localStorage.setItem('ct3-diff',n);}catch(e){}}},
  extra:[{label:'∞ Endless',fn:()=>{location.href='tetris3d.html?endless=1';}}],
  onOpen:()=>{paused=true;},onClose:()=>{paused=false;if(state==='pause')restart();}};}
function openMap(){CQres();CQMap.open(mapCfg());}
CQMap.button(openMap);
addEventListener('keydown',e=>{if(e.code==='KeyM'&&!CQMap.isOpen()){e.preventDefault();openMap();}},true);
if(!QS.has('L')&&!QS.has('endless')){state='pause';setTimeout(openMap,60);}else restart();

/* ---- world scenery: objects + animations around the board ---- */
const WI=ENDLESS?Math.floor(Math.random()*10):Math.floor(LID/5),TH=TW[WI];
scene.background=gradTex([[0,TH.sky[0]],[.55,TH.sky[1]],[1,TH.sky[2]]]);scene.fog=new THREE.Fog(TH.fog,26,60);
const SC=[];const SG=new THREE.Group();scene.add(SG);
const mat=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6},o));
const glow=(c,op=.9)=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:op,depthWrite:false});
const add=(m,fn)=>{SG.add(m);if(fn)SC.push({m,fn,p:Math.random()*6.28,b:m.position.clone()});return m;};
const sideX=()=>(Math.random()<.5?-1:1)*rnd(8.5,17);
// ground platform the well stands on
{const pl=new THREE.Mesh(new THREE.BoxGeometry(COLS+16,.6,7),mat(TH.g,{roughness:.85}));pl.position.set(0,-ROWS/2-.9,-1);pl.receiveShadow=true;SG.add(pl);
 const lip=new THREE.Mesh(new THREE.BoxGeometry(COLS+16.4,.12,7.4),glow(TH.sky[0],.5));lip.position.set(0,-ROWS/2-.56,-1);SG.add(lip);}
// side pillars with pulsing light bands
for(const s of [-1,1]){const p=new THREE.Mesh(new THREE.BoxGeometry(.8,ROWS+2,.8),mat(TH.g));p.position.set(s*(COLS/2+3.4),0,-1.6);p.castShadow=true;SG.add(p);
  for(let k=0;k<6;k++){const b=new THREE.Mesh(new THREE.BoxGeometry(.86,.18,.86),glow(TH.sky[0]));b.position.set(s*(COLS/2+3.4),-ROWS/2+2+k*3.3,-1.6);add(b,(m,t,o)=>{m.material.opacity=.35+.6*Math.max(0,Math.sin(t*3-k*.7+(s>0?1:0)));});}}
const KIND={
 blocks(){for(let i=0;i<14;i++){const t=i%7,g=new THREE.Group(),pm=PIECES[t].m;for(let r=0;r<4;r++)for(let c=0;c<4;c++)if(pm[r][c]){const b=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.5),mat(PIECES[t].c,{emissive:PIECES[t].c,emissiveIntensity:.25}));b.position.set(c*.52,-r*.52,0);g.add(b);}
   g.position.set(sideX(),rnd(-12,14),rnd(-14,-4));g.scale.setScalar(rnd(.6,1.2));add(g,(m,t,o)=>{m.position.y+=.012;if(m.position.y>16)m.position.y=-14;m.rotation.x=t*.3+o.p;m.rotation.y=t*.5+o.p;});}},
 moon(){const m=new THREE.Mesh(new THREE.SphereGeometry(3,24,16),glow('#fff4c8',.95));m.position.set(-14,12,-26);add(m,(m,t)=>{m.scale.setScalar(1+Math.sin(t*.8)*.03);});
   const h=new THREE.Mesh(new THREE.SphereGeometry(4.2,24,16),glow('#fff4c8',.15));h.position.copy(m.position);SG.add(h);},
 stars(){for(let i=0;i<10;i++){const s=new THREE.Mesh(new THREE.OctahedronGeometry(.25),glow('#ffffff'));s.position.set(rnd(-22,22),rnd(4,18),rnd(-24,-12));add(s,(m,t,o)=>{const k=.5+.5*Math.sin(t*3+o.p);m.scale.setScalar(.4+k);m.rotation.y=t;});}},
 lanterns(){for(let i=0;i<8;i++){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(.6,.8,.6),glow(['#ffb84a','#ff6fa8','#6fe0ff'][i%3],.85));g.add(b);const c=new THREE.Mesh(new THREE.BoxGeometry(.7,.1,.7),mat('#3a2a1a'));c.position.y=.45;g.add(c);
   g.position.set(sideX(),rnd(-6,12),rnd(-8,-2));add(g,(m,t,o)=>{m.position.y=o.b.y+Math.sin(t*.9+o.p)*.4;m.rotation.z=Math.sin(t*1.3+o.p)*.15;});}},
 fish(){for(let i=0;i<9;i++){const g=new THREE.Group();const c=['#ff8a3a','#ffd84a','#6fdcff','#ff6fa8'][i%4];const b=new THREE.Mesh(new THREE.SphereGeometry(.35,12,8),mat(c));b.scale.set(1.6,1,.6);g.add(b);const tl=new THREE.Mesh(new THREE.ConeGeometry(.3,.5,4),mat(c));tl.rotation.z=Math.PI/2;tl.position.x=-.7;g.add(tl);
   const dir=i%2?1:-1;g.scale.x=dir;g.position.set(rnd(-20,20),rnd(-9,12),rnd(-10,-3));add(g,(m,t,o)=>{m.position.x+=.03*dir;if(m.position.x>22)m.position.x=-22;if(m.position.x<-22)m.position.x=22;m.position.y=o.b.y+Math.sin(t*2+o.p)*.3;m.children[1].rotation.y=Math.sin(t*12+o.p)*.5;});}},
 bubbles(){for(let i=0;i<24;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(rnd(.08,.22),8,6),glow('#d8f8ff',.5));b.position.set(sideX(),rnd(-12,14),rnd(-8,-1));add(b,(m,t,o)=>{m.position.y+=.025;m.position.x=o.b.x+Math.sin(t*2+o.p)*.2;if(m.position.y>14)m.position.y=-12;});}},
 buoys(){for(let i=0;i<4;i++){const g=new THREE.Group();const a=new THREE.Mesh(new THREE.CylinderGeometry(.5,.6,1,12),mat(i%2?'#ff4a4a':'#ffffff'));g.add(a);const l=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),glow('#ffe27a'));l.position.y=.7;g.add(l);
   g.position.set((i<2?-1:1)*rnd(9,15),-ROWS/2-.2,rnd(-6,-2));add(g,(m,t,o)=>{m.position.y=o.b.y+Math.sin(t*1.5+o.p)*.15;m.rotation.z=Math.sin(t*1.2+o.p)*.12;m.children[1].material.opacity=.4+.6*(Math.sin(t*4+o.p)>0);});}},
 trees(){for(let i=0;i<10;i++){const g=new THREE.Group();const tr=new THREE.Mesh(new THREE.CylinderGeometry(.18,.25,1.2,6),mat('#6a4a2a'));tr.position.y=.6;g.add(tr);for(let k=0;k<3;k++){const c=new THREE.Mesh(new THREE.ConeGeometry(1-k*.25,1.3,7),mat(['#2f8a3c','#3fa04a','#57b85a'][k]));c.position.y=1.5+k*.7;g.add(c);}
   const s=rnd(1,1.8);g.scale.setScalar(s);g.position.set(sideX(),-ROWS/2-.6,rnd(-9,-2));add(g,(m,t,o)=>{m.rotation.z=Math.sin(t*1.1+o.p)*.04;});}},
 yarn(){for(let i=0;i<6;i++){const b=new THREE.Mesh(new THREE.TorusKnotGeometry(.4,.14,48,8),mat(['#ff6fa8','#6fdcff','#ffd84a'][i%3]));b.position.set(sideX(),-ROWS/2+.1,rnd(-5,-1));add(b,(m,t,o)=>{m.position.x=o.b.x+Math.sin(t*.6+o.p)*1.5;m.rotation.z=-Math.cos(t*.6+o.p)*2;});}},
 fireflies(){for(let i=0;i<26;i++){const f=new THREE.Mesh(new THREE.SphereGeometry(.07,6,4),glow('#e8ff7a'));f.position.set(sideX(),rnd(-9,6),rnd(-8,-1));add(f,(m,t,o)=>{m.position.x=o.b.x+Math.sin(t*.7+o.p)*.8;m.position.y=o.b.y+Math.cos(t*.9+o.p)*.6;m.material.opacity=.3+.7*Math.max(0,Math.sin(t*2.5+o.p));});}},
 houses(){for(let i=0;i<7;i++){const g=new THREE.Group();const w=rnd(1.6,2.6),h=rnd(1.6,3.2);const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,1.6),mat(['#8a5a4a','#6a7a9a','#9a6a5a'][i%3]));b.position.y=h/2;g.add(b);const r=new THREE.Mesh(new THREE.ConeGeometry(w*.8,1,4),mat('#f4f9ff'));r.rotation.y=Math.PI/4;r.position.y=h+.5;g.add(r);
   const wi=new THREE.Mesh(new THREE.BoxGeometry(.4,.4,.05),glow('#ffd27a'));wi.position.set(0,h*.55,.81);g.add(wi);g.position.set(sideX(),-ROWS/2-.6,rnd(-10,-3));add(g,(m,t,o)=>{m.children[2].material.opacity=.6+.4*Math.sin(t*1.7+o.p);});}},
 snow(){for(let i=0;i<60;i++){const f=new THREE.Mesh(new THREE.OctahedronGeometry(.09),glow('#ffffff',.85));f.position.set(rnd(-22,22),rnd(-12,16),rnd(-14,4));add(f,(m,t,o)=>{m.position.y-=.03;m.position.x=o.b.x+Math.sin(t+o.p)*.5;if(m.position.y<-12)m.position.y=16;});}},
 lollies(){for(let i=0;i<8;i++){const g=new THREE.Group();const st=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,3,6),mat('#ffffff'));st.position.y=1.5;g.add(st);const c=new THREE.Mesh(new THREE.CylinderGeometry(.9,.9,.25,20),mat(['#ff4f9a','#6fdcff','#ffd84a','#9a6aff'][i%4]));c.rotation.x=Math.PI/2;c.position.y=3.2;g.add(c);
   g.position.set(sideX(),-ROWS/2-.6,rnd(-9,-2));g.scale.setScalar(rnd(.9,1.6));add(g,(m,t,o)=>{m.children[1].rotation.y=t*1.5+o.p;});}},
 balloons(){for(let i=0;i<10;i++){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.SphereGeometry(.55,14,10),mat(['#ff4f9a','#6fdcff','#ffd84a','#8aff8a'][i%4],{roughness:.3}));b.scale.y=1.2;g.add(b);const s=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,1.4,3),mat('#ffffff'));s.position.y=-1.3;g.add(s);
   g.position.set(sideX(),rnd(-14,14),rnd(-10,-2));add(g,(m,t,o)=>{m.position.y+=.02;m.position.x=o.b.x+Math.sin(t*.8+o.p)*.5;if(m.position.y>16)m.position.y=-14;});}},
 clouds(){for(let i=0;i<7;i++){const g=new THREE.Group();for(let k=0;k<4;k++){const p=new THREE.Mesh(new THREE.SphereGeometry(rnd(.8,1.3),12,8),mat('#ffffff',{roughness:1}));p.position.set(k*1-1.5,Math.sin(k)*.3,0);g.add(p);}
   g.position.set(rnd(-24,24),rnd(4,16),rnd(-22,-12));add(g,(m,t,o)=>{m.position.x+=.01;if(m.position.x>26)m.position.x=-26;});}},
 cacti(){for(let i=0;i<9;i++){const g=new THREE.Group();const c=mat('#3f9a4a');const b=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,2.4,8),c);b.position.y=1.2;g.add(b);for(const s of [-1,1]){const a=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,1,8),c);a.position.set(s*.45,1.4+s*.2,0);g.add(a);const a2=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.4,8),c);a2.rotation.z=Math.PI/2;a2.position.set(s*.3,1+s*.2,0);g.add(a2);}
   g.position.set(sideX(),-ROWS/2-.6,rnd(-9,-2));g.scale.setScalar(rnd(.8,1.4));add(g,(m,t,o)=>{m.scale.y=o.b?(1+Math.sin(t*2+o.p)*.03)*m.scale.x:1;});}},
 pyramids(){for(let i=0;i<3;i++){const p=new THREE.Mesh(new THREE.ConeGeometry(5,5,4),mat('#d8a860',{flatShading:true}));p.rotation.y=Math.PI/4;p.position.set((i-1)*14,-ROWS/2+1.9,-22);SG.add(p);}
   const sun=new THREE.Mesh(new THREE.SphereGeometry(3.5,24,16),glow('#ffdf8a'));sun.position.set(10,8,-28);add(sun,(m,t)=>{m.position.y=8+Math.sin(t*.2)*.6;});},
 dust(){for(let i=0;i<30;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(.06,5,4),glow('#ffe0a0',.6));d.position.set(rnd(-22,22),rnd(-10,8),rnd(-10,0));add(d,(m,t,o)=>{m.position.x+=.05;if(m.position.x>22)m.position.x=-22;m.position.y=o.b.y+Math.sin(t+o.p)*.4;});}},
 coral(){for(let i=0;i<12;i++){const g=new THREE.Group();const c=['#ff6f61','#ff9ad0','#ffd84a','#9a6aff'][i%4];for(let k=0;k<4;k++){const br=new THREE.Mesh(new THREE.CylinderGeometry(.1,.16,rnd(1,2.2),6),mat(c));br.position.set(rnd(-.4,.4),.8,rnd(-.3,.3));br.rotation.z=rnd(-.5,.5);g.add(br);}
   g.position.set(sideX(),-ROWS/2-.6,rnd(-8,-1));add(g,(m,t,o)=>{m.rotation.z=Math.sin(t*1.4+o.p)*.08;});}},
 towers(){for(let i=0;i<14;i++){const h=rnd(5,16),g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(rnd(1.5,3),h,2),mat('#1a1438'));b.position.y=h/2;g.add(b);
   const n=new THREE.Mesh(new THREE.BoxGeometry(b.geometry.parameters.width+.06,.15,2.06),glow(['#ff3ab0','#3ae0ff','#ffe03a'][i%3]));n.position.y=h*.7;g.add(n);
   g.position.set((i%2?-1:1)*rnd(9,24),-ROWS/2-.6,rnd(-22,-6));add(g,(m,t,o)=>{m.children[1].material.opacity=Math.sin(t*6+o.p)>-.6?.95:.2;m.children[1].position.y=m.children[0].position.y*2*(.55+.25*Math.sin(t*.7+o.p));});}},
 ghosts(){for(let i=0;i<6;i++){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.SphereGeometry(.6,14,10,0,6.3,0,1.9),glow('#f0eaff',.75));g.add(b);for(const s of [-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.08,6,4),new THREE.MeshBasicMaterial({color:'#1a1030'}));e.position.set(s*.2,.1,.55);g.add(e);}
   g.position.set(sideX(),rnd(-6,10),rnd(-8,-2));add(g,(m,t,o)=>{m.position.y=o.b.y+Math.sin(t*1.2+o.p)*.8;m.position.x=o.b.x+Math.sin(t*.5+o.p)*1.2;m.children[0].material.opacity=.4+.35*Math.sin(t*2+o.p);});}},
 candles(){for(let i=0;i<10;i++){const g=new THREE.Group();const c=new THREE.Mesh(new THREE.CylinderGeometry(.15,.15,rnd(.6,1.4),8),mat('#f4ead0'));c.position.y=c.geometry.parameters.height/2;g.add(c);const f=new THREE.Mesh(new THREE.ConeGeometry(.1,.3,6),glow('#ffb84a'));f.position.y=c.geometry.parameters.height+.15;g.add(f);
   g.position.set((i%2?-1:1)*rnd(6.5,12),-ROWS/2-.6,rnd(-4,0));add(g,(m,t,o)=>{const f=m.children[1];f.scale.set(1+Math.sin(t*20+o.p)*.15,1+Math.sin(t*13+o.p)*.25,1);});}},
 bats(){for(let i=0;i<8;i++){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),mat('#1a1022'));g.add(b);for(const s of [-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(.6,.04,.3),mat('#2a1a3a'));w.position.x=s*.35;g.add(w);}
   g.position.set(rnd(-20,20),rnd(2,14),rnd(-12,-4));add(g,(m,t,o)=>{m.position.x=o.b.x+Math.sin(t*.6+o.p)*6;m.position.y=o.b.y+Math.sin(t*1.7+o.p);m.children[1].rotation.z=Math.sin(t*18)*.8;m.children[2].rotation.z=-Math.sin(t*18)*.8;});}},
 planets(){[['#ff8a3a',3,[-16,10,-28]],['#46e0ff',1.6,[15,13,-24]],['#c08bff',2.2,[18,-4,-30]]].forEach(([c,r,p],k)=>{const pl=new THREE.Mesh(new THREE.SphereGeometry(r,24,16),mat(c,{emissive:c,emissiveIntensity:.25}));pl.position.set(...p);add(pl,(m,t)=>{m.rotation.y=t*.2;});
   if(k===0){const rg=new THREE.Mesh(new THREE.TorusGeometry(r*1.6,.2,6,40),glow('#ffd8a0',.6));rg.rotation.x=1.2;rg.position.set(...p);add(rg,(m,t)=>{m.rotation.z=t*.1;});}});
   const sat=new THREE.Group();sat.add(new THREE.Mesh(new THREE.BoxGeometry(.6,.6,.6),mat('#cfd8e8')));const pn=new THREE.Mesh(new THREE.BoxGeometry(2.2,.05,.6),mat('#3a6ad8'));sat.add(pn);sat.position.set(0,14,-10);add(sat,(m,t)=>{m.position.x=Math.sin(t*.3)*16;m.position.z=-10+Math.cos(t*.3)*4;m.rotation.y=t;});},
 crystals(){for(let i=0;i<10;i++){const c=new THREE.Mesh(new THREE.OctahedronGeometry(rnd(.4,.9)),mat(['#46e0ff','#c08bff','#ff6fd8'][i%3],{emissive:'#6040ff',emissiveIntensity:.4,flatShading:true}));c.scale.y=1.8;c.position.set(sideX(),rnd(-10,10),rnd(-9,-2));add(c,(m,t,o)=>{m.rotation.y=t*.8+o.p;m.position.y=o.b.y+Math.sin(t+o.p)*.5;});}}
};
TH.k.forEach(k=>KIND[k]&&KIND[k]());
// world name sign under the board
{const cv=document.createElement('canvas');cv.width=512;cv.height=64;const g=cv.getContext('2d');g.fillStyle='rgba(0,0,0,.45)';g.fillRect(0,0,512,64);g.fillStyle='#ffd84a';g.font='900 34px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText((ENDLESS?'∞ ':'')+TH.n.toUpperCase(),256,34);
 const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Mesh(new THREE.PlaneGeometry(8,1),new THREE.MeshBasicMaterial({map:tx,transparent:true}));s.position.set(0,-ROWS/2-.9,2.52);SG.add(s);}
(function scAnim(now){const t=now/1000;for(const o of SC)o.fn(o.m,t,o);requestAnimationFrame(scAnim);})(0);
