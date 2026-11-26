import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { pcGen } from './pacgen.js';
import { makeCat, selectedCat } from './char3d.js';

// 3D Pac: same levels, rules, ghosts, progress as the 2D Pac. 1 world unit = 1 tile.
const WT=[
 {n:'Jungle Ruins',   sky:['#6fd3a0','#effad0'],r1:'#b99a5c',side:'#2f8a3c',side2:'#277a35',acc:'#d9a441',wall:'#3f7d3a',floor:'#cfe3a0'},
 {n:'Sunbaked Sands', sky:['#ffcf7a','#fff3c9'],r1:'#e3b46b',side:'#ecd091',side2:'#e4c481',acc:'#3f9a4a',wall:'#c98f4a',floor:'#f1dca0'},
 {n:'Frozen Peaks',   sky:['#8fd0ff','#eef9ff'],r1:'#cfe8f7',side:'#f5fbff',side2:'#e4f2fa',acc:'#5aa8e0',wall:'#7fb2d6',floor:'#e6f4fb'},
 {n:'Lava Temple',    sky:['#5a1f2a','#ff8a3a'],r1:'#4a3a3a',side:'#2b1a1a',side2:'#241515',acc:'#ff7a1c',wall:'#7a2d1d',floor:'#5a4646'},
 {n:'Candy Canyon',   sky:['#ffc2e4','#fff0fa'],r1:'#ffd1e8',side:'#b6f0d0',side2:'#a4e6c4',acc:'#ff4f9a',wall:'#ff7fb5',floor:'#fff0f8'},
 {n:'Midnight Grove', sky:['#0f1240','#3a3a8a'],r1:'#38406a',side:'#14301f',side2:'#10281a',acc:'#ffe27a',wall:'#1f5c3a',floor:'#3d4a7a'},
 {n:'Haunted Manor',  sky:['#2a1844','#6a3a8a'],r1:'#5b4a6e',side:'#231533',side2:'#1c102a',acc:'#9fe870',wall:'#4a2d63',floor:'#7a6590'},
 {n:'Cloud Kingdom',  sky:['#7ab8ff','#ffffff'],r1:'#ffffff',side:'#cfe3ff',side2:'#bcd6fb',acc:'#ffb43a',wall:'#9fc4f5',floor:'#f4f9ff'},
 {n:'Orbit Station',  sky:['#05051a','#2b1a5e'],r1:'#5f6b86',side:'#1a1a3a',side2:'#14142e',acc:'#46e0ff',wall:'#3a4a7a',floor:'#7a869f'},
 {n:'Deep Reef',      sky:['#0a4a8a','#58d0e0'],r1:'#e0cf9a',side:'#137a8a',side2:'#0f6a7a',acc:'#ff6f61',wall:'#1a6f9a',floor:'#bfe8e8'}
];
const PCL=['Kibble Dash','Corner Cafe','Zigzag Alley','Tunnel Vision','Big Bowl','Dog Park','Twisty Yard','Nip Rush','Boss Kennel','Grand Pawchase'];
const $=id=>document.getElementById(id);
const hsh=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const PR=(()=>{try{return JSON.parse(localStorage.getItem('cq_prog')||'{}')||{};}catch(_){return {};}})();
PR.pac=PR.pac||{at:0,st:{}};PR.pac.st=PR.pac.st||{};
const savePR=()=>{try{localStorage.setItem('cq_prog',JSON.stringify(PR));}catch(_){}};
const BKEY='cp3-best';let BEST=0;try{BEST=+localStorage.getItem(BKEY)||0;}catch(_){}

let I=parseInt(new URLSearchParams(location.search).get('i'));
if(!(I>=0&&I<=99))I=Math.min(99,PR.pac.at||0);
const M=pcGen(I);const TH=WT[M.w];const W=M.W,H=M.H;
const pcName=i=>WT[Math.floor(i/10)].n+' '+(i%10+1)+' \u00b7 '+PCL[i%10];
$('lv').textContent=pcName(I);
const go=n=>{location.href='pac3d.html?i='+n;};

// ---------- state (ported from the 2D Pac) ----------
const Z={pel:M.pel.map(r=>r.slice()),left:M.total,score:0,lives:3,t:0,over:null,msgd:0,treat:null,eaten:0,combo:0,fr:0,ready:100,want:null,stars:0,gh:[],p:null};
function pcReset(){
  Z.p={tx:M.sx,ty:M.sy,dx:0,dy:0,p:0,face:1,dead:0};Z.want=null;Z.fr=0;Z.ready=100;
  Z.gh=M.gh.map((g,n)=>({v:g.v,kind:g.kind,tx:M.hx+(n%3-1),ty:M.hy,dx:0,dy:0,p:0,delay:g.delay,mode:'house',tm:0,dir:1}));
  showMsg('READY!');
}
function pcOpen(x,y){if(M.tunnel&&y===M.hy){if(x<0)x=W-1;else if(x>=W)x=0;}return x>=0&&y>=0&&x<W&&y<H&&M.g[y][x]!=='#';}
function wrap(x,y){if(M.tunnel&&y===M.hy){if(x<0)return W-1;if(x>=W)return 0;}return x;}
const pcPos=e=>[e.tx+e.dx*e.p,e.ty+e.dy*e.p];
pcReset();

