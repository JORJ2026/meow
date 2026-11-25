import * as THREE from 'https://esm.sh/three@0.160.0';
import { selectedCat } from './char3d.js';
import { makeCatRoad } from './cat3d-road.js';

// 3D Cross Road: hop the cat over busy roads and a river to the bowl. 1 world unit = 1 tile.
const LEVELS=5, COLS=6, WRAP=11;   // lanes run x -COLS..COLS; moving things wrap at +-WRAP
const CARC=['#ff5d5d','#ffd84a','#5dd0ff','#b07cff','#ff9f43','#f4f4f4'];
const $=id=>document.getElementById(id);
const PR=(()=>{try{return JSON.parse(localStorage.getItem('cq_prog')||'{}')||{};}catch(_){return {};}})();
PR.frog=PR.frog||{at:0};
const savePR=()=>{try{localStorage.setItem('cq_prog',JSON.stringify(PR));}catch(_){}};
const BKEY='cf3-best';let BEST=0;try{BEST=+localStorage.getItem(BKEY)||0;}catch(_){}

// ---------- scene ----------
const R3=new THREE.WebGLRenderer({canvas:$('c'),antialias:true});
R3.setPixelRatio(Math.min(1.5,devicePixelRatio));
const scene=new THREE.Scene();
scene.background=new THREE.Color('#9fe0ff');
scene.fog=new THREE.Fog('#9fe0ff',26,80);
const cam=new THREE.PerspectiveCamera(50,1,.1,140);
const camGoal=new THREE.Vector3();let camInit=false;
scene.add(new THREE.HemisphereLight('#ffffff','#7ab060',1.5));
const sun=new THREE.DirectionalLight('#fff4da',1.3);sun.position.set(-4,12,6);scene.add(sun);
function resize(){R3.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();}
addEventListener('resize',resize);resize();

const MATS={};
const mat=(c,o)=>{const k=c+JSON.stringify(o||{});return MATS[k]||(MATS[k]=new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.7},o||{})));};
const box=(w,h,d,c,o)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,o));

const Z={level:1,score:0,lives:3,rows:[],meshes:[],maxRow:0,safe:{r:0,c:0},over:null,nextT:0,ready:0,queued:null,dead:null,t:0,frog:null};
const frogG=makeCatRoad(selectedCat());scene.add(frogG);
const addM=m=>{Z.meshes.push(m);scene.add(m);return m;};

// ---------- messages ----------
function showMsg(title,sub,btns){const m=$('msg');m.classList.remove('hide');m.innerHTML='';
  const t=document.createElement('div');t.textContent=title;m.appendChild(t);
  if(sub){const s=document.createElement('small');s.textContent=sub;m.appendChild(s);}
  if(btns&&btns.length){const row=document.createElement('div');row.className='mbtn';
    for(const [label,fn,on] of btns){const b=document.createElement('button');b.textContent=label;if(on)b.className='on';b.onclick=fn;row.appendChild(b);}
    m.appendChild(row);}}
function hideMsg(){$('msg').classList.add('hide');}
function bestSave(){if(Z.score>BEST){BEST=Z.score;try{localStorage.setItem(BKEY,String(BEST));}catch(_){}}}

// ---------- props ----------
function mkCar(w,c){
  const g=new THREE.Group();
  const body=box(w,.42,.8,c);body.position.y=.34;g.add(body);
  const cab=box(w*.55,.3,.66,'#cfe9ff',{roughness:.2});cab.position.set(-w*.05,.66,0);g.add(cab);
  for(const sx of [-1,1])for(const sz of [-1,1]){
    const wh=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.1,10),mat('#222222'));
    wh.rotation.x=Math.PI/2;wh.position.set(sx*w*.3,.14,sz*.42);g.add(wh);
  }
  return g;
}

