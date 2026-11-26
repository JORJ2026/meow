import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {selectedCat} from './char3d.js';
const $=id=>document.getElementById(id);
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const LANES=[-2,0,2];

// ---------- renderer / scene ----------
const R=new THREE.WebGLRenderer({canvas:$('c'),antialias:true});
R.setPixelRatio(Math.min(devicePixelRatio,1.5));
R.outputColorSpace=THREE.SRGBColorSpace;
R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFShadowMap;

const C={dayTop:new THREE.Color('#3f93de'),dayHor:new THREE.Color('#ffe3b3'),dayFog:new THREE.Color('#ffd9a6'),
  duskTop:new THREE.Color('#4a3380'),duskHor:new THREE.Color('#ff9f72'),duskFog:new THREE.Color('#e9957f')};
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(C.dayFog.clone(),24,140);
const cam=new THREE.PerspectiveCamera(62,1,.1,260);
scene.add(cam);
const skyU={top:{value:C.dayTop.clone()},hor:{value:C.dayHor.clone()}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(200,24,16),new THREE.ShaderMaterial({
  side:THREE.BackSide,depthWrite:false,uniforms:skyU,
  vertexShader:'varying vec3 vp;void main(){vp=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform vec3 top;uniform vec3 hor;varying vec3 vp;void main(){float h=clamp(normalize(vp).y*1.8,0.0,1.0);gl_FragColor=vec4(mix(hor,top,pow(h,0.6)),1.0);\n#include <colorspace_fragment>\n}'}));
sky.frustumCulled=false;scene.add(sky);

function size(){R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.fov=cam.aspect<1?Math.min(88,2*Math.atan(Math.tan(62*Math.PI/360)/cam.aspect*.85)*180/Math.PI):62;cam.updateProjectionMatrix();}
addEventListener('resize',size);size();

// ---------- lights ----------
scene.add(new THREE.HemisphereLight('#fff4e4','#7a5a3a',1.5));
const sun=new THREE.DirectionalLight('#ffe7b8',2.2);
sun.position.set(-6,14,8);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-11,right:11,top:11,bottom:-11,near:1,far:60});
sun.shadow.bias=-.0008;
scene.add(sun,sun.target);

// ---------- textures ----------
function tex(w,h,fn,rep){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);t.anisotropy=4;return t;}
function radial(inner,outer){return tex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);gr.addColorStop(0,inner);gr.addColorStop(1,outer);g.fillStyle=gr;g.fillRect(0,0,w,h);});}
const stoneT=tex(256,256,(g,w,h)=>{
  g.fillStyle='#c98f52';g.fillRect(0,0,w,h);
  for(let r=0;r<4;r++)for(let c=0;c<4;c++){const sh=(r%2)*32,x=c*64-sh,y=r*64,v=rnd(-12,12);
    g.fillStyle='rgb('+(212+v)+','+(160+v)+','+(102+v)+')';g.beginPath();g.roundRect(x+3,y+3,58,58,10);g.fill();}
  g.strokeStyle='rgba(90,60,30,.35)';g.lineWidth=2;
  for(let i=0;i<8;i++){g.beginPath();let x=Math.random()*w,y=Math.random()*h;g.moveTo(x,y);for(let k=0;k<4;k++){x+=rnd(-14,14);y+=rnd(-14,14);g.lineTo(x,y);}g.stroke();}
  for(let i=0;i<34;i++){g.fillStyle='rgba(110,150,60,'+rnd(.15,.4)+')';g.beginPath();g.arc(Math.random()*w,Math.random()*h,rnd(3,9),0,7);g.fill();}
},[1,40]);
const grassT=tex(256,256,(g,w,h)=>{
  g.fillStyle='#8fcf5a';g.fillRect(0,0,w,h);
  for(let i=0;i<500;i++){g.strokeStyle=Math.random()<.5?'rgba(60,120,40,.5)':'rgba(200,240,120,.35)';g.lineWidth=1.5;const x=Math.random()*w,y=Math.random()*h;g.beginPath();g.moveTo(x,y);g.lineTo(x+rnd(-3,3),y-rnd(3,7));g.stroke();}
},[70,70]);
const fluteT=tex(128,128,(g,w,h)=>{
  g.fillStyle='#f0e4c8';g.fillRect(0,0,w,h);
  for(let x=0;x<w;x+=16){g.fillStyle='rgba(120,90,50,.28)';g.fillRect(x,0,5,h);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x+8,0,3,h);}
});
const barkT=tex(128,128,(g,w,h)=>{
  g.fillStyle='#7a4a24';g.fillRect(0,0,w,h);
  for(let i=0;i<26;i++){g.strokeStyle='rgba(40,20,8,.45)';g.lineWidth=rnd(1,3);const x=rnd(0,w);g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+rnd(-6,6),h*.3,x+rnd(-6,6),h*.7,x,h);g.stroke();}
});
const gateT=tex(64,64,(g,w,h)=>{g.fillStyle='#fff6e6';g.fillRect(0,0,w,h);g.fillStyle='#d1452f';g.fillRect(0,0,w,h/2);});
const furT=tex(256,256,(g,w,h)=>{
  g.fillStyle='#f29a4d';g.fillRect(0,0,w,h);
  g.strokeStyle='#a9561f';g.lineWidth=10;
  for(let i=0;i<14;i++){const x=i*20+rnd(-4,4);g.globalAlpha=.6;g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+rnd(-18,18),h*.3,x+rnd(-18,18),h*.7,x+rnd(-8,8),h);g.stroke();}
  g.globalAlpha=1;
});
const blobT=radial('rgba(20,8,0,.7)','rgba(20,8,0,0)');
const glowT=radial('rgba(255,255,255,1)','rgba(255,255,255,0)');
const std=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.85},o));
const mesh=(geo,mat,p=[0,0,0],parent,cast=true)=>{const m=new THREE.Mesh(geo,mat);m.position.set(p[0],p[1],p[2]);m.castShadow=cast;m.receiveShadow=true;(parent||scene).add(m);return m;};