function ghostPick(g,n){
  const p=Z.p;
  const dirs=[[1,0],[-1,0],[0,-1],[0,1]].filter(([a,b])=>pcOpen(g.tx+a,g.ty+b));
  if(!dirs.length){g.dx=0;g.dy=0;return;}
  let ch=dirs.filter(([a,b])=>!(a===-g.dx&&b===-g.dy&&(g.dx||g.dy)));if(!ch.length)ch=dirs;
  let pick=null;
  if(g.mode==='eyes'){let bd=1e9;for(const d of dirs){const nx=wrap(g.tx+d[0],g.ty),ny=g.ty+d[1],dd=M.dist[ny][nx];if(dd>=0&&dd<bd){bd=dd;pick=d;}}}
  else if(g.mode==='fright'||(g.kind===2&&hsh(g.tm*.7+n)<.6)){pick=ch[Math.floor(hsh(g.tm*1.7+n*5)*ch.length)];}
  else{
    let tx=p.tx,ty=p.ty;
    if(g.kind===1){tx+=p.dx*4;ty+=p.dy*4;}
    else if(g.kind===3&&Math.hypot(g.tx-p.tx,g.ty-p.ty)<7){tx=1;ty=H-2;}
    if(Math.floor(g.tm/700)%2===1&&g.kind!==0){tx=(n%2?W-2:1);ty=(n<2?1:H-2);}
    let bd=1e9;for(const d of ch){const dd=Math.hypot(g.tx+d[0]-tx,g.ty+d[1]-ty);if(dd<bd){bd=dd;pick=d;}}
  }
  if(!pick)pick=ch[0];
  g.dx=pick[0];g.dy=pick[1];if(g.dx)g.dir=g.dx;
  if(!g.dir)g.dir=1;
  if(g.dy)g.vdy=g.dy;
}

// ---------- input: arrows / WASD, or swipe ----------
const keyDir={ArrowLeft:[-1,0],KeyA:[-1,0],ArrowRight:[1,0],KeyD:[1,0],ArrowUp:[0,-1],KeyW:[0,-1],ArrowDown:[0,1],KeyS:[0,1]};
const held=[];
addEventListener('keydown',e=>{const d=keyDir[e.code];if(!d)return;e.preventDefault();if(!held.includes(e.code))held.push(e.code);Z.want=d;});
addEventListener('keyup',e=>{const i=held.indexOf(e.code);if(i>=0)held.splice(i,1);});
addEventListener('blur',()=>{held.length=0;});
let sx=0,sy=0,sOn=false;
addEventListener('pointerdown',e=>{sx=e.clientX;sy=e.clientY;sOn=true;});
addEventListener('pointercancel',()=>{sOn=false;});
addEventListener('pointerup',e=>{if(!sOn)return;sOn=false;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.max(Math.abs(dx),Math.abs(dy))<24)return;
  Z.want=Math.abs(dx)>Math.abs(dy)?(dx>0?[1,0]:[-1,0]):(dy>0?[0,1]:[0,-1]);});

// ---------- effects helpers ----------
const pops=[],parts=[],rings=[];
let bumpLives=false,shake=0,flashT=0;
function pop(x,y,z,s,c){const el=document.createElement('div');el.className='pop';el.textContent=s;el.style.color=c||'#ffd84a';$('pops').appendChild(el);pops.push({el,x,y,z,t:0});}
const PM={};const pmat=c=>PM[c]||(PM[c]=new THREE.MeshBasicMaterial({color:c}));
const pgeo=new THREE.SphereGeometry(.07,6,5);
function burst(x,y,z,c,n){for(let q=0;q<n&&parts.length<220;q++){const m=new THREE.Mesh(pgeo,pmat(c));m.position.set(x,y,z);scene.add(m);
  const a=Math.random()*6.283,s=.04+Math.random()*.08;parts.push({m,vx:Math.cos(a)*s,vy:.05+Math.random()*.09,vz:Math.sin(a)*s,l:40});}}