// ---------- vehicles: sedan plus 10 new shapes. Each fills its w x 0.9 footprint so hit boxes and lights still line up.
const vPart=(g,geo,c,x,y,z,o)=>{const m=new THREE.Mesh(geo,mat(c,o));m.position.set(x,y,z);g.add(m);return m;};
const vWheels=(g,w,r,xs)=>{for(const sx of xs)for(const sz of [-1,1]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,.1,10),mat('#222222'));wh.rotation.x=Math.PI/2;wh.position.set(sx*w,r,sz*.42);g.add(wh);}};
const GLASS={roughness:.2};
const VEH=[
(g,w,c)=>{ // sedan
  vPart(g,new THREE.BoxGeometry(w,.42,.8),c,0,.34,0);
  vPart(g,new THREE.BoxGeometry(w*.55,.3,.66),'#cfe9ff',-w*.05,.66,0,GLASS);
  vWheels(g,w,.13,[-.3,.3]);},
(g,w,c)=>{ // hatchback with a sloped rear window
  vPart(g,new THREE.BoxGeometry(w,.4,.8),c,0,.34,0);
  const cab=vPart(g,new THREE.BoxGeometry(w*.6,.32,.68),'#cfe9ff',-w*.08,.66,0,GLASS);cab.rotation.z=-.18;
  vWheels(g,w,.13,[-.3,.3]);},
(g,w,c)=>{ // sports car: low wedge and a rear spoiler
  vPart(g,new THREE.BoxGeometry(w,.26,.8),c,0,.26,0);
  vPart(g,new THREE.BoxGeometry(w*.42,.22,.62),'#1d2433',w*.04,.46,0,{roughness:.3});
  vPart(g,new THREE.BoxGeometry(.1,.2,.82),c,-w*.46,.48,0);
  vWheels(g,w,.13,[-.3,.3]);},
(g,w,c)=>{ // pickup: cab plus open bed
  vPart(g,new THREE.BoxGeometry(w*.4,.52,.8),c,w*.3,.41,0);
  vPart(g,new THREE.BoxGeometry(w*.3,.24,.82),'#cfe9ff',w*.32,.56,0,GLASS);
  vPart(g,new THREE.BoxGeometry(w*.46,.14,.8),'#8a5a2b',-w*.27,.22,0);
  for(const s of [-1,1])vPart(g,new THREE.BoxGeometry(w*.46,.22,.05),c,-w*.27,.36,s*.38);
  vPart(g,new THREE.BoxGeometry(.05,.22,.8),c,-w*.5+.025,.36,0);
  vWheels(g,w,.13,[-.3,.3]);},
(g,w,c)=>{ // box truck: tall cargo box and short cab
  vPart(g,new THREE.BoxGeometry(w*.66,.9,.86),'#f4f4f4',-w*.17,.6,0);
  vPart(g,new THREE.BoxGeometry(w*.3,.6,.8),c,w*.35,.45,0);
  vPart(g,new THREE.BoxGeometry(.06,.26,.66),'#cfe9ff',w*.49,.6,0,GLASS);
  vWheels(g,w,.15,[-.32,.32]);},
(g,w,c)=>{ // bus: tall body with a window band
  vPart(g,new THREE.BoxGeometry(w,.95,.9),c,0,.62,0);
  for(const s of [-1,1])vPart(g,new THREE.BoxGeometry(w*.86,.28,.02),'#cfe9ff',0,.78,s*.456,GLASS);
  vPart(g,new THREE.BoxGeometry(.04,.55,.78),'#cfe9ff',w*.5,.75,0,GLASS);
  vWheels(g,w,.15,[-.32,.32]);},
(g,w,c)=>{ // tanker: tank on a chassis
  const tank=new THREE.Mesh(new THREE.CylinderGeometry(.33,.33,w*.78,14),mat('#f4f4f4',{roughness:.4}));
  tank.rotation.z=Math.PI/2;tank.position.set(-w*.1,.5,0);g.add(tank);
  vPart(g,new THREE.BoxGeometry(w*.8,.1,.7),'#333845',-w*.1,.2,0);
  vPart(g,new THREE.BoxGeometry(w*.22,.48,.8),c,w*.39,.34,0);
  vWheels(g,w,.13,[-.3,.3]);},
(g,w,c)=>{ // dump truck: cab and a tilted bed
  vPart(g,new THREE.BoxGeometry(w*.3,.5,.8),c,w*.36,.4,0);
  const bed=vPart(g,new THREE.BoxGeometry(w*.6,.46,.86),'#8f96a3',-w*.17,.62,0);bed.rotation.z=.12;
  vPart(g,new THREE.BoxGeometry(w*.3,.12,.9),'#3a3f4c',-w*.2,.22,0);
  vWheels(g,w,.15,[-.3,.3]);},
(g,w,c)=>{ // police car: white body, stripe and light bar
  vPart(g,new THREE.BoxGeometry(w,.42,.8),'#f4f4f4',0,.34,0);
  vPart(g,new THREE.BoxGeometry(w,.1,.82),'#1d3a8a',0,.3,0);
  vPart(g,new THREE.BoxGeometry(w*.55,.3,.66),'#1d2433',-w*.05,.66,0,GLASS);
  vPart(g,new THREE.BoxGeometry(w*.16,.08,.22),'#ff3b3b',-w*.14,.85,0,{emissive:'#ff1f1f',emissiveIntensity:.9});
  vPart(g,new THREE.BoxGeometry(w*.16,.08,.22),'#3b6bff',-w*.04,.85,0,{emissive:'#2a55ff',emissiveIntensity:.9});
  vWheels(g,w,.13,[-.3,.3]);},
(g,w,c)=>{ // race car: open cockpit, nose cone and rear wing
  vPart(g,new THREE.BoxGeometry(w,.2,.78),c,0,.18,0);
  vPart(g,new THREE.BoxGeometry(w*.32,.12,.6),c,w*.34,.16,0);
  vPart(g,new THREE.BoxGeometry(w*.22,.16,.44),'#1d2433',-w*.06,.34,0,{roughness:.3});
  vPart(g,new THREE.BoxGeometry(.2,.05,.95),c,-w*.46,.62,0);
  for(const s of [-1,1])vPart(g,new THREE.BoxGeometry(.06,.3,.06),'#2a2e38',-w*.44,.45,s*.3);
  vWheels(g,w,.13,[-.3,.3]);},
(g,w,c)=>{ // fire truck: red body, ladder and siren
  vPart(g,new THREE.BoxGeometry(w*.66,.75,.86),c,-w*.17,.5,0);
  vPart(g,new THREE.BoxGeometry(w*.3,.6,.8),c,w*.35,.4,0);
  vPart(g,new THREE.BoxGeometry(w*.66,.05,.12),'#e8e8e8',-w*.17,.92,0);
  vPart(g,new THREE.BoxGeometry(.18,.1,.2),'#ff3b3b',-w*.1,.98,0,{emissive:'#ff1f1f',emissiveIntensity:1});
  vWheels(g,w,.15,[-.32,.32]);},
];
// sedan first (the original look), then the 10 new shapes
function mkVehicle(w,c){const g=new THREE.Group();const k=Math.random()*VEH.length|0;VEH[k](g,w,c);if(k===2||k===9)g.userData.low=1;return g;} // low shapes: no roof cargo
function mkLog(w){
  const g=new THREE.Group();
  const b=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,w,14),mat('#a86b35'));
  b.rotation.z=Math.PI/2;b.position.y=.08;g.add(b);
  return g;
}
function addTree(x,z){
  const g=new THREE.Group();
  const t=box(.2,.4,.2,'#8a5a2b');t.position.y=.2;g.add(t);
  const c=new THREE.Mesh(new THREE.ConeGeometry(.45,1.1,7),mat('#2f8a3c'));c.position.y=.9;g.add(c);
  g.position.set(x,0,z);addM(g);
}