// ---------- world ----------
const ground=new THREE.Mesh(new THREE.PlaneGeometry(500,500),std('#ffffff',{map:grassT}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
const path=new THREE.Mesh(new THREE.PlaneGeometry(6.4,170),std('#ffffff',{map:stoneT}));
path.rotation.x=-Math.PI/2;path.position.set(0,.01,-70);path.receiveShadow=true;scene.add(path);
const curbM=std('#e8c08a',{roughness:.7});
for(const x of [-3.4,3.4])mesh(new THREE.BoxGeometry(.4,.35,170),curbM,[x,.17,-70]);
const river=new THREE.Mesh(new THREE.PlaneGeometry(8,170),std('#4fb3d9',{roughness:.2,metalness:.1}));
river.rotation.x=-Math.PI/2;river.position.set(15,.02,-70);scene.add(river);

// distant mountains
for(let i=0;i<10;i++){const h=rnd(40,62);const m=new THREE.Mesh(new THREE.ConeGeometry(rnd(20,28),h,6),std(i%2?'#7d6aa6':'#5e5290',{flatShading:true,roughness:1}));m.position.set(-130+i*30+rnd(-6,6),h/2-6,-150);scene.add(m);}

// sun + clouds
const sunGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,color:'#ffe9a6',transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
sunGlow.position.set(-30,28,-120);sunGlow.scale.set(42,42,1);scene.add(sunGlow);
const sunHalo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,color:'#ffd27a',transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));
sunHalo.position.copy(sunGlow.position);sunHalo.scale.set(110,110,1);scene.add(sunHalo);
const clouds=[];
for(let i=0;i<9;i++){const g=new THREE.Group();const n=3+Math.floor(Math.random()*3);
  for(let k=0;k<n;k++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,color:'#ffffff',transparent:true,opacity:.7,depthWrite:false}));s.position.set(k*4-n*2,rnd(-.5,.8),rnd(-1,1));s.scale.set(rnd(7,11),rnd(4,6),1);g.add(s);}
  g.position.set(rnd(-70,70),rnd(16,22),rnd(-60,-120));scene.add(g);clouds.push({g,sp:rnd(.6,1.6)});}

// temple pillars, torches, trees, rocks, bushes
const stoneM=std('#e9dcc0',{roughness:.9});
const fluteM=std('#ffffff',{map:fluteT,roughness:.9});
const torchM=std('#5a3a1e');
const flameM=new THREE.MeshBasicMaterial({color:'#ffb24a'});
const flames=[];
const trunkM=std('#6b4324');
const leafCols=['#3f9a4a','#4eab55','#2f7f3f','#5bb35e'];
const rockM=std('#8a8074',{roughness:1,flatShading:true});
const bushM=std('#56b04e',{flatShading:true});
function makePillar(broken,torch){
  const g=new THREE.Group();
  mesh(new THREE.BoxGeometry(1.3,.5,1.3),stoneM,[0,.25,0],g);
  const h=broken?2.2:4;
  mesh(new THREE.CylinderGeometry(.42,.48,h,14),fluteM,[0,.5+h/2,0],g);
  if(!broken)mesh(new THREE.BoxGeometry(1.1,.3,1.1),stoneM,[0,.5+h+.15,0],g);
  else mesh(new THREE.DodecahedronGeometry(.45,0),stoneM,[.2,.5+h+.1,0],g).scale.set(1,.7,1);
  if(torch){
    mesh(new THREE.CylinderGeometry(.05,.05,.7,6),torchM,[.45,h+.85,.45],g);
    const f=mesh(new THREE.ConeGeometry(.16,.4,6),flameM,[.45,h+1.35,.45],g,false);
    const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,color:'#ffb24a',transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    gl.position.set(.45,h+1.35,.45);gl.scale.set(2.2,2.2,1);g.add(gl);
    flames.push({f,gl,ph:rnd(0,6)});
  }
  return g;
}
function makeTree(){
  const g=new THREE.Group();
  mesh(new THREE.CylinderGeometry(.18,.25,1.6,8),trunkM,[0,.8,0],g);
  [[1.3,1.6,2.1],[1,1.3,2.9],[.6,1,3.5]].forEach(([r,h,y],i)=>mesh(new THREE.ConeGeometry(r,h,7),std(pick(leafCols),{flatShading:true,roughness:1}),[0,y,0],g));
  return g;
}
function makeRock(){const m=mesh(new THREE.DodecahedronGeometry(rnd(.6,1.1),0),rockM,[0,.4,0]);m.scale.set(rnd(.9,1.4),rnd(.6,.9),rnd(.8,1.2));m.rotation.set(rnd(0,3),rnd(0,3),0);const g=new THREE.Group();g.add(m);return g;}
function makeBush(){const g=new THREE.Group();mesh(new THREE.IcosahedronGeometry(.6,0),bushM,[0,.3,0],g).scale.set(1.2,.8,1.1);mesh(new THREE.IcosahedronGeometry(.4,0),bushM,[.5,.22,.2],g);return g;}
const decor=[];
function addDecor(side,i){
  const r=Math.random();let g,x;
  if(r<.38){g=makePillar(Math.random()<.45,Math.random()<.4);x=side*5.2;}
  else if(r<.66){g=makeTree();x=side*rnd(7,18);}
  else if(r<.84){g=makeRock();x=side*rnd(5.5,9);}
  else{g=makeBush();x=side*rnd(4.6,11);}
  g.position.set(x,0,-i*11-rnd(0,4));scene.add(g);decor.push(g);
}
for(const side of [-1,1])for(let i=0;i<18;i++)addDecor(side,i);