const rgeo=new THREE.TorusGeometry(.4,.05,8,28);
function ring(x,y,z,c){const m=new THREE.Mesh(rgeo,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.9}));m.rotation.x=Math.PI/2;m.position.set(x,y,z);scene.add(m);rings.push({m,t:0});}
function flash(c){const f=$('flash');f.style.background=c;f.style.transition='none';f.style.opacity=.4;requestAnimationFrame(()=>{f.style.transition='opacity .5s';f.style.opacity=0;});}
function showMsg(title,sub,btns){const m=$('msg');m.classList.remove('hide');m.innerHTML='';
  const t=document.createElement('div');t.textContent=title;m.appendChild(t);
  if(sub){const s=document.createElement('small');s.textContent=sub;m.appendChild(s);}
  if(btns&&btns.length){const row=document.createElement('div');row.className='mbtn';
    for(const [label,fn,on] of btns){const b=document.createElement('button');b.textContent=label;if(on)b.className='on';b.onclick=fn;row.appendChild(b);}
    m.appendChild(row);}}
function hideMsg(){$('msg').classList.add('hide');}
function loseMsg(){showMsg('The dogs got you! 🐕',pcName(I)+' · ⭐ '+Z.score,[['Try again',()=>go(I),'on'],['Menu',()=>{location.href='index.html';}]]);}
function winMsg(st){const b=[];if(I<99)b.push(['Next maze ▶',()=>go(I+1),'on']);b.push(['Replay',()=>go(I)],['Menu',()=>{location.href='index.html';}]);
  showMsg('Kibble cleared! 🐾',pcName(I)+' · ⭐ '+Z.score+' · '+'★'.repeat(st)+'☆'.repeat(3-st),b);}

let eatHere=function eatHereFn(p){
  const x=p.tx,y=p.ty,v=Z.pel[y][x];if(!v)return;Z.pel[y][x]=0;Z.left--;
  const wx=x+.5,wz=y+.5;
  if(v===1){Z.score+=10;hideKib(x,y);burst(wx,.3,wz,'#ffd27a',4);}
  else{Z.score+=50;Z.fr=M.fright;Z.combo=0;if(nipMesh[y*W+x])nipMesh[y*W+x].visible=false;
    burst(wx,.4,wz,'#c08bff',16);ring(wx,.1,wz,'#c08bff');pop(wx,.9,wz,'CATNIP!','#c08bff');
    for(const g of Z.gh)if(g.mode==='chase'||g.mode==='scatter'){if(g.dx||g.dy){g.tx=wrap(g.tx+g.dx,g.ty);g.ty+=g.dy;g.dx=-g.dx;g.dy=-g.dy;g.p=1-g.p;}g.mode='fright';}}
}
let pcWin=function pcWinFn(){
  Z.over='win';const st=Z.lives>=3?3:Z.lives===2?2:1;Z.stars=st;
  PR.pac.st[I]=Math.max(PR.pac.st[I]||0,st);PR.pac.at=Math.max(PR.pac.at,I+1);savePR();
  if(Z.score>BEST){BEST=Z.score;try{localStorage.setItem(BKEY,String(BEST));}catch(_){}}
  setTimeout(()=>{if(Z.over==='win')winMsg(st);},900);
}