// ---------- levels ----------
function buildLevel(L){
  for(const m of Z.meshes)scene.remove(m);
  Z.meshes=[];Z.rows=[];
  const N=9+L*2;
  for(let r=0;r<N;r++){
    let type='grass';
    if(r>=2&&r<=N-3){const q=Math.random();type=q<.45?'road':q<.75?'river':'grass';}
    const row={r,type,dir:Math.random()<.5?1:-1,speed:0,objs:[],water:null};
    if(type==='road')row.speed=(1.1+.45*L)*(.75+Math.random()*.6);
    if(type==='river')row.speed=(.8+.3*L)*(.75+Math.random()*.5);
    Z.rows.push(row);
    const z=-r;
    const top=type==='river'
      ?new THREE.MeshStandardMaterial({color:'#2e8fd0',roughness:.25,metalness:.1})
      :mat(type==='road'?'#4b5162':(r%2?'#8fd26a':'#7ccb5c'));
    if(type==='river')row.water=top;
    addM(new THREE.Mesh(new THREE.BoxGeometry(40,.4,.96),top)).position.set(0,-.2,z);
    if(type==='road')for(let x=-20;x<=20;x+=2)addM(box(1,.02,.08,'#f3efd9')).position.set(x,.012,z);
    if(type==='grass'&&r>0&&r<N-1&&Math.random()<.6){addTree(-COLS-2.2,z);addTree(COLS+2.2,z);}
    if(r===N-1){
      addM(new THREE.Mesh(new THREE.CylinderGeometry(.42,.28,.22,16),mat('#ffd84a',{metalness:.3,roughness:.4}))).position.set(0,.11,z);
      addM(new THREE.Mesh(new THREE.SphereGeometry(.28,14,10),mat('#c98f4a'))).position.set(0,.26,z);
    }
    if(type==='road'||type==='river'){
      const road=type==='road';
      let x=-WRAP+Math.random()*2;
      while(x<=WRAP){
        const w=road?1.5+Math.random()*.7:2.2+Math.random()*1.1;
        const mesh=road?mkVehicle(w,CARC[(Math.random()*CARC.length)|0]):mkLog(w);
        addM(mesh).position.set(x,0,z);
        row.objs.push({x,w,mesh});
        x+=w+(road?3+Math.random()*2.5:1.4+Math.random()*1.2);
      }
    }
  }
}

// ---------- game flow ----------
function startLevel(L){
  Z.level=L;buildLevel(L);
  Z.frog={r:0,c:0,hop:null,fr:1,fc:0};Z.safe={r:0,c:0};Z.maxRow=0;
  Z.queued=null;Z.dead=null;Z.nextT=0;Z.over=null;
  Z.ready=1.3;showMsg('Level '+L+' / '+LEVELS,'Hop to the bowl \u{1F963}');
}
function newGame(){Z.score=0;Z.lives=3;startLevel(1);}
function levelClear(){
  Z.score+=100+Z.lives*50;Z.frog.hop=null;Z.queued=null;
  PR.frog.at=Math.max(PR.frog.at||0,Z.level);savePR();
  if(Z.level>=LEVELS){
    Z.over='win';bestSave();
    showMsg('Crossed them all! \u{1F963}','Score '+Z.score,[['Replay',()=>newGame(),'on'],['Menu',()=>{location.href='index.html';}]]);
    return;
  }
  Z.nextT=1.4;showMsg('Bowl reached! \u{1F963}','Level '+Z.level+' cleared');
}
function gameOver(){
  Z.over='lose';bestSave();
  const k=Z.dead&&Z.dead.kind==='drown'?'Splash! \u{1F4A6}':'Squished! \u{1F697}';
  showMsg(k,'Level '+Z.level+' \u00b7 \u2b50 '+Z.score,[['Try again',()=>newGame(),'on'],['Menu',()=>{location.href='index.html';}]]);
}
function die(kind){
  Z.dead={kind,t:0};Z.lives--;
  const L=$('lives');L.classList.remove('bump');void L.offsetWidth;L.classList.add('bump');
}
function respawn(){Z.frog={r:Z.safe.r,c:Z.safe.c,hop:null,fr:1,fc:0};Z.dead=null;Z.queued=null;}