// obstacles & coins
const barkEnd=std('#c9a06a');
const logM=[barkT?std('#ffffff',{map:barkT}):null,barkEnd,barkEnd];
const gateMat=std('#ffffff',{map:gateT});
const postM=std('#5b3a1f');
const lanternM=new THREE.MeshStandardMaterial({color:'#ffcf6b',emissive:'#ff9a2a',emissiveIntensity:1.2});
const coinM=new THREE.MeshStandardMaterial({color:'#ffd34a',metalness:.8,roughness:.3,emissive:'#5a3b00',emissiveIntensity:.4});
const coinGlowM=new THREE.SpriteMaterial({map:glowT,color:'#fff1a0',transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false});
const coinGeo=new THREE.CylinderGeometry(.24,.24,.07,20);coinGeo.rotateX(Math.PI/2);
function makeObstacle(type){
  const g=new THREE.Group();
  if(type==='low'){
    if(Math.random()<.5){const m=mesh(new THREE.CylinderGeometry(.45,.45,1.4,14),logM,[0,.45,0],g);m.rotation.z=Math.PI/2;}
    else{const m=mesh(new THREE.DodecahedronGeometry(.6,0),rockM,[0,.45,0],g);m.scale.set(1.1,.85,.9);m.rotation.set(rnd(0,1),rnd(0,1),0);}
  }else{
    mesh(new THREE.BoxGeometry(1.4,.6,.4),gateMat,[0,1.4,0],g);
    for(const sx of [-.6,.6])mesh(new THREE.BoxGeometry(.25,1.1,.25),postM,[sx,.55,0],g);
    for(const sx of [-.55,.55])mesh(new THREE.SphereGeometry(.18,12,10),lanternM,[sx,1.8,0],g,false);
  }
  return g;
}
function makeCoin(){const g=new THREE.Group();const d=new THREE.Mesh(coinGeo,coinM);d.position.y=1;d.castShadow=true;g.add(d);const s=new THREE.Sprite(coinGlowM.clone());s.position.y=1;s.scale.set(.9,.9,1);g.add(s);g.userData.disc=d;return g;}
let items=[];
function spawnItem(type,ln,z){
  const m=type==='coin'?makeCoin():makeObstacle(type);
  if(type==='low')m.position.y=0;
  m.position.x=LANES[ln];m.position.z=z;scene.add(m);
  items.push({m,type,ln,z,dead:false});
}

// leaves
const leafGeo=new THREE.PlaneGeometry(.22,.13);
const leafCols2=['#e8862e','#d9552b','#f2c14e','#9bc53d'];
const leaves=[];
function resetLeaf(v,m,init){m.position.set(rnd(-7,7),init?rnd(0,7):rnd(3,7),rnd(-40,-3));v.vy=rnd(.6,1.4);v.ph=rnd(0,6.3);v.sp=rnd(1,3);}
for(let i=0;i<26;i++){const m=new THREE.Mesh(leafGeo,std(pick(leafCols2),{side:THREE.DoubleSide,roughness:.8}));scene.add(m);const v={};resetLeaf(v,m,true);leaves.push({m,v});}

// dust puffs
const dustGeo=new THREE.SphereGeometry(.3,10,8);
const dusts=[];
for(let i=0;i<22;i++){const m=new THREE.Mesh(dustGeo,new THREE.MeshBasicMaterial({color:'#f5e6c8',transparent:true,opacity:0,depthWrite:false}));m.visible=false;scene.add(m);dusts.push({m,life:1,max:1,vz:0});}
function puff(x,y,z,n,vz){let k=0;for(const d of dusts){if(k>=n)break;if(d.life<d.max)continue;d.life=0;d.max=rnd(.5,.8);d.vz=vz;d.m.position.set(x+rnd(-.2,.2),y,z);d.m.visible=true;k++;}}