function tick(){
  Z.t++;const p=Z.p;
  if(Z.over){Z.msgd++;if(Z.msgd===50&&Z.over==='lose')loseMsg();return;}
  if(held.length)Z.want=keyDir[held[held.length-1]];
  if(p.dead>0){p.dead--;if(p.dead===0){Z.lives--;bumpLives=true;if(Z.lives<=0){Z.over='lose';Z.msgd=0;}else pcReset();}return;}
  if(Z.ready>0){Z.ready--;if(Z.ready===0)hideMsg();return;}
  if(Z.fr>0){Z.fr--;if(Z.fr===0)Z.combo=0;}
  const sp=M.sp*(Z.fr>0?1.1:1);
  if(p.dx===0&&p.dy===0){
    if(Z.want&&pcOpen(p.tx+Z.want[0],p.ty+Z.want[1])){p.dx=Z.want[0];p.dy=Z.want[1];p.p=0;Z.want=null;if(p.dx)p.face=p.dx;}
  }else{
    if(Z.want&&Z.want[0]===-p.dx&&Z.want[1]===-p.dy){p.tx=wrap(p.tx+p.dx,p.ty);p.ty+=p.dy;p.dx=-p.dx;p.dy=-p.dy;p.p=1-p.p;Z.want=null;if(p.dx)p.face=p.dx;}
    // corner cut: a side turn pressed just after passing a junction (first half of the tile) still takes effect
    if(Z.want&&p.p<.5&&Z.want[0]*p.dx===0&&Z.want[1]*p.dy===0&&pcOpen(p.tx+Z.want[0],p.ty+Z.want[1])){p.dx=Z.want[0];p.dy=Z.want[1];Z.want=null;if(p.dx)p.face=p.dx;}
    p.p+=sp;
    if(p.p>=1){
      p.tx=wrap(p.tx+p.dx,p.ty);p.ty+=p.dy;p.p=0;
      eatHere(p);
      const eatN=M.total-Z.left;
      if(!Z.treat&&(eatN===70||eatN===170)&&Z.eaten<2){Z.treat={x:M.sx,y:M.sy,t:600};Z.eaten++;}
      if(Z.treat&&p.tx===Z.treat.x&&p.ty===Z.treat.y){const pts=[100,300,500,700,1000][M.treat];Z.score+=pts;pop(p.tx+.5,.9,p.ty+.5,'+'+pts,'#ffd84a');burst(p.tx+.5,.5,p.ty+.5,'#ffd84a',14);Z.treat=null;}
      if(Z.left<=0){pcWin();return;}
      if(Z.want&&pcOpen(p.tx+Z.want[0],p.ty+Z.want[1])){p.dx=Z.want[0];p.dy=Z.want[1];Z.want=null;}
      else if(!pcOpen(p.tx+p.dx,p.ty+p.dy)){p.dx=0;p.dy=0;}
      if(p.dx)p.face=p.dx;
    }
  }
  if(Z.treat){Z.treat.t--;if(Z.treat.t<=0)Z.treat=null;}
  // ghosts
  const ppos=pcPos(p);
  Z.gh.forEach((g,n)=>{
    g.tm++;
    if(g.mode==='house'){if(g.tm>g.delay)g.mode='leave';g.ty=M.hy+Math.round(Math.sin(g.tm*.15));return;}
    const spd=M.gsp*(g.mode==='fright'?.6:g.mode==='eyes'?2.2:1);
    if(Z.fr<=0&&g.mode==='fright')g.mode='chase';
    if(g.mode==='leave'){g.mode='chase';g.dx=0;g.dy=0;g.p=0;g.tx=M.hx;g.ty=M.hy-2;if(!pcOpen(g.tx,g.ty))g.ty=M.hy;}
    if(g.dx===0&&g.dy===0)ghostPick(g,n);
    g.p+=spd;
    if(g.p>=1){g.tx=wrap(g.tx+g.dx,g.ty);g.ty+=g.dy;g.p=0;
      if(g.mode==='eyes'&&g.tx===M.hx&&g.ty===M.hy){g.mode='house';g.tm=0;g.delay=60;g.dx=0;g.dy=0;}else ghostPick(g,n);}
    const gp=pcPos(g);
    if(Math.hypot(gp[0]-ppos[0],gp[1]-ppos[1])<.62&&g.mode!=='eyes'&&g.mode!=='house'){
      if(g.mode==='fright'){g.mode='eyes';Z.combo++;const pts=200*Math.pow(2,Math.min(3,Z.combo-1));Z.score+=pts;
        pop(gp[0]+.5,1,gp[1]+.5,'+'+pts,'#6ee7ff');burst(gp[0]+.5,.5,gp[1]+.5,ghostCol(g.v),16);ring(gp[0]+.5,.15,gp[1]+.5,'#6ee7ff');}
      else{p.dead=70;shake=.6;flash('#ff4d6d');burst(ppos[0]+.5,.6,ppos[1]+.5,'#ff4d6d',18);}
    }
  });
}

// ---------- three.js scene ----------
const cvs=$('c');
const R3=new THREE.WebGLRenderer({canvas:cvs,antialias:true});
R3.setPixelRatio(Math.min(1.5,devicePixelRatio));R3.shadowMap.enabled=true;R3.shadowMap.type=THREE.PCFShadowMap;
R3.toneMapping=THREE.ACESFilmicToneMapping;R3.toneMappingExposure=1.08;
const scene=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(46,1,.1,150);
const CX=W/2,CZ=H/2;
function gradTex(a,b){const c=document.createElement('canvas');c.width=4;c.height=256;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,a);gr.addColorStop(1,b);g.fillStyle=gr;g.fillRect(0,0,4,256);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
scene.background=gradTex(TH.sky[0],TH.sky[1]);
scene.fog=new THREE.Fog(TH.sky[1],26,56);

scene.add(new THREE.HemisphereLight(TH.sky[1],TH.side2,1.15));
const sun=new THREE.DirectionalLight('#fff1d6',1.9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-19,right:19,top:19,bottom:-19,near:1,far:70});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.0008;
sun.position.set(CX-9,22,CZ+12);sun.target.position.set(CX,0,CZ);scene.add(sun,sun.target);
const rim=new THREE.DirectionalLight(TH.acc,.7);rim.position.set(CX+14,8,CZ-16);scene.add(rim);
const catLight=new THREE.PointLight('#ffe2b0',1.6,8,2);scene.add(catLight);