// ---------- movement ----------
function hop(dr,dc){
  const f=Z.frog;
  const nr=f.r+dr,nc=Math.round(f.c)+dc;
  if(nr<0||nr>=Z.rows.length||nc<-COLS||nc>COLS)return;
  f.fr=dr;f.fc=dc;
  f.hop={r0:f.r,c0:f.c,r1:nr,c1:nc,t:0,dur:.1};
}
function tryMove(dr,dc){
  if(Z.over||Z.dead)return;
  if(Z.frog.hop||Z.nextT>0||Z.ready>0){Z.queued=[dr,dc];return;} // buffered: the hop fires as soon as the cat is free
  hop(dr,dc);
}
function onLand(){
  const f=Z.frog,row=Z.rows[f.r];
  if(row.type==='grass')Z.safe={r:f.r,c:Math.round(f.c)};
  if(f.r>Z.maxRow){Z.score+=10;Z.maxRow=f.r;}
  if(f.r===Z.rows.length-1)levelClear();
}
// Runs only while the cat stands still: squashed by a car, or carried by a log.
function standCheck(dt){
  const f=Z.frog,row=Z.rows[f.r];
  if(row.type==='road'){
    for(const o of row.objs)if(Math.abs(o.x-f.c)<o.w/2+.3){die('squash');return;}
  }else if(row.type==='river'){
    let on=false;
    for(const o of row.objs)if(Math.abs(o.x-f.c)<o.w/2+.2){on=true;break;}
    if(!on){die('drown');return;}
    f.c+=row.dir*row.speed*dt;
  }
  if(f.c<-COLS-.6||f.c>COLS+.6)die('drown');
}

// ---------- loop ----------
function step(dt){
  Z.t+=dt;
  if(Z.ready>0){Z.ready-=dt;if(Z.ready<=0)hideMsg();}
  for(const row of Z.rows){
    if(row.type==='grass')continue;
    const sp=row.dir*row.speed*dt;
    for(const o of row.objs){o.x+=sp;if(o.x>WRAP)o.x-=2*WRAP;else if(o.x<-WRAP)o.x+=2*WRAP;}
  }
  const f=Z.frog;
  if(f.hop){
    f.hop.t+=dt/f.hop.dur;
    if(f.hop.t>=1){f.r=f.hop.r1;f.c=f.hop.c1;f.hop=null;onLand();if(Z.queued&&!Z.dead&&!Z.over&&Z.nextT<=0&&Z.ready<=0){const q=Z.queued;Z.queued=null;hop(q[0],q[1]);}}
  }else if(Z.dead){
    Z.dead.t+=dt;
    if(Z.dead.t>=1&&!Z.over){if(Z.lives<=0)gameOver();else respawn();}
  }else if(!Z.over&&Z.nextT<=0&&Z.ready<=0){
    standCheck(dt);
    if(!Z.dead&&Z.queued){const q=Z.queued;Z.queued=null;hop(q[0],q[1]);}
  }
  if(Z.nextT>0){Z.nextT-=dt;if(Z.nextT<=0)startLevel(Z.level+1);}
}
function baseY(r){const rw=Z.rows[r];return rw&&rw.type==='river'?.42:0;}
let hudKey='';
function render(){
  for(const row of Z.rows){
    if(row.water)row.water.emissive.setRGB(0,.04+.03*Math.sin(Z.t*2+row.r),.07+.03*Math.sin(Z.t*2+row.r));
    for(const o of row.objs)o.mesh.position.x=o.x;
  }
  const f=Z.frog;
  let x=f.c,zr=f.r,y=baseY(f.r);
  if(f.hop){
    const h=f.hop,e=Math.min(1,h.t),s=e*e*(3-2*e);
    x=h.c0+(h.c1-h.c0)*s;zr=h.r0+(h.r1-h.r0)*s;
    y=baseY(h.r0)+(baseY(h.r1)-baseY(h.r0))*s+Math.sin(Math.PI*s)*.55;
  }
  let sxz=.75,sy=.75;
  if(Z.dead){
    const t=Math.min(1,Z.dead.t);
    if(Z.dead.kind==='squash'){sxz=.75*(1+t*.5);sy=.75*Math.max(.1,1-t*1.3);}
    else{y-=t*.8;sxz=.75*(1-t*.4);sy=sxz;}
  }
  frogG.visible=!(Z.dead&&Z.dead.kind==='drown'&&Z.dead.t>.9);
  frogG.position.set(x,y,-zr);
  frogG.scale.set(sxz,sy,sxz);
  frogG.rotation.y=Math.atan2(-f.fc,f.fr);
  // camera: behind the cat, zoomed out on narrow screens
  const zoom=Math.max(1,1.3/cam.aspect),gx=x*.5;
  camGoal.set(gx,9.5*zoom,-zr+7.5*zoom);
  if(!camInit){cam.position.copy(camGoal);camInit=true;}else cam.position.lerp(camGoal,.14);
  cam.lookAt(gx,0,-zr-2.2);
  const hs=Z.score+'|'+BEST+'|'+Z.level+'|'+Z.lives;
  if(hs!==hudKey){hudKey=hs;
    $('sc').textContent=Z.score;$('best').textContent='best '+Math.max(BEST,Z.score);
    $('lv').textContent='Level '+Z.level+' / '+LEVELS;$('lives').textContent='\u2764'.repeat(Math.max(0,Z.lives));}
}
let last=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  step(dt);render();R3.render(scene,cam);
  requestAnimationFrame(frame);
}