// speed lines (attached to camera)
const lineMat=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:0,depthWrite:false});
const lineGeo=new THREE.BoxGeometry(.02,.02,1.4);
const lines=[];
for(let i=0;i<24;i++){const m=new THREE.Mesh(lineGeo,lineMat);m.position.set(rnd(-3,3),rnd(-1.6,1.6),rnd(-9,-3));cam.add(m);lines.push(m);}

// blob shadow under the cat
const blob=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.6),new THREE.MeshBasicMaterial({map:blobT,transparent:true,opacity:.5,depthWrite:false}));
blob.rotation.x=-Math.PI/2;blob.position.y=.02;scene.add(blob);

// ---------- cat ----------
const cat=new THREE.Group();scene.add(cat);
const body=new THREE.Group();cat.add(body);
const creamM=std('#fff1dc',{roughness:.9}),darkM=std('#241610'),pinkM=std('#ff8fa3'),redM=std('#d63a3a',{roughness:.6});
const furM=std('#ffffff',{map:furT,roughness:.9});
const whiteBasic=new THREE.MeshBasicMaterial({color:'#ffffff'});
const torso=mesh(new THREE.SphereGeometry(.5,22,16),furM,[0,.95,0],body);torso.scale.set(.82,.72,1.3);
mesh(new THREE.SphereGeometry(.42,18,12),creamM,[0,.8,-.12],body).scale.set(.7,.6,1.05);
const scarf=new THREE.Mesh(new THREE.TorusGeometry(.36,.09,10,24),redM);scarf.rotation.x=Math.PI/2;scarf.position.set(0,1.25,-.38);scarf.scale.set(1.05,1,1.1);body.add(scarf);
const headG=new THREE.Group();headG.position.set(0,1.42,-.66);body.add(headG);
const hd=(geo,mat,x,y,z)=>mesh(geo,mat,[x,y,z],headG);
hd(new THREE.SphereGeometry(.42,22,16),furM,0,0,0).scale.set(1.05,.92,1);
for(const s of [-1,1]){
  hd(new THREE.SphereGeometry(.14,12,10),creamM,s*.24,-.1,-.2);
  const ear=hd(new THREE.ConeGeometry(.17,.34,4),furM,s*.22,.42,0);ear.rotation.z=-s*.25;
  const inner=hd(new THREE.ConeGeometry(.09,.2,3),pinkM,s*.22,.4,.08);inner.rotation.z=-s*.25;
  const eye=hd(new THREE.SphereGeometry(.07,12,10),darkM,s*.16,.05,-.37);eye.scale.set(1,1.3,.5);
  hd(new THREE.SphereGeometry(.022,8,6),whiteBasic,s*.155,.085,-.4);
  for(let i=0;i<3;i++){const w=hd(new THREE.BoxGeometry(.42,.012,.012),whiteBasic,s*.3,-.08+i*.05,-.4);w.rotation.z=s*(-.2+i*.2);}
}
hd(new THREE.SphereGeometry(.045,10,8),pinkM,0,-.04,-.44).scale.set(1.3,.8,.8);
const tailRoot=new THREE.Group();tailRoot.position.set(0,.95,.6);body.add(tailRoot);
const tailSegs=[];let par=tailRoot;
for(let i=0;i<5;i++){const s=new THREE.Group();s.position.z=i?.2:0;par.add(s);const m=new THREE.Mesh(new THREE.SphereGeometry(.13-i*.012,12,10),furM);m.scale.set(1,1,1.2);m.castShadow=true;s.add(m);par=s;tailSegs.push(s);}
const legs=[];
for(const [x,z,ph] of [[-.27,-.42,0],[.27,-.42,Math.PI],[-.27,.42,Math.PI],[.27,.42,0]]){
  const hip=new THREE.Group();hip.position.set(x,.78,z);body.add(hip);
  const th=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.3,4,10),furM);th.position.y=-.2;th.castShadow=true;hip.add(th);
  const knee=new THREE.Group();knee.position.y=-.42;hip.add(knee);
  const sh=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.26,4,10),furM);sh.position.y=-.2;sh.castShadow=true;knee.add(sh);
  const paw=new THREE.Mesh(new THREE.SphereGeometry(.13,12,10),creamM);paw.scale.set(1,.6,1.4);paw.position.set(0,-.5,.05);paw.castShadow=true;knee.add(paw);
  legs.push({hip,knee,ph});
}