// ground beyond the maze
const ground=new THREE.Mesh(new THREE.PlaneGeometry(240,240),new THREE.MeshStandardMaterial({color:TH.side2,roughness:.95}));
ground.rotation.x=-Math.PI/2;ground.position.set(CX,-.6,CZ);ground.receiveShadow=true;scene.add(ground);

// floor texture: tiles, tunnel tint, house tint
const S=32;
function floorTex(){
  const c=document.createElement('canvas');c.width=W*S;c.height=H*S;const g=c.getContext('2d');
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const X=x*S,Y=y*S;
    if(M.g[y][x]==='#'){g.fillStyle=TH.side;g.fillRect(X,Y,S,S);continue;}
    const house=Math.abs(x-M.hx)<=2&&Math.abs(y-M.hy)<=1;
    g.fillStyle=house?TH.r1:((x+y)%2?TH.floor:TH.side);
    if(!house&&(x+y)%2===0)g.fillStyle=TH.floor;
    if(!house&&(x+y)%2===1)g.fillStyle=TH.floor+'ee';
    g.fillRect(X,Y,S,S);
    g.fillStyle='rgba(255,255,255,.16)';g.fillRect(X,Y,S,1);g.fillRect(X,Y,1,S);
    if(M.tunnel&&y===M.hy){g.fillStyle=TH.acc+'66';g.fillRect(X,Y,S,S);}
    if(house){g.fillStyle=TH.acc+'55';g.fillRect(X+S*.4,Y+S*.9,S*.2,S*.1);}
  }
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
const floor=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshStandardMaterial({map:floorTex(),roughness:.85}));
floor.rotation.x=-Math.PI/2;floor.position.set(CX,0,CZ);floor.receiveShadow=true;scene.add(floor);

// walls (instanced) + lighter caps
const wallTiles=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(M.g[y][x]==='#')wallTiles.push([x,y]);
const wallM=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.6}),wallTiles.length);
const capM=new THREE.InstancedMesh(new THREE.BoxGeometry(1.02,.12,1.02),new THREE.MeshStandardMaterial({color:TH.r1,roughness:.5}),wallTiles.length);
wallM.castShadow=true;wallM.receiveShadow=true;capM.receiveShadow=true;capM.castShadow=true;
const DM=new THREE.Object3D();const wc=new THREE.Color(TH.wall);
wallTiles.forEach(([x,y],i)=>{
  DM.position.set(x+.5,.5,y+.5);DM.scale.set(1,1,1);DM.updateMatrix();wallM.setMatrixAt(i,DM.matrix);
  wallM.setColorAt(i,new THREE.Color(TH.wall).offsetHSL(0,0,(hsh(x*7.1+y*13.3)-.5)*.07));
  DM.position.set(x+.5,1.06,y+.5);DM.updateMatrix();capM.setMatrixAt(i,DM.matrix);
  capM.setColorAt(i,new THREE.Color(TH.r1).offsetHSL(0,0,(hsh(y*5.7+x*3.1)-.5)*.05));
});
wallM.instanceMatrix.needsUpdate=true;capM.instanceMatrix.needsUpdate=true;
if(wallM.instanceColor)wallM.instanceColor.needsUpdate=true;if(capM.instanceColor)capM.instanceColor.needsUpdate=true;
scene.add(wallM,capM);

// kibble (instanced) and catnip
const kibTiles=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(M.pel[y][x]===1)kibTiles.push([x,y]);
const kibM=new THREE.InstancedMesh(new THREE.SphereGeometry(.1,10,8),new THREE.MeshStandardMaterial({color:'#ffc857',emissive:'#ff9a2a',emissiveIntensity:.3,roughness:.35}),kibTiles.length);
const kIdx={};const ZERO=new THREE.Matrix4().makeScale(0,0,0);
kibTiles.forEach(([x,y],i)=>{kIdx[y*W+x]=i;DM.position.set(x+.5,.14,y+.5);DM.scale.set(1,.6,1.3);DM.rotation.set(0,0,0);DM.updateMatrix();kibM.setMatrixAt(i,DM.matrix);});
kibM.instanceMatrix.needsUpdate=true;kibM.castShadow=true;scene.add(kibM);
function hideKib(x,y){const i=kIdx[y*W+x];if(i!==undefined){kibM.setMatrixAt(i,ZERO);kibM.instanceMatrix.needsUpdate=true;}}
const nipMesh={};
const nipGeo=new THREE.IcosahedronGeometry(.22,1);
for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(M.pel[y][x]===2){
  const m=new THREE.Mesh(nipGeo,new THREE.MeshStandardMaterial({color:'#9fe870',emissive:'#9fe870',emissiveIntensity:.7,roughness:.3}));
  m.position.set(x+.5,.42,y+.5);m.castShadow=true;scene.add(m);nipMesh[y*W+x]=m;}