// ---------- input: arrows / WASD, tap = forward, swipe ----------
const keyDir={ArrowUp:[1,0],KeyW:[1,0],ArrowDown:[-1,0],KeyS:[-1,0],ArrowLeft:[0,-1],KeyA:[0,-1],ArrowRight:[0,1],KeyD:[0,1]};
addEventListener('keydown',e=>{const d=keyDir[e.code];if(!d)return;e.preventDefault();if(!e.repeat)tryMove(d[0],d[1]);});
let sx=0,sy=0,sOn=false;
addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;sOn=true;});
addEventListener('pointercancel',()=>{sOn=false;});
addEventListener('pointerup',e=>{
  if(!sOn)return;sOn=false;
  const dx=e.clientX-sx,dy=e.clientY-sy;
  if(Math.max(Math.abs(dx),Math.abs(dy))<24){tryMove(1,0);return;}
  if(Math.abs(dx)>Math.abs(dy))tryMove(0,dx>0?1:-1);
  else tryMove(dy<0?1:-1,0);
});

newGame();
requestAnimationFrame(frame);


/* ===== polish pass: 50 visual improvements + pause (rules untouched) ===== */
(()=>{
const css=document.createElement('style');
css.textContent=`
#vig,#dim,#fade,#dmg{position:fixed;inset:0;pointer-events:none;z-index:1}
#vig{background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(20,30,60,.45) 100%)}
#dim{background:rgba(20,30,50,.45);opacity:0;transition:opacity .25s}
#fade{background:#fff;opacity:0;transition:opacity .6s;z-index:3}
#dmg{background:rgba(255,60,80,.45);opacity:0;transition:opacity .5s}
#hud,#back,#pzb,#msg{z-index:4}
.fpop{position:fixed;left:0;top:0;z-index:3;color:#fff;font:900 20px system-ui,sans-serif;text-shadow:0 2px 0 #1d3a5a;pointer-events:none;white-space:nowrap}
#lv.bump,#sc.bump{animation:fbump .4s}
@keyframes fbump{0%{transform:scale(1)}40%{transform:scale(1.25)}100%{transform:scale(1)}}
#best.gold{color:#ffd84a}
#msg:not(.hide){animation:mpop .35s cubic-bezier(.2,1.6,.4,1)}
@keyframes mpop{from{transform:translate(-50%,-50%) scale(.7);opacity:0}to{transform:translate(-50%,-50%) scale(1);opacity:1}}
#pzb{position:fixed;right:12px;bottom:12px;width:44px;height:44px;border-radius:50%;border:0;background:rgba(20,40,70,.7);color:#fff;font-size:16px;cursor:pointer}
`;
document.head.appendChild(css);
const overlay=id=>{const d=document.createElement('div');d.id=id;document.body.prepend(d);return d;};
const vig=overlay('vig'),dim=overlay('dim'),fade=overlay('fade'),dmg=overlay('dmg');

// 1-6: per-level palette, fog, sun and hemisphere tint, soft shadows, tone mapping
const SKY=['#9fe0ff','#ffd6a5','#c9b8ff','#ffc2d1','#a8f0d6'];
const SUNC=['#fff4da','#ffe0b0','#fff0c8','#ffd9e6','#e6fff4'];
const HEMG=['#ffffff','#ffe9cc','#e8dcff','#ffe0ec','#dffff0'];
const hemi=scene.children.find(o=>o.isHemisphereLight);
const back=new THREE.DirectionalLight('#cfe6ff',.5);back.position.set(4,6,-10);scene.add(back); // 10: fill light from behind
R3.shadowMap.enabled=true;R3.shadowMap.type=THREE.PCFShadowMap;
R3.toneMapping=THREE.ACESFilmicToneMapping;R3.toneMappingExposure=1.05;
sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.5,far:60});
sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.0008;
scene.add(sun.target);
frogG.rotation.order='YXZ';