// ---------- state ----------
let lane=1,py=0,vy=0,slide=0,dist=0,speed=9,coins=0,over=true,nextD=20,grounded=true,squash=0,dustT=0,shake=0,deadT=0,deadSide=1,best=0,wasAir=false,T=0,ran=false;
try{best=+localStorage.getItem('cr3-best')||0;}catch(e){}
const score=()=>Math.floor(dist)+coins*10;
const hudSc=$('sc'),hudBest=$('bs'),ov=$('over'),fin=$('fin'),zz=$('zz');
function start(){
  for(const it of items)scene.remove(it.m);items=[];
  lane=1;py=0;vy=0;slide=0;dist=0;speed=9;coins=0;nextD=20;grounded=true;over=false;squash=0;ran=true;
  cat.rotation.z=0;body.rotation.set(0,0,0);body.scale.set(1,1,1);
  ov.classList.add('hide');
}
function die(){
  over=true;deadT=0;deadSide=Math.random()<.5?-1:1;shake=.6;
  puff(cat.position.x,.2,.4,8,0);
  const s=score();if(s>best){best=s;try{localStorage.setItem('cr3-best',best);}catch(e){}}
  hudBest.textContent=best;fin.textContent='SCORE '+s;
}
function move(d){if(!over)lane=Math.max(0,Math.min(2,lane+d));}
function jump(){if(over){if(deadT>.9)start();return;}if(grounded){vy=9.5;grounded=false;}}
function slideNow(){if(!over)slide=.7;}
function spawn(){
  const ln=Math.floor(Math.random()*3),r=Math.random();
  if(r<.4)spawnItem('low',ln,-60);else if(r<.65)spawnItem('bar',ln,-60);
  else for(let i=0;i<6;i++)spawnItem('coin',ln,-60-i*1.1);
}
function gameStep(dt){
  speed=Math.min(22,9+dist*.02);
  const d=speed*dt;dist+=d;
  stoneT.offset.y-=d/4;
  if(dist>nextD){spawn();nextD=dist+9+Math.random()*8;}
  for(const g of decor){g.position.z+=d;if(g.position.z>12)g.position.z-=198;}
  cat.position.x+=(LANES[lane]-cat.position.x)*Math.min(1,dt*14);
  vy-=28*dt;py+=vy*dt;
  if(py<=0){py=0;if(!grounded&&vy<0)squash=1;vy=0;grounded=true;}
  if(!grounded)wasAir=true;
  slide=Math.max(0,slide-dt);
  const h=slide>0?.9:1.6;
  // dust while running
  dustT-=dt;if(grounded&&dustT<=0){puff(cat.position.x+rnd(-.3,.3),.05,.6,1,speed*.12);dustT=.14;}
  for(const it of items){
    it.z+=d;it.m.position.z=it.z;
    if(it.type==='coin')it.m.userData.disc.rotation.y+=dt*4;
    if(it.dead||Math.abs(it.z)>.8||it.ln!==lane)continue;
    if(it.type==='coin'){coins++;it.dead=true;scene.remove(it.m);puff(LANES[lane],1,0,0,0);continue;}
    const [a,b]=it.type==='low'?[0,.9]:[1.1,1.7];
    if(py<b&&py+h>a){die();return;}
  }
  for(const it of items){if(it.z>8&&!it.dead){it.dead=true;scene.remove(it.m);}}
  items=items.filter(i=>!i.dead);
  hudSc.textContent=score();
}
function ambient(dt){
  for(const l of leaves){const m=l.m,v=l.v;
    m.position.y-=v.vy*dt;m.position.x+=Math.sin(T*v.sp+v.ph)*dt*.6;m.position.z+=speed*dt*.5;
    m.rotation.x+=dt*v.sp*3;m.rotation.z+=dt*2;
    if(m.position.y<0||m.position.z>4)resetLeaf(v,m,false);}
  for(const c of clouds){c.g.position.x+=dt*c.sp*.5;if(c.g.position.x>80)c.g.position.x=-80;}
  for(const d of dusts){if(d.life>=d.max)continue;d.life+=dt;const p=d.life/d.max;
    d.m.scale.setScalar(.4+p*1.3);d.m.material.opacity=(1-p)*.5;d.m.position.y+=dt*.6;d.m.position.z+=d.vz*dt;
    if(d.life>=d.max)d.m.visible=false;}
  for(const f of flames){const s=.85+.25*Math.sin(T*14+f.ph)+.1*Math.sin(T*23+f.ph*2);f.f.scale.set(s,s+.2*Math.sin(T*11+f.ph),s);f.gl.material.opacity=.7+.2*Math.sin(T*9+f.ph);}
}
function animateCat(dt){
  const ph=dist*2.2;
  for(const L of legs){
    if(grounded&&!over){L.hip.rotation.x=Math.sin(ph+L.ph)*.7;L.knee.rotation.x=Math.max(0,-Math.cos(ph+L.ph))*1.0;}
    else if(!over){L.hip.rotation.x=(L.ph?-.5:.25);L.knee.rotation.x=.9;}
    else{L.hip.rotation.x=0;L.knee.rotation.x=.2;}
  }
  headG.position.y=1.42+(grounded&&!over?Math.abs(Math.sin(ph))*.03:0);
  tailSegs.forEach((s,i)=>{s.rotation.y=Math.sin(T*5-i*.6)*.25*(i+1)/5;s.rotation.x=Math.sin(T*2-i*.5)*.08;});
  // squash & stretch
  squash=Math.max(0,squash-dt*5);
  const air=!grounded?Math.min(1,py/3):0;
  const sy=(slide>0?.55:1)*(1-.2*squash)*(1+.06*air);
  const sx=1+.12*squash-.04*air;
  body.scale.set(sx,sy,1);
  // death tumble
  if(over&&!ran){cat.rotation.z=-1.35;cat.position.y=.4+.02*Math.sin(T*2.4);body.scale.y=1+.03*Math.sin(T*2.4);}
  else if(over){cat.rotation.z=Math.min(1.2,deadT*4)*deadSide;cat.position.y=Math.max(0,py-deadT*2);}
  else{cat.rotation.z=0;cat.position.y=py;}
  // blob shadow reacts to height
  const bs=Math.max(.35,1-py*.2);blob.scale.setScalar(bs);blob.material.opacity=.5*bs;blob.position.x=cat.position.x;
}
function render(dt){
  T+=dt;
  if(!over)gameStep(dt);else deadT+=dt;
  ambient(dt);animateCat(dt);
  for(const it of items)if(it.type==='coin'){const s=1+.12*Math.sin(T*6+it.z);it.m.children[1].scale.setScalar(.9*s);}
  if(over&&ran&&deadT>.6)ov.classList.remove('hide');
  // sun follows the cat (shadows)
  sun.position.set(cat.position.x-6,14,8);sun.target.position.set(cat.position.x,0,-4);sun.target.updateMatrixWorld();
  // sky/fog drift toward dusk with distance
  const k=Math.min(1,dist/1800);
  skyU.top.value.lerpColors(C.dayTop,C.duskTop,k);skyU.hor.value.lerpColors(C.dayHor,C.duskHor,k);
  scene.fog.color.lerpColors(C.dayFog,C.duskFog,k);
  // camera: speed FOV, lane follow, shake
  const sp=Math.max(0,Math.min(1,(speed-9)/13));
  cam.fov+=((62+sp*12)-cam.fov)*Math.min(1,dt*4);cam.updateProjectionMatrix();
  lineMat.opacity=sp*.32;
  for(const m of lines){m.position.z+=dt*(speed*1.6);if(m.position.z>-1.2){m.position.z=-9;m.position.x=rnd(-3,3);m.position.y=rnd(-1.6,1.6);}}
  shake=Math.max(0,shake-dt*2.5);
  const sx=(Math.random()-.5)*shake*.6,sy=(Math.random()-.5)*shake*.6;
  cam.position.set(cat.position.x*.6+sx,py+7.2+sy,9.5);
  cam.lookAt(cat.position.x*.6,.4,-8);
  hudSc.textContent=score();
  R.render(scene,cam);
  // sleeping cat: floating z's above its head
  if(over&&!ran){const v=headG.getWorldPosition(new THREE.Vector3()).project(cam);zz.classList.add('on');zz.style.transform=`translate(${(v.x*.5+.5)*innerWidth}px,${(-v.y*.5+.5)*innerHeight-40}px)`;}
  else zz.classList.remove('on');
}
// input
addEventListener('keydown',e=>{
  const c=e.code;
  if(c==='ArrowLeft'||c==='KeyA')move(-1);
  else if(c==='ArrowRight'||c==='KeyD')move(1);
  else if(c==='ArrowUp'||c==='KeyW'||c==='Space'){e.preventDefault();jump();}
  else if(c==='ArrowDown'||c==='KeyS')slideNow();
});
let t0=null;
addEventListener('pointerdown',e=>{t0={x:e.clientX,y:e.clientY};});
addEventListener('pointerup',e=>{
  if(!t0)return;const dx=e.clientX-t0.x,dy=e.clientY-t0.y;t0=null;
  if(Math.max(Math.abs(dx),Math.abs(dy))<30){jump();return;}
  if(Math.abs(dx)>Math.abs(dy))move(dx>0?1:-1);
  else if(dy<0)jump();else slideNow();
});
hudBest.textContent=best;
let last=performance.now();
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;render(dt);requestAnimationFrame(frame);}
requestAnimationFrame(frame);