// treats
function mkTreat(k){
  const g=new THREE.Group();const mat=(c,e)=>new THREE.MeshStandardMaterial({color:c,emissive:e||c,emissiveIntensity:.25,roughness:.4});
  if(k===0){const b=new THREE.Mesh(new THREE.SphereGeometry(.3,16,12),mat('#7fd0ff'));b.scale.set(1.3,.8,.9);g.add(b);
    const t=new THREE.Mesh(new THREE.ConeGeometry(.18,.3,4),mat('#5aa8e0'));t.rotation.z=Math.PI/2;t.position.x=-.42;g.add(t);
    const e=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshBasicMaterial({color:'#111'}));e.position.set(.2,.08,.22);g.add(e);}
  else if(k===1){g.add(new THREE.Mesh(new THREE.BoxGeometry(.4,.5,.4),mat('#ffffff')));const st=new THREE.Mesh(new THREE.BoxGeometry(.42,.14,.42),mat('#6ec8ff'));st.position.y=0;g.add(st);}
  else if(k===2){const b=new THREE.Mesh(new THREE.TorusGeometry(.26,.12,10,20),mat('#ffb3d1'));b.rotation.x=Math.PI/2;g.add(b);}
  else if(k===3){const c=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.2,20),mat('#dfe6ff','#9aa4c0'));g.add(c);}
  else {g.add(new THREE.Mesh(new THREE.OctahedronGeometry(.32,0),mat('#ff77b7','#ff4f9a')));}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
  return g;
}
let treatObj=null,treatRef=null;

// dust motes + star field
const moteG=new THREE.BufferGeometry();const mp=new Float32Array(120*3);
for(let i=0;i<120;i++){mp[i*3]=CX+(Math.random()-.5)*W;mp[i*3+1]=.5+Math.random()*4;mp[i*3+2]=CZ+(Math.random()-.5)*H;}
moteG.setAttribute('position',new THREE.BufferAttribute(mp,3));
const motes=new THREE.Points(moteG,new THREE.PointsMaterial({color:TH.acc,size:.09,transparent:true,opacity:.7,depthWrite:false}));scene.add(motes);
const sg=new THREE.BufferGeometry();const sp2=new Float32Array(180*3);
for(let i=0;i<180;i++){const a=Math.random()*6.283,b=Math.random()*1.2+.2,r=60;sp2[i*3]=CX+Math.cos(a)*r*Math.cos(b);sp2[i*3+1]=20+Math.sin(b)*r*.6;sp2[i*3+2]=CZ+Math.sin(a)*r*Math.cos(b);}
sg.setAttribute('position',new THREE.BufferAttribute(sp2,3));
scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:'#ffffff',size:.5,transparent:true,opacity:.55,depthWrite:false})));

// ghosts (dog-like blobs with eyes)
function ghostCol(v){return new THREE.Color().setHSL(Math.floor(hsh(v*3.7+1)*360)/360,.75,.6);}
function mkGhost(v){
  const g=new THREE.Group();const base=ghostCol(v);
  const mat=new THREE.MeshStandardMaterial({color:base,roughness:.4,emissive:base,emissiveIntensity:.15});
  const dome=new THREE.Mesh(new THREE.SphereGeometry(.36,18,12,0,Math.PI*2,0,Math.PI/2),mat);dome.position.y=.36;dome.castShadow=true;g.add(dome);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.36,18,1,true),mat);body.position.y=.18;body.castShadow=true;g.add(body);
  const skirt=[];for(let s=0;s<4;s++){const k=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),mat);k.position.set(Math.cos(s*1.57+.8)*.26,.02,Math.sin(s*1.57+.8)*.26);g.add(k);skirt.push(k);}
  const eyes=[];for(const sx of [-1,1]){
    const w=new THREE.Mesh(new THREE.SphereGeometry(.1,10,8),new THREE.MeshBasicMaterial({color:'#ffffff'}));w.position.set(sx*.13,.42,-.3);w.scale.set(1,1.2,.6);g.add(w);
    const pu=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshBasicMaterial({color:'#101018'}));pu.position.set(sx*.13,.4,-.37);g.add(pu);eyes.push(w,pu);}
  g.userData={dome,body,skirt,mat,base,eyes};
  scene.add(g);return g;
}
const ghObjs=Z.gh.map(g=>mkGhost(g.v));

// catnip cat
const catRoot=new THREE.Group();catRoot.add(makeCat(selectedCat()));scene.add(catRoot);
const catBase=1;