// shared geometry
const FLG=new THREE.SphereGeometry(.12,8,6),ROG=new THREE.DodecahedronGeometry(.2),TUG=new THREE.ConeGeometry(.12,.3,5);
const PG=new THREE.SphereGeometry(.07,6,5),RG=new THREE.RingGeometry(.25,.32,20);
const FLC=['#ff7eb6','#fff176','#ffffff','#b388ff'];
const PM={};const pm=c=>PM[c]||(PM[c]=new THREE.MeshBasicMaterial({color:c}));
const PART=[],RINGS=[],POPS=[],STR=[],WHEELS=[],TREES=[],MOTES=[];
let GOALB=null,shk=0,LA=0,paused=false,pauseT=0,LILY=[],SAFE=null,BLOB=null,LSC=0;

function applyLook(L){
  const i=(L-1)%5;
  scene.background.set(SKY[i]);scene.fog.color.set(SKY[i]);
  scene.fog.near=26-(L-1)*2;scene.fog.far=80-(L-1)*6;
  sun.color.set(SUNC[i]);if(hemi)hemi.color.set(HEMG[i]);
}
function burst(x,y,z,cols,n,spd,up){
  for(let i=0;i<n&&PART.length<260;i++){
    const m=new THREE.Mesh(PG,pm(cols[(Math.random()*cols.length)|0]));m.position.set(x,y,z);scene.add(m);
    const a=Math.random()*6.283,s=spd*(.4+Math.random());
    PART.push({m,vx:Math.cos(a)*s,vy:up*(.5+Math.random()),vz:Math.sin(a)*s,l:1});
  }
}
function spark(x,y,z){
  if(PART.length>=260)return;
  const m=new THREE.Mesh(PG,pm('#fff6b0'));m.scale.setScalar(.6);
  m.position.set(x+(Math.random()-.5)*1.2,y,z+(Math.random()-.5)*1.2);scene.add(m);
  PART.push({m,vx:0,vy:.03+Math.random()*.03,vz:0,l:1});
}
function ring(x,z){
  const mt=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false});
  const m=new THREE.Mesh(RG,mt);m.rotation.x=-Math.PI/2;m.position.set(x,.06,z);scene.add(m);RINGS.push({m,t:0});
}
function popTxt(s,x,y,z,c){
  const el=document.createElement('div');el.className='fpop';el.textContent=s;el.style.color=c||'#ffffff';
  document.body.appendChild(el);POPS.push({el,x,y,z,t:0});
}

// props, lane details and goal: rebuilt for each level, tracked in Z.meshes
function decorate(){
  STR.length=0;WHEELS.length=0;TREES.length=0;LILY.length=0;GOALB=null;
  for(const m of Z.meshes)if(m.isGroup&&m.children.length===2)TREES.push(m);
  const N=Z.rows.length;
  for(const row of Z.rows){
    const z=-row.r;
    if(row.type==='grass'&&row.r>0&&row.r<N-1){
      const k=1+(Math.random()*3|0);
      for(let i=0;i<k;i++){
        const x=(Math.random()*2-1)*(COLS-.6),q=Math.random(),dz=z+(Math.random()-.5)*.6;
        let m;
        if(q<.4){m=new THREE.Mesh(FLG,mat(FLC[(Math.random()*FLC.length)|0]));m.position.set(x,.1,dz);}
        else if(q<.7){m=new THREE.Mesh(ROG,mat('#9aa0a8',{roughness:.9}));m.position.set(x,.1,dz);m.rotation.set(Math.random()*3,Math.random()*3,0);}
        else{m=new THREE.Mesh(TUG,mat('#3f9e4a'));m.position.set(x,.15,dz);}
        addM(m);
      }
    }
    if(row.r===0){
      const sr=new THREE.Mesh(new THREE.RingGeometry(.35,.5,24),new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.7,side:THREE.DoubleSide}));
      sr.rotation.x=-Math.PI/2;sr.position.set(0,.03,0);addM(sr);SAFE=sr;
    }
    if(row.r===N-1){
      const b=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,6,14,1,true),new THREE.MeshBasicMaterial({color:'#ffe27a',transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
      b.position.set(0,3,z);addM(b);GOALB=b;
    }
    if(row.type==='road'){
      for(const s of [-1,1]){const kb=box(40,.06,.12,'#d9d4c4');kb.position.set(0,.03,z+s*.5);addM(kb);}
      for(const o of row.objs){
        const d=row.dir;
        for(const s of [-1,1]){
          const h=new THREE.Mesh(new THREE.BoxGeometry(.08,.1,.1),pm('#fff6c8'));h.position.set(d*(o.w/2+.01),.34,s*.25);o.mesh.add(h);
          const t=new THREE.Mesh(new THREE.BoxGeometry(.08,.1,.1),pm('#ff3b3b'));t.position.set(-d*(o.w/2+.01),.34,s*.25);o.mesh.add(t);
        }
        o.mesh.traverse(c=>{if(c.isMesh&&c.geometry.parameters&&c.geometry.parameters.radiusTop===.13)WHEELS.push({m:c,row});});
      }
    }
    if(row.type==='river'){
      for(const o of row.objs)for(const s of [-1,1]){
        const c=new THREE.Mesh(new THREE.CircleGeometry(.36,14),mat('#e6b070'));
        c.rotation.y=s*Math.PI/2;c.position.set(s*o.w/2,.08,0);o.mesh.add(c);
      }
      for(let i=0;i<3;i++){
        const sm=box(1.2+Math.random()*1.5,.02,.12,'#ffffff',{transparent:true,opacity:.6});
        sm.position.set((Math.random()*2-1)*WRAP,.02,z+(Math.random()-.5)*.5);addM(sm);STR.push({m:sm,row});
      }
      for(let i=0;i<2;i++){
        const pd=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.04,14),mat('#4fb85a'));
        pd.position.set((Math.random()*2-1)*(COLS+2),.02,z+(Math.random()-.5)*.4);addM(pd);LILY.push(pd);
      }
    }
  }
  // shadows: everything casts except the ground strips (width 40)
  for(const m of Z.meshes){
    const ground=m.geometry&&m.geometry.parameters&&m.geometry.parameters.width===40;
    m.traverse(c=>{if(c.isMesh){c.castShadow=!ground;c.receiveShadow=true;}});
  }
  frogG.traverse(c=>{if(c.isMesh)c.castShadow=true;});
}