/* ===== polish pass: visuals + pause / score extras (core rules untouched) ===== */
const PET=selectedCat();
function petTex(p){return tex(256,256,(g,w,h)=>{
  g.fillStyle=p.body;g.fillRect(0,0,w,h);
  if(p.stripe||p.patch){g.strokeStyle=p.stripe||p.patch;g.lineWidth=12;g.globalAlpha=.6;
    for(let i=0;i<12;i++){const x=i*22+rnd(-4,4);g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+rnd(-14,14),h*.3,x+rnd(-14,14),h*.7,x+rnd(-6,6),h);g.stroke();}
    g.globalAlpha=1;}
  if(p.tux){g.fillStyle='#f4f1ea';g.fillRect(w*.36,h*.5,w*.28,h*.5);}
  if(p.dog){g.fillStyle='#7a4a2a';g.beginPath();g.arc(w*.3,h*.35,w*.12,0,7);g.fill();}
});}
furM.map=petTex(PET);furM.needsUpdate=true;redM.color.set(PET.collar);
const hudEl=$('hud'),vigEl=$('vig'),popLayer=$('pop'),flashEl=$('flash'),msEl=$('ms'),pzEl=$('pz');
const eyeS=headG.children.filter(m=>m.geometry&&m.geometry.parameters&&m.geometry.parameters.radius===.07&&Math.abs(m.position.z+.37)<.01);
// sun glow pulses; lanterns and coins shimmer
// rim light that follows the cat
const rimL=new THREE.PointLight('#ffd9a0',3,8,2);scene.add(rimL);
// shadows: sharper
sun.shadow.mapSize.set(1024,1024);sun.shadow.map&&sun.shadow.map.dispose&&sun.shadow.map.dispose();sun.shadow.map=null;
// river shimmer
const riverT=tex(128,128,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);for(let i=0;i<14;i++){g.strokeStyle='rgba(30,110,170,.45)';g.lineWidth=rnd(2,4);const y=rnd(0,h);g.beginPath();g.moveTo(0,y);g.bezierCurveTo(w*.3,y+rnd(-10,10),w*.6,y+rnd(-10,10),w,y);g.stroke();}},[1,20]);
river.material.map=riverT;river.material.needsUpdate=true;
// lane dashes
const laneT=tex(32,128,(g,w,h)=>{g.fillStyle='rgba(255,255,255,.8)';g.fillRect(12,0,8,64);},[1,30]);
for(const x of [-1,1]){const m=new THREE.Mesh(new THREE.PlaneGeometry(.1,170),new THREE.MeshBasicMaterial({map:laneT,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,.03,-70);scene.add(m);}
// particles, paw prints, popups
let parts=[];const pGeo=new THREE.BoxGeometry(.1,.1,.1);
function burst(x,y,z,cols,n,spd,life){
  for(let i=0;i<n&&parts.length<160;i++){
    const m=new THREE.Mesh(pGeo,new THREE.MeshBasicMaterial({color:pick(cols),transparent:true}));
    m.position.set(x,y,z);m.scale.setScalar(rnd(.6,1.4));scene.add(m);
    parts.push({m,v:new THREE.Vector3(rnd(-1,1)*spd,rnd(.4,1.2)*spd,rnd(-1,1)*spd),life,max:life});
  }
}
function popup(txt,x,y,z,col){
  const v=new THREE.Vector3(x,y,z).project(cam);
  const d=document.createElement('div');d.className='pp';d.textContent=txt;d.style.color=col;
  d.style.left=((v.x*.5+.5)*innerWidth)+'px';d.style.top=((-v.y*.5+.5)*innerHeight)+'px';
  popLayer.appendChild(d);setTimeout(()=>d.remove(),900);
}
function flashRed(){flashEl.classList.remove('go');void flashEl.offsetWidth;flashEl.classList.add('go');}
function banner(t){msEl.textContent=t;msEl.classList.remove('go');void msEl.offsetWidth;msEl.classList.add('go');}
const pawGeo=new THREE.CircleGeometry(.13,12),pawM=new THREE.MeshBasicMaterial({color:'#8a5a33',transparent:true,opacity:.35,depthWrite:false});
const paws=[];let pawAcc=0,pawSide=1;
// drifting scenery: flowers and fireflies
const drift=[];
const flowCols=['#ff8fb1','#ffe066','#ffffff','#b39dff'];
const fGeo=new THREE.SphereGeometry(.09,8,6);
for(let i=0;i<46;i++){const side=Math.random()<.5?-1:1;const m=new THREE.Mesh(fGeo,new THREE.MeshStandardMaterial({color:pick(flowCols),roughness:.6}));m.position.set(side*rnd(4.4,14),.12,rnd(-190,8));scene.add(m);drift.push({m,kind:0});}
const ffBase=new THREE.SpriteMaterial({map:glowT,color:'#e8ff8a',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
for(let i=0;i<22;i++){const s=new THREE.Sprite(ffBase.clone());s.position.set(rnd(-9,9),rnd(.8,2.6),rnd(-190,8));s.scale.set(.35,.35,1);scene.add(s);drift.push({m:s,kind:1,ph:rnd(0,6)});}
// stars for dusk
const starPts=[];for(let i=0;i<260;i++){const th=rnd(0,Math.PI*2),ph=rnd(.1,1.2);starPts.push(Math.cos(th)*Math.cos(ph)*150,Math.sin(ph)*150,Math.sin(th)*Math.cos(ph)*150);}
const starG=new THREE.BufferGeometry();starG.setAttribute('position',new THREE.Float32BufferAttribute(starPts,3));
const starsM=new THREE.PointsMaterial({color:'#fff6d8',size:1.6,transparent:true,opacity:0,depthWrite:false,fog:false});
scene.add(new THREE.Points(starG,starsM));
// birds
const birds=[];const bM=new THREE.MeshBasicMaterial({color:'#4a3550'});const wG=new THREE.BoxGeometry(1.1,.06,.2);
for(let i=0;i<6;i++){const g=new THREE.Group(),pl=new THREE.Group(),pr=new THREE.Group();
  const lw=new THREE.Mesh(wG,bM);lw.position.x=-.55;pl.add(lw);const rw=new THREE.Mesh(wG,bM);rw.position.x=.55;pr.add(rw);
  g.add(pl,pr);g.position.set(rnd(-40,40),rnd(12,18),rnd(-70,-120));g.scale.setScalar(rnd(.6,1));scene.add(g);birds.push({g,pl,pr,ph:rnd(0,6),sp:rnd(1.5,3)});}
// pause + game extras
let paused=false,resumeT=0,lastCoins=0,lastBand=0,wasG=true;
function setPause(v){if(v&&(over||!ran))return;paused=v;pzEl.classList.toggle('hide',!v);}
addEventListener('keydown',e=>{if(e.code==='KeyP'||e.code==='Escape')setPause(!paused);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPause(true);});
addEventListener('pointerdown',()=>{if(paused){setPause(false);resumeT=performance.now();}},true);
pzEl.addEventListener('click',()=>{});
const gate=()=>!paused&&performance.now()-resumeT>250;
const _jump=jump,_move=move,_slide=slideNow;
jump=function(){if(!gate())return;if(!over&&grounded)puff(cat.position.x,.05,.6,4,speed*.1);_jump();};
move=function(d){if(gate())_move(d);};
slideNow=function(){if(gate())_slide();};
const _start=start;start=function(){_start();lastCoins=0;lastBand=0;paused=false;pzEl.classList.add('hide');};
const _die=die;die=function(){const pb=best;_die();
  burst(cat.position.x,1,0,['#ffffff','#ffd34a','#ff8fa3','#9fe870'],28,5,.9);flashRed();
  const s=score();if(s>pb)fin.textContent='NEW BEST · '+s;};
function fxUpdate(dt){
  const k=Math.min(1,dist/1800),sp=Math.max(0,Math.min(1,(speed-9)/13));
  // coin pickups
  if(coins>lastCoins){const n=coins-lastCoins;
    for(let i=0;i<n;i++)burst(cat.position.x,1.1,0,['#ffd34a','#fff1a0','#ffffff'],9,3.2,.6);
    popup('+'+(10*n),cat.position.x,2.2,0,'#ffe26a');
    hudEl.classList.remove('bump');void hudEl.offsetWidth;hudEl.classList.add('bump');}
  lastCoins=coins;
  // milestones every 250
  const band=Math.floor(dist/250);
  if(!over&&band>lastBand&&band>0){lastBand=band;banner('★ '+(band*250));}
  // particles
  for(const p of parts){p.life-=dt;p.v.y-=14*dt;p.m.position.addScaledVector(p.v,dt);p.m.rotation.x+=dt*8;p.m.rotation.y+=dt*6;p.m.material.opacity=Math.max(0,p.life/p.max);
    if(p.life<=0){scene.remove(p.m);p.m.material.dispose();}}
  parts=parts.filter(p=>p.life>0);
  // paw prints behind the cat
  if(!over&&grounded){pawAcc+=speed*dt;if(pawAcc>1.05){pawAcc=0;pawSide*=-1;
    const m=new THREE.Mesh(pawGeo,pawM.clone());m.rotation.x=-Math.PI/2;m.position.set(cat.position.x+pawSide*.2,.03,.7);m.scale.set(1,1.3,1);scene.add(m);paws.push({m,life:3});}}
  for(const q of paws){q.life-=dt;q.m.position.z+=speed*dt;q.m.material.opacity=Math.min(.35,q.life);}
  while(paws.length&&(paws[0].life<=0||paws.length>40)){scene.remove(paws[0].m);paws.shift();}
  // landing thump
  if(!wasG&&grounded&&!over)shake=Math.max(shake,.12);wasG=grounded;
  // scenery drift
  for(const d of drift){d.m.position.z+=speed*dt;if(d.m.position.z>12)d.m.position.z-=198;
    if(d.kind===1){d.m.position.y+=Math.sin(T*2+d.ph)*dt*.2;d.m.material.opacity=k*(.5+.5*Math.sin(T*3+d.ph));}}
  for(const g of decor)g.rotation.z=Math.sin(T*1.3+g.position.z*.2)*.015;
  for(const b of birds){b.g.position.x+=dt*b.sp;if(b.g.position.x>50)b.g.position.x=-50;
    const f=Math.sin(T*9+b.ph);b.pl.rotation.z=f*.6;b.pr.rotation.z=-f*.6;}
  starsM.opacity=k*.9;
  // shimmer and glows
  lanternM.emissiveIntensity=1.1+.4*Math.sin(T*6);
  coinM.emissiveIntensity=.35+.2*Math.sin(T*5);
  riverT.offset.y-=dt*.2;riverT.offset.x=Math.sin(T*.4)*.03;
  laneT.offset.y+=speed*dt/5.67;
  sunGlow.scale.set(42*(1+.04*Math.sin(T*1.5)),42*(1+.04*Math.sin(T*1.5)),1);
  // cat: blink, scarf flutter, rim light
  const bl=(T%3.4)<.12?.15:1;for(const e of eyeS)e.scale.set(1,1.3*bl,.5);
  scarf.rotation.z=Math.sin(T*7)*.12;
  rimL.position.set(cat.position.x+1.2,py+2.4,1.5);
  // camera: roll into lane changes, vignette darkens at speed
  const roll=(LANES[lane]-cat.position.x)*.035;cam.up.set(Math.sin(roll),Math.cos(roll),0);
  vigEl.style.opacity=(.85+.15*sp).toFixed(2);
  // HUD pop on coin pickup happens above; keep score fresh
  if(over&&ran)pzEl.classList.add('hide');
}
const _render=render;
render=function(dt){const d=paused?0:dt;_render(d);fxUpdate(d);};
