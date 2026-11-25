// Two signature combos per fighter (ids 0-99). Press C to alternate between them.
// Bank A: 10 motion kinds x 10 finishers. Bank B: 10 keyframed body animations x 10 variants.
const PI=Math.PI,S=Math.sin,C=Math.cos;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=k=>k*k*(3-2*k);
const PREFIX=[['Whirl','spin'],['Rebound','hop'],['Tumble','flip'],['Jitter','wobble'],['Ricochet','dash'],['Pogo','stretch'],['Dervish','twirl'],['Wobble','swing'],['Plunge','slam'],['Stomp','stomp']];
const FINISH=[['Jab',{reach:95,pow:7,up:false}],['Sweep',{reach:120,pow:8,up:false}],['Uppercut',{reach:90,pow:10,up:true}],['Flurry',{reach:105,pow:6,up:false}],['Crash',{reach:130,pow:13,up:true}],['Hop',{reach:100,pow:9,up:true}],['Spiral',{reach:120,pow:10,up:false}],['Chop',{reach:110,pow:9,up:false}],['Barrage',{reach:120,pow:6,up:false}],['Flourish',{reach:140,pow:14,up:true}]];
const PRIM={
 spin:(u,k,o)=>{o.rot+=u*PI*2*(1+k*.5)},
 twirl:(u,k,o)=>{o.sx*=Math.max(.1,Math.abs(C(u*PI*(1+k*.5))))},
 hop:(u,k,o)=>{o.dy-=S(u*PI)*(55+k*25)},
 dash:(u,k,o)=>{o.dx+=S(u*PI)*(45+k*35)},
 stomp:(u,k,o)=>{o.sy*=1-S(u*PI)*(.22+k*.04);o.dy+=S(u*PI)*4},
 wobble:(u,k,o)=>{o.rot+=S(u*PI*4)*(.28+k*.08)},
 stretch:(u,k,o)=>{const s=S(u*PI*3)*(.14+k*.04);o.sy*=1+s;o.sx*=1-s*.6},
 flip:(u,k,o)=>{o.rot-=u*PI*2;o.dy-=S(u*PI)*(70+k*20)},
 swing:(u,k,o)=>{o.rot+=S(u*PI)*(.9+k*.2)-.45},
 slam:(u,k,o)=>{o.dy-=S(u*PI)*(30+k*15);o.rot+=(u<.5?0:.5)*PI*.5}
};
export function poseAt(c,t){
 const o={rot:0,sx:1,sy:1,dx:0,dy:0};
 for(const s of c.strikes){if(t>=s.at&&t<s.at+s.dur)PRIM[s.kind]((t-s.at)/s.dur,s.k,o)}
 return o;
}
function buildA(i){
 const a=i%10,b=Math.floor(i/10)%10,pre=PREFIX[a],fin=FINISH[b][1],k=(a*3+b)%4;
 const strikes=[
  {at:0,dur:.34,kind:pre[1],k,reach:85,pow:4,up:false},
  {at:.4,dur:.36,kind:PREFIX[(a+5)%10][1],k:(k+1)%4,reach:85,pow:5,up:false},
  {at:.84,dur:.5,kind:PREFIX[b][1],k:(k+2)%4,reach:fin.reach,pow:fin.pow,up:fin.up}
 ];
 const c={id:i,name:pre[0]+' '+FINISH[b][0],dur:1.5,strikes};
 c.pose=t=>poseAt(c,t);
 return c;
}
// Bank B: whole-body keyframe animations. u runs 0..1 over the combo, s scales the motion.
const ADJ=['Blazing','Lazy','Rubber','Sneaky','Wild','Giddy','Thunder','Bouncy','Frantic','Sleepy'];
const NOUN=[
 {name:'Cartwheel',dur:1.3,p:(u,s)=>({rot:2*PI*u,dx:S(PI*u)*70*s,dy:-S(PI*u)*45*s,sx:1,sy:1})},
 {name:'Cannonball',dur:1.2,p:(u,s)=>{if(u<.2){const k=u/.2;return{dx:0,dy:0,rot:0,sx:1+.2*k,sy:1-.25*k}}const k=(u-.2)/.8;return{dx:k*130*s,dy:-S(PI*k)*30*s,rot:k*.35,sx:1.25,sy:.8}}},
 {name:'Corkscrew',dur:1.4,p:(u,s)=>({rot:S(4*PI*u)*.6*s,dx:S(2*PI*u)*30*s,dy:-S(PI*u)*60*s,sx:1+.1*S(4*PI*u),sy:1-.05*S(4*PI*u)})},
 {name:'Backflip',dur:1.4,p:(u,s)=>({rot:-2*PI*ease(u),dx:0,dy:-S(PI*u)*95*s,sx:1,sy:1})},
 {name:'Shimmy',dur:1.1,p:(u,s)=>{const w=S(2*PI*5*u);return{dx:w*22*s,dy:0,rot:0,sx:1+.12*w,sy:1-.12*w}}},
 {name:'Pirouette',dur:1.3,p:(u,s)=>({dx:S(PI*u)*20*s,dy:0,rot:0,sx:clamp(Math.abs(C(2*PI*1.5*u)),.05,1),sy:1})},
 {name:'Hurricane',dur:1.5,p:(u,s)=>({dx:S(2*PI*u)*50*s,dy:0,rot:3*PI*u,sx:1+.3*S(PI*u),sy:1})},
 {name:'Bellyflop',dur:1.3,p:(u,s)=>{if(u<.4){const k=u/.4;return{dx:0,dy:-k*60*s,rot:ease(k)*1.3,sx:1,sy:1}}const k=(u-.4)/.6;return{dx:k*60*s,dy:-60*s+k*60*s,rot:1.3-.3*k,sx:1+.1*k,sy:1-.1*k}}},
 {name:'Pretzel',dur:1.4,p:(u,s)=>({dx:0,dy:0,rot:.7*S(3*PI*u)*s,sx:1+.2*C(3*PI*u),sy:1-.15*C(3*PI*u)})},
 {name:'Hiccup',dur:1.2,p:(u,s)=>{const q=Math.floor(u*4)/4;return{dx:q*60*s,dy:-Math.abs(S(4*PI*u))*50*s,rot:0,sx:1,sy:1+.2*S(4*PI*u)}}}
];
function buildB(i){
 const a=i%10,b=Math.floor(i/10)%10,N=NOUN[b],s=.8+(a%5)*.12,dur=N.dur;
 const strikes=[
  {at:dur*.2,dur:.2,reach:90,pow:5,up:false},
  {at:dur*.5,dur:.2,reach:100,pow:6,up:false},
  {at:dur*.8,dur:.22,reach:120+(b%4)*8,pow:9+(a%4),up:b%2===0}
 ];
 const c={id:i,name:ADJ[a]+' '+N.name,dur,strikes};
 c.pose=t=>{const p=N.p(clamp(t/dur,0,1),s);return{dx:p.dx||0,dy:p.dy||0,rot:p.rot||0,sx:p.sx??1,sy:p.sy??1}};
 return c;
}
const cacheA=new Map(),cacheB=new Map();
export const comboName=(id,alt=false)=>comboFor(id,alt).name;
export function comboFor(id,alt=false){
 const cache=alt?cacheB:cacheA;
 if(!cache.has(id))cache.set(id,alt?buildB(id):buildA(id));
 return cache.get(id);
}