// wrappers: level start, moves, game flow effects, render
const _sl=startLevel;
startLevel=function(L){
  _sl(L);
  applyLook(L);decorate();
  Z.spawnT=0;burst(0,.1,0,['#e9dcc0','#f5efe0'],10,.03,.03);
  fade.style.transition='none';fade.style.opacity=.9;
  requestAnimationFrame(()=>{fade.style.transition='opacity .6s';fade.style.opacity=0;});
  const lv=$('lv');lv.classList.remove('bump');void lv.offsetWidth;lv.classList.add('bump');
};
const _tm=tryMove;
tryMove=function(dr,dc){if(paused)return;_tm(dr,dc);};

function fx(dt){
  const k=dt*60;
  for(let i=RINGS.length-1;i>=0;i--){
    const r=RINGS[i];r.t+=dt;r.m.scale.setScalar(1+r.t*4);r.m.material.opacity=Math.max(0,.7*(1-r.t/.5));
    if(r.t>=.5){scene.remove(r.m);r.m.material.dispose();RINGS.splice(i,1);}
  }
  for(let i=PART.length-1;i>=0;i--){
    const p=PART[i];
    p.m.position.x+=p.vx*k;p.m.position.y+=p.vy*k;p.m.position.z+=p.vz*k;p.vy-=.004*k;
    p.l-=dt*1.3;p.m.scale.setScalar(Math.max(.02,p.l));
    if(p.l<=0){scene.remove(p.m);PART.splice(i,1);}
  }
  for(let i=POPS.length-1;i>=0;i--){
    const q=POPS[i];q.t+=dt;
    const v=new THREE.Vector3(q.x,q.y+q.t*.3,q.z).project(cam);
    q.el.style.transform='translate('+((v.x+1)/2*innerWidth).toFixed(1)+'px,'+((1-v.y)/2*innerHeight).toFixed(1)+'px) translate(-50%,-50%)';
    q.el.style.opacity=String(Math.max(0,1-q.t/.9));
    if(q.t>=.9){q.el.remove();POPS.splice(i,1);}
  }
  for(const row of Z.rows)if(row.type==='river')for(const o of row.objs)o.mesh.position.y=Math.sin(Z.t*1.5+o.x)*.035;
  for(const w of WHEELS)w.m.rotation.y+=dt*w.row.dir*w.row.speed*5;
  for(const s of STR){
    const m=s.m;m.position.x+=s.row.dir*s.row.speed*dt;
    if(m.position.x>WRAP)m.position.x-=2*WRAP;else if(m.position.x<-WRAP)m.position.x+=2*WRAP;
  }
  for(const t of TREES)t.rotation.z=Math.sin(Z.t*1.3+t.position.z)*.03;
  for(const p of LILY)p.position.y=.02+Math.sin(Z.t*2+p.position.x)*.02;
  if(SAFE)SAFE.material.opacity=.45+.25*Math.sin(Z.t*4);
  if(Z.score!==LSC){LSC=Z.score;const e=$('sc');e.classList.remove('bump');void e.offsetWidth;e.classList.add('bump');}
  if(GOALB){GOALB.material.opacity=.16+.08*Math.sin(Z.t*3);if(Math.random()<dt*8)spark(GOALB.position.x,.4,GOALB.position.z);}
  const fp=frogG.position;
  for(const m of MOTES){const u=m.userData;m.position.set(fp.x+u.ox+Math.sin(Z.t*.5+u.p)*.4,u.oy+Math.sin(Z.t*.8+u.p)*.3,fp.z+u.oz+Math.cos(Z.t*.4+u.p)*.3);}
  Z.spawnT=Math.min(1,(Z.spawnT==null?1:Z.spawnT)+dt*1.6);
  $('best').classList.toggle('gold',Z.score>0&&Z.score>BEST);
}

