import * as THREE from 'https://esm.sh/three@0.160.0';
// Shared 3D characters: the selected cat and the dog. Colors mirror CATS in game.js.
export const CATS3D=[
 {id:'billy',name:'Bobby',body:'#25252d',tux:true,eye:'#9fe870',collar:'#e63946',size:1.0},
 {id:'bobby',name:'Billy',body:'#8e949f',stripe:'#555b68',eye:'#ffc247',collar:'#3a86ff',size:1.0},
 {id:'bubby',name:'Bubby',body:'#9a9fa9',stripe:'#5d6370',eye:'#ffc247',collar:'#2ec27e',size:.85},
 {id:'berry',name:'Berry',body:'#25252d',tux:true,eye:'#9fe870',collar:'#ff77b7',size:.7},
 {id:'suzie',name:'Suzie',body:'#25252d',tux:true,eye:'#ffe14a',collar:'#ff4d6d',size:.85},
 {id:'jewels',name:'Jewels',body:'#f7f4ee',patch:'#7a4a2a',eye:'#7a4420',collar:'#ffd84a',size:.85,dog:true}
];
export function selectedCat(){
  let i=0;try{i=+localStorage.getItem('cq_sel')||0;}catch(e){}
  return CATS3D[((i%CATS3D.length)+CATS3D.length)%CATS3D.length];
}
const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6},o||{}));
// A small chibi cat built from primitives. Faces -z (running/forward direction).
export function makeCat(cat){
  const g=new THREE.Group(),s=cat.size||1;
  const bodyC=cat.body,dark=cat.stripe||cat.patch||null;
  const bodyM=M(bodyC,{roughness:.7}),lightM=M(cat.dog?'#fff6e6':'#f2eaf6');
  const b=new THREE.Mesh(new THREE.SphereGeometry(.42,24,18),bodyM);b.scale.set(1,.85,1.15);b.position.y=.42;b.castShadow=true;g.add(b);
  const head=new THREE.Group();head.position.set(0,.92,-.22);g.add(head);
  const hd=new THREE.Mesh(new THREE.SphereGeometry(.36,24,18),bodyM);hd.castShadow=true;head.add(hd);
  const muz=new THREE.Mesh(new THREE.SphereGeometry(.18,16,12),lightM);muz.position.set(0,-.08,-.3);muz.scale.set(1.2,.8,.8);head.add(muz);
  for(const sx of [-1,1]){
    const ear=new THREE.Mesh(new THREE.ConeGeometry(.12,.22,4),bodyM);ear.position.set(sx*.2,.34,0);ear.rotation.z=-sx*.25;head.add(ear);
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.06,12,10),M('#111'));eye.position.set(sx*.14,.05,-.32);head.add(eye);
    const sh=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),M('#fff',{emissive:'#fff',emissiveIntensity:.8}));sh.position.set(sx*.13,.08,-.37);head.add(sh);
    const ir=new THREE.Mesh(new THREE.SphereGeometry(.055,12,10),M(cat.eye,{emissive:cat.eye,emissiveIntensity:.3}));ir.position.set(sx*.14,.05,-.3);ir.scale.z=.4;head.add(ir);
  }
  const nose=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),M('#ff77b7'));nose.position.set(0,-.02,-.5);head.add(nose);
  if(dark){const st=new THREE.Mesh(new THREE.BoxGeometry(.06,.12,.04),M(dark));st.position.set(0,.3,-.3);head.add(st);}
  const col=new THREE.Mesh(new THREE.TorusGeometry(.26,.05,8,20),M(cat.collar,{emissive:cat.collar,emissiveIntensity:.15}));col.rotation.x=Math.PI/2;col.position.set(0,.66,-.18);head.add(col);
  for(const [x,z] of [[-.2,-.14],[.2,-.14],[-.2,.2],[.2,.2]]){const l=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.16,4,8),bodyM);l.position.set(x,.14,z);l.castShadow=true;g.add(l);}
  const tail=new THREE.Group();tail.position.set(0,.5,.4);g.add(tail);
  for(let k=0;k<4;k++){const t=new THREE.Mesh(new THREE.SphereGeometry(.09-k*.012,10,8),bodyM);t.position.set(0,k*.14,k*.08);tail.add(t);}
  if(cat.tux){const ch=new THREE.Mesh(new THREE.SphereGeometry(.2,14,10),lightM);ch.scale.set(1,1.2,.5);ch.position.set(0,.46,-.3);g.add(ch);}
  g.userData={head,tail};
  g.scale.setScalar(s*.9);
  return g;
}
// The dog with a spray bottle (matches the 2D Tetris dog).
export function makeDog(){
  const g=new THREE.Group();
  const white=M('#f7f4ee',{roughness:.7}),tan=M('#7a4a2a',{roughness:.7});
  const b=new THREE.Mesh(new THREE.SphereGeometry(.42,24,18),white);b.scale.set(1,.85,1.2);b.position.y=.42;b.castShadow=true;g.add(b);
  const head=new THREE.Group();head.position.set(0,.95,-.2);g.add(head);
  head.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(.36,24,18),white),{castShadow:true}));
  const patch=new THREE.Mesh(new THREE.SphereGeometry(.2,14,10),tan);patch.position.set(-.12,.1,-.2);patch.scale.set(1,1,.5);head.add(patch);
  for(const sx of [-1,1]){
    const ear=new THREE.Mesh(new THREE.SphereGeometry(.14,12,10),tan);ear.scale.set(.6,1.1,.5);ear.position.set(sx*.3,.05,0);head.add(ear);
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.055,12,10),M('#111'));eye.position.set(sx*.14,.06,-.33);head.add(eye);
  }
  const nose=new THREE.Mesh(new THREE.SphereGeometry(.07,12,10),M('#111'));nose.position.set(0,-.08,-.36);head.add(nose);
  const col=new THREE.Mesh(new THREE.TorusGeometry(.26,.05,8,20),M('#ffd84a',{emissive:'#ffd84a',emissiveIntensity:.2}));col.rotation.x=Math.PI/2;col.position.set(0,.68,-.18);head.add(col);
  for(const [x,z] of [[-.2,-.14],[.2,-.14],[-.2,.2],[.2,.2]]){const l=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.16,4,8),white);l.position.set(x,.14,z);g.add(l);}
  const tail=new THREE.Mesh(new THREE.CapsuleGeometry(.05,.3,4,8),white);tail.position.set(0,.7,.5);tail.rotation.x=-.6;g.add(tail);
  // spray bottle in the right paw
  const bottle=new THREE.Group();bottle.position.set(.36,.42,-.2);g.add(bottle);
  bottle.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(.09,.1,.34,14),M('#3ad6ff',{transparent:true,opacity:.85,roughness:.2})),{}));
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.05,.06,.1,10),M('#ff4d6d'));cap.position.y=.2;bottle.add(cap);
  const nozzle=new THREE.Mesh(new THREE.BoxGeometry(.04,.04,.12),M('#ff4d6d'));nozzle.position.set(0,.26,-.06);bottle.add(nozzle);
  g.userData={head,bottle,tail};
  return g;
}