// ---------- sizing / camera ----------
function resize(){R3.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
const camGoal=new THREE.Vector3(),camShake=new THREE.Vector3();let camInit=false;

// ---------- frame ----------
let shownScore=-1,shownLives=-1,shownBest=-1,shownLeft=-1;
function hud(){
  if(Z.score!==shownScore){shownScore=Z.score;$('sc').textContent=Z.score;}
  const best=Math.max(BEST,Z.score);if(best!==shownBest||Z.left!==shownLeft){shownBest=best;shownLeft=Z.left;$('best').textContent='best '+best+' · 🐟 '+Z.left;}
  if(Z.lives!==shownLives){shownLives=Z.lives;$('lives').textContent='♥'.repeat(Math.max(0,Z.lives))+'♡'.repeat(Math.max(0,3-Z.lives));}
  if(bumpLives){bumpLives=false;const el=$('lives');el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');}
}
function frameFx(now){
  // particles
  for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.m.position.x+=q.vx;q.m.position.y+=q.vy;q.m.position.z+=q.vz;q.vy-=.006;q.l--;
    q.m.scale.setScalar(Math.max(.05,q.l/40));if(q.l<=0){scene.remove(q.m);parts.splice(i,1);}}
  for(let i=rings.length-1;i>=0;i--){const r=rings[i];r.t++;const s=1+r.t*.06;r.m.scale.set(s,s,s);r.m.material.opacity=.9*(1-r.t/30);if(r.t>=30){scene.remove(r.m);rings.splice(i,1);}}
  // pops (DOM text projected from world space)
  const hw=innerWidth/2,hh=innerHeight/2;
  for(let i=pops.length-1;i>=0;i--){const q=pops[i];q.t++;const v=new THREE.Vector3(q.x,q.y+q.t*.01,q.z).project(cam);
    q.el.style.transform=`translate(${(v.x*hw+hw).toFixed(1)}px,${(-v.y*hh+hh-q.t*.6).toFixed(1)}px) translate(-50%,-50%)`;
    q.el.style.opacity=String(Math.max(0,1-q.t/55));if(q.t>=55){q.el.remove();pops.splice(i,1);}}
  // dust
  motes.rotation.y=now*.00005;
}
let rX=null,rZ=null;
function render(now){
  const p=Z.p,[px,pz]=pcPos(p);
  // ease the drawn position so corner cuts glide instead of snapping (teleports still snap)
  let tx=px+.5,tz=pz+.5;
  if(rX===null||Math.hypot(tx-rX,tz-rZ)>2){rX=tx;rZ=tz;}else{rX+=(tx-rX)*.35;rZ+=(tz-rZ)*.35;}
  tx=rX;tz=rZ;
  const dead=p.dead>0,a=dead?1-p.dead/70:0;
  const moving=(p.dx||p.dy)&&!dead&&Z.ready<=0&&!Z.over;
  const hop=Z.over==='win'?Math.abs(Math.sin(now*.008))*.55:(moving?Math.abs(Math.sin(now*.025))*.07:0);
  catRoot.position.set(tx,(dead?-a*.25:0)+hop,tz);
  if(p.dx||p.dy)catRoot.rotation.y=Math.atan2(-p.dx,-p.dy);
  catRoot.rotation.z=dead?a*7:0;
  catRoot.scale.setScalar(dead?Math.max(.05,1-a):catBase);
  catLight.position.set(tx,2.6,tz);
  // ghosts
  Z.gh.forEach((g,n)=>{const o=ghObjs[n],[gx,gz]=pcPos(g),ud=o.userData;
    o.position.set(gx+.5,.04*Math.abs(Math.sin(Z.t*.12+n)),gz+.5);
    if(g.dx||g.dy)o.rotation.y=Math.atan2(-g.dx,-g.dy);
    const eyesOnly=g.mode==='eyes';ud.dome.visible=ud.body.visible=!eyesOnly;ud.skirt.forEach(k=>k.visible=!eyesOnly);
    const fr=g.mode==='fright',fl=fr&&Z.fr<90&&Math.floor(Z.t/8)%2;
    ud.mat.color.copy(fr?(fl?new THREE.Color('#ffffff'):new THREE.Color('#3a5cff')):ud.base);
    ud.mat.emissive.copy(ud.mat.color);ud.mat.emissiveIntensity=fr?.35:.15;
    ud.skirt.forEach((k,s)=>{k.position.y=.02+Math.abs(Math.sin(Z.t*.2+s))*.05;});
    o.visible=!(g.mode==='house'&&false);
  });
  // nips pulse
  for(const k in nipMesh){const m=nipMesh[k];if(!m.visible)continue;const s=1+Math.sin(now*.006+(+k))*.12;m.scale.setScalar(s);m.rotation.y=now*.002;}
  // treat
  if(Z.treat!==treatRef){treatRef=Z.treat;if(treatObj){scene.remove(treatObj);treatObj=null;}if(Z.treat){treatObj=mkTreat(M.treat);scene.add(treatObj);}}
  if(treatObj&&Z.treat){treatObj.position.set(Z.treat.x+.5,.6+Math.sin(now*.004)*.08,Z.treat.y+.5);treatObj.rotation.y=now*.003;
    if(Z.treat.t<120)treatObj.visible=Math.floor(Z.treat.t/6)%2===0;else treatObj.visible=true;}
  // catnip glow on cat
  if(Z.fr>0&&!dead){catLight.color.set('#c08bff');catLight.intensity=2.2;}else{catLight.color.set('#ffe2b0');catLight.intensity=1.6;}
  // camera chase with zoom for tall screens and shake on hit
  const zoom=Math.max(1,1.25/cam.aspect);
  camGoal.set(tx,12.5*zoom,tz+9.5*zoom);
  if(!camInit){cam.position.copy(camGoal);camInit=true;}else cam.position.lerp(camGoal,.1);
  if(shake>0){shake*=.88;if(shake<.01)shake=0;}
  camShake.set((Math.random()-.5)*shake,(Math.random()-.5)*shake,(Math.random()-.5)*shake);
  cam.position.add(camShake);
  cam.lookAt(tx,.3,tz-1.2);
  R3.render(scene,cam);
}
let acc=0,last=performance.now(),lastCat=null;
function loop(now){
  const dt=Math.min(.1,(now-last)/1000);last=now;acc+=dt;
  let n=0;while(acc>=1/60&&n<4){tick();acc-=1/60;n++;}
  if(n>=4)acc=0;
  if(Z.over==='win'&&Z.t%7===0)burst(Z.p.tx+.5,1,Z.p.ty+.5,['#ffd84a','#ff77b7','#7fe3ff','#9be564'][Z.t%4],6);
  frameFx(now);render(now);hud();
  requestAnimationFrame(loop);
}
pcReset();
requestAnimationFrame(loop);

/* ===== polish pass: visuals + feel (rules untouched) ===== */
// warm gold flash + confetti on a cleared maze
const _pcWin=pcWin;
pcWin=function(){const was=Z.over;_pcWin();if(!was&&Z.over==='win'){flash('#ffd84a');for(const c of ['#ffd84a','#ff77b7','#7fe3ff','#9be564'])burst(Z.p.tx+.5,1.2,Z.p.ty+.5,c,12);}};
// catnip: a little pop when a ghost is eaten and a ring on the cat
const _eat=eatHere;
eatHere=function(p){const before=Z.score;_eat(p);if(Z.score-before>=50)ring(p.tx+.5,.1,p.ty+.5,'#c08bff');};
// extras loop: trail, treat spawn ring, catnip tint, kibble pulse, motes bob
let lastTreat=null,trailT=0,lastScore=0,puls=0;
const vigEl=document.getElementById('vig');
const scEl=document.getElementById('sc');
function extras(now){
  const t=now/1000,dt=1/60;
  // treat appears: ring on the spawn tile
  if(Z.treat&&Z.treat!==lastTreat)ring(Z.treat.x+.5,.1,Z.treat.y+.5,'#ffd84a');
  lastTreat=Z.treat;
  // catnip tint on the vignette
  vigEl.style.background=Z.fr>0?'radial-gradient(ellipse at center,transparent 50%,rgba(140,80,255,.55))':'radial-gradient(ellipse at center,transparent 55%,rgba(8,4,20,.75))';
  // kibble gentle glow pulse
  kibM.material.emissiveIntensity=.25+.2*Math.sin(t*3);
  // motes drift up and down
  motes.position.y=Math.sin(t*.5)*.4;
  // light trail behind the cat while moving
  const p=Z.p;
  if(!p.dead&&(p.dx||p.dy)&&!Z.over&&Z.ready<=0){trailT+=dt;if(trailT>.09){trailT=0;const [px,pz]=pcPos(p);burst(px+.5,.12,pz+.5,TH.acc,1);}}
  // score punch
  if(Z.score!==lastScore){lastScore=Z.score;scEl.style.transition='none';scEl.style.transform='scale(1.2)';requestAnimationFrame(()=>{scEl.style.transition='transform .25s';scEl.style.transform='scale(1)';});}
  // frightened ghosts: a soft pulse on the vignette
  if(Z.fr>0&&Z.fr<90){puls=(puls+1)%20;}
  requestAnimationFrame(extras);
}
requestAnimationFrame(extras);