const _step=step;
step=function(dt){
  if(paused)return;
  const f0=Z.frog,h0=f0.hop,sc0=Z.score,nx0=Z.nextT,d0=Z.dead,o0=Z.over;
  _step(dt);
  if(h0&&f0.hop!==h0&&Z.frog===f0&&!Z.dead){ // 25, 28: dust and ring on landing
    const rv=Z.rows[f0.r]&&Z.rows[f0.r].type==='river';burst(f0.c,.1,-f0.r,rv?['#bfeaff','#ffffff']:['#e9dcc0','#f5efe0'],7,.03,.03);
    ring(f0.c,-f0.r);
  }
  if(Z.dead&&!d0){ // 34-37: feathers or splash, shake and red flash
    const x=Z.frog.c,z=-Z.frog.r;
    if(Z.dead.kind==='squash'){burst(x,.3,z,['#ffffff','#ffd84a','#ff5d5d'],18,.05,.06);shk=.45;}
    else{burst(x,.4,z,['#bfeaff','#ffffff'],14,.04,.08);shk=.3;}
    dmg.style.opacity=.9;setTimeout(()=>{dmg.style.opacity=0;},70);
  }
  if((Z.nextT>0&&nx0<=0)||(Z.over==='win'&&o0!=='win')){ // 38: confetti
    burst(Z.frog.c,1,-Z.frog.r,['#ff5d5d','#ffd84a','#5dd0ff','#b07cff','#5fe08a'],40,.08,.12);
  }
  if(Z.score>sc0)popTxt('+'+(Z.score-sc0),Z.frog.c,.9,-Z.frog.r,'#ffffff'); // 39
  fx(dt);
};

const _render=render;
render=function(){
  _render();
  const f=Z.frog,h=f.hop,fp=frogG.position;
  const sp=Math.min(1,Z.spawnT==null?1:Z.spawnT),ease=1-Math.pow(1-sp,3);
  if(!Z.dead){
    if(h){
      const e=Math.min(1,h.t),s=e*e*(3-2*e),b=Math.sin(Math.PI*s);
      frogG.scale.set(.75*(1-.12*b)*ease,.75*(1+.25*b)*ease,.75*(1-.12*b)*ease); // 29: squash and stretch
      frogG.rotation.x=-b*.12*(f.fr>=0?1:-1);                                       // 30: lean into the hop
    }else{
      frogG.scale.setScalar(.75*ease);frogG.rotation.x=0;
      frogG.position.y+=Math.sin(Z.t*3)*.02;                                         // 31: idle bob
    }
  }
  if(BLOB){const hh=h?Math.sin(Math.PI*Math.min(1,h.t))*.55:0,k=Math.max(.3,1-hh*1.2);BLOB.position.set(fp.x,.03,fp.z);BLOB.scale.setScalar(k);BLOB.material.opacity=.25*k;}
  sun.position.set(fp.x-4,12,fp.z+6);sun.target.position.set(fp.x,0,fp.z);         // 7: shadow follows the cat
  LA+=((f.fr||0)*.9-LA)*.08;
  cam.lookAt(fp.x*.5,0,fp.z-2.2-LA);                                              // 33: look ahead
  if(shk>0){cam.position.x+=(Math.random()-.5)*shk;cam.position.y+=(Math.random()-.5)*shk*.6;shk*=.86;if(shk<.01)shk=0;} // 36
};

// 40-50: pause (P / Esc, touch button, tap to resume, auto-pause, dim)
function pauseGame(){
  if(paused||Z.over)return;
  paused=true;pauseT=performance.now();dim.style.opacity=1;pzb.textContent='\u25b6';
  showMsg('Paused','P / Esc or tap to resume');
}
function resumeGame(){
  if(!paused)return;
  paused=false;dim.style.opacity=0;pzb.textContent='\u275a\u275a';hideMsg();last=performance.now();
}
const pzb=document.createElement('button');
pzb.id='pzb';pzb.setAttribute('aria-label','Pause');pzb.textContent='\u275a\u275a';document.body.appendChild(pzb);
pzb.addEventListener('pointerdown',e=>e.stopPropagation());
pzb.addEventListener('pointerup',e=>e.stopPropagation());
pzb.onclick=()=>{if(paused){if(performance.now()-pauseT>250)resumeGame();}else pauseGame();};
addEventListener('keydown',e=>{
  if(e.code==='KeyP'||e.code==='Escape'){
    e.preventDefault();
    if(paused){if(performance.now()-pauseT>250)resumeGame();}else pauseGame();
  }
});
addEventListener('pointerup',()=>{if(paused&&performance.now()-pauseT>250)resumeGame();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame();});

// 43, 45: motes drifting around the cat
for(let i=0;i<40;i++){
  const m=new THREE.Mesh(PG,pm('#fff9e0'));m.scale.setScalar(.5);
  m.userData={ox:(Math.random()*2-1)*8,oy:.5+Math.random()*3,oz:(Math.random()*2-1)*7,p:Math.random()*6};
  scene.add(m);MOTES.push(m);
}

BLOB=new THREE.Mesh(new THREE.CircleGeometry(.4,20),new THREE.MeshBasicMaterial({color:'#20391f',transparent:true,opacity:.25,depthWrite:false}));BLOB.rotation.x=-Math.PI/2;scene.add(BLOB);
// first level look and props (newGame ran before this block)
Z.spawnT=0;
applyLook(Z.level);decorate();
})();

// hook for frogger3d-fx.js (visual round 2)
window.CR={THREE,scene,cam,R3,Z,frogG,sun};
