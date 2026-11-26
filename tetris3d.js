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
