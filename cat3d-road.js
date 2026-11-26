import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
// Cross Road's cat: a longer, sleeker build than the chibi cat in char3d.js.
// Faces -z (the direction it hops), feet on y=0, same pieces as char3d.js (userData.head / tail).
const M=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6},o||{}));
const add=(g,geo,mat,x,y,z,o)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);if(o){if(o.s)m.scale.set(...o.s);if(o.r)m.rotation.set(...o.r);}m.castShadow=true;g.add(m);return m;};
export function makeCatRoad(cat){
  const g=new THREE.Group(),s=cat.size||1;
  const bodyC=cat.body,dark=cat.stripe||cat.patch||null;
  const furM=M(bodyC,{roughness:.75}),lightM=M(cat.dog?'#fff6e6':'#f2eaf6',{roughness:.7});
  const pinkM=M('#ff9bb8',{roughness:.6});

  // torso: long, low, slightly raised at the shoulders
  const torso=new THREE.Group();torso.position.set(0,0,0);g.add(torso);
  add(torso,new THREE.SphereGeometry(.4,28,20),furM,0,.44,0,{s:[.9,.84,1.3]});
  if(dark&&cat.stripe){ // tabby stripes down the back
    for(const z of [-.16,0,.16])add(torso,new THREE.SphereGeometry(.1,10,8),M(dark),0,.74,z,{s:[1.5,.45,.7]});
  }
  if(cat.tux)add(torso,new THREE.SphereGeometry(.22,16,12),lightM,0,.44,-.4,{s:[1,1.25,.45]});

  // legs: tapered, with oval paws pointing forward
  for(const [x,z] of [[-.16,-.2],[.16,-.2],[-.16,.22],[.16,.22]]){
    add(g,new THREE.CylinderGeometry(.07,.09,.3,12),furM,x,.15,z);
    add(g,new THREE.SphereGeometry(.1,12,8),furM,x,.05,z-.04,{s:[1,.55,1.35]});
  }

  // head: a bit longer than round, with a clear muzzle and cheeks
  const head=new THREE.Group();head.position.set(0,.92,-.3);g.add(head);
  add(head,new THREE.SphereGeometry(.3,28,20),furM,0,0,0,{s:[1.08,.92,1]});
  add(head,new THREE.SphereGeometry(.12,16,12),lightM,0,-.1,-.2,{s:[1.5,.9,1]}); // muzzle
  for(const sx of [-1,1])add(head,new THREE.SphereGeometry(.08,12,10),furM,sx*.16,-.06,-.14,{s:[1,.9,.8]}); // cheeks
  add(head,new THREE.ConeGeometry(.034,.05,3),pinkM,0,-.05,-.31,{r:[0,0,Math.PI]}); // nose, pointing down

  // ears: real triangles, tilted outward, with pink insides
  for(const sx of [-1,1]){
    add(head,new THREE.ConeGeometry(.13,.26,3),furM,sx*.17,.25,-.02,{r:[0,0,-sx*.22]});
    add(head,new THREE.ConeGeometry(.07,.14,3),pinkM,sx*.17,.23,-.06,{r:[0,0,-sx*.22]});
  }

  // eyes: almond shape, slit pupil, a small highlight
  for(const sx of [-1,1]){
    const ex=sx*.12,ey=.03,ez=-.25;
    add(head,new THREE.SphereGeometry(.07,14,10),M(cat.eye,{emissive:cat.eye,emissiveIntensity:.3}),ex,ey,ez,{s:[1,1.25,.45]});
    add(head,new THREE.SphereGeometry(.035,10,8),M('#0c0c10'),ex,ey,ez-.03,{s:[.4,1.6,.5]});
    add(head,new THREE.SphereGeometry(.014,6,6),M('#ffffff',{emissive:'#ffffff',emissiveIntensity:.9}),ex+sx*.015,ey+.03,ez-.04);
  }
  if(dark&&cat.stripe)add(head,new THREE.BoxGeometry(.05,.1,.03),M(dark),0,.2,-.27); // forehead stripe

  // whiskers: thin white lines from the muzzle
  const wm=M('#ffffff',{emissive:'#ffffff',emissiveIntensity:.5});
  for(const sx of [-1,1])for(const [dy,rz] of [[-.02,.12],[-.07,0],[-.12,-.12]]){
    add(head,new THREE.BoxGeometry(.36,.008,.008),wm,sx*.3,dy,-.22,{r:[0,sx*-.12,sx*rz]}).castShadow=false;
  }

  // collar with a little bell
  const col=add(head,new THREE.TorusGeometry(.2,.035,8,24),M(cat.collar,{emissive:cat.collar,emissiveIntensity:.15}),0,-.2,-.05,{r:[Math.PI/2,0,0]});
  add(head,new THREE.SphereGeometry(.05,12,10),M('#ffd84a',{emissive:'#ffd84a',emissiveIntensity:.3,metalness:.4,roughness:.3}),0,-.27,-.25);

  // tail: a tapered curve that rises up behind, swung from the pivot
  const tail=new THREE.Group();tail.position.set(0,.5,.42);g.add(tail);
  const curve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,-.02,0),new THREE.Vector3(0,.0,.22),new THREE.Vector3(0,.1,.38),
    new THREE.Vector3(0,.3,.44),new THREE.Vector3(0,.5,.36)
  ]);
  const tube=new THREE.Mesh(new THREE.TubeGeometry(curve,24,.055,10,false),furM);tube.castShadow=true;tail.add(tube);
  const tip=add(tail,new THREE.SphereGeometry(.058,12,10),furM,0,.5,.36);
  if(dark&&cat.stripe)tail.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(.05,.012,6,12),M(dark)),{position:new THREE.Vector3(0,.24,.42)}));

  g.userData={head,tail,bell:col};
  g.scale.setScalar(s*.9);
  return g;
}
