"use strict";
let VW=800, RK=1; const TS=32, VH=448, ROWS=14;
const cv=document.getElementById('g'); let ctx=cv.getContext('2d',{alpha:false});

/* ---------- cats ---------- */
const CATS=[
 {id:'billy',name:'Bobby',desc:'Fat tuxedo. Belly Slam: press ACT in the air!',w:40,h:34,speed:2.6,jump:11.8,body:'#25252d',tux:true,eye:'#9fe870',collar:'#e63946',hp:9,sp:'slam',hs:1.0,fat:1.0},
 {id:'bobby',name:'Billy',desc:'Fat grey tabby. Tank: longer invincibility, no knockback!',w:42,h:36,speed:2.5,jump:11.8,body:'#8e949f',stripe:'#555b68',eye:'#ffc247',collar:'#3a86ff',hp:9,sp:'tank',hs:1.0,fat:1.0},
 {id:'bubby',name:'Bubby',desc:'Medium grey tabby. Double jump!',w:34,h:28,speed:3.1,jump:12.4,body:'#9a9fa9',stripe:'#5d6370',eye:'#ffc247',collar:'#2ec27e',hp:9,sp:'double',hs:1.0,fat:0.7},
 {id:'berry',name:'Berry',desc:'Small tuxedo. Fastest, and floats: hold JUMP!',w:24,h:21,speed:3.7,jump:13.2,body:'#25252d',tux:true,eye:'#9fe870',collar:'#ff77b7',bell:true,hp:9,sp:'glide',hs:1.3,fat:0.4},
 {id:'suzie',name:'Suzie',desc:'Cousin, tuxedo boy. Dash with ACT!',w:34,h:28,speed:3.1,jump:12.3,body:'#25252d',tux:true,eye:'#ffe14a',bow:true,hp:9,sp:'dash',hs:1.0,fat:0.7},
 {id:'jewels',name:'Jewels',desc:'Angel Jack Russell. Hold JUMP to fly through the level!',w:34,h:28,speed:3.3,jump:12.4,dog:true,body:'#f7f4ee',patch:'#7a4a2a',eye:'#7a4420',collar:'#ffd84a',hp:9,sp:'fly',hs:1.0,fat:0.7}
];

/* ---------- art ---------- */
const OL='#17121f';
function hsh(i){const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function shade(hex,a){const n=parseInt(hex.slice(1),16);const r=n>>16,g=(n>>8)&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(a>=0?v+(255-v)*a:v*(1+a))));return 'rgb('+f(r)+','+f(g)+','+f(b)+')';}
function ell(c,x,y,rx,ry,rot){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot||0,0,7);}
function fillOL(c,fill,lw){c.fillStyle=fill;c.fill();c.lineWidth=lw;c.strokeStyle=OL;c.lineJoin='round';c.stroke();}
function furGrad(c,cx,cy,rx,ry,col){const g=c.createRadialGradient(cx-rx*0.2,cy-ry*0.6,1,cx,cy,Math.max(rx,ry)*1.15);g.addColorStop(0,shade(col,0.3));g.addColorStop(0.55,col);g.addColorStop(1,shade(col,-0.38));return g;}
const GLC=new Map();
function glow(c,x,y,r,rgb,a){a=a==null?1:a;const ar=Math.round(a*20)/20,rr=Math.max(2,Math.round(r)),k=rgb+'|'+rr+'|'+ar;let sp=GLC.get(k);
  if(!sp){sp=document.createElement('canvas');sp.width=sp.height=rr*2;const g=sp.getContext('2d'),gr=g.createRadialGradient(rr,rr,0,rr,rr,rr);gr.addColorStop(0,'rgba('+rgb+','+ar+')');gr.addColorStop(1,'rgba('+rgb+',0)');g.fillStyle=gr;g.fillRect(0,0,rr*2,rr*2);if(GLC.size>260)GLC.clear();GLC.set(k,sp);}
  c.drawImage(sp,x-rr,y-rr);}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}

function drawDog(c,cat,x,y,w,h,face,t,o){
  o=o||{};
  c.save();c.translate(x+w/2,y+h);c.scale(face,1);
  if(o.sy)c.scale(1/o.sy,o.sy);
  const run=o.run||0,air=o.air||0;
  const bob=run?Math.abs(Math.sin(t*0.45))*h*0.05:Math.sin(t*0.08)*h*0.015;
  const lw=Math.max(1.5,h*0.06),body=cat.body,pt=cat.patch||'#7a4a2a';
  const rx=w*0.44,ry=h*0.26,bx=-w*0.08,by=-h*0.4-bob;
  const hx=w*0.28,hy=-h*0.75-bob;
  const shade2=shade(body,-0.2);
  glow(c,0,-h*0.6,w*1.0,'255,246,205',0.26+0.08*Math.sin(t*0.07));
  // angel wings: layered feathers, flapping faster in the air
  const flap=Math.sin(t*(air?0.42:0.1))*(air?0.5:0.12);
  const wing=(rot,sc,front)=>{c.save();c.translate(bx+w*0.02,by-ry*0.55);c.rotate(rot+flap);
    for(let i=3;i>=0;i--){c.save();c.rotate(-i*0.24);
      const g=c.createLinearGradient(-w*0.5*sc,0,w*0.05,0);g.addColorStop(0,front?'#e4f0ff':'#bcd3ee');g.addColorStop(1,'#ffffff');
      ell(c,-w*0.2*sc-i*w*0.035,-h*0.1*sc,w*0.3*sc,h*0.07*sc,-0.35);fillOL(c,g,lw*0.75);c.restore();}
    c.restore();};
  wing(-0.55,0.9,false);
  // tail with a tan tip
  const wag=Math.sin(t*0.3)*h*0.07*(run?1.8:1);
  const tw=Math.max(4,h*0.14);
  c.lineCap='round';
  const tail=()=>{c.beginPath();c.moveTo(bx-rx*0.8,by-ry*0.1);c.bezierCurveTo(bx-rx*1.35,by-ry*0.6,bx-rx*1.25+wag,-h*0.8,bx-rx*0.9+wag*1.4,-h*0.98);};
  tail();c.strokeStyle=OL;c.lineWidth=tw+lw*2;c.stroke();
  tail();c.strokeStyle=body;c.lineWidth=tw;c.stroke();
  c.beginPath();c.moveTo(bx-rx*1.12+wag*1.1,-h*0.78);c.quadraticCurveTo(bx-rx*1.0+wag*1.35,-h*0.9,bx-rx*0.9+wag*1.4,-h*0.98);c.strokeStyle=pt;c.lineWidth=tw;c.stroke();
  // legs with white paws
  const lwid=w*0.095,lht=h*0.27;
  [[-w*0.33,0],[-w*0.16,Math.PI],[w*0.12,Math.PI],[w*0.3,0]].forEach((Lg,i)=>{
    let off=0,lift=0;
    if(air){off=(i<2?-1:1)*w*0.07*(air>0?-1:1);lift=h*0.1;}
    else if(run){off=Math.sin(t*0.45+Lg[1])*w*0.11;lift=Math.max(0,Math.cos(t*0.45+Lg[1]))*h*0.09;}
    const lx=Lg[0]+off;
    ell(c,lx,-lht*0.6-lift,lwid,lht);fillOL(c,i%3===0?shade2:body,lw);
    ell(c,lx+lwid*0.25,-lift-h*0.03,lwid*1.3,h*0.042);fillOL(c,'#ffffff',lw*0.8);
  });
  // body with tan saddle, rump patch and white chest
  ell(c,bx,by,rx,ry);fillOL(c,furGrad(c,bx,by,rx,ry,body),lw);
  c.save();ell(c,bx,by,rx,ry);c.clip();
  ell(c,bx-rx*0.12,by-ry*0.92,rx*0.5,ry*0.4);c.fillStyle=pt;c.fill();
  ell(c,bx+rx*0.85,by+ry*0.05,rx*0.3,ry*0.6);c.fill();
  ell(c,hx-w*0.02,by+ry*0.45,w*0.15,ry*0.7);c.fillStyle='#ffffff';c.fill();
  c.restore();
  wing(-0.2,1,true);
  // ears: prick ears with a tan tip
  const ear=(x1,y1,tx,ty,x2,y2,col)=>{c.beginPath();c.moveTo(x1,y1);c.quadraticCurveTo((x1+tx)/2-w*0.03,(y1+ty)/2,tx,ty);c.quadraticCurveTo((x2+tx)/2+w*0.03,(y2+ty)/2,x2,y2);c.closePath();fillOL(c,col,lw);};
  ear(hx+w*0.02,hy-h*0.12,hx+w*0.12,hy-h*0.36,hx+w*0.16,hy-h*0.1,shade(pt,-0.25));
  // gold collar with a gem pendant
  const nx=hx-w*0.03,ny=hy+h*0.2;
  c.save();c.translate(nx,ny);c.rotate(0.45);rr(c,-w*0.14,-h*0.03,w*0.28,h*0.065,3);fillOL(c,cat.collar,lw*0.7);c.restore();
  const gx=nx+w*0.04,gy=ny+h*0.07;
  c.beginPath();c.moveTo(gx,gy-h*0.05);c.lineTo(gx+w*0.05,gy);c.lineTo(gx,gy+h*0.065);c.lineTo(gx-w*0.05,gy);c.closePath();
  c.fillStyle='#6ee7ff';c.fill();c.strokeStyle=OL;c.lineWidth=lw*0.6;c.stroke();
  c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.moveTo(gx-w*0.012,gy-h*0.035);c.lineTo(gx+w*0.012,gy-h*0.01);c.lineTo(gx-w*0.025,gy-h*0.005);c.closePath();c.fill();
  // head with tan cap
  ell(c,hx,hy,w*0.21,h*0.19);fillOL(c,furGrad(c,hx,hy,w*0.21,h*0.19,body),lw);
  c.save();ell(c,hx,hy,w*0.21,h*0.19);c.clip();
  ell(c,hx-w*0.02,hy-h*0.13,w*0.15,h*0.08);c.fillStyle=pt;c.fill();
  c.restore();
  ear(hx-w*0.2,hy-h*0.01,hx-w*0.13,hy-h*0.36,hx-w*0.01,hy-h*0.14,pt);
  // tongue (when running or flying), then white muzzle, nose and smile
  if(run||air){ell(c,hx+w*0.26,hy+h*0.14,w*0.045,h*0.05);fillOL(c,'#ff7aa2',lw*0.5);}
  ell(c,hx+w*0.2,hy+h*0.06,w*0.13,h*0.085);fillOL(c,'#fffdf6',lw*0.8);
  const nzx=hx+w*0.32,nzy=hy+h*0.03;
  ell(c,nzx,nzy,w*0.05,h*0.04);c.fillStyle='#1b1018';c.fill();
  ell(c,nzx-w*0.015,nzy-h*0.012,w*0.016,h*0.011);c.fillStyle='#ffffff';c.fill();
  c.strokeStyle=OL;c.lineWidth=lw*0.6;c.lineCap='round';c.beginPath();c.moveTo(nzx-w*0.005,nzy+h*0.04);c.quadraticCurveTo(hx+w*0.24,hy+h*0.11,hx+w*0.18,hy+h*0.1);c.stroke();
  // big expressive eye: brow, iris, highlight, blink
  const ex=hx+w*0.1,ey=hy-h*0.035;
  c.strokeStyle=pt;c.lineWidth=lw*1.1;c.beginPath();c.moveTo(ex-w*0.05,ey-h*0.1);c.quadraticCurveTo(ex,ey-h*0.15,ex+w*0.06,ey-h*0.1);c.stroke();
  if(t%200<6){c.strokeStyle=OL;c.lineWidth=lw*0.8;c.beginPath();c.moveTo(ex-w*0.05,ey);c.quadraticCurveTo(ex,ey+h*0.02,ex+w*0.05,ey);c.stroke();}
  else{
    ell(c,ex,ey,w*0.055,h*0.065);fillOL(c,'#ffffff',lw*0.6);
    ell(c,ex+w*0.008,ey+h*0.004,w*0.036,h*0.046);c.fillStyle=cat.eye;c.fill();
    ell(c,ex+w*0.01,ey+h*0.008,w*0.02,h*0.03);c.fillStyle='#1d0d04';c.fill();
    ell(c,ex-w*0.012,ey-h*0.02,w*0.015,h*0.017);c.fillStyle='#ffffff';c.fill();
    ell(c,ex+w*0.018,ey+h*0.024,w*0.006,h*0.006);c.fill();
  }
  // halo: glowing gold ring above the ears
  const hb=Math.sin(t*0.08)*h*0.02;
  c.save();c.translate(hx-w*0.02,hy-h*0.38+hb);c.rotate(-0.15);glow(c,0,0,w*0.4,'255,230,120',0.5);
  c.beginPath();c.ellipse(0,0,w*0.17,h*0.05,0,0,7);c.strokeStyle=OL;c.lineWidth=lw*2.2;c.stroke();
  c.strokeStyle='#ffe066';c.lineWidth=lw*1.3;c.stroke();
  c.strokeStyle='#fff8cf';c.lineWidth=lw*0.4;c.stroke();
  c.restore();
  // twinkles
  for(let i=0;i<3;i++){const a=Math.max(0,Math.sin(t*0.06+i*2.1));c.globalAlpha=a;c.fillStyle='#fff';const sx=Math.cos(t*0.02+i*2.1)*w*0.6,sy=-h*0.6+Math.sin(t*0.03+i)*h*0.4;c.fillRect(sx-3,sy,6,1.4);c.fillRect(sx,sy-3,1.4,6);}
  c.globalAlpha=1;
  c.restore();
}
function drawCat(c,cat,x,y,w,h,face,t,o){
  o=o||{};
  if(cat.dog)return drawDog(c,cat,x,y,w,h,face,t,o);
  c.save();
  c.translate(x+w/2,y+h);
  c.scale(face,1);
  if(o.sy){c.scale(1/o.sy,o.sy);}
  const run=o.run||0, air=o.air||0, hs=cat.hs, fat=cat.fat;
  const bob=run?Math.abs(Math.sin(t*0.45))*h*0.05:Math.sin(t*0.08)*h*0.01;
  const lw=Math.max(1.5,h*0.06);
  const r=Math.min(h*0.37*hs,w*0.36*hs+3);
  const rx=w*(0.46+fat*0.05), ry=h*(0.33+fat*0.04);
  const bx=-w*0.06, by=-h*0.36-bob;
  const hx=w*0.27, hy=-h*0.66-bob+(hs>1?h*0.03:0);
  const body=cat.body;
  // ----- tail
  const wag=Math.sin(t*0.12)*h*0.12*(run?1.6:1);
  const tw=Math.max(4,h*0.17);
  const tail=()=>{c.beginPath();c.moveTo(bx-rx*0.7,by);c.bezierCurveTo(bx-rx*1.5,by-h*0.05,bx-rx*1.3+wag,-h*0.85,bx-rx*0.95+wag*1.3,-h*1.05);};
  c.lineCap='round';
  tail();c.strokeStyle=OL;c.lineWidth=tw+lw*2;c.stroke();
  tail();c.strokeStyle=body;c.lineWidth=tw;c.stroke();
  if(cat.stripe){tail();c.strokeStyle=cat.stripe;c.lineWidth=tw;c.setLineDash([tw*0.5,tw*0.9]);c.stroke();c.setLineDash([]);}
  // ----- legs
  const lwid=w*0.115, lht=h*0.21;
  [[-w*0.34,0],[-w*0.14,Math.PI],[w*0.13,Math.PI],[w*0.32,0]].forEach((L,i)=>{
    let off=0,lift=0;
    if(air){off=(i<2?-1:1)*w*0.07*(air>0?-1:1);lift=h*0.12;}
    else if(run){off=Math.sin(t*0.45+L[1])*w*0.11;lift=Math.max(0,Math.cos(t*0.45+L[1]))*h*0.09;}
    ell(c,L[0]+off,-lht*0.55-lift,lwid,lht);fillOL(c,i%3===0?shade(body,-0.2):body,lw);
    if(cat.tux){ell(c,L[0]+off,-lift-lht*0.3,lwid,lht*0.55);fillOL(c,'#fff',lw);}
  });
  // ----- body
  ell(c,bx,by,rx,ry);fillOL(c,furGrad(c,bx,by,rx,ry,body),lw);
  c.save();ell(c,bx,by,rx,ry);c.clip();
  if(cat.stripe){
    c.strokeStyle=cat.stripe;c.lineWidth=Math.max(2,h*0.085);c.lineCap='round';
    for(let i=0;i<4;i++){const sx=bx-rx*0.6+i*rx*0.36;c.beginPath();c.moveTo(sx,by-ry*1.1);c.quadraticCurveTo(sx+w*0.03,by-ry*0.5,sx-w*0.01,by-ry*0.05);c.stroke();}
    c.fillStyle='rgba(255,255,255,.22)';ell(c,bx+rx*0.15,by+ry*0.65,rx*0.75,ry*0.45);c.fill();
  }
  if(cat.tux){
    const g=c.createRadialGradient(bx+rx*0.4,by+ry*0.2,1,bx+rx*0.4,by+ry*0.3,rx*0.65);g.addColorStop(0,'#fff');g.addColorStop(1,'#d3d6e6');
    c.fillStyle=g;ell(c,bx+rx*0.44,by+ry*0.3,rx*0.42,ry*0.9);c.fill();
    if(fat>0.9){ell(c,bx+rx*0.1,by+ry*0.75,rx*0.62,ry*0.5);c.fill();}
  }
  c.fillStyle='rgba(255,255,255,.13)';ell(c,bx-rx*0.2,by-ry*0.68,rx*0.55,ry*0.17);c.fill();
  c.restore();
  ell(c,bx,by,rx,ry);c.lineWidth=lw;c.strokeStyle=OL;c.stroke();
  // ----- head
  const hrx=r*(1.1+fat*0.1), hry=r*0.98;
  [-1,1].forEach(s=>{
    c.beginPath();c.moveTo(hx+s*hrx*0.95,hy-hry*0.15);c.lineTo(hx+s*hrx*0.7,hy-hry*1.45);c.lineTo(hx+s*hrx*0.08,hy-hry*0.85);c.closePath();fillOL(c,body,lw);
    c.beginPath();c.moveTo(hx+s*hrx*0.8,hy-hry*0.4);c.lineTo(hx+s*hrx*0.66,hy-hry*1.14);c.lineTo(hx+s*hrx*0.28,hy-hry*0.82);c.closePath();c.fillStyle='#ff9fb8';c.fill();
    c.beginPath();c.moveTo(hx+s*hrx*0.9,hy+hry*0.05);c.lineTo(hx+s*hrx*1.32,hy+hry*0.38);c.lineTo(hx+s*hrx*0.82,hy+hry*0.62);c.closePath();fillOL(c,body,lw*0.8);
  });
  ell(c,hx,hy,hrx,hry);fillOL(c,furGrad(c,hx,hy,hrx,hry,body),lw);
  c.save();ell(c,hx,hy,hrx,hry);c.clip();
  if(cat.stripe){
    c.strokeStyle=cat.stripe;c.lineWidth=Math.max(1.6,r*0.15);c.lineCap='round';
    for(let i=-1;i<=1;i++){c.beginPath();c.moveTo(hx+i*r*0.32,hy-hry*1.0);c.lineTo(hx+i*r*0.26,hy-hry*0.5);c.stroke();}
    [-1,1].forEach(s=>{for(let k=0;k<2;k++){c.beginPath();c.moveTo(hx+s*hrx*1.05,hy+hry*(0.0+k*0.3));c.lineTo(hx+s*hrx*0.7,hy+hry*(0.08+k*0.3));c.stroke();}});
    c.fillStyle='#dfe2ea';ell(c,hx,hy+hry*0.5,r*0.55,r*0.4);c.fill();
  }
  if(cat.tux){
    c.fillStyle='#fff';ell(c,hx,hy+hry*0.5,r*0.6,r*0.46);c.fill();
    c.beginPath();c.moveTo(hx-r*0.14,hy-hry*0.05);c.lineTo(hx+r*0.14,hy-hry*0.05);c.lineTo(hx+r*0.05,hy+hry*0.4);c.lineTo(hx-r*0.05,hy+hry*0.4);c.closePath();c.fill();
  }
  c.fillStyle='rgba(255,255,255,.14)';ell(c,hx-hrx*0.15,hy-hry*0.72,hrx*0.5,hry*0.14);c.fill();
  c.restore();
  ell(c,hx,hy,hrx,hry);c.lineWidth=lw;c.strokeStyle=OL;c.stroke();
  // eyes
  const blink=(Math.floor(t/4)%70)<2;
  [-1,1].forEach(s=>{
    const ex=hx+s*hrx*0.42,ey=hy-hry*0.08,er=r*0.3;
    if(blink){c.strokeStyle=OL;c.lineWidth=lw;c.beginPath();c.arc(ex,ey,er*0.75,Math.PI*0.1,Math.PI*0.9);c.stroke();return;}
    ell(c,ex,ey,er*0.95,er*1.15);
    const g=c.createLinearGradient(0,ey-er,0,ey+er);g.addColorStop(0,shade(cat.eye,-0.25));g.addColorStop(1,shade(cat.eye,0.4));
    c.fillStyle=g;c.fill();c.lineWidth=lw*0.7;c.strokeStyle=OL;c.stroke();
    ell(c,ex+er*0.12,ey,er*0.3,er*0.95);c.fillStyle=OL;c.fill();
    c.fillStyle='#fff';c.beginPath();c.arc(ex-er*0.2,ey-er*0.45,er*0.28,0,7);c.fill();
    c.beginPath();c.arc(ex+er*0.3,ey+er*0.4,er*0.13,0,7);c.fill();
  });
  c.fillStyle='rgba(255,110,150,.38)';
  [-1,1].forEach(s=>{ell(c,hx+s*hrx*0.7,hy+hry*0.4,r*0.2,r*0.12);c.fill();});
  c.beginPath();c.moveTo(hx-r*0.14,hy+hry*0.22);c.lineTo(hx+r*0.14,hy+hry*0.22);c.lineTo(hx,hy+hry*0.38);c.closePath();c.fillStyle='#ff7d9c';c.fill();c.lineWidth=lw*0.5;c.strokeStyle=OL;c.stroke();
  if(air||o.hiss){ell(c,hx,hy+hry*0.62,r*0.15,r*0.19);c.fillStyle='#7a1f3a';c.fill();c.lineWidth=lw*0.5;c.stroke();}
  else{c.strokeStyle=OL;c.lineWidth=lw*0.6;c.lineCap='round';c.beginPath();c.moveTo(hx,hy+hry*0.38);c.lineTo(hx,hy+hry*0.5);c.moveTo(hx-r*0.27,hy+hry*0.55);c.quadraticCurveTo(hx-r*0.05,hy+hry*0.63,hx,hy+hry*0.5);c.quadraticCurveTo(hx+r*0.05,hy+hry*0.63,hx+r*0.27,hy+hry*0.55);c.stroke();}
  c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=1;
  [-1,1].forEach(s=>{for(let k=-1;k<=1;k++){c.beginPath();c.moveTo(hx+s*hrx*0.62,hy+hry*(0.4+k*0.05));c.lineTo(hx+s*hrx*1.55,hy+hry*(0.32+k*0.22));c.stroke();}});
  // collar / bow tie
  const cy2=hy+hry*0.76;
  if(cat.bow){
    const bx2=hx,by2=cy2+hry*0.14;
    [-1,1].forEach(s=>{c.beginPath();c.moveTo(bx2,by2);c.lineTo(bx2+s*r*0.6,by2-r*0.28);c.lineTo(bx2+s*r*0.6,by2+r*0.28);c.closePath();fillOL(c,'#e63946',lw*0.8);});
    c.beginPath();c.arc(bx2,by2,r*0.15,0,7);fillOL(c,'#b3202d',lw*0.7);
  } else {
    c.lineCap='round';
    c.beginPath();c.ellipse(hx,cy2,hrx*0.8,hry*0.22,0,0.12,Math.PI-0.12);
    c.strokeStyle=OL;c.lineWidth=r*0.3+lw*1.6;c.stroke();
    c.strokeStyle=cat.collar;c.lineWidth=r*0.3;c.stroke();
    c.beginPath();c.arc(hx,cy2+hry*0.26,r*0.17,0,7);fillOL(c,'#ffd84a',lw*0.7);
  }
  c.restore();
}

function cloud(x,y,s,a){
  ctx.globalAlpha=a;
  [[0,0,30],[28,-10,26],[-28,-4,22],[54,2,20],[-52,4,17]].forEach(([dx,dy,r])=>{ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x+dx*s,y+dy*s,r*s,0,7);ctx.fill();});
  ctx.fillStyle='rgba(150,190,230,.35)';ctx.beginPath();ctx.ellipse(x,y+14*s,68*s,9*s,0,0,7);ctx.fill();
  ctx.globalAlpha=1;
}
function skyline(par,col,minH,maxH,seed,lit,baseY){
  const cw=104,off=cam*par,first=Math.floor(off/cw);
  for(let k=0;k<Math.ceil(VW/cw)+2;k++){
    const i=first+k, bw=62+hsh(i*3+seed)*38, bh=minH+hsh(i*7+seed)*(maxH-minH), sx=i*cw-off+(cw-bw)/2, top=baseY-bh;
    ctx.fillStyle=col; ctx.fillRect(sx,top,bw,bh+80);
    ctx.fillStyle='rgba(255,255,255,.07)'; ctx.fillRect(sx,top,bw*0.18,bh+80);
    const kind=hsh(i*11+seed);
    if(kind<0.2){ctx.fillRect(sx+bw*0.45,top-26,3,26);ctx.fillRect(sx+bw*0.3,top-16,bw*0.4,2);}
    else if(kind<0.35){ctx.fillRect(sx+bw*0.2,top-22,bw*0.6,14);ctx.beginPath();ctx.moveTo(sx+bw*0.15,top-22);ctx.lineTo(sx+bw*0.5,top-36);ctx.lineTo(sx+bw*0.85,top-22);ctx.fill();ctx.fillRect(sx+bw*0.3,top-8,3,8);ctx.fillRect(sx+bw*0.7,top-8,3,8);}
    else if(kind<0.5){ctx.fillRect(sx+bw*0.7,top-18,10,18);}
    if(lit){
      for(let wy=10;wy<bh-6;wy+=22)for(let wx=8;wx<bw-12;wx+=16){
        const hv=hsh(i*131+wy*7+wx*3+seed+(hsh(i*7+wy+wx)<0.14?Math.floor(tick/180):0));
        if(hv<0.42){ctx.fillStyle=hv<0.1?lit[1]:lit[0];ctx.fillRect(sx+wx,top+wy,8,12);}
      }
    }
  }
}
function drawBG(){
  const th=L.theme, ti=THEMES.indexOf(th);
  if(th.cfg){drawThemeBG(th);return;}
  if(ti===3){drawKitchenBG();drawBGFX(3);return;}
  const g=ctx.createLinearGradient(0,0,0,VH);
  if(ti===0){g.addColorStop(0,'#3ea9f5');g.addColorStop(0.6,'#9fdcff');g.addColorStop(1,'#e8f8ff');}
  else if(ti===1){g.addColorStop(0,'#3a2a6e');g.addColorStop(0.35,'#c4457a');g.addColorStop(0.7,'#ff8f5b');g.addColorStop(1,'#ffd88a');}
  else{g.addColorStop(0,'#050818');g.addColorStop(0.6,'#1b1d52');g.addColorStop(1,'#3b2f78');}
  ctx.fillStyle=g; ctx.fillRect(0,0,VW,VH);

  if(ti===0){
    glow(ctx,650,90,260,'255,244,190',0.85);
    ctx.fillStyle='#fff7b8'; ctx.beginPath(); ctx.arc(650,90,36,0,7); ctx.fill();
    ctx.fillStyle='#fffbe0'; ctx.beginPath(); ctx.arc(644,84,26,0,7); ctx.fill();
    for(let i=0;i<5;i++){const cx=((i*260-cam*0.12-tick*0.15)%1500+1500)%1500-180; cloud(cx,60+(i%3)*50,0.9+(i%2)*0.35,0.92);}
    // far hills
    [[0.15,'#8fd7a6','#b6e8bf',250,36,.0035],[0.3,'#62bf79','#8ad79a',290,30,.006]].forEach(([par,c1,c2,base,amp,fq],li)=>{
      const gr=ctx.createLinearGradient(0,base-amp,0,VH);gr.addColorStop(0,c2);gr.addColorStop(1,c1);
      ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(0,VH);
      for(let sx=0;sx<=VW;sx+=8){const wx=sx+cam*par;ctx.lineTo(sx,base+Math.sin(wx*fq*3+li)*amp*0.6+Math.sin(wx*fq*8+li*2)*amp*0.35);}
      ctx.lineTo(VW,VH);ctx.fill();
    });
    // trees
    const off=cam*0.5,cw=150,first=Math.floor(off/cw);
    for(let k=0;k<Math.ceil(VW/cw)+2;k++){
      const i=first+k,x=i*cw-off+hsh(i)*60,sc=0.8+hsh(i*5)*0.6,by=372;
      ctx.fillStyle='#6d4524';ctx.fillRect(x-6*sc,by-60*sc,12*sc,62*sc);
      [['#2f8f46',0,-86,38],['#3da557',-22,-70,28],['#3da557',22,-68,28],['#58c26f',-6,-96,26],['#7bd88b',-12,-100,12]].forEach(([c,dx,dy,r])=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x+dx*sc+Math.sin(tick*0.03+i+dx)*2.2*sc,by+dy*sc,r*sc,0,7);ctx.fill();});
    }
    // bushes + flowers
    const off2=cam*0.75,cw2=90,f2=Math.floor(off2/cw2);
    for(let k=0;k<Math.ceil(VW/cw2)+2;k++){
      const i=f2+k,x=i*cw2-off2+hsh(i*9)*40,by=388;
      [['#2c8a44',0,-14,20],['#379c52',-16,-10,15],['#379c52',16,-10,15],['#4cb868',-4,-20,10]].forEach(([c,dx,dy,r])=>{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x+dx,by+dy,r,0,7);ctx.fill();});
      if(hsh(i*4)>0.4){ctx.fillStyle=['#ff6f91','#ffd84a','#fff'][i%3];[[-10,-22],[6,-26],[14,-14]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(x+dx,by+dy,2.6,0,7);ctx.fill();});}
    }
  } else if(ti===1){
    glow(ctx,520,300,330,'255,200,110',0.9);
    ctx.fillStyle='#fff0b0';ctx.beginPath();ctx.arc(520,290,52,0,7);ctx.fill();
    for(let i=0;i<5;i++){const cx=((i*300-cam*0.1-tick*0.2)%1700+1700)%1700-250,cy=90+(i%3)*45;ctx.fillStyle=i%2?'rgba(255,170,150,.55)':'rgba(255,120,150,.45)';ctx.beginPath();ctx.ellipse(cx,cy,110,9,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(cx+40,cy+12,70,6,0,0,7);ctx.fill();}
    ctx.fillStyle='rgba(30,10,50,.7)';
    for(let i=0;i<6;i++){const bx=((i*170+tick*0.7)%1000)-100,by=130+Math.sin(i*2+tick*0.03)*14+(i%3)*18,fl=Math.sin(tick*0.25+i)*3;ctx.beginPath();ctx.moveTo(bx-8,by+fl);ctx.quadraticCurveTo(bx,by-4,bx+8,by+fl);ctx.lineWidth=1.8;ctx.strokeStyle='rgba(40,15,60,.75)';ctx.stroke();}
    skyline(0.12,'#7a4a86',90,200,5,null,430);
    skyline(0.25,'#5a3470',80,210,17,['#ffd88a','#ff9fb8'],440);
    const f=ctx.createLinearGradient(0,300,0,VH);f.addColorStop(0,'rgba(255,170,120,0)');f.addColorStop(1,'rgba(255,150,110,.5)');ctx.fillStyle=f;ctx.fillRect(0,300,VW,VH-300);
  } else {
    for(let i=0;i<110;i++){const sx=(i*137.5)%VW,sy=(i*61.3)%300;ctx.globalAlpha=0.35+0.65*Math.abs(Math.sin(tick*0.03+i));ctx.fillStyle=i%7===0?'#bfe6ff':'#fff';const s=i%4===0?2.4:1.4;ctx.fillRect(sx,sy,s,s);}
    ctx.globalAlpha=1;
    glow(ctx,620,95,200,'200,210,255',0.6);
    ctx.fillStyle='#fff6d0';ctx.beginPath();ctx.arc(620,95,42,0,7);ctx.fill();
    ctx.fillStyle='rgba(200,190,150,.5)';[[-12,-8,8],[10,10,10],[8,-16,5],[-14,14,5]].forEach(([dx,dy,r])=>{ctx.beginPath();ctx.arc(620+dx,95+dy,r,0,7);ctx.fill();});
    const sp=tick%700;if(sp<30){const px=200+sp*14,py=40+sp*5;const gr=ctx.createLinearGradient(px,py,px-70,py-25);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');ctx.strokeStyle=gr;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-70,py-25);ctx.stroke();}
    skyline(0.12,'#1c2158',100,210,3,null,430);
    skyline(0.28,'#141845',90,220,9,['#ffd86b','#7ee8ff'],440);
    // neon signs
    const off=cam*0.28,cw=104,first=Math.floor(off/cw);
    for(let k=0;k<Math.ceil(VW/cw)+2;k++){
      const i=first+k;if(hsh(i*17+9)<0.62)continue;
      const bw=62+hsh(i*3+9)*38,bh=90+hsh(i*7+9)*220,sx=i*cw-off+(cw-bw)/2,top=440-bh,col=hsh(i)>0.5?'255,60,170':'60,230,255';
      const fl=0.75+0.25*Math.sin(tick*0.1+i*3);
      glow(ctx,sx+bw/2,top+30,70,col,0.5*fl);
      ctx.fillStyle='rgba('+col+','+fl+')';rr(ctx,sx+bw*0.2,top+22,bw*0.6,12,6);ctx.fill();
    }
    const f=ctx.createLinearGradient(0,280,0,VH);f.addColorStop(0,'rgba(120,90,200,0)');f.addColorStop(1,'rgba(120,90,200,.45)');ctx.fillStyle=f;ctx.fillRect(0,280,VW,VH-280);
  }
  drawBGFX(ti);
}
function groundTile(gs,sx,sy,tx,ty,pal,seed,cfg){
  const open=!solid(tile(tx,ty-1));
  const grd=ctx.createLinearGradient(0,sy,0,sy+TS);grd.addColorStop(0,pal.a);grd.addColorStop(1,pal.b);
  ctx.fillStyle=grd;ctx.fillRect(sx,sy,TS,TS);
  ctx.save();ctx.beginPath();ctx.rect(sx,sy,TS,TS);ctx.clip();
  const dk='rgba(0,0,0,.2)',lt='rgba(255,255,255,.18)';
  switch(gs){
    case 'grass':
      ctx.fillStyle='rgba(0,0,0,.16)';[[6,16,5,3],[20,24,6,4],[14,8,3,3]].forEach(([dx,dy,w,h],k)=>{if(hsh(seed+k)>0.35){ctx.beginPath();ctx.ellipse(sx+dx,sy+dy,w/2+1,h/2+1,0,0,7);ctx.fill();}});
      ctx.fillStyle='rgba(255,230,180,.12)';if(hsh(seed)>0.6){ctx.beginPath();ctx.ellipse(sx+22,sy+12,4,2.5,0,0,7);ctx.fill();}
      break;
    case 'brick':{
      const bh=TS/2;
      for(let row=0;row<2;row++){
        const offx=(row+ty)%2?TS/2:0;
        for(let bxp=-TS/2;bxp<TS+TS/2;bxp+=TS){const x0=sx+bxp+offx,v=hsh(seed+row*5+bxp)*0.16;ctx.fillStyle='rgba(255,255,255,'+(v*0.5)+')';ctx.fillRect(Math.max(sx,x0+1),sy+row*bh+1,TS-1,bh-1);}
        ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sx,sy+row*bh+.5);ctx.lineTo(sx+TS,sy+row*bh+.5);ctx.stroke();
        for(let bxp=-TS/2;bxp<TS+TS/2;bxp+=TS){const lx=sx+bxp+offx;if(lx>=sx&&lx<=sx+TS){ctx.beginPath();ctx.moveTo(lx+.5,sy+row*bh);ctx.lineTo(lx+.5,sy+row*bh+bh);ctx.stroke();}}
      }
      break;}
    case 'checker':
      ctx.fillStyle=(tx+ty)%2?(cfg?shade(pal.a,.75):'#f6f2ea'):(cfg?pal.b:'#34343f');ctx.fillRect(sx,sy,TS,TS);
      ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(sx,sy,TS,3);break;
    case 'planks':
      for(let r=0;r<2;r++){const y=sy+r*16;ctx.fillStyle=r?dk:lt;ctx.fillRect(sx,y,TS,2);ctx.fillStyle=dk;ctx.fillRect(sx,y+14,TS,2);
        const jx=sx+((tx*13+r*7)%24)+4;ctx.fillRect(jx,y+2,1.5,12);
        if(hsh(seed+r*3)>0.7){ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(sx+10+hsh(seed+r)*12,y+8,3,2,0,0,7);ctx.stroke();}}
      break;
    case 'tile':
      ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=1;ctx.strokeRect(sx+.5,sy+.5,TS/2,TS/2);ctx.strokeRect(sx+TS/2+.5,sy+.5,TS/2-1,TS/2);ctx.strokeRect(sx+.5,sy+TS/2+.5,TS/2,TS/2-1);ctx.strokeRect(sx+TS/2+.5,sy+TS/2+.5,TS/2-1,TS/2-1);
      ctx.fillStyle=lt;ctx.fillRect(sx+2,sy+2,TS/2-4,2);ctx.fillRect(sx+TS/2+2,sy+TS/2+2,TS/2-4,2);break;
    case 'metal':
      ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.5;ctx.strokeRect(sx+1.5,sy+1.5,TS-3,TS-3);
      ctx.fillStyle='rgba(0,0,0,.35)';[[5,5],[TS-5,5],[5,TS-5],[TS-5,TS-5]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(sx+dx,sy+dy,1.6,0,7);ctx.fill();});
      ctx.fillStyle=lt;ctx.fillRect(sx+4,sy+TS/2-1,TS-8,2);break;
    case 'sand':
      ctx.fillStyle='rgba(0,0,0,.1)';for(let k=0;k<6;k++)ctx.fillRect(sx+hsh(seed+k)*TS,sy+hsh(seed+k+9)*TS,2,2);
      ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(sx,sy+18);ctx.quadraticCurveTo(sx+16,sy+13,sx+TS,sy+18);ctx.stroke();break;
    case 'snow':
      ctx.fillStyle='rgba(255,255,255,.7)';for(let k=0;k<7;k++){ctx.beginPath();ctx.arc(sx+hsh(seed+k)*TS,sy+hsh(seed+k+9)*TS,1+hsh(seed+k+3)*1.5,0,7);ctx.fill();}
      ctx.strokeStyle='rgba(120,170,220,.3)';ctx.beginPath();ctx.moveTo(sx+4,sy+TS);ctx.lineTo(sx+14,sy+14);ctx.lineTo(sx+22,sy+TS);ctx.stroke();break;
    case 'stone':
      ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(sx,sy+11+hsh(seed)*6);ctx.lineTo(sx+TS,sy+11+hsh(seed+1)*6);ctx.moveTo(sx+8+hsh(seed+2)*14,sy);ctx.lineTo(sx+8+hsh(seed+2)*14,sy+14);ctx.moveTo(sx+6+hsh(seed+3)*16,sy+16);ctx.lineTo(sx+6+hsh(seed+3)*16,sy+TS);ctx.stroke();
      ctx.fillStyle=lt;ctx.fillRect(sx+2,sy+2,10,2);break;
    case 'candy':
      ctx.fillStyle='rgba(255,255,255,.32)';for(let k=-1;k<4;k++){ctx.beginPath();ctx.moveTo(sx+k*12,sy+TS);ctx.lineTo(sx+k*12+6,sy+TS);ctx.lineTo(sx+k*12+6+TS,sy);ctx.lineTo(sx+k*12+TS,sy);ctx.closePath();ctx.fill();}break;
    case 'cloud':
      ctx.fillStyle='rgba(255,255,255,.55)';[[6,10,9],[20,22,10],[26,8,7]].forEach(([dx,dy,r],k)=>{ctx.beginPath();ctx.arc(sx+dx,sy+dy+hsh(seed+k)*4,r,0,7);ctx.fill();});break;
    case 'carpet':
      ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=1.2;for(let k=0;k<12;k++){const px=sx+hsh(seed+k)*TS,py=sy+hsh(seed+k+4)*TS;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+2,py-3);ctx.stroke();}break;
    case 'stripes':
      ctx.fillStyle='rgba(255,255,255,.2)';for(let k=0;k<4;k++)if((k+tx)%2===0)ctx.fillRect(sx+k*8,sy,8,TS);break;
    case 'hay':
      ctx.strokeStyle='rgba(120,80,10,.35)';ctx.lineWidth=1.3;for(let k=0;k<9;k++){const px=sx+hsh(seed+k)*TS,py=sy+hsh(seed+k+4)*TS;ctx.beginPath();ctx.moveTo(px-4,py+3);ctx.lineTo(px+4,py-3);ctx.stroke();}break;
    case 'keys':
      ctx.fillStyle='#fdfdfd';ctx.fillRect(sx,sy,TS,TS);ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(sx+TS-1,sy,1,TS);
      if(tx%7!==2&&tx%7!==6){ctx.fillStyle='#16161c';ctx.fillRect(sx+TS-6,sy,12,TS*0.55);}break;
    case 'cheese':
      ctx.fillStyle='rgba(120,70,0,.28)';[[8,10,4],[22,22,5],[24,8,3]].forEach(([dx,dy,r],k)=>{if(hsh(seed+k)>0.3){ctx.beginPath();ctx.arc(sx+dx,sy+dy,r,0,7);ctx.fill();}});break;
  }
  ctx.restore();
  if(ty>12){ctx.fillStyle='rgba(0,0,0,'+Math.min(0.35,(ty-12)*0.12)+')';ctx.fillRect(sx,sy,TS,TS);}
  if(open){
    if(gs==='grass'){
      const tg=ctx.createLinearGradient(0,sy,0,sy+10);tg.addColorStop(0,pal.top);tg.addColorStop(1,pal.top2);
      ctx.fillStyle=tg;ctx.fillRect(sx,sy,TS,9);ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(sx,sy,TS,2);ctx.fillStyle=pal.edge;ctx.fillRect(sx,sy+9,TS,1.5);
      ctx.fillStyle=pal.top2;for(let k=0;k<4;k++){const bxp=sx+k*8+2;ctx.beginPath();ctx.moveTo(bxp,sy+9);ctx.lineTo(bxp+2,sy+16-hsh(seed+k)*4);ctx.lineTo(bxp+5,sy+9);ctx.fill();}
      ctx.fillStyle=pal.top;for(let k=0;k<4;k++){const bxp=sx+k*8+1;ctx.beginPath();ctx.moveTo(bxp,sy);ctx.lineTo(bxp+2+Math.sin(tick*0.07+tx*0.6+k)*1.8,sy-3-hsh(seed+k+9)*3);ctx.lineTo(bxp+5,sy);ctx.fill();}
      const fv=hsh(seed+77);if(fv>0.86){ctx.fillStyle='#2f8f46';ctx.fillRect(sx+15,sy-8,1.6,8);ctx.fillStyle=['#ff6f91','#ffd84a','#fff','#c9a3ff'][Math.floor(fv*40)%4];for(let a=0;a<5;a++){ctx.beginPath();ctx.arc(sx+16+Math.cos(a*1.26)*3,sy-9+Math.sin(a*1.26)*3,2,0,7);ctx.fill();}ctx.fillStyle='#ffe66a';ctx.beginPath();ctx.arc(sx+16,sy-9,1.6,0,7);ctx.fill();}
    } else if(gs==='snow'){
      ctx.fillStyle='#fff';ctx.fillRect(sx,sy,TS,8);for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(sx+5+k*11,sy+8,4+hsh(seed+k)*2,0,7);ctx.fill();}
      ctx.fillStyle='rgba(120,170,220,.35)';ctx.fillRect(sx,sy+8,TS,1.5);
    } else if(gs==='cloud'){
      ctx.fillStyle='#fff';for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(sx+5+k*11,sy+3,6+hsh(seed+k)*2,0,7);ctx.fill();}
    } else if(gs==='candy'){
      ctx.fillStyle=pal.top;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+TS,sy);ctx.lineTo(sx+TS,sy+7);for(let k=4;k>=0;k--)ctx.quadraticCurveTo(sx+k*8+4,sy+13,sx+k*8,sy+7);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(sx,sy,TS,2);
    } else if(gs==='carpet'){
      ctx.fillStyle=pal.top;ctx.fillRect(sx,sy,TS,7);ctx.strokeStyle=pal.top;ctx.lineWidth=1.4;for(let k=0;k<9;k++){ctx.beginPath();ctx.moveTo(sx+k*4,sy+2);ctx.lineTo(sx+k*4+1,sy-3-hsh(seed+k)*2);ctx.stroke();}
    } else if(gs==='sand'){
      ctx.fillStyle=pal.top;ctx.fillRect(sx,sy,TS,6);ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(sx,sy,TS,2);ctx.fillStyle=pal.edge;ctx.fillRect(sx,sy+6,TS,1.2);
    } else {
      const tg=ctx.createLinearGradient(0,sy,0,sy+10);tg.addColorStop(0,pal.top);tg.addColorStop(1,pal.top2);
      ctx.fillStyle=tg;ctx.fillRect(sx,sy,TS,9);ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(sx,sy,TS,2);ctx.fillStyle=pal.edge;ctx.fillRect(sx,sy+9,TS,1.5);
      if(cfg&&cfg.neon){ctx.fillStyle='rgba(120,230,255,.85)';ctx.fillRect(sx,sy+9,TS,1.5);}
    }
  }
  if(!solid(tile(tx-1,ty))&&tx>0){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(sx,sy,2,TS);}
  if(!solid(tile(tx+1,ty))){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(sx+TS-2,sy,2,TS);}
}
var TF=0,TC0=0,TC1=0;
function drawTiles(){
  const th=L.theme,cfg=th.cfg,ti=cfg?-1:THEMES.indexOf(th);
  const LEG=[{a:'#9a6a3a',b:'#6e4423',edge:'#3e2410',top:'#5fcf5d',top2:'#3aa044'},{a:'#b4605a',b:'#7e3c3d',edge:'#3d1d2a',top:'#d7c3b0',top2:'#a8907f'},{a:'#3c4278',b:'#262a56',edge:'#10122e',top:'#6f7ac8',top2:'#444d99'},{a:'#ddd',b:'#aaa',edge:'#3a3a48',top:'#eceff4',top2:'#aab1bf'}];
  const pal=cfg?cfg.pal:LEG[ti], gs=cfg?cfg.gs:['grass','brick','brick','checker'][ti];
  const pp=cfg?[shade(cfg.plat,.25),shade(cfg.plat,-.35)]:[['#e0a050','#a8672c'],['#e0a074','#a56a4a'],['#8c78c0','#4a3c82'],['#e0a050','#a8672c']][ti];
  const neon=ti===2||(cfg&&cfg.neon);
  let c0=Math.max(0,Math.floor(cam/TS)),c1=Math.min(L.W-1,Math.floor((cam+VW)/TS));if(TF===1){c0=TC0;c1=TC1;}
  for(let ty=0;ty<ROWS;ty++)for(let tx=c0;tx<=c1;tx++){
    const ch=L.g[ty][tx];if(ch===' ')continue;if(TF&&((TF===1)!==('#=b^'.indexOf(ch)>=0)))continue;
    const sx=Math.round(tx*TS-cam),sy=ty*TS,seed=tx*31+ty*17;
    if(ch==='#'){groundTile(gs,sx,sy,tx,ty,pal,seed,cfg);}
    else if(ch==='='){
      const pg=ctx.createLinearGradient(0,sy,0,sy+TS);pg.addColorStop(0,pp[0]);pg.addColorStop(1,pp[1]);
      ctx.fillStyle=pg;rr(ctx,sx+0.5,sy+1,TS-1,TS-2,4);ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(sx+3,sy+3,TS-6,3);
      ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=1;for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(sx+4,sy+12+k*6);ctx.quadraticCurveTo(sx+16,sy+10+k*6+hsh(seed+k)*3,sx+TS-4,sy+12+k*6);ctx.stroke();}
      ctx.fillStyle=OL;[[6,TS-8],[TS-8,TS-8]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(sx+dx,sy+dy,1.6,0,7);ctx.fill();});
      if(neon)glow(ctx,sx+16,sy+TS,26,'120,230,255',0.4);
    } else if(ch==='b'){
      const bg=ctx.createLinearGradient(0,sy,0,sy+TS);bg.addColorStop(0,'#f0bf5a');bg.addColorStop(1,'#c88a2c');
      ctx.fillStyle=bg;rr(ctx,sx+1,sy+1,TS-2,TS-2,4);ctx.fill();
      ctx.strokeStyle='#7a4a10';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(sx+5,sy+5);ctx.lineTo(sx+TS-5,sy+TS-5);ctx.moveTo(sx+TS-5,sy+5);ctx.lineTo(sx+5,sy+TS-5);ctx.stroke();
      ctx.strokeStyle=OL;ctx.lineWidth=2;rr(ctx,sx+1,sy+1,TS-2,TS-2,4);ctx.stroke();
      ctx.fillStyle='#6b3f0c';[[4,4],[TS-4,4],[4,TS-4],[TS-4,TS-4]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(sx+dx,sy+dy,1.8,0,7);ctx.fill();});
      ctx.fillStyle='#fff6dc';ctx.beginPath();ctx.ellipse(sx+16,sy+16,8,6,0,0,7);ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.stroke();
      ctx.fillStyle='#4aa8e8';ctx.beginPath();ctx.ellipse(sx+15,sy+16,5,3,0,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(sx+19,sy+16);ctx.lineTo(sx+24,sy+12);ctx.lineTo(sx+24,sy+20);ctx.fill();
    } else if(ch==='^'){
      for(let k=0;k<2;k++){const bx=sx+k*16;ctx.beginPath();ctx.moveTo(bx+1,sy+TS);ctx.lineTo(bx+8,sy+8);ctx.lineTo(bx+15,sy+TS);ctx.closePath();
        const sg=ctx.createLinearGradient(bx,0,bx+16,0);sg.addColorStop(0,'#eef1f8');sg.addColorStop(0.5,'#b9bfd0');sg.addColorStop(1,'#7c8398');
        ctx.fillStyle=sg;ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=1.6;ctx.lineJoin='round';ctx.stroke();}
    } else if(ch==='y'){
      const sq=(P&&state==='play'&&Math.abs(P.x+P.w/2-(tx*TS+16))<24&&P.y+P.h>sy-6)?0.82:1,cy=sy+TS-13*sq;
      ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(sx+16,sy+TS-1,13,3,0,0,7);ctx.fill();
      const yg=ctx.createRadialGradient(sx+12,cy-5,2,sx+16,cy,15);yg.addColorStop(0,'#ff9aaa');yg.addColorStop(1,'#d92c52');
      ctx.beginPath();ctx.ellipse(sx+16,cy,13.5,12.5*sq,0,0,7);fillOL(ctx,yg,2);
      ctx.strokeStyle='rgba(120,10,40,.55)';ctx.lineWidth=1.4;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.ellipse(sx+16,cy,13-Math.abs(k)*3,12*sq,k*0.7,0.3,2.7);ctx.stroke();}
    } else if(ch==='C'){
      const on=cp&&cp.tx===tx;
      ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(sx+16,sy+TS,14,3,0,0,7);ctx.fill();
      ctx.fillStyle='#6b4423';rr(ctx,sx+4,sy+TS-5,24,6,3);ctx.fill();
      ctx.beginPath();ctx.rect(sx+11,sy-18,10,TS+14);fillOL(ctx,'#e3c795',1.8);
      ctx.strokeStyle='rgba(120,80,30,.55)';ctx.lineWidth=1.4;for(let k=0;k<7;k++){ctx.beginPath();ctx.moveTo(sx+11,sy-14+k*7);ctx.lineTo(sx+21,sy-11+k*7);ctx.stroke();}
      ctx.beginPath();ctx.moveTo(sx+21,sy-18);ctx.lineTo(sx+35,sy-12+Math.sin(tick*0.15)*1.8);ctx.lineTo(sx+21,sy-5);ctx.closePath();fillOL(ctx,on?'#7bea6a':'#c8ccd6',1.5);
      if(on)glow(ctx,sx+16,sy-8,34,'140,255,120',0.4+0.2*Math.sin(tick*0.1));
    }
  }
}

function drawGoal(){
  if(!L.goal)return;
  const gx=Math.round(L.goal.x-cam)+16,gy=L.goal.y;
  glow(ctx,gx,gy+10,70,'255,220,120',0.5+0.2*Math.sin(tick*0.08));
  ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(gx,gy+TS,28,5,0,0,7);ctx.fill();
  const fy=gy+2+Math.sin(tick*0.1)*2;
  ctx.fillStyle='#ffb84d';ctx.beginPath();ctx.ellipse(gx,fy,17,9,0,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(gx+14,fy);ctx.lineTo(gx+27,fy-8);ctx.lineTo(gx+27,fy+8);ctx.closePath();fillOL(ctx,'#ff9f2e',1.5);
  ctx.beginPath();ctx.ellipse(gx,fy,17,9,0,0,7);ctx.lineWidth=2;ctx.strokeStyle=OL;ctx.stroke();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(gx-8,fy-2,2.6,0,7);ctx.fill();ctx.fillStyle=OL;ctx.beginPath();ctx.arc(gx-8,fy-2,1.2,0,7);ctx.fill();
  const bg=ctx.createLinearGradient(0,gy+8,0,gy+TS);bg.addColorStop(0,'#ff6b8a');bg.addColorStop(1,'#c9304f');
  ctx.beginPath();ctx.moveTo(gx-24,gy+8);ctx.lineTo(gx+24,gy+8);ctx.quadraticCurveTo(gx+22,gy+TS+2,gx+14,gy+TS);ctx.lineTo(gx-14,gy+TS);ctx.quadraticCurveTo(gx-22,gy+TS+2,gx-24,gy+8);ctx.closePath();fillOL(ctx,bg,2);
  ctx.beginPath();ctx.ellipse(gx,gy+8,24,5,0,0,7);fillOL(ctx,'#fff0f3',2);
  ctx.fillStyle='#fff';ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.fillText('♥ FISH ♥',gx,gy+25);
  const by=gy-34+Math.sin(tick*0.12)*4;
  ctx.fillStyle='#ffd84a';ctx.beginPath();ctx.moveTo(gx-9,by);ctx.lineTo(gx+9,by);ctx.lineTo(gx,by+11);ctx.closePath();fillOL(ctx,'#ffd84a',2);
  for(let i=0;i<3;i++){const sp=(tick*0.5+i*20)%40;ctx.fillStyle='rgba(255,255,255,'+(1-sp/40)+')';ctx.beginPath();ctx.arc(gx-14+i*14,gy-sp*0.8,2,0,7);ctx.fill();}
}
function drawBGFX(ti){
  if(ti===0){
    for(let i=0;i<6;i++){
      const x=((i*173+tick*(0.5+(i%3)*0.2))%1000)-100, y=230+Math.sin(tick*0.04+i*2)*45+(i%3)*18, f=Math.abs(Math.cos(tick*0.35+i));
      ctx.save();ctx.translate(x,y);ctx.fillStyle=['#ff7fb0','#ffd84a','#7fd0ff'][i%3];ctx.strokeStyle=OL;ctx.lineWidth=0.8;
      [-1,1].forEach(s=>{ctx.beginPath();ctx.ellipse(s*(1+4*f),-1,4*f+0.7,5,s*0.4,0,7);ctx.fill();ctx.stroke();});
      ctx.fillStyle=OL;ctx.fillRect(-0.7,-4,1.4,8);ctx.restore();
    }
    ctx.strokeStyle='rgba(40,60,90,.7)';ctx.lineWidth=1.8;
    for(let i=0;i<5;i++){const bx=((tick*0.6+i*38)%1100)-120,by=60+i*9+Math.abs(i-2)*7,fl=Math.sin(tick*0.25+i)*4;ctx.beginPath();ctx.moveTo(bx-8,by+fl);ctx.quadraticCurveTo(bx-3,by-4,bx,by);ctx.quadraticCurveTo(bx+3,by-4,bx+8,by+fl);ctx.stroke();}
  } else if(ti===1){
    ctx.save();ctx.translate(520,290);ctx.rotate(tick*0.004);ctx.fillStyle='rgba(255,230,160,.10)';
    for(let i=0;i<12;i++){ctx.rotate(Math.PI/6);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-18,-460);ctx.lineTo(18,-460);ctx.fill();}
    ctx.restore();
    const bx=((tick*0.18)%1100)-150, by=110+Math.sin(tick*0.02)*8;
    ctx.save();ctx.translate(bx,by);
    ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-12,24);ctx.lineTo(-8,38);ctx.moveTo(12,24);ctx.lineTo(8,38);ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,26,0,7);fillOL(ctx,'#ff6f6f',2);
    ctx.save();ctx.beginPath();ctx.arc(0,0,26,0,7);ctx.clip();ctx.fillStyle='#ffd84a';ctx.fillRect(-9,-30,18,60);ctx.fillStyle='#fff';ctx.fillRect(-2,-30,4,60);ctx.restore();
    ctx.beginPath();ctx.arc(0,0,26,0,7);ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();ctx.rect(-9,36,18,11);fillOL(ctx,'#9a6330',2);
    ctx.restore();
  } else if(ti===2){
    ctx.save();ctx.translate(200,VH);ctx.rotate(-0.35+Math.sin(tick*0.012)*0.6);
    const lg=ctx.createLinearGradient(0,0,0,-460);lg.addColorStop(0,'rgba(200,230,255,.28)');lg.addColorStop(1,'rgba(200,230,255,0)');
    ctx.fillStyle=lg;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-60,-460);ctx.lineTo(60,-460);ctx.lineTo(10,0);ctx.fill();ctx.restore();
    const px=((tick*0.8)%1300)-200;ctx.fillStyle='#0b0d22';ctx.fillRect(px,70,18,3);
    if(Math.floor(tick/20)%2)glow(ctx,px+18,72,14,'255,60,60',0.9);
    ctx.fillStyle='#07091c';
    for(let i=0;i<4;i++){
      const bx=((i*260+tick*(1+i*0.3))%1200)-100,by=150+Math.sin(tick*0.05+i*3)*40+i*20,fl=Math.sin(tick*0.4+i)*6;
      ctx.beginPath();ctx.ellipse(bx,by,5,3.5,0,0,7);ctx.fill();
      ctx.beginPath();ctx.moveTo(bx-3,by);ctx.quadraticCurveTo(bx-14,by-8+fl,bx-18,by+2);ctx.quadraticCurveTo(bx-10,by+1,bx-3,by+3);ctx.fill();
      ctx.beginPath();ctx.moveTo(bx+3,by);ctx.quadraticCurveTo(bx+14,by-8+fl,bx+18,by+2);ctx.quadraticCurveTo(bx+10,by+1,bx+3,by+3);ctx.fill();
    }
    for(let i=0;i<4;i++){
      const fx=((i*320-tick*(0.3+i*0.1)-cam*0.2)%1400+1400)%1400-300,fy=330+i*28;
      const fg=ctx.createRadialGradient(fx,fy,0,fx,fy,240);fg.addColorStop(0,'rgba(150,130,230,.22)');fg.addColorStop(1,'rgba(150,130,230,0)');
      ctx.fillStyle=fg;ctx.fillRect(fx-240,fy-60,480,120);
    }
  } else if(ti===3){
    const bo=cam*0.6,bc=96,bf=Math.floor(bo/bc);
    for(let k=0;k<Math.ceil(VW/bc)+2;k++){
      const i=bf+k,x=i*bc-bo+bc/2;
      if(hsh(i*13+4)<0.7)continue;
      ctx.beginPath();ctx.rect(x-17,298,34,28);fillOL(ctx,'#8d93a3',2);
      ctx.beginPath();ctx.ellipse(x,298,19,4.5,0,0,7);fillOL(ctx,'#b9bfce',2);
      ctx.fillStyle='#555';ctx.fillRect(x-24,306,8,4);ctx.fillRect(x+16,306,8,4);
      for(let j=0;j<4;j++){
        const age=(tick*0.5+j*18+i*7)%72,py=292-age,px2=x+Math.sin(age*0.1+j+i)*6,r=5+age*0.13;
        ctx.fillStyle='rgba(255,255,255,'+((1-age/72)*0.5)+')';ctx.beginPath();ctx.arc(px2,py,r,0,7);ctx.fill();
      }
    }
    ctx.fillStyle='rgba(60,50,40,.7)';
    for(let i=0;i<5;i++){
      const mx=((i*190+tick*0.7)%1000)-100+Math.sin(tick*0.12+i)*18,my=120+Math.sin(tick*0.07+i*2)*70+i*18,f=Math.abs(Math.sin(tick*0.6+i));
      ctx.beginPath();ctx.ellipse(mx-3,my,3.5*f+0.8,2.2,0,0,7);ctx.ellipse(mx+3,my,3.5*f+0.8,2.2,0,0,7);ctx.fill();
    }
  }
}
const FB={};
function fishInit(){
  if(FB.back)return;const R=13,C=32;
  const mk=()=>{const c=document.createElement('canvas');c.width=c.height=64;return c;};
  FB.back=mk();FB.front=mk();
  let g=FB.back.getContext('2d');glow(g,C,C,26,'140,220,255',0.35);
  g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(C,C+R+1,8,2.2,0,0,7);g.fill();
  g.save();g.beginPath();g.arc(C,C+1,R,0,7);g.clip();
  const wg=g.createLinearGradient(0,C-8,0,C+R+1);wg.addColorStop(0,'rgba(120,205,255,.9)');wg.addColorStop(1,'rgba(40,120,210,.95)');
  g.fillStyle='rgba(230,248,255,.35)';g.fillRect(C-R,C-R,R*2,R*2);g.fillStyle=wg;g.fillRect(C-R,C-6,R*2,R*2+6);g.restore();
  g=FB.front.getContext('2d');
  g.beginPath();g.arc(C,C+1,R,0,7);g.strokeStyle='#2b5d86';g.lineWidth=1.8;g.stroke();
  g.beginPath();g.ellipse(C,C-9,6,1.8,0,0,7);g.fillStyle='rgba(255,255,255,.5)';g.fill();g.lineWidth=1.2;g.stroke();
  g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=2;g.lineCap='round';g.beginPath();g.arc(C,C+1,R-3,Math.PI*1.1,Math.PI*1.45);g.stroke();
}
function drawFish(x,y,ph,s){
  s=s||1;fishInit();
  const by=y+Math.sin(tick*0.07+ph)*3*s;
  ctx.save();ctx.translate(x,by);ctx.scale(s,s);
  ctx.drawImage(FB.back,-32,-32);
  const fx=Math.sin(tick*0.045+ph)*5,fd=Math.cos(tick*0.045+ph)>=0?1:-1,fy=Math.sin(tick*0.09+ph)*1.5+2,tl=Math.sin(tick*0.3+ph)*2;
  ctx.save();ctx.translate(fx,fy);ctx.scale(fd,1);
  ctx.beginPath();ctx.moveTo(-3,0);ctx.lineTo(-9,-4+tl);ctx.lineTo(-9,4+tl);ctx.closePath();fillOL(ctx,'#ff8a1f',1.2);
  ctx.beginPath();ctx.ellipse(0,0,5.5,3.8,0,0,7);fillOL(ctx,'#ffa63a',1.2);
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(2.6,-0.8,1.3,0,7);ctx.fill();ctx.fillStyle=OL;ctx.beginPath();ctx.arc(2.9,-0.8,0.6,0,7);ctx.fill();
  ctx.restore();
  ctx.fillStyle='rgba(255,255,255,.75)';
  for(let i=0;i<2;i++){const a=(tick*0.4+i*30+ph*9)%60;ctx.beginPath();ctx.arc(-4+i*8+Math.sin(a*0.2)*1.5,8-a*0.2,1+i*0.4,0,7);ctx.fill();}
  ctx.drawImage(FB.front,-32,-32);
  ctx.restore();
}

function eyeB(c,x,y,r,ir){c.beginPath();c.ellipse(x,y,r,r*1.12,0,0,7);c.fillStyle='#fff';c.fill();c.lineWidth=Math.max(1,r*0.3);c.strokeStyle=OL;c.stroke();c.beginPath();c.ellipse(x+r*0.12,y+r*0.14,r*0.6,r*0.7,0,0,7);c.fillStyle=ir||OL;c.fill();c.beginPath();c.arc(x+r*0.32,y-r*0.3,r*0.3,0,7);c.fillStyle='#fff';c.fill();}
function gloss(c,x,y,rx,ry,a){c.beginPath();c.ellipse(x,y,rx,ry,-0.35,0,7);c.fillStyle='rgba(255,255,255,'+(a==null?0.38:a)+')';c.fill();}
function gshadow(c,w){c.fillStyle='rgba(20,10,30,.3)';c.beginPath();c.ellipse(0,0.6,w,w*0.2,0,0,7);c.fill();}
const RIVAL={body:'#e8913d',stripe:'#a35a17',eye:'#ff3b3b',collar:'#333',hp:1,hs:1,fat:0.5};
function drawEnemy(en){
  const x=en.x-cam,y=en.y,T=en.t;
  if(T==='boss'){drawBoss(en);return;}
  if(T==='pet'){drawPet(en);return;}
  if(T==='crit'){drawCrit(en);return;}
  if(P&&P.cat.dog&&drawDogFoe(en))return;
  if(T==='rival'){
    const k=ES/1.2,sw=en.w*k,sh=en.h*k,ox=x+en.w/2-sw/2,oy=y+en.h-sh;
    drawCat(ctx,RIVAL,ox,oy,sw,sh,en.dir,en.tm,{run:1});
    ctx.strokeStyle=OL;ctx.lineWidth=2.4;ctx.lineCap='round';
    const hx=ox+sw/2+en.dir*sw*0.27,hy=oy+sh*0.3;
    ctx.beginPath();ctx.moveTo(hx-11,hy-4);ctx.lineTo(hx-3,hy+1);ctx.moveTo(hx+11,hy-4);ctx.lineTo(hx+3,hy+1);ctx.stroke();
    if(en.charge){ctx.fillStyle='#ff3b3b';ctx.font='bold 20px system-ui';ctx.textAlign='center';ctx.fillText('!',x+en.w/2,oy-8);}
    return;
  }
  if(T==='laser'){
    const cx=x+en.w/2,cy=y+en.h/2;
    glow(ctx,cx,cy,44,'255,40,40',0.55);
    ctx.fillStyle='#ff2d2d';ctx.beginPath();ctx.arc(cx,cy,9,0,7);ctx.fill();
    ctx.fillStyle='#ffd0d0';ctx.beginPath();ctx.arc(cx,cy,4,0,7);ctx.fill();
    return;
  }
  ctx.save();ctx.translate(x+en.w/2,y+en.h);ctx.scale(ES*BS,ES*BS);
  if(en.dir<0&&T!=='bubble')ctx.scale(-1,1);
  const tm=en.tm;
  if(T==='mouse'){
    const run=Math.sin(tm*0.4);
    gshadow(ctx,16);
    ctx.lineCap='round';ctx.strokeStyle=OL;ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-11,-7);ctx.quadraticCurveTo(-26,-3+run*4,-22,-18);ctx.stroke();
    ctx.strokeStyle='#ffb3c6';ctx.lineWidth=2.8;ctx.beginPath();ctx.moveTo(-11,-7);ctx.quadraticCurveTo(-26,-3+run*4,-22,-18);ctx.stroke();
    [[-6,run*2.5],[6,-run*2.5]].forEach(([dx,o])=>{ctx.beginPath();ctx.ellipse(dx+o,-2,4.2,3.2,0,0,7);fillOL(ctx,'#f0b2c2',1.5);});
    const g=ctx.createRadialGradient(-4,-17,2,0,-9,16);g.addColorStop(0,'#eef0fa');g.addColorStop(0.6,'#aeb0c8');g.addColorStop(1,'#70728c');
    ctx.beginPath();ctx.ellipse(-1,-9,13,9.5,0,0,7);fillOL(ctx,g,1.8);
    gloss(ctx,-5,-15,6,2.4,0.45);
    ctx.beginPath();ctx.ellipse(9,-10,8,7,0,0,7);fillOL(ctx,g,1.8);
    ctx.beginPath();ctx.arc(4,-18,5.8,0,7);fillOL(ctx,'#b8bad0',1.6);ctx.fillStyle='#ffb3c6';ctx.beginPath();ctx.arc(4,-18,3.2,0,7);ctx.fill();
    ctx.beginPath();ctx.ellipse(15.5,-9.5,2.6,2.1,0,0,7);fillOL(ctx,'#ff6f91',1.2);
    ctx.fillStyle='rgba(255,110,150,.5)';ctx.beginPath();ctx.ellipse(7,-6.5,2.4,1.4,0,0,7);ctx.fill();
    eyeB(ctx,10,-12.5,2.9);
  } else if(T==='dog'){
    const run=Math.sin(tm*0.35),wag=Math.sin(tm*0.5)*5;
    gshadow(ctx,19);
    ctx.lineCap='round';ctx.strokeStyle=OL;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-15,-18);ctx.quadraticCurveTo(-24,-26,-21,-32+wag);ctx.stroke();
    ctx.strokeStyle='#d99a55';ctx.lineWidth=3.6;ctx.stroke();
    [[-11,run*3],[-4,-run*3],[8,-run*3],[14,run*3]].forEach(([dx,o],i)=>{ctx.beginPath();ctx.ellipse(dx+o,-4,4,5.2,0,0,7);fillOL(ctx,i%2?'#a56a30':'#c99356',1.5);});
    const g=ctx.createRadialGradient(-4,-24,2,0,-14,20);g.addColorStop(0,'#f0c48a');g.addColorStop(0.6,'#c98a4a');g.addColorStop(1,'#8f5424');
    ctx.beginPath();ctx.ellipse(-2,-14,17,10.5,0,0,7);fillOL(ctx,g,2);
    gloss(ctx,-6,-20,8,2.8,0.4);
    ctx.fillStyle='#f6e2c0';ctx.beginPath();ctx.ellipse(2,-8,9,4.5,0,0,7);ctx.fill();
    ctx.beginPath();ctx.arc(14,-21,9.5,0,7);fillOL(ctx,g,2);
    ctx.beginPath();ctx.ellipse(23,-18,7,5,0,0,7);fillOL(ctx,'#f6dbb0',1.8);
    ctx.fillStyle=OL;ctx.beginPath();ctx.ellipse(28,-20,2.9,2.3,0,0,7);ctx.fill();
    ctx.beginPath();ctx.ellipse(8,-24,4.5,9,0.45+run*0.05,0,7);fillOL(ctx,'#6e421d',1.6);
    ctx.fillStyle='#ff7d9c';ctx.beginPath();ctx.ellipse(24,-12.5,2.4,3+Math.abs(run),0,0,7);ctx.fill();
    eyeB(ctx,16,-23.5,3);
    ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(12,-29);ctx.lineTo(19,-26.5);ctx.stroke();
    ctx.beginPath();ctx.arc(7,-12,3,0,7);fillOL(ctx,'#e63946',1.2);
  } else if(T==='roomba'){
    const g=ctx.createLinearGradient(0,-16,0,0);g.addColorStop(0,'#7c8698');g.addColorStop(0.5,'#4a5165');g.addColorStop(1,'#262a37');
    gshadow(ctx,20);
    ctx.strokeStyle='#ff8a3d';ctx.lineWidth=1.8;ctx.lineCap='round';
    for(let k=0;k<4;k++){const a=tm*0.6+k*1.57;ctx.beginPath();ctx.moveTo(18,-1);ctx.lineTo(18+Math.cos(a)*7,-1+Math.sin(a)*3.2);ctx.stroke();}
    ctx.beginPath();ctx.ellipse(0,-7,18,7.2,0,0,7);fillOL(ctx,g,2);
    gloss(ctx,-6,-11,8,2,0.4);
    ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,-6,14,4.5,0,0.2,Math.PI-0.2);ctx.stroke();
    ctx.beginPath();ctx.ellipse(0,-9.5,12,4,0,0,7);fillOL(ctx,'#9aa3b8',1.4);
    const on=Math.floor(tm/12)%2;
    ctx.fillStyle=on?'#ff4a4a':'#8a1f1f';ctx.beginPath();ctx.arc(6,-9.5,2.4,0,7);ctx.fill();
    ctx.fillStyle='#8cf59a';ctx.beginPath();ctx.arc(-5,-9.5,1.8,0,7);ctx.fill();
    if(on){ctx.fillStyle='rgba(255,74,74,.35)';ctx.beginPath();ctx.arc(6,-9.5,5,0,7);ctx.fill();}
  } else if(T==='cucumber'){
    ctx.rotate(Math.sin(tm*0.12)*0.07);
    gshadow(ctx,11);
    const g=ctx.createLinearGradient(-8,0,8,0);g.addColorStop(0,'#c2f29a');g.addColorStop(0.45,'#66c24e');g.addColorStop(1,'#2a7a2a');
    ctx.beginPath();ctx.ellipse(0,-17,7.5,17,0,0,7);fillOL(ctx,g,2);
    gloss(ctx,-3.5,-18,1.8,9,0.5);
    ctx.fillStyle='#2a7a2a';[[-3,-10],[3,-6],[-2,-2],[3,-14],[-3,-18]].forEach(([dx,dy])=>{ctx.beginPath();ctx.arc(dx,dy,0.9,0,7);ctx.fill();});
    eyeB(ctx,-2.6,-24,2.7);eyeB(ctx,3.4,-24,2.7);
    ctx.fillStyle='rgba(255,110,150,.5)';ctx.beginPath();ctx.ellipse(-5,-19,1.8,1.1,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(6,-19,1.8,1.1,0,0,7);ctx.fill();
    ctx.strokeStyle=OL;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-5.5,-28);ctx.lineTo(-0.5,-26);ctx.moveTo(6,-28);ctx.lineTo(1,-26);ctx.moveTo(-3,-17);ctx.quadraticCurveTo(0,-15,3,-17);ctx.stroke();
  } else if(T==='sprayer'){
    gshadow(ctx,10);
    ctx.beginPath();ctx.moveTo(-9,-2);ctx.lineTo(-9,-20);ctx.quadraticCurveTo(-9,-24,-5,-26);ctx.lineTo(5,-26);ctx.quadraticCurveTo(9,-24,9,-20);ctx.lineTo(9,-2);ctx.quadraticCurveTo(0,1,-9,-2);ctx.closePath();
    const g=ctx.createLinearGradient(-9,0,9,0);g.addColorStop(0,'rgba(170,230,255,.98)');g.addColorStop(0.5,'rgba(90,170,240,.96)');g.addColorStop(1,'rgba(40,110,200,.96)');fillOL(ctx,g,2);
    gloss(ctx,-5.5,-14,1.8,8,0.55);
    ctx.beginPath();ctx.rect(-5,-33,10,8);fillOL(ctx,'#f6f8ff',1.8);
    ctx.fillStyle='#c9d3ea';ctx.fillRect(-4,-31,8,2);
    ctx.beginPath();ctx.moveTo(5,-31);ctx.lineTo(13,-31);ctx.lineTo(13,-27);ctx.lineTo(5,-27);ctx.closePath();fillOL(ctx,'#e63946',1.6);
    ctx.beginPath();ctx.moveTo(-5,-27);ctx.lineTo(-10,-20);ctx.lineTo(-8,-18);ctx.lineTo(-3,-25);ctx.closePath();fillOL(ctx,'#e63946',1.4);
    ctx.fillStyle='rgba(255,255,255,.9)';ctx.fillRect(-4,-21,8,4);ctx.strokeStyle=OL;ctx.lineWidth=0.8;ctx.strokeRect(-4,-21,8,4);
    eyeB(ctx,-2.8,-14,2.3,'#2a6fd0');eyeB(ctx,3.2,-14,2.3,'#2a6fd0');
    ctx.fillStyle='rgba(255,110,150,.5)';ctx.beginPath();ctx.ellipse(-5.5,-10.5,1.6,1,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(5.5,-10.5,1.6,1,0,0,7);ctx.fill();
    ctx.strokeStyle=OL;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-6,-18);ctx.lineTo(-1,-16);ctx.moveTo(6,-18);ctx.lineTo(1,-16);ctx.stroke();
  } else if(T==='hairball'){
    gshadow(ctx,11);
    ctx.translate(0,-11);ctx.rotate(en.x*0.09);
    ctx.strokeStyle='#6d5e50';ctx.lineWidth=1.6;ctx.lineCap='round';
    for(let k=0;k<22;k++){const a=k*0.2856,r1=9,r2=12+hsh(k)*3;ctx.beginPath();ctx.moveTo(Math.cos(a)*r1,Math.sin(a)*r1);ctx.lineTo(Math.cos(a+0.2)*r2,Math.sin(a+0.2)*r2);ctx.stroke();}
    const g=ctx.createRadialGradient(-4,-5,1,0,0,13);g.addColorStop(0,'#d6c6ae');g.addColorStop(0.6,'#a08c76');g.addColorStop(1,'#6a5a48');
    ctx.beginPath();ctx.arc(0,0,10.5,0,7);fillOL(ctx,g,1.8);
    gloss(ctx,-4,-5,3.5,2,0.45);
    ctx.rotate(-en.x*0.09);
    eyeB(ctx,-3,-2,2.8);eyeB(ctx,4.5,-2,2.8);
    ctx.strokeStyle=OL;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-7,-6);ctx.lineTo(-1,-4);ctx.moveTo(8,-6);ctx.lineTo(2,-4);ctx.stroke();
  } else if(T==='bee'){
    const fl=Math.sin(tm*1.1)*0.55;
    ctx.translate(0,-9);
    ctx.fillStyle='rgba(225,242,255,.85)';ctx.strokeStyle=OL;ctx.lineWidth=1.2;
    [-1,1].forEach(s=>{ctx.save();ctx.translate(s*1.5,-5);ctx.rotate(s*(0.5+fl));ctx.beginPath();ctx.ellipse(s*4,-4,4,6.5,0,0,7);ctx.fill();ctx.stroke();ctx.restore();});
    const g=ctx.createRadialGradient(-3,-4,1,0,0,11);g.addColorStop(0,'#fff09a');g.addColorStop(1,'#e0a010');
    ctx.beginPath();ctx.ellipse(0,0,10,7,0,0,7);fillOL(ctx,g,1.8);
    ctx.save();ctx.beginPath();ctx.ellipse(0,0,10,7,0,0,7);ctx.clip();ctx.fillStyle=OL;ctx.fillRect(-6,-8,3,16);ctx.fillRect(0,-8,3,16);ctx.restore();
    gloss(ctx,-2,-4,5,1.8,0.5);
    ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-15,2);ctx.lineTo(-10,3);ctx.closePath();fillOL(ctx,'#555',1.2);
    eyeB(ctx,6.5,-2,2.4);
    ctx.fillStyle='rgba(255,110,150,.5)';ctx.beginPath();ctx.ellipse(8,2,1.6,1,0,0,7);ctx.fill();
    ctx.strokeStyle=OL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(6,-6);ctx.lineTo(10,-10);ctx.moveTo(9,-5);ctx.lineTo(13,-8);ctx.stroke();
  } else if(T==='crow'){
    const fl=Math.sin(tm*0.35)*11;
    ctx.translate(0,-2);
    ctx.beginPath();ctx.moveTo(-12,-12);ctx.lineTo(-26,-9+fl*0.2);ctx.lineTo(-24,-14);ctx.lineTo(-13,-15);ctx.closePath();fillOL(ctx,'#1f2030',1.6);
    const g=ctx.createRadialGradient(-2,-18,2,0,-12,16);g.addColorStop(0,'#5b5f86');g.addColorStop(0.6,'#22243a');g.addColorStop(1,'#0e0f18');
    ctx.beginPath();ctx.ellipse(0,-12,14,9.5,0,0,7);fillOL(ctx,g,1.8);
    gloss(ctx,-3,-19,6,2.2,0.3);
    ctx.beginPath();ctx.arc(11,-18,6.5,0,7);fillOL(ctx,'#2e3150',1.8);
    ctx.beginPath();ctx.moveTo(16,-20);ctx.lineTo(27,-16);ctx.lineTo(16,-14.5);ctx.closePath();fillOL(ctx,'#ffb04d',1.4);
    eyeB(ctx,13,-19.5,2.6,'#ff4a4a');
    ctx.strokeStyle=OL;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(9,-24);ctx.lineTo(16,-21.5);ctx.stroke();
    ctx.beginPath();ctx.ellipse(-3,-14-fl*0.4,11,5.5+Math.abs(fl)*0.3,-0.5-fl*0.04,0,7);fillOL(ctx,'#282b44',1.6);
  } else if(T==='bubble'){
    ctx.translate(0,-15);
    const g=ctx.createRadialGradient(-5,-6,2,0,0,16);g.addColorStop(0,'rgba(255,255,255,.8)');g.addColorStop(0.6,'rgba(170,225,255,.35)');g.addColorStop(1,'rgba(255,150,230,.6)');
    ctx.beginPath();ctx.arc(0,0,15,0,7);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=1.8;ctx.stroke();
    ctx.strokeStyle='rgba(120,200,255,.85)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,13,0.3,1.5);ctx.stroke();
    ctx.strokeStyle='rgba(255,200,120,.7)';ctx.beginPath();ctx.arc(0,0,11,3.6,4.6);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.95)';ctx.beginPath();ctx.ellipse(-6,-7,3.5,2,-0.7,0,7);ctx.fill();
    ctx.strokeStyle=OL;ctx.lineWidth=1.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-7,-1);ctx.lineTo(-3,1);ctx.moveTo(-7,3);ctx.lineTo(-3,1);ctx.moveTo(7,-1);ctx.lineTo(3,1);ctx.moveTo(7,3);ctx.lineTo(3,1);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-3,7);ctx.quadraticCurveTo(0,4,3,7);ctx.stroke();
    ctx.fillStyle='rgba(255,110,150,.45)';ctx.beginPath();ctx.ellipse(-9,3,2,1.2,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(9,3,2,1.2,0,0,7);ctx.fill();
  } else {
    const fl=Math.sin(tm*0.3)*9;
    ctx.beginPath();ctx.moveTo(-13,-12);ctx.lineTo(-24,-6+fl*0.3);ctx.lineTo(-14,-8);ctx.closePath();fillOL(ctx,'#6a739a',1.5);
    const g=ctx.createRadialGradient(-2,-18,2,0,-12,16);g.addColorStop(0,'#c4cbee');g.addColorStop(0.6,'#7d86b0');g.addColorStop(1,'#4a5382');
    ctx.beginPath();ctx.ellipse(0,-12,14,9.5,0,0,7);fillOL(ctx,g,1.8);
    gloss(ctx,-4,-18,5,2,0.4);
    ctx.beginPath();ctx.arc(11,-18,6.5,0,7);fillOL(ctx,'#8d96c0',1.8);
    ctx.fillStyle='#4fd29a';ctx.beginPath();ctx.ellipse(7,-14,5,3,0.3,0,7);ctx.fill();
    ctx.beginPath();ctx.ellipse(-3,-14-fl*0.35,10,5+Math.abs(fl)*0.25,-0.5-fl*0.04,0,7);fillOL(ctx,'#4b5380',1.6);
    ctx.beginPath();ctx.moveTo(16,-19);ctx.lineTo(24,-16.5);ctx.lineTo(16,-14.5);ctx.closePath();fillOL(ctx,'#ffb04d',1.3);
    eyeB(ctx,13,-19.5,2.6,'#2a2a55');
  }
  ctx.restore();
}
function drawShots(){
  for(const s of L.shots){
    const x=s.x-cam,y=s.y;
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(s.vy,s.vx));
    ctx.beginPath();ctx.moveTo(6,0);ctx.quadraticCurveTo(0,-4,-5,0);ctx.quadraticCurveTo(0,4,6,0);fillOL(ctx,'#7fd0ff',1.4);
    ctx.fillStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.arc(1,-1,1.3,0,7);ctx.fill();
    ctx.restore();
  }
}

function heart(c,x,y,s,fill){
  c.beginPath();c.moveTo(x,y+s*0.3);c.bezierCurveTo(x-s*0.6,y-s*0.4,x-s*1.15,y+s*0.45,x,y+s*1.05);c.bezierCurveTo(x+s*1.15,y+s*0.45,x+s*0.6,y-s*0.4,x,y+s*0.3);c.closePath();
  c.fillStyle=fill;c.fill();c.lineWidth=2;c.strokeStyle=OL;c.lineJoin='round';c.stroke();
  if(fill!=='rgba(40,30,70,.55)'){c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.ellipse(x-s*0.4,y+s*0.18,s*0.16,s*0.1,-0.6,0,7);c.fill();}
}
let VIG=null;
function drawVignette(){
  if(!VIG){VIG=document.createElement('canvas');VIG.width=VW;VIG.height=VH;const v=VIG.getContext('2d');const g=v.createRadialGradient(VW/2,VH/2,VH*0.45,VW/2,VH/2,VW*0.65);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(10,5,30,.5)');v.fillStyle=g;v.fillRect(0,0,VW,VH);}
  ctx.drawImage(VIG,0,0);
}
function drawShadow(p){
  const cx=Math.floor((p.x+p.w/2)/TS);let ty=Math.floor((p.y+p.h-1)/TS);
  for(let k=0;k<ROWS+2&&ty<ROWS;k++,ty++){ if(solid(tile(cx,ty))){const gy=ty*TS,d=Math.max(0,gy-(p.y+p.h));ctx.fillStyle='rgba(0,0,0,'+Math.max(0.08,0.3-d/400)+')';ctx.beginPath();ctx.ellipse(p.x+p.w/2-cam,gy+1,p.w*0.5*(1-Math.min(0.5,d/300)),3.5,0,0,7);ctx.fill();return;} }
}

function drawKitchenBG(){
  const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,'#fff0d2');g.addColorStop(1,'#f2c27f');
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  // backsplash tiles
  const o1=cam*0.3;ctx.strokeStyle='rgba(120,70,20,.09)';ctx.lineWidth=1;
  for(let x=-(o1%40);x<VW;x+=40){ctx.beginPath();ctx.moveTo(x,170);ctx.lineTo(x,330);ctx.stroke();}
  for(let y=170;y<=330;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(VW,y);ctx.stroke();}
  // windows
  const wo=cam*0.2,wc=520,wf=Math.floor(wo/wc);
  for(let k=0;k<3;k++){const i=wf+k,x=i*wc-wo+160;
    glow(ctx,x+60,150,170,'255,240,190',0.5);
    const sg=ctx.createLinearGradient(0,60,0,220);sg.addColorStop(0,'#8fd4ff');sg.addColorStop(1,'#d8f3ff');
    ctx.fillStyle=sg;rr(ctx,x,60,120,150,8);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+60,60);ctx.lineTo(x+60,210);ctx.moveTo(x,135);ctx.lineTo(x+120,135);ctx.stroke();
    ctx.strokeStyle=OL;ctx.lineWidth=1.5;rr(ctx,x-3,57,126,156,9);ctx.stroke();
    cloud(x+40,100,0.4,0.9);
  }
  // upper cabinets + hanging pans
  const uo=cam*0.35,uc=130,uf=Math.floor(uo/uc);
  for(let k=0;k<Math.ceil(VW/uc)+2;k++){const i=uf+k,x=i*uc-uo,v=hsh(i*5+2);
    if(v<0.55){const cg=ctx.createLinearGradient(0,0,0,120);cg.addColorStop(0,'#c98a4a');cg.addColorStop(1,'#9a6330');
      rr(ctx,x+4,0,uc-8,118,5);ctx.fillStyle=cg;ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.stroke();
      ctx.strokeStyle='rgba(0,0,0,.25)';ctx.strokeRect(x+12,12,uc-24,94);
      ctx.fillStyle='#ffd77a';ctx.beginPath();ctx.arc(x+uc-24,100,4,0,7);ctx.fill();
    } else if(v<0.85){
      ctx.strokeStyle='#6b6b78';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+10,0);ctx.lineTo(x+uc-10,0);ctx.stroke();
      [[30,60,17],[70,48,13],[100,70,15]].forEach(([dx,len,r],j)=>{const sw=Math.sin(tick*0.03+i+j)*3;ctx.strokeStyle='#555';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+dx,0);ctx.lineTo(x+dx+sw,len);ctx.stroke();
        ctx.beginPath();ctx.arc(x+dx+sw,len+r,r,0,7);fillOL(ctx,j%2?'#d9564b':'#8d93a3',2);ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.arc(x+dx+sw-r*0.3,len+r*0.7,r*0.3,0,7);ctx.fill();});
    }
  }
  // base cabinets
  const bo=cam*0.6,bc=96,bf=Math.floor(bo/bc);
  ctx.fillStyle='#6b4a2e';ctx.fillRect(0,330,VW,VH-330);
  for(let k=0;k<Math.ceil(VW/bc)+2;k++){const i=bf+k,x=i*bc-bo;
    const cg=ctx.createLinearGradient(0,336,0,VH);cg.addColorStop(0,'#a8703a');cg.addColorStop(1,'#7c4f26');
    rr(ctx,x+3,338,bc-6,VH-330,5);ctx.fillStyle=cg;ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,.25)';ctx.strokeRect(x+12,350,bc-24,80);
    ctx.fillStyle='#ffd77a';ctx.beginPath();ctx.arc(x+bc-20,366,3.5,0,7);ctx.fill();
  }
  ctx.fillStyle='#e8e4dc';ctx.fillRect(0,326,VW,12);ctx.fillStyle='rgba(255,255,255,.7)';ctx.fillRect(0,326,VW,3);ctx.fillStyle=OL;ctx.fillRect(0,337,VW,2);
  // flour dust
  for(let i=0;i<26;i++){const x=((i*97+tick*0.3*(1+i%3)-cam*0.5)%900+900)%900-50,y=(i*53+tick*0.4*(1+i%2))%VH;ctx.fillStyle='rgba(255,255,255,'+(0.25+0.3*hsh(i))+')';ctx.beginPath();ctx.arc(x,y,1.4+hsh(i+3)*2,0,7);ctx.fill();}
}

/* ---------- audio ---------- */
let AC=null, muted=false;
function audioInit(){ if(!AC){ try{AC=new (window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});}catch(e){try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e2){}} } if(AC&&AC.state==='suspended'){ try{AC.resume();}catch(e){} } }
function tone(f,d,type,vol,slide){
  if(!AC||muted)return;
  try{
    const o=AC.createOscillator(), g=AC.createGain(), t0=AC.currentTime;
    o.type=type||'square'; o.frequency.setValueAtTime(f,t0);
    if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),t0+d);
    g.gain.setValueAtTime(vol||0.05,t0); g.gain.exponentialRampToValueAtTime(0.0001,t0+d);
    o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0+d);
  }catch(e){}
}
const sfx={
  jump(){tone(280,.16,'square',.04,420)},
  coin(){tone(900,.07,'triangle',.06); setTimeout(()=>tone(1350,.12,'triangle',.06),60)},
  stomp(){tone(220,.12,'square',.07,-120)},
  hurt(){tone(300,.3,'sawtooth',.07,-220)},
  meow(){tone(700,.28,'sawtooth',.045,-300); setTimeout(()=>tone(520,.18,'sawtooth',.03,-150),120)},
  slam(){tone(120,.25,'square',.09,-70)},
  dash(){tone(500,.15,'sawtooth',.04,700)},
  crate(){tone(180,.1,'square',.06,-60); tone(330,.12,'triangle',.05)},
  spring(){tone(220,.25,'triangle',.07,800)},
  check(){tone(660,.1,'triangle',.06); setTimeout(()=>tone(990,.2,'triangle',.06),100)},
  win(){[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.25,'triangle',.07),i*130))},
  lose(){[400,330,260,180].forEach((f,i)=>setTimeout(()=>tone(f,.25,'sawtooth',.06),i*150))}
};

/* ---------- levels ---------- */
const THEMES=[
 {sky:['#6ccaff','#e3f7ff'],far:'#a9e29a',near:'#74c56b',top:'#4fb552',fill:'#8d5b2e',plank:'#c98a3d',sun:true,clouds:true},
 {sky:['#ff8f6b','#ffe1a8'],city:['#8b5f8f','#5e4070'],top:'#a9a9b8',fill:'#8a4f48',plank:'#b9805a',brick:true,sun:true,clouds:true},
 {sky:['#0a0e2e','#2c2c66'],city:['#222a5c','#161b45'],top:'#6b6ea0',fill:'#32365e',plank:'#7a62a0',brick:true,stars:true,moon:true,windows:true},
 {sky:['#fff0d2','#f2c27f'],top:'#eceff4',fill:'#444',plank:'#d8a860'}
];
const ESZ={mouse:[26,20],dog:[40,30],roomba:[36,14],cucumber:[14,34],sprayer:[22,34],rival:[34,28],hairball:[22,22],bee:[22,18],crow:[34,24],bubble:[30,30],laser:[14,14],bird:[30,22]};
const GROUNDT={mouse:1,dog:1,roomba:1,cucumber:1,sprayer:1,rival:1,hairball:1};
const GSPEED={mouse:0.95,dog:0.9,roomba:1.9,rival:1.0,hairball:1.6,cucumber:0.35,sprayer:0};
/* ---------- v3: sizes, tins, catnip, puff ---------- */
const SPR=1/0.7, ES=1.45;
CATS.forEach(c=>{c.w=Math.round(c.w*0.7);c.h=Math.round(c.h*0.7);c.speed*=1.1;c.jump*=1.05;});
Object.keys(ESZ).forEach(k=>{ESZ[k]=[Math.round(ESZ[k][0]*1.2),Math.round(ESZ[k][1]*1.2)];});
let bannerT=0;

function drawTin(x,y,ph){
  const by=y+Math.sin(tick*0.08+ph)*3;
  glow(ctx,x,by,28,'255,215,100',0.45);
  ctx.save();ctx.translate(x,by);ctx.rotate(Math.sin(tick*0.05+ph)*0.08);
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(0,16,10,2.5,0,0,7);ctx.fill();
  const g=ctx.createLinearGradient(-12,0,12,0);g.addColorStop(0,'#aab4c4');g.addColorStop(0.35,'#f4f7fc');g.addColorStop(1,'#8a94a8');
  rr(ctx,-12,-11,24,26,3);fillOL(ctx,g,1.8);
  ctx.save();rr(ctx,-12,-11,24,26,3);ctx.clip();
  ctx.fillStyle='#ff6f4a';ctx.fillRect(-12,-5,24,13);
  ctx.fillStyle='#ffd84a';ctx.fillRect(-12,-5,24,2.5);ctx.fillRect(-12,5.5,24,2.5);
  ctx.restore();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(-1,1.5,6,3.4,0,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(4,1.5);ctx.lineTo(8,-1);ctx.lineTo(8,4);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ff6f4a';ctx.beginPath();ctx.arc(-4,0.6,0.9,0,7);ctx.fill();
  ctx.beginPath();ctx.ellipse(0,-11,12,3.2,0,0,7);fillOL(ctx,'#dfe5f0',1.6);
  ctx.beginPath();ctx.arc(2,-12,3.2,0,7);ctx.strokeStyle=OL;ctx.lineWidth=1.6;ctx.stroke();
  ctx.restore();
  if((tick+ph*11|0)%100<10){ctx.fillStyle='#fff';ctx.fillRect(x+8,by-12,3,1);ctx.fillRect(x+9,by-13,1,3);}
}
function drawNip(x,y,ph){
  const by=y+Math.sin(tick*0.06+ph)*4;
  glow(ctx,x,by,40,'170,110,255',0.45);glow(ctx,x,by,26,'120,255,150',0.35);
  ctx.save();ctx.translate(x,by);ctx.rotate(Math.sin(tick*0.04+ph)*0.15);
  ctx.strokeStyle=OL;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,14);ctx.quadraticCurveTo(-2,4,0,-6);ctx.stroke();
  ctx.strokeStyle='#4fcf6a';ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(0,14);ctx.quadraticCurveTo(-2,4,0,-6);ctx.stroke();
  [[-9,8,-0.9],[9,5,0.9],[-8,-1,-0.6],[8,-3,0.6],[0,-12,0]].forEach(([dx,dy,r],i)=>{
    ctx.save();ctx.translate(dx,dy);ctx.rotate(r+Math.sin(tick*0.1+i)*0.1);
    ctx.beginPath();ctx.ellipse(0,-5,4.4,8,0,0,7);fillOL(ctx,i<4?'#58d874':'#c08bff',1.4);
    ctx.fillStyle='rgba(255,255,255,.35)';ctx.beginPath();ctx.ellipse(-1,-7,1.2,4,0,0,7);ctx.fill();ctx.restore();
  });
  ctx.restore();
  for(let i=0;i<4;i++){const a=tick*0.05+i*1.57+ph;ctx.fillStyle='hsla('+((tick*4+i*90)%360)+',100%,75%,.9)';ctx.beginPath();ctx.arc(x+Math.cos(a)*18,by+Math.sin(a)*14,2,0,7);ctx.fill();}
}
function drawTieDye(){
  const T=P.nipT, a=Math.min(1,(300-T)/30,T/50);
  if(a<=0)return;
  ctx.save();ctx.globalAlpha=0.92*a;
  const cx=VW/2+Math.sin(tick*0.01)*120,cy=VH/2+Math.cos(tick*0.013)*60;
  if(ctx.createConicGradient){
    const cg=ctx.createConicGradient(tick*0.012,cx,cy);
    for(let i=0;i<=8;i++)cg.addColorStop(i/8,'hsl('+((i*45+tick*2)%360)+',95%,58%)');
    ctx.fillStyle=cg;ctx.fillRect(0,0,VW,VH);
  } else {const lg=ctx.createLinearGradient(0,0,VW,VH);for(let i=0;i<=6;i++)lg.addColorStop(i/6,'hsl('+((i*60+tick*2)%360)+',95%,58%)');ctx.fillStyle=lg;ctx.fillRect(0,0,VW,VH);}
  ctx.lineCap='round';
  for(let s=0;s<2;s++){
    const ox=s?VW*0.78+Math.cos(tick*0.011)*70:VW*0.22+Math.sin(tick*0.012)*70,oy=s?VH*0.32:VH*0.68;
    for(let pass=0;pass<2;pass++){
      ctx.beginPath();
      for(let t=0;t<70;t++){const ang=t*0.42+tick*0.025*(s?-1:1)+pass*Math.PI,r=t*7.5;const px=ox+Math.cos(ang)*r,py=oy+Math.sin(ang)*r*0.75;t?ctx.lineTo(px,py):ctx.moveTo(px,py);}
      ctx.strokeStyle='hsla('+((tick*3+s*120+pass*180)%360)+',100%,'+(pass?'70':'45')+'%,.5)';ctx.lineWidth=17;ctx.stroke();
    }
  }
  for(let r=0;r<6;r++){ctx.beginPath();ctx.arc(cx,cy,((tick*1.4+r*70)%420),0,7);ctx.strokeStyle='hsla('+((r*60+tick*3)%360)+',100%,80%,.28)';ctx.lineWidth=10;ctx.stroke();}
  ctx.restore();
}
function goPuff(){
  const p=P;
  p.maxhp++;p.hp=Math.min(p.maxhp,p.hp+1);p.puffT=180;p.slamming=false;
  shake=16;if(p.cat.dog){tone(95,.7,'sawtooth',.09,-25);tone(130,.7,'square',.05,-30);setTimeout(()=>{tone(300,.12,'square',.07,-120);tone(260,.14,'square',.07,-100);},350);}else{sfx.meow();tone(200,.6,'sawtooth',.06,-120);tone(1500,.5,'sawtooth',.02,-1000);}
  say(p.x-30,p.y-30,(p.cat.dog?'GRRRRR!':'HISSSSS!'),'#ff6a4a');say(p.x-10,p.y-52,'+1 HEART!','#ff4d6d');
  for(let i=0;i<36;i++){const a=i/36*6.28;parts.push({x:p.x+p.w/2,y:p.y+p.h/2,vx:Math.cos(a)*7,vy:Math.sin(a)*5,life:30,max:30,col:i%2?'#fff':'#ffd84a',sz:4});}
}
function drawPlayer(p,air){
  const puff=p.puffT>0, k=SPR*(puff?2:1), sw=p.w*k, sh=p.h*k, cx=p.x+p.w/2-cam, bot=p.y+p.h;
  const cat=p.cat;
  if(puff){
    const bcx=cx-p.face*sw*0.05, bcy=bot-sh*0.4, hcx=cx+p.face*sw*0.27, hcy=bot-sh*0.66;
    const spikes=(ax,ay,rx,ry,n,amp,seed)=>{
      ctx.beginPath();
      for(let i=0;i<n*2;i++){const a=i/(n*2)*6.2832,rr_=(i%2?1:1+amp)+Math.sin(tick*0.4+i+seed)*0.03;ctx.lineTo(ax+Math.cos(a)*rx*rr_,ay+Math.sin(a)*ry*rr_);}
      ctx.closePath();fillOL(ctx,cat.body,2.2);
    };
    if(!cat.dog){spikes(bcx,bcy,sw*0.52,sh*0.4,16,0.2,0);
    spikes(hcx,hcy,sw*0.3,sh*0.3,12,0.25,3);}
    glow(ctx,cx,bot-sh*0.5,sw*0.8,'255,110,70',0.25+0.1*Math.sin(tick*0.3));
  }
  drawCat(ctx,cat,cx-sw/2,bot-sh,sw,sh,p.face,tick,{run:p.onGround&&Math.abs(p.vx)>0.4,air,sy:p.sy,hiss:puff});
  if(puff){
    ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;
    for(let i=0;i<3;i++){const r=((tick*3+i*20)%60);ctx.globalAlpha=1-r/60;ctx.beginPath();ctx.arc(cx,bot-sh*0.5,sw*0.5+r,0,7);ctx.stroke();}
    ctx.globalAlpha=1;
  }
}
function drawHUD(){
  const n=P.maxhp, pw=16+n*26;
  ctx.fillStyle='rgba(15,10,40,.5)';rr(ctx,8,8,pw,34,12);ctx.fill();
  for(let i=0;i<n;i++)heart(ctx,26+i*26,15,9,i<P.hp?'#ff4d6d':'rgba(40,30,70,.55)');
  ctx.fillStyle='rgba(15,10,40,.5)';rr(ctx,8,48,104,30,12);ctx.fill();
  drawFish(28,63,0,0.8);
  ctx.textAlign='left';ctx.font='bold 17px system-ui';ctx.fillStyle='#fff';ctx.fillText(RUN?String(P.fish):P.fish+' / '+L.coins.length,46,69);
  ctx.fillStyle='rgba(15,10,40,.5)';rr(ctx,118,48,92,30,12);ctx.fill();
  ctx.save();ctx.translate(133,63);ctx.scale(0.62,0.62);
  const tg=ctx.createLinearGradient(-12,0,12,0);tg.addColorStop(0,'#aab4c4');tg.addColorStop(0.4,'#f4f7fc');tg.addColorStop(1,'#8a94a8');
  rr(ctx,-12,-11,24,26,3);fillOL(ctx,tg,2.4);ctx.fillStyle='#ff6f4a';ctx.fillRect(-11,-5,22,13);ctx.restore();
  const nxt=(Math.floor(P.tins/10)+1)*10;
  ctx.font='bold 17px system-ui';ctx.fillStyle='#fff';ctx.fillText(P.tins+' / '+nxt,148,69);
  ctx.font='bold 12px system-ui';ctx.fillStyle='rgba(255,255,255,.85)';ctx.fillText(L.name+' · '+P.cat.name,14,96);
  let by=104;
  if(P.nipT>0){ctx.fillStyle='rgba(15,10,40,.5)';rr(ctx,12,by,112,12,6);ctx.fill();const g=ctx.createLinearGradient(14,0,122,0);for(let i=0;i<=5;i++)g.addColorStop(i/5,'hsl('+((i*60+tick*3)%360)+',90%,60%)');ctx.fillStyle=g;rr(ctx,14,by+2,108*P.nipT/600,8,4);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 9px system-ui';ctx.fillText('CATNIP',16,by+9.5);by+=18;}
  if(P.puffT>0){ctx.fillStyle='rgba(15,10,40,.5)';rr(ctx,12,by,112,12,6);ctx.fill();ctx.fillStyle='#ff6a4a';rr(ctx,14,by+2,108*P.puffT/180,8,4);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 9px system-ui';ctx.fillText('PUFF UP!',16,by+9.5);by+=18;}
  if(P.cat.sp==='dash'&&P.dashCd>0){ctx.fillStyle='rgba(255,255,255,.75)';rr(ctx,14,by,44*(1-P.dashCd/50)+1,5,2);ctx.fill();}
  if(tick<240){
    const tipt=P.cat.name+' · '+P.cat.desc.split('. ').slice(1).join('. ').replace(/!$/,'');
    ctx.globalAlpha=Math.min(1,(240-tick)/60);ctx.font='bold 15px system-ui';ctx.textAlign='center';
    const tw=ctx.measureText(tipt).width+28;ctx.fillStyle='rgba(15,10,40,.6)';rr(ctx,VW/2-tw/2,VH-44,tw,28,14);ctx.fill();
    ctx.fillStyle='#ffd84a';ctx.fillText(tipt,VW/2,VH-24);ctx.globalAlpha=1;
  }
  if(bannerT>0){
    const t=bannerT,a=Math.min(1,t/20,(180-t)/20),yy=90+(1-Math.min(1,(180-t)/25))*-60;
    ctx.globalAlpha=Math.max(0,a);ctx.textAlign='center';ctx.font='900 40px system-ui';
    ctx.lineWidth=7;ctx.strokeStyle=OL;ctx.lineJoin='round';ctx.strokeText(L.name,VW/2,yy+60);
    const gg=ctx.createLinearGradient(0,yy+30,0,yy+64);gg.addColorStop(0,'#fff3a0');gg.addColorStop(1,'#ff9a3a');ctx.fillStyle=gg;ctx.fillText(L.name,VW/2,yy+60);
    if(L.note){ctx.font='bold 15px system-ui';ctx.lineWidth=4;ctx.strokeStyle=OL;ctx.strokeText(L.note,VW/2,yy+84);ctx.fillStyle='#fff';ctx.fillText(L.note,VW/2,yy+84);}
    ctx.globalAlpha=1;
  }
}

/* ---------- 50 themed maps ---------- */
function drawProp(k,x,by,sc,c1,c2,i){
  ctx.save();ctx.translate(x,by);ctx.scale(sc,sc);ctx.lineJoin='round';
  const R=(px,py,w,h,col,r)=>{rr(ctx,px,py,w,h,r==null?2:r);ctx.fillStyle=col;ctx.fill();ctx.lineWidth=1.6;ctx.strokeStyle=OL;ctx.stroke();};
  const E=(px,py,rx,ry,col)=>{ell(ctx,px,py,rx,ry);fillOL(ctx,col,1.6);};
  const T=(pts,col)=>{ctx.beginPath();pts.forEach((p,j)=>j?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();fillOL(ctx,col,1.6);};
  const AL={lamp:'lantern',nip:'tulip',fern:'tulip',can:'tin',shoe:'sock',spool:'yarn',block:'gift',cat:'catstatue',lucky:'catstatue',castle:'pagoda',barn:'pagoda',tent:'pagoda',lolly:'cupcake',dumpster:'tub',rock:'tomb',igloo:'tomb',soap:'bubbles',barrel:'tub',house:'mansion'};
  const kk=AL[k]||k;
  switch(kk){
    case 'window':R(-30,-120,60,80,c1,6);ctx.strokeStyle=c2;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,-120);ctx.lineTo(0,-40);ctx.moveTo(-30,-80);ctx.lineTo(30,-80);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(-26,-116,10,30);break;
    case 'shelf':R(-60,-8,120,8,c2,2);R(-50,-42,16,34,c1,2);E(-14,-22,14,14,c2);R(14,-34,30,26,c1,3);R(-62,-70,124,6,c2,2);E(-30,-84,10,14,c1);R(10,-96,26,26,c2,3);break;
    case 'cup':R(-12,-22,24,22,c1,4);ctx.beginPath();ctx.arc(14,-11,7,-1.4,1.4);ctx.strokeStyle=OL;ctx.lineWidth=3;ctx.stroke();ctx.fillStyle=c2;ctx.fillRect(-10,-20,20,4);ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2.2;for(let j=0;j<2;j++){const a=(tick*0.7+j*30)%50;ctx.globalAlpha=1-a/50;ctx.beginPath();ctx.moveTo(-4+j*8,-24-a*0.6);ctx.quadraticCurveTo(-1+j*8,-30-a*0.6,-4+j*8,-36-a*0.6);ctx.stroke();}ctx.globalAlpha=1;break;
    case 'yarn':E(0,-16,16,16,c1);ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1.4;for(let j=-1;j<=1;j++){ctx.beginPath();ctx.ellipse(0,-16,16,6+j*5,j*0.5,0,3.2);ctx.stroke();}ctx.strokeStyle=c2;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(10,-4);ctx.quadraticCurveTo(30,4,44,-2);ctx.stroke();break;
    case 'tin':{const g=ctx.createLinearGradient(-14,0,14,0);g.addColorStop(0,'#aab4c4');g.addColorStop(0.4,c1);g.addColorStop(1,'#8a94a8');rr(ctx,-14,-30,28,30,3);fillOL(ctx,g,1.6);ctx.fillStyle=c2;ctx.fillRect(-13,-22,26,10);E(0,-30,14,3.4,'#dfe5f0');break;}
    case 'bowl':ctx.beginPath();ctx.arc(0,-14,18,0,Math.PI);ctx.closePath();fillOL(ctx,c1,1.6);E(0,-14,18,3.4,c2);E(-5,-19,6,3,'#ffb04d');break;
    case 'box':R(-22,-28,44,28,c1,2);T([[-22,-28],[-30,-36],[-4,-36],[0,-28]],c2);T([[22,-28],[30,-36],[4,-36],[0,-28]],c2);ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(-4,-28,8,28);break;
    case 'cross':R(-26,-70,52,52,c2,8);ctx.fillStyle=c1;ctx.fillRect(-4,-62,8,36);ctx.fillRect(-18,-48,36,8);break;
    case 'jar':R(-12,-32,24,32,'rgba(255,255,255,.55)',5);R(-14,-40,28,9,c1,3);E(0,-10,6,5,c2);E(-3,-20,5,4,c2);break;
    case 'spot':{ctx.fillStyle='rgba(255,240,170,.22)';ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(6,0);ctx.lineTo(60,420);ctx.lineTo(-60,420);ctx.closePath();ctx.fill();R(-10,-10,20,14,'#333',3);break;}
    case 'star':{ctx.beginPath();for(let j=0;j<10;j++){const a=-1.57+j*0.628,r=j%2?7:16;ctx.lineTo(Math.cos(a)*r,-16+Math.sin(a)*r);}ctx.closePath();fillOL(ctx,c1,1.6);break;}
    case 'trophy':ctx.beginPath();ctx.moveTo(-14,-40);ctx.lineTo(14,-40);ctx.quadraticCurveTo(12,-16,0,-14);ctx.quadraticCurveTo(-12,-16,-14,-40);fillOL(ctx,c1,1.6);R(-3,-16,6,10,c2,1);R(-12,-6,24,6,c2,2);break;
    case 'acacia':R(-3,-50,6,50,'#6b4a22',1);ctx.beginPath();ctx.ellipse(0,-56,44,12,0,0,7);fillOL(ctx,c1,1.6);E(-16,-62,20,8,c2);break;
    case 'post':R(-22,-8,44,8,c2,2);R(-6,-80,12,72,c1,2);ctx.strokeStyle='rgba(90,60,20,.6)';ctx.lineWidth=1.4;for(let j=0;j<9;j++){ctx.beginPath();ctx.moveTo(-6,-76+j*8);ctx.lineTo(6,-72+j*8);ctx.stroke();}R(-18,-86,36,7,c2,3);break;
    case 'palm':ctx.beginPath();ctx.moveTo(-5,0);ctx.quadraticCurveTo(8,-40,2,-74);ctx.lineWidth=10;ctx.strokeStyle=OL;ctx.stroke();ctx.lineWidth=6;ctx.strokeStyle=c1;ctx.stroke();for(let j=0;j<6;j++){const a=-0.2+j*0.9-1.2+Math.sin(tick*0.03+j)*0.05;ctx.beginPath();ctx.moveTo(2,-74);ctx.quadraticCurveTo(2+Math.cos(a-1.57)*26,-74+Math.sin(a-1.57)*26-10,2+Math.cos(a-1.57)*42,-74+Math.sin(a-1.57)*42+10);ctx.lineWidth=7;ctx.strokeStyle=OL;ctx.stroke();ctx.lineWidth=4;ctx.strokeStyle=c2;ctx.stroke();}break;
    case 'cactus':R(-7,-60,14,60,c1,6);R(-22,-42,10,24,c1,5);R(-22,-22,22,8,c1,4);R(12,-50,10,22,c1,5);R(0,-30,22,8,c1,4);ctx.fillStyle=c2;ctx.fillRect(-2,-56,1.6,4);ctx.fillRect(3,-40,1.6,4);break;
    case 'pyramid':T([[-60,0],[0,-80],[60,0]],c1);ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(0,-80);ctx.lineTo(60,0);ctx.lineTo(0,0);ctx.closePath();ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=1.6;ctx.stroke();break;
    case 'ball':E(0,-14,14,14,c1);ctx.strokeStyle=c2;ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(0,-14,10,0.5,2.6);ctx.stroke();ctx.beginPath();ctx.arc(0,-14,10,3.6,5.7);ctx.stroke();break;
    case 'paw':E(0,-10,11,9,c1);[[-12,-26],[-4,-32],[6,-32],[14,-26]].forEach(p=>E(p[0],p[1],4.4,5.6,c1));break;
    case 'tulip':ctx.strokeStyle=c2;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(Math.sin(tick*0.03+i)*4,-24,0,-46);ctx.stroke();ctx.beginPath();ctx.ellipse(-8,-14,9,3.5,-0.6,0,7);ctx.fillStyle=c2;ctx.fill();T([[-9,-46],[-9,-60],[-3,-52],[0,-62],[3,-52],[9,-60],[9,-46]],c1);break;
    case 'cheese':T([[-30,0],[30,0],[30,-14],[-30,-34]],c1);ctx.fillStyle=c2;[[-12,-10,4],[8,-8,3],[18,-4,2]].forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],p[2],0,7);ctx.fill();});break;
    case 'candle':R(-6,-36,12,36,c1,2);ctx.fillStyle='#ffb84a';ctx.beginPath();ctx.ellipse(0,-44-Math.sin(tick*0.3+i)*1.5,4,8,0,0,7);ctx.fill();glow(ctx,0,-44,30,'255,200,100',0.35);break;
    case 'lantern':R(-8,-30,16,30,c2,3);R(-12,-36,24,6,c1,2);ctx.fillStyle='#ffd86b';ctx.fillRect(-5,-26,10,22);glow(ctx,0,-16,34,'255,200,100',0.4);break;
    case 'plant':T([[-12,0],[12,0],[9,-18],[-9,-18]],c2);[[-10,-36,-0.5],[0,-44,0],[10,-34,0.5]].forEach(p=>{ctx.save();ctx.translate(p[0],-18);ctx.rotate(p[2]);ctx.beginPath();ctx.ellipse(0,-14,6,16,0,0,7);fillOL(ctx,c1,1.6);ctx.restore();});break;
    case 'duck':E(0,-14,16,12,c1);E(14,-28,9,9,c1);T([[22,-28],[31,-26],[22,-24]],c2);ctx.fillStyle=OL;ctx.beginPath();ctx.arc(16,-30,1.6,0,7);ctx.fill();break;
    case 'bubbles':for(let j=0;j<4;j++){const a=(tick*0.4+j*30)%120;ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(Math.sin(j*2+tick*0.03)*8,-a,6+j*2,0,7);ctx.stroke();}break;
    case 'kelp':ctx.strokeStyle=OL;ctx.lineWidth=9;ctx.lineCap='round';for(let p=0;p<2;p++){ctx.strokeStyle=p?c1:OL;ctx.lineWidth=p?5:9;ctx.beginPath();ctx.moveTo(0,0);for(let j=1;j<=8;j++)ctx.lineTo(Math.sin(tick*0.04+j*0.7+i)*10*(j/8),-j*11);ctx.stroke();}break;
    case 'coral':ctx.strokeStyle=OL;[0,1].forEach(p=>{ctx.strokeStyle=p?c1:OL;ctx.lineWidth=p?5:9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-34);ctx.moveTo(0,-14);ctx.lineTo(-14,-30);ctx.moveTo(0,-22);ctx.lineTo(14,-40);ctx.stroke();});E(0,-36,5,5,c2);E(-14,-32,4,4,c2);E(14,-42,4,4,c2);break;
    case 'sail':T([[-30,0],[30,0],[22,-14],[-22,-14]],c2);R(-2,-70,4,58,'#5a3a1a',1);T([[2,-68],[2,-20],[30,-20]],c1);T([[-2,-60],[-2,-24],[-24,-24]],c1);break;
    case 'planet':E(0,-30,28,28,c1);ctx.fillStyle=c2;ctx.beginPath();ctx.ellipse(-8,-36,8,4,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(10,-22,6,3,0,0,7);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,-30,44,9,-0.3,0,7);ctx.stroke();break;
    case 'rocket':T([[-10,-12],[10,-12],[10,-52],[0,-70],[-10,-52]],c1);T([[-10,-24],[-20,-8],[-10,-8]],c2);T([[10,-24],[20,-8],[10,-8]],c2);E(0,-42,5,5,'#7fe8ff');ctx.fillStyle='#ffb04d';ctx.beginPath();ctx.ellipse(0,-6+Math.sin(tick*0.5)*2,5,9,0,0,7);ctx.fill();break;
    case 'catstatue':E(0,-22,16,22,c1);E(0,-52,14,13,c1);T([[-13,-60],[-9,-76],[-2,-62]],c1);T([[13,-60],[9,-76],[2,-62]],c1);ctx.fillStyle=c2;ctx.beginPath();ctx.arc(-5,-53,2.2,0,7);ctx.arc(5,-53,2.2,0,7);ctx.fill();R(-8,-42,16,5,c2,2);break;
    case 'pagoda':R(-26,-30,52,30,c1,2);T([[-36,-30],[0,-52],[36,-30]],c2);R(-18,-60,36,24,c1,2);T([[-28,-60],[0,-80],[28,-60]],c2);ctx.fillStyle='#ffd86b';ctx.fillRect(-4,-20,8,20);break;
    case 'potion':ctx.beginPath();ctx.moveTo(-5,-44);ctx.lineTo(5,-44);ctx.lineTo(5,-30);ctx.quadraticCurveTo(18,-22,14,-8);ctx.quadraticCurveTo(0,0,-14,-8);ctx.quadraticCurveTo(-18,-22,-5,-30);ctx.closePath();fillOL(ctx,c1,1.6);R(-6,-50,12,8,'#8a5a2a',2);break;
    case 'note':E(-6,-8,8,6,c1);ctx.strokeStyle=c1;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(1,-8);ctx.lineTo(1,-44);ctx.lineTo(16,-36);ctx.stroke();break;
    case 'pine':T([[-18,-16],[18,-16],[0,-46]],c1);T([[-14,-36],[14,-36],[0,-64]],c1);T([[-10,-56],[10,-56],[0,-82]],c1);R(-3,-16,6,16,'#6b4423',1);ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(-8,-70);ctx.lineTo(8,-70);ctx.lineTo(0,-82);ctx.fill();break;
    case 'tree':R(-5,-50,10,50,'#6b4423',2);E(0,-66,28,26,c1);E(-18,-54,16,14,c2);E(18,-56,16,14,c2);break;
    case 'pumpkin':E(0,-16,22,16,c1);ctx.fillStyle=c2;T([[-10,-20],[-4,-26],[-2,-18]],c2);T([[10,-20],[4,-26],[2,-18]],c2);ctx.beginPath();ctx.moveTo(-10,-10);ctx.lineTo(-4,-6);ctx.lineTo(0,-10);ctx.lineTo(4,-6);ctx.lineTo(10,-10);ctx.fill();R(-3,-34,6,8,'#3a7a2a',2);break;
    case 'tomb':ctx.beginPath();ctx.moveTo(-26,0);ctx.bezierCurveTo(-30,-26,-12,-40,4,-38);ctx.bezierCurveTo(24,-36,32,-14,28,0);ctx.closePath();fillOL(ctx,c1,1.8);ctx.strokeStyle=c2;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,-26);ctx.quadraticCurveTo(0,-32,10,-26);ctx.moveTo(-4,-14);ctx.lineTo(8,-18);ctx.stroke();break;
    case 'gift':R(-18,-28,36,28,c1,2);ctx.fillStyle=c2;ctx.fillRect(-3,-28,6,28);ctx.fillRect(-18,-17,36,6);ctx.strokeStyle=OL;ctx.lineWidth=1.4;ctx.strokeRect(-18,-28,36,28);E(-6,-34,7,5,c2);E(6,-34,7,5,c2);break;
    case 'cupcake':T([[-14,0],[14,0],[18,-20],[-18,-20]],c2);ctx.beginPath();ctx.arc(0,-24,18,Math.PI,0);ctx.closePath();fillOL(ctx,c1,1.6);E(0,-40,4,4,'#ff4a6a');break;
    case 'hay':ctx.beginPath();ctx.ellipse(0,-16,26,16,0,0,7);fillOL(ctx,c1,1.6);ctx.strokeStyle=c2;ctx.lineWidth=1.8;for(let j=0;j<8;j++){ctx.beginPath();ctx.moveTo(-20+j*5,-8);ctx.lineTo(-16+j*5,-28);ctx.stroke();}break;
    case 'books':R(-20,-12,40,12,c1,1);R(-16,-24,34,12,c2,1);R(-22,-36,38,12,c1,1);ctx.fillStyle=c2;ctx.fillRect(-14,-8,6,4);break;
    case 'piano':R(-40,-44,80,44,c1,4);R(-40,-14,80,14,c2,2);ctx.fillStyle=c1;for(let j=0;j<8;j++)ctx.fillRect(-34+j*9,-14,5,8);break;
    case 'sock':ctx.beginPath();ctx.moveTo(-8,-40);ctx.lineTo(8,-40);ctx.lineTo(8,-12);ctx.quadraticCurveTo(20,-8,14,0);ctx.lineTo(-8,0);ctx.closePath();fillOL(ctx,c1,1.6);R(-9,-46,18,8,c2,2);break;
    case 'tub':R(-34,-26,68,26,c1,8);R(-30,-34,60,10,c2,5);ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(-28,-20,40,4);break;
    case 'gear':{ctx.save();ctx.rotate(tick*0.01*(i%2?1:-1));ctx.beginPath();for(let j=0;j<16;j++){const a=j*0.3927,r=j%2?24:30;ctx.lineTo(Math.cos(a)*r,-30+Math.sin(a)*r);}ctx.closePath();ctx.restore();ctx.save();ctx.translate(0,-30);ctx.rotate(tick*0.01*(i%2?1:-1));ctx.beginPath();for(let j=0;j<16;j++){const a=j*0.3927,r=j%2?24:30;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();fillOL(ctx,c1,1.6);ctx.beginPath();ctx.arc(0,0,9,0,7);fillOL(ctx,c2,1.6);ctx.restore();break;}
    case 'pillar':R(-12,-120,24,120,c1,3);R(-16,-128,32,10,c2,3);R(-16,-8,32,8,c2,3);break;
    case 'cloud':ctx.fillStyle=c1;[[0,-20,22],[24,-14,17],[-24,-12,16],[44,-8,11],[-42,-8,11]].forEach(p=>{ctx.beginPath();ctx.arc(p[0],p[1],p[2],0,7);ctx.fill();});ctx.fillStyle=c2;ctx.beginPath();ctx.ellipse(0,-2,46,6,0,0,7);ctx.fill();break;
    case 'volcano':T([[-70,0],[-14,-80],[14,-80],[70,0]],c1);ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(-14,-80);ctx.quadraticCurveTo(0,-92-Math.sin(tick*0.1)*4,14,-80);ctx.lineTo(8,-70);ctx.lineTo(-8,-70);ctx.fill();glow(ctx,0,-84,50,'255,120,40',0.5);break;
    case 'ferris':{ctx.save();ctx.translate(0,-80);ctx.rotate(tick*0.004);ctx.strokeStyle=c1;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,60,0,7);ctx.stroke();for(let j=0;j<8;j++){const a=j*0.785;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*60,Math.sin(a)*60);ctx.stroke();ctx.save();ctx.translate(Math.cos(a)*60,Math.sin(a)*60);ctx.rotate(-tick*0.004);R(-7,0,14,12,c2,3);ctx.restore();}ctx.restore();T([[-30,0],[0,-80],[30,0]],'rgba(0,0,0,.25)');break;}
    case 'balloon':E(0,-40,16,20,c1);ctx.strokeStyle='rgba(0,0,0,.45)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,-20);ctx.quadraticCurveTo(6,-10,0,0);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.ellipse(-6,-48,3,6,0,0,7);ctx.fill();break;
    case 'bridge':R(-96,-64,192,12,c2,3);ctx.beginPath();ctx.rect(-96,-52,192,52);fillOL(ctx,c1,1.6);ctx.fillStyle='rgba(20,30,50,.55)';for(const ax of[-48,48]){ctx.beginPath();ctx.moveTo(ax-30,0);ctx.lineTo(ax-30,-18);ctx.arc(ax,-18,30,Math.PI,0);ctx.lineTo(ax+30,0);ctx.closePath();ctx.fill();}ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=1;for(let j=0;j<4;j++){ctx.beginPath();ctx.moveTo(-96,-48+j*8);ctx.lineTo(-78,-48+j*8);ctx.moveTo(78,-48+j*8);ctx.lineTo(96,-48+j*8);ctx.stroke();}break;
    case 'refinery':R(-54,-74,26,74,c1,3);R(-20,-108,18,108,c1,3);R(8,-56,38,56,c2,3);ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-28,-50);ctx.lineTo(8,-40);ctx.moveTo(-2,-70);ctx.lineTo(8,-70);ctx.stroke();glow(ctx,-11,-116,30,'255,150,40',0.55+0.25*Math.sin(tick*0.2));E(-11,-114,4,9+Math.sin(tick*0.3)*2,'#ffb84a');E(-11,-112,2,5,'#fff2a0');ctx.fillStyle='#ffe9a0';for(let j=0;j<3;j++)ctx.fillRect(-48,-60+j*16,5,5);break;
    case 'chilipot':R(-22,-28,44,26,c1,7);E(0,-28,22,5,c2);ctx.strokeStyle=OL;ctx.lineWidth=3;ctx.beginPath();ctx.arc(-24,-16,6,1.6,4.7);ctx.stroke();ctx.beginPath();ctx.arc(24,-16,6,-1.6,1.6);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.45)';for(let j=0;j<3;j++){ctx.beginPath();ctx.arc(-8+j*8+Math.sin(tick*0.05+j)*3,-38-((tick*0.5+j*14)%26),3+j,0,7);ctx.fill();}break;
    case 'mothman':glow(ctx,0,-70,40,'255,30,30',0.18);T([[0,-44],[-50,-92],[-44,-52],[-24,-28]],c1);T([[0,-44],[50,-92],[44,-52],[24,-28]],c1);E(0,-36,9,22,c1);E(0,-66,8,8,c1);E(-3,-67,2.4,2.4,'#ff2a2a');E(3,-67,2.4,2.4,'#ff2a2a');glow(ctx,0,-67,12,'255,40,40',0.6);R(-9,-14,6,14,c1,2);R(3,-14,6,14,c1,2);break;
    case 'bigfoot':E(0,-34,20,26,c1);E(0,-66,11,11,c1);E(-4,-67,1.8,1.8,'#fff');E(4,-67,1.8,1.8,'#fff');E(-22,-36,6,20,c1);E(22,-36,6,20,c1);R(-14,-14,10,14,c1,3);R(4,-14,10,14,c1,3);ctx.strokeStyle=c2;ctx.lineWidth=1.4;for(let j=0;j<5;j++){ctx.beginPath();ctx.moveTo(-12+j*6,-44);ctx.lineTo(-13+j*6,-30);ctx.stroke();}break;
    case 'gazebo':R(-38,-8,76,8,c2,2);R(-32,-58,5,50,c2,1);R(27,-58,5,50,c2,1);R(-6,-58,5,50,c2,1);T([[-44,-58],[0,-86],[44,-58]],c1);R(-30,-30,60,4,c2,1);E(0,-88,3,3,c2);break;
    case 'marquee':R(-5,-48,10,48,c2,2);R(-40,-84,80,38,c1,5);ctx.fillStyle=c2;ctx.font='900 17px system-ui';ctx.textAlign='center';ctx.fillText('ROXY',0,-58);for(let j=0;j<9;j++){ctx.fillStyle=(Math.floor(tick/12)+j)%2?'#fff6a0':'#ff9a3a';ctx.beginPath();ctx.arc(-34+j*8.5,-80,1.8,0,7);ctx.arc(-34+j*8.5,-50,1.8,0,7);ctx.fill();}glow(ctx,0,-66,48,'255,220,120',0.25);break;
    case 'sign':R(-3,-52,6,52,'#5a3a22',1);R(-22,-62,44,22,c1,3);ctx.fillStyle=c2;ctx.beginPath();ctx.moveTo(-14,-54);ctx.lineTo(6,-54);ctx.lineTo(6,-60);ctx.lineTo(16,-51);ctx.lineTo(6,-42);ctx.lineTo(6,-48);ctx.lineTo(-14,-48);ctx.closePath();ctx.fill();break;
    case 'train':R(-70,-40,140,30,c1,4);R(-70,-44,140,6,c2,2);ctx.fillStyle=c2;for(let j=0;j<4;j++)ctx.fillRect(-58+j*32,-34,18,14);for(const wx of[-48,-30,30,48])E(wx,-6,7,7,'#2a2a33');R(-76,-20,6,4,c2,1);R(70,-20,6,4,c2,1);ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-90,0);ctx.lineTo(90,0);ctx.stroke();break;
    case 'kayak':ctx.beginPath();ctx.moveTo(-46,-14);ctx.quadraticCurveTo(0,-4,46,-14);ctx.quadraticCurveTo(0,-26,-46,-14);ctx.closePath();fillOL(ctx,c1,1.6);E(0,-18,8,5,c2);ctx.strokeStyle=OL;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-26,-34);ctx.lineTo(26,-6);ctx.stroke();E(-26,-34,6,3,c2);E(26,-6,6,3,c2);break;
    case 'falls':R(-34,-100,68,16,'#6a7a6a',3);R(-34,-90,10,90,'#6a7a6a',2);R(24,-90,10,90,'#6a7a6a',2);ctx.fillStyle=c1;ctx.fillRect(-24,-86,48,86);ctx.fillStyle=c2;for(let j=0;j<6;j++){const yy=((tick*3+j*16)%86);ctx.fillRect(-20+j*7,-86+yy,3,16);}glow(ctx,0,0,40,'255,255,255',0.35);break;
    case 'mansion':R(-56,-70,112,70,c1,3);T([[-62,-70],[0,-108],[62,-70]],c2);R(-12,-34,24,34,'#3a2a22',4);for(const wx of[-44,-28,18,34]){R(wx-6,-56,12,16,'#ffd86b',2);}ctx.fillStyle=c2;for(const cx of[-20,20])ctx.fillRect(cx-3,-70,6,36);E(0,-84,5,5,'#ffd86b');break;
    case 'school':R(-60,-56,120,56,c1,2);R(-14,-84,28,28,c1,2);T([[-18,-84],[0,-100],[18,-84]],c2);E(0,-70,8,8,'#fff6e0');ctx.strokeStyle=OL;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(0,-70);ctx.lineTo(0,-75);ctx.moveTo(0,-70);ctx.lineTo(4,-68);ctx.stroke();ctx.fillStyle=c2;for(let j=0;j<5;j++)ctx.fillRect(-52+j*22,-42,12,16);R(-8,-22,16,22,'#3a2a22',2);break;
    case 'flag':R(-2,-70,4,70,'#d8d8e0',1);ctx.beginPath();ctx.moveTo(2,-70);for(let j=0;j<=10;j++)ctx.lineTo(2+j*3,-70+Math.sin(tick*0.12+j*0.7)*2.5);for(let j=10;j>=0;j--)ctx.lineTo(2+j*3,-52+Math.sin(tick*0.12+j*0.7)*2.5);ctx.closePath();fillOL(ctx,c1,1.4);ctx.fillStyle=c2;ctx.fillRect(10,-64,10,8);E(0,-4,10,3,'#4fa04a');break;
    case 'apple':E(-6,-14,12,12,c1);E(6,-14,12,12,c1);R(-1,-30,3,8,'#5a3a22',1);E(7,-28,6,3,'#4fbf5a');ctx.fillStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.ellipse(-8,-18,3,5,0.4,0,7);ctx.fill();break;
    case 'dome':R(-50,-30,100,30,c2,2);ctx.beginPath();ctx.arc(0,-30,34,Math.PI,0);ctx.closePath();fillOL(ctx,c1,1.6);R(-4,-76,8,14,c1,1);E(0,-78,4,4,c1);ctx.fillStyle='rgba(255,255,255,.4)';ctx.fillRect(-20,-48,5,16);for(let j=0;j<5;j++)ctx.fillRect(-42+j*20,-26,6,22);break;
    default:R(-14,-30,28,30,c1,4);
  }
  ctx.restore();
}
function drawLayer(l){
  const off=cam*l.par;
  if(l.k==='h'){
    const gr=ctx.createLinearGradient(0,l.base-l.amp,0,VH);gr.addColorStop(0,l.c1);gr.addColorStop(1,l.c2);
    ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(0,VH);
    for(let sx=0;sx<=VW;sx+=8){const wx=sx+off;ctx.lineTo(sx,l.base+Math.sin(wx*l.fq*3)*l.amp*0.6+Math.sin(wx*l.fq*8+1)*l.amp*0.35);}
    ctx.lineTo(VW,VH);ctx.fill();
  } else if(l.k==='c'){
    skyline(l.par,l.col,l.mn,l.mx,l.sd,l.lit,440);
  } else if(l.k==='w'){
    ctx.fillStyle=l.col;ctx.beginPath();ctx.moveTo(0,VH);
    for(let sx=0;sx<=VW;sx+=6)ctx.lineTo(sx,l.base+Math.sin((sx+off)*0.02+tick*0.05*(l.par+0.5))*l.amp+Math.sin((sx+off)*0.05+tick*0.03)*l.amp*0.4);
    ctx.lineTo(VW,VH);ctx.fill();
  } else if(l.k==='m'){
    const cw=150,first=Math.floor(off/cw);
    ctx.fillStyle=l.col;
    for(let k=0;k<Math.ceil(VW/cw)+2;k++){const i=first+k,x=i*cw-off,h=l.hh*(0.55+hsh(i*3)*0.6);ctx.beginPath();ctx.moveTo(x-60,VH);ctx.lineTo(x+cw/2,l.base-h);ctx.lineTo(x+cw+60,VH);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.moveTo(x+cw/2,l.base-h);ctx.lineTo(x+cw/2-h*0.18,l.base-h+h*0.22);ctx.lineTo(x+cw/2+h*0.18,l.base-h+h*0.22);ctx.closePath();ctx.fill();ctx.fillStyle=l.col;}
  } else if(l.k==='p'){
    const first=Math.floor(off/l.gap);
    ctx.globalAlpha=0.5+0.3*l.par;
    for(let k=0;k<Math.ceil(VW/l.gap)+3;k++){
      const i=first+k;if(hsh(i*3+7+l.par*10)<0.12)continue;
      const x=i*l.gap-off+hsh(i+l.par*5)*l.gap*0.45;
      drawProp(l.prop,x,l.base,l.sc,l.c1,l.c2,i);
    }
    ctx.globalAlpha=1;
  }
}
function drawFXT(fx){
  if(!fx)return;
  for(let i=0;i<30;i++){
    const s=hsh(i*3.7),s2=hsh(i*9.1),s3=hsh(i*5.3);
    let x,y;
    switch(fx){
      case 'snow':x=((s*VW+Math.sin(tick*0.02+i)*22-cam*0.25*(0.5+s2))%VW+VW)%VW;y=(tick*(0.7+s3*1.3)+s2*VH)%VH;ctx.fillStyle='rgba(255,255,255,.9)';ctx.beginPath();ctx.arc(x,y,1.4+s*2.2,0,7);ctx.fill();break;
      case 'leaves':x=((s*VW+tick*(0.8+s3)-cam*0.3)%(VW+80)+VW+80)%(VW+80)-40;y=(tick*(0.7+s2)+s3*VH)%VH;ctx.save();ctx.translate(x,y);ctx.rotate(tick*0.05+i);ctx.fillStyle=['#e0852a','#c94a1f','#f2b030','#a8401a'][i%4];ctx.beginPath();ctx.ellipse(0,0,5,2.6,0,0,7);ctx.fill();ctx.restore();break;
      case 'petals':x=((s*VW+tick*(0.6+s3)-cam*0.3)%(VW+80)+VW+80)%(VW+80)-40;y=(tick*(0.5+s2*0.6)+s3*VH)%VH;ctx.save();ctx.translate(x,y);ctx.rotate(tick*0.04+i);ctx.fillStyle=['#ffb3d1','#ffd0e6','#fff'][i%3];ctx.beginPath();ctx.ellipse(0,0,4,2.2,0,0,7);ctx.fill();ctx.restore();break;
      case 'bubbles':x=((s*VW+Math.sin(tick*0.03+i)*14-cam*0.2)%VW+VW)%VW;y=VH-((tick*(0.5+s3*1.2)+s2*VH)%VH);ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,y,3+s*6,0,7);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.arc(x-1,y-1,1.5,0,7);ctx.fill();break;
      case 'embers':x=((s*VW+Math.sin(tick*0.04+i)*16-cam*0.2)%VW+VW)%VW;y=VH-((tick*(0.8+s3*1.5)+s2*VH)%VH);ctx.fillStyle='rgba(255,'+(120+s*100|0)+',40,'+(0.4+0.5*(y/VH))+')';ctx.beginPath();ctx.arc(x,y,1.2+s*2,0,7);ctx.fill();break;
      case 'stars':x=s*VW;y=s2*VH*0.8;ctx.globalAlpha=0.3+0.7*Math.abs(Math.sin(tick*0.05+i));ctx.fillStyle='#fff';ctx.fillRect(x,y,2.2,2.2);ctx.fillRect(x-2,y+0.6,6.4,1);ctx.fillRect(x+0.6,y-2,1,6.4);ctx.globalAlpha=1;break;
      case 'dust':x=((s*VW+tick*0.25*(0.5+s3)-cam*0.5)%VW+VW)%VW;y=(s2*VH+Math.sin(tick*0.02+i)*14);ctx.fillStyle='rgba(255,255,255,'+(0.2+0.3*s3)+')';ctx.beginPath();ctx.arc(x,y,1.2+s*1.8,0,7);ctx.fill();break;
      case 'confetti':x=((s*VW+Math.sin(tick*0.03+i)*20-cam*0.3)%VW+VW)%VW;y=(tick*(0.8+s3*1.4)+s2*VH)%VH;ctx.save();ctx.translate(x,y);ctx.rotate(tick*0.1+i);ctx.fillStyle='hsl('+(i*47)%360+',90%,60%)';ctx.fillRect(-3,-1.5,6,3);ctx.restore();break;
      case 'sparkles':x=s*VW;y=s2*VH;ctx.globalAlpha=Math.max(0,Math.sin(tick*0.06+i*2));ctx.fillStyle='#fff';ctx.fillRect(x-4,y,8,1.4);ctx.fillRect(x,y-4,1.4,8);ctx.globalAlpha=1;break;
      case 'fireflies':x=((s*VW+Math.sin(tick*0.02+i*3)*40-cam*0.4)%VW+VW)%VW;y=s2*VH*0.8+Math.cos(tick*0.025+i)*30;glow(ctx,x,y,12,'200,255,120',0.5+0.5*Math.sin(tick*0.08+i));break;
      case 'steam':x=((s*VW-cam*0.5)%VW+VW)%VW;y=VH-((tick*(0.4+s3)+s2*VH)%VH);ctx.fillStyle='rgba(255,255,255,'+(0.18*(y/VH))+')';ctx.beginPath();ctx.arc(x+Math.sin(tick*0.03+i)*8,y,8+(1-y/VH)*14,0,7);ctx.fill();break;
      case 'rain':x=((s*VW*1.2-cam*0.6+tick*2)%(VW+40)+VW+40)%(VW+40);y=(tick*(9+s3*5)+s2*VH)%VH;ctx.strokeStyle='rgba(190,210,255,.5)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y+12);ctx.stroke();break;
      case 'hearts':x=((s*VW+Math.sin(tick*0.03+i)*16-cam*0.3)%VW+VW)%VW;y=VH-((tick*(0.5+s3)+s2*VH)%VH);ctx.fillStyle='rgba(255,120,160,.7)';ctx.beginPath();ctx.arc(x-2,y,2.6,0,7);ctx.arc(x+2,y,2.6,0,7);ctx.moveTo(x-4.6,y+1);ctx.lineTo(x,y+6);ctx.lineTo(x+4.6,y+1);ctx.fill();break;
    }
  }
}
function drawThemeBG(th){
  const c=th.cfg;
  const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,c.sky[0]);g.addColorStop(0.55,c.sky[1]);g.addColorStop(1,c.sky[2]);
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  if(c.stars){for(let i=0;i<90;i++){const sx=(i*137.5)%VW,sy=(i*61.3)%300;ctx.globalAlpha=0.35+0.65*Math.abs(Math.sin(tick*0.03+i));ctx.fillStyle=i%7===0?'#bfe6ff':'#fff';const s=i%4===0?2.4:1.4;ctx.fillRect(sx,sy,s,s);}ctx.globalAlpha=1;}
  if(c.cel==='sun'){glow(ctx,650,90,230,c.celRGB||'255,244,190',0.8);ctx.fillStyle=c.celCol||'#fff7b8';ctx.beginPath();ctx.arc(650,90,c.celR||36,0,7);ctx.fill();}
  else if(c.cel==='moon'){glow(ctx,620,95,200,'200,210,255',0.55);ctx.fillStyle=c.celCol||'#fff6d0';ctx.beginPath();ctx.arc(620,95,c.celR||40,0,7);ctx.fill();ctx.fillStyle='rgba(180,170,140,.4)';[[-12,-8,8],[10,10,10],[8,-16,5]].forEach(([dx,dy,r])=>{ctx.beginPath();ctx.arc(620+dx,95+dy,r,0,7);ctx.fill();});}
  if(c.clouds){for(let i=0;i<5;i++){const cx=((i*260-cam*0.12-tick*0.15)%1500+1500)%1500-180;cloud(cx,60+(i%3)*50,0.9+(i%2)*0.35,0.9);}}
  c.layers.forEach(drawLayer);
  drawFXT(c.fx);
}

const LH=(par,c1,c2,base,amp,fq)=>({k:'h',par,c1,c2,base,amp,fq:fq||0.006});
const LC=(par,col,mn,mx,sd,lit)=>({k:'c',par,col,mn,mx,sd,lit});
const LP=(par,prop,c1,c2,gap,sc,base)=>({k:'p',par,prop,c1,c2,gap,sc,base});
const LW=(par,col,base,amp)=>({k:'w',par,col,base,amp});
const LM=(par,col,base,hh)=>({k:'m',par,col,base,hh});
const TH=(name,sky,g,gs,pl,layers,fx,o)=>{o=o||{};return Object.assign({name,sky,g,gs,pl,layers,fx,pool:0},o);};
const THEME50=[
 TH('Cozy Cat Cafe',['#ffe9d2','#ffd3a9','#f4ab7d'],'#a9703c','planks','#f0d2a8',[LP(.2,'window','#a8dcff','#ffffff',320,1.3,250),LP(.4,'shelf','#7a4a28','#d89a55',240,1,340),LP(.7,'cup','#fff6e6','#c9733a',150,1,392)],'dust'),
 TH('Yarn Factory',['#ffd1e8','#ffb3d6','#ff8fc0'],'#d14a8a','stripes','#ffe36a',[LP(.25,'yarn','#ff5fa2','#ffd84a',170,1.7,390),LP(.5,'yarn','#4aa8ff','#8affc1',230,1.2,392),LP(.8,'yarn','#9d6bff','#ff9fd4',300,.9,394)],'sparkles'),
 TH('Tuna Cannery',['#243b55','#456b8a','#9bbdd1'],'#5f7488','metal','#a9bccc',[LC(.12,'#1d2f44',110,230,3,['#ffd86b','#7ee8ff']),LP(.4,'tin','#c8d3de','#3a8fd6',170,1.4,392)],'steam'),
 TH('Pet Shop',['#fff4cf','#ffe289','#ffc65a'],'#2f56b8','checker','#ffd9a0',[LP(.25,'shelf','#8a5a33','#e0a85a',250,1.1,300),LP(.5,'bowl','#ff6f91','#fff',170,1.1,392),LP(.75,'box','#c98a4a','#e8b074',230,.9,392)],'sparkles'),
 TH('Vet Clinic',['#e8fbff','#c6f0f6','#9fe0ec'],'#9cc9d2','tile','#ffffff',[LP(.25,'window','#bfe9ff','#ffffff',320,1.2,250),LP(.5,'cross','#ff6f8f','#ffffff',260,1,330),LP(.8,'jar','#ffffff','#7fd8c0',200,1,392)],'sparkles'),
 TH('Cat Show Arena',['#3b0f26','#7d1f40','#c8405f'],'#7a2038','planks','#ffd84a',[LP(.2,'spot','#ffe9a0','#fff',300,1.3,40),LP(.45,'star','#ffd84a','#fff',200,1.2,300),LP(.8,'trophy','#ffd84a','#c9a020',260,1.1,392)],'confetti',{pool:1}),
 TH('Cardboard Box City',['#f2dcb0','#e6c58e','#d1a468'],'#b98a52','planks','#e8c98f',[LC(.15,'#c79a60',100,200,4,null),LP(.5,'box','#c98a4a','#e8b074',160,1.5,392)],'dust'),
 TH('Scratch Post Savanna',['#ffcf7a','#ffa756','#ff7f50'],'#b9763c','sand','#e0a860',[LH(.12,'#e08a4a','#c46a30',300,30),LP(.35,'acacia','#8a7a2a','#a8923c',280,1.6,392),LP(.6,'post','#d8b27a','#8a5a2b',200,1.2,392)],'dust',{cel:'sun',celCol:'#fff0b0',pool:1}),
 TH('Litter Box Desert',['#ffeab0','#ffd27a','#f3b04a'],'#e3bf74','sand','#c9a05a',[LH(.12,'#e8c27a','#d4a54e',290,26,.004),LP(.35,'cactus','#4f9a4a','#2f6f35',230,1.3,392)],'dust',{cel:'sun',celR:48,pool:2}),
 TH('Cat Condo Tower',['#ffe5f1','#ffc9e0','#ff9fc8'],'#c97fa8','carpet','#ffe2a0',[LP(.25,'post','#e8b074','#ff8fc0',210,1.3,392),LP(.5,'ball','#ffd84a','#ff8a3a',180,1.2,392),LP(.7,'paw','#ff8fc0','#ffd0e6',240,1,150)],'hearts'),
 TH('Laser Disco',['#12002b','#3a0a6b','#7a1fa0'],'#3b1a6b','tile','#ff4fd8',[LP(.2,'spot','#ff4fd8','#fff',260,1.4,30),LC(.2,'#1a0840',90,220,2,['#ff4fd8','#4fffe8'])],'sparkles',{neon:1,stars:1,pool:3}),
 TH('Catnip Garden',['#c9f2d0','#a6e8b4','#7dd68f'],'#4fa35a','grass','#c9a3ff',[LH(.15,'#8fd9a0','#6bc47d',280,30),LP(.4,'nip','#4fbf6a','#b07dff',150,1.4,392),LP(.7,'tulip','#c07dff','#4fbf6a',110,1,394)],'petals',{cel:'sun',pool:2}),
 TH('Mouse Hole Mansion',['#2a1d33','#4a2f55','#7b4f7a'],'#5b3a46','brick','#d9a86a',[LP(.2,'window','#ffd86b','#2a1d33',300,1.3,240),LP(.5,'cheese','#ffd84a','#e0a82a',230,1.1,392),LP(.8,'candle','#fff0c0','#ffb84a',180,1,392)],'dust',{pool:4}),
 TH('Sunbeam Windowsill',['#fff2c4','#ffe08a','#ffc95a'],'#d8a45c','planks','#ffffff',[LP(.2,'window','#bfe6ff','#ffffff',380,2,250),LP(.6,'plant','#4fbf6a','#c9733a',230,1.2,392)],'dust',{cel:'sun',celR:52}),
 TH('Bubble Bath',['#c9f4ff','#9be4f7','#6fd0ee'],'#6fb7d6','tile','#ffffff',[LP(.2,'duck','#ffd84a','#ff8a3a',280,1.4,300),LP(.5,'soap','#ffb3d6','#fff',200,1,392)],'bubbles',{pool:3}),
 TH('Aquarium Tank',['#0c3f7a','#1666b0','#2f9ad8'],'#d8c68f','sand','#7fe0c0',[LW(.15,'#0f4c8a',300,10),LP(.3,'kelp','#2f9f6a','#1f7f50',130,1.6,392),LP(.6,'coral','#ff7aa8','#ffb04a',210,1.3,392)],'bubbles',{pool:3}),
 TH('Pirate Cat Ship',['#7fd0ff','#bfe9ff','#f4fbff'],'#7a4a28','planks','#d9a86a',[LW(.1,'#2f7fc0',350,6),LP(.25,'sail','#ffffff','#7a4a28',320,1.5,370),LW(.5,'#1f5f9a',390,5)],null,{cel:'sun',clouds:1,pool:2}),
 TH('Space Cat Station',['#05020f','#150b3a','#2a1a6a'],'#4a5a7a','metal','#7fe8ff',[LP(.12,'planet','#ff9f6a','#c94a3a',420,1.6,200),LC(.2,'#171d46',80,190,5,['#7fe8ff','#ffffff']),LP(.4,'rocket','#e8eef8','#ff5a5a',320,1,392)],'stars',{stars:1,neon:1,pool:3}),
 TH('Cheese Moon',['#0a0a2a','#1a1a55','#3a3a8a'],'#f0c84a','cheese','#ffe680',[LP(.2,'planet','#ffe9a0','#f0c84a',500,1.4,180),LP(.5,'cheese','#f5d060','#e0a82a',200,1.2,392)],'stars',{stars:1}),
 TH('Egyptian Pyramids',['#ffcf8a','#ffb066','#ff8a4a'],'#d9b36a','stone','#e8c98f',[LP(.12,'pyramid','#c98a4a','#a56a30',420,2.4,380),LP(.35,'pyramid','#d9a05a','#b87a3a',380,1.5,390),LP(.65,'cat','#2a2a33','#ffd84a',300,1.2,392)],'dust',{cel:'sun',pool:1}),
 TH('Ninja Cat Dojo',['#1a1a2e','#2e2a4a','#4a3f6a'],'#5a3a2a','planks','#c9a06a',[LP(.3,'pagoda','#2a2040','#d94a4a',360,1.4,392),LP(.6,'lantern','#ff6a4a','#ffd86b',170,1,392)],'petals',{cel:'moon',pool:4}),
 TH('Wizard Cat Tower',['#1a1050','#3a2a8a','#6a4ac8'],'#4a3a8a','stone','#c9a3ff',[LP(.15,'star','#ffd84a','#fff',160,.9,100),LP(.35,'castle','#2a2060','#6a4ac8',360,1.6,392),LP(.65,'potion','#7fe8a0','#c07dff',200,1,392)],'sparkles',{stars:1,pool:4}),
 TH('Jazz Cat Club',['#1a0f2a','#3a1f4a','#6a2f6a'],'#4a2a3a','planks','#ffd84a',[LP(.25,'note','#ffd84a','#fff',160,1.4,230),LP(.5,'lamp','#ffd86b','#8a3a5a',220,1.3,392),LP(.75,'piano','#111','#ffffff',360,1,392)],'sparkles',{pool:1}),
 TH('Snowy Igloo',['#cfe9ff','#e8f4ff','#ffffff'],'#cfe3f5','snow','#bfe3ff',[LM(.12,'#b7d4ee',330,150),LP(.4,'pine','#2f6f5a','#eaf6ff',170,1.5,392),LP(.65,'igloo','#f4faff','#bcd8ee',420,1.3,392)],'snow',{cel:'sun',celCol:'#fff',celRGB:'255,255,255',pool:2}),
 TH('Autumn Leaves',['#ffd9a0','#ffb870','#f08a4a'],'#8a5a2a','grass','#d9a86a',[LH(.15,'#e08a3a','#b8601f',290,30),LP(.4,'tree','#c94a1f','#e08a3a',190,1.8,392)],'leaves',{top:'#e0852a',pool:2}),
 TH('Tulip Field',['#cdeaff','#e6f7ff','#fff5fa'],'#5fbf6a','grass','#ffc9e0',[LH(.15,'#9fe0b0','#7ccf90',290,26),LP(.4,'tulip','#ff6fa8','#4fbf6a',100,1.6,392),LP(.7,'tulip','#ffd84a','#4fbf6a',130,1.3,394)],'petals',{cel:'sun',clouds:1,pool:2}),
 TH('Beach Day',['#7fd8ff','#bfeeff','#f4fcff'],'#f0d58a','sand','#ffffff',[LW(.1,'#3fa8e0',330,8),LP(.3,'palm','#7a5a2a','#3fbf5a',260,1.6,392),LW(.5,'#2f8fd0',385,6)],null,{cel:'sun',clouds:1,pool:2}),
 TH('Haunted Halloween',['#0d0820','#2a1240','#4a2060'],'#3a2a4a','stone','#ff8a2a',[LC(.15,'#150a28',100,220,6,['#ff9a3a','#ffd86b']),LP(.4,'pumpkin','#ff8a2a','#2a1a10',170,1.3,392),LP(.7,'pumpkin','#ff8a2a','#2a1a10',230,1,392)],'fireflies',{cel:'moon',celCol:'#ffb04d',celR:52,pool:4}),
 TH('Christmas Tree Chaos',['#0f2a4a','#1f4a7a','#3a7aaa'],'#e8f4ff','snow','#ff5a5a',[LP(.2,'pine','#1f6f3a','#ffffff',150,1.8,392),LP(.5,'gift','#ff5a5a','#ffd84a',220,1,392)],'snow',{stars:1,pool:2}),
 TH('Birthday Party',['#ffe3f4','#ffc7e8','#ff9fd4'],'#ff6fb0','candy','#7fe8ff',[LP(.2,'balloon','#ff5a8a','#fff',150,1.5,300),LP(.45,'balloon','#4aa8ff','#fff',210,1.2,320),LP(.75,'gift','#ffd84a','#ff5a8a',210,1,392)],'confetti'),
 TH('Cat Bakery',['#fff0dc','#ffdcb0','#ffc088'],'#d9955a','planks','#ffffff',[LP(.25,'window','#bfe6ff','#fff',340,1.2,250),LP(.5,'cupcake','#ff9fc8','#c9733a',170,1.4,392),LP(.8,'cup','#fff6e6','#c9733a',210,1,392)],'sparkles'),
 TH('Milk Dairy Farm',['#cfeeff','#eaf8ff','#ffffff'],'#6fbf5a','grass','#ffffff',[LH(.12,'#9fe0a0','#7ccf80',290,28),LP(.3,'barn','#c0392b','#ffffff',420,1.6,392),LP(.6,'tin','#ffffff','#8fd0ff',190,1,392)],null,{cel:'sun',clouds:1,pool:2}),
 TH('Hay Barn Loft',['#f6e0b0','#e8c488','#c9a060'],'#b8903f','hay','#d9b06a',[LP(.25,'window','#ffd86b','#7a4a28',330,1.2,250),LP(.5,'hay','#e8c85a','#c9a030',190,1.4,392)],'dust'),
 TH('Library Shelves',['#2a1a10','#4a2f1a','#7a4a28'],'#5a3a22','planks','#d9b06a',[LP(.2,'shelf','#3a2414','#9a6a38',200,1.4,200),LP(.4,'books','#b0402a','#4a7fbf',170,1.2,392),LP(.7,'lamp','#ffe9a0','#2a6a4a',250,1,392)],'dust'),
 TH('Piano Concerto',['#1a1a2a','#2f2f4a','#4f4f7a'],'#f4f4f4','keys','#ffd84a',[LP(.3,'note','#ffd84a','#fff',200,1.4,200),LP(.6,'piano','#111','#ffffff',300,1.3,392)],'sparkles',{pool:1}),
 TH('Laundry Day',['#cfe9ff','#e6f4ff','#ffffff'],'#8fb0d0','tile','#ff9fc8',[LP(.2,'sock','#ff6f8f','#fff',160,1.4,200),LP(.5,'tub','#bcd8ee','#fff',240,1.2,392)],'bubbles'),
 TH('Shoe Closet',['#e8d8f0','#d4bce0','#bc9ad0'],'#8a5a7a','carpet','#ffd0e8',[LP(.2,'shelf','#6a4a7a','#d9b0e8',230,1.3,260),LP(.5,'shoe','#c94a6a','#ffffff',190,1.4,392)],'dust'),
 TH('Sewing Room',['#ffe3e3','#ffc9c9','#ff9f9f'],'#c97a8a','stripes','#ffffff',[LP(.2,'spool','#ff6f8f','#ffd84a',180,1.6,392),LP(.5,'tin','#ffffff','#ff6f8f',210,1,392)],'sparkles'),
 TH('Toy Box Playroom',['#cfe9ff','#ffe9a0','#ffc9e0'],'#4aa8ff','checker','#ffd84a',[LP(.2,'block','#ff5a5a','#4aa8ff',150,1.6,392),LP(.5,'ball','#7bea9f','#ff8a3a',200,1.2,392)],'confetti'),
 TH('Windup Mouse Factory',['#2f2a3a','#4a4260','#6a6090'],'#6a6a80','metal','#ffb04d',[LP(.2,'gear','#8a8aa8','#5a5a78',200,1.8,200),LP(.5,'gear','#b0a050','#7a7030',260,1.3,392)],'steam'),
 TH('Alley Dumpster',['#2a2a38','#4a4a5e','#7a7a90'],'#5a5a6a','brick','#8a9a6a',[LC(.15,'#232330',100,230,7,['#ffd86b','#ffd86b']),LP(.5,'dumpster','#2f7a5a','#1f5a3f',300,1.3,392),LP(.8,'can','#9a9aa8','#6a6a78',150,1,392)],'rain',{pool:4}),
 TH('Fire Escape Sunset',['#4a2a5a','#aa4a6a','#ff9a5a'],'#6a4a5a','brick','#9a9aa8',[LC(.12,'#3a2250',100,230,8,null),LC(.28,'#2a1a40',90,220,9,['#ffd86b','#ff9a6a'])],null,{cel:'sun',celCol:'#fff0b0',celR:50,pool:1}),
 TH('Subway Station',['#1a2a3a','#2f4a5f','#4a6f8a'],'#7a8a9a','tile','#ffd84a',[LC(.2,'#1a2634',120,200,10,['#fff6a0','#7fe8ff']),LP(.5,'pillar','#6a7a8a','#4a5a6a',240,1.4,392)],'dust',{pool:1}),
 TH('Lucky Cat Shrine',['#ffd0d8','#ff9fb0','#ff6a80'],'#b02f3a','tile','#ffd84a',[LP(.3,'pagoda','#c0392b','#ffd84a',380,1.5,392),LP(.6,'lantern','#ff4a4a','#ffd84a',180,1,392),LP(.85,'lucky','#ffffff','#ffd84a',300,1.1,392)],'petals',{pool:4}),
 TH('Candy Land',['#ffd9f0','#ffb3e0','#ff8fcf'],'#ff6fb0','candy','#7fe8ff',[LP(.2,'lolly','#ff6fa8','#7fe8ff',180,1.8,392),LP(.5,'cupcake','#7fe8c0','#ffd0e8',230,1.3,392)],'sparkles'),
 TH('Cloud Kingdom',['#8fd0ff','#c6e8ff','#f4fbff'],'#dff0ff','cloud','#ffe9a0',[LP(.15,'cloud','#ffffff','#dff1ff',260,2,300),LP(.4,'cloud','#ffffff','#cfe7ff',220,1.4,360)],'sparkles',{cel:'sun'}),
 TH('Big Cat Jungle',['#2f6f3a','#4fa04a','#8fd070'],'#6a4a2a','grass','#c9a06a',[LH(.15,'#2f8a3f','#1f6a2f',280,34),LP(.35,'tree','#1f6f2f','#4fbf5a',210,2,392),LP(.65,'fern','#2f8a3f','#7fd070',130,1.3,394)],'fireflies',{pool:2}),
 TH('Volcano Lion Den',['#3a0f0a','#8a2a0f','#ff6a1f'],'#4a2a22','stone','#ff9a3a',[LM(.12,'#5a1a10',340,200),LP(.35,'volcano','#4a1a10','#ff5a1f',420,1.6,392),LP(.65,'rock','#5a3a30','#3a2420',190,1,392)],'embers',{pool:1}),
 TH('Arctic Lynx Tundra',['#9fc0e8','#cfe0f4','#f4f8ff'],'#dff0ff','snow','#9fd0ff',[LM(.12,'#a7bfdc',340,170),LM(.3,'#cfe0f4',360,120),LP(.55,'pine','#3a6f6a','#ffffff',200,1.4,392)],'snow',{cel:'sun',celCol:'#fff',celRGB:'255,255,255',pool:2}),
 TH('Cat Carnival',['#2a0f4a','#5a1f7a','#aa3fa0'],'#ffd84a','stripes','#ff5a8a',[LP(.15,'ferris','#ffd84a','#ff5a8a',480,2.2,392),LP(.4,'tent','#ff5a5a','#ffffff',300,1.4,392),LP(.7,'balloon','#7fe8ff','#fff',190,1.2,320)],'confetti',{stars:1,pool:1})
];
const POOLSET=[
 {g:['dog','roomba','cucumber','sprayer','hairball','rival'],f:['bee','laser','bubble','crow']},
 {g:['rival','hairball','dog','sprayer','cucumber'],f:['crow','bird','laser','bee']},
 {g:['dog','rival','hairball','cucumber'],f:['crow','bee','bird','bubble']},
 {g:['hairball','cucumber','sprayer','dog','rival'],f:['bubble','bee','crow','laser']},
 {g:['rival','hairball','dog','cucumber','sprayer'],f:['crow','laser','bee','bubble']}
];
function makeCfg(T,idx){
  const base=T.g;
  const pal={a:shade(base,0.12),b:shade(base,-0.38),edge:shade(base,-0.75),top:T.top||shade(base,0.42),top2:T.top?shade(T.top,-0.25):shade(base,0.1)};
  return {name:T.name,sky:T.sky,pal,gs:T.gs,plat:T.pl,layers:T.layers,fx:T.fx,stars:T.stars,cel:T.cel,celCol:T.celCol,celRGB:T.celRGB,celR:T.celR,clouds:T.clouds,neon:T.neon,pool:T.pool,seed:idx*7+11};
}

const POOLG=[['dog','mouse','hairball','cucumber','rival','dog'],['rival','hairball','sprayer','mouse','dog','rival'],['rival','dog','hairball','sprayer','cucumber','mouse'],['roomba','cucumber','sprayer','mouse','hairball','dog','roomba']];
const POOLF=[['bee','crow','bird','bee'],['crow','bird','laser','bee','crow'],['crow','bee','laser','crow'],['bubble','bee','laser','bubble']];
const ALLEN=['mouse','dog','roomba','cucumber','sprayer','rival','hairball','bee','crow','bubble','laser','bird','pet','crit'];
function msDef(){const en={};ALLEN.forEach(k=>en[k]=1);return {den:50,en,ob:{spikes:1,crates:1,springs:1,gaps:1},fish:100,nips:2,tins:13};}
function getMS(i){const d=msDef(),m=(S.maps||{})[i];if(!m)return d;return {den:m.den==null?d.den:m.den,en:Object.assign(d.en,m.en||{}),ob:Object.assign(d.ob,m.ob||{}),fish:m.fish==null?100:m.fish,nips:m.nips==null?2:m.nips,tins:m.tins==null?13:m.tins};}
let MS=msDef(), ARENA=false, dogNow=false, BS=1, SEEDX=0;
const VARNAMES=['Sky Path','Spike Garden','Tower Climb','Crate Maze','Bounce Valley','Stepping Stones'];
const VARTINT=['255,150,60','150,60,200','60,150,255','255,90,120','60,200,130','20,10,70'];
function section2(H,x0,W,v,seed){
  const R=k=>hsh(seed*2.3+k*5.1);
  let x=x0+7,n=0;const end=W-14;
  while(x<end){
    n++;
    if(v===0){const gw=8+Math.floor(R(x)*4);H.gap(x,x+gw-1);for(let i=0;i<gw;i+=3){const row=10-((i/3)%3);H.plat(x+i,row,2);H.fish(x+i,row-1,2);}x+=gw+6;if(R(x)>0.55){H.spikes(x,2);x+=5;}}
    else if(v===1){H.spikes(x,3);H.plat(x-1,9,5);H.fish(x,8,3);x+=7;if(R(x)>0.4){H.spring(x);H.plat(x+2,6,3);H.fish(x+2,5,3);x+=7;}else x+=3;}
    else if(v===2){for(let i=0;i<5;i++){H.plat(x+i*3,11-i,3);H.fish(x+i*3,10-i,2);}H.spikes(x,12);for(let i=0;i<4;i++){H.plat(x+15+i*3,7+i,3);}H.fish(x+16,6,3);x+=30;}
    else if(v===3){const h=2+Math.floor(R(x)*2);for(let j=0;j<h;j++)H.crate(x,11-j);H.fish(x+1,10,2);x+=4;for(let j=0;j<3;j++)H.crate(x,11-j);x+=2;H.arc(x,10,4,1.8);x+=6;}
    else if(v===4){H.spring(x);H.plat(x+2,5,4);H.fish(x+2,4,4);H.plat(x+8,6,3);H.fish(x+8,5,3);if(R(x)>0.5)H.spikes(x+4,3);x+=14;}
    else {const gw=18+Math.floor(R(x)*6);H.gap(x,x+gw-1);for(let i=0;i<gw;i+=4){const row=9+((i/4)%2);H.plat(x+i,row,2);H.fish(x+i,row-1,2);}x+=gw+4;H.spring(x);x+=5;}
    if(n%3===0&&x<end-4){H.check(x);x+=4;}
  }
}
function populate(L,pools,ti,H){
  const W=L.W,g=L.g,f=MS.den/50;
  const gp=pools.g.filter(k=>MS.en[k]),fp=pools.f.filter(k=>MS.en[k]);
  const gx=L.goal?L.goal.x/TS:W;
  const near=(x,d)=>L.enemies.some(e=>Math.abs(e.x/TS-x)<d);
  const gc=(x,y)=>(x>=0&&x<W&&y>=0&&y<ROWS)?g[y][x]:'#';
  const nearCP=x=>{for(let k=-4;k<=4;k++)if(gc(x+k,11)==='C')return true;return false;};
  let x=16;
  while(x<gx-6){
    let ok=!nearCP(x);
    for(let k=-1;k<=1;k++)if(gc(x+k,12)!=='#')ok=false;
    for(let k=-2;k<=2;k++){if(gc(x+k,11)!==' ')ok=false;}
    if(gc(x,10)!==' ')ok=false;
    if(gp.length&&ok&&!near(x,7)&&hsh(x*7.1+ti*13)<0.34*f)H.spawn(gp[Math.floor(hsh(x*3.3+ti)*gp.length)],x);
    if(fp.length&&!near(x,9)&&!nearCP(x)&&hsh(x*5.7+ti*3)<0.14*f){const row=5+Math.floor(hsh(x*2.9)*4);if(gc(x,row)===' '&&gc(x+1,row)===' ')H.spawn(fp[Math.floor(hsh(x*1.7+ti)*fp.length)],x,row);}
    x+=3+Math.floor(hsh(x*3+W)*3);
  }
  for(let ty=3;ty<12;ty++){
    let tx=14;
    while(tx<gx-4){
      if(g[ty][tx]==='='){
        let e=tx;while(e+1<W&&g[ty][e+1]==='=')e++;
        const len=e-tx+1,cx=Math.floor((tx+e)/2);
        if(gp.length&&len>=4&&gc(cx,ty-1)===' '&&gc(cx,ty-2)===' '&&!near(cx,6)&&!nearCP(cx)&&hsh(cx*4.1+ty+ti)<0.22*f)H.spawn(gp[Math.floor(hsh(cx*2.3+ty)*gp.length)],cx,ty);
        tx=e+1;
      } else tx++;
    }
  }
}
function sprinkle(L){
  const W=L.W,g=L.g,gx=L.goal?L.goal.x/TS:W-6;
  const gc=(x,y)=>(x>=0&&x<W&&y>=0&&y<ROWS)?g[y][x]:'#';
  const cands=[];
  for(let x=14;x<gx-4;x++)if(gc(x,12)==='#'&&gc(x,11)===' '&&gc(x,10)===' ')cands.push(x);
  L.tins=[];L.nips=[];
  const nT=MS.tins,nN=MS.nips;
  for(let i=0;i<nT&&cands.length;i++){const x=cands[Math.min(cands.length-1,Math.floor((i+0.5)/nT*cands.length))];L.tins.push({x:x*TS+16,y:11*TS+8,got:false,ph:i});}
  for(let i=0;i<nN&&cands.length;i++){const x=cands[Math.min(cands.length-1,Math.floor((i+0.5)/nN*cands.length)+3)];L.nips.push({x:x*TS+16,y:9*TS+10,got:false,ph:i});}
}
function build(name,W1,tiArg,fn){
  const cfg=(typeof tiArg==='object')?tiArg:null, ti=cfg?cfg.seed:tiArg;
  const RO=makeRoster(ti*5.1+W1*0.37+SEEDX*1.3);
  const sx=SEEDX, sec2=ARENA?0:64+Math.floor(hsh(ti*3.7+W1)*16);
  const W=W1+sec2;
  const g=Array.from({length:ROWS},()=>Array(W).fill(' '));
  const L={name,W,g,coins:[],enemies:[],theme:cfg?{cfg}:THEMES[tiArg],goal:null,startX:2,half:0,var:0,note:''};
  const set=(x,y,ch)=>{if(x>=0&&x<W&&y>=0&&y<ROWS)g[y][x]=ch;};
  let hand=true;
  const keepF=(x,y)=>hsh(x*7.7+y*3.1+ti*1.9+sx)<MS.fish/100;
  const H={
    set,
    ground(){for(let x=0;x<W;x++){set(x,12,'#');set(x,13,'#');}},
    gap(a,b){if(!MS.ob.gaps)return;for(let x=a;x<=b;x++){set(x,12,' ');set(x,13,' ');}},
    plat(x,y,n){for(let i=0;i<n;i++)set(x+i,y,'=');},
    crate(x,y){if(MS.ob.crates)set(x,y,'b');},
    spikes(x,n){if(MS.ob.spikes)for(let i=0;i<n;i++)set(x+i,11,'^');},
    spring(x){if(MS.ob.springs)set(x,11,'y');},
    check(x){set(x,11,'C');},
    fish(x,y,n){n=n||1;for(let i=0;i<n;i++)if(keepF(x+i,y))L.coins.push({x:(x+i)*TS+16,y:y*TS+16,got:false,ph:Math.random()*6});},
    arc(x,y,n,hgt){for(let i=0;i<n;i++){const k=n>1?i/(n-1):0.5;if(keepF(x+i,y))L.coins.push({x:(x+i)*TS+16,y:(y-Math.sin(k*Math.PI)*(hgt||1.5))*TS+16,got:false,ph:i});}},
    spawn(t,x,y){
      let pv=null;
      if(!ARENA){const cls=GROUNDT[t]?RO.g:(ESZ[t]?RO.f:null);if(cls){const pk=cls[Math.floor(hsh(x*6.1+(y||0)*1.3+ti*2.7)*cls.length)];t=pk.t;pv=pk.v;}}
      if(dogNow&&t==='dog')t='rival';
      if(!MS.en[t]&&!(t==='rival'&&MS.en.dog))return;
      if(hand&&hsh(x*9.3+(y||0)*2.7+ti)>=Math.min(1,0.6*MS.den/50))return;
      const e=mkEnemy({t,v:pv},x,y);L.enemies.push(e);return e;
    },
    mouse(x,row){H.spawn(POOLG[ti][Math.floor(hsh(x*5.3+ti)*POOLG[ti].length)],x,row);},
    bird(x,y){H.spawn(POOLF[ti][Math.floor(hsh(x*4.1+ti)*POOLF[ti].length)],x,y);},
    plate(x,y){H.spawn('bubble',x,y);},
    goal(x){if(ARENA){L.goalPos={x:x*TS,y:11*TS};}else{L.half=x*TS;set(x,11,'C');H.halfX=x;}}
  };
  H.ground(); fn(H);
  if(!ARENA){
    const hx=H.halfX||(W1-8), v=(Math.abs(ti)+Math.floor(W1/7)+sx)%6;
    L.var=v;
    section2(H,hx,W,v,ti+5+sx);
    L.goal={x:(W-8)*TS,y:11*TS};
    for(let x=W-14;x<W;x++){set(x,12,'#');set(x,13,'#');for(let y=0;y<12;y++)if(g[y][x]==='^'||g[y][x]==='=')g[y][x]=' ';}
    hand=false;
    populate(L,cfg?POOLSET[cfg.pool]:{g:POOLG[ti],f:POOLF[ti]},ti+sx,H); sprinkle(L);
  } else {L.tins=[];L.nips=[];}
  L.shots=[];
  return L;
}
function genBody(h,seed,W){
  let x=10,cpX=6,last=-1;
  const R=k=>hsh(seed*1.7+x*3.1+k);
  while(x<W-18){
    if(x-cpX>=34){h.check(x);cpX=x;x+=4;continue;}
    let pat=Math.floor(R(0)*7); if(pat===last)pat=(pat+1+Math.floor(R(9)*5))%7; last=pat;
    if(pat===0){const gw=2+Math.floor(R(1)*2);h.gap(x,x+gw-1);h.arc(x-1,10,gw+2,1.8);x+=gw+2;}
    else if(pat===1){const n=2+Math.floor(R(2)*2);let row=10-Math.floor(R(3)*2);for(let i=0;i<n;i++){h.plat(x+i*4,row,3);h.fish(x+i*4,row-1,3);row=Math.max(6,row-1);}x+=n*4;}
    else if(pat===2){h.spikes(x,2);h.arc(x-1,10,4,2.3);x+=4;}
    else if(pat===3){const n=1+Math.floor(R(5)*3);for(let i=0;i<n;i++)h.crate(x,11-i);if(n>1)h.crate(x+1,11);h.fish(x+2,10,2);x+=4;}
    else if(pat===4){h.spring(x);h.plat(x+2,5,4);h.fish(x+2,4,4);x+=7;}
    else if(pat===5){const gw=7+Math.floor(R(6)*3);h.gap(x,x+gw-1);const n=Math.ceil(gw/4);for(let i=0;i<n;i++){const row=(i%2)?9:10;h.plat(x+i*4,row,2);h.fish(x+i*4,row-1,2);}x+=gw+2;}
    else {h.arc(x,10,6,1.2);x+=6;}
    x+=3+Math.floor(R(8)*4);
  }
  h.goal(W-9);
}
function gen(T,idx){
  const cfg=makeCfg(T,idx), seed=idx*97+13, W=112+Math.floor(hsh(seed)*28);
  const Lv=build(T.name,W,cfg,h=>genBody(h,seed,W));
  Lv.note=T.note||'';return Lv;
}
const CNAMES=[['Backyard Bash','Garden Gnome Gauntlet','Sprinkler Sprint','Picket Fence Parade','Birdbath Bounce','Flowerbed Frenzy','Hedge Maze Hop','Mailbox Madness','Treehouse Trek','Clothesline Climb','Sandbox Safari','Hammock Hustle'],
 ['Chimney Chase','Antenna Alley','Gargoyle Gap','Skylight Skip','Satellite Sprint','Water Tower Wobble','Fire Escape Frolic','Weathervane Whirl','Pigeon Parade','Penthouse Pounce','Cable Car Caper','Rooftop Garden'],
 ['Moonlit Mews','Dumpster Dash','Streetlight Shuffle','Back Fence Brawl','Foggy Footpath','Puddle Patrol','Midnight Meow','Neon Noodle Alley','Cobblestone Creep','Lantern Lane','Bat Cave Backstreet','Owl Hour'],
 ['Pantry Panic','Spaghetti Slide','Stovetop Scramble','Fridge Fiasco','Cookie Jar Caper','Sink Splash','Toaster Tumble','Blender Bash','Cutlery Canyon','Spice Rack Run','Dishwasher Dive','Teapot Tango']];
function classicName(k){return 'C'+(5+k)+' · '+CNAMES[k%4][Math.floor(k/4)];}
function genC(k){
  const ti=k%4,seed=500+k*53,W=108+Math.floor(hsh(seed)*34);
  SEEDX=k*7+1;
  try{return build(CNAMES[ti][Math.floor(k/4)],W,ti,h=>genBody(h,seed,W));}finally{SEEDX=0;}
}

const LEVELS=[
 ()=>build('Sunny Backyard',100,0,h=>{
   h.fish(6,10,3); h.crate(10,11); h.crate(11,11); h.crate(11,10);
   h.plat(14,9,3); h.fish(14,8,3);
   h.gap(19,21); h.arc(18,10,5,1.8);
   h.mouse(27); h.mouse(31); h.fish(26,10,3);
   h.plat(34,9,4); h.fish(34,8,4);
   h.spring(41); h.plat(43,6,4); h.fish(43,5,4);
   h.check(46);
   h.gap(50,52); h.arc(49,10,5,1.8);
   h.mouse(56); h.crate(58,11);
   h.gap(61,72); h.plat(61,10,2); h.plat(65,9,2); h.plat(69,10,2); h.fish(61,9,2); h.fish(65,8,2); h.fish(69,9,2);
   h.mouse(77); h.spikes(81,2); h.arc(80,10,4,2); h.mouse(86);
   h.crate(90,11); h.crate(91,11); h.crate(91,10); h.fish(93,10,2);
   h.goal(96);
 }),
 ()=>build('Sunset Rooftops',112,1,h=>{
   h.fish(6,10,3);
   h.gap(14,16); h.arc(13,10,5,1.8);
   h.plat(19,9,3); h.fish(19,8,3); h.mouse(24);
   h.spikes(29,2); h.arc(28,10,4,2.3);
   h.plat(33,10,3); h.bird(37,8); h.fish(36,8,3);
   h.gap(41,43); h.arc(40,10,5,1.8);
   h.check(46);
   h.plat(48,9,3); h.plat(52,7,3); h.plat(56,5,3); h.fish(48,8,3); h.fish(52,6,3); h.fish(56,4,3);
   h.spring(60); h.crate(62,11); h.crate(63,11);
   h.gap(66,78); h.plat(66,10,2); h.plat(70,9,2); h.plat(74,8,2); h.fish(66,9,2); h.fish(70,8,2); h.fish(74,7,2); h.bird(72,6);
   h.check(80);
   h.mouse(84); h.bird(88,8); h.mouse(90);
   h.spikes(94,2); h.arc(93,10,4,2.3); h.plat(95,8,3); h.fish(95,7,3);
   h.crate(99,11); h.crate(100,11); h.crate(100,10); h.bird(102,9);
   h.gap(104,105); h.fish(103,10,3);
   h.goal(108);
 }),
 ()=>build('Midnight Alley',128,2,h=>{
   h.fish(6,10,3);
   h.gap(12,14); h.arc(11,10,5,1.8);
   h.mouse(20); h.mouse(24); h.crate(26,11); h.crate(27,11);
   h.spikes(31,2); h.plat(30,8,4); h.fish(30,7,4); h.bird(36,9);
   h.gap(40,42); h.arc(39,10,5,1.8);
   h.check(45);
   h.spring(47);
   h.gap(50,62); h.plat(50,6,3); h.plat(54,6,3); h.plat(58,6,3); h.fish(50,5,3); h.fish(54,5,3); h.fish(58,5,3);
   h.bird(56,8);
   h.check(64);
   h.mouse(68); h.mouse(71); h.bird(75,9); h.bird(79,8);
   h.spikes(83,2); h.plat(82,9,4); h.fish(82,8,4);
   h.crate(88,11); h.crate(89,11); h.crate(89,10); h.crate(90,11);
   h.gap(94,96); h.arc(93,10,5,1.8); h.mouse(100);
   h.check(102);
   h.spikes(105,2); h.arc(104,10,4,2.4); h.bird(108,9);
   h.gap(112,113); h.spikes(116,2); h.arc(115,10,4,2.4); h.bird(119,8);
   h.goal(123);
 })
 ,()=>build('Kitchen Chaos',142,3,h=>{
   h.fish(6,10,3); h.mouse(12); h.plate(17,9);
   h.gap(21,23); h.arc(20,10,5,1.8);
   h.mouse(28); h.mouse(31); h.crate(34,11); h.crate(35,11); h.crate(35,10);
   h.plate(40,8); h.spikes(45,2); h.plat(44,8,4); h.fish(44,7,4);
   h.check(49);
   h.gap(53,55); h.arc(52,10,5,1.8);
   h.plat(58,10,2); h.plat(61,8,2); h.plat(64,6,2); h.fish(58,9,2); h.fish(61,7,2); h.fish(64,5,2); h.plate(62,4);
   h.mouse(69); h.mouse(72);
   h.spring(76); h.plat(78,5,4); h.fish(78,4,4);
   h.plate(83,8); h.plate(88,9);
   h.spikes(92,2); h.plat(91,8,4); h.fish(91,7,4);
   h.check(97);
   h.gap(100,111); h.plat(100,10,2); h.plat(104,9,2); h.plat(108,10,2); h.fish(100,9,2); h.fish(104,8,2); h.fish(108,9,2); h.plate(105,6);
   h.mouse(115); h.mouse(118); h.crate(121,11); h.crate(122,11); h.crate(122,10); h.crate(123,11);
   h.spikes(127,2); h.arc(126,10,4,2.4); h.plate(130,8);
   h.gap(133,135); h.arc(132,10,5,1.8); h.mouse(138);
   h.goal(140);
 })
];
const CT=(name,note,sky,g,gs,pl,layers,fx,o)=>TH(name,sky,g,gs,pl,layers,fx,Object.assign({note},o||{}));
const CLEN=[
 CT('Welcome to Clendenin','Town motto: "Clendenin\'s Beauty is Everyone\'s Duty"',['#8fd6ff','#c8efff','#f4fcff'],'#4fa35a','grass','#ffffff',[LM(.1,'#7fa6c8',340,150),LH(.2,'#6fb86f','#4f9a56',300,26),LP(.4,'sign','#2f6f4a','#fff',260,1.4,392),LP(.7,'tulip','#ff6fa8','#4fbf6a',120,1,394)],'petals',{cel:'sun',clouds:1,pool:2}),
 CT('Elk River Kitty Cruise','Clendenin sits on the lower Elk River',['#8fd6ff','#c8efff','#f4fcff'],'#6a8a5a','grass','#ffffff',[LM(.1,'#6fa0b8',330,120),LW(.15,'#3f9fd0',350,8),LP(.35,'kayak','#ff8a3a','#fff',320,1.2,375),LW(.5,'#2f86bf',392,5)],null,{cel:'sun',clouds:1,pool:2}),
 CT('Elk River Rail Trail','The trail follows an old railroad bed along the Elk',['#bfe9ff','#e2f6ff','#fffdf2'],'#8a8f7a','stone','#e8e0c8',[LH(.12,'#7ec27e','#5aa860',300,30),LP(.35,'tree','#3f8f4a','#6fc06f',200,1.8,392),LP(.65,'sign','#3a6f4a','#fff',420,1.1,392)],'dust',{pool:2,clouds:1,cel:'sun'}),
 CT('Gazebo at the Trailhead','The First Day Hike starts at the downtown gazebo',['#dfeeff','#f2f8ff','#ffffff'],'#cfe0ee','snow','#bfe3ff',[LM(.12,'#b5cce2',330,140),LP(.4,'pine','#2f6f5a','#eaf6ff',200,1.5,392),LP(.7,'gazebo','#8a3a3a','#ffffff',360,1.4,392)],'snow',{cel:'sun',celCol:'#fff',celRGB:'255,255,255',pool:2}),
 CT("Chili'N on the Elk",'Annual chili cook-off that benefits the Elk River Trail',['#ffd9a0','#ffb870','#e8854a'],'#a05a2a','planks','#e8b86a',[LP(.2,'tent','#c0392b','#fff',300,1.3,392),LP(.45,'chilipot','#b0302a','#ffd84a',200,1.5,392),LP(.8,'chilipot','#6a3a2a','#ffb04d',260,1.1,392)],'steam',{pool:0}),
 CT('Chili Chase Kitty 5K','A 5K run kicks off the chili festival',['#ffe0b0','#ffc885','#ff9f60'],'#d86a3a','stripes','#fff1a0',[LP(.2,'balloon','#ff5a3a','#fff',170,1.4,300),LP(.5,'chilipot','#c0392b','#ffd84a',250,1.2,392),LP(.8,'flag','#ff5a3a','#fff',180,1.2,392)],'confetti',{pool:1}),
 CT('Big Sandy Creek Splash','Big Sandy Creek meets the Elk right in town',['#a8e8ff','#d4f4ff','#f4fcff'],'#7a9a6a','grass','#ffffff',[LH(.12,'#6fc07a','#4fa060',300,28),LW(.2,'#3fb0d8',360,6),LP(.4,'rock','#7a8a8a','#5a6a6a',190,1.2,392),LP(.7,'fern','#3fa04a','#7fd070',120,1.2,394)],'bubbles',{cel:'sun',pool:3}),
 CT('The Confluence','Where the Elk River meets the Kanawha',['#7fc8f0','#b8e4fa','#eefaff'],'#7a8a6a','sand','#ffffff',[LM(.1,'#5f8fb0',330,160),LW(.15,'#2f7fc0',345,10),LW(.35,'#3f9fd8',370,8),LP(.55,'sail','#fff','#7a4a28',360,1.2,380)],null,{cel:'sun',clouds:1,pool:2}),
 CT('Queen Shoals Rapids','The trail runs from Clendenin toward Queen Shoals',['#9fd8ff','#c8ecff','#e8f8ff'],'#7a8a7a','stone','#eaf6ff',[LM(.12,'#6a9ab8',340,150),LW(.2,'#3fa0d0',365,10),LP(.4,'rock','#8a9a9a','#5a6a6a',170,1.4,392),LP(.7,'falls','#bfe9ff','#fff',420,.9,392)],'bubbles',{pool:3}),
 CT('Stone Arch Bridge','Clendenin\'s historic stone arch bridge',['#ffd9b0','#ffc08a','#f0987a'],'#8a7a6a','stone','#e8d0b0',[LM(.1,'#8a6a8a',335,140),LP(.3,'bridge','#a89a8a','#7a6a5a',420,1.6,392),LW(.5,'#3f7fb0',392,4)],null,{cel:'sun',celCol:'#fff0b0',pool:2}),
 CT('Roxy Theater Cat Night','The Roxy Theater is a Clendenin landmark',['#1a0f2a','#3a1a4a','#7a2f5a'],'#4a2a3a','brick','#ffd84a',[LC(.15,'#1a0c2a',100,220,6,['#ffd86b','#ff9a6a']),LP(.4,'marquee','#7a1a2a','#ffd84a',360,1.5,392),LP(.7,'spot','#ffe9a0','#fff',300,1.2,40)],'sparkles',{pool:1,stars:1}),
 CT('Historic Main Street','Historic district: 38 buildings from about 1890-1940',['#cfe6ff','#e8f2ff','#fff7e8'],'#8a5a3a','brick','#d9b88a',[LC(.12,'#9a7a6a',110,200,12,['#ffe9a0']),LP(.4,'lantern','#2a2a33','#ffe9a0',220,1.3,392),LP(.7,'window','#bfe0ff','#fff',320,1,250)],'dust',{clouds:1,cel:'sun',pool:1}),
 CT('Maywood Avenue Mews','Alley cats of Maywood Ave patrol at dusk',['#3a2a5a','#8a4a6a','#ff9a6a'],'#5a4a5a','brick','#9a9aa8',[LC(.12,'#2f2248',100,220,8,null),LC(.28,'#241a38',90,200,9,['#ffd86b']),LP(.6,'lantern','#2a2a33','#ffd86b',240,1.2,392)],null,{cel:'sun',celCol:'#fff0b0',celR:46,pool:4}),
 CT('Caboose Cat','The Elk River rail line began construction in 1892',['#ffe2b0','#ffc88a','#f0a06a'],'#7a5a3a','planks','#c9a06a',[LH(.12,'#c98a5a','#a56a3a',300,26),LP(.35,'train','#b0302a','#ffd84a',500,1.1,392),LP(.7,'post','#a07a4a','#6a4a2a',200,1,392)],'dust',{cel:'sun',pool:1}),
 CT('Steam Whistle Express','The Charleston, Clendenin & Sutton Railroad',['#9fc0d8','#d0e0ec','#f4f4f4'],'#6a6a72','metal','#c8ccd4',[LM(.1,'#7a8a9a',335,150),LP(.4,'train','#2a2a33','#c0392b',480,1.2,392),LP(.7,'pillar','#7a7a82','#5a5a62',320,.8,392)],'steam',{pool:1}),
 CT('First Petrochemical Plant','The first petrochemical plant opened here in 1920',['#2a3a4a','#587088','#a8b8c4'],'#5a6a78','metal','#a8b8c8',[LC(.1,'#243240',110,200,3,['#ffd86b']),LP(.35,'refinery','#8a9aa8','#c9d2dc',360,1.5,392),LP(.7,'tin','#c8d3de','#3a8fd6',200,1.2,392)],'steam',{pool:3}),
 CT('Carbide Night Shift','Union Carbide built an early plant here in the 1920s',['#080c18','#16243a','#2f4a6a'],'#3a4a5a','metal','#7fe8ff',[LC(.1,'#101a2c',110,210,3,['#ffd86b','#7fe8ff']),LP(.35,'refinery','#4a5a6a','#7a8a9a',340,1.6,392),LP(.7,'lamp','#ffe9a0','#4a5a6a',230,1.1,392)],'sparkles',{stars:1,cel:'moon',pool:3}),
 CT('Flare Stack Kitty','The old Elk Refinery lit up the valley',['#2a1010','#6a2a1a','#c8602a'],'#4a2a22','stone','#ff9a3a',[LM(.12,'#4a1a12',335,170),LP(.35,'refinery','#3a2a2a','#6a4a4a',380,1.7,392)],'embers',{pool:1}),
 CT('Hedges Mansion Haunt','The Hedges Mansion is on Clendenin\'s sites-of-interest list',['#0d0820','#2a1240','#4a2060'],'#3a2a4a','stone','#ff8a2a',[LC(.15,'#150a28',100,200,6,null),LP(.35,'mansion','#4a3a5a','#2a1a3a',420,1.5,392),LP(.7,'pumpkin','#ff8a2a','#2a1a10',240,.9,392)],'fireflies',{cel:'moon',celCol:'#ffb04d',celR:48,pool:4}),
 CT('The Old High School','The original Clendenin High building still stands',['#cfe6ff','#e8f2ff','#fff8e8'],'#8a4a3a','brick','#e8c98f',[LP(.2,'school','#a8503a','#e8d0a0',460,1.6,392),LP(.5,'tree','#4a8a4a','#7fc07f',240,1.4,392),LP(.8,'flag','#2f5fbf','#ffd84a',300,1,392)],'leaves',{top:'#d9a050',pool:2,clouds:1,cel:'sun'}),
 CT('Husky Way Homecoming','Herbert Hoover High opened in 1963; its new campus in 2023',['#1a2f6a','#2f55aa','#6a8ad8'],'#2f4a8a','checker','#dfe8ff',[LC(.15,'#13245a',110,190,6,['#fff6a0']),LP(.4,'school','#5a7fd0','#dfe8ff',440,1.4,392),LP(.75,'flag','#2f55aa','#ffffff',220,1.3,392)],'confetti',{stars:1,pool:1}),
 CT('Elementary Recess','Kitty kindergarten recess time',['#bfe6ff','#e0f4ff','#fff9d8'],'#6fbf5a','grass','#ffd84a',[LP(.2,'block','#ff5a5a','#4aa8ff',190,1.6,392),LP(.5,'ball','#ffd84a','#ff8a3a',230,1.3,392),LP(.8,'balloon','#ff7bc8','#fff',200,1.2,320)],'confetti',{cel:'sun',clouds:1}),
 CT('Rebuilding Together','After the June 2016 flood, neighbors rebuilt side by side',['#ffe0c0','#ffcba0','#ff9fa0'],'#6a9a5a','grass','#ffd0a0',[LH(.12,'#9ad09a','#6ab070',300,26),LP(.35,'house','#c98a6a','#e8d0a0',380,1.2,392),LP(.65,'tulip','#ff8fb0','#4fbf6a',130,1.2,394)],'hearts',{cel:'sun',celCol:'#fff0b0',celR:52,pool:2}),
 CT('Rainy Day on the Elk','Cats hate rain; the Elk does not mind',['#4a5a6a','#6a7a8c','#98a8b8'],'#4a6a5a','grass','#a8c0b8',[LM(.1,'#4a5a68',335,150),LW(.2,'#3a6a88',370,5),LP(.4,'tree','#2f5f4a','#4a8a6a',200,1.7,392)],'rain',{pool:3}),
 CT('Mothman Moonlight','Some folks claim a winged figure near the Elk River Trail',['#080818','#1a1a3a','#3a2a5a'],'#2a2a3a','stone','#8a8ab8',[LM(.1,'#12122a',340,170),LP(.3,'tree','#14142a','#22223a',210,1.9,392),LP(.55,'mothman','#2a2030','#2a2030',520,1.3,392)],'fireflies',{stars:1,cel:'moon',pool:4}),
 CT('Bigfoot Between Ivydale & Duck','Locals joke: beware of Bigfoot on the trail',['#1a3a2a','#2f5f3a','#6a9a5a'],'#4a3a22','grass','#a8b86a',[LH(.12,'#1f5f2f','#0f3f1f',280,34),LP(.3,'tree','#103f1f','#1f6f2f',150,2.1,392),LP(.6,'bigfoot','#3a2a1a','#6a4a2a',480,1.4,392)],'fireflies',{pool:2}),
 CT('Waterfall Walk','The Elk River Trail has waterfalls, fishing and paddling',['#a8e8c0','#d0f4d8','#f4fff4'],'#6a8a6a','stone','#e8f4ea',[LM(.1,'#6fa08a',335,150),LP(.3,'falls','#bfe9ff','#fff',380,1.3,392),LP(.65,'fern','#2f8a3f','#7fd070',120,1.2,394)],'bubbles',{pool:3}),
 CT('Kayak Kitty','Paddling the lower Elk',['#8fd0ff','#c0e8ff','#eef9ff'],'#5a8a6a','sand','#ffffff',[LH(.12,'#5fb070','#3f9058',310,24),LW(.2,'#3f9fd8',340,8),LP(.4,'kayak','#ffb04d','#fff',220,1.5,370),LW(.55,'#2f86c4',385,6)],null,{cel:'sun',clouds:1,pool:2}),
 CT('Sutton Lake Overlook','Sutton Dam tames the upper Elk, far upstream',['#bfe0ff','#d8eeff','#f6fbff'],'#7a8a7a','stone','#dfe8ee',[LM(.1,'#8fb0d0',330,170),LM(.25,'#6a90b8',350,120),LW(.4,'#4a8ac0',390,4)],null,{cel:'sun',clouds:1,pool:2}),
 CT('Morris Creek Wildlife','Morris Creek Wildlife Management Area',['#bfe8b0','#d8f0c0','#f4fbe0'],'#5a7a3a','grass','#d9c88a',[LH(.12,'#7fc06a','#5aa04a',290,28),LP(.3,'tree','#3f8f3f','#6fbf5f',170,1.9,392),LP(.6,'fern','#3f9f3f','#8fd070',110,1.2,394)],'leaves',{top:'#7ec27e',pool:2,cel:'sun'}),
 CT('Sandy Brae Golf Cat','Sandy Brae Golf Course',['#a8e0ff','#d0f0ff','#f4fcff'],'#4faf4f','grass','#ffffff',[LH(.12,'#7fd07f','#4faf5a',300,22),LP(.35,'flag','#ff5a5a','#fff',420,1.4,392),LP(.65,'tree','#2f8f3f','#5fbf5f',230,1.5,392)],null,{cel:'sun',clouds:1,pool:2}),
 CT('Appalachian Autumn','West Virginia hills in full color',['#ffd9a0','#ffb060','#e8703a'],'#7a4a22','grass','#d9a050',[LM(.1,'#c05a2a',335,170),LH(.2,'#e08a3a','#b8501f',300,30),LP(.4,'tree','#c94a1f','#f0a030',180,1.9,392)],'leaves',{top:'#e0852a',pool:2}),
 CT('Mountain Mist Morning','Fog fills the Elk valley at dawn',['#d8d8f0','#f0e0e8','#fff0e0'],'#6a8a7a','grass','#e8e8f4',[LM(.08,'#a8a8c8',335,180),LM(.2,'#8a9ab8',350,150),LH(.3,'#7a9a8a','#5a8a7a',320,24),LP(.5,'pine','#4a6a6a','#8aa8a8',210,1.5,392)],'steam',{cel:'sun',celCol:'#fff0d0',celR:44,pool:2}),
 CT('Misty Holler Moon','Fireflies and a harvest moon over the holler',['#0c1230','#1a2a4a','#2f4a6a'],'#2a3a3a','grass','#a8d8b8',[LM(.1,'#0f1a30',335,170),LP(.35,'tree','#0f2a2a','#1f4a3a',180,2,392)],'fireflies',{stars:1,cel:'moon',celCol:'#ffe6a0',celR:46,pool:4}),
 CT('Riverside Campfire Cats','Camping by the Elk',['#0a1028','#1a2a4a','#2f3a5a'],'#3a3a2a','grass','#c8a060',[LM(.1,'#0f1a30',335,160),LP(.35,'tent','#c0702a','#ffd84a',360,1.3,392),LP(.6,'candle','#fff0c0','#ffb84a',200,1.4,392)],'fireflies',{stars:1,cel:'moon',pool:4}),
 CT('Winter in the Hills','Snow dusts the Kanawha County hills',['#c8d8f0','#e4ecf8','#ffffff'],'#e0ecf8','snow','#bfd8f4',[LM(.1,'#a8bcd8',335,170),LH(.25,'#f0f4fc','#d8e4f4',310,24),LP(.45,'pine','#2f5f5a','#eaf6ff',170,1.7,392)],'snow',{cel:'sun',celCol:'#fff',celRGB:'255,255,255',pool:2}),
 CT('Dogwood Spring','Spring blossoms on the hills',['#d8f0ff','#f0f8ff','#fff5fa'],'#6fbf6a','grass','#ffd0e4',[LM(.1,'#9fc0d8',335,140),LH(.2,'#8fd890','#6fc070',300,26),LP(.4,'tree','#ffc0d8','#ff9fc0',190,1.8,392),LP(.7,'tulip','#fff','#4fbf6a',110,1.1,394)],'petals',{cel:'sun',clouds:1,pool:2}),
 CT('Summer Swim Hole','Cooling off in the Elk',['#8fe0ff','#c0f0ff','#f0fcff'],'#e0c88a','sand','#ffffff',[LM(.1,'#6fb0c8',335,110),LW(.2,'#3fc0e0',350,7),LP(.4,'duck','#ffd84a','#ff8a3a',240,1.4,335),LW(.55,'#2fa8d4',385,6)],'bubbles',{cel:'sun',celR:50,pool:3}),
 CT('Golden Delicious Fest','Clay County\'s Golden Delicious Apple Festival is a fall favorite nearby',['#fff2c0','#ffe08a','#f0b84a'],'#8a5a2a','planks','#ffd84a',[LP(.2,'tent','#d9a030','#fff',300,1.3,392),LP(.45,'apple','#e8c030','#4fbf5a',180,1.6,392),LP(.8,'hay','#e8c85a','#c9a030',230,1.1,392)],'leaves',{top:'#e8b030',pool:2,cel:'sun'}),
 CT('Rail Trail Marathon','The Elk River Rail Trail Marathon runs up in Clay',['#bfe9ff','#e2f6ff','#fffdf2'],'#8a8f7a','stripes','#ffd84a',[LH(.12,'#7ec27e','#5aa860',300,26),LP(.3,'flag','#ff5a5a','#fff',180,1.4,392),LP(.6,'balloon','#4aa8ff','#fff',200,1.3,320)],'confetti',{cel:'sun',clouds:1,pool:2}),
 CT('Wish for Fish','The Elk River Trail Challenge supports the "Wish for Fish" memorial scholarship',['#a8e0ff','#d0f0ff','#fff8e8'],'#6a9a7a','grass','#ffffff',[LH(.12,'#8fd0a0','#6ab080',300,24),LP(.35,'bowl','#7fd0ff','#fff',210,1.6,392),LP(.65,'tulip','#ffd84a','#4fbf6a',120,1.1,394)],'hearts',{cel:'sun',clouds:1,pool:3}),
 CT('Brew Pub Mews','Clendenin Brewing Co. is on Main Street',['#2a1a10','#5a3a1f','#9a6a38'],'#5a3a22','planks','#d9a050',[LP(.2,'window','#ffd86b','#3a2414',330,1.2,250),LP(.5,'barrel','#8a5a2a','#d9a050',200,1.3,392),LP(.8,'lantern','#2a2a33','#ffe9a0',230,1,392)],'dust',{pool:1}),
 CT('Elk River Bakery Cat','Elk River Baking Company serves fresh treats',['#fff0dc','#ffdcb0','#ffc088'],'#d9955a','planks','#ffffff',[LP(.25,'window','#bfe6ff','#fff',340,1.2,250),LP(.5,'cupcake','#ff9fc8','#c9733a',170,1.4,392),LP(.8,'cup','#fff6e6','#c9733a',210,1,392)],'sparkles',{}),
 CT('Paddlers Patio','Riverside patio evenings on Maywood Ave',['#2a1a3a','#7a3a5a','#ff9a5a'],'#6a4a3a','planks','#ffd86b',[LW(.2,'#3a5a88',380,5),LP(.4,'lantern','#2a2a33','#ffd86b',170,1.3,392),LP(.7,'kayak','#c0392b','#fff',300,1.2,392)],'fireflies',{cel:'sun',celCol:'#ffd890',celR:52,pool:1}),
 CT('Back Road Sunset','Winding back roads through the hills at sunset',['#ffcf8a','#ff9f6a','#c8504a'],'#6a4a2a','grass','#d9a86a',[LM(.1,'#7a3a5a',330,190),LM(.25,'#5a2a4a',350,140),LH(.35,'#4a3a2a','#2a2a1a',330,22),LP(.55,'house','#8a5a3a','#d9a86a',380,1,392)],null,{cel:'sun',celCol:'#fff0b0',celR:56,pool:2}),
 CT('Coal Train Whistle','Coal trains rumble through the Kanawha Valley',['#3a3a48','#5a5a6a','#9a9aa8'],'#3a3a42','stone','#c8c8d4',[LM(.1,'#3a3a48',335,160),LP(.4,'train','#1f1f27','#c0392b',520,1.2,392)],'steam',{pool:1}),
 CT('Capitol Dome Dash','Charleston\'s golden dome shines just down the valley',['#a8d0ff','#d0e6ff','#fff7e0'],'#8a8a7a','tile','#ffd84a',[LC(.12,'#8a9ab8',110,180,10,['#ffe9a0']),LP(.4,'dome','#ffd84a','#e8e0d0',480,1.5,392),LP(.75,'flag','#2f55bf','#ffd84a',260,1.2,392)],'sparkles',{cel:'sun',clouds:1,pool:1}),
 CT('Mountain State Pride','Gold and blue for the Mountain State',['#2f55bf','#5a8ae0','#ffd84a'],'#2f55bf','checker','#ffd84a',[LM(.1,'#1f3f90',335,170),LP(.4,'flag','#2f55bf','#ffd84a',200,1.7,392),LP(.7,'star','#ffd84a','#fff',200,1.2,300)],'confetti',{cel:'sun',celCol:'#fff0a0',pool:1}),
 CT('Wild & Wonderful Night','Dark skies and bright stars over the Elk valley',['#04041a','#0a1a3a','#1a3a5a'],'#2a3a3a','grass','#8ad8c8',[LM(.1,'#0a1228',335,180),LM(.25,'#0f1c38',355,130),LP(.5,'pine','#0a1f28','#14323a',200,1.6,392)],'stars',{stars:1,cel:'moon',pool:4}),
 CT("Jewels' Heavenly Meadow",'For Jewels, forever our best angel',['#9fd8ff','#d8f0ff','#fff8f0'],'#dff0ff','cloud','#ffe9a0',[LP(.15,'cloud','#ffffff','#dff1ff',260,2,300),LH(.3,'#f0fff0','#d8f0e0',320,22),LP(.5,'tulip','#fff','#9fe0b0',110,1.3,394),LP(.7,'star','#ffd84a','#fff',200,1,230)],'hearts',{cel:'sun',celCol:'#fff8d0',celR:56,clouds:1,pool:2})
];
THEME50.forEach((T,i)=>LEVELS.push(()=>gen(T,i)));
CLEN.forEach((T,i)=>LEVELS.push(()=>gen(T,50+i)));
const LEVEL_NAMES=['1 · Backyard','2 · Rooftops','3 · Midnight Alley','4 · Kitchen Chaos'].concat(THEME50.map((T,i)=>(5+i)+' · '+T.name)).concat(CLEN.map((T,i)=>(55+i)+' · '+T.name));
/* ---------- worlds, bosses, story ---------- */
const WORLDS=[];
{const nm=['Home Sweet Home','Cafe Town','Savanna Show','Neon Garden','Bubble Bay','Space & Sands','Seasons & Dojo','Party Pantry','Library Lofts','Back Alleys','Wild Kingdoms','Town & Trail','Creeks & Bridges','Main Street','Rails & Refinery','School Days','Legends & Lore','The Outdoors','Hills & Holler','Seasons & Sips','Home Country'];
 WORLDS.push({name:nm[0],lv:[0,1,2,3]});
 for(let w=0;w<10;w++)WORLDS.push({name:nm[1+w],lv:[0,1,2,3,4].map(k=>4+w*5+k)});
 for(let w=0;w<10;w++)WORLDS.push({name:nm[11+w],lv:[0,1,2,3,4].map(k=>54+w*5+k)});}
const BOSS=[['Sir Barksalot','dog'],['Mega Roomba 9000','roomba'],['King Cucumber','cucumber'],['Madame Spritz','sprayer'],['Alley King Tom','rival'],['Hairball Hydra','hairball'],['The Rat King','mouse'],
 ['General Barkley','dog'],['Vacuumzilla','roomba'],['Pickle Pharaoh','cucumber'],['Captain Squirt','sprayer'],['Shadow Cat Kuro','rival'],['Furball Fury','hairball'],['Mouse Mogul','mouse'],
 ['Duke Doberbark','dog'],['Roomba Rex','roomba'],['Cucumber Kaiju','cucumber'],['Wanda the Water Witch','sprayer'],['Tabby Tyrant','rival'],['Hairball Behemoth','hairball'],['Big Bad Barkzilla','dog']];
const BSC={dog:2.3,roomba:2.6,cucumber:2.1,sprayer:2.3,rival:2.2,hairball:2.5,mouse:2.7};
function worldCfg(wi){
  const w=WORLDS[wi],l=w.lv[0];
  if(l<4)return makeCfg(THEME50[0],0);
  return makeCfg(l<54?THEME50[l-4]:CLEN[l-54],400+wi);
}
function bossLevel(wi){
  const w=WORLDS[wi],kind0=BOSS[wi][1],kind=(dogNow&&kind0==='dog')?'rival':kind0;
  ARENA=true;
  let Lv;
  try{
    const li=w.lv[w.lv.length-1];
    const tiArg=li<4?li:makeCfg(li<54?THEME50[li-4]:CLEN[li-54],300+wi);
    Lv=build(BOSS[wi][0],28,tiArg,h=>{
      h.plat(3,9,4);h.plat(21,9,4);h.plat(12,7,4);h.fish(3,8,4);h.fish(21,8,4);h.fish(12,6,4);
      h.goal(25);
    });
  }finally{ARENA=false;}
  Lv.note='Boss fight! Stomp, slam or dash to win.';
  Lv.tins=[{x:5*TS+16,y:8*TS+8,got:false,ph:0},{x:22*TS+16,y:8*TS+8,got:false,ph:1}];
  const sc=BSC[kind0],sz=ESZ[kind],hp=Math.min(10,5+Math.floor(wi/4));
  const b={t:'boss',boss:1,kind,sc,name:BOSS[wi][0],x:18*TS,w:Math.round(sz[0]*sc),h:Math.round(sz[1]*sc),dir:-1,dead:false,tm:0,vx:0,vy:0,st:0,timer:80,tele:0,chg:0,inv:0,stun:0,hp,maxhp:hp,onGround:false};
  b.y=12*TS-b.h;
  Lv.enemies.push(b);Lv.boss=b;
  return Lv;
}
function bossHurt(b,d){
  if(b.inv>0||b.dead)return;
  b.hp-=d;b.inv=70;b.stun=70;b.st=0;b.timer=60;b.vx=0;shake=14;sfx.stomp();
  burst(b.x+b.w/2,b.y+b.h/2,'#ffd84a',16,5);say(b.x+b.w/2-20,b.y-14,'OOF!','#ffd84a');
  if(b.hp<=0){
    b.dead=true;shake=22;sfx.win();
    for(let i=0;i<50;i++)burst(b.x+b.w/2,b.y+b.h/2,['#ffd84a','#ff77b7','#6ee7ff','#fff'][i%4],1,8);
    say(b.x,b.y-30,'BOSS DEFEATED!','#9fe870');
    for(let i=0;i<8;i++)L.coins.push({x:b.x+b.w/2+(i-4)*24,y:10*TS,got:false,ph:i});
    L.goal=L.goalPos;
  }
}
function bossTick(b,p){
  const ph=b.hp<=b.maxhp/3?3:b.hp<=b.maxhp*2/3?2:1;
  b.tm++;
  if(b.inv>0)b.inv--;
  if(b.stun>0){b.stun--;b.vx*=0.8;}
  else if(b.st===0){
    b.dir=(p.x+p.w/2)>(b.x+b.w/2)?1:-1;b.vx=b.dir*(0.8+ph*0.35);
    if(--b.timer<=0){b.st=Math.random()<0.5?1:2;b.tele=46-ph*5;b.vx=0;}
  } else if(b.st===1){
    if(b.tele>0){b.vx=0;b.tele--;if(b.tele===0){b.vx=b.dir*(5+ph);b.chg=80;}}
    else{b.chg--;if(b.chg<=0||b.hitWall){b.st=0;b.timer=100-ph*12;if(b.hitWall){b.stun=75;shake=12;sfx.slam();say(b.x,b.y-10,'BONK!','#ffd84a');}b.vx=0;}}
  } else if(b.st===2){
    if(b.tele>0){b.vx=0;b.tele--;if(b.tele===0){b.vy=-13.5;b.air=1;b.vx=b.dir*2.4;}}
    else if(b.onGround&&b.air){b.air=0;b.vx=0;shake=16;sfx.slam();const cx=b.x+b.w/2;L.shots.push({x:cx,y:12*TS-12,vx:-3.6,vy:0,life:110,flat:1},{x:cx,y:12*TS-12,vx:3.6,vy:0,life:110,flat:1});b.st=0;b.timer=90-ph*12;}
  }
  b.x+=b.vx;b.hitWall=false;
  const lo=TS,hi=(L.W-1)*TS-b.w;
  if(b.x<lo){b.x=lo;b.hitWall=b.vx<0;}
  if(b.x>hi){b.x=hi;b.hitWall=b.vx>0;}
  b.vy+=0.6;b.y+=b.vy;b.onGround=false;
  if(b.y+b.h>=12*TS){b.y=12*TS-b.h;b.vy=0;b.onGround=true;}
  if(b.dead)return;
  if(p.puffT>0&&overlap({x:p.x-30,y:p.y-30,w:p.w+60,h:p.h+50},b)){bossHurt(b,2);return;}
  if(overlap(p,b)){
    if(p.dashT>0||p.slamming)bossHurt(b,1);
    else if(p.vy>0.5&&p.py+p.h<=b.y+18){bossHurt(b,1);p.vy=-12;p.sy=1.2;p.jumps=1;}
    else if(b.inv<=0)hurt();
  }
}
function drawBoss(b){
  if(b.inv>0&&Math.floor(b.inv/4)%2)return;
  const fake={t:b.kind,x:b.x,y:b.y,w:b.w,h:b.h,dir:b.dir,tm:b.tm,charge:b.st===1&&b.tele>0};
  BS=b.sc;drawEnemy(fake);BS=1;
  const cx=b.x-cam+b.w/2,ty=b.y-4;
  ctx.beginPath();ctx.moveTo(cx-16,ty);ctx.lineTo(cx-18,ty-16);ctx.lineTo(cx-8,ty-8);ctx.lineTo(cx,ty-20);ctx.lineTo(cx+8,ty-8);ctx.lineTo(cx+18,ty-16);ctx.lineTo(cx+16,ty);ctx.closePath();fillOL(ctx,'#ffd84a',2);
  if(b.tele>0&&b.st>0){ctx.fillStyle='#ff3b3b';ctx.font='900 34px system-ui';ctx.textAlign='center';ctx.fillText('!',cx,ty-28);}
  if(b.stun>0){for(let i=0;i<3;i++){const a=b.tm*0.15+i*2.1;ctx.fillStyle='#ffe14a';ctx.font='bold 18px system-ui';ctx.textAlign='center';ctx.fillText('★',cx+Math.cos(a)*24,ty-18+Math.sin(a)*6);}}
}
function drawBossBar(){
  const b=L.boss;if(!b||b.dead)return;
  const w=320,x=VW/2-w/2,y=VH-58;
  ctx.fillStyle='rgba(15,10,40,.65)';rr(ctx,x-8,y-26,w+16,50,12);ctx.fill();
  ctx.font='900 16px system-ui';ctx.textAlign='center';ctx.fillStyle='#ffd84a';ctx.fillText('👑 '+b.name,VW/2,y-8);
  ctx.fillStyle='rgba(255,255,255,.18)';rr(ctx,x,y,w,12,6);ctx.fill();
  ctx.fillStyle='#ff4d6d';rr(ctx,x,y,Math.max(6,w*b.hp/b.maxhp),12,6);ctx.fill();
}
/* ---------- dog-themed foes (when playing Jewels) ---------- */
function drawDogFoe(en){
  const T=en.t,x=en.x-cam,y=en.y;
  if(!(T==='mouse'||T==='cucumber'||T==='hairball'||T==='laser'))return false;
  ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
  if(T==='laser'){
    const cx=x+en.w/2,cy=y+en.h/2;glow(ctx,cx,cy,40,'255,150,40',0.5);
    ctx.translate(cx,cy);ctx.rotate(Math.sin(en.tm*0.1)*0.3);ctx.scale(1,0.5);
    ctx.beginPath();ctx.arc(0,0,14,0,7);fillOL(ctx,'#ff6a3a',2);ctx.beginPath();ctx.arc(0,0,8,0,7);ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
    ctx.restore();return true;
  }
  ctx.translate(x+en.w/2,y+en.h);ctx.scale(ES*BS,ES*BS);if(en.dir<0)ctx.scale(-1,1);
  const tm=en.tm;
  if(T==='mouse'){ // squirrel
    const run=Math.sin(tm*0.4);
    gshadow(ctx,15);
    const tg=ctx.createLinearGradient(-30,-40,-10,-10);tg.addColorStop(0,'#e7a86a');tg.addColorStop(0.5,'#b5703a');tg.addColorStop(1,'#7e4a22');
    ctx.beginPath();ctx.moveTo(-10,-8);ctx.bezierCurveTo(-36,-4,-32,-40,-14,-36);ctx.bezierCurveTo(-20,-28,-12,-20,-8,-14);ctx.closePath();fillOL(ctx,tg,1.8);
    ctx.strokeStyle='#f2c894';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-14,-10);ctx.quadraticCurveTo(-27,-14,-22,-30);ctx.stroke();
    [[-4,run*2.5],[6,-run*2.5]].forEach(([dx,o])=>{ctx.beginPath();ctx.ellipse(dx+o,-2,4.2,3.2,0,0,7);fillOL(ctx,'#8a5428',1.4);});
    const bg=ctx.createRadialGradient(-4,-18,2,0,-11,14);bg.addColorStop(0,'#d99a5e');bg.addColorStop(0.6,'#b5703a');bg.addColorStop(1,'#7a4620');
    ctx.beginPath();ctx.ellipse(0,-11,12,10,0,0,7);fillOL(ctx,bg,1.8);
    gloss(ctx,-4,-16,5,2.2,0.4);
    ctx.beginPath();ctx.ellipse(3,-8,6,6,0,0,7);ctx.fillStyle='#f6e2c0';ctx.fill();
    ctx.beginPath();ctx.arc(9,-21,8,0,7);fillOL(ctx,bg,1.8);
    ctx.beginPath();ctx.moveTo(4,-26);ctx.lineTo(3,-34);ctx.lineTo(10,-28);ctx.closePath();fillOL(ctx,'#8a5428',1.4);
    eyeB(ctx,11,-23,2.7);
    ctx.fillStyle='#fff';ctx.fillRect(13,-17,3,4);ctx.strokeStyle=OL;ctx.lineWidth=0.8;ctx.strokeRect(13,-17,3,4);
    ctx.beginPath();ctx.ellipse(10,-9,3.5,2.6,0,0,7);fillOL(ctx,'#5a3416',1.2);
    ctx.fillStyle='rgba(255,110,150,.45)';ctx.beginPath();ctx.ellipse(7,-16,2,1.2,0,0,7);ctx.fill();
    ctx.strokeStyle=OL;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(8,-27);ctx.lineTo(14,-25);ctx.stroke();
  } else if(T==='cucumber'){ // skunk
    ctx.rotate(Math.sin(tm*0.12)*0.05);
    gshadow(ctx,14);
    ctx.fillStyle='rgba(150,220,80,.35)';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(-16-i*6+Math.sin(tm*0.1+i)*3,-26-((tm*0.4+i*8)%20),5+i*2,0,7);ctx.fill();}
    ctx.beginPath();ctx.moveTo(-12,-10);ctx.bezierCurveTo(-34,-14,-30,-46,-14,-40);ctx.bezierCurveTo(-18,-30,-12,-22,-8,-16);ctx.closePath();fillOL(ctx,'#2a2a36',1.8);
    ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-14,-12);ctx.quadraticCurveTo(-27,-18,-21,-38);ctx.stroke();
    [[-6,1.5],[8,-1.5]].forEach(([dx,o])=>{ctx.beginPath();ctx.ellipse(dx+o,-2,4,3,0,0,7);fillOL(ctx,'#12121a',1.4);});
    const bg=ctx.createRadialGradient(-6,-18,2,0,-12,16);bg.addColorStop(0,'#4a4a5c');bg.addColorStop(1,'#15151d');
    ctx.beginPath();ctx.ellipse(0,-12,15,10,0,0,7);fillOL(ctx,bg,1.8);
    gloss(ctx,-5,-19,6,2,0.3);
    ctx.strokeStyle='#fff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-10,-19);ctx.quadraticCurveTo(0,-22,10,-19);ctx.stroke();
    ctx.beginPath();ctx.arc(14,-14,7.5,0,7);fillOL(ctx,bg,1.8);ctx.strokeStyle='#fff';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(14,-21);ctx.lineTo(14,-9);ctx.stroke();
    eyeB(ctx,17,-16,2.6,'#2a2a2a');
    ctx.fillStyle='#ff9ab8';ctx.beginPath();ctx.arc(21,-12,1.8,0,7);ctx.fill();
  } else { // porcupine
    gshadow(ctx,13);
    ctx.save();ctx.translate(-2,-12);ctx.rotate(en.x*0.02);
    for(let k=0;k<18;k++){const a=k*0.349,r2=19+hsh(k)*4;ctx.strokeStyle=k%2?'#4a3a2a':'#9a8060';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(Math.cos(a)*9,Math.sin(a)*9);ctx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2*0.85);ctx.stroke();}
    ctx.restore();
    const bg=ctx.createRadialGradient(-6,-18,2,-2,-12,14);bg.addColorStop(0,'#9a7a58');bg.addColorStop(1,'#4e3a26');
    ctx.beginPath();ctx.ellipse(-2,-12,12,10,0,0,7);fillOL(ctx,bg,1.8);
    gloss(ctx,-5,-17,5,2,0.35);
    ctx.beginPath();ctx.ellipse(11,-9,7,5,0,0,7);fillOL(ctx,'#ecd3a6',1.6);
    ctx.fillStyle=OL;ctx.beginPath();ctx.arc(17,-9,2,0,7);ctx.fill();
    eyeB(ctx,10,-13,2.5);
    ctx.fillStyle='rgba(255,110,150,.45)';ctx.beginPath();ctx.ellipse(7,-6,2,1.2,0,0,7);ctx.fill();
    ctx.strokeStyle=OL;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(7,-17);ctx.lineTo(13,-15);ctx.stroke();
  }
  ctx.restore();return true;
}
/* ---------- overworld ---------- */
const TOUCHY=matchMedia('(hover:none) and (pointer:coarse)').matches;
const SEQ=[];
let story=false, storyIdx=0;
const OW={u:0,cam:0,face:1,walk:0,t:0};
const NX=[],NY=[];
function buildOW(){
  SEQ.length=0;NX.length=0;NY.length=0;
  WORLDS.forEach((w,wi)=>{
    w.n0=SEQ.length;
    w.lv.forEach((l,k)=>SEQ.push({lv:l,w:wi,boss:0,n:k+1}));
    SEQ.push({lv:w.boss,w:wi,boss:1,n:w.lv.length+1});
    w.n1=SEQ.length-1;
  });
  let x=170;
  SEQ.forEach((s,i)=>{
    if(i>0&&SEQ[i-1].w!==s.w)x+=120;
    NX.push(x);NY.push(262+Math.sin(i*0.95)*58+Math.cos(i*0.41)*22);x+=108;
    WORLDS[s.w].x1=x-30;
  });
  WORLDS.forEach(w=>{w.x0=NX[w.n0]-90;});
  WORLDS.forEach((w,i)=>{if(i>0)w.x0=WORLDS[i-1].x1;});
  WORLDS[0].x0=-900;
}
function owPos(u){const i=Math.max(0,Math.min(SEQ.length-1,Math.floor(u))),j=Math.min(SEQ.length-1,i+1),f=u-i;return [NX[i]+(NX[j]-NX[i])*f,NY[i]+(NY[j]-NY[i])*f];}
function openWorld(){
  state='world';story=true;
  $('menu').classList.add('hide');$('msg').classList.add('hide');
  const maxU=Math.min(SEQ.length-1,owAt());
  OW.u=Math.min(maxU,storyIdx>=0?Math.max(storyIdx,0):maxU);
  if(OW.u>maxU)OW.u=maxU;
  OW.cam=owPos(OW.u)[0]-VW/2;
}
// Cat Worlds and The River (picked on the pick sheet) play their own levels directly, continuing where you left off
function playWorld(g){const set=GROUPS[g][1];let i=+localStorage.getItem('cq_lv'+g);if(!set.includes(i))i=set[0];audioInit();OWM='story';RUNNODE=null;RUN=false;story=false;lvIdx=i;startLevel();}
function startStory(){if(grp===1||grp===2){playWorld(grp);return;}OWM='story';RUN=false;RUNNODE=null;audioInit();if(!S.story||S.story.at==null)S.story={at:0};storyIdx=Math.min(S.story.at,SEQ.length-1);
  // world chosen on the pick sheet: jump the map cursor to the furthest reachable level of that world
  if(grp>0&&typeof GROUPS!=='undefined'){const set=GROUPS[grp][1];let best=-1,first=-1;for(let i=0;i<SEQ.length;i++)if(set.includes(SEQ[i].lv)){if(first<0)first=i;if(i<=S.story.at)best=i;}
    if(best>=0)storyIdx=best;else if(first>=0)setTimeout(()=>toast('🔒 '+GROUPS[grp][0].replace(/^\S+ /,'')+' opens at level '+(first+1)+' on the map'),300);}
  openWorld();}
function enterNode(i){if(OWM==='run'){startRunNode(i);return;}RUN=false;story=true;storyIdx=i;lvIdx=SEQ[i].lv;startLevel();}
function owTick(){
  const o=OW,dir=keys.r-keys.l,maxU=Math.min(SEQ.length-1,owAt());
  o.t++;
  if(dir){o.u+=dir*0.045;o.face=dir;o.walk=1;}
  else{o.walk=0;const r=Math.round(o.u);if(Math.abs(o.u-r)<0.2)o.u+=(r-o.u)*0.2;}
  o.u=Math.max(0,Math.min(maxU,o.u));
  if(jPress){jPress=0;const r=Math.round(o.u);if(Math.abs(o.u-r)<0.25)enterNode(r);}
  aPress=0;
  const px=owPos(o.u)[0];o.cam+=(px-VW/2-o.cam)*0.12;
  o.cam=Math.max(0,o.cam);
}
function drawWorld(){
  const o=OW;
  ctx.setTransform(RK,0,0,RK,0,0);
  ctx.fillStyle='#1d1745';ctx.fillRect(0,0,VW,VH);
  WORLDS.forEach((w,wi)=>{
    const x0=w.x0-o.cam,x1=w.x1-o.cam;
    if(x1<0||x0>VW)return;
    ctx.save();ctx.beginPath();ctx.rect(x0,0,x1-x0,VH);ctx.clip();
    cam=o.cam+wi*300;
    try{drawThemeBG({cfg:worldCfg(wi)});}catch(_){}
    ctx.restore();
  });
  cam=0;
  // path
  ctx.lineCap='round';ctx.lineJoin='round';
  const stroke=(w,c)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();SEQ.forEach((s,i)=>{const X=NX[i]-o.cam,Y=NY[i];if(i===0)ctx.moveTo(X,Y);else ctx.lineTo(X,Y);});ctx.stroke();};
  stroke(22,'rgba(20,10,40,.55)');stroke(15,'#e8d2a0');
  ctx.setLineDash([2,12]);stroke(3,'#b08a50');ctx.setLineDash([]);
  const at=owAt();
  WORLDS.forEach((w,wi)=>{
    const X=NX[w.n0]-o.cam-70;if(X<-200||X>VW+200)return;
    ctx.fillStyle='rgba(20,10,40,.7)';ctx.font='900 15px system-ui';const t='WORLD '+(wi+1)+' · '+w.name;const tw=ctx.measureText(t).width+22;
    ctx.textAlign='left';rr(ctx,X,36,tw,28,10);ctx.fill();ctx.fillStyle='#ffd84a';ctx.fillText(t,X+11,56);
  });
  SEQ.forEach((s,i)=>{
    const X=NX[i]-o.cam,Y=NY[i];if(X<-40||X>VW+40)return;
    const done=i<at,open=i<=at,r=s.boss?24:17;
    if(open&&i===at){glow(ctx,X,Y,46,'255,230,120',0.5+0.25*Math.sin(o.t*0.1));}
    ctx.beginPath();ctx.arc(X,Y,r,0,7);fillOL(ctx,!open?'#6a6a80':done?'#ffd84a':s.boss?'#ff4d6d':'#7fe8a0',2.4);
    ctx.fillStyle=open?OL:'#2a2a3a';ctx.textAlign='center';ctx.font='900 '+(s.boss?20:15)+'px system-ui';
    ctx.fillText(!open?'🔒':s.boss?'👑':(done?'★':String(s.n)),X,Y+(s.boss?7:5));
  });
  // cat
  const [cx,cy]=owPos(o.u),cat=CATS[sel],k=SPR*1.15,w=cat.w*k,h=cat.h*k;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(cx-o.cam,cy+4,w*0.4,5,0,0,7);ctx.fill();
  drawCat(ctx,cat,cx-o.cam-w/2,cy-h+6,w,h,o.face,o.t,{run:o.walk});
  // HUD
  const ni=Math.max(0,Math.min(SEQ.length-1,Math.round(o.u))),s=SEQ[ni];
  const nm=s.boss?('BOSS · '+BOSS[s.w][0]):(s.n+'. '+LEVEL_NAMES[s.lv].replace(/^\d+ · /,''));
  ctx.fillStyle='rgba(15,10,40,.7)';{const pw=Math.min(420,VW-16);rr(ctx,VW/2-pw/2,VH-70,pw,52,14);ctx.fill();}
  ctx.textAlign='center';ctx.font='900 18px system-ui';ctx.fillStyle=s.boss?'#ff8fa3':'#ffd84a';ctx.fillText(nm+(ni>at?' 🔒':''),VW/2,VH-46);
  ctx.font='bold 12px system-ui';ctx.fillStyle='#fff';ctx.fillText(TOUCHY?'◀ ▶ walk the path · GO = play':'◀ ▶ walk the path · JUMP / Enter = play · Esc / Start = Paws Screen',VW/2,VH-27);
  ctx.fillStyle='rgba(15,10,40,.7)';rr(ctx,10,8,230,24,10);ctx.fill();ctx.textAlign='left';ctx.font='bold 13px system-ui';ctx.fillStyle='#fff';ctx.fillText((OWM==='run'?'🏃 RUN MAP · ':'📖 STORY MODE · ')+Math.min(at,SEQ.length)+' / '+SEQ.length+' cleared',18,25);
  drawVignette();
}

WORLDS.forEach((w,i)=>{w.boss=LEVELS.length;LEVELS.push(()=>bossLevel(i));LEVEL_NAMES.push('👑 '+BOSS[i][0]);});
const EDLIST=[];for(let i=0;i<104;i++)EDLIST.push(i);
const CL0=LEVELS.length;
for(let k=0;k<46;k++){LEVELS.push(()=>genC(k));LEVEL_NAMES.push(classicName(k));EDLIST.push(CL0+k);}
buildOW();

let bigMsg={s:'',t:0}, partT=0, edIdx=0;

function playFree(){RUN=false;story=false;startLevel();}
function drawHalf(){
  if(!L.half)return;
  const x=L.half-cam+16;if(x<-80||x>VW+80)return;
  const gy=12*TS;
  ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(x,gy+2,56,6,0,0,7);ctx.fill();
  [-46,46].forEach(dx=>{ctx.beginPath();ctx.rect(x+dx-4,gy-130,8,130);fillOL(ctx,'#8a5a2a',2);});
  const sw=Math.sin(tick*0.08)*3;
  ctx.beginPath();ctx.moveTo(x-46,gy-128);ctx.quadraticCurveTo(x,gy-100+sw,x+46,gy-128);ctx.lineTo(x+46,gy-96);ctx.quadraticCurveTo(x,gy-70+sw,x-46,gy-96);ctx.closePath();fillOL(ctx,'#ffd84a',2.4);
  ctx.fillStyle=OL;ctx.font='900 15px system-ui';ctx.textAlign='center';ctx.fillText('HALFWAY!',x,gy-104+sw);
}
function drawOverlays(){
  drawRunHUD();
  if(bigMsg.t>0){
    const t=bigMsg.t,a=Math.min(1,t/20,(170-t)/15);
    ctx.save();ctx.globalAlpha=Math.max(0,a);ctx.translate(VW/2,VH/2-30);ctx.rotate(Math.sin(tick*0.2)*0.04);
    const sc=1+Math.sin(tick*0.3)*0.04;ctx.scale(sc,sc);
    ctx.font='900 34px system-ui';ctx.textAlign='center';ctx.lineWidth=8;ctx.strokeStyle=OL;ctx.lineJoin='round';
    ctx.strokeText(bigMsg.s,0,0);
    const g=ctx.createLinearGradient(-250,0,250,0);for(let i=0;i<=6;i++)g.addColorStop(i/6,'hsl('+((i*60+tick*6)%360)+',95%,62%)');
    ctx.fillStyle=g;ctx.fillText(bigMsg.s,0,0);ctx.restore();
  }
  if(partT>0&&L){
    const t=partT,a=Math.min(1,t/20,(170-t)/20);
    ctx.save();ctx.globalAlpha=Math.max(0,a);ctx.textAlign='center';ctx.font='900 36px system-ui';ctx.lineWidth=7;ctx.strokeStyle=OL;ctx.lineJoin='round';
    ctx.strokeText('PART 2',VW/2,110);ctx.fillStyle='#8fe8ff';ctx.fillText('PART 2',VW/2,110);
    ctx.font='bold 18px system-ui';ctx.lineWidth=5;ctx.strokeText(VARNAMES[L.var],VW/2,138);ctx.fillStyle='#fff';ctx.fillText(VARNAMES[L.var],VW/2,138);ctx.restore();
  }
  if(L)drawBossBar();
}
const EMO={mouse:'🐭',dog:'🐕',roomba:'🤖',cucumber:'🥒',sprayer:'💦',rival:'😾',hairball:'🧶',bee:'🐝',crow:'🐦‍⬛',bubble:'🫧',laser:'🔴',bird:'🐦',pet:'🐾 100 pets',crit:'🐛'};
const OBL={spikes:'🔺 Spikes',crates:'📦 Crates',springs:'🌀 Springs',gaps:'🕳️ Pits'};
function edHTML(){
  const m=getMS(edIdx),nm=LEVEL_NAMES[edIdx];
  const chip=(on,attrs,l)=>'<button class="b chip'+(on?' on':'')+'" '+attrs+'>'+l+'</button>';
  const num=(k,label,d,v)=>'<tr><td>'+label+'</td><td>'+chip(0,'data-a="ednum" data-k="'+k+'" data-d="-'+d+'"','−')+' <b>'+v+'</b> '+chip(0,'data-a="ednum" data-k="'+k+'" data-d="'+d+'"','+')+'</td></tr>';
  let h='<p style="margin:0 0 6px">Editing: <b>'+esc(nm)+'</b> '+chip(0,'data-a="edmap" data-d="-1"','◀')+chip(0,'data-a="edmap" data-d="1"','▶')+' <select id="edpick" aria-label="Pick a level to edit">'+EDLIST.map(i=>'<option value="'+i+'"'+(i===edIdx?' selected':'')+'>'+esc(LEVEL_NAMES[i])+'</option>').join('')+'</select>'+((state==='play'&&edIdx===lvIdx)?' <span class="note">press Restart level to apply</span>':'')+'</p><table>';
  h+=num('den','Enemy density',10,m.den);
  h+='<tr><td>Enemies</td><td>'+ALLEN.map(k=>chip(m.en[k],'data-a="edt" data-g="en" data-k="'+k+'"',EMO[k]+' '+k)).join('')+'</td></tr>';
  h+='<tr><td>Obstacles</td><td>'+Object.keys(OBL).map(k=>chip(m.ob[k],'data-a="edt" data-g="ob" data-k="'+k+'"',OBL[k])).join('')+'</td></tr>';
  h+=num('fish','🐟 Fish %',10,m.fish)+num('nips','🌿 Catnip',1,m.nips)+num('tins','🥫 Cat food tins',1,m.tins);
  h+='</table><p class="note">Orange = on. Every 10 tins gives a heart + power-up. Saved on this device.</p><button class="b chip" data-a="edreset">Reset this map</button> <button class="b chip" data-a="edall">Copy to ALL maps</button>';
  return h;
}
function edClick(a,b){
  const cur=()=>{const m=getMS(edIdx);return {den:m.den,en:m.en,ob:m.ob,fish:m.fish,nips:m.nips,tins:m.tins};};
  if(a==='edmap'){const i=EDLIST.indexOf(edIdx);edIdx=EDLIST[(i+ +b.dataset.d+EDLIST.length)%EDLIST.length];}
  else if(a==='ednum'){const m=cur(),k=b.dataset.k,lim={den:[0,100],fish:[0,100],nips:[0,6],tins:[0,30]}[k];m[k]=Math.max(lim[0],Math.min(lim[1],m[k]+ +b.dataset.d));S.maps[edIdx]=m;}
  else if(a==='edt'){const m=cur();m[b.dataset.g][b.dataset.k]=m[b.dataset.g][b.dataset.k]?0:1;S.maps[edIdx]=m;}
  else if(a==='edreset'){delete S.maps[edIdx];}
  else if(a==='edall'){const m=cur();EDLIST.forEach(i=>{S.maps[i]=JSON.parse(JSON.stringify(m));});toast('Copied to all maps');}
  saveS();
}
/* ---------- funny intro ---------- */
let introOn=0, introT=0;
const IM_MEL=[523,0,659,0,784,0,659,0,698,0,880,0,698,0,587,0,523,0,659,0,784,1047,784,659,698,587,659,523,392,0,523,0];
function introMusic(t){
  return;   /* the intro now plays the Hard Knock Life midi (music/) */
  if(!introOn||t%11!==0)return;
  const s=(t/11)|0,i=s%32;
  const m=IM_MEL[i];
  if(m)tone(m,0.18,'square',0.035,i%8===6?-60:0);
  if(s%2===0)tone(s%4===0?131:196,0.2,'triangle',0.08);
  if(s%4===1||s%4===3)tone(1568,0.05,'square',0.012);
}
function introPress(){
  if(state!=='intro')return;
  audioInit();
  if(!introOn){watchIntro();return;}
  if(introT>45)endIntro();
}
let gateStage=0;
function introSong(){try{window.CQMidi&&CQMidi.play('hard-knock-life',45);}catch(e){}}
function watchIntro(){gateStage=2;introOn=1;introT=0;introSong();}
function endIntro(){introOn=0;gateStage=0;state='menu';showMenu();}
function startIntro(direct){state='intro';gateStage=direct===true||(direct&&direct.type)?2:0;introOn=gateStage===2?1:0;introT=0;if(introOn)introSong();$('menu').classList.add('hide');$('msg').classList.add('hide');}
function introDot(t){
  if(t<150)return [820,370,0];
  if(t<330){const a=(t-150)*0.045;return [400+Math.cos(a)*250,380+Math.sin(a*2)*30,1];}
  if(t<420){const k=(t-330)/90;return [380+k*215,390-k*20,1];}
  if(t<480){const k=(t-420)/60;return [595,370-k*220,1];}
  if(t<560){return [595+Math.sin(t*0.3)*10,150+Math.cos(t*0.25)*8,1];}
  return [170,150,0];
}
function bubble(x,y,s){
  ctx.font='bold 13px system-ui';const w=ctx.measureText(s).width+18;
  ctx.fillStyle='#fff';rr(ctx,x-w/2,y-24,w,24,10);ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.stroke();
  ctx.beginPath();ctx.moveTo(x-5,y);ctx.lineTo(x,y+8);ctx.lineTo(x+5,y);ctx.fillStyle='#fff';ctx.fill();
  ctx.fillStyle=OL;ctx.textAlign='center';ctx.fillText(s,x,y-8);
}
function introFurniture(t){
  const base=366;
  // couch
  ctx.save();ctx.lineJoin='round';
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(125,base+6,112,9,0,0,7);ctx.fill();
  ctx.fillStyle='#4a2d1e';[[28,0],[212,0]].forEach(([x])=>ctx.fillRect(x,base-8,10,14));
  rr(ctx,22,base-112,206,86,16);fillOL(ctx,'#2f7f86',2.5);                 // back
  rr(ctx,10,base-70,40,62,12);fillOL(ctx,'#276b72',2.5);                   // left arm
  rr(ctx,200,base-70,40,62,12);fillOL(ctx,'#276b72',2.5);                  // right arm
  rr(ctx,46,base-58,76,44,10);fillOL(ctx,'#3b9aa3',2.5);                   // cushions
  rr(ctx,128,base-58,76,44,10);fillOL(ctx,'#3b9aa3',2.5);
  rr(ctx,150,base-100,40,36,10);fillOL(ctx,'#e8a33a',2.2);                 // pillow
  ctx.restore();
  // dresser + 60" tv
  const dx=262,dw=156;
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(dx+dw/2,base+6,dw*0.55,8,0,0,7);ctx.fill();
  ctx.fillStyle='#3a2414';ctx.fillRect(dx+8,base-6,10,12);ctx.fillRect(dx+dw-18,base-6,10,12);
  rr(ctx,dx,base-72,dw,68,6);fillOL(ctx,'#9a6538',2.5);
  for(let i=0;i<3;i++){const yy=base-68+i*21;rr(ctx,dx+6,yy,dw-12,18,4);fillOL(ctx,'#b57a46',1.8);ctx.fillStyle='#ffd84a';ctx.beginPath();ctx.arc(dx+dw/2,yy+9,3,0,7);ctx.fill();}
  const tw=176,th=100,tx=dx+dw/2-tw/2,ty=base-72-th-8;
  ctx.fillStyle='#222';ctx.fillRect(dx+dw/2-22,base-80,44,8);                          // stand
  rr(ctx,tx,ty,tw,th,5);fillOL(ctx,'#15131c',2.5);
  const sx=tx+6,sy=ty+6,sw=tw-12,sh=th-12;
  const sg=ctx.createLinearGradient(0,sy,0,sy+sh);sg.addColorStop(0,'#2a90d8');sg.addColorStop(1,'#0a3f7a');ctx.fillStyle=sg;ctx.fillRect(sx,sy,sw,sh);
  ctx.save();ctx.beginPath();ctx.rect(sx,sy,sw,sh);ctx.clip();
  for(let i=0;i<3;i++){const fx=sx+((t*(0.6+i*0.25)+i*70)%(sw+40))-20,fy=sy+24+i*24+Math.sin(t*0.06+i)*6;
    ctx.fillStyle=['#ffa63a','#ff7a9a','#ffe14a'][i];ctx.beginPath();ctx.ellipse(fx,fy,11,6,0,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(fx-9,fy);ctx.lineTo(fx-19,fy-6);ctx.lineTo(fx-19,fy+6);ctx.fill();}
  ctx.fillStyle='rgba(255,255,255,.14)';ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+sw*0.5,sy);ctx.lineTo(sx+sw*0.2,sy+sh);ctx.lineTo(sx,sy+sh);ctx.fill();ctx.restore();
  glow(ctx,tx+tw/2,ty+th/2,130,'80,170,255',0.16);
  // christmas tree
  const cx=752,tb=base+4;
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(cx,tb+4,48,7,0,0,7);ctx.fill();
  ctx.fillStyle='#6b4a2a';ctx.fillRect(cx-7,tb-22,14,24);
  [[tb-18,48,60],[tb-62,40,56],[tb-104,32,52],[tb-142,24,46]].forEach(([y,w,h],i)=>{ctx.beginPath();ctx.moveTo(cx,y-h);ctx.lineTo(cx+w,y);ctx.lineTo(cx-w,y);ctx.closePath();fillOL(ctx,['#1f7a3a','#25883f','#2c964a','#339f52'][i],2.4);});
  const ob=[[cx-20,tb-34,'#ff4d6d'],[cx+22,tb-40,'#ffd84a'],[cx-8,tb-82,'#4aa8ff'],[cx+16,tb-92,'#ff4d6d'],[cx-14,tb-124,'#ffd84a'],[cx+8,tb-130,'#4aa8ff'],[cx,tb-62,'#ffd84a'],[cx-30,tb-58,'#c08bff']];
  ob.forEach(([x,y,c],i)=>{const on=Math.floor(t/18+i)%2;ctx.fillStyle=c;ctx.globalAlpha=on?1:0.55;ctx.beginPath();ctx.arc(x,y,4.2,0,7);ctx.fill();if(on)glow(ctx,x,y,14,'255,240,160',0.5);ctx.globalAlpha=1;});
  ctx.fillStyle='#ffd84a';ctx.beginPath();for(let i=0;i<10;i++){const r=i%2?5:11,a=-Math.PI/2+i*Math.PI/5;ctx.lineTo(cx+Math.cos(a)*r,tb-190+Math.sin(a)*r);}ctx.closePath();fillOL(ctx,'#ffd84a',1.8);
  glow(ctx,cx,tb-190,30,'255,230,120',0.55);
  // presents
  [[cx-58,tb-16,22,16,'#e63946','#ffd84a'],[cx+34,tb-14,26,14,'#3a86ff','#fff'],[cx-34,tb-12,18,12,'#2ec27e','#ff77b7']].forEach(([x,y,w,h,c,r])=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);ctx.strokeStyle=OL;ctx.lineWidth=1.8;ctx.strokeRect(x,y,w,h);ctx.fillStyle=r;ctx.fillRect(x+w/2-2,y,4,h);ctx.fillRect(x,y+h/2-2,w,4);});
}
function drawIntro(){drawIntro0();introBorder(introT);}
function introBorder(t){
  ctx.setTransform(RK,0,0,RK,0,0);const m=7;
  ctx.save();ctx.lineWidth=m;ctx.strokeStyle='rgba(30,20,40,.55)';ctx.strokeRect(m/2,m/2,VW-m,VH-m);
  const per=2*(VW+VH),n=64,gap=per/n;
  for(let i=0;i<n;i++){let d=(i*gap+t*1.6)%per,x,y;
    if(d<VW){x=d;y=m/2;}else if(d<VW+VH){x=VW-m/2;y=d-VW;}else if(d<2*VW+VH){x=VW-(d-VW-VH);y=VH-m/2;}else{x=m/2;y=VH-(d-2*VW-VH);}
    const h=(i*360/n+t*3)%360;ctx.fillStyle='hsl('+h+',95%,60%)';ctx.globalAlpha=0.55+0.45*Math.sin(t*0.12+i);ctx.beginPath();ctx.arc(x,y,3.2,0,7);ctx.fill();}
  ctx.globalAlpha=1;ctx.restore();
}
function drawIntro0(){
  const t=introT;
  ctx.setTransform(RK,0,0,RK,0,0);
  // room
  const wall=ctx.createLinearGradient(0,0,0,VH);wall.addColorStop(0,'#f4d9b8');wall.addColorStop(1,'#e8b98a');
  ctx.fillStyle=wall;ctx.fillRect(0,0,VW,VH);
  ctx.fillStyle='rgba(180,100,60,.12)';for(let x=0;x<VW;x+=40)ctx.fillRect(x,0,18,330);
  const cp=ctx.createLinearGradient(0,330,0,VH);cp.addColorStop(0,'#f1e4c6');cp.addColorStop(1,'#e6d4ae');ctx.fillStyle=cp;ctx.fillRect(0,330,VW,VH-330);
  ctx.fillStyle='rgba(0,0,0,.14)';ctx.fillRect(0,330,VW,3);
  ctx.fillStyle='rgba(150,120,70,.10)';for(let y=338;y<VH;y+=6)for(let x=((y/6)%2)*5;x<VW;x+=10)ctx.fillRect(x,y,3,2);
  ctx.fillStyle='rgba(255,255,255,.16)';for(let y=341;y<VH;y+=6)for(let x=((y/6)%2)*5+4;x<VW;x+=10)ctx.fillRect(x,y,2,2);
  // window
  const wx=470,wy=50,ww=250,wh=210;
  const revealed=t>=560;
  const sky=ctx.createLinearGradient(0,wy,0,wy+wh);sky.addColorStop(0,revealed?'#8fd6ff':'#555');sky.addColorStop(1,revealed?'#e8f8ff':'#444');
  ctx.fillStyle=sky;rr(ctx,wx,wy,ww,wh,8);ctx.fill();
  if(revealed){glow(ctx,wx+ww*0.7,wy+50,120,'255,244,190',0.9);ctx.fillStyle='#fff7b8';ctx.beginPath();ctx.arc(wx+ww*0.7,wy+50,24,0,7);ctx.fill();
    ctx.fillStyle='#fff';for(const [cx,cy] of [[wx+60,wy+60],[wx+150,wy+100]]){ctx.beginPath();ctx.arc(cx,cy,16,0,7);ctx.arc(cx+18,cy+4,12,0,7);ctx.arc(cx-16,cy+5,11,0,7);ctx.fill();}
    ctx.save();ctx.translate(wx+ww*0.3,wy+wh-8);ctx.scale(1.35,1.35);ctx.translate(-(wx+ww*0.3),-(wy+wh-8));
    {const px=wx+ww*0.3,py=wy+wh-8,bob=Math.sin(t*0.07)*1.5,sw=Math.sin(t*0.06)*6;
      ctx.strokeStyle='#6b4a2a';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(wx+6,py+3);ctx.lineTo(wx+ww-6,py-2);ctx.stroke();
      ctx.lineWidth=5;ctx.strokeStyle='#e9a0a8';ctx.beginPath();ctx.moveTo(px-26,py-20);ctx.quadraticCurveTo(px-52,py-10+sw,px-60,py-34+sw);ctx.stroke();ctx.strokeStyle=OL;ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle='#8f9096';ctx.strokeStyle=OL;ctx.lineWidth=2;
      [[-14],[16]].forEach(([dx])=>{ctx.fillRect(px+dx-3,py-12,7,12);ctx.strokeRect(px+dx-3,py-12,7,12);});
      ctx.beginPath();ctx.ellipse(px,py-24+bob,30,17,0,0,7);ctx.fill();ctx.stroke();
      ctx.fillStyle='#f4f1ea';ctx.beginPath();ctx.moveTo(px+18,py-40+bob);ctx.lineTo(px+56,py-22+bob);ctx.lineTo(px+20,py-10+bob);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#d98a9a';ctx.beginPath();ctx.arc(px+56,py-22+bob,3.2,0,7);ctx.fill();
      ctx.fillStyle='#e9a0a8';ctx.beginPath();ctx.arc(px+22,py-42+bob,6,0,7);ctx.fill();ctx.stroke();
      ctx.fillStyle='#111';ctx.beginPath();ctx.arc(px+38,py-26+bob,2.6,0,7);ctx.fill();
      ctx.strokeStyle='#ddd';ctx.lineWidth=1;for(let w=-1;w<=1;w++){ctx.beginPath();ctx.moveTo(px+48,py-21+bob);ctx.lineTo(px+64,py-23+bob+w*4);ctx.stroke();}}ctx.restore();
    ctx.fillStyle='rgba(255,240,170,'+Math.min(0.25,(t-560)/200)+')';ctx.beginPath();ctx.moveTo(wx,wy+wh);ctx.lineTo(wx+ww,wy+wh);ctx.lineTo(wx+ww+120,VH);ctx.lineTo(wx-120,VH);ctx.fill();}
  ctx.strokeStyle='#fff';ctx.lineWidth=8;rr(ctx,wx,wy,ww,wh,8);ctx.stroke();ctx.beginPath();ctx.moveTo(wx+ww/2,wy);ctx.lineTo(wx+ww/2,wy+wh);ctx.moveTo(wx,wy+wh/2);ctx.lineTo(wx+ww,wy+wh/2);ctx.stroke();
  ctx.fillStyle='#fff';rr(ctx,wx-14,wy+wh,ww+28,12,4);ctx.fill();
  const bx=wx+ww*0.3,by=wy+wh;
  introFurniture(t);
  // cats
  const floorY=410,dot=introDot(t),cats=[0,1,2,3];
  const base=[190,300,410,520];
  let ctime=t;
  cats.forEach((ci,k)=>{
    let x=base[k],y=floorY,face=1,run=0,air=0;
    if(t>=150&&t<330){x+=(dot[0]-400)*0.12*(k%2?-1:1)*0.6;face=dot[0]>x?1:-1;run=Math.abs(Math.sin(t*0.1))>0.7?1:0;}
    else if(t>=330&&t<420){const kk=(t-330)/90,tx=520+k*45;x=base[k]+(tx-base[k])*kk;face=tx>=base[k]?1:-1;run=1;}
    else if(t>=420&&t<480){x=520+k*45;face=1;}
    else if(t>=480&&t<540){x=520+k*45+(t-480)*(k===3?0.3:0.1);if(k===3||k===1){const j=(t-480)/60;y=floorY-Math.sin(Math.min(1,j)*Math.PI)*(k===3?170:90);air=-1;}face=1;}
    else if(t>=540&&t<760){x=525+k*45;}
    else if(t>=760){x=500+k*62;y=floorY-(Math.abs(Math.sin(t*0.12+k))*14);face=1;if(t>780)run=0;}
    const c=CATS[ci],w=c.w*SPR*1.15,h=c.h*SPR*1.15;
    if(t>=560&&t<740)return; // hidden under curtain
    drawCat(ctx,c,x-w/2,y-h,w,h,face,t+k*9,{run,air});
    
  });
  // laser dot
  if(dot[2]&&!(t>=420&&t<560)){glow(ctx,dot[0],dot[1],30,'255,40,40',0.7);ctx.fillStyle='#ff2d2d';ctx.beginPath();ctx.arc(dot[0],dot[1],6,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(dot[0]-1,dot[1]-1,2,0,7);ctx.fill();}
  // curtains
  const sag=t<480?0:t<540?(t-480)/60*14:14;
  const fall=t<540?0:Math.min(1,(t-540)/26);
  if(t<740){
    const drawCurt=(x0,side)=>{
      const top=wy-30+fall*fall*(floorY-wy+10),bot=top+wh+90;
      ctx.beginPath();ctx.moveTo(x0,top);ctx.lineTo(x0+side*105,top+sag*(side<0?1:0.2));ctx.lineTo(x0+side*105+side*Math.sin(t*0.1)*3*(fall>0?1:0),bot);ctx.lineTo(x0,bot);ctx.closePath();
      const g=ctx.createLinearGradient(x0,0,x0+side*105,0);g.addColorStop(0,'#c0392b');g.addColorStop(0.5,'#e05a4a');g.addColorStop(1,'#a02a20');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.stroke();
      ctx.strokeStyle='rgba(0,0,0,.2)';for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(x0+side*i*21,top+4);ctx.lineTo(x0+side*i*21,bot);ctx.stroke();}
    };
    if(t<560){drawCurt(wx+ww/2-8,-1);drawCurt(wx+ww/2+8,1);}
    ctx.fillStyle='#6a4a2a';ctx.save();ctx.translate(wx-20,wy-34);if(t>=520)ctx.rotate(Math.min(0.5,(t-520)*0.02));ctx.fillRect(0,-4,ww+40,8);ctx.restore();
  }
  if(t>=420&&t<560){glow(ctx,dot[0],dot[1],30,'255,40,40',0.7);ctx.fillStyle='#ff2d2d';ctx.beginPath();ctx.arc(dot[0],dot[1],6,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(dot[0]-1,dot[1]-1,2,0,7);ctx.fill();}
  // fallen curtain over cats
  if(t>=540&&t<740){
    const k=Math.min(1,(t-540)/26),lump=t>560?Math.sin(t*0.25):0;
    ctx.fillStyle='#d24a3a';ctx.strokeStyle=OL;ctx.lineWidth=2.5;
    ctx.beginPath();ctx.moveTo(480,floorY);
    for(let i=0;i<=4;i++){const lx=520+i*42;ctx.quadraticCurveTo(lx-14,floorY-70*k-lump*(i%2?8:-6),lx+10,floorY-52*k);}
    ctx.lineTo(710,floorY);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=2;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(510+i*42,floorY-12);ctx.lineTo(516+i*42,floorY-50*k);ctx.stroke();}
  }
  // laser dot hides on the fish bowl at the end
  if(t>=700&&t<1100){const dx=bx+30+Math.sin(t*0.1)*14,dy=by-30+Math.cos(t*0.13)*8;glow(ctx,dx,dy,22,'255,40,40',0.8);ctx.fillStyle='#ff2d2d';ctx.beginPath();ctx.arc(dx,dy,4,0,7);ctx.fill();}
  // speech
  const say2=()=>{};
  say2(100,200,base[0],floorY-120,'…is that a dot?');
  say2(215,300,base[3],floorY-110,'DOT! DOT! DOT!');
  say2(235,330,base[1],floorY-130,'It is *my* dot.');
  say2(330,420,320,floorY-110,'OOF');
  say2(430,500,190,floorY-130,'uh oh…');
  say2(560,740,220,floorY-100,'…meow?');
  say2(740,860,300,floorY-120,'Worth it.');
  // captions
  ctx.textAlign='center';ctx.font='900 20px system-ui';
  const cap=()=>{};
  cap(20,140,'Another peaceful afternoon…');
  cap(150,330,'Then: the Red Dot appeared.');
  cap(330,480,'Chaos. Absolute chaos.');
  cap(480,560,'Somebody grabbed the curtain.');
  
  if(t>=560&&t<760)cap(570,760,'Well. That was a lot of curtain.');
  // title
  if(t>=800){
    const k=Math.min(1,(t-800)/30),bounce=1+Math.sin(Math.min(1,(t-800)/30)*Math.PI)*0.25;
    ctx.save();ctx.translate(VW/2,120);ctx.scale(k*bounce,k*bounce);
    drawWavy('CAT QUEST',0,0,62,t);
    ctx.restore();
    
  }
  if(t>=860&&Math.floor(t/30)%2===0){ctx.save();ctx.font='bold 20px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.lineWidth=4;ctx.strokeStyle='rgba(30,20,40,.75)';ctx.fillStyle='#fff';const hint=(matchMedia('(pointer:coarse)').matches?'Tap':'Press any key')+' to continue';
    ctx.strokeText(hint,VW/2,190);ctx.fillText(hint,VW/2,190);ctx.restore();}
  if(t<30){ctx.fillStyle='rgba(0,0,0,'+(1-t/30)+')';ctx.fillRect(0,0,VW,VH);}
  
}
function drawIntroGate(){
  ctx.setTransform(RK,0,0,RK,0,0);
  const sc=cam;cam=tick*0.55;
  try{const gc=Object.assign({},worldCfg(11));gc.layers=(gc.layers||[]).filter(l=>l.prop!=='sign');drawThemeBG({cfg:gc});}catch(_){ctx.fillStyle='#8fd6ff';ctx.fillRect(0,0,VW,VH);}
  cam=sc;
  // riverbank ground, road and fence
  const gy=360;
  let g=ctx.createLinearGradient(0,gy,0,VH);g.addColorStop(0,'#5fb35a');g.addColorStop(0.35,'#3f8f48');g.addColorStop(1,'#2d6d3a');ctx.fillStyle=g;ctx.fillRect(0,gy,VW,VH-gy);
  ctx.fillStyle='#b9a07a';ctx.beginPath();ctx.moveTo(0,418);ctx.quadraticCurveTo(400,396,VW,414);ctx.lineTo(VW,VH);ctx.lineTo(0,VH);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=3;ctx.setLineDash([18,16]);ctx.beginPath();ctx.moveTo(0,436);ctx.quadraticCurveTo(400,420,VW,434);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#fff';for(let x=-((tick*0.55)%22);x<VW;x+=22){ctx.fillRect(x,gy-14,10,26);ctx.fillStyle='#e8e8e8';ctx.fillRect(x+7,gy-14,3,26);ctx.fillStyle='#fff';}
  ctx.fillStyle='#e6e6e6';ctx.fillRect(0,gy-4,VW,4);ctx.fillRect(0,gy+6,VW,3);
  // cats on the riverbank
  // Jewels far out in the distance: a small flying angel on a drifting cloud
  {const jc=CATS[5],k=0.36,jw=jc.w*SPR*k,jh=jc.h*SPR*k,jx=VW-165+Math.sin(tick*0.012)*30,jy=262+Math.sin(tick*0.035)*4;
   ctx.save();ctx.globalAlpha=0.85;ctx.fillStyle='rgba(255,255,255,.92)';[[-22,6,15,7],[-8,2,17,10],[9,3,17,10],[24,6,15,7],[0,8,30,6]].forEach(([dx,dy,rx,ry])=>{ctx.beginPath();ctx.ellipse(jx+dx,jy+jh*0.5+dy,rx,ry,0,0,7);ctx.fill();});
   ctx.fillStyle='rgba(170,200,235,.35)';ctx.beginPath();ctx.ellipse(jx,jy+jh*0.5+18,36,4,0,0,7);ctx.fill();
   glow(ctx,jx,jy+jh*0.3,jw*1.4,'200,225,255',0.35);
   drawCat(ctx,jc,jx-jw/2,jy-jh*0.32,jw,jh,-1,tick,{air:1});
   ctx.restore();}
  // chasing enemies (behind the cats)
  {const sv=cam;cam=0;const lst=[['dog',46,0],['rival',118,6],['roomba',176,12],['mouse',226,18]];
   lst.forEach(([t,x,o],i)=>{const sz=ESZ[t],lunge=Math.sin(tick*0.12+i*1.7)*10;drawEnemy({t,x:x-30+lunge,y:372-sz[1],w:sz[0],h:sz[1],dir:1,tm:tick*1.3+o,dead:false,st:0,vx:0,vy:0});});
   cam=sv;}
  CATS.slice(0,5).forEach((c,i)=>{const w=c.w*SPR,h=c.h*SPR;drawCat(ctx,c,VW/2+(i-2)*84+60-w/2,372-h-Math.abs(Math.sin(tick*0.16+i))*7,w,h,1,tick*1.4+i*11,{run:1});});
  // title
  drawWavy('CAT QUEST',VW/2,128,68,tick);
  ctx.textAlign='center';ctx.strokeStyle=OL;ctx.lineJoin='round';
  ctx.font='900 22px system-ui';
  if(Math.floor(tick/30)%2){ctx.lineWidth=5;ctx.strokeText('▶ Tap / press any key',VW/2,VH-22);ctx.fillStyle='#ffd84a';ctx.fillText('▶ Tap / press any key',VW/2,VH-22);}
}

/* ---------- state ---------- */
let state='menu', sel=0, lvIdx=0, L=null, P=null, cam=0, parts=[], texts=[], shake=0, tick=0, cp=null;
const keys={l:0,r:0,j:0,a:0,s:0}; let jPress=0,aPress=0;
function setKey(k,v){ if(k==='j'&&v&&!keys.j)jPress=1; if(k==='a'&&v&&!keys.a)aPress=1; keys[k]=v; }
const DEF={kb:{l:['ArrowLeft','KeyA',''],r:['ArrowRight','KeyD',''],j:['ArrowUp','Space','KeyW'],a:['ArrowDown','KeyX','KeyS']},gp:{j:0,a:2,dz:0.3},ph:{show:'auto',size:1,lh:false,op:1,vib:true},maps:{},story:{at:0}};
let S=JSON.parse(JSON.stringify(DEF));
try{const sv=JSON.parse(localStorage.getItem('catcousins_cfg')||'null');if(sv){for(const g in DEF)Object.assign(S[g],sv[g]||{});for(const g in sv)if(!(g in DEF)&&sv[g]&&typeof sv[g]==='object')S[g]=sv[g];}}catch(_){}
function saveS(){try{localStorage.setItem('catcousins_cfg',JSON.stringify(S));}catch(_){}}
let KM={};
function buildKM(){KM={};for(const a in S.kb)S.kb[a].forEach(c=>{if(c)KM[c]=a;});}
buildKM();
let paused=false, rebind=null, ptab=null;
const $=id=>document.getElementById(id);
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),1800);}
function buzz(ms){
  if(S.ph.vib){try{navigator.vibrate&&navigator.vibrate(ms);}catch(_){}}
  try{const g=navigator.getGamepads&&[...navigator.getGamepads()].find(x=>x&&x.connected);const va=g&&g.vibrationActuator;if(va&&va.playEffect)va.playEffect('dual-rumble',{duration:ms,strongMagnitude:.6,weakMagnitude:.4});}catch(_){}
}
function togglePause(force){
  paused=force!=null?force:!paused;
  for(const k in keys)keys[k]=0;
  for(const k in gpHeld)gpHeld[k]=0;
  $('pause').classList.toggle('hide',!paused);
  $('home').textContent=paused?'✕':'☰';
  padFocus=0;
  if(paused){edIdx=EDLIST.includes(lvIdx)?lvIdx:0;renderPause();} else rebind=null;
}
addEventListener('keydown',e=>{
  audioInit();
  if(rebind&&rebind.type==='kb'){
    e.preventDefault();
    if(e.code!=='Escape'){for(const a in S.kb)S.kb[a]=S.kb[a].map(c=>c===e.code?'':c);S.kb[rebind.act][rebind.slot]=e.code;buildKM();saveS();}
    rebind=null;renderPause();return;
  }
  if(e.code==='Escape'){e.preventDefault();if(!$('wm').classList.contains('hide')){closeWM();return;}if(!e.repeat)togglePause();return;}
  if(paused)return;
  if(state==='intro'){introPress();return;}
  if(e.code==='Enter'&&state==='world'){jPress=1;return;}
  if(e.code==='Enter'&&state==='menu'&&$('store').classList.contains('hide')){if($('wm').classList.contains('hide'))menuGo();return;}
  if(e.code==='ShiftLeft'||e.code==='ShiftRight'){setKey('s',1);return;}
  const k=KM[e.code]; if(k){e.preventDefault(); setKey(k,1);}
});
addEventListener('pointerdown',e=>{if(state==='intro'&&!paused&&!(e.target.closest&&(e.target.closest('#top')||e.target.closest('#gate'))))introPress();},true);
addEventListener('keyup',e=>{if(e.code==='ShiftLeft'||e.code==='ShiftRight')setKey('s',0);const k=KM[e.code]; if(k){e.preventDefault(); setKey(k,0);}});
addEventListener('blur',()=>{for(const k in keys)keys[k]=0;});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&(state==='play'||state==='temple'||state==='maze'||state==='pong'||state==='pac'||state==='tet')&&!paused)togglePause(true);});
function applyPhone(){try{window.cqApplyPhone&&cqApplyPhone();}catch(_){}}
applyPhone();
const _ap=applyPhone;
let MOB=false;
function setMob(on,gesture){MOB=true;document.body.classList.add('mob');}
$('mobbtn').onclick=()=>{audioInit();setMob(!MOB,true);};
(function(){let v=null;try{v=localStorage.getItem('cq_mob');}catch(_){}
  const touch=matchMedia('(hover:none) and (pointer:coarse)').matches;
  setMob(true,false);})();

/* ---------- gamepad ---------- */
const GPN=['A / ✕','B / ○','X / □','Y / △','LB / L1','RB / R1','LT / L2','RT / R2','Back / Share','Start / Options','L-Stick','R-Stick','D-Pad ↑','D-Pad ↓','D-Pad ←','D-Pad →','Home'];
let gpPrev=[], gpId='', gpAx=['',''], padFocus=0;
const gpHeld={l:0,r:0,j:0,a:0};
function padSet(k,v){v=v?1:0;if(gpHeld[k]!==v){gpHeld[k]=v;setKey(k,v);}}
function padItems(){
  if(paused)return [...document.querySelectorAll('#pause button')].filter(b=>b.offsetParent);
  if(!$('msg').classList.contains('hide'))return [...document.querySelectorAll('#mb button')];
  return [];
}
function padMove(d){
  const it=padItems();if(!it.length)return;
  it.forEach(b=>b.classList.remove('pf'));
  padFocus=(padFocus+d+it.length)%it.length;
  it[padFocus].classList.add('pf');
  try{it[padFocus].scrollIntoView({block:'nearest'});}catch(_){}
}
function padClick(){const it=padItems();if(it[padFocus])it[padFocus].click();}
function navPad(edge,ax,ay){
  if(!$('wm').classList.contains('hide'))return;   /* Levels & worlds screen has its own controller navigation */
  const D={L:edge(14),R:edge(15),U:edge(12),D:edge(13)};
  const sx=ax<-.5?'L':ax>.5?'R':'',sy=ay<-.5?'U':ay>.5?'D':'';
  if(sx&&sx!==gpAx[0])D[sx]=true; if(sy&&sy!==gpAx[1])D[sy]=true; gpAx=[sx,sy];
  const ok=edge(0)||edge(S.gp.j), back=edge(1);
  if(paused||!$('msg').classList.contains('hide')&&state!=='menu'){
    const it=padItems();
    if(it.length&&!document.querySelector('.pf'))padMove(0);
    if(D.L||D.U)padMove(-1); if(D.R||D.D)padMove(1);
    if(ok)padClick();
    if(back&&paused)togglePause(false);
    return;
  }
  if(state==='menu'&&$('store').classList.contains('hide')){
    if(D.L)setSel(sel-1,true); if(D.R)setSel(sel+1,true);
    if(D.U)setLv(Math.max(0,lvIdx-1),true); if(D.D)setLv(Math.min(LEVELS.length-1,lvIdx+1),true);
    if(edge(4))setLv(Math.max(0,lvIdx-10),true); if(edge(5))setLv(Math.min(LEVELS.length-1,lvIdx+10),true);
    if(edge(3))startStory();
    if(edge(2)){RUNNODE=null;startRun();}
    if(!$('runsetup').classList.contains('hide')){if(ok){RUNNODE=null;startRun();}if(back)closeSetup();return;}
    if(ok&&$('wm').classList.contains('hide'))menuGo();
  }
}
function pollPad(){
  let gp=null;
  try{const l=navigator.getGamepads?navigator.getGamepads():[];for(const g of l){if(g&&g.connected){gp=g;break;}}}catch(_){}
  if(!gp){if(gpId){gpId='';toast('🎮 Controller disconnected');if(paused)renderPause();}return;}
  if(gpId!==gp.id){gpId=gp.id;toast('🎮 Controller connected');if(paused)renderPause();}
  const pr=gp.buttons.map(b=>b.pressed), B=i=>!!pr[i], edge=i=>pr[i]&&!gpPrev[i];
  const ax=gp.axes[0]||0, ay=gp.axes[1]||0, dz=S.gp.dz;
  const live=$('gpLive');
  if(live&&paused){const p=pr.map((v,i)=>v?(GPN[i]||('#'+i)):'').filter(Boolean);live.textContent=p.length?p.join(' + '):'(press a button to test)';}
  if(rebind&&rebind.type==='gp'){
    for(let i=0;i<pr.length;i++){if(edge(i)&&i!==9){S.gp[rebind.act]=i;saveS();rebind=null;renderPause();break;}}
    gpPrev=pr;return;
  }
  if(state==='intro'&&!paused&&pr.some((v,i)=>v&&!gpPrev[i]&&i!==9))introPress();
  if(edge(9)){togglePause();gpPrev=pr;return;}
  const msgOpen=!$('msg').classList.contains('hide');
  if(paused||state==='menu'||(msgOpen&&state!=='play')){
    for(const k in gpHeld)padSet(k,0);
    navPad(edge,ax,ay);
  } else {
    padSet('l',ax<-dz||B(14)); padSet('r',ax>dz||B(15));
    padSet('j',B(S.gp.j)||B(12)); padSet('a',B(S.gp.a)||B(4)||B(5)||B(7));
  }
  gpPrev=pr;
}

/* ---------- pause menu ---------- */
function keyName(c){
  if(!c)return '+ add';
  const m={ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Space:'Space',ShiftLeft:'L-Shift',ShiftRight:'R-Shift',Enter:'Enter',Tab:'Tab'};
  if(m[c])return m[c];
  const k=c.match(/^Key(.)$/)||c.match(/^Digit(.)$/);return k?k[1]:c;
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
function renderPause(){
  if(!ptab)ptab=(matchMedia&&matchMedia('(hover:none) and (pointer:coarse)').matches)?'ph':(gpId?'pad':'kb');
  document.querySelectorAll('#ptabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===ptab));
  const inGame=(state==='play'||state==='dead'||state==='win'||state==='temple'||state==='maze'||state==='tpwin'||state==='mzwin'||state==='pong'||state==='pac'||state==='pgwin'||state==='pcwin'||state==='tet'||state==='ttwin')&&(!!L||MODE!=='plat');
  $('presume').textContent=inGame?'RESUME':'CLOSE';
  $('prestart').style.display=inGame?'':'none';
  $('pmenu').style.display=(state==='menu'||state==='intro')?'none':'';
  let h='';
  if(ptab==='kb'){
    const rows=[['l','Move left'],['r','Move right'],['j','Jump (hold = higher)'],['a','Action / slam / dash']];
    h+='<table>';
    rows.forEach(([a,n])=>{
      h+='<tr><td>'+n+'</td><td>';
      for(let i=0;i<3;i++){const on=rebind&&rebind.type==='kb'&&rebind.act===a&&rebind.slot===i;h+='<button class="b chip'+(on?' on':'')+'" data-a="kb" data-act="'+a+'" data-slot="'+i+'">'+(on?'Press a key…':keyName(S.kb[a][i]))+'</button>';}
      h+='</td></tr>';
    });
    h+='<tr><td>Pause</td><td><b>Esc</b> (fixed)</td></tr><tr><td>Start from menu</td><td><b>Enter</b></td></tr></table>';
    h+='<p class="note">Tap a key slot, then press the new key. Esc cancels. Assigning a key that is already used moves it.</p><button class="b chip" data-a="kbreset">Reset keys</button>';
  } else if(ptab==='ed'){
    h=edHTML();
  } else if(ptab==='pad'){
    h+='<p style="margin:0 0 6px">'+(gpId?'🎮 Connected: <b>'+esc(gpId.slice(0,56))+'</b>':'🎮 No controller detected. Connect or pair one, then press any button.')+'</p>';
    h+='<table>';
    [['j','Jump'],['a','Action / slam / dash']].forEach(([a,n])=>{const on=rebind&&rebind.type==='gp'&&rebind.act===a;h+='<tr><td>'+n+'</td><td><button class="b chip" data-a="gp" data-act="'+a+'">'+(on?'Press a button…':(GPN[S.gp[a]]||('Button '+S.gp[a])))+'</button></td></tr>';});
    h+='<tr><td>Move</td><td>Left stick or D-Pad</td></tr><tr><td>Pause</td><td><b>Start / Options</b> (fixed)</td></tr>';
    h+='<tr><td>Extra</td><td>D-Pad ↑ also jumps · LB / RB / RT also act</td></tr>';
    h+='<tr><td>Stick deadzone</td><td><button class="b chip" data-a="dz" data-d="-0.05">−</button> <b>'+Math.round(S.gp.dz*100)+'%</b> <button class="b chip" data-a="dz" data-d="0.05">+</button></td></tr>';
    h+='<tr><td>Menus</td><td>D-Pad / stick to move, A to pick, B to go back, LB / RB jump 10 levels</td></tr></table>';
    h+='<p class="note">Live test: <b id="gpLive">(press a button to test)</b></p><button class="b chip" data-a="gpreset">Reset controller</button> <input class="codein" type="text" inputmode="numeric" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="8" aria-label="">';
  } else {
    const o=(k,v,l)=>'<button class="b chip'+(S.ph[k]===v?' on':'')+'" data-a="ph" data-k="'+k+'" data-v="'+v+'">'+l+'</button>';
    h+='<table>';
    h+='<tr><td>Touch buttons</td><td>'+o('show','auto','Auto')+o('show','on','Always on')+o('show','off','Hidden')+'</td></tr>';
    h+='<tr><td>Button size</td><td>'+o('size',0.8,'Small')+o('size',1,'Medium')+o('size',1.25,'Large')+'</td></tr>';
    h+='<tr><td>Opacity</td><td>'+o('op',0.5,'50%')+o('op',0.75,'75%')+o('op',1,'100%')+'</td></tr>';
    h+='<tr><td>Layout</td><td>'+o('lh',false,'Move left')+o('lh',true,'Move right')+'</td></tr>';
    h+='<tr><td>Vibration</td><td>'+o('vib',true,'On')+o('vib',false,'Off')+'</td></tr></table>';
    h+='<p class="note">Open this menu any time with the ☰ icon at the top right. Landscape works best on iPhone and Android. Controls: ◀ ▶ move, JUMP (hold for higher), ACT for your cat\'s special move.</p>';
  }
  $('pbody').innerHTML=h;
  document.querySelectorAll('.pf').forEach(e=>e.classList.remove('pf'));
}
$('pbody').addEventListener('click',e=>{
  const b=e.target.closest('button[data-a]');if(!b)return;audioInit();
  const a=b.dataset.a;
  if(a==='kb')rebind={type:'kb',act:b.dataset.act,slot:+b.dataset.slot};
  else if(a==='kbreset'){S.kb=JSON.parse(JSON.stringify(DEF.kb));buildKM();saveS();}
  else if(a==='gp')rebind={type:'gp',act:b.dataset.act};
  else if(a==='dz'){S.gp.dz=Math.max(.1,Math.min(.8,+(S.gp.dz+ +b.dataset.d).toFixed(2)));saveS();}
  else if(a.startsWith('ed'))edClick(a,b);
  else if(a==='gpreset'){Object.assign(S.gp,DEF.gp);saveS();}
  else if(a==='ph'){const v=b.dataset.v;S.ph[b.dataset.k]=v==='true'?true:v==='false'?false:(isNaN(+v)?v:+v);saveS();applyPhone();}
  renderPause();
});
$('pbody').addEventListener('change',e=>{if(e.target&&e.target.id==='edpick'){edIdx=+e.target.value;renderPause();const s2=$('edpick');if(s2)s2.focus();}});
$('ptabs').addEventListener('click',e=>{const b=e.target.closest('button[data-t]');if(!b)return;ptab=b.dataset.t;rebind=null;renderPause();});
$('presume').onclick=()=>togglePause(false);
$('prestart').onclick=()=>{togglePause(false);startLevel();};
$('pmenu').onclick=()=>{togglePause(false);showMenu();};

/* ---------- helpers ---------- */
const tile=(tx,ty)=>{ if(tx<0||tx>=L.W)return '#'; if(ty<0||ty>=ROWS)return ' '; return L.g[ty][tx]; };
const solid=ch=>ch==='#'||ch==='='||ch==='b';
function burst(x,y,col,n,sp){ for(let i=0;i<n;i++){const a=Math.random()*6.28,s=(Math.random()*0.7+0.3)*(sp||3);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:30+Math.random()*20,max:50,col,sz:2+Math.random()*3});} }
function say(x,y,s,col){texts.push({x,y,s,col:col||'#fff',t:0});}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}

function collideX(e){
  const x0=Math.floor(e.x/TS),x1=Math.floor((e.x+e.w-0.01)/TS),y0=Math.floor(e.y/TS),y1=Math.floor((e.y+e.h-0.01)/TS);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){
    if(solid(tile(tx,ty))){ if(e.vx>0)e.x=tx*TS-e.w; else e.x=(tx+1)*TS; e.vx=0; return true; }
  }
  return false;
}
function collideY(e,isP){
  const x0=Math.floor(e.x/TS),x1=Math.floor((e.x+e.w-0.01)/TS),y0=Math.floor(e.y/TS),y1=Math.floor((e.y+e.h-0.01)/TS);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){
    const ch=tile(tx,ty);
    if(solid(ch)){
      if(e.vy>0){
        if(isP&&e.slamming&&ch==='b'){breakCrate(tx,ty);continue;}
        e.y=ty*TS-e.h; e.vy=0; e.onGround=true;
      } else { e.y=(ty+1)*TS; e.vy=0; if(isP&&ch==='b')breakCrate(tx,ty); }
      return;
    }
  }
}
function breakCrate(tx,ty){
  if(tile(tx,ty)!=='b')return;
  L.g[ty][tx]=' '; sfx.crate();
  burst(tx*TS+16,ty*TS+16,'#c98a3d',14,4);
  for(let i=0;i<2;i++)L.coins.push({x:tx*TS+8+i*16,y:ty*TS-6,got:false,ph:i});
}

/* ---------- game flow ---------- */
function newPlayer(cat){
  return {cat,x:0,y:0,py:0,w:cat.w,h:cat.h,vx:0,vy:0,face:1,onGround:false,coy:0,buf:0,jumps:1,inv:0,dashT:0,dashCd:0,slamming:false,hp:cat.hp,maxhp:cat.hp,sy:1,fish:0,tins:0,nipT:0,puffT:0};
}
function startLevel(){
  if(RUN){startRun();return;}
  audioInit();
  MS=getMS((lvIdx>=104&&lvIdx<CL0)?0:lvIdx); dogNow=!!CATS[sel].dog;
  L=LEVELS[lvIdx](); P=newPlayer(CATS[sel]); L.crossed=false; partT=0; bigMsg.t=0;
  cp={x:L.startX*TS,y:12*TS-P.h};
  P.x=cp.x;P.y=cp.y;P.py=P.y;
  parts=[];texts=[];cam=0;tick=0;bannerT=180;
  state='play';
  document.getElementById('menu').classList.add('hide');
  document.getElementById('msg').classList.add('hide');
}
function showMenu(){
  if(state!=='menu'&&state!=='intro'){try{window.CQMidi&&CQMidi.stop();}catch(_){}}   /* leaving a game: stop its song */
  state='menu';story=false;RUN=false;RUNNODE=null;try{setLv(lvIdx);}catch(_){}
  try{syncSel();}catch(_){}
  document.getElementById('menu').classList.remove('hide');
  document.getElementById('msg').classList.add('hide');
  if(window.cqStore)cqStore.home();
}
function showMsg(title,sub,btns){
  document.getElementById('mt').textContent=title;
  document.getElementById('ms').textContent=sub;
  const mb=document.getElementById('mb'); mb.innerHTML='';
  btns.forEach(([t,fn,cls])=>{const b=document.createElement('button');b.className='b '+(cls||'');b.textContent=t;b.onclick=fn;mb.appendChild(b);});
  document.getElementById('msg').classList.remove('hide');
}
function hurt(from){
  const p=P; if(p.inv>0||state!=='play'||p.puffT>0)return;
  p.hp--; p.inv=p.cat.sp==='tank'?170:100; p.vy=-7; p.vx=p.cat.sp==='tank'?0:-p.face*3.5; p.slamming=false; p.dashT=0;
  sfx.hurt(); shake=8; burst(p.x+p.w/2,p.y+p.h/2,'#ff4d6d',12,4); say(p.x,p.y-10,'OUCH!','#ff4d6d');buzz(60);
  if(p.hp<=0)die();
}
function die(){
  state='dead'; sfx.lose();
  setTimeout(()=>{ if(state==='dead'&&RUN){runOver();return;} if(state==='dead') showMsg('Oh no! 😿',P.cat.name+' ran out of hearts.',[['Try again',startLevel,'on'],story?['World map',openWorld]:['Menu',showMenu]]); },700);
}
function fall(){
  const p=P; p.hp--; sfx.hurt(); shake=8;
  if(p.hp<=0){ p.y=ROWS*TS+200; die(); return; }
  p.x=cp.x;p.y=cp.y;p.vx=0;p.vy=0;p.inv=120;p.slamming=false;p.dashT=0;
}
function win(){
  if(RUN&&RS&&RS.node){runNodeWin();return;}
  state='win'; sfx.win();
  const tot=L.coins.length+0, got=P.fish;
  const ratio=tot?got/tot:1, stars=ratio>=0.85?3:ratio>=0.55?2:1;
  for(let i=0;i<40;i++)burst(P.x+P.w/2,P.y,['#ffd84a','#ff77b7','#6ee7ff','#9fe870'][i%4],1,6);
  setTimeout(()=>{
    if(story){ if(storyIdx>=S.story.at){S.story.at=Math.min(SEQ.length,storyIdx+1);saveS();} const fin=storyIdx>=SEQ.length-1; showMsg(fin?'You saved the whole valley! 🏆':(SEQ[storyIdx].boss?'BOSS DEFEATED! 👑':'Level clear! 🎉'),'🐟 '+got+' / '+tot+'   🥫 '+P.tins,[['Back to the map ▶',openWorld,'on'],['Replay',startLevel]]); return; }
    const next=lvIdx<LEVELS.length-1;
    const btns=[];
    { const set=(typeof GROUPS!=='undefined'&&GROUPS[grp])?GROUPS[grp][1]:null,k=set?set.indexOf(lvIdx):-1,nx=set&&k>=0?set[k+1]:lvIdx+1;   // next level stays inside the chosen world
      if(nx!=null&&nx<LEVELS.length)btns.push(['Next level ▶',()=>{lvIdx=nx;try{localStorage.setItem('cq_lv'+grp,String(nx));}catch(_){}startLevel();},'on']); }
    btns.push(['Replay',startLevel]); btns.push(['Menu',showMenu]);
    showMsg(next?'Level clear! 🎉':'You beat the game! 🏆','🐟 '+got+' / '+tot+'   🥫 '+P.tins+'   '+'★'.repeat(stars)+'☆'.repeat(3-stars),btns);
  },900);
}
function doAction(){
  const p=P,c=p.cat;
  if(c.sp==='slam'&&!p.onGround&&!p.slamming){p.slamming=true;p.vy=13;p.vx=0;sfx.slam();}
  else if(c.sp==='dash'&&p.dashCd<=0){p.dashT=14;p.dashCd=50;sfx.dash();}
  else {sfx.meow();say(p.x-4,p.y-14,c.dog?'WOOF!':'MEOW!','#ffd84a');}
}
function slamLand(){
  const p=P; p.slamming=false; shake=12; sfx.slam();
  burst(p.x+p.w/2,p.y+p.h,'#e8e0d0',16,5);
  const cx=p.x+p.w/2;
  for(let tx=Math.floor((cx-52)/TS);tx<=Math.floor((cx+52)/TS);tx++)
    for(let ty=Math.floor(p.y/TS)-1;ty<=Math.floor((p.y+p.h+4)/TS);ty++) if(tile(tx,ty)==='b')breakCrate(tx,ty);
  L.enemies.forEach(en=>{ if(!en.dead&&Math.abs(en.x+en.w/2-cx)<95&&Math.abs(en.y-(p.y+p.h))<60)killEnemy(en); });
}
function killEnemy(en){
  if(en.t==='boss'){bossHurt(en,1);return;}
  en.dead=true; sfx.stomp(); burst(en.x+en.w/2,en.y+en.h/2,en.t==='pet'?PETSP[en.spc][1]:en.t==='mouse'?'#b9b9c4':'#8a93b5',12,4);
  if(en.t==='pet'){say(en.x-10,en.y-8,PETS[en.v].n+'!','#fff');return;}
  say(en.x,en.y-8,({dog:'YELP!',roomba:'BZZT!',cucumber:'SPLAT!',sprayer:'GLUG!',rival:'HISS!',hairball:'COUGH!',bee:'BZZ!',crow:'CAW!',bubble:'POP!',laser:'ZAP!',mouse:'SQUEAK!',bird:'COO!'})[en.t]||'POP!','#fff');
}

/* ---------- update ---------- */
function update(){
  tick++;
  if(shake>0)shake*=0.85;
  for(const q of parts){q.x+=q.vx;q.y+=q.vy;q.vy+=0.18;q.life--;} parts=parts.filter(q=>q.life>0);
  for(const t of texts){t.t++;t.y-=0.6;} texts=texts.filter(t=>t.t<50);
  if(state==='intro'){introMusic(introOn?introT:-1);if(introOn){introT++;}   /* the intro holds on the title until a tap / key / button */return;}
  if(state==='world'){owTick();return;}
  if(state==='menu'||!L)return;
  if(state==='dead'){ P.vy+=0.6; P.y+=P.vy; return; }
  if(state==='win'){ return; }

  const p=P,c=p.cat; p.py=p.y;
  const dir=RUN?1:keys.r-keys.l;
  if(p.inv>0)p.inv--; if(p.dashCd>0)p.dashCd--;
  if(aPress){aPress=0;doAction();}
  if(p.dashT>0){
    p.dashT--; p.vx=p.face*8.5; p.vy=0;
    if(tick%2===0)parts.push({x:p.x+p.w/2,y:p.y+p.h/2,vx:-p.face*1.5,vy:0,life:14,max:14,col:'#ffffff',sz:4});
  } else {
    const acc=p.onGround?0.55:0.36;
    if(dir!==0){ p.vx+=Math.max(-acc,Math.min(acc,dir*(RUN?3.2:c.speed)*RUNSPD*(p.puffT>0?1.25:1)*(keys.s&&!RUN?1.6:1)-p.vx)); p.face=dir; }
    else p.vx*=p.onGround?0.78:0.96;
    if(Math.abs(p.vx)<0.05)p.vx=0;
    if(p.slamming){p.vx=0;p.vy=13;}
    else{
      p.vy+=0.6;
      if(c.sp==='fly'){if(keys.j&&p.vy>-4.8)p.vy=Math.max(p.vy-1.25,-4.8);else if(!keys.j&&!p.onGround&&p.vy>2.4)p.vy=2.4;if(keys.a&&!p.onGround)p.vy=Math.min(p.vy+0.9,9);if(p.y<0){p.y=0;if(p.vy<0)p.vy=0;}}
      if(c.sp==='glide'&&keys.j&&p.vy>1.4&&!p.onGround)p.vy=1.4;
      if(!keys.j&&p.vy<-4)p.vy+=0.9;
      if(p.vy>14)p.vy=14;
    }
  }
  if(jPress){p.buf=7;jPress=0;}
  if(p.buf>0)p.buf--;
  if(p.onGround){p.coy=7;p.jumps=1;}else if(p.coy>0)p.coy--;
  if(p.buf>0&&!p.slamming){
    if(p.coy>0){p.vy=-c.jump;p.coy=0;p.buf=0;p.onGround=false;p.sy=1.25;sfx.jump();burst(p.x+p.w/2,p.y+p.h,'#fff',4,2);}
    else if(c.sp==='double'&&p.jumps>0){p.jumps--;p.vy=-c.jump*0.92;p.buf=0;p.sy=1.2;sfx.jump();burst(p.x+p.w/2,p.y+p.h,'#9fe9ff',8,3);}
  }
  // move
  p.x+=p.vx; if(collideX(p)&&p.dashT>0)p.dashT=0;
  p.y+=p.vy; const was=p.onGround; p.onGround=false; collideY(p,true);
  if(p.puffT>0&&!p.onGround&&p.vy>=0&&p.y+p.h>=12*TS){p.y=12*TS-p.h;p.vy=0;p.onGround=true;}
  if(p.onGround&&Math.abs(p.vx)>1.6&&tick%7===0)parts.push({x:p.x+p.w/2-p.face*p.w*0.3,y:p.y+p.h-2,vx:-p.face*0.6,vy:-0.5,life:16,max:16,col:'rgba(255,255,255,.6)',sz:4});
  if(p.onGround&&!was){ p.sy=0.8; if(p.slamming)slamLand(); else burst(p.x+p.w/2,p.y+p.h,'#e8e0d0',3,1.5); }
  p.sy+=(1-p.sy)*0.25;
  if(p.x<0)p.x=0;
  if(p.y>ROWS*TS+60){fall();return;}

  // tile interactions
  const x0=Math.floor(p.x/TS),x1=Math.floor((p.x+p.w-0.01)/TS),y0=Math.floor(p.y/TS),y1=Math.floor((p.y+p.h-0.01)/TS);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){
    const ch=tile(tx,ty);
    if(ch==='^'&&p.y+p.h>ty*TS+14)hurt();
    else if(ch==='y'&&p.vy>=0&&p.y+p.h>=ty*TS+12){p.vy=-17.5;p.sy=1.4;p.slamming=false;p.jumps=1;sfx.spring();burst(tx*TS+16,ty*TS+14,'#ff5c7a',8,3);}
    else if(ch==='C'&&(!cp||cp.tx!==tx)){cp={tx,x:tx*TS,y:12*TS-p.h};sfx.check();say(tx*TS-8,ty*TS-20,'CHECKPOINT!','#9fe870');burst(tx*TS+16,ty*TS,'#9fe870',12,3);}
  }
  // fish
  for(const co of L.coins){
    if(co.got)continue;
    if(Math.abs(p.x+p.w/2-co.x)<p.w/2+16&&Math.abs(p.y+p.h/2-co.y)<p.h/2+16){co.got=true;p.fish++;sfx.coin();burst(co.x,co.y,'#d6f2ff',9,3.5);burst(co.x,co.y,'#4aa8ff',7,2.5);burst(co.x,co.y,'#ffa63a',3,2);}
  }
  for(const t of L.tins){
    if(t.got)continue;
    if(Math.abs(p.x+p.w/2-t.x)<p.w/2+16&&Math.abs(p.y+p.h/2-t.y)<p.h/2+18){t.got=true;p.tins++;sfx.coin();burst(t.x,t.y,'#fff2a0',10,3.5);burst(t.x,t.y,'#ff6f4a',6,2.5);say(t.x-14,t.y-14,'TIN '+p.tins,'#ffd84a');if(p.tins%10===0)goPuff();}
  }
  for(const n of L.nips){
    if(n.got)continue;
    if(Math.abs(p.x+p.w/2-n.x)<p.w/2+20&&Math.abs(p.y+p.h/2-n.y)<p.h/2+20){n.got=true;p.nipT=300;bigMsg={s:'WOAH... YOU GOT CATNIP...',t:170};sfx.check();tone(660,.5,'triangle',.05,600);say(n.x-30,n.y-20,'CATNIP! ~trippy~','#c08bff');for(let i=0;i<24;i++)parts.push({x:n.x,y:n.y,vx:Math.cos(i)*5,vy:Math.sin(i)*5,life:40,max:40,col:'hsl('+(i*15)+',90%,60%)',sz:4});}
  }
  if(p.nipT>0)p.nipT--;
  if(p.puffT>0){p.puffT--;if(p.puffT===0){burst(p.x+p.w/2,p.y+p.h/2,'#ffffff',20,5);say(p.x,p.y-20,'phew…','#fff');}}
  if(bannerT>0)bannerT--;
  if(RUN)runTick();
  if(bigMsg.t>0)bigMsg.t--; if(partT>0)partT--;
  if(L.half&&!L.crossed&&p.x>L.half){L.crossed=true;partT=170;sfx.check();say(p.x-30,p.y-40,'HALFWAY!','#8fe8ff');}
  // enemies
  for(const en of L.enemies){
    if(en.dead)continue;
    en.tm++;
    const T=en.t;
    if(T==='boss'){bossTick(en,p);continue;}
    petTick(en,p);
    if(GROUNDT[T]||((T==='pet'||T==='crit')&&en.gr)){
      let sp=GSPEED[T];if(T==='crit')sp=0.65+(en.v%7)*0.13;
      if(T==='pet'){sp=0.8*PETSP[en.spc][5];if(en.role===0&&en.onGround&&en.tm%75<1)en.vy=-9;if(en.role===3){const dx=(p.x+p.w/2)-(en.x+en.w/2);if(Math.abs(dx)<220&&Math.abs(p.y-en.y)<70){en.dir=dx>0?1:-1;sp=2.3;en.charge=true;}}}
      en.charge=false;
      if(T==='crit'){if(en.role===0&&en.onGround&&en.tm%70<1)en.vy=-9;if(en.role===3){const dx=(p.x+p.w/2)-(en.x+en.w/2);if(Math.abs(dx)<220&&Math.abs(p.y-en.y)<70){en.dir=dx>0?1:-1;sp=2.2;}}}
      if(T==='rival'){const dx=(p.x+p.w/2)-(en.x+en.w/2);if(Math.abs(dx)<230&&Math.abs(p.y-en.y)<70){en.dir=dx>0?1:-1;sp=2.5;en.charge=true;}}
      if(T==='cucumber'&&en.onGround&&en.tm%80<1)en.vy=-8;
      if(T==='sprayer'){en.dir=(p.x>en.x)?1:-1;if(Math.floor(en.tm)%130===0&&Math.abs(p.x-en.x)<420){L.shots.push({x:en.x+en.w/2+en.dir*12,y:en.y+8,vx:en.dir*3.4,vy:-1.5,life:150});tone(900,.12,'sawtooth',.03,-500);}}
      en.vx=en.dir*sp;en.x+=en.vx;if(sp>0&&collideX(en))en.dir*=-1;
      if(sp>0){const fx=Math.floor((en.x+(en.dir>0?en.w+3:-3))/TS),fy=Math.floor((en.y+en.h+4)/TS);if(!solid(tile(fx,fy))&&en.onGround)en.dir*=-1;}
      en.vy+=0.6;en.y+=en.vy;en.onGround=false;collideY(en,false);
      if(en.y>ROWS*TS+50)en.dead=true;
    } else if(T==='crit'){
      if(en.role===2){en.x=en.ox+Math.sin(en.tm*0.025)*85;en.y=en.oy+Math.sin(en.tm*0.08)*22;en.dir=Math.cos(en.tm*0.025)>=0?1:-1;if(en.tm%210===0&&Math.abs(p.x-en.x)<340&&en.x>cam-20&&en.x<cam+VW){const dxx=p.x-en.x,dyy=p.y-en.y,dd=Math.hypot(dxx,dyy)||1;L.shots.push({x:en.x+en.w/2,y:en.y+en.h/2,vx:dxx/dd*2.6,vy:dyy/dd*2.6,life:140,flat:true});}}
      else{const a=en.tm*0.03;en.x=en.ox+Math.cos(a)*70;en.y=en.oy+Math.sin(a*1.3)*38;en.dir=Math.sin(a)>=0?-1:1;}
    } else if(T==='pet'){
      if(en.role===2){en.x=en.ox+Math.sin(en.tm*0.03)*80;en.y=en.oy+Math.sin(en.tm*0.09)*24;en.dir=Math.cos(en.tm*0.03)>=0?1:-1;if(en.tm%170===0&&Math.abs(p.x-en.x)<380&&en.x>cam-20&&en.x<cam+VW){const dxx=p.x-en.x,dyy=p.y-en.y,dd=Math.hypot(dxx,dyy)||1;L.shots.push({x:en.x+en.w/2,y:en.y+en.h/2,vx:dxx/dd*2.4,vy:dyy/dd*2.4,life:150,flat:1});tone(700,.12,'triangle',.04,500);}}
      else{const a=en.tm*0.03;en.x=en.ox+Math.cos(a)*70;en.y=en.oy+Math.sin(a*1.3)*38;en.dir=Math.sin(a)>=0?-1:1;}
    } else if(T==='bee'){
      en.x=en.ox+Math.sin(en.tm*0.05)*70+Math.sin(en.tm*0.23)*8;en.y=en.oy+Math.sin(en.tm*0.11)*28;en.dir=Math.cos(en.tm*0.05)>=0?1:-1;
    } else if(T==='bubble'){
      en.x=en.ox+Math.sin(en.tm*0.02)*55;en.y=en.oy+Math.sin(en.tm*0.03)*55;
    } else if(T==='laser'){
      const a=en.tm*0.07;en.x=en.ox+Math.cos(a)*90;en.y=en.oy+Math.sin(a*2)*40;
    } else if(T==='crow'){
      if(en.st===0){
        en.x=en.ox+Math.sin(en.tm*0.02)*100;en.y=en.oy+Math.sin(en.tm*0.07)*10;en.dir=Math.cos(en.tm*0.02)>=0?1:-1;
        if(Math.floor(en.tm)%150===0&&Math.abs(p.x-en.x)<200&&p.y>en.y){en.st=1;en.cd=0;en.tx=p.x;en.ty=p.y;}
      } else if(en.st===1){
        const dx=en.tx-en.x,dy=en.ty-en.y,d=Math.hypot(dx,dy)||1;en.x+=dx/d*4.5;en.y+=dy/d*4.5;en.dir=dx>=0?1:-1;
        if(d<8||++en.cd>60)en.st=2;
      } else {
        const dx=en.ox+Math.sin(en.tm*0.02)*100-en.x,dy=en.oy-en.y,d=Math.hypot(dx,dy)||1;en.x+=dx/d*3;en.y+=dy/d*3;en.dir=dx>=0?1:-1;
        if(d<8)en.st=0;
      }
    } else {
      en.x=en.ox+Math.sin(en.tm*0.02)*90;en.y=en.oy+Math.sin(en.tm*0.06)*18;en.dir=Math.cos(en.tm*0.02)>=0?1:-1;
    }
    if(en.dead)continue;
    if(p.puffT>0&&overlap({x:p.x-44,y:p.y-60,w:p.w+88,h:p.h+70},en)){killEnemy(en);continue;}
    if(overlap(p,en)){
      if(p.dashT>0||p.slamming){killEnemy(en);}
      else if(p.vy>0.5&&p.py+p.h<=en.y+10){killEnemy(en);p.vy=keys.j?-11.5:-7.5;p.sy=1.2;p.jumps=1;}
      else hurt();
    }
  }
  L.enemies=L.enemies.filter(e=>!e.dead);
  for(const sh of L.shots){
    sh.x+=sh.vx;sh.y+=sh.vy;if(!sh.flat)sh.vy+=0.08;sh.life--;
    if(!sh.flat&&solid(tile(Math.floor(sh.x/TS),Math.floor(sh.y/TS))))sh.life=0;
    if(sh.life>0&&Math.abs(sh.x-(p.x+p.w/2))<p.w/2+4&&Math.abs(sh.y-(p.y+p.h/2))<p.h/2+4){sh.life=0;burst(sh.x,sh.y,'#6ec8ff',8,3);if(!(p.dashT>0||p.slamming))hurt();}
  }
  L.shots=L.shots.filter(sh=>sh.life>0);
  // goal
  if(L.goal){ const g={x:L.goal.x-6,y:L.goal.y-30,w:TS+12,h:TS+30}; if(overlap(p,g)){win();} }
  // camera
  const tgt=RUN?Math.max(0,p.x-230):Math.max(0,Math.min(L.W*TS-VW,p.x+p.w/2-VW/2+p.face*50));
  cam+=(tgt-cam)*0.12;
}

/* ---------- render ---------- */
function render(){
  ctx.setTransform(RK,0,0,RK,0,0);
  if(state==='intro'){if(introOn)drawIntro();else drawIntroGate();return;}
  if(state==='world'){drawWorld();return;}
  if(state==='menu'&&MOB){drawMobMenuBG();return;}
  if(!L){ctx.fillStyle='#1d1745';ctx.fillRect(0,0,VW,VH);return;}
  const sh=shake>0.5?shake:0;
  ctx.save(); if(sh)ctx.translate((Math.random()-.5)*sh,(Math.random()-.5)*sh);
  drawBG();
  if(L.half){const a=Math.max(0,Math.min(1,(cam+VW/2-L.half)/260));if(a>0){ctx.fillStyle='rgba('+VARTINT[L.var]+','+(0.16*a)+')';ctx.fillRect(0,0,VW,VH);}}
  if(P&&P.nipT>0&&state!=='menu')drawTieDye(); drawTiles(); drawGoal(); drawHalf();
  for(const co of L.coins)if(!co.got)drawFish(co.x-cam,co.y,co.ph);
  for(const t of L.tins)if(!t.got)drawTin(t.x-cam,t.y,t.ph);
  for(const n of L.nips)if(!n.got)drawNip(n.x-cam,n.y,n.ph);
  for(const en of L.enemies)drawEnemy(en);
  drawShots();
  if(P&&state!=='menu'){
    const p=P; if(state==='play')drawShadow(p);
    if(!(p.inv>0&&Math.floor(p.inv/4)%2&&state==='play')){
      const air=p.onGround?0:(p.vy<0?-1:1);
      drawPlayer(p,air);
      if(p.dashT>0){ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(p.x-cam-p.face*(8+i*10),p.y+6+i*7);ctx.lineTo(p.x-cam-p.face*(28+i*10),p.y+6+i*7);ctx.stroke();}}
      if(p.slamming){ctx.fillStyle='rgba(255,255,255,.35)';ctx.fillRect(p.x-cam+4,p.y-40,p.w-8,40);}
    }
  }
  for(const q of parts){ctx.globalAlpha=Math.max(0,q.life/q.max);ctx.fillStyle=q.col;ctx.fillRect(q.x-cam-q.sz/2,q.y-q.sz/2,q.sz,q.sz);} ctx.globalAlpha=1;
  ctx.font='bold 14px system-ui'; ctx.textAlign='center';
  for(const t of texts){ctx.globalAlpha=1-t.t/50;ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.6)';ctx.strokeText(t.s,t.x-cam+10,t.y);ctx.fillStyle=t.col;ctx.fillText(t.s,t.x-cam+10,t.y);} ctx.globalAlpha=1;
  ctx.restore();
  drawVignette();
  if(P&&state!=='menu')drawHUD();
  drawOverlays();
}

/* ---------- menu ---------- */
const cards=document.getElementById('cards');
CATS.forEach((c,i)=>{
  const d=document.createElement('div'); d.className='card'+(i===sel?' on':'');
  const cc=document.createElement('canvas'); cc.width=96; cc.height=76; d.appendChild(cc);
  d.insertAdjacentHTML('beforeend','<b>'+c.name+'</b><small>'+c.desc+'</small>');
  d.onclick=()=>{setSel(i);};
  cards.appendChild(d); c.cv=cc;
});
function setSel(i){sel=(i+CATS.length)%CATS.length;audioInit();sfx.meow();syncSel();}
const lvls=document.getElementById('lvls'), lgroups=document.getElementById('lgroups');
const rg=(a,b)=>{const r=[];for(let i=a;i<=b;i++)r.push(i);return r;};
const GROUPS=[['🏠 Classic',rg(0,3).concat(rg(CL0,CL0+45))],['🐱 Cat Worlds',rg(4,53)],['🌊 The River',rg(54,103)],['👑 Bosses',rg(104,CL0-1)]];
let grp=0;
GROUPS.forEach((G,g)=>{const b=document.createElement('button');b.className='b'+(g===0?' on':'');b.textContent=G[0];b.onclick=()=>setGroup(g);lgroups.appendChild(b);});
function setGroup(g){grp=g;[...lgroups.children].forEach((e,j)=>e.classList.toggle('on',j===g));[...lvls.children].forEach((e,i)=>{e.style.display=GROUPS[g][1].includes(i)?'':'none';});}
function setLv(i,pad){
  lvIdx=i;const g=GROUPS.findIndex(G=>G[1].includes(i));if(g>=0&&g!==grp)setGroup(g);
  [...lvls.children].forEach((e,j)=>e.classList.toggle('on',j===i));
  if(pad){const el=lvls.children[i];if(el)lvls.scrollTop=el.offsetTop-lvls.offsetTop-lvls.clientHeight/2;}
}
LEVELS.forEach((f,i)=>{
  const b=document.createElement('button'); b.className='b'+(i===lvIdx?' on':''); b.textContent=LEVEL_NAMES[i];
  b.onclick=()=>setLv(i);
  lvls.appendChild(b);
});
setGroup(0);
document.getElementById('play').onclick=playFree;
document.getElementById('story').onclick=startStory;
document.getElementById('run').onclick=startRun;
document.getElementById('intro').onclick=()=>startIntro();
document.getElementById('home').onclick=()=>togglePause();
const swT=document.createElement('div');swT.id='swtoast';document.getElementById('top').parentNode.appendChild(swT);let swTm=0;
function switchChar(){
  if(state!=='play'||!P)return;
  const o=P;sel=(sel+1)%CATS.length;audioInit();
  const n=newPlayer(CATS[sel]);
  n.x=o.x+o.w/2-n.w/2;n.y=o.y+o.h-n.h;n.py=n.y;n.vx=o.vx;n.vy=o.vy;n.face=o.face;n.onGround=o.onGround;n.inv=Math.max(o.inv,40);
  n.hp=Math.max(1,Math.round(n.maxhp*o.hp/o.maxhp));n.fish=o.fish;n.tins=o.tins;n.nipT=o.nipT;
  P=n;dogNow=!!CATS[sel].dog;try{sfx.meow();}catch(_){}
  swT.textContent='🐱 '+(CATS[sel].name||'Cat '+(sel+1));swT.style.opacity=1;clearTimeout(swTm);swTm=setTimeout(()=>swT.style.opacity=0,1400);
}
const swB=document.createElement('button');swB.id='swc';swB.title='Switch character';
const swC=document.createElement('canvas');swC.width=swC.height=124;swB.appendChild(swC);const swI=document.createElement('i');swI.textContent='⇄';swB.appendChild(swI);
document.getElementById('top').parentNode.appendChild(swB);let swLast=-1;
function swPaint(){if(swLast===sel)return;swLast=sel;const g=swC.getContext('2d'),c=CATS[sel];g.clearRect(0,0,124,124);
  const sc=84/Math.max(c.w,c.h)/SPR/1.0,w=c.w*SPR*sc,h=c.h*SPR*sc;try{drawCat(g,c,62-w/2,66-h/2,w,h,1,0,{});}catch(_){}}
swB.onclick=e=>{switchChar();swPaint();swB.blur();};
setInterval(()=>{document.body.classList.toggle('inmenu',!((state==='play'||state==='dead'||state==='win'||state==='temple'||state==='maze'||state==='tpwin'||state==='mzwin'||state==='pong'||state==='pac'||state==='pgwin'||state==='pcwin'||state==='tet'||state==='ttwin')&&!paused&&$('menu').classList.contains('hide')));document.body.classList.toggle('inworld',state==='world');swPaint();swB.style.display=((state==='play'||state==='dead'||state==='win')&&!!P)?'block':'none';},200);
document.getElementById('mute').onclick=e=>{audioInit();muted=!muted;e.target.textContent=muted?'🔇':'🔊';try{CQMidi.mute(muted);}catch(x){}};
try{if(window.CQMidi&&CQMidi.muted()){muted=true;document.getElementById('mute').textContent='🔇';}}catch(e){}
function drawCards(){
  drawRunIcon();
  const K=Math.min(3,Math.ceil((window.devicePixelRatio||2)*1.2));
  CATS.forEach((c,i)=>{
    if(c.cv.width!==96*K){c.cv.width=96*K;c.cv.height=76*K;}
    const g=c.cv.getContext('2d'); g.setTransform(K,0,0,K,0,0); g.clearRect(0,0,96,76);
    const k=1.9, w=c.w*k, h=c.h*k;
    drawCat(g,c,(96-w)/2-2,76-h-4,w,h,1,tick+i*20,{run:MOB&&i===sel?1:0});
  });
}
/* mobile start screen: scenic backdrop behind the menu panels */
const MMB={};
function mobGround(pal){
  const y=380,gr=ctx.createLinearGradient(0,y,0,VH);gr.addColorStop(0,pal.a);gr.addColorStop(1,pal.b);
  ctx.fillStyle=gr;ctx.fillRect(0,y,VW,VH-y);
  ctx.fillStyle=pal.top;ctx.fillRect(0,y,VW,9);ctx.fillStyle='rgba(255,255,255,.32)';ctx.fillRect(0,y,VW,2);
  ctx.fillStyle='rgba(0,0,0,.16)';for(let x=-(cam%52);x<VW;x+=52)ctx.fillRect(x,y+22,28,4);
}
function drawMobMenuBG(){
  ctx.setTransform(RK,0,0,RK,0,0);
  const sc=cam,sL=L;cam=tick*0.6;
  try{
    if(grp===1||grp===2){
      const cfg=MMB[grp]||(MMB[grp]=grp===1?makeCfg(THEME50[11],11):worldCfg(11));
      drawThemeBG({cfg});mobGround(cfg.pal);
    }else{
      L={theme:THEMES[1]};drawBG();mobGround({a:'#b4605a',b:'#7e3c3d',top:'#d7c3b0'});
    }
  }catch(_){ctx.fillStyle='#1d1745';ctx.fillRect(0,0,VW,VH);}
  L=sL;cam=sc;
  drawVignette();
}
function updateDetail(){
  const md=document.getElementById('mdetail');if(!md)return;
  const c=CATS[sel],p=c.desc.split('. ');
  const sp=Math.max(1,Math.min(5,Math.round(1+(c.speed-2.7)/1.4*4))),jp=Math.max(1,Math.min(5,Math.round(1+(c.jump-12.3)/1.6*4)));
  const seg=n=>'<span class="sg">'+[1,2,3,4,5].map(i=>'<span class="sq'+(i<=n?' f':'')+'"></span>').join('')+'</span>';
  md.innerHTML='<div class="dn"><b>'+c.name+'</b><span>'+p[0]+'</span></div><div class="da">'+p.slice(1).join('. ')+'</div><div class="db"><span>SPEED</span>'+seg(sp)+'<span>JUMP</span>'+seg(jp)+'</div>';
}
function syncSel(){try{localStorage.setItem('cq_sel',String(sel));}catch(_){}try{[...cards.children].forEach((e,j)=>e.classList.toggle('on',j===sel));updateDetail();}catch(_){}}
syncSel();

/* ---------- loop ---------- */
const FE={};let last=performance.now(),acc=0;
function frame(now){
  acc+=Math.min(50,now-last); last=now;
  pollPad();
  if(paused)acc=0;
  let steps=0;while(acc>=1000/60&&steps<4){update();acc-=1000/60;steps++;}if(steps>=4)acc=0;
  document.body.classList.toggle('mmenu',state==='menu'&&MOB);
  const _st=FE.store||(FE.store=$('store')),_mn=FE.menu||(FE.menu=$('menu'));
  const cover=state==='menu'&&(!_st.classList.contains('hide')||!_mn.classList.contains('hide'));
  if(state==='menu'&&!_mn.classList.contains('hide')&&((window._fc=(window._fc||0)+1)&1)===0)drawCards();
  if(!cover)render();
  requestAnimationFrame(frame);
}
/* ---------- turn 7: secret unlock, world menu, hover thumbnails ---------- */
let UNL=false;try{localStorage.removeItem('catcousins_unlock');UNL=sessionStorage.getItem('cq_unl')==='1';}catch(_){}
function applyLock(){try{if(UNL)sessionStorage.setItem('cq_unl','1');else sessionStorage.removeItem('cq_unl');}catch(_){}document.body.classList.toggle('locked',!UNL);if(!UNL&&ptab==='ed')ptab='kb';if(!UNL){if(grp===3)setGroup(0);try{if(RC.cat===3)RC.cat=0;}catch(_){}}if(typeof lgroups!=='undefined'&&lgroups.children[3])lgroups.children[3].classList.add('gated');}
function menuGo(){UNL?playFree():startStory();}
const THC={};
function thumbCanvas(i){
  if(THC[i])return THC[i];
  const sv=[MS,dogNow,ARENA,SEEDX,BS];let Lv=null;
  try{MS=getMS((i>=104&&i<CL0)?0:i);dogNow=false;Lv=LEVELS[i]();}catch(_){}
  MS=sv[0];dogNow=sv[1];ARENA=sv[2];SEEDX=sv[3];BS=sv[4];
  const c=document.createElement('canvas');c.width=300;c.height=84;const g=c.getContext('2d');
  const th=Lv&&Lv.theme,cfg=th&&th.cfg,sk=(cfg?cfg.sky:th&&th.sky)||['#6ccaff','#e3f7ff'];
  const gr=g.createLinearGradient(0,0,0,84);gr.addColorStop(0,sk[0]);gr.addColorStop(1,sk[sk.length-1]);g.fillStyle=gr;g.fillRect(0,0,300,84);
  if(Lv){
    const sx=300/Lv.W,sy=84/ROWS,gt=cfg?cfg.pal.top:(th.top||'#5fcf5d'),gf=cfg?cfg.pal.b:(th.fill||'#6e4423'),pl=cfg?cfg.plat:(th.plank||'#d8a860');
    const sol=(x,y)=>y>=0&&Lv.g[y]&&'#=b'.includes(Lv.g[y][x]||' ')&&(Lv.g[y][x]||' ')!==' ';
    const w=Math.max(1,sx+0.6);
    for(let y=0;y<ROWS;y++)for(let x=0;x<Lv.W;x++){
      const ch=Lv.g[y][x];if(ch===' ')continue;
      const X=x*sx,Y=y*sy;
      if(ch==='#'){g.fillStyle=(y>0&&Lv.g[y-1][x]==='#')?gf:gt;g.fillRect(X,Y,w,sy+0.5);}
      else if(ch==='='){g.fillStyle=pl;g.fillRect(X,Y+1,w,sy-2);}
      else if(ch==='b'){g.fillStyle='#e0a030';g.fillRect(X,Y,w,sy);}
      else if(ch==='^'){g.fillStyle='#ff4d6d';g.fillRect(X,Y+sy*0.4,w,sy*0.6);}
      else if(ch==='y'){g.fillStyle='#3fd0ff';g.fillRect(X,Y+sy*0.4,w,sy*0.6);}
      else if(ch==='C'){g.fillStyle='#ffe14a';g.fillRect(X,Y-2,Math.max(2,w),sy+2);}
    }
    g.fillStyle='#ffd84a';(Lv.coins||[]).forEach(o=>g.fillRect(o.x/TS*sx,o.y/TS*sy,1.6,1.6));
    g.fillStyle='#d22';(Lv.enemies||[]).forEach(e=>{g.beginPath();g.arc(e.x/TS*sx,e.y/TS*sy+2,2.2,0,7);g.fill();});
    if(Lv.goal){g.fillStyle='#2ecc71';g.fillRect(Lv.goal.x/TS*sx,5*sy,3,7*sy);}
  }
  g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=2;g.strokeRect(0,0,300,84);
  return THC[i]=c;
}
function showThumb(i,x,y){
  const t=$('thumb'),c=thumbCanvas(i);
  t.firstElementChild.getContext('2d').drawImage(c,0,0);
  $('thumbn').textContent=LEVEL_NAMES[i];
  t.style.display='block';
  const w=t.offsetWidth,h=t.offsetHeight;
  t.style.left=Math.max(4,Math.min(innerWidth-w-4,x-w/2))+'px';
  t.style.top=(y-h-18<4?y+22:y-h-18)+'px';
}
function hideThumb(){$('thumb').style.display='none';}
cv.addEventListener('mousemove',e=>{
  if(state!=='world'||paused||OWM==='run'){hideThumb();return;}
  const r=cv.getBoundingClientRect(),px=(e.clientX-r.left)*VW/r.width,py=(e.clientY-r.top)*VH/r.height;
  let hit=-1;
  for(let i=0;i<SEQ.length;i++){const X=NX[i]-OW.cam,Y=NY[i];if(Math.abs(X-px)<26&&Math.abs(Y-py)<26&&Math.hypot(X-px,Y-py)<(SEQ[i].boss?27:20)){hit=i;break;}}
  if(hit<0)hideThumb();else showThumb(SEQ[hit].lv,e.clientX,e.clientY);
});
cv.addEventListener('mouseleave',hideThumb);
function hoverThumb(el,i){el.addEventListener('mouseenter',e=>showThumb(i,e.clientX,e.clientY));el.addEventListener('mousemove',e=>showThumb(i,e.clientX,e.clientY));el.addEventListener('mouseleave',hideThumb);}
[...lvls.children].forEach((b,i)=>hoverThumb(b,i));
/* world menu */
let wmTab='story';
const lvShort=i=>LEVEL_NAMES[i].replace(/^\d+ · /,'');
let wmCat=-1;   /* -1 = all worlds; 0 Classic, 1 Cat Worlds, 2 The River, 3 Bosses (opens on the world picked on the pick sheet) */
function wmCats(){
  let c=$('wmcats');
  if(!c){c=document.createElement('div');c.id='wmcats';$('wmtabs').after(c);
    c.addEventListener('click',e=>{const x=e.target.closest('button[data-c]');if(!x)return;wmCat=+x.dataset.c;wmBuild();});}
  c.innerHTML=GROUPS.map((G,g)=>'<button class="b'+(wmCat===g?' on':'')+'" data-c="'+g+'">'+G[0]+'</button>').join('')+'<button class="b'+(wmCat<0?' on':'')+'" data-c="-1">🌍 All</button>';
  $('wmtabs').style.display=wmCat<0?'':'none';
}
function wmPlayDirect(g,lv){   /* Cat Worlds / The River / Classic Bonus: play that level straight away */
  closeWM();try{document.getElementById('store').classList.add('hide');}catch(_){}
  try{localStorage.setItem('cq_lv'+g,String(lv));}catch(_){}
  audioInit();OWM='story';RUNNODE=null;RUN=false;story=false;lvIdx=lv;startLevel();
}
function wmBuildCat(){
  const b=$('wmbody');b.innerHTML='';
  const sec=(title,items)=>{const d=document.createElement('div');d.className='wsec';const h=document.createElement('h3');h.textContent=title;d.appendChild(h);
    const r=document.createElement('div');r.className='wrow';
    items.forEach(([i,label,boss,fn,lk])=>{const x=document.createElement('button');x.className='b'+(boss?' boss':'')+(lk?' lk':'');x.textContent=label;hoverThumb(x,i);x.onclick=()=>{if(lk){toast('🔒 Reach this level on the map first');return;}fn();};r.appendChild(x);});
    d.appendChild(r);b.appendChild(d);};
  const story=i=>()=>{wmTab='story';wmPick(i);};
  const bossItem=(wi)=>[WORLDS[wi].boss,'👑 '+BOSS[wi][0],1,story(WORLDS[wi].boss),!wmReach(WORLDS[wi].boss)];
  if(wmCat===0){
    sec('WORLD 1 · '+WORLDS[0].name,WORLDS[0].lv.map((l,k)=>[l,(k+1)+'. '+lvShort(l),0,story(l),!wmReach(l)]).concat([bossItem(0)]));
    sec('🏠 Classic Bonus',rg(CL0,CL0+45).map(i=>[i,LEVEL_NAMES[i],0,()=>wmPlayDirect(0,i)]));
  }else if(wmCat===1||wmCat===2){
    const w0=wmCat===1?1:11,ic=wmCat===1?'🐱':'🌊';
    for(let wi=w0;wi<w0+10;wi++)sec(ic+' MAP '+(wi-w0+1)+' · '+WORLDS[wi].name,WORLDS[wi].lv.map((l,k)=>[l,(k+1)+'. '+lvShort(l),0,()=>wmPlayDirect(wmCat,l)]).concat([bossItem(wi)]));
  }else{
    sec('👑 Bosses',WORLDS.map((w,wi)=>bossItem(wi)));
  }
  b.scrollTop=0;
}
function wmBuild(){
  wmCats();
  if(wmCat>=0){wmBuildCat();return;}
  const b=$('wmbody');b.innerHTML='';
  document.querySelectorAll('#wmtabs button').forEach(x=>x.classList.toggle('on',x.dataset.t===wmTab));
  const sec=(title,items,sub)=>{
    const d=document.createElement('div');d.className='wsec';
    const h=document.createElement('h3');h.textContent=title;d.appendChild(h);
    const r=document.createElement('div');r.className='wrow';
    items.forEach(([i,label,boss])=>{const x=document.createElement('button');x.className='b'+(boss?' boss':'');x.textContent=label;hoverThumb(x,i);x.onclick=()=>wmPick(i);if(wmTab==='story'&&!wmReach(i))x.classList.add('lk');r.appendChild(x);});
    d.appendChild(r);b.appendChild(d);
  };
  if(wmTab==='story'){
    WORLDS.forEach((w,wi)=>sec('WORLD '+(wi+1)+' · '+w.name,w.lv.map((l,k)=>[l,(k+1)+'. '+lvShort(l)]).concat([[w.boss,'👑 '+BOSS[wi][0],1]])));
  }else{
    sec('🏠 Classic',rg(0,3).map(i=>[i,lvShort(i)]));
    sec('🏠 Classic Bonus',rg(CL0,CL0+45).map(i=>[i,LEVEL_NAMES[i]]));
    for(let wi=1;wi<=10;wi++)sec('🐱 '+WORLDS[wi].name,WORLDS[wi].lv.map(l=>[l,lvShort(l)]));
    for(let wi=11;wi<=20;wi++)sec('🌊 '+WORLDS[wi].name,WORLDS[wi].lv.map(l=>[l,lvShort(l)]));
    sec('👑 Bosses',WORLDS.map((w,wi)=>[w.boss,BOSS[wi][0],1]));
  }
  b.scrollTop=0;
}
function wmSeq(lv){for(let k=0;k<SEQ.length;k++)if(SEQ[k].lv===lv)return k;return -1;}
function wmReach(lv){if(UNL)return true;const k=wmSeq(lv);return k>=0&&k<=((S.story&&S.story.at)||0);}
function wmPick(lv){
  if(wmTab==='free'){setLv(lv);closeWM();return;}
  const k=wmSeq(lv);if(k<0){setLv(lv);closeWM();return;}
  if(!wmReach(lv)){toast('🔒 Reach this level on the map first');return;}
  closeWM();audioInit();OWM='story';RUN=false;RUNNODE=null;if(!S.story||S.story.at==null)S.story={at:0};
  if(window.cqStore){try{document.getElementById('store').classList.add('hide');}catch(_){}}
  enterNode(k);
}
function openWM(){wmTab=state==='world'?'story':wmTab;wmCat=state==='world'?-1:(typeof grp==='number'?grp:-1);$('wm').classList.remove('hide');wmBuild();setTimeout(()=>{const f=document.querySelector('#wmbody button:not(.lk)')||document.querySelector('#wmbody button');if(f)f.focus({preventScroll:true});},30);}
function closeWM(){$('wm').classList.add('hide');hideThumb();}
$('wmbtn').onclick=openWM;$('wmclose').onclick=closeWM;
document.querySelectorAll('#wmtabs button').forEach(x=>x.onclick=()=>{wmTab=x.dataset.t;wmBuild();});
applyLock();

/* ---------- turn 8: pets, roster, barking, runner, title ---------- */
ESZ.pet=[28,24];
const PETSP=[
 ['Hamster','#e8b574','#fff1d8','round',1,1.0],['Bunny','#f4efef','#ffffff','long',1,1.0],['Chick','#ffe45c','#fff7b0','tuft',.9,1.1,'beak'],['Frog','#6fcf6a','#d9f7b4','none',1.05,1.0,'frog'],
 ['Turtle','#7bbf6a','#e3cf93','none',1.1,0.5,'shell'],['Pug','#d8b48a','#f2e0c8','flop',1,1.0,'snout',1],['Corgi','#e8964a','#ffffff','point',1.05,1.1,'snout',1],['Kitten','#aab0bf','#ffffff','cat',.95,1.2],
 ['Siamese','#f3e6d0','#fff6e8','cat',1,1.1,'dark'],['Persian','#fbfbfb','#ffffff','cat',1.1,0.8],['Ferret','#b79a7a','#f3e8d8','round',1.2,1.3],['Guinea Pig','#c98a4a','#fff3e0','round',1,0.9],
 ['Parrot','#ff4d5a','#ffd84a','tuft',.95,1.0,'beak'],['Duckling','#fff06a','#fffad0','none',1,0.9,'bill'],['Piglet','#ffb3c6','#ffd6e2','point',1,0.9,'pig'],['Lamb','#fdfdfd','#efefef','round',1.05,0.9,'wool'],
 ['Hedgehog','#8b6a4a','#f1dcc0','round',.95,0.7,'spikes'],['Gecko','#7fdc8c','#eaffc8','none',1.1,1.2,'longtail'],['Pony','#c58b4e','#e6c9a0','point',1.15,1.1,'mane'],['Goldfish','#ff9a3a','#ffd9a8','fin',1,1.0,'fish']
];
const ROLES=['Ninja','Pirate','Wizard','Chef','Astro'];
const PETS=[];for(let r=0;r<5;r++)for(let s=0;s<20;s++)PETS.push({n:ROLES[r]+' '+PETSP[s][0],role:r,spc:s});
function makeRoster(seed){
  const r=n=>hsh(seed*1.37+n*7.9);
  const gOr=['mouse','dog','hairball','cucumber','rival','roomba','sprayer'],fOr=['bee','crow','bird','laser','bubble'];
  const pick=(arr,k,o0)=>{const a=arr.slice(),o=[];for(let i=0;i<k;i++)o.push(a.splice(Math.floor(r(i+o0)*a.length),1)[0]);return o;};
  const g=pick(gOr,3,0).map(t=>({t})),f=pick(fOr,2,9).map(t=>({t}));
  [0,1,3].forEach((role,i)=>g.push({t:'pet',v:role*20+Math.floor(r(20+i)*20)}));
  [2,4].forEach((role,i)=>f.push({t:'pet',v:role*20+Math.floor(r(30+i)*20)}));
  for(let n=0;n<3;n++)g.push({t:'crit',v:critSpawnV(r,true,41+n*3)});
  for(let n=0;n<2;n++)f.push({t:'crit',v:critSpawnV(r,false,61+n*3)});
  return {g,f};
}
function mkEnemy(pk,x,y){
  let t=pk.t;const v=pk.v;if(dogNow&&t==='dog')t='rival';
  const isP=t==='pet',isC=t==='crit',role=isP?Math.floor(v/20):isC?v%5:0,gr=(isP||isC)?(role===0||role===1||role===3):!!GROUNDT[t],sz=isC?critSz(v):ESZ[t];
  const e={t,x:x*TS,w:sz[0],h:sz[1],dir:-1,dead:false,tm:Math.random()*100,vx:0,vy:0,st:0};
  if(isP||isC){e.v=v;e.role=role;e.spc=v%20;e.gr=gr;}
  if(gr){e.y=(y||12)*TS-sz[1];}else{e.y=y*TS;e.ox=e.x;e.oy=e.y;}
  return e;
}
function bark(en){
  const big=en.t==='dog'?1:1.25;
  tone(200*big,.09,'sawtooth',.07,-70);setTimeout(()=>tone(150*big,.14,'sawtooth',.07,-60),120);
  say(en.x-6,en.y-18,'WOOF!','#ffd84a');en.barkT=14;
}
function petTick(en,p){
  const T=en.t;
  if(T==='dog'||(T==='pet'&&PETSP[en.spc][7])){
    if(en.bk>0)en.bk--;
    else if(Math.abs(p.x-en.x)<300&&Math.abs(p.y-en.y)<150&&en.x>cam-30&&en.x<cam+VW+30){bark(en);en.bk=170+Math.floor(Math.random()*90);}
    if(en.barkT>0)en.barkT--;
  }
}
function drawPet(en){
  const D=PETSP[en.spc],R=en.role,col=D[1],bel=D[2],ear=D[3],wm=D[4],fx=D[6]||'';
  const x=en.x-cam,y=en.y,tm=en.tm,fly=!en.gr,run=Math.sin(tm*0.35);
  ctx.save();ctx.translate(x+en.w/2,y+en.h);const k=ES*0.82;ctx.scale(k,k);if(en.dir<0)ctx.scale(-1,1);
  ctx.lineJoin='round';ctx.lineCap='round';
  if(fly)ctx.translate(0,Math.sin(tm*0.15)*2-5);
  if(fly){const fl=Math.sin(tm*0.5);ctx.beginPath();ctx.ellipse(-3,-17-fl*3,9,3.5+Math.abs(fl)*2,-0.6,0,7);fillOL(ctx,'rgba(255,255,255,.9)',1.4);}
  // back details
  if(fx==='spikes'){ctx.fillStyle='#4a3524';for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(-14+i*4,-14-Math.abs(i-2.5)*0.4);ctx.lineTo(-12+i*4,-23+Math.abs(i-2.5));ctx.lineTo(-9+i*4,-14);ctx.fill();}}
  if(fx==='wool'){ctx.fillStyle='#fff';for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(-11+i*4,-17-Math.sin(i)*1.5,4.2,0,7);fillOL(ctx,'#fff',1.2);}}
  ctx.strokeStyle=OL;ctx.lineWidth=5;
  if(fx==='longtail'||ear==='cat'||fx==='dark'){ctx.beginPath();ctx.moveTo(-12,-10);ctx.quadraticCurveTo(-24,-12,-20,-24+Math.sin(tm*0.2)*3);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=2.6;ctx.stroke();}
  else if(fx==='fish'){ctx.beginPath();ctx.moveTo(-11,-10);ctx.lineTo(-20,-17);ctx.lineTo(-20,-3);ctx.closePath();fillOL(ctx,'#ff7a1a',1.6);}
  else{ctx.beginPath();ctx.arc(-14,-10,3.6,0,7);fillOL(ctx,bel,1.4);}
  if(!fly)[[-6,run],[6,-run]].forEach(([dx,o])=>{ctx.beginPath();ctx.ellipse(dx+o*2,-2.5,4,3,0,0,7);fillOL(ctx,shade(col,-.22),1.4);});
  const gr=ctx.createRadialGradient(-4,-17,2,0,-10,16);gr.addColorStop(0,shade(col,.28));gr.addColorStop(1,col);
  ctx.beginPath();ctx.ellipse(-1,-10,13*wm,9,0,0,7);fillOL(ctx,gr,2);
  if(fx==='shell'){ctx.beginPath();ctx.ellipse(-3,-13,10,7,0,Math.PI,0);fillOL(ctx,'#4f8f4f',1.6);ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-3,-20);ctx.lineTo(-3,-13);ctx.moveTo(-9,-17);ctx.lineTo(-7,-13);ctx.moveTo(3,-17);ctx.lineTo(1,-13);ctx.stroke();}
  ctx.beginPath();ctx.ellipse(1,-6,9*wm,4.5,0,0,7);ctx.fillStyle=bel;ctx.fill();
  // ears (behind head)
  const pink='#ffa3bb',dk=shade(col,-.4);
  if(ear==='round'){[[4,-22],[12,-22.5]].forEach(([ex,ey])=>{ctx.beginPath();ctx.arc(ex,ey,3.6,0,7);fillOL(ctx,col,1.5);ctx.fillStyle=pink;ctx.beginPath();ctx.arc(ex,ey,1.9,0,7);ctx.fill();});}
  else if(ear==='long'){[[5,-0.18],[11,0.18]].forEach(([ex,a])=>{ctx.beginPath();ctx.ellipse(ex,-29,3,8.5,a,0,7);fillOL(ctx,col,1.5);ctx.fillStyle=pink;ctx.beginPath();ctx.ellipse(ex,-29,1.3,5.5,a,0,7);ctx.fill();});}
  else if(ear==='flop'){ctx.beginPath();ctx.ellipse(3,-16,3.8,7,0.35,0,7);fillOL(ctx,dk,1.5);}
  else if(ear==='point'||ear==='cat'){[[2,10],[8,16]].forEach(([a,b],i)=>{ctx.beginPath();ctx.moveTo(a+1,-20);ctx.lineTo((a+b)/2+(i?1:-1)*0,-30);ctx.lineTo(b-1,-21);ctx.closePath();fillOL(ctx,col,1.5);ctx.fillStyle=pink;ctx.beginPath();ctx.moveTo((a+b)/2-2,-22);ctx.lineTo((a+b)/2,-27);ctx.lineTo((a+b)/2+2,-22);ctx.fill();});}
  else if(ear==='tuft'){ctx.strokeStyle=OL;ctx.lineWidth=3.4;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(9+i*2,-22);ctx.quadraticCurveTo(9+i*5,-28,9+i*7+2,-29);ctx.stroke();}ctx.strokeStyle=bel;ctx.lineWidth=1.6;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(9+i*2,-22);ctx.quadraticCurveTo(9+i*5,-28,9+i*7+2,-29);ctx.stroke();}}
  if(fx==='mane'){ctx.fillStyle='#5a3a1c';[[2,-22],[-1,-18],[-3,-14]].forEach(([mx,my])=>{ctx.beginPath();ctx.arc(mx,my,3.4,0,7);fillOL(ctx,'#5a3a1c',1.2);});}
  // head
  ctx.beginPath();ctx.arc(9,-15,8.2,0,7);fillOL(ctx,gr,2);
  if(fx==='dark'){ctx.fillStyle='#6a4a3a';ctx.beginPath();ctx.ellipse(13,-13.5,4.6,3.4,0,0,7);ctx.fill();}
  // face
  if(fx==='frog'){[[6,-22],[13,-22]].forEach(([ex,ey])=>{ctx.beginPath();ctx.arc(ex,ey,3.6,0,7);fillOL(ctx,'#fff',1.4);ctx.fillStyle=OL;ctx.beginPath();ctx.arc(ex+0.8,ey,1.7,0,7);ctx.fill();});ctx.strokeStyle=OL;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(13,-13,4,0.2,2.5);ctx.stroke();}
  else{
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(12,-16.5,2.7,0,7);ctx.fill();ctx.fillStyle=OL;ctx.beginPath();ctx.arc(12.8,-16.5,1.5,0,7);ctx.fill();
    if(fx==='snout'){ctx.beginPath();ctx.ellipse(16,-12.5,4.2,3.2,0,0,7);fillOL(ctx,bel,1.4);ctx.fillStyle=OL;ctx.beginPath();ctx.arc(18.2,-13.2,1.3,0,7);ctx.fill();}
    else if(fx==='pig'){ctx.beginPath();ctx.ellipse(16.5,-12.5,4,3.4,0,0,7);fillOL(ctx,'#ff8fae',1.4);ctx.fillStyle='#b04a68';ctx.fillRect(15.2,-13,1.2,2.2);ctx.fillRect(17.4,-13,1.2,2.2);}
    else if(fx==='beak'||fx==='bill'){ctx.beginPath();ctx.moveTo(15.5,-16);ctx.lineTo(23,-13.5+(fx==='bill'?1:0));ctx.lineTo(15.5,-11);ctx.closePath();fillOL(ctx,fx==='bill'?'#ff9a1a':'#ffb21f',1.4);}
    else{ctx.fillStyle='#ff7d9c';ctx.beginPath();ctx.arc(16.3,-13.2,1.5,0,7);ctx.fill();}
    if(ear==='cat'||ear==='round'||ear==='long'){ctx.strokeStyle='rgba(30,20,40,.7)';ctx.lineWidth=0.9;[-1.5,1.5].forEach(d=>{ctx.beginPath();ctx.moveTo(15,-12+d*0.4);ctx.lineTo(21,-12+d*2);ctx.stroke();});}
  }
  // role accessory
  if(R===0){ctx.strokeStyle='#d01c2c';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(1.5,-19.5);ctx.lineTo(16.5,-19.5);ctx.stroke();ctx.beginPath();ctx.moveTo(1.5,-19.5);ctx.lineTo(-5,-17+run*2);ctx.moveTo(1.5,-19.5);ctx.lineTo(-4,-22-run*2);ctx.stroke();}
  else if(R===1){ctx.beginPath();ctx.moveTo(-0.5,-22);ctx.lineTo(9,-32);ctx.lineTo(18.5,-22);ctx.closePath();fillOL(ctx,'#2b2b3a',1.6);ctx.beginPath();ctx.ellipse(9,-22,11,2.5,0,0,7);fillOL(ctx,'#3d3d52',1.4);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(9,-26.5,1.7,0,7);ctx.fill();ctx.beginPath();ctx.arc(13,-16.5,3.2,0,7);fillOL(ctx,'#111',1);ctx.strokeStyle='#111';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(1.5,-18);ctx.lineTo(16,-20);ctx.stroke();}
  else if(R===2){ctx.beginPath();ctx.moveTo(0.5,-22);ctx.lineTo(9,-42);ctx.lineTo(17.5,-22);ctx.closePath();fillOL(ctx,'#7a45dd',1.6);ctx.beginPath();ctx.ellipse(9,-22,10.5,2.5,0,0,7);fillOL(ctx,'#4e2aa6',1.4);ctx.fillStyle='#ffd84a';ctx.beginPath();ctx.arc(9,-31,2,0,7);ctx.fill();ctx.fillStyle='rgba(255,230,120,'+(0.5+0.5*Math.sin(tm*0.2))+')';ctx.beginPath();ctx.arc(20,-24,2.2,0,7);ctx.fill();}
  else if(R===3){ctx.fillStyle='#fff';[[3,-31,4.5],[9,-34,5.4],[15,-31,4.5]].forEach(([cx,cy,r])=>{ctx.beginPath();ctx.arc(cx,cy,r,0,7);fillOL(ctx,'#fff',1.4);});ctx.beginPath();ctx.rect(3.5,-30,11,8.5);fillOL(ctx,'#fff',1.4);}
  else{ctx.beginPath();ctx.arc(9,-15,11.8,0,7);ctx.fillStyle='rgba(160,220,255,.28)';ctx.fill();ctx.strokeStyle='rgba(225,247,255,.95)';ctx.lineWidth=1.8;ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.8)';ctx.beginPath();ctx.arc(9,-15,8.6,3.6,4.5);ctx.stroke();}
  ctx.restore();
  if(en.charge){ctx.fillStyle='#ff3b3b';ctx.font='bold 20px system-ui';ctx.textAlign='center';ctx.fillText('!',x+en.w/2,y-24);}
}
/* ---------- endless runner ---------- */
let RUN=false,RUNSPD=1,runCat=0,RS=null,runBest={};
try{runBest=JSON.parse(localStorage.getItem('catcousins_run')||'{}')||{};}catch(_){}
const RUNNAMES=['Classic Dash','Cat World Run','River Run','Boss Rush Run'];
function runTheme(g,seed){
  const r=hsh(seed*0.01);
  if(g===0){const i=Math.floor(r*4);return {theme:THEMES[i],name:'Classic Dash'};}
  if(g===1){const i=Math.floor(r*THEME50.length);return {theme:{cfg:makeCfg(THEME50[i],i+900)},name:THEME50[i].name};}
  if(g===2){const i=Math.floor(r*CLEN.length);return {theme:{cfg:makeCfg(CLEN[i],i+950)},name:CLEN[i].name||'River Run'};}
  const i=Math.floor(r*WORLDS.length);return {theme:{cfg:worldCfg(i)},name:'Boss Rush'};
}
function startRun(){
  audioInit();RUN=true;story=false;
  const g=grp,seed=Math.floor(Math.random()*1e6),rt=runTheme(g,seed);
  MS=msDef();dogNow=!!CATS[sel].dog;ARENA=false;BS=1;RUNSPD=1;
  L={name:RUNNAMES[g],W:0,g:Array.from({length:ROWS},()=>[]),coins:[],enemies:[],tins:[],nips:[],shots:[],theme:rt.theme,goal:null,startX:2,half:0,var:0,note:'How far can you run?  ·  '+rt.name};
  RS={seed,n:0,last:-1,g,runX:-266,ro:makeRoster(seed*0.001),t:0};
  while(L.W<60)genChunk();
  P=newPlayer(CATS[sel]);
  cp={x:2*TS,y:12*TS-P.h};P.x=cp.x;P.y=cp.y;P.py=P.y;
  parts=[];texts=[];cam=0;tick=0;bannerT=180;partT=0;bigMsg.t=0;
  state='play';
  $('menu').classList.add('hide');$('msg').classList.add('hide');
}
const RUNW=[ // weights per world type: [pattern id, weight]
 [[1,3],[3,3],[4,3],[5,2],[8,2],[10,1],[6,1],[12,1],[15,2],[16,2],[20,1],[21,1]],
 [[6,3],[7,3],[12,2],[1,2],[3,2],[10,2],[5,2],[8,1],[17,2],[19,2],[18,1],[22,1]],
 [[1,3],[2,3],[8,2],[10,2],[3,1],[12,1],[5,1],[4,1],[16,2],[18,2],[21,1],[15,1]],
 [[5,4],[9,3],[14,3],[10,3],[3,2],[4,1],[17,2],[20,2],[22,2],[19,1],[21,1]]
];
// obstacle unlock thresholds (difficulty 0..1): 15 picket fence, 16 crate tower, 17 spike pits, 18 flyer lane, 19 spring tower, 20 enemy alley, 21 broken bridge, 22 double trouble
const RGATE={9:.3,14:.45,15:.15,16:.25,17:.5,18:.35,19:.4,20:.55,21:.75,22:.65};
const rgOK=(id,d)=>!(RGATE[id]>d);
function genChunk(){
  const R=RS,n=R.n++,xs=L.W;R.lastXs=xs;const dif=R.sd!=null?Math.min(1,R.sd+n/120):Math.min(1,n/40);
  if(!R.q)R.q=[];
  const rnd=k=>hsh(R.seed*0.13+n*7.7+k*3.3);
  // phrase queue: breather -> 2..4 obstacles -> reward
  if(!R.q.length){
    const w=RUNW[R.g],cnt=2+Math.floor(dif*2+rnd(1)*1.6),ids=[0];
    let last=-1;
    for(let i=0;i<cnt;i++){
      let tot=0;w.forEach(a=>{if(rgOK(a[0],dif)&&a[0]!==last)tot+=a[1];});
      let r=rnd(10+i)*tot,pick=w[0][0];
      for(const a of w){if(!rgOK(a[0],dif)||a[0]===last)continue;r-=a[1];if(r<=0){pick=a[0];break;}}
      ids.push(pick);last=pick;
    }
    ids.push(11);R.q=ids;
  }
  let id=n<2?0:R.q.shift();
  if(R.goalX&&xs+22>=R.goalX-10)id=0;
  const rows=[];
  const setc=(x,y,c)=>{if(y>=0&&y<ROWS&&x>=0)rows.push([x,y,c]);};
  const fish=(x,y,m)=>{
    const put=(dx,dy,i)=>L.coins.push({x:(xs+x+dx)*TS+16,y:(y-dy)*TS+16,got:false,ph:i});
    const k=Math.floor(rnd(60+x+y*3)*9);
    if(k===0||m<3){for(let i=0;i<m;i++)put(i,0,i);}
    else if(k===1){for(let i=0;i<m;i++)put(i,1+Math.sin(i*0.9),i);}
    else if(k===2){for(let i=0;i<m;i++)put(i,i*0.38,i);}
    else if(k===3){for(let i=0;i<m;i++)put(i,(m-1-i)*0.38,i);}
    else if(k===4){for(let i=0;i<m;i++)put(i,(i%2)*1.2,i);}
    else if(k===5){for(let i=0;i<m;i++){put(i,0,i);if(i<m-1)put(i+0.5,1,i);}}
    else if(k===6){for(let i=0;i<m;i++)put(i,Math.min(i,m-1-i)*0.7,i);}
    else if(k===7){const c=(m-1)/2,r=Math.min(1.6,m*0.4);for(let i=0;i<9;i++){const a=i/9*6.283;put(c+Math.cos(a)*r*1.1,1.8+Math.sin(a)*r,i);}}
    else{for(let i=0;i<m;i++)if(i%3!==2)put(i,Math.abs(Math.sin(i*0.5))*1.4,i);}
  };
  const arc=(x,y,m,h)=>{for(let i=0;i<m;i++){const kk=m>1?i/(m-1):.5;L.coins.push({x:(xs+x+i)*TS+16,y:(y-Math.sin(kk*Math.PI)*h)*TS+16,got:false,ph:i});}};
  const gap=(x,m)=>{for(let i=0;i<m;i++){setc(x+i,12,' ');setc(x+i,13,' ');}};
  const plat=(x,y,m)=>{for(let i=0;i<m;i++)setc(x+i,y,'=');};
  const spk=(x,m)=>{for(let i=0;i<m;i++)setc(x+i,11,'^');};
  const gE=x=>{const e=mkEnemy(R.ro.g[Math.floor(rnd(40+x)*R.ro.g.length)],xs+x,12);L.enemies.push(e);};
  const fE=(x,y)=>{const e=mkEnemy(R.ro.f[Math.floor(rnd(50+x)*R.ro.f.length)],xs+x,y);L.enemies.push(e);};
  const hard=dif>0.5;let w=22;(R.log||(R.log=[])).push([xs,id]);
  if(id===0){w=16;fish(4,11,8);}
  else if(id===1){const gw=hard?3:2;gap(8,gw);arc(6,10,gw+4,2.2);}
  else if(id===2){w=30;gap(7,10);plat(8,11,3);plat(13,11,3);fish(8,9,3);fish(13,9,3);arc(5,10,3,1.5);}
  else if(id===3){const m=hard?3:2;spk(9,m);arc(7,10,m+4,2.4);}
  else if(id===4){setc(9,11,'b');setc(10,11,'b');if(hard)setc(10,10,'b');fish(8,9,4);}
  else if(id===5){w=30;gE(9);gE(17);if(hard)gE(24);arc(7,10,5,2);arc(15,10,5,2);}
  else if(id===6){w=28;for(let i=0;i<4;i++){plat(8+i*4,9-i,3);fish(8+i*4,8-i,3);}}
  else if(id===7){w=26;setc(7,11,'y');plat(11,5,6);fish(11,4,6);fish(4,10,2);gE(15);}
  else if(id===8){w=26;for(let i=0;i<5;i++)setc(8+i,11,'#');for(let i=0;i<4;i++)setc(16+i,11,'#');fish(8,10,5);fish(16,10,4);}
  else if(id===9){w=36;spk(8,2);gap(14,3);spk(21,2);gap(27,3);arc(6,10,6,2.4);arc(12,10,7,2.4);arc(19,10,6,2.4);}
  else if(id===10){w=26;fE(10,8);fE(18,9);fish(6,11,5);fish(14,11,6);}
  else if(id===11){w=20;for(let i=0;i<12;i++)L.coins.push({x:(xs+4+i)*TS+16,y:(10+Math.sin(i*0.8)*1.2)*TS+16,got:false,ph:i});
    for(let i=0;i<3;i++)L.tins.push({x:(xs+6+i*3)*TS+16,y:11*TS+8,got:false,ph:i});
    if(n%2===1)L.nips.push({x:(xs+16)*TS+16,y:9*TS+10,got:false,ph:n});
    if(n%3!==2){const k=['mag','shield','puff'][Math.floor(rnd(7)*3)];L.pows.push({x:(xs+12)*TS+16,y:8*TS+10,k,got:false,ph:n});}}
  else if(id===12){w=28;spk(8,2);arc(6,10,6,2.2);plat(14,9,7);fish(14,8,7);}
  else if(id===14){w=30;spk(9,2);gE(15);gap(21,2);fE(14,8);arc(7,10,4,2);}
  else if(id===15){w=26;for(const x of [8,11,14,17])spk(x,1);arc(6,10,5,2.2);arc(10,10,5,2.2);arc(15,10,5,2.2);} // picket fence
  else if(id===16){w=24;setc(9,11,'b');setc(9,10,'b');if(hard){setc(15,11,'b');setc(15,10,'b');setc(15,9,'b');}fish(7,8,3);fish(13,7,3);} // crate tower
  else if(id===17){w=32;gap(8,2);spk(13,2);gap(18,2);arc(6,10,5,2.2);arc(11,10,5,2.2);arc(16,10,5,2.2);} // spike pits
  else if(id===18){w=32;fE(8,9);fE(14,8);fE(20,9);if(hard)fE(26,8);gE(25);fish(6,11,4);} // flyer lane
  else if(id===19){w=32;setc(7,11,'y');plat(11,5,5);spk(11,5);fish(11,4,5);if(hard){setc(21,11,'y');plat(25,5,4);spk(25,4);fish(25,4,4);}} // spring tower
  else if(id===20){w=32;gE(8);gE(13);gE(18);if(hard)gE(23);arc(6,10,4,2);arc(15,10,4,2);} // enemy alley
  else if(id===21){w=30;gap(8,2);gap(12,2);gap(16,2);if(hard)gap(20,2);arc(6,10,4,2.4);arc(10,10,4,2.4);arc(14,10,4,2.4);} // broken bridge
  else if(id===22){w=34;spk(8,2);gE(13);gap(18,2);spk(23,2);fE(14,8);fish(5,11,3);arc(21,10,4,2.2);} // double trouble
  for(let y=0;y<ROWS;y++)for(let i=0;i<w;i++)L.g[y].push(y>=12?'#':' ');
  L.W+=w;
  rows.forEach(([x,y,c])=>{if(xs+x<L.W)L.g[y][xs+x]=c;});
}
function runTick(){
  const p=P,R=RS;R.t++;
  RUNSPD=1+Math.min(0.45,Math.max(0,(p.x-64)/TS)/900);
  while(L.W*TS<p.x+1500)genChunk();
  const lunge=(R.t%600)>510&&R.t>300;
  R.lunge=lunge;
  R.runX=Math.max(R.runX,p.x-210)+(R.t>90?3.2*RUNSPD*((R.df?R.df.chase:0.72)+(lunge?0.2:0)):0);
  if(R.t>90&&R.t%150===0&&R.runX-cam>-120){tone(170,.1,'sawtooth',.07,-60);setTimeout(()=>tone(130,.15,'sawtooth',.07,-50),130);say(R.runX-70,12*TS-90,'WOOF!','#ffd84a');}
  if(state==='play'&&R.t>90&&R.runX>p.x-6){if(p.inv>0||p.puffT>0||p.shield>0){R.runX=p.x-210;}else{say(p.x,p.y-24,'CHOMP!','#ff4d6d');hurt();R.runX=p.x-210;if(p.hp<=0)return;}}
  if(p.onGround&&R.t%20===0){const cx=Math.floor((p.x+p.w/2)/TS);let ok=true;for(let i=0;i<4;i++)if(!solid(tile(cx+i,12)))ok=false;if(ok)cp={x:p.x,y:12*TS-p.h};}
  if(R.t%120===0){L.enemies=L.enemies.filter(e=>e.x>cam-500);L.coins=L.coins.filter(c=>c.x>cam-500);}
}
function runDist(){return Math.max(0,Math.floor((P.x-64)/TS));}
function runOver(){
  const d=runDist(),g=RS.g,best=Math.max(d,runBest[g]||0),nb=d>(runBest[g]||0);
  runBest[g]=best;try{localStorage.setItem('catcousins_run',JSON.stringify(runBest));}catch(_){}
  showMsg(nb?'New best! 🏆':'Run over! 🏃',d+' m  ·  🐟 '+P.fish+'  ·  Best '+best+' m',[['Run again',startRun,'on'],['Menu',showMenu]]);
}
function drawRunHUD(){
  if(!RUN||!L||!P||state==='menu')return;
  const d=runDist();
  ctx.save();ctx.textAlign='center';ctx.font='900 28px system-ui';ctx.lineWidth=6;ctx.strokeStyle=OL;ctx.lineJoin='round';
  ctx.strokeText(d+' m',VW/2,38);ctx.fillStyle='#ffd84a';ctx.fillText(d+' m',VW/2,38);
  ctx.font='bold 12px system-ui';ctx.lineWidth=4;ctx.strokeText('best '+(runBest[RS.g]||0)+' m',VW/2,54);ctx.fillStyle='#fff';ctx.fillText('best '+(runBest[RS.g]||0)+' m',VW/2,54);
  const wx=RS.runX-cam;if(wx>-30){const gr=ctx.createLinearGradient(0,0,Math.max(40,wx+30),0);gr.addColorStop(0,'rgba(255,60,90,.55)');gr.addColorStop(1,'rgba(255,60,90,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,Math.max(40,wx+30),VH);}
  ctx.restore();
}
function drawRunIcon(){
  const ri=$('runicon');if(!ri)return;const g=ri.getContext('2d');g.clearRect(0,0,64,44);
  const c=CATS[sel],w=c.w*0.95,h=c.h*0.95;drawCat(g,c,(64-w)/2,44-h-2,w,h,1,tick*1.6,{run:1});
}
/* animated title */
function drawWavy(txt,cx,y,size,tm){
  ctx.save();ctx.font='900 '+size+'px system-ui';ctx.textAlign='left';ctx.lineJoin='round';
  const ch=[...txt],ws=ch.map(c=>ctx.measureText(c).width),tw=ws.reduce((a,b)=>a+b,0);let x=cx-tw/2;
  ch.forEach((c,i)=>{
    ctx.save();ctx.translate(x+ws[i]/2,y+Math.sin(tm*0.08+i*0.55)*7);ctx.rotate(Math.sin(tm*0.06+i*0.8)*0.1);
    ctx.lineWidth=size*0.17;ctx.strokeStyle=OL;ctx.strokeText(c,-ws[i]/2,0);
    ctx.fillStyle='hsl('+(40+Math.sin(tm*0.05+i*0.5)*16)+',100%,'+(62+Math.sin(tm*0.1+i)*8)+'%)';ctx.fillText(c,-ws[i]/2,0);ctx.restore();x+=ws[i];});
  ctx.restore();
}
(function(){const h=document.querySelector('#menu h1');h.innerHTML='<span class="pw">🐾</span> '+[...'CAT QUEST'].map((c,i)=>c===' '?'<span style="width:.35em;display:inline-block"></span>':'<span class="wv" style="--i:'+i+'">'+c+'</span>').join('')+' <span class="pw" style="--i:5">🐾</span>';})();
/* unlock boxes (menu, controller tab, paws) */
/* 1019: unlocks every level on every map and opens the level editor (pause menu, Editor tab) */
function codeDone(){
  if(!UNL){renderPause();return;}
  try{if(!$('wm').classList.contains('hide'))wmBuild();}catch(_){}
  try{if(GM)gmInfo();}catch(_){}
  ptab='ed';if(!paused)togglePause(true);else{edIdx=EDLIST.includes(lvIdx)?lvIdx:edIdx;renderPause();}
}
document.addEventListener('keydown',e=>{
  const t=e.target;if(!(t&&t.classList&&t.classList.contains('codein'))||e.key==='Escape')return;
  e.stopPropagation();
  if(e.key==='Enter'){if(t.value.trim()==='1019'){UNL=!UNL;applyLock();toast(UNL?'🔓 Everything unlocked!':'🔒 Locked again');codeDone();}t.value='';}
},true);
document.addEventListener('keyup',e=>{if(e.target.classList&&e.target.classList.contains('codein')&&e.key!=='Escape')e.stopPropagation();},true);
/* phones: the code also works as soon as it is typed, no Enter needed */
document.addEventListener('input',e=>{const t=e.target;if(!(t&&t.classList&&t.classList.contains('codein')))return;if(t.value.trim()==='1019'){UNL=!UNL;applyLock();toast(UNL?'🔓 Everything unlocked!':'🔒 Locked again');t.value='';t.blur();codeDone();}},true);

/* ---------- turn 9: runner as a full mode ---------- */
let STGV=false;
let RC={stg:{at:0,stars:{}},cat:0,diff:1,bank:0,up:{mag:0,shield:0,heart:0},best:{0:[],1:[],2:[],3:[]}};
try{const o=JSON.parse(localStorage.getItem('catcousins_run2')||'null');if(o){RC=Object.assign(RC,o);RC.up=Object.assign({mag:0,shield:0,heart:0},o.up||{});RC.best=Object.assign({0:[],1:[],2:[],3:[]},o.best||{});}}catch(_){}
RC.stg=Object.assign({at:0,stars:{}},RC.stg||{});
function saveRC(){try{localStorage.setItem('catcousins_run2',JSON.stringify(RC));}catch(_){}}
const DIFFN=['😺 Chill','🐱 Normal','🐯 Zoomies'],DIFFS=[{spd:0.9,en:0.55,chase:0.55,ramp:0.6,sc:0.8},{spd:1,en:1,chase:0.72,ramp:1,sc:1},{spd:1.15,en:1.5,chase:0.86,ramp:1.5,sc:1.5}];
const UPS={mag:{n:'🧲 Magnet time',d:'Longer fish magnet',max:5,cost:l=>60*(l+1)},shield:{n:'🛡️ Start shield',d:'Begin each run with a shield',max:1,cost:l=>150},heart:{n:'❤️ Extra hearts',d:'+1 heart per level',max:3,cost:l=>100*(l+1)}};
const MEDALS=[[6000,'💎 Diamond'],[3000,'🥇 Gold'],[1500,'🥈 Silver'],[500,'🥉 Bronze']];
const POWN={mag:'🧲',shield:'🛡️',puff:'🎈'};
function runScore(){const df=DIFFS[RC.diff];return Math.floor((runDist()+P.fish*3+(P.bonus||0))*df.sc);}
function openSetup(){RUNNODE=null;RC.cat=grp;STGV=false;renderSetup();$('runsetup').classList.remove('hide');}
function closeSetup(){$('runsetup').classList.add('hide');}
function renderSetup(){
  const b=$('rsbody');let h='';
  if(STGV){b.innerHTML=stagesHTML();return;}
  const chip=(on,a,l)=>'<button class="b'+(on?' on':'')+'" '+a+'>'+l+'</button>';
  h+='<div class="rsrow"><b>World type</b><div>'+RUNNAMES.map((n,i)=>(i===3&&!UNL)?'':chip(RC.cat===i,'data-r="cat" data-v="'+i+'"',n)).join('')+'</div></div>';
  h+='<div class="rsrow"><b>Difficulty</b><div>'+DIFFN.map((n,i)=>chip(RC.diff===i,'data-r="diff" data-v="'+i+'"',n)).join('')+'</div></div>';
  const bs=RC.best[RC.cat]||[];
  h+='<div class="rsrow"><b>Top scores</b><div class="rsbest">'+(bs.length?bs.map((s,i)=>'<span>'+(i+1)+'. '+s+'</span>').join(''):'<span>none yet — go run!</span>')+'</div></div>';
  h+='<div class="rsrow"><b>Upgrades</b><div>🐟 Bank: <b>'+RC.bank+'</b></div></div><div class="rsups">';
  for(const k in UPS){const u=UPS[k],l=RC.up[k],mx=l>=u.max,c=u.cost(l);h+='<div class="rsup"><div><b>'+u.n+'</b> <small>lv '+l+'/'+u.max+'</small><br><small>'+u.d+'</small></div><button class="b'+(mx||RC.bank<c?' dim':'')+'" data-r="buy" data-v="'+k+'">'+(mx?'MAX':'🐟 '+c)+'</button></div>';}
  h+='</div><p class="help">Stomp for combo points · fish bank after every run · grab 🧲 magnet, 🛡️ shield and 🎈 puff pick-ups · a new zone every 400 m</p>';
  b.innerHTML=h;
}
$('rsbody').addEventListener('click',e=>{
  const t=e.target.closest('button[data-r]');if(!t)return;const a=t.dataset.r,v=t.dataset.v;
  if(a==='stg'){if(+v<=RC.stg.at||UNL){startStage(+v);}return;}
  if(a==='stgx'){STGV=false;renderSetup();return;}
  if(a==='cat'){RC.cat=+v;grp=+v;setGroup(grp);}
  else if(a==='diff')RC.diff=+v;
  else if(a==='buy'){const u=UPS[v],l=RC.up[v],c=u.cost(l);if(l<u.max&&RC.bank>=c){RC.bank-=c;RC.up[v]++;sfx.check();}}
  saveRC();renderSetup();
});
$('rsstages').onclick=()=>{STGV=true;renderSetup();};
$('rsgo').onclick=()=>{RUNNODE=null;startRun();};$('rsmap').onclick=openRunMap;$('rsback').onclick=closeSetup;
$('run').onclick=openSetup;
document.addEventListener('keydown',e=>{
  if(e.target&&e.target.classList&&e.target.classList.contains('codein'))return;
  if($('runsetup').classList.contains('hide'))return;
  if(e.code==='Escape'){e.stopPropagation();e.preventDefault();closeSetup();}
  else if(e.code==='Enter'){e.stopPropagation();e.preventDefault();RUNNODE=null;startRun();}
},true);
/* override startRun with settings, zones, power-ups */
function startRun(){
  audioInit();RUN=true;story=false;closeSetup();
  const nd=RUNNODE,g=(nd&&nd.g!=null)?nd.g:RC.cat,df=(nd&&nd.df)||DIFFS[RC.diff],seed=Math.floor(Math.random()*1e6);
  if(!nd)grp=g;
  MS=msDef();dogNow=!!CATS[sel].dog;ARENA=false;BS=1;RUNSPD=df.spd;
  const zones=[];if(nd)zones.push({theme:nd.theme,name:nd.name});else for(let i=0;i<5;i++)zones.push(runTheme(g,seed+i*7919));
  L={name:nd?nd.name:RUNNAMES[g],W:0,g:Array.from({length:ROWS},()=>[]),coins:[],enemies:[],tins:[],nips:[],shots:[],pows:[],theme:zones[0].theme,goal:nd?{x:(nd.D+2)*TS,y:11*TS}:null,startX:2,half:0,var:0,note:nd?('Reach '+nd.D+' m!'):'How far can you run?  ·  '+zones[0].name};
  RS={seed,n:0,last:-1,g,runX:-266,ro:makeRoster(seed*0.001),t:0,df,zones,zone:0,flash:0,mile:0,node:nd,goalX:nd?nd.D+2:0,sd:(nd&&nd.sd!=null)?nd.sd:undefined};
  while(L.W<60)genChunk();
  P=newPlayer(CATS[sel]);
  P.vx=3.2*df.spd;P.face=1;bigMsg={s:'RUN!',t:70};
  P.maxhp+=RC.up.heart;P.hp=P.maxhp;P.shield=RC.up.shield?1:0;P.stomps=0;P.bonus=0;P.combo=0;P.comboT=0;P.magT=0;
  cp={x:2*TS,y:12*TS-P.h};P.x=cp.x;P.y=cp.y;P.py=P.y;
  parts=[];texts=[];cam=0;tick=0;bannerT=120;partT=0;
  state='play';
  $('menu').classList.add('hide');$('msg').classList.add('hide');
}
const _genChunk=genChunk;
genChunk=function(){
  const n0=RS.n,df=RS.df;_genChunk();
  const xs=RS.lastXs;
  // thin / thicken enemies by difficulty
  if(df.en<1){let k=0;L.enemies=L.enemies.filter(e=>{if(e.x<xs*TS||e.dead)return true;k++;return hsh(e.x*0.37+RS.seed)<df.en;});}
  else if(df.en>1&&n0>1){const x=xs+4+Math.floor(hsh(RS.seed+n0)*14);const pk=RS.ro.g[Math.floor(hsh(n0*3.1+RS.seed)*RS.ro.g.length)];if(L.g[12][x]==='#'&&L.g[11][x]===' '&&hsh(n0*1.9+RS.seed)<0.5*(df.en-1)*2){const e=mkEnemy(pk,x,12);L.enemies.push(e);}}
};
const _runTick=runTick;
runTick=function(){
  const p=P,R=RS;
  R.df=(R.node&&R.node.df)||DIFFS[RC.diff];
  _runTick();
  if(state!=='play')return;
  RUNSPD=R.df.spd*(1+Math.min(0.45*R.df.ramp,Math.max(0,(p.x-64)/TS)/900*R.df.ramp));
  // zones
  const d=runDist(),z=Math.floor(d/400);
  if(!R.node&&z!==R.zone){R.zone=z;const Z=R.zones[z%R.zones.length];L.theme=Z.theme;L.name='ZONE '+(z+1);L.note=Z.name;bannerT=150;R.flash=24;sfx.win();}
  const m=Math.floor(d/100);if(m>R.mile&&d%400>=100){R.mile=m;say(p.x-10,p.y-30,(m*100)+' m!','#8fe8ff');sfx.check();}else if(m>R.mile)R.mile=m;
  if(R.flash>0)R.flash--;
  // combo decay
  if(p.comboT>0){p.comboT--;if(p.comboT===0)p.combo=0;}
  // magnet
  if(p.magT>0){p.magT--;const cx=p.x+p.w/2,cy=p.y+p.h/2;for(const co of L.coins){if(co.got)continue;const dx=cx-co.x,dy=cy-co.y,dd=Math.hypot(dx,dy);if(dd<170&&dd>1){co.x+=dx/dd*7;co.y+=dy/dd*7;}}}
  // power-ups
  for(const w of L.pows){if(w.got)continue;if(Math.abs(p.x+p.w/2-w.x)<p.w/2+18&&Math.abs(p.y+p.h/2-w.y)<p.h/2+18){
    w.got=true;sfx.check();burst(w.x,w.y,'#fff6a0',14,4);
    if(w.k==='mag'){p.magT=300+60*RC.up.mag;say(w.x-20,w.y-20,'MAGNET!','#ff7a7a');}
    else if(w.k==='shield'){p.shield=1;say(w.x-20,w.y-20,'SHIELD!','#7fd0ff');}
    else{goPuff();say(w.x-20,w.y-20,'PUFF!','#fff');}}}
  if(R.t%120===0)L.pows=L.pows.filter(w=>w.x>cam-500);
};
const _hurt=hurt;
hurt=function(from){
  const p=P;
  if(RUN&&p&&p.inv<=0&&state==='play'&&p.puffT<=0){
    if(p.shield>0){p.shield=0;p.inv=70;sfx.check();burst(p.x+p.w/2,p.y+p.h/2,'#7fd0ff',16,4);say(p.x,p.y-14,'BLOCKED!','#7fd0ff');return;}
    p.combo=0;p.comboT=0;
  }
  _hurt(from);
};
const _killEnemy=killEnemy;
killEnemy=function(en){
  if(RUN&&P&&en.t!=='boss'){P.stomps=(P.stomps||0)+1;const c=Math.min(5,(P.combo||0));P.bonus=(P.bonus||0)+25*(1+c);P.combo=(P.combo||0)+1;P.comboT=200;if(P.combo>1)say(en.x,en.y-26,'x'+P.combo+' COMBO','#ffd84a');}
  _killEnemy(en);
};
runOver=function(){
  if(RS.node){nodeOver();return;}
  const d=runDist(),g=RS.g,sc=runScore(),f=P.fish;
  RC.bank+=f;const bs=RC.best[g]||(RC.best[g]=[]);const nb=!bs.length||sc>bs[0];bs.push(sc);bs.sort((a,b)=>b-a);RC.best[g]=bs.slice(0,5);saveRC();
  const med=(MEDALS.find(m=>sc>=m[0])||[0,'—'])[1];
  showMsg(nb?'New best! 🏆':'Run over! 🏃','Score '+sc+'  ·  '+d+' m  ·  🐟 '+f+'  ·  stomps '+(P.stomps||0)+'\nMedal: '+med+'   (+'+f+' 🐟 banked)',[['Run again',startRun,'on'],['Setup',()=>{showMenu();openSetup();}],['Menu',showMenu]]);
};
drawRunHUD=function(){
  if(!RUN||!L||!P||state==='menu')return;
  const sc=runScore(),d=runDist();
  ctx.save();ctx.textAlign='center';ctx.lineJoin='round';
  ctx.font='900 28px system-ui';ctx.lineWidth=6;ctx.strokeStyle=OL;ctx.strokeText(sc+'',VW/2,38);ctx.fillStyle='#ffd84a';ctx.fillText(sc+'',VW/2,38);
  ctx.font='bold 12px system-ui';ctx.lineWidth=4;const sub=RS.node?(d+' m / '+RS.node.D+' m'):(d+' m · best '+((RC.best[RS.g]||[])[0]||0));ctx.strokeText(sub,VW/2,54);ctx.fillStyle='#fff';ctx.fillText(sub,VW/2,54);
  if(P.combo>1){ctx.font='900 18px system-ui';ctx.strokeText('x'+P.combo+' COMBO',VW/2,76);ctx.fillStyle='#ff9d2e';ctx.fillText('x'+P.combo+' COMBO',VW/2,76);}
  ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=2;for(let i=0;i<9;i++){const y=60+hsh(i*3.7)*330,x=VW-((tick*(16+i*4)+i*131)%(VW+120));ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+40+i*5,y);ctx.stroke();}
  // pickups in world
  ctx.font='22px system-ui';for(const w of L.pows){if(w.got)continue;const x=w.x-cam;if(x<-30||x>VW+30)continue;const y=w.y+Math.sin(tick*0.08+w.ph)*5;glow(ctx,x,y,28,'255,240,140',0.55);ctx.fillText(POWN[w.k],x,y+8);}
  // shield bubble
  if(P.shield>0){const cx=P.x+P.w/2-cam,cy=P.y+P.h/2,r=Math.max(P.w,P.h)*0.85;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fillStyle='rgba(127,208,255,.2)';ctx.fill();ctx.strokeStyle='rgba(190,235,255,.9)';ctx.lineWidth=2;ctx.stroke();}
  // active timers
  let ty=100;ctx.textAlign='right';ctx.font='bold 13px system-ui';
  const tag=(ic,txt)=>{ctx.fillStyle='rgba(15,10,40,.55)';rr(ctx,VW-92,ty-14,84,22,10);ctx.fill();ctx.fillStyle='#fff';ctx.fillText(ic+' '+txt,VW-14,ty+2);ty+=26;};
  if(P.magT>0)tag('🧲',(P.magT/60).toFixed(1)+'s');if(P.shield>0)tag('🛡️','ready');if(P.puffT>0)tag('🎈',(P.puffT/60).toFixed(1)+'s');
  {const rx=RS.runX,sz=ESZ.dog,over=tile(Math.floor(rx/TS),12)===' ',lift=over?Math.abs(Math.sin(tick*0.2))*24:0;
   const gapPx=P.x-rx;
   if(gapPx<130){ctx.fillStyle='rgba(255,60,90,'+(0.35*(1-gapPx/130))+')';ctx.fillRect(0,0,VW,VH);}
   const dg={t:'dog',x:rx-86,y:12*TS-sz[1]-lift,w:sz[0],h:sz[1],dir:1,tm:tick*(RS.lunge?1.6:1.2),dead:false};
   const sb=BS;BS=1.5;try{drawEnemy(dg);}finally{BS=sb;}
   if(RS.lunge&&Math.floor(tick/8)%2){ctx.font='900 22px system-ui';ctx.textAlign='left';ctx.lineWidth=5;ctx.strokeStyle=OL;ctx.fillStyle='#ff9d2e';ctx.strokeText('🐕 GRRR!',12,VH-24);ctx.fillText('🐕 GRRR!',12,VH-24);}}
  if(RS.flash>0){ctx.fillStyle='rgba(255,255,255,'+(RS.flash/24*0.6)+')';ctx.fillRect(0,0,VW,VH);}
  ctx.restore();
};

/* ---------- turn 11: run map ---------- */
let OWM='story',RUNNODE=null;
RC.map=Object.assign({at:0,stars:{}},RC.map||{});
try{const o=JSON.parse(localStorage.getItem('catcousins_run2')||'null');if(o&&o.map)RC.map=Object.assign({at:0,stars:{}},o.map);}catch(_){}
function owAt(){if(UNL)return 1e6;return OWM==='run'?RC.map.at:S.story.at;}   /* 1019 code: every level on every map is open */
function nodeInfo(i){
  const s=SEQ[i],w=WORLDS[s.w];let theme,name;
  if(s.boss){theme={cfg:worldCfg(s.w)};name='Run from '+BOSS[s.w][0]+'!';}
  else{const l=s.lv;name=LEVEL_NAMES[l].replace(/^\d+ · /,'');theme=l<4?THEMES[l]:{cfg:makeCfg(l<54?THEME50[l-4]:CLEN[l-54],1000+l)};}
  const D=350+40*(s.n-1)+25*s.w+(s.boss?200:0);
  return {theme,name,D,boss:!!s.boss,w:s.w};
}
function openRunMap(){
  audioInit();OWM='run';RUN=false;RUNNODE=null;story=false;state='world';
  $('menu').classList.add('hide');$('msg').classList.add('hide');closeSetup();
  const maxU=Math.min(SEQ.length-1,RC.map.at);OW.u=maxU;OW.cam=owPos(OW.u)[0]-VW/2;hideThumb();
}
function startRunNode(i){RUNNODE=Object.assign({i},nodeInfo(i));storyIdx=i;startRun();}
function runNodeWin(){
  if(state==='win')return;
  if(RS.node&&RS.node.stage!=null)return stageWin();
  state='win';sfx.win();const R=RS,nd=R.node,P0=P;
  for(let k=0;k<40;k++)burst(P0.x+P0.w/2,P0.y,['#ffd84a','#ff77b7','#6ee7ff','#9fe870'][k%4],1,6);
  const need=Math.round(nd.D/10),stars=1+(P0.fish>=need?1:0)+(P0.hp>=P0.maxhp?1:0);
  const old=RC.map.stars[nd.i]||0;if(stars>old)RC.map.stars[nd.i]=stars;
  if(nd.i>=RC.map.at)RC.map.at=Math.min(SEQ.length,nd.i+1);
  RC.bank+=P0.fish;saveRC();
  const fin=nd.i>=SEQ.length-1,next=nd.i<SEQ.length-1;
  setTimeout(()=>{
    const btns=[];if(next)btns.push(['Next run ▶',()=>startRunNode(nd.i+1),'on']);
    btns.push(['Replay',()=>startRunNode(nd.i)]);btns.push(['Map',openRunMap]);
    showMsg(fin?'You outran every dog! 🏆':(nd.boss?'You escaped! 🐕💨':'Run complete! 🎉'),nd.name+'\n'+'★'.repeat(stars)+'☆'.repeat(3-stars)+'  ·  🐟 '+P0.fish+'/'+need+(P0.hp>=P0.maxhp?'  ·  flawless':'')+'  (+'+P0.fish+' 🐟 banked)',btns);
  },900);
}
function nodeOver(){
  if(RS.node&&RS.node.stage!=null)return stageOver();
  const nd=RS.node,d=runDist();RC.bank+=P.fish;saveRC();
  showMsg('Caught! 🐕',nd.name+'\n'+d+' m of '+nd.D+' m  ·  🐟 '+P.fish+'  (+'+P.fish+' 🐟 banked)',[['Try again',()=>startRunNode(nd.i),'on'],['Map',openRunMap]]);
}


/* ---------- 50 progressive run stages ---------- */
const STG_ADJ=['Sunny','Breezy','Bouncy','Sneaky','Dusty','Frosty','Spooky','Zippy','Rocky','Stormy'];
const STG_NOUN=['Alley','Rooftops','Bridges','Backyards','Gauntlet'];
function stageDef(s){
  const k=s/49,g=s%4,seed=5000+s*131,rt=runTheme(g,seed);
  return {stage:s,i:1000+s,g,theme:rt.theme,name:'Stage '+(s+1)+' · '+STG_ADJ[s%10]+' '+STG_NOUN[Math.floor(s/10)%5],D:300+24*s,boss:false,w:g,sd:0.05+0.8*k,
    df:{spd:0.9+0.3*k,en:0.6+0.95*k,chase:0.52+0.36*k,ramp:0.6+0.9*k,sc:1}};
}
function startStage(s){RUNNODE=stageDef(s);startRun();}
function stagesHTML(){
  const at=Math.min(50,RC.stg.at),tot=Object.values(RC.stg.stars).reduce((a,b)=>a+b,0);
  let h='<div class="rsrow"><b>🏁 Run Stages</b><div><button class="b" data-r="stgx">‹ Run setup</button></div></div>';
  h+='<p class="help">'+at+' / 50 cleared · ★ '+tot+' / 150 · stages get longer, faster and meaner; new obstacles join along the way.</p><div class="stgrid">';
  for(let s=0;s<50;s++){const ok=s<=RC.stg.at||UNL,st=RC.stg.stars[s]||0;
    h+='<button class="b stgb'+(ok?'':' dim')+(s===RC.stg.at?' on':'')+'" data-r="stg" data-v="'+s+'" aria-label="Stage '+(s+1)+(ok?'':' locked')+'">'+(ok?(s+1):'🔒')+'<small>'+(st?'★'.repeat(st)+'☆'.repeat(3-st):'')+'</small></button>';}
  return h+'</div>';
}
function openStages(){STGV=true;openSetup();STGV=true;renderSetup();$('runsetup').classList.remove('hide');}
function stageWin(){
  if(state==='win')return;
  state='win';sfx.win();const nd=RS.node,P0=P,s=nd.stage;
  for(let k=0;k<40;k++)burst(P0.x+P0.w/2,P0.y,['#ffd84a','#ff77b7','#6ee7ff','#9fe870'][k%4],1,6);
  const need=Math.round(nd.D/12),stars=1+(P0.fish>=need?1:0)+(P0.hp>=P0.maxhp?1:0);
  if(stars>(RC.stg.stars[s]||0))RC.stg.stars[s]=stars;
  if(s>=RC.stg.at)RC.stg.at=Math.min(50,s+1);
  RC.bank+=P0.fish;saveRC();
  setTimeout(()=>{
    const btns=[];if(s<49)btns.push(['Next stage ▶',()=>startStage(s+1),'on']);
    btns.push(['Replay',()=>startStage(s)]);btns.push(['Stages',openStages]);
    showMsg(s>=49?'All 50 stages cleared! 🏆':'Stage clear! 🎉',nd.name+'\n'+'★'.repeat(stars)+'☆'.repeat(3-stars)+'  ·  🐟 '+P0.fish+'/'+need+(P0.hp>=P0.maxhp?'  ·  flawless':'')+'  (+'+P0.fish+' 🐟 banked)',btns);
  },900);
}
function stageOver(){
  const nd=RS.node,d=runDist();RC.bank+=P.fish;saveRC();
  showMsg('Caught! 🐕',nd.name+'\n'+d+' m of '+nd.D+' m  ·  🐟 '+P.fish+'  (+'+P.fish+' 🐟 banked)',[['Try again',()=>startStage(nd.stage),'on'],['Stages',openStages]]);
}

/* ---------- turn 12: level codes ---------- */
const CODEP=(()=>{const a=Array.from({length:1000},(_,i)=>i);for(let i=999;i>0;i--){const j=Math.floor(hsh(i*13.7+5)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;})();
const CODEREV={};
function codeFor(mode,i){return String(CODEP[mode*125+i]).padStart(3,'0');}
for(let m=0;m<2;m++)for(let i=0;i<SEQ.length;i++)CODEREV[codeFor(m,i)]=[m,i];
let PENDCODE=null;
const _showMsg=showMsg;
showMsg=function(t,sub,btns){if(PENDCODE){sub+='\n🔑 Level code: '+PENDCODE;PENDCODE=null;}_showMsg(t,sub,btns);};
const _win=win;
win=function(){
  if(RUN&&RS&&RS.node&&RS.node.stage==null)PENDCODE=codeFor(1,RS.node.i);
  else if(story&&storyIdx>=0)PENDCODE=codeFor(0,storyIdx);
  _win();
};
function loadCode(v){
  v=String(v||'').trim();const hit=CODEREV[v];
  if(!hit){toast('❌ Unknown code');return;}
  const [m,i]=hit,s=SEQ[i],nm=m?'Run Map':'Story';
  const label=nm+' · World '+(s.w+1)+' · '+(s.boss?'Boss: '+BOSS[s.w][0]:LEVEL_NAMES[s.lv].replace(/^\d+ · /,''));
  if(m===0){if(!S.story)S.story={at:0};S.story.at=Math.min(SEQ.length,Math.max(S.story.at||0,i+1));saveS();toast('🔑 Loaded: '+label);startStory();}
  else{RC.map.at=Math.min(SEQ.length,Math.max(RC.map.at||0,i+1));saveRC();toast('🔑 Loaded: '+label);openRunMap();}
}
$('pw').addEventListener('input',()=>{if($('pw').value.trim()==='1019'){UNL=!UNL;applyLock();toast(UNL?'🔓 Everything unlocked!':'🔒 Locked again');$('pw').value='';$('pw').blur();codeDone();}});   /* the unlock code works here too */
$('pwgo').onclick=()=>{loadCode($('pw').value);$('pw').value='';};
$('pw').addEventListener('keydown',e=>{if(e.key==='Escape')return;e.stopPropagation();if(e.key==='Enter'){loadCode($('pw').value);$('pw').value='';}});
$('pw').addEventListener('keyup',e=>{if(e.key!=='Escape')e.stopPropagation();});


/* ================================================================
   TURN 2: critters (100 new enemies), Temple Run, Maze, cutscenes
   ================================================================ */
var MODE='plat', TI=0, MI=0, TP=null, MZ=null, CUT=null, CUTARM=false, GM=null, SWIPE=null;
function rngOf(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function shd(col,f){const n=parseInt(col.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const m=f<0?0:255,a=Math.abs(f);r=Math.round(r+(m-r)*a);g=Math.round(g+(m-g)*a);b=Math.round(b+(m-b)*a);return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);}
const PR=(()=>{try{return JSON.parse(localStorage.getItem('cq_prog')||'{}')||{};}catch(_){return {};}})();
PR.temple=PR.temple||{at:0,st:{}};PR.maze=PR.maze||{at:0,st:{}};
function savePR(){try{localStorage.setItem('cq_prog',JSON.stringify(PR));}catch(_){}}
const WT=[
 {n:'Jungle Ruins',   sky:['#6fd3a0','#effad0'],r1:'#b99a5c',r2:'#a98a4e',side:'#2f8a3c',side2:'#277a35',acc:'#d9a441',wall:'#3f7d3a',floor:'#cfe3a0'},
 {n:'Sunbaked Sands', sky:['#ffcf7a','#fff3c9'],r1:'#e3b46b',r2:'#d7a55c',side:'#ecd091',side2:'#e4c481',acc:'#3f9a4a',wall:'#c98f4a',floor:'#f1dca0'},
 {n:'Frozen Peaks',   sky:['#8fd0ff','#eef9ff'],r1:'#cfe8f7',r2:'#bcdcee',side:'#f5fbff',side2:'#e4f2fa',acc:'#5aa8e0',wall:'#7fb2d6',floor:'#e6f4fb'},
 {n:'Lava Temple',    sky:['#5a1f2a','#ff8a3a'],r1:'#4a3a3a',r2:'#3d2f2f',side:'#2b1a1a',side2:'#241515',acc:'#ff7a1c',wall:'#7a2d1d',floor:'#5a4646'},
 {n:'Candy Canyon',   sky:['#ffc2e4','#fff0fa'],r1:'#ffd1e8',r2:'#ffbfdc',side:'#b6f0d0',side2:'#a4e6c4',acc:'#ff4f9a',wall:'#ff7fb5',floor:'#fff0f8'},
 {n:'Midnight Grove', sky:['#0f1240','#3a3a8a'],r1:'#38406a',r2:'#2f3560',side:'#14301f',side2:'#10281a',acc:'#ffe27a',wall:'#1f5c3a',floor:'#3d4a7a'},
 {n:'Haunted Manor',  sky:['#2a1844','#6a3a8a'],r1:'#5b4a6e',r2:'#4f3f61',side:'#231533',side2:'#1c102a',acc:'#9fe870',wall:'#4a2d63',floor:'#7a6590'},
 {n:'Cloud Kingdom',  sky:['#7ab8ff','#ffffff'],r1:'#ffffff',r2:'#e3eeff',side:'#cfe3ff',side2:'#bcd6fb',acc:'#ffb43a',wall:'#9fc4f5',floor:'#f4f9ff'},
 {n:'Orbit Station',  sky:['#05051a','#2b1a5e'],r1:'#5f6b86',r2:'#535e78',side:'#1a1a3a',side2:'#14142e',acc:'#46e0ff',wall:'#3a4a7a',floor:'#7a869f'},
 {n:'Deep Reef',      sky:['#0a4a8a','#58d0e0'],r1:'#e0cf9a',r2:'#d2c088',side:'#137a8a',side2:'#0f6a7a',acc:'#ff6f61',wall:'#1a6f9a',floor:'#bfe8e8'}
];
const TLV=['Warm-Up','Vine Dash','Idol Rush','Trap Alley','Zig Zag','Boulder Run','Big Leap','Blade Hall','Monster Chase','Guardian'];
const MLV=['Stroll','Wander','Tangle','Knot','Loop-de-Loop','Riddle','Warren','Spiral','Puzzle Box','Gauntlet'];
const MWN=['Hedge Garden','Pyramid Dunes','Ice Caverns','Magma Keep','Candy Castle','Moonlit Maze','Spooky Manor','Sky Garden','Space Hall','Coral Maze'];
function tpName(i){return WT[Math.floor(i/10)].n+' '+(i%10+1)+' · '+TLV[i%10];}
function mzName(i){return MWN[Math.floor(i/10)]+' '+(i%10+1)+' · '+MLV[i%10];}

/* ---------- 100 new critter enemies (10 bodies x 10 gadgets) ---------- */
const CSH=['Blob','Beetle','Ghost','Urchin','Snail','Froggo','Crab','Squid','Botbot','Moth'];
const CMD=['Horned','Antenna','Crowned','Patched','Capped','Scarfed','Spiky','Winged','Bowtied','Goggled'];
const CSZ=[[26,22],[28,20],[26,30],[28,28],[30,20],[30,22],[32,20],[26,30],[28,30],[30,24]];
const CSAY=['SPLORP!','CRUNCH!','BOO-HOO!','OOF!','SLURP!','RIBBIT!','SNIP!','BLOOP!','BZZT!','FLUTTER!'];
function critSz(v){return CSZ[v%10];}
function critInfo(v){const hue=Math.floor(hsh(v*3.7+1)*360),h2=(hue+140+Math.floor(hsh(v*1.9)*80))%360;
  return {s:v%10,m:Math.floor(v/10)%10,body:'hsl('+hue+',68%,58%)',dark:'hsl('+hue+',58%,36%)',acc:'hsl('+h2+',80%,62%)',name:CMD[Math.floor(v/10)%10]+' '+CSH[v%10]};}
function drawCritArt(c,v,cx,by,w,h,dir,t){
  const I=critInfo(v),s=I.s,m=I.m,B=I.body,D=I.dark,A=I.acc,W=w/2,lw=2,bob=Math.sin(t*0.22+v)*h*0.04;
  c.save();c.translate(cx,by);c.scale(dir<0?-1:1,1);c.lineJoin='round';c.lineCap='round';
  const ell=(x,y,rx,ry,f)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);fillOL(c,f,lw);};
  const line=(x1,y1,x2,y2,col,wd)=>{c.strokeStyle=col;c.lineWidth=wd||2;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();};
  const tri=(x1,y1,x2,y2,x3,y3,f)=>{c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineTo(x3,y3);c.closePath();fillOL(c,f,1.6);};
  const TOP=[1,1,1.06,1.16,.9,1.02,.86,1.02,.84,.9][s]*h;let hx=0;
  let ey=[.55,.52,.62,.5,.72,.66,.55,.62,.62,.6][s];
  if(s===0){ell(0,-h*.46+bob*.4,W,h*.46-bob*.4,B);ell(-W*.45,-h*.2,W*.2,h*.1,A);}
  else if(s===1){for(let i=-1;i<=1;i++){line(-W*.7,-h*.2+i*3,-W*1.05,-h*.1+i*5,OL,2);line(W*.7,-h*.2+i*3,W*1.05,-h*.1+i*5,OL,2);}
    c.beginPath();c.ellipse(0,-h*.3+bob*.3,W,h*.7,0,Math.PI,0);c.closePath();fillOL(c,B,lw);line(0,-h*.98,0,-h*.3,D,2);
    ell(-W*.45,-h*.55,3,3,A);ell(W*.45,-h*.5,3,3,A);}
  else if(s===2){c.beginPath();c.moveTo(-W,-h*.55);c.bezierCurveTo(-W,-h*1.25,W,-h*1.25,W,-h*.55);c.lineTo(W,-2);
    for(let i=0;i<4;i++){c.lineTo(W-(i+.5)*W/2,-(i%2?2:h*.16)+bob);c.lineTo(W-(i+1)*W/2,-2);}c.closePath();c.globalAlpha=.92;fillOL(c,'#f4f2ff',lw);c.globalAlpha=1;
    ell(-W*.8,-h*.3,4,3,B);ell(W*.8,-h*.3,4,3,B);}
  else if(s===3){const n=10;for(let i=0;i<n;i++){const a=i/n*6.283+t*0.02;tri(Math.cos(a-.2)*W*.7,-h*.46+Math.sin(a-.2)*h*.4,Math.cos(a)*W*1.12,-h*.46+Math.sin(a)*h*.62,Math.cos(a+.2)*W*.7,-h*.46+Math.sin(a+.2)*h*.4,D);}
    ell(0,-h*.46,W*.78,h*.4,B);}
  else if(s===4){ell(0,-h*.2,W,h*.2,B);ell(W*.62,-h*.42,W*.3,h*.3,B);line(W*.62,-h*.6,W*.52,-h*.88,D,2);line(W*.78,-h*.6,W*.9,-h*.86,D,2);ell(-W*.2,-h*.58,W*.62,h*.48,A);
    c.strokeStyle=OL;c.lineWidth=1.6;c.beginPath();c.arc(-W*.2,-h*.58,h*.2,0,5);c.stroke();hx=W*.62;}
  else if(s===5){ell(-W*.7,-h*.1,W*.35,h*.12,D);ell(W*.7,-h*.1,W*.35,h*.12,D);ell(0,-h*.38+bob*.4,W,h*.36,B);ell(-W*.45,-h*.8,W*.26,W*.26,'#fff');ell(W*.45,-h*.8,W*.26,W*.26,'#fff');ell(-W*.45,-h*.8,2.4,2.4,OL);ell(W*.45,-h*.8,2.4,2.4,OL);ey=-9;}
  else if(s===6){for(let i=0;i<3;i++){const a=Math.sin(t*.3+i)*2;line(-W*.5-i*3,-h*.2,-W*.9-i*4,-2+a,OL,2);line(W*.5+i*3,-h*.2,W*.9+i*4,-2-a,OL,2);}
    ell(-W*.95,-h*.82-Math.abs(Math.sin(t*.12))*3,W*.3,h*.2,A);ell(W*.95,-h*.82-Math.abs(Math.sin(t*.12+1))*3,W*.3,h*.2,A);ell(0,-h*.42,W*.76,h*.38,B);}
  else if(s===7){for(let i=0;i<4;i++){const x=-W*.6+i*W*.4;c.strokeStyle=D;c.lineWidth=3.2;c.beginPath();c.moveTo(x,-h*.4);c.quadraticCurveTo(x+Math.sin(t*.25+i)*5,-h*.2,x+Math.cos(t*.2+i)*4,-1);c.stroke();}
    ell(0,-h*.64+bob,W*.82,h*.38,B);}
  else if(s===8){c.beginPath();c.rect(-W*.82,-h*.2,W*1.64,h*.2);fillOL(c,'#3b3f55',lw);c.beginPath();c.rect(-W*.78,-h*.84,W*1.56,h*.66);fillOL(c,B,lw);
    c.beginPath();c.rect(-W*.5,-h*.7,W,h*.34);fillOL(c,'#10202a',1.6);}
  else {const fl=.55+.45*Math.sin(t*.4);ell(-W*.7,-h*.55,W*.7,h*.46*fl,A);ell(W*.7,-h*.55,W*.7,h*.46*fl,A);ell(0,-h*.5+bob*.5,W*.3,h*.42,B);}
  // eyes
  const er=Math.max(3,h*.12),exs=s===8?[-W*.26,W*.26]:[hx+W*.05,hx+W*.52];
  if(ey>0)exs.forEach(ex=>{ell(ex,-h*ey,er,er*1.1,'#fff');ell(ex+er*.35,-h*ey,er*.5,er*.55,OL);});
  else exs.forEach(ex=>{ell(ex,ey-h*.3,0.01,0.01,'#fff');});
  if(ey>0){c.strokeStyle=OL;c.lineWidth=1.8;c.beginPath();c.moveTo(exs[0]-er,-h*ey-er*1.3);c.lineTo(exs[0]+er,-h*ey-er*.6);c.moveTo(exs[1]+er,-h*ey-er*1.3);c.lineTo(exs[1]-er,-h*ey-er*.6);c.stroke();}
  // gadget
  const tx=hx,ty=-TOP;
  if(m===0){tri(tx-W*.55,ty+4,tx-W*.4,ty-9,tx-W*.15,ty+3,'#f3ead2');tri(tx+W*.15,ty+3,tx+W*.4,ty-9,tx+W*.55,ty+4,'#f3ead2');}
  else if(m===1){line(tx,ty+3,tx+3,ty-11,OL,2);ell(tx+3,ty-12,3.4,3.4,A);}
  else if(m===2){c.beginPath();c.moveTo(tx-W*.45,ty+4);c.lineTo(tx-W*.45,ty-7);c.lineTo(tx-W*.22,ty);c.lineTo(tx,ty-9);c.lineTo(tx+W*.22,ty);c.lineTo(tx+W*.45,ty-7);c.lineTo(tx+W*.45,ty+4);c.closePath();fillOL(c,'#ffd84a',1.8);}
  else if(m===3&&ey>0){ell(exs[0],-h*ey,er*1.5,er*1.5,'#14121c');line(exs[0]-er*1.5,-h*ey,tx-W,-h*ey-6,'#14121c',2);}
  else if(m===4){c.beginPath();c.ellipse(tx,ty+4,W*.62,h*.22,0,Math.PI,0);c.closePath();fillOL(c,A,1.8);c.fillStyle=A;c.fillRect(tx,ty+2,W*.95,3);c.strokeRect(tx,ty+2,W*.95,3);}
  else if(m===5){c.beginPath();c.rect(tx-W*.8,-h*.42,W*1.6,5);fillOL(c,A,1.6);tri(tx-W*.7,-h*.38,tx-W*1.1,-h*.2,tx-W*.5,-h*.28,A);}
  else if(m===6){for(let i=-1;i<=1;i++)tri(tx+i*W*.4-4,ty+3,tx+i*W*.4,ty-8,tx+i*W*.4+4,ty+3,D);}
  else if(m===7){const f=Math.sin(t*.5)*3;ell(tx-W*.95,-h*.6+f,4,7,'#fff');ell(tx+W*.95,-h*.6-f,4,7,'#fff');}
  else if(m===8){tri(-W*.5,-h*.16,0,-h*.06,-W*.5,-h*.0,'#e63946');tri(W*.5,-h*.16,0,-h*.06,W*.5,0,'#e63946');ell(0,-h*.08,2.6,2.6,'#ffd84a');}
  else if(m===9&&ey>0){exs.forEach(ex=>{c.strokeStyle='#ffd84a';c.lineWidth=2.6;c.beginPath();c.arc(ex,-h*ey,er*1.5,0,7);c.stroke();});line(exs[0]-er*1.5,-h*ey,tx-W,-h*ey-2,'#ffd84a',2);}
  c.restore();
}
function drawCrit(en){const cx=en.x-cam+en.w/2,by=en.y+en.h+2;
  drawCritArt(ctx,en.v,cx,by,en.w*1.3,en.h*1.25,en.dir,en.tm);}
function critSpawnV(r,ground,n){return Math.floor(r(n)*20)*5+(ground?[0,1,3][Math.floor(r(n+1)*3)]:2+2*Math.floor(r(n+1)*2));}
const _kill2=killEnemy;
killEnemy=function(en){
  if(en.t==='crit'){if(en.dead)return;en.dead=true;sfx.stomp();const I=critInfo(en.v);burst(en.x+en.w/2,en.y+en.h/2,I.body,12,4);burst(en.x+en.w/2,en.y+en.h/2,I.acc,6,3);say(en.x-6,en.y-8,CSAY[en.v%10],'#fff');return;}
  _kill2(en);
};

/* ================= KITTY TEMPLE RUN ================= */
const THOR=168, TPY=382, TFOC=300, TLW=118;
function tpGen(i){
  const w=Math.floor(i/10),k=i%10,R=rngOf(i*7919+13),diff=i/99;
  const len=17000+i*300,obs=[];let z=1500,last=-1,fishN=0,nipZ=3200+R()*1500,heartZ=2600+R()*1200;
  const maxP=Math.min(10,4+Math.floor(i/11)+(k>=5?1:0));
  const fl=(l,z0,n,h)=>{for(let j=0;j<n;j++){obs.push({k:'fish',l,z:z0+j*55,h:h==null?14:h});fishN++;}};
  const fa=(l,z0,n)=>{for(let j=0;j<n;j++){obs.push({k:'fish',l,z:z0+j*45,h:14+Math.sin(j/(n-1)*Math.PI)*70});fishN++;}};
  while(z<len-1800){
    let p=Math.floor(R()*maxP);if(p===last)p=(p+1+Math.floor(R()*(maxP-1)))%maxP;last=p;
    const lane=Math.floor(R()*3)-1,open=Math.floor(R()*3)-1,o2=[-1,0,1].filter(x=>x!==open),gap=Math.round(350-diff*80+R()*80);let ext=0;
    if(p===0){obs.push({k:'bar',l:lane,z});fl(lane===0?1:-lane,z-60,4);}
    else if(p===1){o2.forEach(l=>obs.push({k:'bar',l,z}));fl(open,z-30,3);}
    else if(p===2){obs.push({k:'beam',l:0,z});fl(open,z-40,3,12);}
    else if(p===3){obs.push({k:'pit',l:0,z,zl:80});fa(open,z-45,5);}
    else if(p===4){o2.forEach(l=>obs.push({k:'pillar',l,z}));obs.push({k:'crit',l:open,z:z+80,v:critSpawnV(R,true,5),vz:1.8});}
    else if(p===5){obs.push({k:'saw',l:0,z,ph:R()*6});fa(-1,z+40,3);}
    else if(p===6){o2.forEach(l=>obs.push({k:'fire',l,z}));obs.push({k:'fire',l:open,z:z+170});obs.push({k:'fire',l:o2[0],z:z+170});ext=170;}
    else if(p===7){obs.push({k:'boulder',l:lane,z:z+300,vz:3.6});fl(-lane||1,z,4);}
    else if(p===8){o2.forEach((l,j)=>obs.push({k:'crit',l,z:z+j*110,v:critSpawnV(R,j%2===0,7+j*2),vz:1.4}));}
    else {const seq=[open,-open||1,0,open];seq.forEach((l,j)=>{obs.push({k:'pillar',l,z:z+j*190});});ext=190*3;}
    if(R()<0.15+diff*0.25)obs.push({k:'crit',l:Math.floor(R()*3)-1,z:z+gap*.55+ext,v:critSpawnV(R,R()<.5,11),vz:1.2});
    if(R()<0.3){fl(Math.floor(R()*3)-1,z+gap*.3+ext,3);}
    if(z>nipZ){obs.push({k:'nip',l:Math.floor(R()*3)-1,z:z+gap*.5+ext});nipZ+=4500+R()*2500;}
    if(z>heartZ){obs.push({k:'heart',l:Math.floor(R()*3)-1,z:z+gap*.5+ext});heartZ+=3800+R()*2000;}
    z+=gap+ext;
  }
  return {len,obs,fishN,spd:5.8+i*0.03,w,k,curve:(k%3===0?0.25:k%3===1?0.7:1),ph:R()*6,dark:k%4===1,rain:k%5===2,boss:k===9};
}
function projT(l,d){const T=TP,s=TFOC/(d+TFOC);return {s,x:400+T.curve*T.cv*Math.pow(1-s,1.5)*170+l*TLW*s,y:THOR+(TPY-THOR)*s};}
function startTemple(i){
  MODE='temple';TI=i=Math.max(0,Math.min(99,i));audioInit();
  const G=tpGen(i);
  TP={i,w:G.w,k:G.k,G,cz:0,spd:G.spd,base:G.spd,pl:0,tl:0,jy:0,jv:0,sl:0,inv:0,hp:3,fish:0,t:0,parts:[],txt:[],shake:0,nip:0,slow:0,flash:0,cv:0,over:null,msgd:0,obs:G.obs.map(o=>Object.assign({},o)),face:1,dist:0,stomps:0,wasL:0,wasR:0,curve:G.curve};
  state='temple';
  ['menu','msg','gm'].forEach(x=>$(x).classList.add('hide'));
}
function tpPart(x,y,col,n,sp){for(let q=0;q<n;q++){const a=Math.random()*6.28,v=(Math.random()*.7+.3)*(sp||3);TP.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1.2,l:30,m:30,c:col});}}
function tpSay(x,y,s,c){TP.txt.push({x,y,s,c:c||'#fff',t:0});}
function tpHit(o,nm){
  const T=TP;if(T.inv>0||T.over)return;
  if(T.nip>0){o.dead=true;tpPart(400+T.pl*TLW,TPY-40,'#ffd84a',14,5);tpSay(400+T.pl*TLW,TPY-90,'SMASH!','#ffd84a');try{sfx.stomp();}catch(_){}return;}
  T.hp--;T.inv=85;T.slow=45;T.shake=10;T.flash=10;T.spd*=.55;try{sfx.hurt();}catch(_){}buzz&&buzz(60);
  tpPart(400+T.pl*TLW,TPY-40,'#ff4d6d',14,4);tpSay(400+T.pl*TLW,TPY-100,nm||'OUCH!','#ff4d6d');
  if(T.hp<=0){T.over='dead';T.msgd=0;try{sfx.lose();}catch(_){}}
}
function tpTick(){
  const T=TP;if(!T)return;T.t++;
  for(const q of T.parts){q.x+=q.vx;q.y+=q.vy;q.vy+=.2;q.l--;}T.parts=T.parts.filter(q=>q.l>0);
  for(const q of T.txt)q.t++;T.txt=T.txt.filter(q=>q.t<55);
  if(T.shake>0)T.shake*=.84;if(T.flash>0)T.flash--;
  if(T.over){T.msgd++;
    if(T.msgd===50){if(T.over==='dead')showMsg('Caught! 🐕','The big dog got you in '+tpName(T.i)+'.\n🐟 '+T.fish+' fish  ·  '+Math.floor(T.cz/100)+' m',[['Try again',()=>startTemple(T.i),'on'],['Map',()=>openGM('temple')],['Menu',showMenu]]);}
    return;}
  T.cv+=((Math.sin(T.cz*.0006+T.G.ph)*T.curve)-T.cv)*.03;
  // input
  let sw=SWIPE;SWIPE=null;
  if(T.t>45){
    if((keys.l&&!T.wasL)||sw==='l')T.tl=Math.max(-1,T.tl-1);
    if((keys.r&&!T.wasR)||sw==='r')T.tl=Math.min(1,T.tl+1);
    if(jPress||sw==='u'){jPress=0;if(T.jy<=.5){T.jv=10.6;T.sl=0;try{tone(520,.12,'square',.04,300);}catch(_){}}}
    if(aPress||sw==='d'){aPress=0;if(T.jy>.5)T.jv=-13;else T.sl=36;}
  }else{jPress=0;aPress=0;}
  T.wasL=keys.l;T.wasR=keys.r;
  T.pl+=(T.tl-T.pl)*.28;
  if(T.jy>0||T.jv>0){T.jy+=T.jv;T.jv-=.56;if(T.jy<=0){T.jy=0;T.jv=0;}}
  if(T.sl>0)T.sl--;
  if(T.inv>0)T.inv--;if(T.nip>0)T.nip--;if(T.slow>0)T.slow--;
  if(T.t<60)return;
  const tgt=T.base*(T.nip>0?1.5:1)*(T.slow>0?.8:1);T.spd+=(tgt-T.spd)*.05;
  T.cz+=T.spd;
  const dz0=T.spd+16;
  for(const o of T.obs){
    if(o.dead)continue;
    if(o.vz)o.z-=o.vz;
    if(o.k==='saw')o.lp=Math.sin(T.t*.045+o.ph)*1.15;
    const dz=o.z-T.cz;
    if(dz<-90||dz>dz0+20)continue;
    const ol=o.k==='saw'?o.lp:o.l,near=Math.abs(ol-T.pl)<.58||o.all;
    if(o.k==='fish'){if(near&&Math.abs(dz)<24&&Math.abs(T.jy-o.h)<46){o.dead=true;T.fish++;try{sfx.coin();}catch(_){}tpPart(400+T.pl*TLW,TPY-T.jy-40,'#ffd84a',5,2.4);}continue;}
    if(o.k==='heart'){if(near&&Math.abs(dz)<28){o.dead=true;if(T.hp<3){T.hp++;tpSay(400+T.pl*TLW,TPY-110,'+♥','#ff77b7');}else T.fish+=3;try{sfx.check();}catch(_){}}continue;}
    if(o.k==='nip'){if(near&&Math.abs(dz)<28){o.dead=true;T.nip=300;try{sfx.check();}catch(_){}tpSay(400+T.pl*TLW,TPY-110,'CATNIP ZOOM!','#c08bff');}continue;}
    if(o.hit)continue;
    if(o.k==='beam'){if(Math.abs(dz)<dz0&&dz>-12&&T.sl<=0&&T.jy<76){o.hit=true;tpHit(o,'BONK!');}continue;}
    if(o.k==='pit'){if(T.cz>=o.z&&T.cz<=o.z+o.zl-10&&T.jy<6){o.hit=true;tpHit(o,'WHOA!');if(T.hp>0&&!T.nip){T.cz=o.z+o.zl+14;}}continue;}
    if(!near||dz>dz0||dz<-10)continue;
    if(o.k==='pillar'){o.hit=true;tpHit(o,'THUD!');}
    else if(o.k==='bar'||o.k==='fire'){if(T.jy<30){o.hit=true;tpHit(o,o.k==='fire'?'HOT!':'TRIP!');}}
    else if(o.k==='saw'){if(T.jy<30){o.hit=true;tpHit(o,'ZZZT!');}}
    else if(o.k==='boulder'){if(T.jy<26){o.hit=true;tpHit(o,'ROLLED!');}}
    else if(o.k==='crit'){
      if(T.jv<0&&T.jy>=14&&T.jy<70){o.dead=true;T.stomps++;T.fish+=2;T.jv=7.5;try{sfx.stomp();}catch(_){}const I=critInfo(o.v);tpPart(400+T.pl*TLW,TPY-T.jy,I.body,10,4);tpSay(400+T.pl*TLW,TPY-T.jy-70,CSAY[o.v%10]+' +2🐟','#fff');}
      else if(T.jy<30){o.hit=true;tpHit(o,'CHOMP!');}
    }
  }
  if(T.cz>=T.G.len){T.over='win';T.msgd=0;try{sfx.win();}catch(_){}
    const st=T.G.fishN?T.fish/T.G.fishN:1,stars=st>=.8?3:st>=.5?2:1;const sk=PR.temple.st;sk[T.i]=Math.max(sk[T.i]||0,stars);PR.temple.at=Math.max(PR.temple.at,T.i+1);savePR();T.stars=stars;
    tpWin();}
}
function tpWin(){
  const T=TP;state='tpwin';
  setTimeout(()=>{if(state!=='tpwin'||TP!==T)return;
    startCut(()=>{state='tpwin';const next=T.i<99;const b=[];if(next)b.push(['Next temple ▶',()=>startTemple(T.i+1),'on']);b.push(['Replay',()=>startTemple(T.i)],['Map',()=>openGM('temple')],['Menu',showMenu]);
      showMsg('Temple cleared! 🏛️',tpName(T.i)+'\n🐟 '+T.fish+' / '+T.G.fishN+'   '+'★'.repeat(T.stars)+'☆'.repeat(3-T.stars),b);},{salt:T.i+3,title:'TEMPLE CLEARED!',big:T.k===9});},700);
}
/* ----- drawing ----- */
function tpFish(c,x,y,s){c.save();c.translate(x,y);c.scale(s*1.3,s*1.3);c.beginPath();c.ellipse(0,0,9,5,0,0,7);fillOL(c,'#ffb23a',1.6);c.beginPath();c.moveTo(-8,0);c.lineTo(-15,-5);c.lineTo(-15,5);c.closePath();fillOL(c,'#ffb23a',1.6);c.fillStyle=OL;c.fillRect(4,-2,2,2);c.restore();}
function tpProp(c,w,x,y,s,j){
  const t=WT[w],h=(60+hsh(j*2.3)*50)*s,k=s;c.save();c.lineJoin='round';
  if(w===0||w===5){c.fillStyle=w?'#2a1c14':'#6b4a2a';c.fillRect(x-5*k,y-h*.6,10*k,h*.6);c.beginPath();c.arc(x,y-h*.7,26*k,0,7);fillOL(c,w?'#1b4a30':'#2f9a45',2*k);c.beginPath();c.arc(x+12*k,y-h*.55,16*k,0,7);fillOL(c,w?'#235a3a':'#3aa850',2*k);if(w){c.fillStyle=t.acc;c.globalAlpha=.5+.5*Math.sin(ptm()*.1+j);c.fillRect(x-12*k,y-h*.9,3*k,3*k);c.globalAlpha=1;}}
  else if(w===1){c.beginPath();c.rect(x-7*k,y-h,14*k,h);fillOL(c,'#3f9a4a',2*k);c.beginPath();c.rect(x-20*k,y-h*.6,13*k,7*k);fillOL(c,'#3f9a4a',2*k);c.beginPath();c.rect(x-20*k,y-h*.6-18*k,7*k,25*k);fillOL(c,'#3f9a4a',2*k);}
  else if(w===2||w===8){c.beginPath();c.moveTo(x-14*k,y);c.lineTo(x,y-h*1.05);c.lineTo(x+14*k,y);c.closePath();fillOL(c,w===2?'#bfe6ff':'#4a5a8a',2*k);if(w===8){c.fillStyle=t.acc;c.globalAlpha=.5+.5*Math.sin(ptm()*.12+j);c.fillRect(x-2*k,y-h*1.05,4*k,5*k);c.globalAlpha=1;}}
  else if(w===3){c.beginPath();c.moveTo(x-22*k,y);c.lineTo(x-8*k,y-h*.8);c.lineTo(x+6*k,y-h*.6);c.lineTo(x+22*k,y);c.closePath();fillOL(c,'#3a2626',2*k);c.fillStyle=t.acc;c.fillRect(x-4*k,y-h*.7,8*k,6*k);}
  else if(w===4){c.fillStyle='#f4f4f4';c.fillRect(x-3*k,y-h*.8,6*k,h*.8);c.beginPath();c.arc(x,y-h*.9,20*k,0,7);fillOL(c,['#ff4f9a','#ffa63a','#6ee7ff','#9fe870'][j%4],2*k);}
  else if(w===6){c.beginPath();c.moveTo(x-14*k,y);c.lineTo(x-14*k,y-h*.7);c.arc(x,y-h*.7,14*k,Math.PI,0);c.lineTo(x+14*k,y);c.closePath();fillOL(c,'#8a7aa0',2*k);c.fillStyle='#4a3a60';c.fillRect(x-2*k,y-h*.85,4*k,16*k);c.fillRect(x-7*k,y-h*.75,14*k,4*k);}
  else if(w===7){[[0,0,22],[-18,6,16],[18,6,16]].forEach(a=>{c.beginPath();c.arc(x+a[0]*k,y-h*.4+a[1]*k,a[2]*k,0,7);fillOL(c,'#ffffff',2*k);});}
  else {c.strokeStyle=['#ff6f61','#ff9ad0','#ffb43a'][j%3];c.lineWidth=6*k;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.lineTo(x,y-h*.6);c.moveTo(x,y-h*.35);c.lineTo(x-18*k,y-h*.75);c.moveTo(x,y-h*.45);c.lineTo(x+16*k,y-h*.85);c.stroke();}
  c.restore();
}
function tpObj(c,o,d){
  const T=TP,w=T.w,t=WT[w],ol=o.k==='saw'?(o.lp||0):o.l,p=projT(ol,d),s=p.s,x=p.x,y=p.y,lw=TLW*s;
  c.save();c.lineJoin='round';
  if(o.k==='fish'){tpFish(c,x,y-(o.h+8)*s,s);}
  else if(o.k==='heart'){c.font='900 '+Math.round(40*s)+'px system-ui';c.textAlign='center';c.fillStyle='#ff4d6d';c.strokeStyle=OL;c.lineWidth=3*s;const hy=y-(26+Math.sin(T.t*.1)*4)*s;c.strokeText('♥',x,hy);c.fillText('♥',x,hy);}
  else if(o.k==='nip'){glow(c,x,y-26*s,50*s,'192,139,255',.6);c.beginPath();c.arc(x,y-24*s,13*s,0,7);fillOL(c,'#9fe870',2*s);c.fillStyle='#2b7a3a';c.fillRect(x-1.5*s,y-40*s,3*s,16*s);}
  else if(o.k==='bar'||o.k==='fire'){
    const bw=lw*.82,bh=34*s;c.beginPath();c.rect(x-bw/2,y-bh,bw,bh);fillOL(c,t.acc,2.2*s);c.fillStyle=shd(t.acc,-.35);for(let i=0;i<4;i++)c.fillRect(x-bw/2+bw*(i*.25+.02),y-bh,bw*.12,bh);
    if(o.k==='fire'){for(let i=0;i<3;i++){const fx=x-bw*.3+i*bw*.3,fh=(20+Math.sin(T.t*.3+i+o.z)*8)*s;c.beginPath();c.moveTo(fx-7*s,y-bh);c.quadraticCurveTo(fx,y-bh-fh*1.4,fx+7*s,y-bh);c.closePath();fillOL(c,i%2?'#ffd84a':'#ff7a1c',1.4*s);}}}
  else if(o.k==='pillar'){const pw=lw*.62,ph=118*s;c.beginPath();c.rect(x-pw/2,y-ph,pw,ph);fillOL(c,shd(t.wall,.1),2.4*s);c.fillStyle=shd(t.wall,-.3);c.fillRect(x+pw*.1,y-ph,pw*.4,ph);c.beginPath();c.rect(x-pw*.62,y-ph-10*s,pw*1.24,12*s);fillOL(c,t.acc,2.2*s);c.beginPath();c.rect(x-pw*.62,y-6*s,pw*1.24,8*s);fillOL(c,t.acc,2.2*s);}
  else if(o.k==='beam'){
    [-1.5,1.5].forEach(l=>{const px=x+l*TLW*s,pw=14*s;c.beginPath();c.rect(px-pw/2,y-84*s,pw,84*s);fillOL(c,shd(t.wall,.1),2*s);});
    c.beginPath();c.rect(x-1.55*TLW*s,y-76*s,3.1*TLW*s,30*s);fillOL(c,t.acc,2.4*s);c.fillStyle=shd(t.acc,-.35);for(let i=0;i<10;i++)c.fillRect(x-1.55*TLW*s+i*.31*TLW*s,y-76*s,.14*TLW*s,30*s);}
  else if(o.k==='pit'){const p2=projT(0,d+o.zl),h2=p2.y;c.fillStyle='#0b0814';const y2=Math.min(h2,y);c.beginPath();c.moveTo(x-1.5*TLW*s,y);c.lineTo(x+1.5*TLW*s,y);c.lineTo(p2.x+1.5*TLW*p2.s,y2<y?y2:y-1);c.lineTo(p2.x-1.5*TLW*p2.s,y2<y?y2:y-1);c.closePath();c.fill();c.strokeStyle='rgba(255,120,60,.55)';c.lineWidth=3*s;c.beginPath();c.moveTo(x-1.5*TLW*s,y);c.lineTo(x+1.5*TLW*s,y);c.stroke();}
  else if(o.k==='saw'){const r=26*s;c.translate(x,y-r-6*s);c.rotate(T.t*.25);c.beginPath();for(let i=0;i<16;i++){const a=i/16*6.283,rr2=i%2?r*.8:r*1.08;c.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2);}c.closePath();fillOL(c,'#c9d3e0',2.2*s);c.beginPath();c.arc(0,0,r*.28,0,7);fillOL(c,'#7a8798',1.6*s);}
  else if(o.k==='boulder'){const r=30*s;c.translate(x,y-r);c.rotate(-T.t*.18);c.beginPath();c.arc(0,0,r,0,7);fillOL(c,'#8a7a68',2.6*s);c.fillStyle='#6a5c4c';[[-.4,-.3,.22],[.35,.2,.28],[-.1,.5,.16]].forEach(a=>{c.beginPath();c.arc(a[0]*r,a[1]*r,a[2]*r,0,7);c.fill();});}
  else if(o.k==='crit'){drawCritArt(c,o.v,x,y,28*s*1.9,26*s*1.9,-1,T.t+o.z*.1);}
  c.restore();
}
function tpCatBack(c,x,y,sc,t,sl){
  const cat=CATS[sel],B=cat.body,dog=!!cat.dog,run=Math.sin(t*.45),fat=.8+cat.fat*.35;
  c.save();c.translate(x,y);c.scale(sc,sc);c.lineJoin='round';c.lineCap='round';
  if(sl>0)c.scale(1.25,.58);
  const ell=(a,b,rx,ry,f,lw)=>{c.beginPath();c.ellipse(a,b,rx,ry,0,0,7);fillOL(c,f,lw||2);};
  // tail
  c.strokeStyle=OL;c.lineWidth=11;c.beginPath();c.moveTo(0,-26);c.quadraticCurveTo(26+Math.sin(t*.2)*6,-30,dog?10:22,-62);c.stroke();
  c.strokeStyle=B;c.lineWidth=7;c.beginPath();c.moveTo(0,-26);c.quadraticCurveTo(26+Math.sin(t*.2)*6,-30,dog?10:22,-62);c.stroke();
  // legs
  const lf=cat.tux?'#f5f5f5':B;ell(-11*fat,-4-Math.max(0,run)*7,8,7,lf);ell(11*fat,-4-Math.max(0,-run)*7,8,7,lf);
  // body
  ell(0,-28,20*fat,26,B,2.4);
  if(cat.stripe){c.strokeStyle=cat.stripe;c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-10*fat,-34+i*9);c.lineTo(10*fat,-34+i*9);c.stroke();}}
  if(dog){ell(-8,-30,9,12,cat.patch||'#7a4a2a',1.8);}
  // head
  ell(0,-58,16,14.5,B,2.4);
  if(dog){ell(-17,-52,6,12,cat.patch||'#7a4a2a',2);ell(17,-52,6,12,cat.patch||'#7a4a2a',2);}
  else{[-1,1].forEach(sg=>{c.beginPath();c.moveTo(sg*5,-68);c.lineTo(sg*13,-84);c.lineTo(sg*18,-64);c.closePath();fillOL(c,B,2.2);});}
  if(cat.tux){c.fillStyle='#f5f5f5';c.fillRect(-2.2,-46,4.4,6);}
  c.fillStyle=cat.collar||'#e63946';c.fillRect(-12,-48,24,5);c.strokeStyle=OL;c.lineWidth=1.4;c.strokeRect(-12,-48,24,5);
  if(cat.bow){tri2(c,-9,-45,-2,-45,-9,-39,'#e63946');tri2(c,9,-45,2,-45,9,-39,'#e63946');}
  c.restore();
}
function tri2(c,x1,y1,x2,y2,x3,y3,f){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineTo(x3,y3);c.closePath();fillOL(c,f,1.5);}
function drawTemple(){
  const T=TP,c=ctx,w=T.w,t=WT[w];
  c.save();
  if(T.shake>.5)c.translate((Math.random()-.5)*T.shake,(Math.random()-.5)*T.shake);
  const g=c.createLinearGradient(0,0,0,THOR+10);g.addColorStop(0,t.sky[0]);g.addColorStop(1,t.sky[1]);c.fillStyle=g;c.fillRect(-20,-20,840,THOR+40);
  // sun/moon & mountains
  const dk=w===5||w===6||w===8||w===3;
  if(w===8){for(let i=0;i<50;i++){c.fillStyle='rgba(255,255,255,'+(.3+.5*hsh(i*3.1))+')';c.fillRect(hsh(i*1.7)*800,hsh(i*2.9)*THOR*.9,2,2);}}
  c.fillStyle=dk?'#e8e4ff':'#fff7c2';c.beginPath();c.arc(640-T.cv*40,60,26,0,7);c.fill();
  c.fillStyle=shd(t.side,-.12);const off=-T.cv*70+T.cz*.004%160;
  for(let i=-1;i<7;i++){const mx=i*160+off%160,mh=50+hsh(i*5.3+w)*60;c.beginPath();c.moveTo(mx-90,THOR+1);c.lineTo(mx,THOR-mh);c.lineTo(mx+90,THOR+1);c.fill();}
  // road scanlines
  for(let y=THOR;y<460;y+=2){
    const s=(y-THOR)/(TPY-THOR);if(s<.015)continue;
    const d=TFOC/s-TFOC,zw=T.cz+d,st=Math.floor(zw/110)%2;
    c.fillStyle=st?t.side:t.side2;c.fillRect(-20,y,840,2.6);
    const sh=T.curve*T.cv*Math.pow(1-Math.min(1,s),1.5)*170,rw=1.55*TLW*s,x0=400+sh;
    c.fillStyle=st?t.r1:t.r2;c.fillRect(x0-rw,y,rw*2,2.6);
    c.fillStyle=shd(t.r2,-.4);c.fillRect(x0-rw-4*s,y,4*s+1,2.6);c.fillRect(x0+rw,y,4*s+1,2.6);
    if(st){c.fillStyle='rgba(0,0,0,.16)';c.fillRect(x0-.5*TLW*s-s,y,Math.max(1,2*s),2.6);c.fillRect(x0+.5*TLW*s-s,y,Math.max(1,2*s),2.6);}
  }
  // finish gate marker & collect drawables
  const L=[];
  for(let j=Math.floor(T.cz/170)+1;j<Math.floor(T.cz/170)+11;j++){const d=j*170-T.cz;if(d<-40)continue;L.push({d,sc:1,j});}
  for(const o of T.obs){if(o.dead)continue;const d=o.z-T.cz;if(d>-70&&d<1750)L.push({d,o});}
  const gd=T.G.len-T.cz;if(gd>-70&&gd<1750)L.push({d:gd,gate:1});
  L.sort((a,b)=>b.d-a.d);
  const pdone=[];let pd=false;
  for(const it of L){
    if(!pd&&it.d<=0){pd=true;drawTpPlayer();}
    if(it.gate){const p=projT(0,it.d);c.fillStyle='#fff';c.fillRect(p.x-1.7*TLW*p.s,p.y-120*p.s,3.4*TLW*p.s,26*p.s);for(let i=0;i<12;i++){c.fillStyle=i%2?'#17121f':'#fff';c.fillRect(p.x-1.7*TLW*p.s+i*.283*TLW*p.s,p.y-120*p.s,.283*TLW*p.s,13*p.s);c.fillStyle=i%2?'#fff':'#17121f';c.fillRect(p.x-1.7*TLW*p.s+i*.283*TLW*p.s,p.y-107*p.s,.283*TLW*p.s,13*p.s);}
      c.fillStyle='#b9b9c8';c.fillRect(p.x-1.75*TLW*p.s,p.y-120*p.s,8*p.s,120*p.s);c.fillRect(p.x+1.75*TLW*p.s-8*p.s,p.y-120*p.s,8*p.s,120*p.s);continue;}
    if(it.sc){const p=projT(0,it.d),side=it.j%2?1:-1,lane=side*(2.3+hsh(it.j*3.1)*1.5),pp=projT(lane,it.d);tpProp(c,w,pp.x,pp.y,pp.s*1.6,it.j);continue;}
    tpObj(c,it.o,it.d);
  }
  if(!pd)drawTpPlayer();
  for(const q of T.parts){c.globalAlpha=Math.max(0,q.l/q.m);c.fillStyle=q.c;c.fillRect(q.x-2,q.y-2,5,5);}c.globalAlpha=1;
  c.font='bold 15px system-ui';c.textAlign='center';
  for(const q of T.txt){c.globalAlpha=1-q.t/55;c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.65)';c.strokeText(q.s,q.x,q.y-q.t*.9);c.fillStyle=q.c;c.fillText(q.s,q.x,q.y-q.t*.9);}c.globalAlpha=1;
  c.restore();
  // dark / rain / big dog
  if(T.G.dark){const vg=c.createRadialGradient(400,300,120,400,300,470);vg.addColorStop(0,'rgba(0,0,20,0)');vg.addColorStop(1,'rgba(0,0,20,.72)');c.fillStyle=vg;c.fillRect(0,0,800,448);}
  if(T.G.rain){c.strokeStyle='rgba(200,230,255,.55)';c.lineWidth=1.4;for(let i=0;i<46;i++){const rx=(hsh(i*7.1)*900+T.t*3)%860-30,ry=(hsh(i*3.3)*500+T.t*17)%470;c.beginPath();c.moveTo(rx,ry);c.lineTo(rx-5,ry+14);c.stroke();}}
  if(T.hp<3||T.G.boss)drawBigDog();
  if(T.flash>0){c.fillStyle='rgba(255,60,80,'+(T.flash/24)+')';c.fillRect(0,0,800,448);}
  if(T.nip>0){c.strokeStyle='rgba(192,139,255,.5)';c.lineWidth=10;c.strokeRect(5,5,790,438);}
  drawTpHUD();
}
function drawTpPlayer(){
  const T=TP,c=ctx,x=400+T.pl*TLW,gy=TPY;
  c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(x,gy+2,30-T.jy*.12,8,0,0,7);c.fill();
  if(T.inv>0&&Math.floor(T.inv/4)%2&&!T.over)return;
  if(T.nip>0)glow(c,x,gy-T.jy-40,80,'192,139,255',.5);
  const lean=(T.tl-T.pl)*.18;c.save();c.translate(x,gy-T.jy);c.rotate(lean);c.translate(-x,-(gy-T.jy));
  tpCatBack(c,x,gy-T.jy,1.45,T.t+(T.jy>0?0:0),T.sl);c.restore();
}
function drawBigDog(){
  const c=ctx,T=TP,k=T.hp<=1?.8:T.hp<=2?.6:.5,bob=Math.sin(T.t*.15)*5,y=486+bob-(T.hp<=1?40:0)-(T.over==='dead'?50:0);
  c.save();c.translate(400,y);c.scale(k*1.4,k*1.4);c.beginPath();c.ellipse(0,0,150,86,0,0,7);fillOL(c,'#3d2f3a',4);
  [-1,1].forEach(sg=>{c.beginPath();c.moveTo(sg*100,-50);c.lineTo(sg*140,-120);c.lineTo(sg*55,-76);c.closePath();fillOL(c,'#2f2430',4);c.beginPath();c.arc(sg*58,-30,15,0,7);fillOL(c,'#fff',2.5);c.beginPath();c.arc(sg*58+Math.sin(T.t*.1)*3,-28,7,0,7);c.fillStyle='#e63946';c.fill();});
  c.beginPath();c.moveTo(-60,20);for(let i=0;i<7;i++){c.lineTo(-60+i*20+10,i%2?20:50);}c.lineTo(60,20);c.closePath();fillOL(c,'#fff',2);c.restore();
}
function drawTpHUD(){
  const T=TP,c=ctx;
  c.font='900 20px system-ui';c.textAlign='left';
  for(let i=0;i<3;i++){c.fillStyle=i<T.hp?'#ff4d6d':'rgba(255,255,255,.28)';c.strokeStyle=OL;c.lineWidth=3;c.strokeText('♥',14+i*26,32);c.fillText('♥',14+i*26,32);}
  c.textAlign='right';c.fillStyle='#ffd84a';c.strokeText('🐟 '+T.fish,786,32);c.fillText('🐟 '+T.fish,786,32);
  const pw=300,px=250,pr=Math.min(1,T.cz/T.G.len);c.fillStyle='rgba(23,18,31,.7)';c.fillRect(px-3,12,pw+6,16);c.fillStyle='#46e0a0';c.fillRect(px,15,pw*pr,10);c.fillStyle='#fff';c.fillRect(px+pw*pr-3,10,6,20);
  c.textAlign='center';c.font='800 12px system-ui';c.fillStyle='#fff';c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=3;c.strokeText(tpName(T.i),400,48);c.fillText(tpName(T.i),400,48);
  if(T.t<60){const n=3-Math.floor(T.t/20);c.font='900 90px system-ui';c.lineWidth=8;c.strokeStyle=OL;c.strokeText(String(n),400,230);c.fillStyle='#ffd84a';c.fillText(String(n),400,230);}
  else if(T.t<95){c.font='900 70px system-ui';c.lineWidth=8;c.strokeStyle=OL;c.strokeText('RUN!',400,230);c.fillStyle='#fff';c.fillText('RUN!',400,230);}
  if(T.t<200){c.font='700 12px system-ui';c.fillStyle='rgba(255,255,255,.9)';c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=3;const s='◀ ▶ lane  ·  ▲ jump  ·  ▼ slide  (or swipe)';c.strokeText(s,400,66);c.fillText(s,400,66);}
}

/* ================= KITTY MAZE ================= */
const DKC=['#e63946','#3a86ff','#2ec27e'];
function mzGen(i){
  const w=Math.floor(i/10),k=i%10,R=rngOf(i*104729+7),diff=i/99;
  const cw=6+w+(k%3===0?1:0)+(k===9?1:0),ch=5+Math.floor(i/14)+(k%2),W=cw*2+1,H=ch*2+1;
  const g=Array.from({length:H},()=>Array(W).fill('#'));
  const vis=Array.from({length:ch},()=>Array(cw).fill(false)),st=[[0,0]];vis[0][0]=true;g[1][1]=' ';
  while(st.length){
    const [cx,cy]=st[st.length-1],nb=[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>{const nx=cx+dx,ny=cy+dy;return nx>=0&&ny>=0&&nx<cw&&ny<ch&&!vis[ny][nx];});
    if(!nb.length){st.pop();continue;}
    const [dx,dy]=nb[Math.floor(R()*nb.length)],nx=cx+dx,ny=cy+dy;vis[ny][nx]=true;
    g[cy*2+1+dy][cx*2+1+dx]=' ';g[ny*2+1][nx*2+1]=' ';st.push([nx,ny]);
  }
  // braid loops
  const loops=Math.floor(cw*ch*(.05+(k%4)*.025));
  for(let n=0;n<loops;n++){const x=1+Math.floor(R()*(W-2)),y=1+Math.floor(R()*(H-2));if(g[y][x]==='#'&&((x%2===0)!==(y%2===0)))g[y][x]=' ';}
  // open rooms
  const rooms=(k>=4?1:0)+Math.floor(i/30);
  for(let n=0;n<rooms;n++){const rx=3+Math.floor(R()*(W-7)),ry=3+Math.floor(R()*(H-7));for(let y=ry;y<ry+3;y++)for(let x=rx;x<rx+3;x++)if(x>0&&y>0&&x<W-1&&y<H-1)g[y][x]=' ';}
  const open=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&g[y][x]!=='#';
  const bfs=(blocked)=>{const d=Array.from({length:H},()=>Array(W).fill(-1)),pv=Array.from({length:H},()=>Array(W).fill(null)),q=[[1,1]];d[1][1]=0;
    for(let h=0;h<q.length;h++){const [x,y]=q[h];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(open(nx,ny)&&d[ny][nx]<0&&!(blocked&&blocked.has(nx+','+ny))){d[ny][nx]=d[y][x]+1;pv[ny][nx]=[x,y];q.push([nx,ny]);}}}
    return {d,pv};};
  const b0=bfs(null);let gx=1,gy=1,gd=0;
  for(let y=1;y<H;y+=2)for(let x=1;x<W;x+=2)if(b0.d[y][x]>gd){gd=b0.d[y][x];gx=x;gy=y;}
  const path=[];for(let p=[gx,gy];p;p=b0.pv[p[1]][p[0]])path.push(p);path.reverse();
  const nbc=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].filter(([dx,dy])=>open(x+dx,y+dy)).length;
  const used=new Set(['1,1',gx+','+gy]),doors=[];
  const nd=i<9?0:Math.min(3,1+Math.floor(i/30));
  for(let j=0;j<nd;j++){
    const f=(j+1)/(nd+1)*.92;let idx=Math.floor(path.length*f),best=null;
    for(let o=0;o<12&&!best;o++)for(const sgn of [1,-1]){const q=path[idx+o*sgn];if(q&&nbc(q[0],q[1])===2&&!used.has(q[0]+','+q[1])){best=q;break;}}
    if(best){doors.push({x:best[0],y:best[1],c:doors.length,open:false});used.add(best[0]+','+best[1]);}
  }
  const keys=[];
  doors.forEach((dr,j)=>{
    const blocked=new Set(doors.filter(d=>d.c>=j).map(d=>d.x+','+d.y)),bb=bfs(blocked),cand=[];
    for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(bb.d[y][x]>4&&!used.has(x+','+y))cand.push([x,y,bb.d[y][x]+(nbc(x,y)===1?30:0)]);
    cand.sort((a,b)=>b[2]-a[2]);const q=cand[Math.floor(R()*Math.min(10,cand.length))]||cand[0];
    if(q){keys.push({x:q[0],y:q[1],c:j,got:false});used.add(q[0]+','+q[1]);}
  });
  const free=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(open(x,y)&&!used.has(x+','+y)&&b0.d[y][x]>2)free.push([x,y]);
  const take=()=>{if(!free.length)return null;const q=free.splice(Math.floor(R()*free.length),1)[0];used.add(q[0]+','+q[1]);return q;};
  const treats=[],nT=10+Math.floor(cw*ch/3.5);
  for(let n=0;n<nT;n++){const q=take();if(!q)break;const r=R();treats.push({x:q[0],y:q[1],kind:r<.5?0:r<.68?1:r<.84?2:r<.94?3:4,got:false});}
  const spikes=[],nS=2+Math.floor(cw*ch/12)+Math.floor(diff*5);
  for(let n=0;n<nS;n++){const q=take();if(q&&b0.d[q[1]][q[0]]>6)spikes.push({x:q[0],y:q[1],ph:Math.floor(R()*120)});}
  const mud=new Set();for(let n=0;n<3+w;n++){const q=take();if(!q)break;mud.add(q[0]+','+q[1]);for(const [dx,dy] of [[1,0],[0,1]])if(open(q[0]+dx,q[1]+dy)&&R()<.6)mud.add((q[0]+dx)+','+(q[1]+dy));}
  const conv=new Map();for(let n=0;n<2+Math.floor(w/2);n++){const q=take();if(!q)break;const dr=[[1,0],[-1,0],[0,1],[0,-1]][Math.floor(R()*4)];for(let m=0;m<3;m++){const x=q[0]+dr[0]*m,y=q[1]+dr[1]*m;if(open(x,y))conv.set(x+','+y,dr);}}
  const portals=[];if(i>=12){for(let n=0;n<1+Math.floor(i/45);n++){const a=take(),b=take();if(a&&b&&Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])>8)portals.push({a,b,c:n});}}
  const nips=[];for(let n=0;n<1+(i>40?1:0);n++){const q=take();if(q)nips.push({x:q[0],y:q[1],got:false});}
  const foes=[],nF=2+Math.floor(i/9)+(k===9?2:0);
  for(let n=0;n<nF;n++){const q=take();if(!q)break;if(b0.d[q[1]][q[0]]<8)continue;foes.push({x:q[0]*TS+16,y:q[1]*TS+16,v:Math.floor(R()*100),dx:0,dy:0,sp:.55+R()*.55+diff*.35,tm:Math.floor(R()*100)});}
  return {W,H,g,gx,gy,doors,keys,treats,spikes,mud,conv,portals,nips,foes,cw,ch,w,k,pl:[]};
}
function mzSolid(M,x,y,open){
  if(x<0||y<0||x>=M.W||y>=M.H)return true;if(M.g[y][x]==='#')return true;
  for(const d of M.doors)if(d.x===x&&d.y===y&&!d.open){if(open&&MZ.keys[d.c]>0){MZ.keys[d.c]--;d.open=true;try{sfx.check();}catch(_){}mzSay(d.x*TS+16,d.y*TS,'UNLOCKED!','#ffd84a');return false;}if(open&&MZ.t-MZ.hintT>60){MZ.hintT=MZ.t;mzSay(d.x*TS+16,d.y*TS,'needs a '+['red','blue','green'][d.c]+' key','#fff');}return true;}
  return false;
}
function mzHit(M,px,py,r,open){
  for(const [dx,dy] of [[-r,-r],[r,-r],[-r,r],[r,r]])if(mzSolid(M,Math.floor((px+dx)/TS),Math.floor((py+dy)/TS),open))return true;return false;
}
function mzSay(x,y,s,c){MZ.txt.push({x,y,s,c:c||'#fff',t:0});}
function startMaze(i){
  MODE='maze';MI=i=Math.max(0,Math.min(99,i));audioInit();
  const M=mzGen(i);
  MZ={i,M,px:TS*1.5,py:TS*1.5,face:1,mv:0,hp:5,inv:60,t:0,keys:[0,0,0],score:0,got:0,nip:0,parts:[],txt:[],shake:0,over:null,msgd:0,seen:new Uint8Array(M.W*M.H),pcd:0,auto:null,hintT:-99,cam:[0,0],tt:0,sp:1.7+CATS[sel].speed*.32,slow:0};
  M.totT=M.treats.length;
  state='maze';['menu','msg','gm'].forEach(x=>$(x).classList.add('hide'));
}
function mzHurt(nm){
  const Z=MZ;if(Z.inv>0||Z.nip>0||Z.over)return;
  Z.hp--;Z.inv=100;Z.shake=8;try{sfx.hurt();}catch(_){}buzz&&buzz(50);mzSay(Z.px,Z.py-24,nm||'OUCH!','#ff4d6d');
  for(let q=0;q<12;q++){const a=Math.random()*6.28;Z.parts.push({x:Z.px,y:Z.py,vx:Math.cos(a)*3,vy:Math.sin(a)*3,l:26,m:26,c:'#ff4d6d'});}
  if(Z.hp<=0){Z.over='dead';Z.msgd=0;try{sfx.lose();}catch(_){}}
}
function mzTick(){
  const Z=MZ;if(!Z)return;Z.t++;const M=Z.M;
  for(const q of Z.parts){q.x+=q.vx;q.y+=q.vy;q.vx*=.94;q.vy*=.94;q.l--;}Z.parts=Z.parts.filter(q=>q.l>0);
  for(const q of Z.txt)q.t++;Z.txt=Z.txt.filter(q=>q.t<60);
  if(Z.shake>0)Z.shake*=.84;
  if(Z.over){Z.msgd++;if(Z.msgd===50&&Z.over==='dead')showMsg('Out of hearts! 😿',mzName(Z.i)+'\n🍰 '+Z.got+' / '+M.totT+' treats',[['Try again',()=>startMaze(Z.i),'on'],['Map',()=>openGM('maze')],['Menu',showMenu]]);return;}
  const sw=SWIPE;SWIPE=null;if(sw)Z.auto={l:[-1,0],r:[1,0],u:[0,-1],d:[0,1]}[sw];
  jPress=0;aPress=0;
  if(Z.inv>0)Z.inv--;if(Z.nip>0)Z.nip--;if(Z.pcd>0)Z.pcd--;Z.tt++;
  let ix=(keys.r?1:0)-(keys.l?1:0),iy=(keys.a?1:0)-(keys.j?1:0);
  if(ix||iy)Z.auto=null;else if(Z.auto){ix=Z.auto[0];iy=Z.auto[1];}
  const tx=Math.floor(Z.px/TS),ty=Math.floor(Z.py/TS),key=tx+','+ty;
  let sp=Z.sp*(Z.nip>0?1.5:1)*(M.mud.has(key)?.55:1);
  const R=9;let moved=false;
  if(ix&&iy){ix*=.75;iy*=.75;}
  if(ix){const nx=Z.px+ix*sp;if(!mzHit(M,nx,Z.py,R,true)){Z.px=nx;moved=true;}else{ // slide to corridor centre
      const cy=(Math.floor(Z.py/TS)+.5)*TS;if(!iy){const ny=Z.py+Math.max(-1.6,Math.min(1.6,cy-Z.py));if(!mzHit(M,Z.px,ny,R,false))Z.py=ny;}Z.auto=null;}
    Z.face=ix>0?1:-1;if(!iy){const cy=(Math.floor(Z.py/TS)+.5)*TS;Z.py+=Math.max(-1.1,Math.min(1.1,(cy-Z.py)*.25));}}
  if(iy){const ny=Z.py+iy*sp;if(!mzHit(M,Z.px,ny,R,true)){Z.py=ny;moved=true;}else{const cx=(Math.floor(Z.px/TS)+.5)*TS;if(!ix){const nx=Z.px+Math.max(-1.6,Math.min(1.6,cx-Z.px));if(!mzHit(M,nx,Z.py,R,false))Z.px=nx;}Z.auto=null;}
    if(!ix){const cx=(Math.floor(Z.px/TS)+.5)*TS;Z.px+=Math.max(-1.1,Math.min(1.1,(cx-Z.px)*.25));}}
  Z.mv=moved?Z.mv+1:0;
  const cv=M.conv.get(key);if(cv){const nx=Z.px+cv[0]*1.1,ny=Z.py+cv[1]*1.1;if(!mzHit(M,nx,Z.py,R,false))Z.px=nx;if(!mzHit(M,Z.px,ny,R,false))Z.py=ny;}
  // fog of war
  for(let y=Math.max(0,ty-4);y<=Math.min(M.H-1,ty+4);y++)for(let x=Math.max(0,tx-5);x<=Math.min(M.W-1,tx+5);x++)Z.seen[y*M.W+x]=1;
  // pickups
  const near=(x,y,d)=>Math.abs(x*TS+16-Z.px)<d&&Math.abs(y*TS+16-Z.py)<d;
  for(const q of M.treats)if(!q.got&&near(q.x,q.y,15)){q.got=true;Z.got++;const pts=[10,25,25,15,100][q.kind];Z.score+=pts;try{sfx.coin();}catch(_){}
    if(q.kind===3&&Z.hp<5){Z.hp++;mzSay(Z.px,Z.py-26,'+♥','#ff77b7');}else mzSay(Z.px,Z.py-26,'+'+pts,'#ffd84a');
    for(let n=0;n<7;n++){const a=Math.random()*6.28;Z.parts.push({x:Z.px,y:Z.py,vx:Math.cos(a)*2.2,vy:Math.sin(a)*2.2,l:20,m:20,c:'#ffd84a'});}}
  for(const q of M.keys)if(!q.got&&near(q.x,q.y,15)){q.got=true;Z.keys[q.c]++;try{sfx.check();}catch(_){}mzSay(Z.px,Z.py-26,['RED','BLUE','GREEN'][q.c]+' KEY!',DKC[q.c]);}
  for(const q of M.nips)if(!q.got&&near(q.x,q.y,16)){q.got=true;Z.nip=420;try{tone(660,.4,'triangle',.05,600);}catch(_){}mzSay(Z.px,Z.py-26,'CATNIP ZOOM!','#c08bff');}
  for(const q of M.spikes){if(q.x===tx&&q.y===ty&&((Z.t+q.ph)%120)<60&&Math.abs(q.x*TS+16-Z.px)<13&&Math.abs(q.y*TS+16-Z.py)<13)mzHurt('SPIKES!');}
  if(Z.pcd<=0)for(const p of M.portals){for(const [a,b] of [[p.a,p.b],[p.b,p.a]])if(near(a[0],a[1],12)){Z.px=b[0]*TS+16;Z.py=b[1]*TS+16;Z.pcd=70;try{tone(300,.25,'sine',.06,500);}catch(_){}mzSay(Z.px,Z.py-24,'WHOOSH!','#9fe8ff');break;}}
  // foes
  for(const f of M.foes){
    if(f.dead)continue;f.tm++;
    const cx=Math.floor(f.x/TS),cy=Math.floor(f.y/TS),ccx=(cx+.5)*TS,ccy=(cy+.5)*TS;
    if((f.dx===0&&f.dy===0)||(Math.abs(f.x-ccx)<=f.sp&&Math.abs(f.y-ccy)<=f.sp)){
      f.x=ccx;f.y=ccy;const ds=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>!mzSolid(M,cx+a,cy+b,false));
      let ch=ds.filter(([a,b])=>!(a===-f.dx&&b===-f.dy));if(!ch.length)ch=ds;
      if(Math.abs(Z.px-f.x)+Math.abs(Z.py-f.y)<190&&f.v%3===0){ch.sort((p,q)=>(Math.abs(Z.px-(f.x+p[0]*TS))+Math.abs(Z.py-(f.y+p[1]*TS)))-(Math.abs(Z.px-(f.x+q[0]*TS))+Math.abs(Z.py-(f.y+q[1]*TS))));ch=[ch[0]];}
      const pk=ch[Math.floor(hsh(f.tm*1.3+f.v)*ch.length)]||[0,0];f.dx=pk[0];f.dy=pk[1];}
    f.x+=f.dx*f.sp;f.y+=f.dy*f.sp;if(f.dx)f.dir=f.dx;
    if(Math.abs(f.x-Z.px)<15&&Math.abs(f.y-Z.py)<14){if(Z.nip>0){f.dead=true;Z.score+=50;try{sfx.stomp();}catch(_){}mzSay(f.x,f.y-20,CSAY[f.v%10],'#fff');const I=critInfo(f.v);for(let n=0;n<10;n++){const a=Math.random()*6.28;Z.parts.push({x:f.x,y:f.y,vx:Math.cos(a)*3,vy:Math.sin(a)*3,l:24,m:24,c:I.body});}}else mzHurt('CHOMP!');}
  }
  // goal
  if(near(M.gx,M.gy,17)){
    Z.over='win';try{sfx.win();}catch(_){}
    const r=M.totT?Z.got/M.totT:1,stars=r>=.8?3:r>=.5?2:1;Z.stars=stars;PR.maze.st[Z.i]=Math.max(PR.maze.st[Z.i]||0,stars);PR.maze.at=Math.max(PR.maze.at,Z.i+1);savePR();
    state='mzwin';const T0=Z;
    setTimeout(()=>{if(state!=='mzwin'||MZ!==T0)return;startCut(()=>{state='mzwin';const b=[];if(Z.i<99)b.push(['Next maze ▶',()=>startMaze(Z.i+1),'on']);b.push(['Replay',()=>startMaze(Z.i)],['Map',()=>openGM('maze')],['Menu',showMenu]);
      showMsg('Maze solved! 🧩',mzName(Z.i)+'\n🍰 '+Z.got+' / '+M.totT+'   score '+Z.score+'   '+'★'.repeat(stars)+'☆'.repeat(3-stars),b);},{salt:Z.i+11,title:'MAZE SOLVED!',big:M.k===9});},700);
  }
  const VWm=VW,VHm=VH,mw=M.W*TS,mh=M.H*TS;
  const tcx=mw<=VWm?(mw-VWm)/2:Math.max(0,Math.min(mw-VWm,Z.px-VWm/2)),tcy=mh<=VHm?(mh-VHm)/2:Math.max(0,Math.min(mh-VHm,Z.py-VHm/2));
  if(Z.t<2){Z.cam=[tcx,tcy];}else{Z.cam[0]+=(tcx-Z.cam[0])*.15;Z.cam[1]+=(tcy-Z.cam[1])*.15;}
}
function mzTreat(c,x,y,kind,t){
  c.save();c.translate(x,y+Math.sin(t*.08+x)*2);c.lineJoin='round';
  if(kind===0){tpFish(c,0,0,1);}
  else if(kind===1){c.beginPath();c.rect(-9,-3,18,9);fillOL(c,'#f2c27a',1.6);c.beginPath();c.rect(-9,-8,18,6);fillOL(c,'#ff9ad0',1.6);c.beginPath();c.arc(0,-10,3,0,7);fillOL(c,'#e63946',1.2);}
  else if(kind===2){c.beginPath();c.arc(0,0,9,0,7);fillOL(c,'#d99a52',1.8);c.beginPath();c.arc(0,0,8,0,7);c.strokeStyle='#ff77b7';c.lineWidth=5;c.stroke();c.beginPath();c.arc(0,0,3,0,7);fillOL(c,'#17121f',1);}
  else if(kind===3){c.beginPath();c.rect(-6,-9,12,17);fillOL(c,'#fff',1.8);c.fillStyle='#6ec8ff';c.fillRect(-6,-4,12,5);c.fillStyle='#e63946';c.fillRect(-2.5,-10,5,3);}
  else {c.beginPath();c.moveTo(0,-11);c.lineTo(9,-3);c.lineTo(5,9);c.lineTo(-5,9);c.lineTo(-9,-3);c.closePath();fillOL(c,'#6ee7ff',1.8);c.fillStyle='rgba(255,255,255,.7)';c.fillRect(-3,-6,3,6);glow(c,0,0,22,'110,231,255',.5);}
  c.restore();
}
function drawMaze(){
  const Z=MZ,M=Z.M,c=ctx,t=WT[M.w],cx=Math.round(Z.cam[0]),cy=Math.round(Z.cam[1]);
  c.fillStyle=shd(t.wall,-.55);c.fillRect(0,0,800,448);
  c.save();if(Z.shake>.5)c.translate((Math.random()-.5)*Z.shake,(Math.random()-.5)*Z.shake);c.translate(-cx,-cy);
  const x0=Math.max(0,Math.floor(cx/TS)),x1=Math.min(M.W-1,Math.floor((cx+VW)/TS)),y0=Math.max(0,Math.floor(cy/TS)),y1=Math.min(M.H-1,Math.floor((cy+VH)/TS)+1);
  const fl=t.floor,fl2=shd(t.floor,-.07),wl=t.wall,wt=shd(t.wall,.22),wf=shd(t.wall,-.3);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const ch=M.g[y][x],px=x*TS,py=y*TS;
    if(ch==='#'){continue;}
    c.fillStyle=(x+y)%2?fl:fl2;c.fillRect(px,py,TS,TS);
    const key=x+','+y;
    if(M.mud.has(key)){c.fillStyle='#7a5a3a';c.fillRect(px+2,py+2,TS-4,TS-4);c.fillStyle='#5a3f26';[[8,10],[20,18],[12,24]].forEach(a=>{c.beginPath();c.arc(px+a[0],py+a[1],3,0,7);c.fill();});}
    const cv=M.conv.get(key);if(cv){c.fillStyle='rgba(30,30,60,.35)';c.fillRect(px+2,py+2,TS-4,TS-4);c.fillStyle='#ffd84a';c.save();c.translate(px+16,py+16);c.rotate(Math.atan2(cv[1],cv[0]));const o=(Z.t*.8%16)-8;for(const k of [-8,8]){c.beginPath();c.moveTo(k+o-4,-6);c.lineTo(k+o+4,0);c.lineTo(k+o-4,6);c.closePath();c.fill();}c.restore();}
    if(hsh(x*7.1+y*3.7+M.w)<.07){c.fillStyle='rgba(255,255,255,.35)';c.fillRect(px+8+hsh(x+y*9)*14,py+8+hsh(x*5+y)*14,3,3);}
  }
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    if(M.g[y][x]!=='#')continue;const px=x*TS,py=y*TS,below=y+1<M.H&&M.g[y+1][x]!=='#';
    c.fillStyle=wl;c.fillRect(px,py,TS,TS);c.fillStyle=wt;c.fillRect(px,py,TS,4);
    if(below){c.fillStyle=wf;c.fillRect(px,py+TS-9,TS,9);c.fillStyle='rgba(0,0,0,.18)';c.fillRect(px,py+TS-9,TS,2);}
    if(hsh(x*3.3+y*5.1)<.2){c.fillStyle='rgba(255,255,255,.14)';c.fillRect(px+6,py+8,8,3);}
  }
  // portals, spikes, goal, doors
  for(const p of M.portals)for(const a of [p.a,p.b]){const px=a[0]*TS+16,py=a[1]*TS+16;for(let r=0;r<3;r++){c.strokeStyle=['#6ee7ff','#c08bff','#fff'][r];c.lineWidth=2.4;c.beginPath();c.arc(px,py,13-r*4,Z.t*.1*(r%2?-1:1),Z.t*.1*(r%2?-1:1)+4.2);c.stroke();}}
  for(const s of M.spikes){const px=s.x*TS,py=s.y*TS,up=((Z.t+s.ph)%120)<60,warn=((Z.t+s.ph)%120)>=48&&!up||((Z.t+s.ph)%120)>=108;c.fillStyle='rgba(0,0,0,.28)';c.fillRect(px+4,py+4,TS-8,TS-8);
    if(up){for(let i=0;i<3;i++){c.beginPath();c.moveTo(px+5+i*9,py+TS-6);c.lineTo(px+9.5+i*9,py+6);c.lineTo(px+14+i*9,py+TS-6);c.closePath();fillOL(c,'#c9d3e0',1.6);}}else if(((Z.t+s.ph)%120)>100){c.fillStyle='rgba(255,70,70,.6)';c.fillRect(px+8,py+TS-10,TS-16,4);}}
  for(const d of M.doors){if(d.open)continue;const px=d.x*TS,py=d.y*TS;c.fillStyle=DKC[d.c];c.fillRect(px+2,py+2,TS-4,TS-4);c.fillStyle='rgba(0,0,0,.28)';c.fillRect(px+2,py+TS-12,TS-4,10);c.strokeStyle=OL;c.lineWidth=2;c.strokeRect(px+2,py+2,TS-4,TS-4);c.beginPath();c.arc(px+16,py+14,4,0,7);c.fillStyle='#ffd84a';c.fill();c.fillRect(px+14.5,py+16,3,7);}
  { // goal
    const gx=M.gx*TS+16,gy=M.gy*TS+16;glow(c,gx,gy,46+Math.sin(Z.t*.1)*6,'255,216,74',.55);
    c.beginPath();c.ellipse(gx,gy+6,13,9,0,0,Math.PI);c.closePath();fillOL(c,'rgba(180,230,255,.9)',1.8);c.beginPath();c.ellipse(gx,gy+6,13,4,0,0,7);fillOL(c,'#cfeaff',1.6);tpFish(c,gx,gy+2-Math.abs(Math.sin(Z.t*.12))*4,.9);
    c.fillStyle='#17121f';c.fillRect(gx+12,gy-22,2,22);c.fillStyle='#e63946';c.beginPath();c.moveTo(gx+14,gy-22);c.lineTo(gx+26,gy-17);c.lineTo(gx+14,gy-12);c.fill();
  }
  for(const q of M.keys)if(!q.got){const px=q.x*TS+16,py=q.y*TS+16+Math.sin(Z.t*.1+q.x)*3;glow(c,px,py,20,'255,255,200',.5);c.beginPath();c.arc(px-3,py,6,0,7);fillOL(c,DKC[q.c],1.8);c.fillStyle=DKC[q.c];c.fillRect(px+2,py-2,10,4);c.fillRect(px+8,py,3,6);c.strokeStyle=OL;c.lineWidth=1.4;c.strokeRect(px+2,py-2,10,4);}
  for(const q of M.nips)if(!q.got){const px=q.x*TS+16,py=q.y*TS+16;glow(c,px,py,26,'192,139,255',.6);c.beginPath();c.arc(px,py,9,0,7);fillOL(c,'#9fe870',1.8);}
  for(const q of M.treats)if(!q.got)mzTreat(c,q.x*TS+16,q.y*TS+16,q.kind,Z.t);
  // entities by y
  const ents=[];for(const f of M.foes)if(!f.dead)ents.push({y:f.y,f});ents.push({y:Z.py,p:1});ents.sort((a,b)=>a.y-b.y);
  for(const e of ents){
    if(e.f){const f=e.f,sz=critSz(f.v);c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(f.x,f.y+9,11,4,0,0,7);c.fill();drawCritArt(c,f.v,f.x,f.y+9,sz[0]*1.15,sz[1]*1.15,f.dir||1,f.tm);}
    else{
      c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(Z.px,Z.py+10,12,4,0,0,7);c.fill();
      if(Z.nip>0)glow(c,Z.px,Z.py,40,'192,139,255',.55);
      if(!(Z.inv>0&&Math.floor(Z.inv/4)%2)){const cat=CATS[sel],k=.62,w=cat.w*SPR*k,h=cat.h*SPR*k;drawCat(c,cat,Z.px-w/2,Z.py+11-h,w,h,Z.face,Z.t,{run:Z.mv>0?1:0});}
    }
  }
  for(const q of Z.parts){c.globalAlpha=Math.max(0,q.l/q.m);c.fillStyle=q.c;c.fillRect(q.x-2,q.y-2,4,4);}c.globalAlpha=1;
  c.font='bold 13px system-ui';c.textAlign='center';for(const q of Z.txt){c.globalAlpha=1-q.t/60;c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.65)';c.strokeText(q.s,q.x,q.y-q.t*.5);c.fillStyle=q.c;c.fillText(q.s,q.x,q.y-q.t*.5);}c.globalAlpha=1;
  c.restore();
  const vg=c.createRadialGradient(400,224,160,400,224,520);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(10,6,30,.5)');c.fillStyle=vg;c.fillRect(0,0,800,448);
  if(Z.nip>0){c.strokeStyle='rgba(192,139,255,.5)';c.lineWidth=8;c.strokeRect(4,4,792,440);}
  drawMzHUD();
}
function drawMzHUD(){
  const Z=MZ,M=Z.M,c=ctx;
  c.font='900 20px system-ui';c.textAlign='left';c.strokeStyle=OL;c.lineWidth=3;
  for(let i=0;i<5;i++){c.fillStyle=i<Z.hp?'#ff4d6d':'rgba(255,255,255,.28)';c.strokeText('♥',12+i*24,30);c.fillText('♥',12+i*24,30);}
  for(let j=0;j<3;j++)if(Z.keys[j]>0){c.fillStyle=DKC[j];c.fillRect(12+j*34,40,26,12);c.strokeStyle=OL;c.lineWidth=2;c.strokeRect(12+j*34,40,26,12);c.font='900 11px system-ui';c.fillStyle='#fff';c.fillText('×'+Z.keys[j],16+j*34,50);}
  c.font='800 13px system-ui';c.textAlign='center';c.fillStyle='#fff';c.strokeStyle='rgba(0,0,0,.7)';c.lineWidth=3;const nm=mzName(Z.i);c.strokeText(nm,400,22);c.fillText(nm,400,22);
  c.textAlign='left';c.fillStyle='#ffd84a';c.strokeText('🍰 '+Z.got+'/'+M.totT+'   ⭐ '+Z.score,12,70);c.fillText('🍰 '+Z.got+'/'+M.totT+'   ⭐ '+Z.score,12,70);
  // minimap
  const u=Math.max(2,Math.min(4,Math.floor(120/M.W))),mw=M.W*u,mh=M.H*u,ox=792-mw,oy=10;
  c.fillStyle='rgba(15,10,40,.78)';c.fillRect(ox-4,oy-4,mw+8,mh+8);
  for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++){if(!Z.seen[y*M.W+x])continue;c.fillStyle=M.g[y][x]==='#'?shd(WT[M.w].wall,-.1):shd(WT[M.w].floor,-.1);c.fillRect(ox+x*u,oy+y*u,u,u);}
  for(const d of M.doors)if(!d.open&&Z.seen[d.y*M.W+d.x]){c.fillStyle=DKC[d.c];c.fillRect(ox+d.x*u,oy+d.y*u,u,u);}
  c.fillStyle='#ffd84a';c.fillRect(ox+M.gx*u-1,oy+M.gy*u-1,u+2,u+2);
  if(Math.floor(Z.t/15)%2){c.fillStyle='#fff';c.fillRect(ox+Math.floor(Z.px/TS)*u-1,oy+Math.floor(Z.py/TS)*u-1,u+2,u+2);}
  if(Z.t<260){c.textAlign='center';c.font='700 12px system-ui';c.fillStyle='#fff';c.strokeStyle='rgba(0,0,0,.65)';c.lineWidth=3;const s='Find the golden fish bowl 🏁  ·  grab keys for matching doors  ·  catnip = unstoppable';c.strokeText(s,400,48);c.fillText(s,400,48);}
}

/* ================= OVERWORLD MAP SCREEN (temple + maze) ================= */
function ptm(){return TP?TP.t:(GM?GM.t:0);}
const GMC=$('gmc');
function npos(w,k){return [62+k*76.5,152+Math.sin(k*1.25+w*1.7)*62];}
function gmUnlocked(i){return UNL||i<=PR[GM.kind].at||i%10===0;}
function openGM(kind){
  MODE=kind;TP=null;MZ=null;CUT=null;CUTARM=false;state='gmap';
  const at=Math.min(99,PR[kind].at);GM={kind,w:Math.floor(at/10),sel:at,t:0};
  $('menu').classList.add('hide');$('msg').classList.add('hide');$('gm').classList.remove('hide');
  $('gmt').textContent=TITLEF[kind];
  const tb=$('gmtabs');tb.innerHTML='';
  for(let w=0;w<10;w++){const b=document.createElement('button');b.className='b';b.textContent=String(w+1);b.title=(kind==='maze'?MWN[w]:WT[w].n);b.onclick=()=>{GM.w=w;const f=w*10;GM.sel=PR[kind].at>=f&&PR[kind].at<f+10?PR[kind].at:f;gmInfo();};tb.appendChild(b);}
  gmInfo();
}
function gmInfo(){
  const k=GM.kind,i=GM.sel,st=PR[k].st;let tot=0;for(const x in st)tot+=st[x];
  [...$('gmtabs').children].forEach((b,w)=>b.classList.toggle('on',w===GM.w));
  const nm=NAMEF[k](i),s=st[i]||0;
  $('gmi').textContent='World '+(GM.w+1)+' of 10 · '+nm+'   '+'★'.repeat(s)+'☆'.repeat(3-s)+'   ·   total ★ '+tot+' / 300';
  $('gmgo').textContent=gmUnlocked(i)?'▶ GO!':'🔒 LOCKED';
}
function gmGo(){if(!GM||!gmUnlocked(GM.sel)){toast('🔒 Beat the map before it first');return;}$('gm').classList.add('hide');STARTF[GM.kind](GM.sel);}
$('gmgo').onclick=gmGo;$('gmback').onclick=()=>showMenu();
GMC.addEventListener('pointerdown',e=>{
  if(state!=='gmap')return;audioInit();
  const r=GMC.getBoundingClientRect(),x=(e.clientX-r.left)*800/r.width,y=(e.clientY-r.top)*270/r.height;
  let best=-1,bd=34;for(let k=0;k<10;k++){const p=npos(GM.w,k),d=Math.hypot(p[0]-x,p[1]-y);if(d<bd){bd=d;best=k;}}
  if(best<0)return;const i=GM.w*10+best;
  if(!gmUnlocked(i)){toast('🔒 Beat the map before it first');return;}
  if(GM.sel===i)gmGo();else{GM.sel=i;try{sfx.meow();}catch(_){}gmInfo();}
});
function gmDraw(){
  GM.t++;const c=GMC.getContext('2d'),t=WT[GM.w],W=800,H=270,w=GM.w;
  c.setTransform(1,0,0,1,0,0);
  const g=c.createLinearGradient(0,0,0,110);g.addColorStop(0,t.sky[0]);g.addColorStop(1,t.sky[1]);c.fillStyle=g;c.fillRect(0,0,W,110);
  for(let y=100;y<H;y+=10){c.fillStyle=((y/10)|0)%2?t.side:t.side2;c.fillRect(0,y,W,10);}
  c.fillStyle=shd(t.side,-.12);for(let i=0;i<7;i++){const mx=i*140+40,mh=30+hsh(i*5.3+w)*40;c.beginPath();c.moveTo(mx-80,102);c.lineTo(mx,102-mh);c.lineTo(mx+80,102);c.fill();}
  for(let j=0;j<16;j++){const px=hsh(j*4.7+w)*W,py=118+hsh(j*2.1+w*3)*140;tpProp(c,w,px,py,.55,j);}
  // path
  c.lineCap='round';c.lineJoin='round';const pts=[];for(let k=0;k<10;k++)pts.push(npos(w,k));
  c.strokeStyle=shd(t.r2,-.45);c.lineWidth=24;c.beginPath();pts.forEach((p,k)=>k?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();
  c.strokeStyle=t.r1;c.lineWidth=18;c.stroke();c.setLineDash([8,10]);c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=2.5;c.stroke();c.setLineDash([]);
  const st=PR[GM.kind].st;
  for(let k=0;k<10;k++){
    const i=w*10+k,p=pts[k],un=gmUnlocked(i),done=(st[i]||0)>0,boss=k===9,sz=boss?46:38,sl=GM.sel===i;
    c.fillStyle='rgba(0,0,0,.3)';c.fillRect(p[0]-sz/2+3,p[1]-sz/2+5,sz,sz);
    c.fillStyle=!un?'#6b6b7a':done?'#ffd84a':t.acc;c.fillRect(p[0]-sz/2,p[1]-sz/2,sz,sz);c.fillStyle='rgba(255,255,255,.28)';c.fillRect(p[0]-sz/2,p[1]-sz/2,sz,5);
    c.strokeStyle=OL;c.lineWidth=3;c.strokeRect(p[0]-sz/2,p[1]-sz/2,sz,sz);
    if(sl){c.strokeStyle='#fff';c.lineWidth=3+Math.sin(GM.t*.2)*1.5;c.strokeRect(p[0]-sz/2-5,p[1]-sz/2-5,sz+10,sz+10);}
    c.font='900 '+(boss?20:17)+'px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillStyle=un?OL:'#c9c9d6';c.fillText(un?String(k+1):'🔒',p[0],p[1]+1);c.textBaseline='alphabetic';
    if(boss){c.beginPath();c.moveTo(p[0]-12,p[1]-sz/2-1);c.lineTo(p[0]-12,p[1]-sz/2-11);c.lineTo(p[0]-6,p[1]-sz/2-5);c.lineTo(p[0],p[1]-sz/2-13);c.lineTo(p[0]+6,p[1]-sz/2-5);c.lineTo(p[0]+12,p[1]-sz/2-11);c.lineTo(p[0]+12,p[1]-sz/2-1);c.closePath();fillOL(c,'#ffd84a',1.8);}
    if(done){c.font='900 11px system-ui';c.fillStyle='#ffd84a';c.strokeStyle=OL;c.lineWidth=3;const s='★'.repeat(st[i]);c.strokeText(s,p[0],p[1]+sz/2+13);c.fillText(s,p[0],p[1]+sz/2+13);}
  }
  const sp=pts[GM.sel%10],cat=CATS[sel],k2=.85,cw=cat.w*SPR*k2,chh=cat.h*SPR*k2;
  if(GM.sel>=w*10&&GM.sel<w*10+10)drawCat(c,cat,sp[0]-cw/2,sp[1]-30-chh-Math.abs(Math.sin(GM.t*.12))*5,cw,chh,1,GM.t,{run:0});
}

/* ================= FUNNY CUTSCENES AFTER EVERY LEVEL ================= */
const FY=362;
function ccat(c,C,x,by,k,face,o,rot){const cat=C.cat,w=cat.w*SPR*k,h=cat.h*SPR*k;c.save();if(rot){c.translate(x,by-h/2);c.rotate(rot);c.translate(-x,-(by-h/2));}drawCat(c,cat,x-w/2,by-h,w,h,face,C.t,o||{});c.restore();return {w,h};}
function cfish(c,x,y,s,r){c.save();c.translate(x,y);c.rotate(r||0);tpFish(c,0,0,s);c.restore();}
function cbox(c,x,y,w,h,f,lw){c.beginPath();c.rect(x,y,w,h);fillOL(c,f,lw||3);}
function cstar(c,x,y,r,t){c.save();c.translate(x,y);c.rotate(t);c.beginPath();for(let i=0;i<10;i++){const rr=i%2?r*.45:r,a=-Math.PI/2+i*Math.PI/5;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();fillOL(c,'#ffd84a',1.6);c.restore();}
function cdust(c,x,y,t){for(let i=0;i<5;i++){const a=((t*.06+i*.2)%1);c.globalAlpha=1-a;c.fillStyle='#fff';c.beginPath();c.arc(x-a*40-i*3,y-a*14,3+a*7,0,7);c.fill();}c.globalAlpha=1;}
const GAGS=[
 {n:'Selfie',caps:['Say cheese... or FISH!','A fish photobombed. Worth it.','12 likes. Purrfect.'],f(c,t,C){ccat(c,C,380,FY,2.3,1);cbox(c,470,236,22,38,'#2b2b3a',2.4);c.fillStyle='#8fd0ff';c.fillRect(473,240,16,28);cfish(c,((t*4.6)%1100)-150,300+Math.sin(t*.08)*20,1.4,Math.sin(t*.1)*.2);const k=t%100;if(k>88){c.fillStyle='rgba(255,255,255,'+(.85*(1-(k-88)/12))+')';c.fillRect(0,0,800,448);}}},
 {n:'Fish rain',caps:['It is raining fish. Hallelujah.','Umbrella? Bowl is better.','Free fish! (Mind your head.)'],f(c,t,C){for(let i=0;i<16;i++){const y=((t*3.4+i*91)%560)-70,x=40+i*47;if(t>50&&Math.abs(x-400)<95&&y>FY-190&&y<FY-110)continue;cfish(c,x,y,1.3,i+t*.05);}ccat(c,C,400,FY,2.2,1);if(t>40){const o=Math.min(1,(t-40)/20);c.beginPath();c.arc(400,FY-170,80*o,Math.PI,0);c.closePath();fillOL(c,'#e63946',3);c.strokeStyle=OL;c.lineWidth=4;c.beginPath();c.moveTo(400,FY-170);c.lineTo(400,FY-120);c.stroke();}if(t>240){const y=Math.min(FY-150,(t-240)*5);cfish(c,400,y-30,1.8,0);}}},
 {n:'Zoomies',caps:['3 AM ZOOMIES ACTIVATED','Where is she going? Nobody knows.','BONK. Worth it.'],f(c,t,C){const run=t<250,x=run?400+Math.sin(t*.075)*330:742,f=run?(Math.cos(t*.075)>0?1:-1):-1;cbox(c,770,200,30,170,'#8a6a4a',3);if(run)cdust(c,x-f*30,FY,t);ccat(c,C,x,FY,2.2,f,{run:run?1:0},run?0:.35);if(!run){for(let i=0;i<3;i++)cstar(c,x-30+i*28,FY-130+Math.sin(t*.2+i)*6,10,t*.1+i);}}},
 {n:'Glass',caps:['Gravity: tested. Again.','Eye contact. Slow push.','Not me. Never me.'],f(c,t,C){cbox(c,500,292,220,16,'#9a6538');cbox(c,510,308,14,54,'#7a4a28',2.4);cbox(c,696,308,14,54,'#7a4a28',2.4);const gx=t<60?640:t<130?640+(t-60)*.9:703,fall=t>140,gy=fall?Math.min(FY-24,292-30+((t-140)*(t-140))*.09):292-30;if(!(fall&&gy>=FY-24&&t>200)){c.globalAlpha=.7;c.beginPath();c.rect(gx-9,gy,18,30);fillOL(c,'#bfe8ff',2);c.globalAlpha=1;}else{c.fillStyle='#bfe8ff';for(let i=0;i<8;i++)c.fillRect(gx-30+i*9,FY-4-(i%3)*2,7,4);}ccat(c,C,560,292,1.9,1);if(t>60&&t<140){c.strokeStyle=OL;c.lineWidth=7;c.beginPath();c.moveTo(595,250);c.lineTo(618+(t-60)*.5,262);c.stroke();}if(t>205){c.font='900 26px system-ui';c.textAlign='center';c.fillStyle='#fff';c.strokeStyle=OL;c.lineWidth=5;c.strokeText('CRASH!',680,300);c.fillText('CRASH!',680,300);}}},
 {n:'Roomba',caps:['Taxi! ...slowly.','Speed: 0.4 mph. Vibes: immaculate.','Party hat. Roomba. Zero regrets.'],f(c,t,C){const rx=400+Math.cos(t*.04)*210,f=-Math.sin(t*.04)>0?1:-1;c.beginPath();c.ellipse(rx,FY-14,64,16,0,0,7);fillOL(c,'#3b3f55',3);c.beginPath();c.arc(rx+f*30,FY-20,5,0,7);c.fillStyle=Math.floor(t/10)%2?'#46e0a0':'#2b6a55';c.fill();const d=ccat(c,C,rx,FY-26,1.9,f,{run:0});c.beginPath();c.moveTo(rx+f*10-12,FY-26-d.h*.85);c.lineTo(rx+f*10,FY-26-d.h*.85-34);c.lineTo(rx+f*10+12,FY-26-d.h*.85);c.closePath();fillOL(c,'#ff4f9a',2.2);}},
 {n:'Disco',caps:['Stayin\' alive. Nine times.','The floor is lava. The beat is fire.','Paws up!'],f(c,t,C){c.fillStyle='rgba(25,10,60,.62)';c.fillRect(0,0,800,448);for(let i=0;i<8;i++){const a=t*.03+i*.8;c.fillStyle='hsla('+(i*45+t*2)%360+',90%,60%,.2)';c.beginPath();c.moveTo(400+Math.sin(t*.05)*60,70);c.lineTo(400+Math.cos(a)*520,448);c.lineTo(400+Math.cos(a+.25)*520,448);c.closePath();c.fill();}c.beginPath();c.arc(400+Math.sin(t*.05)*60,70,26,0,7);fillOL(c,'#dfe6ff',3);ccat(c,C,400,FY-Math.abs(Math.sin(t*.14))*40,2.3,Math.sin(t*.07)>0?1:-1,{run:1},Math.sin(t*.14)*.18);}},
 {n:'Box',caps:['If I fits, I sits.','It does not fit. She sits anyway.','Rent-free. Cardboard.'],f(c,t,C){const x=t<60?-100+t*8:t<100?380+(t-60)*.5:400,hop=t>=60&&t<100?Math.sin((t-60)/40*Math.PI)*70:0;ccat(c,C,x,FY-22-hop,2.2,1,{run:t<60?1:0},t>=100?0:0);cbox(c,350,FY-62,100,66,'#c79a5a');c.fillStyle='#17121f';c.font='900 13px system-ui';c.textAlign='center';c.fillText('FRAGILE',400,FY-24);c.fillText('(CAT)',400,FY-9);if(t>110){c.strokeStyle=OL;c.lineWidth=10;c.beginPath();c.moveTo(452,FY-40);c.quadraticCurveTo(490,FY-40+Math.sin(t*.1)*10,500,FY-8);c.stroke();c.strokeStyle=C.cat.body;c.lineWidth=6;c.stroke();}}},
 {n:'Rocket',caps:['Houston, we have a cat.','To the moon! (She wanted tuna.)','Meow-nned mission complete.'],f(c,t,C){if(t>110){c.fillStyle='rgba(8,6,40,'+Math.min(.85,(t-110)/60)+')';c.fillRect(0,0,800,448);for(let i=0;i<40;i++){c.fillStyle='#fff';c.fillRect(hsh(i*1.7)*800,((hsh(i*2.3)*448)+t*(2+i%3))%448,2,2);}}const up=t<90?0:Math.pow(t-90,1.55)*.5,y=FY-30-up;if(y<-200)return;c.beginPath();c.moveTo(400,y-120);c.quadraticCurveTo(440,y-60,430,y);c.lineTo(370,y);c.quadraticCurveTo(360,y-60,400,y-120);fillOL(c,'#e8ecf5',3);c.beginPath();c.moveTo(370,y);c.lineTo(340,y+26);c.lineTo(375,y-24);c.closePath();fillOL(c,'#e63946',2.4);c.beginPath();c.moveTo(430,y);c.lineTo(460,y+26);c.lineTo(425,y-24);c.closePath();fillOL(c,'#e63946',2.4);if(t>60){const fh=(t>90?70:24)+Math.sin(t)*10;c.beginPath();c.moveTo(380,y);c.lineTo(400,y+fh);c.lineTo(420,y);c.closePath();fillOL(c,'#ffb23a',2);}ccat(c,C,400,y-70,1.2,1,{});}},
 {n:'Cucumber',caps:['CUCUMBER!!! (It was just there.)','Vertical limit: ceiling.','Jump height: yes.'],f(c,t,C){const cx=t<80?900:Math.max(540,900-(t-80)*5);c.beginPath();c.ellipse(cx,FY-16,52,16,0,0,7);fillOL(c,'#3fae4a',3);c.fillStyle='#2b8a38';for(let i=0;i<5;i++)c.fillRect(cx-30+i*14,FY-24,3,3);let h=0;if(t>=130&&t<250)h=Math.sin((t-130)/120*Math.PI)*290;ccat(c,C,300,FY-h,2.2,1,{air:h>0?-1:0});if(t>=130&&t<250&&h>250){c.font='900 34px system-ui';c.textAlign='center';c.fillStyle='#fff';c.strokeStyle=OL;c.lineWidth=6;c.strokeText('THUMP!',300,30);c.fillText('THUMP!',300,30);}if(t>=130&&t<150){c.font='900 40px system-ui';c.fillStyle='#ffd84a';c.strokeStyle=OL;c.lineWidth=6;c.strokeText('!!',300,FY-190);c.fillText('!!',300,FY-190);}}},
 {n:'Yoga',caps:['Inner peace. Outer wobble.','Namaste... oops.','Flexibility: 100%. Balance: 3%.'],f(c,t,C){const w=Math.min(1,t/220),rot=Math.sin(t*.09)*.45*w+(t>230?Math.min(1.4,(t-230)*.035):0);c.fillStyle='#8a5ad8';c.fillRect(250,FY,300,10);c.strokeStyle=OL;c.lineWidth=3;c.strokeRect(250,FY,300,10);ccat(c,C,400,FY,2.3,1,{},rot);for(let i=0;i<3;i++){c.strokeStyle='rgba(255,255,255,'+(.5-i*.15)+')';c.lineWidth=3;c.beginPath();c.arc(400,FY-60,50+((t*.7+i*30)%110),0,7);c.stroke();}if(t>235){c.font='900 26px system-ui';c.textAlign='center';c.fillStyle='#fff';c.strokeStyle=OL;c.lineWidth=5;c.strokeText('oof',400,FY-150);c.fillText('oof',400,FY-150);}}},
 {n:'Laser',caps:['Must. Catch. Dot.','The dot knows what it did.','Pounce level: expert. Aim: no.'],f(c,t,C){const dx=t<210?400+Math.sin(t*.07)*280:690,dy=t<210?FY-30-Math.abs(Math.sin(t*.1))*120:FY-5;const f=dx>(t<210?400:400)?1:-1;let cx=400;if(t>=200&&t<260)cx=400+(t-200)*4.6;else if(t>=260)cx=676;const hh=t>=200&&t<260?Math.sin((t-200)/60*Math.PI)*110:0;ccat(c,C,cx,FY-hh,2.2,t>=200?1:f,{run:0},t>=260?.3:0);c.fillStyle='#ff2a2a';c.beginPath();c.arc(dx,dy,7,0,7);c.fill();glow(c,dx,dy,26,'255,40,40',.6);if(t>=262){c.font='900 26px system-ui';c.textAlign='center';c.fillStyle='#fff';c.strokeStyle=OL;c.lineWidth=5;c.strokeText('MISSED',600,250);c.fillText('MISSED',600,250);}}},
 {n:'Pizza',caps:['Delivery for... me. Obviously.','Trip. Toss. Topping.','Now wearing: pizza.'],f(c,t,C){const x=t<150?-60+t*3.6:t<250?480+(t-150)*.25:505,trip=t>=140&&t<165,rot=trip?(t-140)*.04:t>=165&&t<250?1.0:t>=250?0:0;ccat(c,C,x,FY,2.1,1,{run:t<150?1:0},t>=165&&t<250?rot*.5:rot);let px=x+34,py=FY-82,pr=t*.1;if(t>=150&&t<260){const k=(t-150)/110;px=x+34+k*70*(1-k)*2;py=FY-82-Math.sin(k*Math.PI)*190+k*40;pr=t*.3;}else if(t>=260){px=x+4;py=FY-C.cat.h*SPR*2.1*.95;pr=0;}c.save();c.translate(px,py);c.rotate(pr);c.beginPath();c.arc(0,0,26,0,7);fillOL(c,'#f2c27a',3);c.beginPath();c.arc(0,0,21,0,7);c.fillStyle='#e8553a';c.fill();[[-8,-6],[7,-9],[5,8],[-9,8]].forEach(a=>{c.fillStyle='#fff3a0';c.beginPath();c.arc(a[0],a[1],4,0,7);c.fill();});c.restore();}},
 {n:'Trophy',caps:['World\'s Okayest Cat (Gold)','Trophy: 1. Cat: 0.','It is heavier than it looks.'],f(c,t,C){cbox(c,250,FY-40,100,44,'#c9d3e0');cbox(c,350,FY-80,100,84,'#ffd84a');cbox(c,450,FY-20,100,24,'#d99a52');c.fillStyle=OL;c.font='900 28px system-ui';c.textAlign='center';c.fillText('1',400,FY-30);c.fillText('2',300,FY-8);c.fillText('3',500,FY+0);const g=Math.min(1,t/150),s=.5+g*1.5,fall=t>230?Math.min(1,(t-230)/40):0;ccat(c,C,400,FY-80,1.5-fall*.3,1,{},fall*.0);c.save();c.translate(400+fall*10,FY-92-(1-g)*180+fall*14);c.scale(s,s);c.rotate(Math.sin(t*.12)*.08*(1+fall*3));c.beginPath();c.moveTo(-22,-40);c.lineTo(22,-40);c.lineTo(16,0);c.lineTo(5,8);c.lineTo(5,26);c.lineTo(14,26);c.lineTo(14,34);c.lineTo(-14,34);c.lineTo(-14,26);c.lineTo(-5,26);c.lineTo(-5,8);c.lineTo(-16,0);c.closePath();fillOL(c,'#ffd84a',3);c.restore();if(t>250){c.font='900 26px system-ui';c.fillStyle='#fff';c.strokeStyle=OL;c.lineWidth=5;c.textAlign='center';c.strokeText('mrrp.',400,FY-210);c.fillText('mrrp.',400,FY-210);}}},
 {n:'Skate',caps:['Kickflip? Kick-flop.','Gnarly. Gravity won.','Sick air. Sicker landing.'],f(c,t,C){c.beginPath();c.moveTo(370,FY);c.lineTo(470,FY);c.lineTo(470,FY-50);c.closePath();fillOL(c,'#b0865a',3);const x=t<260?60+t*2.2:560,air=t>=165&&t<215?Math.sin((t-165)/50*Math.PI)*120:0,rot=t>=165&&t<215?(t-165)/50*6.283:t>=225?.25:0,by=t<165?FY-8:t<215?FY-50-air*0+0-air:FY-8;c.save();c.fillStyle='#ff4f9a';cbox(c,x-34,by-2,68,8,'#ff4f9a',2.4);c.beginPath();c.arc(x-22,by+10,6,0,7);fillOL(c,'#3b3f55',2);c.beginPath();c.arc(x+22,by+10,6,0,7);fillOL(c,'#3b3f55',2);c.restore();ccat(c,C,x,by-4,1.9,1,{run:0},rot);if(t>=225)for(let i=0;i<3;i++)cstar(c,x-30+i*28,by-120+Math.sin(t*.2+i)*6,10,t*.1+i);}},
 {n:'Bath',caps:['NOT AMUSED.','Water: bad. Duck: worse.','This bubble bath is a personal attack.'],f(c,t,C){ccat(c,C,400,FY-30,2.1,1,{});c.beginPath();c.rect(280,FY-70,240,76);fillOL(c,'#e8f1ff',3.4);c.fillStyle='rgba(120,200,255,.55)';c.fillRect(284,FY-58,232,60);for(let i=0;i<10;i++){const bx=290+((i*53)%220),by=FY-60-((t*.8+i*29)%130);c.globalAlpha=.8;c.beginPath();c.arc(bx,by,8+(i%3)*3,0,7);fillOL(c,'#ffffff',1.6);}c.globalAlpha=1;cbox(c,280,FY-72,240,14,'#cfd9e8',3);const dy=FY-C.cat.h*SPR*2.1-24-30+Math.sin(t*.1)*3;c.beginPath();c.ellipse(400,dy+12,18,12,0,0,7);fillOL(c,'#ffd84a',2.4);c.beginPath();c.arc(412,dy-4,10,0,7);fillOL(c,'#ffd84a',2.4);c.beginPath();c.moveTo(420,dy-3);c.lineTo(432,dy);c.lineTo(420,dy+2);c.closePath();fillOL(c,'#ff9a2e',1.6);}},
 {n:'Cake',caps:['Face-first. No regrets.','Happy birthday to... me?','Frosting: acquired.'],f(c,t,C){cbox(c,500,FY-62,170,12,'#9a6538');cbox(c,515,FY-50,14,52,'#7a4a28',2.4);cbox(c,640,FY-50,14,52,'#7a4a28',2.4);cbox(c,540,FY-100,90,38,'#ffe7f2');cbox(c,540,FY-100,90,12,'#ff9ad0');c.fillStyle='#ffd84a';c.fillRect(581,FY-122,6,22);c.fillStyle='#ff8a1f';c.beginPath();c.ellipse(584,FY-128+Math.sin(t*.4),5,8,0,0,7);c.fill();const x=t<150?100+t*2.6:490,d=ccat(c,C,x,FY,2.2,1,{run:t<150?1:0},t>=150?Math.min(.35,(t-150)*.02):0);if(t>=160){c.fillStyle='#fff';c.beginPath();c.ellipse(x+d.w*.28,FY-d.h*.45,d.w*.28,d.h*.1,0,0,7);c.fill();c.strokeStyle=OL;c.lineWidth=2;c.stroke();}if(t<150&&t>0){}else if(t>=150){c.fillStyle='#ffe7f2';for(let i=0;i<6;i++)c.fillRect(x+30+i*9,FY-90+i%3*6,6,6);}}},
 {n:'Cape',caps:['Up, up, and... BILLBOARD.','Superhero landing: horizontal.','With great power comes great splat.'],f(c,t,C){cbox(c,590,70,190,110,'#ffe27a');cbox(c,670,180,16,190,'#8a6a4a',2.6);c.fillStyle=OL;c.font='900 22px system-ui';c.textAlign='center';c.fillText('WELCOME TO',685,112);c.fillText('FLY TOWN',685,140);const x=t<200?-60+t*3.4:620,y=t<200?250-Math.sin(t*.04)*60:Math.min(FY-30,250+(t-200)*(t-200)*.03);const sq=t>=200;c.save();c.beginPath();c.moveTo(x-20,y-70);c.lineTo(x-90-Math.sin(t*.3)*10,y-50);c.lineTo(x-20,y-30);c.closePath();fillOL(c,'#e63946',2.6);c.restore();ccat(c,C,x,y,1.9,1,{},sq?1.5:.15);if(sq&&t>206)for(let i=0;i<3;i++)cstar(c,x-24+i*24,y-150+Math.sin(t*.2+i)*6,10,t*.1+i);}},
 {n:'Karaoke',caps:['Hitting the high notes. All of them.','The windows have left the chat.','Encore! (Please stop.)'],f(c,t,C){c.fillStyle='rgba(255,230,120,.18)';c.beginPath();c.moveTo(400,0);c.lineTo(250,FY);c.lineTo(550,FY);c.closePath();c.fill();ccat(c,C,400,FY,2.3,1,{},Math.sin(t*.2)*.06);c.strokeStyle=OL;c.lineWidth=5;c.beginPath();c.moveTo(442,FY-70);c.lineTo(470,FY-110);c.stroke();c.beginPath();c.arc(474,FY-116,9,0,7);fillOL(c,'#3b3f55',2.4);c.font='900 30px system-ui';c.textAlign='center';for(let i=0;i<7;i++){const a=((t*.015+i*.15)%1);c.globalAlpha=1-a;c.fillStyle=['#ff4f9a','#6ee7ff','#ffd84a','#9fe870'][i%4];c.fillText(i%2?'♪':'♫',480+Math.sin(i*2+t*.05)*70+i*18,FY-130-a*220);}c.globalAlpha=1;cbox(c,80,110,120,130,'rgba(180,225,255,.5)',3.4);if(t>150){c.strokeStyle='#fff';c.lineWidth=2.4;c.beginPath();c.moveTo(140,110);c.lineTo(120,170);c.lineTo(155,185);c.lineTo(130,240);c.moveTo(120,170);c.lineTo(90,190);c.stroke();}}},
 {n:'Hats',caps:['Fashion is a tower.','Hat #8. The sky is the limit.','Gravity has opinions.'],f(c,t,C){const n=Math.min(8,Math.floor(t/28)),fall=t>260?(t-260):0,cols=['#e63946','#3a86ff','#ffd84a','#2ec27e','#ff77b7','#6ee7ff','#ff9a2e','#c08bff'],d=ccat(c,C,400,FY,2.1,1,{});const top=FY-d.h*.95;for(let i=0;i<n;i++){const wob=Math.sin(t*.1+i*.5)*i*1.4*(fall?0:1),hx=400+wob+fall*(i%2?1:-1)*i*.9,hy=top-i*22+fall*fall*.02*(i+1);c.save();c.translate(hx,hy);c.rotate(fall?fall*.04*(i%2?1:-1):Math.sin(t*.1+i)*.05);c.beginPath();c.moveTo(-22,0);c.lineTo(22,0);c.lineTo(14,-22);c.lineTo(-14,-22);c.closePath();fillOL(c,cols[i],2.4);c.restore();}}},
 {n:'Mirror',caps:['Who is THAT?!','Puff vs puff. Nobody wins.','It was just a mirror. Awkward.'],f(c,t,C){cbox(c,430,90,200,270,'#8a6a4a',5);c.fillStyle='#cfe8f5';c.fillRect(440,100,180,250);const p=t>120&&t<230?1+Math.sin((t-120)/110*Math.PI)*.3:1,back=t>200?Math.min(60,(t-200)*1.2):0;ccat(c,C,300-back,FY,2.1*p,1,{});c.save();c.beginPath();c.rect(440,100,180,250);c.clip();c.globalAlpha=.85;ccat(c,C,560+back*.5,FY,1.6*p,-1,{});c.restore();c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.moveTo(450,100);c.lineTo(490,100);c.lineTo(450,160);c.closePath();c.fill();if(t>125&&t<230){c.font='900 30px system-ui';c.textAlign='center';c.fillStyle='#fff';c.strokeStyle=OL;c.lineWidth=5;c.strokeText('HISSSS!',300,FY-190);c.fillText('HISSSS!',300,FY-190);}}}
];
function startCut(done,opt){
  opt=opt||{};const salt=(opt.salt==null?0:opt.salt),mode=({plat:0,temple:5,maze:11,pong:3,pac:8})[MODE]||0;
  CUT={t:0,done,idx:(salt*7+mode)%GAGS.length,cap:Math.abs(salt)%3,pal:Math.abs(salt*3+mode)%6,cat:CATS[sel],prev:state,title:opt.title||'LEVEL CLEAR!',big:!!opt.big,ended:false};
  state='cut';$('msg').classList.add('hide');
}
function endCut(){if(!CUT||CUT.ended)return;CUT.ended=true;const C=CUT;CUT=null;state=C.prev;C.done();}
function cutTick(){if(!CUT)return;CUT.t++;if(CUT.t>=370)endCut();}
function drawCut(){
  const C=CUT,t=C.t,c=ctx,G=GAGS[C.idx];
  const P6=[['#ffd1a1','#fff2dc','#d9a066'],['#a8e6ff','#eefaff','#7fb8d6'],['#d4c1ff','#f6f0ff','#a58fd9'],['#b8f0b0','#f1ffe8','#7fc07a'],['#ffb8d0','#fff0f6','#d98aa8'],['#ffe27a','#fffbe0','#d9b84a']][C.pal];
  const g=c.createLinearGradient(0,0,0,FY);g.addColorStop(0,P6[0]);g.addColorStop(1,P6[1]);c.fillStyle=g;c.fillRect(0,0,800,448);
  c.fillStyle=P6[2];c.fillRect(0,FY,800,90);c.fillStyle='rgba(0,0,0,.12)';c.fillRect(0,FY,800,4);
  for(let i=0;i<8;i++){c.fillStyle='rgba(255,255,255,.35)';const cx=((i*170+t*(.2+i%3*.1))%1000)-100;c.fillRect(cx,50+i*16,60+i%3*20,10);}
  c.save();c.lineJoin='round';try{G.f(c,t,C);}catch(e){}c.restore();
  if(C.big||t<50){for(let i=0;i<46;i++){const a=(t*.02+hsh(i*3.1))%1,x=hsh(i*7.7)*800+Math.sin(t*.05+i)*20,y=a*480-20;c.fillStyle=['#e63946','#ffd84a','#3a86ff','#2ec27e','#ff77b7'][i%5];c.fillRect(x,y,7,4);}}
  const bw=420,by=t<18?-60+t*4:t<26?12-(t-18)*.5:(t>300?8-Math.min(70,(t-300)*3):8);c.fillStyle=OL;c.fillRect(400-bw/2-6,by-2,bw+12,56);c.fillStyle='#ffd84a';c.fillRect(400-bw/2,by+3,bw,46);c.fillStyle='rgba(255,255,255,.4)';c.fillRect(400-bw/2,by+3,bw,6);
  c.font='900 30px system-ui';c.textAlign='center';c.fillStyle=OL;c.fillText(C.title,400,by+37);
  if(t>50){const cap=G.caps[C.cap],n=Math.min(cap.length,Math.floor((t-50)*.7));c.font='800 17px system-ui';const tw=c.measureText(cap).width+36;c.fillStyle=OL;c.fillRect(400-tw/2-4,386,tw+8,50);c.fillStyle='#fff';c.fillRect(400-tw/2,390,tw,42);c.fillStyle=OL;c.textAlign='left';c.fillText(cap.slice(0,n),400-tw/2+18,417);}
  c.textAlign='left';c.font='800 12px system-ui';c.fillStyle='rgba(23,18,31,.75)';c.fillText('▶ tap to skip',12,440);
}
addEventListener('pointerdown',e=>{if(state==='cut'&&CUT&&CUT.t>14&&!paused&&!(e.target.closest&&e.target.closest('#top')))endCut();},true);
addEventListener('keydown',e=>{if(state==='cut'&&CUT&&CUT.t>14&&!paused&&e.code!=='Escape')endCut();},true);

/* ================= WIRING ================= */
const _startLevel2=startLevel;
startLevel=function(){if(MODE==='temple'&&state!=='gmap'){startTemple(TI);return;}if(MODE==='maze'&&state!=='gmap'){startMaze(MI);return;}_startLevel2();};
const _showMenu2=showMenu;
showMenu=function(){MODE='plat';TP=null;MZ=null;CUT=null;CUTARM=false;GM=null;$('gm').classList.add('hide');_showMenu2();};
const _update2=update;
update=function(){if(state==='temple'){tpTick();return;}if(state==='maze'){mzTick();return;}if(state==='cut'){cutTick();return;}if(state==='gmap'||state==='tpwin'||state==='mzwin'){if(TP&&state==='tpwin')tpTickIdle();return;}_update2();};
function tpTickIdle(){TP.t++;for(const q of TP.parts){q.x+=q.vx;q.y+=q.vy;q.vy+=.2;q.l--;}TP.parts=TP.parts.filter(q=>q.l>0);}
const _render2=render;
render=function(){
  ctx.setTransform(RK,0,0,RK,0,0);
  if(state==='temple'||state==='tpwin'){if(TP){drawTemple();return;}}
  if(state==='maze'||state==='mzwin'){if(MZ){drawMaze();return;}}
  if(state==='cut'&&CUT){drawCut();return;}
  if(state==='gmap'&&GM){ctx.fillStyle='#1d1745';ctx.fillRect(0,0,VW,VH);gmDraw();return;}
  _render2();
};
const _win2=win;
win=function(){CUTARM=true;_win2();};
const _sm3=showMsg;
showMsg=function(t,sub,btns){
  if(CUTARM){CUTARM=false;const salt=story?storyIdx:(RUN&&RS&&RS.node?RS.node.i:lvIdx);const big=/BOSS|whole valley|outran|escaped|beat the game/i.test(t);startCut(()=>_sm3(t,sub,btns),{salt,big,title:big?'SUPER CLEAR!!':'LEVEL CLEAR!'});return;}
  _sm3(t,sub,btns);
};

addEventListener('keydown',e=>{if(state==='gmap'&&GM&&!paused){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();gmGo();}else if(e.code==='ArrowRight'&&GM.sel<99){GM.sel++;GM.w=Math.floor(GM.sel/10);gmInfo();}else if(e.code==='ArrowLeft'&&GM.sel>0){GM.sel--;GM.w=Math.floor(GM.sel/10);gmInfo();}}});
$('temple').onclick=()=>openGM('temple');$('maze').onclick=()=>openGM('maze');


/* ================= KITTY PONG + KITTY PAC (turn 3) ================= */
var PG=null,PC=null,PGI=0,PCI=0;
const PGL=['Warm-Up Rally','Yarn Toss','Bumper Cats','Spin Cycle','Double Trouble','Zoomie Serve','Wall Wobble','Catnip Curve','Boss Bout','Grand Pawnament'];
const PCL=['Kibble Dash','Corner Cafe','Zigzag Alley','Tunnel Vision','Big Bowl','Dog Park','Twisty Yard','Nip Rush','Boss Kennel','Grand Pawchase'];
function pgName(i){return WT[Math.floor(i/10)].n+' '+(i%10+1)+' · '+PGL[i%10];}
function pcName(i){return WT[Math.floor(i/10)].n+' '+(i%10+1)+' · '+PCL[i%10];}
PR.pong=PR.pong||{at:0,st:{}};PR.pac=PR.pac||{at:0,st:{}};

/* ---------- PONG ---------- */
function pgCfg(i){
  const w=Math.floor(i/10),k=i%10,R=rngOf(i*6151+5),d=i/99;
  const bump=[];const nb=Math.min(4,Math.floor(k/3)+(w%3===2?1:0)+(i>60?1:0));
  for(let n=0;n<nb;n++)bump.push({x:290+R()*220,y:80+R()*288,r:18+R()*8});
  return {i,w,k,goal:k===9?7:5,ph:Math.max(52,100-i*.45),aiSp:2.3+d*3.6,err:Math.max(4,46-i*.4),bs:4.6+d*3.2,bumpers:bump,mover:k>=4,multi:k>=6,pu:k>=2,v:Math.floor(R()*100),boss:k===9,curve:k%3===2?.045:0};
}
function startPong(i){
  MODE='pong';PGI=i=Math.max(0,Math.min(99,i));audioInit();const C=pgCfg(i);
  PG={i,C,t:0,py:224,ay:224,tgt:null,ph:C.ph,aph:C.ph,ps:0,as:0,balls:[],parts:[],txt:[],pups:[],pw:{grow:0,slow:0,shrink:0},ball2:false,over:null,msgd:0,serveT:70,aoff:0,mover:{y:224,v:2},hits:0,shake:0,trail:[]};
  pgServe(1);state='pong';['menu','msg','gm'].forEach(x=>$(x).classList.add('hide'));
}
function pgServe(dir){const P=PG,a=(Math.random()-.5)*.9;P.balls=[{x:400,y:224,vx:Math.cos(a)*P.C.bs*dir,vy:Math.sin(a)*P.C.bs,r:9,sp:P.C.bs,spin:0}];P.serveT=70;P.ball2=false;P.t2=0;}
function pgSay(x,y,s,c){PG.txt.push({x,y,s,c:c||'#fff',t:0});}
function pgPoint(who){
  const P=PG;if(who==='p')P.ps++;else P.as++;try{who==='p'?sfx.win():sfx.hurt();}catch(_){}
  pgSay(400,200,who==='p'?'POINT! 🐾':'THEY SCORE!','#ffd84a');P.shake=8;
  if(P.ps>=P.C.goal||P.as>=P.C.goal){P.over=who==='p'?'win':'lose';P.msgd=0;if(P.over==='win')pgWin();else try{sfx.lose();}catch(_){}return;}
  pgServe(who==='p'?1:-1);
}
function pgWin(){
  const P=PG,mar=P.ps-P.as,stars=mar>=4?3:mar>=2?2:1;P.stars=stars;PR.pong.st[P.i]=Math.max(PR.pong.st[P.i]||0,stars);PR.pong.at=Math.max(PR.pong.at,P.i+1);savePR();state='pgwin';
  setTimeout(()=>{if(state!=='pgwin'||PG!==P)return;startCut(()=>{state='pgwin';const b=[];if(P.i<99)b.push(['Next match ▶',()=>startPong(P.i+1),'on']);b.push(['Rematch',()=>startPong(P.i)],['Map',()=>openGM('pong')],['Menu',showMenu]);
    showMsg('Match won! 🏓',pgName(P.i)+'\n'+P.ps+' – '+P.as+'   '+'★'.repeat(stars)+'☆'.repeat(3-stars),b);},{salt:P.i+5,title:'MATCH WON!',big:P.C.boss});},700);
}
function pgTick(){
  const P=PG;if(!P)return;P.t++;const C=P.C;
  for(const q of P.parts){q.x+=q.vx;q.y+=q.vy;q.l--;}P.parts=P.parts.filter(q=>q.l>0);for(const q of P.txt)q.t++;P.txt=P.txt.filter(q=>q.t<60);if(P.shake>0)P.shake*=.85;
  if(P.over){P.msgd++;if(P.msgd===50&&P.over==='lose')showMsg('So close! 😿',pgName(P.i)+'\n'+P.ps+' – '+P.as,[['Rematch',()=>startPong(P.i),'on'],['Map',()=>openGM('pong')],['Menu',showMenu]]);return;}
  jPress=0;aPress=0;SWIPE=null;
  // paddle control
  const grow=P.pw.grow>0?1.35:1,ph=P.ph*grow,sp=6.2;
  if(P.tgt!=null){P.py+=Math.max(-9,Math.min(9,P.tgt-P.py));}
  else{if(keys.j)P.py-=sp;if(keys.a)P.py+=sp;}
  P.py=Math.max(ph/2+4,Math.min(448-ph/2-4,P.py));
  for(const k in P.pw)if(P.pw[k]>0)P.pw[k]--;
  const aph=P.aph*(P.pw.shrink>0?.6:1);
  if(C.mover){const m=P.mover;m.y+=m.v;if(m.y<90||m.y>358)m.v*=-1;}
  if(P.serveT>0){P.serveT--;
    const b0=P.balls[0];if(P.serveT===0&&b0){}
    return aiMove(P,aph,null);}
  // powerups
  if(C.pu&&P.t%520===0&&P.pups.length<2){const r=Math.random();P.pups.push({x:300+Math.random()*200,y:60+Math.random()*330,k:r<.45?0:r<.75?1:2,t:0});}
  for(const u of P.pups)u.t++;P.pups=P.pups.filter(u=>u.t<600);
  if(C.multi){P.t2++;if(P.t2===600&&P.balls.length<2){P.balls.push({x:400,y:224,vx:-C.bs,vy:(Math.random()-.5)*3,r:8,sp:C.bs,spin:0});pgSay(400,160,'2nd YARN!','#ff77b7');}}
  for(const b of P.balls){
    const slow=P.pw.slow>0?.55:1;
    b.vy+=(C.curve*Math.sign(b.vx||1))*b.sp*.2;
    const spd=Math.hypot(b.vx,b.vy)||1;b.x+=b.vx*slow;b.y+=b.vy*slow;
    if(b.y<b.r){b.y=b.r;b.vy=Math.abs(b.vy);try{tone(300,.05,'square',.03);}catch(_){}}
    if(b.y>448-b.r){b.y=448-b.r;b.vy=-Math.abs(b.vy);try{tone(300,.05,'square',.03);}catch(_){}}
    // player paddle
    if(b.vx<0&&b.x-b.r<40&&b.x>16&&Math.abs(b.y-P.py)<ph/2+b.r){const off=(b.y-P.py)/(ph/2),a=off*1.0;b.sp=Math.min(13,b.sp*1.045);b.vx=Math.cos(a)*b.sp;b.vy=Math.sin(a)*b.sp;b.x=40+b.r;P.hits++;try{sfx.meow();}catch(_){}pgBurst(b.x,b.y,'#ffd84a');P.aoff=(Math.random()-.5)*C.err*2;}
    // ai paddle
    if(b.vx>0&&b.x+b.r>760&&b.x<784&&Math.abs(b.y-P.ay)<aph/2+b.r){const off=(b.y-P.ay)/(aph/2),a=off*1.0;b.vx=-Math.cos(a)*b.sp;b.vy=Math.sin(a)*b.sp;b.x=760-b.r;try{tone(220,.08,'square',.05);}catch(_){}pgBurst(b.x,b.y,'#ff77b7');}
    for(const bm of C.bumpers){const dx=b.x-bm.x,dy=b.y-bm.y,d=Math.hypot(dx,dy),rr=bm.r+b.r;if(d<rr&&d>0){const nx=dx/d,ny=dy/d,dot=b.vx*nx+b.vy*ny;if(dot<0){b.vx-=2*dot*nx;b.vy-=2*dot*ny;}b.x=bm.x+nx*rr;b.y=bm.y+ny*rr;bm.hit=8;try{tone(520,.06,'triangle',.05);}catch(_){}pgBurst(b.x,b.y,'#6ee7ff');}if(bm.hit>0)bm.hit--;}
    if(C.mover){const m=P.mover,hx=Math.abs(b.x-400)<7+b.r,hy=Math.abs(b.y-m.y)<40+b.r;if(hx&&hy){b.vx*=-1;b.x+=b.vx>0?10:-10;try{tone(180,.07,'square',.05);}catch(_){}}}
    // keep speed sane
    const s2=Math.hypot(b.vx,b.vy);if(Math.abs(b.vx)<1.6){b.vx=1.6*Math.sign(b.vx||1);}if(s2>14){b.vx*=14/s2;b.vy*=14/s2;}
    // powerups pick
    for(const u of P.pups)if(Math.hypot(u.x-b.x,u.y-b.y)<22){u.t=9999;if(u.k===0){P.pw.grow=480;pgSay(60,P.py-60,'BIG PAW!','#ffd84a');}else if(u.k===1){P.pw.slow=300;pgSay(b.x,b.y-24,'NIP SLOW-MO','#c08bff');}else{P.pw.shrink=420;pgSay(700,P.ay-60,'MOUSE SCARE!','#9fe870');}try{sfx.check();}catch(_){}}
  }
  P.trail.push(P.balls.map(b=>[b.x,b.y]));if(P.trail.length>8)P.trail.shift();
  // scoring
  const out=P.balls.filter(b=>b.x<-12||b.x>812);
  if(out.length){const b=out[0];if(P.balls.length>1){P.balls=P.balls.filter(x=>x!==b);pgSay(400,200,b.x<0?'THEY SCORE':'POINT!',b.x<0?'#ff4d6d':'#ffd84a');if(b.x<0)P.as++;else P.ps++;if(P.ps>=C.goal||P.as>=C.goal){P.over=P.ps>P.as?'win':'lose';P.msgd=0;if(P.over==='win')pgWin();}return;}pgPoint(b.x<0?'a':'p');return;}
  aiMove(P,aph,P.balls);
}
function aiMove(P,aph,balls){
  const C=P.C;let ty=224;
  if(balls&&balls.length){let best=null;for(const b of balls)if(b.vx>0&&(!best||b.x>best.x))best=b;if(best)ty=best.y+P.aoff;else ty=224+Math.sin(P.t*.03)*60;}
  const d=ty-P.ay;P.ay+=Math.max(-C.aiSp,Math.min(C.aiSp,d));P.ay=Math.max(aph/2+4,Math.min(448-aph/2-4,P.ay));
}
function pgBurst(x,y,c){for(let n=0;n<8;n++){const a=Math.random()*6.28;PG.parts.push({x,y,vx:Math.cos(a)*3,vy:Math.sin(a)*3,l:18,m:18,c});}}
function drawPong(){
  const P=PG,C=P.C,c=ctx,t=WT[C.w];
  c.save();if(P.shake>.5)c.translate((Math.random()-.5)*P.shake,(Math.random()-.5)*P.shake);
  c.fillStyle=shd(t.side,-.45);c.fillRect(-10,-10,820,468);
  for(let y=0;y<448;y+=56){c.fillStyle='rgba(255,255,255,.04)';c.fillRect(0,y,800,28);}
  c.fillStyle=shd(t.acc,-.2);c.globalAlpha=.35;for(let y=14;y<448;y+=34){c.fillRect(397,y,6,18);}c.globalAlpha=1;
  c.fillStyle=t.acc;c.fillRect(0,0,800,5);c.fillRect(0,443,800,5);
  // goal glow zones
  glow(c,0,224,160,'110,231,255',.12);glow(c,800,224,160,'255,119,183',.12);
  for(const bm of C.bumpers){c.beginPath();c.arc(bm.x,bm.y,bm.r+(bm.hit||0)*.4,0,7);fillOL(c,t.acc,3);c.beginPath();c.arc(bm.x,bm.y,bm.r*.55,0,7);fillOL(c,'#fff',2);c.fillStyle=OL;c.beginPath();c.arc(bm.x-5,bm.y-3,2.4,0,7);c.arc(bm.x+5,bm.y-3,2.4,0,7);c.fill();c.beginPath();c.moveTo(bm.x-8,bm.y-bm.r*.5);c.lineTo(bm.x-12,bm.y-bm.r*.95);c.lineTo(bm.x-2,bm.y-bm.r*.6);c.moveTo(bm.x+8,bm.y-bm.r*.5);c.lineTo(bm.x+12,bm.y-bm.r*.95);c.lineTo(bm.x+2,bm.y-bm.r*.6);c.stroke();}
  if(C.mover){c.beginPath();c.rect(393,P.mover.y-40,14,80);fillOL(c,shd(t.wall,.1),3);c.fillStyle=t.acc;for(let i=0;i<4;i++)c.fillRect(395,P.mover.y-34+i*20,10,5);}
  for(const u of P.pups){const bob=Math.sin(u.t*.1)*3;if(u.k===0)tpFish(c,u.x,u.y+bob,1.5);else if(u.k===1){glow(c,u.x,u.y,24,'192,139,255',.6);c.beginPath();c.arc(u.x,u.y+bob,10,0,7);fillOL(c,'#9fe870',2);}else{c.beginPath();c.ellipse(u.x,u.y+bob,11,7,0,0,7);fillOL(c,'#b9b9c4',2);c.beginPath();c.arc(u.x+10,u.y+bob,4,0,7);fillOL(c,'#b9b9c4',1.6);c.beginPath();c.moveTo(u.x-10,u.y+bob);c.quadraticCurveTo(u.x-20,u.y+bob-6,u.x-24,u.y+bob+2);c.strokeStyle='#e8a0b0';c.lineWidth=2;c.stroke();}}
  const grow=P.pw.grow>0?1.35:1,ph=P.ph*grow,aph=P.aph*(P.pw.shrink>0?.6:1);
  // opponent critter + paddle
  const crit=critSz(C.v),cs=C.boss?2.4:1.9;drawCritArt(c,C.v,786,P.ay+crit[1]*cs*.5,crit[0]*cs,crit[1]*cs,-1,P.t);
  c.beginPath();c.rect(762,P.ay-aph/2,14,aph);fillOL(c,'#ff77b7',3);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(764,P.ay-aph/2+2,3,aph-4);
  // player cat + paddle
  const cat=CATS[sel],k=.78,cw=cat.w*SPR*k,chh=cat.h*SPR*k;drawCat(c,cat,-6,P.py-chh/2,cw,chh,1,P.t,{run:0});
  c.beginPath();c.rect(24,P.py-ph/2,14,ph);fillOL(c,'#6ee7ff',3);c.fillStyle='rgba(255,255,255,.4)';c.fillRect(26,P.py-ph/2+2,3,ph-4);
  for(let n=0;n<3;n++){c.fillStyle='#17121f';c.beginPath();c.arc(31,P.py-ph/2+ph*(.25+n*.25),3,0,7);c.fill();}
  // trail + balls
  for(let n=0;n<P.trail.length;n++)for(const q of P.trail[n]||[]){c.globalAlpha=n/P.trail.length*.3;c.fillStyle='#ff77b7';c.beginPath();c.arc(q[0],q[1],7,0,7);c.fill();}c.globalAlpha=1;
  for(const b of P.balls){c.save();c.translate(b.x,b.y);c.rotate(P.t*.12);c.beginPath();c.arc(0,0,b.r,0,7);fillOL(c,'#ff4f9a',2.4);c.strokeStyle='#ffd1e8';c.lineWidth=1.6;c.beginPath();c.arc(0,0,b.r*.6,.3,2.6);c.moveTo(-b.r*.8,b.r*.1);c.quadraticCurveTo(0,-b.r*.7,b.r*.8,b.r*.2);c.stroke();c.restore();}
  if(P.serveT>0){const b=P.balls[0];if(b){c.beginPath();c.arc(b.x,b.y,b.r+4+Math.sin(P.t*.3)*2,0,7);c.strokeStyle='#fff';c.lineWidth=2;c.stroke();}}
  for(const q of P.parts){c.globalAlpha=q.l/q.m;c.fillStyle=q.c;c.fillRect(q.x-2,q.y-2,4,4);}c.globalAlpha=1;
  c.font='bold 17px system-ui';c.textAlign='center';for(const q of P.txt){c.globalAlpha=1-q.t/60;c.lineWidth=4;c.strokeStyle=OL;c.strokeText(q.s,q.x,q.y-q.t*.5);c.fillStyle=q.c;c.fillText(q.s,q.x,q.y-q.t*.5);}c.globalAlpha=1;
  c.restore();
  c.font='900 40px system-ui';c.textAlign='center';c.lineWidth=6;c.strokeStyle=OL;[[340,P.ps,'#6ee7ff'],[460,P.as,'#ff77b7']].forEach(a=>{c.strokeText(String(a[1]),a[0],56);c.fillStyle=a[2];c.fillText(String(a[1]),a[0],56);});
  c.font='800 12px system-ui';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.7)';c.fillStyle='#fff';const nm=pgName(P.i)+'  ·  first to '+C.goal;c.strokeText(nm,400,76);c.fillText(nm,400,76);
  if(P.t<240){const s='▲ ▼ or drag to move your paddle';c.strokeText(s,400,430);c.fillText(s,400,430);}
  if(P.serveT>0&&!P.over){const n=Math.ceil(P.serveT/24);c.font='900 60px system-ui';c.lineWidth=7;c.strokeStyle=OL;c.strokeText(String(n),400,150);c.fillStyle='#ffd84a';c.fillText(String(n),400,150);}
}

/* ---------- KITTY PAC ---------- */
const PTS=21,PGW=31,PGH=21,PGX=74,PGY=3;
function pcGen(i){
  const w=Math.floor(i/10),k=i%10,R=rngOf(i*9973+3),d=i/99;
  const W=PGW,H=PGH,cx=8,cy=10;const g=Array.from({length:H},()=>Array(W).fill('#'));
  const vis=Array.from({length:cy},()=>Array(cx).fill(false)),st=[[0,0]];vis[0][0]=true;g[1][1]=' ';
  const carve=(x,y)=>{g[y][x]=' ';g[y][W-1-x]=' ';};carve(1,1);
  while(st.length){const [x,y]=st[st.length-1],nb=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>{const nx=x+a,ny=y+b;return nx>=0&&ny>=0&&nx<cx&&ny<cy&&!vis[ny][nx];});
    if(!nb.length){st.pop();continue;}const [a,b]=nb[Math.floor(R()*nb.length)],nx=x+a,ny=y+b;vis[ny][nx]=true;carve(x*2+1+a,y*2+1+b);carve(nx*2+1,ny*2+1);st.push([nx,ny]);}
  const open=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&g[y][x]!=='#';
  // braid: open extra walls (more with higher k) then kill dead ends
  const extra=Math.floor(25+R()*30+k*3);
  for(let n=0;n<extra;n++){const x=1+Math.floor(R()*(cx*2-1)),y=1+Math.floor(R()*(H-2));if(g[y][x]==='#'&&((x%2===0)!==(y%2===0))&&x<W-1)carve(x,y);}
  for(let pass=0;pass<3;pass++)for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(!open(x,y))continue;const ns=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>open(x+a,y+b));if(ns.length<=1){const cand=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>{const nx=x+a,ny=y+b;return nx>0&&ny>0&&nx<W-1&&ny<H-1&&g[ny][nx]==='#';});if(cand.length){const [a,b]=cand[Math.floor(R()*cand.length)];carve(x+a,y+b);}}}
  // ghost house (centre) + tunnel
  const hx=15,hy=10;for(let y=hy-1;y<=hy+1;y++)for(let x=hx-2;x<=hx+2;x++)g[y][x]=' ';
  const tunnel=k%2===0&&i>2;if(tunnel){g[hy][0]=' ';g[hy][W-1]=' ';g[hy][1]=' ';g[hy][W-2]=' ';}
  // pellets
  const pel=Array.from({length:H},()=>Array(W).fill(0));let total=0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(g[y][x]!=='#'&&!(Math.abs(x-hx)<=2&&Math.abs(y-hy)<=1)&&!(x===15&&y===H-2)){pel[y][x]=1;total++;}
  // power pellets: 4 far corners
  const pw=[];[[1,1],[W-2,1],[1,H-2],[W-2,H-2]].forEach(([x,y])=>{let best=null,bd=1e9;for(let yy=1;yy<H-1;yy++)for(let xx=1;xx<W-1;xx++)if(pel[yy][xx]===1){const dd=Math.abs(xx-x)+Math.abs(yy-y);if(dd<bd){bd=dd;best=[xx,yy];}}if(best&&pel[best[1]][best[0]]===1){pel[best[1]][best[0]]=2;pw.push(best);}});
  // BFS from house for eaten ghosts
  const dist=Array.from({length:H},()=>Array(W).fill(-1)),q=[[hx,hy]];dist[hy][hx]=0;
  for(let h=0;h<q.length;h++){const [x,y]=q[h];for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){let nx=x+a,ny=y+b;if(tunnel&&y===hy){if(nx<0)nx=W-1;if(nx>=W)nx=0;}if(open(nx,ny)&&dist[ny][nx]<0){dist[ny][nx]=dist[y][x]+1;q.push([nx,ny]);}}}
  // unreachable floor -> wall
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(g[y][x]!=='#'&&dist[y][x]<0){g[y][x]='#';if(pel[y][x]){pel[y][x]=0;total--;}}
  const ng=Math.min(5,2+Math.floor(i/22)+(k===9?1:0)),gh=[];
  for(let n=0;n<ng;n++)gh.push({v:Math.floor(R()*100),kind:n%4,delay:n*140+30});
  return {w,k,g,pel,total,pw,tunnel,hx,hy,dist,gh,sp:.085+d*.03,gsp:.07+d*.045,fright:Math.max(150,430-i*3),treat:i%5,sx:15,sy:H-2,W,H};
}
function startPac(i){
  MODE='pac';PCI=i=Math.max(0,Math.min(99,i));audioInit();const M=pcGen(i);
  PC={i,M,pel:M.pel.map(r=>r.slice()),left:M.total,score:0,lives:3,t:0,over:null,msgd:0,parts:[],txt:[],treat:null,eaten:0,combo:0,fr:0,ph:0,next:'l'};
  pcReset();state='pac';['menu','msg','gm'].forEach(x=>$(x).classList.add('hide'));
}
function pcReset(){
  const Z=PC,M=Z.M;Z.p={tx:M.sx,ty:M.sy,dx:0,dy:0,p:0,face:1,dead:0};Z.want=null;Z.fr=0;Z.ready=100;
  Z.gh=M.gh.map((g,n)=>({v:g.v,kind:g.kind,tx:M.hx+(n%3-1),ty:M.hy,dx:0,dy:0,p:0,delay:g.delay,mode:'house',tm:0,dir:1}));
}
function pcOpen(M,x,y){if(M.tunnel&&y===M.hy){if(x<0)x=M.W-1;else if(x>=M.W)x=0;}return x>=0&&y>=0&&x<M.W&&y<M.H&&M.g[y][x]!=='#';}
function pcWrap(M,x,y){if(M.tunnel&&y===M.hy){if(x<0)return M.W-1;if(x>=M.W)return 0;}return x;}
function pcSay(x,y,s,c){PC.txt.push({x,y,s,c:c||'#fff',t:0});}
function pcPart(x,y,c,n){for(let q=0;q<n;q++){const a=Math.random()*6.28;PC.parts.push({x,y,vx:Math.cos(a)*2.2,vy:Math.sin(a)*2.2,l:22,m:22,c});}}
function pcTick(){
  const Z=PC;if(!Z)return;Z.t++;const M=Z.M,p=Z.p;
  for(const q of Z.parts){q.x+=q.vx;q.y+=q.vy;q.l--;}Z.parts=Z.parts.filter(q=>q.l>0);for(const q of Z.txt)q.t++;Z.txt=Z.txt.filter(q=>q.t<55);
  if(Z.over){Z.msgd++;if(Z.msgd===50&&Z.over==='lose')showMsg('The dogs got you! 🐕',pcName(Z.i)+'\n⭐ '+Z.score,[['Try again',()=>startPac(Z.i),'on'],['Map',()=>openGM('pac')],['Menu',showMenu]]);return;}
  jPress=0;aPress=0;
  const sw=SWIPE;SWIPE=null;if(sw)Z.want={l:[-1,0],r:[1,0],u:[0,-1],d:[0,1]}[sw];
  if(keys.l)Z.want=[-1,0];else if(keys.r)Z.want=[1,0];else if(keys.j)Z.want=[0,-1];else if(keys.a)Z.want=[0,1];
  if(p.dead>0){p.dead--;if(p.dead===0){Z.lives--;if(Z.lives<=0){Z.over='lose';Z.msgd=0;try{sfx.lose();}catch(_){}}else pcReset();}return;}
  if(Z.ready>0){Z.ready--;return;}
  if(Z.fr>0){Z.fr--;if(Z.fr===0)Z.combo=0;}
  // pac move
  const sp=M.sp*(Z.fr>0?1.1:1);
  const step=(e,spd)=>{e.p+=spd;return e.p>=1;};
  if(p.dx===0&&p.dy===0){if(Z.want&&pcOpen(M,p.tx+Z.want[0],p.ty+Z.want[1])){p.dx=Z.want[0];p.dy=Z.want[1];p.p=0;if(p.dx)p.face=p.dx;}}
  else{
    if(Z.want&&Z.want[0]===-p.dx&&Z.want[1]===-p.dy&&(p.dx||p.dy)){p.tx=pcWrap(M,p.tx+p.dx,p.ty);p.ty+=p.dy;p.dx=-p.dx;p.dy=-p.dy;p.p=1-p.p;if(p.dx)p.face=p.dx;}
    if(step(p,sp)){p.tx=pcWrap(M,p.tx+p.dx,p.ty);p.ty+=p.dy;p.p=0;
      // eat
      const v=Z.pel[p.ty][p.tx];if(v){Z.pel[p.ty][p.tx]=0;Z.left--;if(v===1){Z.score+=10;try{const f=820+(Z.left%3)*70;tone(f,.11,'triangle',.016,-260);setTimeout(()=>tone(f*.8,.07,'sine',.01,-120),45);}catch(_){}}else{Z.score+=50;Z.fr=M.fright;Z.combo=0;try{sfx.check();tone(660,.4,'triangle',.05,600);}catch(_){}pcSay(PGX+p.tx*PTS,PGY+p.ty*PTS,'CATNIP!','#c08bff');for(const g of Z.gh)if(g.mode==='chase'||g.mode==='scatter'){g.mode='fright';g.dx=-g.dx;g.dy=-g.dy;g.p=1-g.p;g.tx=pcWrap(M,g.tx+g.dx,g.ty);g.ty+=g.dy;g.dx=-g.dx;g.dy=-g.dy;}}}
      const eatN=M.total-Z.left;
      if(!Z.treat&&(eatN===70||eatN===170)&&Z.eaten<2){Z.treat={x:M.sx,y:M.sy,t:600};Z.eaten++;}
      if(Z.treat&&p.tx===Z.treat.x&&p.ty===Z.treat.y){const pts=[100,300,500,700,1000][M.treat];Z.score+=pts;pcSay(PGX+p.tx*PTS,PGY+p.ty*PTS,'+'+pts,'#ffd84a');Z.treat=null;try{sfx.coin();}catch(_){}pcPart(PGX+p.tx*PTS+10,PGY+p.ty*PTS+10,'#ffd84a',10);}
      if(Z.left<=0){pcWin();return;}
      if(Z.want&&pcOpen(M,p.tx+Z.want[0],p.ty+Z.want[1])){p.dx=Z.want[0];p.dy=Z.want[1];}
      else if(!pcOpen(M,p.tx+p.dx,p.ty+p.dy)){p.dx=0;p.dy=0;}
      if(p.dx)p.face=p.dx;
    }
  }
  if(Z.treat){Z.treat.t--;if(Z.treat.t<=0)Z.treat=null;}
  // ghosts
  const ppos=pcPos(p);
  Z.gh.forEach((g,n)=>{
    g.tm++;
    if(g.mode==='house'){if(g.tm>g.delay){g.mode='leave';}g.ty=M.hy+Math.round(Math.sin(g.tm*.15));return;}
    let spd=M.gsp*(g.mode==='fright'?.6:g.mode==='eyes'?2.2:1);if(Z.fr<=0&&g.mode==='fright')g.mode='chase';
    if(g.mode==='leave'){ // walk to above-house exit (nearest open tile north of house)
      g.mode='chase';g.dx=0;g.dy=0;g.p=0;g.tx=M.hx;g.ty=M.hy-2;if(!pcOpen(M,g.tx,g.ty)){g.ty=M.hy;}}
    if(g.dx===0&&g.dy===0)pcGhostPick(Z,g,n);
    g.p+=spd;
    if(g.p>=1){g.tx=pcWrap(M,g.tx+g.dx,g.ty);g.ty+=g.dy;g.p=0;if(g.mode==='eyes'&&g.tx===M.hx&&g.ty===M.hy){g.mode='house';g.tm=0;g.delay=60;g.dx=0;g.dy=0;}else pcGhostPick(Z,g,n);}
    // collide
    const gp=pcPos(g);if(Math.hypot(gp[0]-ppos[0],gp[1]-ppos[1])<.62&&g.mode!=='eyes'&&g.mode!=='house'){
      if(g.mode==='fright'){g.mode='eyes';Z.combo++;const pts=200*Math.pow(2,Math.min(3,Z.combo-1));Z.score+=pts;pcSay(PGX+gp[0]*PTS+10,PGY+gp[1]*PTS,'+'+pts,'#6ee7ff');try{sfx.stomp();}catch(_){}pcPart(PGX+gp[0]*PTS+10,PGY+gp[1]*PTS+10,critInfo(g.v).body,12);}
      else{p.dead=70;try{sfx.hurt();}catch(_){}pcPart(PGX+ppos[0]*PTS+10,PGY+ppos[1]*PTS+10,'#ff4d6d',16);}
    }
  });
}
function pcPos(e){return [e.tx+e.dx*e.p,e.ty+e.dy*e.p];}
function pcGhostPick(Z,g,n){
  const M=Z.M,p=Z.p;const dirs=[[1,0],[-1,0],[0,-1],[0,1]].filter(([a,b])=>pcOpen(M,g.tx+a,g.ty+b));if(!dirs.length){g.dx=0;g.dy=0;return;}
  let ch=dirs.filter(([a,b])=>!(a===-g.dx&&b===-g.dy&&(g.dx||g.dy)));if(!ch.length)ch=dirs;
  let pick;
  if(g.mode==='eyes'){let bd=1e9;for(const d of dirs){const nx=pcWrap(M,g.tx+d[0],g.ty),ny=g.ty+d[1],dd=M.dist[ny][nx];if(dd>=0&&dd<bd){bd=dd;pick=d;}}}
  else if(g.mode==='fright'||(g.kind===2&&hsh(g.tm*.7+n)<.6)){pick=ch[Math.floor(hsh(g.tm*1.7+n*5)*ch.length)];}
  else{let tx=p.tx,ty=p.ty;if(g.kind===1){tx+=p.dx*4;ty+=p.dy*4;}else if(g.kind===3&&Math.hypot(g.tx-p.tx,g.ty-p.ty)<7){tx=1;ty=M.H-2;}
    if(Math.floor(g.tm/700)%2===1&&g.kind!==0){tx=(n%2?M.W-2:1);ty=(n<2?1:M.H-2);}
    let bd=1e9;for(const d of ch){const dd=Math.hypot(g.tx+d[0]-tx,g.ty+d[1]-ty);if(dd<bd){bd=dd;pick=d;}}}
  g.dx=pick[0];g.dy=pick[1];if(g.dx)g.dir=g.dx;
}
function pcWin(){
  const Z=PC;Z.over='win';const st=Z.lives>=3?3:Z.lives===2?2:1;Z.stars=st;PR.pac.st[Z.i]=Math.max(PR.pac.st[Z.i]||0,st);PR.pac.at=Math.max(PR.pac.at,Z.i+1);savePR();state='pcwin';try{sfx.win();}catch(_){}
  setTimeout(()=>{if(state!=='pcwin'||PC!==Z)return;startCut(()=>{state='pcwin';const b=[];if(Z.i<99)b.push(['Next maze ▶',()=>startPac(Z.i+1),'on']);b.push(['Replay',()=>startPac(Z.i)],['Map',()=>openGM('pac')],['Menu',showMenu]);
    showMsg('Kibble cleared! 🐾',pcName(Z.i)+'\n⭐ '+Z.score+'   '+'★'.repeat(st)+'☆'.repeat(3-st),b);},{salt:Z.i+9,title:'ALL KIBBLE EATEN!',big:Z.M.k===9});},700);
}
function drawPac(){
  const Z=PC,M=Z.M,c=ctx,t=WT[M.w],wl=t.wall,edge=shd(t.acc,.1);
  c.fillStyle=shd(t.wall,-.78);c.fillRect(0,0,800,448);
  c.save();c.translate(PGX,PGY);
  for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++){
    if(M.g[y][x]==='#'){c.fillStyle=shd(wl,-.35);c.fillRect(x*PTS,y*PTS,PTS,PTS);}
  }
  c.strokeStyle=edge;c.lineWidth=2.4;c.lineCap='round';
  for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++){if(M.g[y][x]!=='#')continue;const X=x*PTS,Y=y*PTS;
    c.beginPath();if(y>0&&M.g[y-1][x]!=='#'){c.moveTo(X,Y+1);c.lineTo(X+PTS,Y+1);}if(y<M.H-1&&M.g[y+1][x]!=='#'){c.moveTo(X,Y+PTS-1);c.lineTo(X+PTS,Y+PTS-1);}if(x>0&&M.g[y][x-1]!=='#'){c.moveTo(X+1,Y);c.lineTo(X+1,Y+PTS);}if(x<M.W-1&&M.g[y][x+1]!=='#'){c.moveTo(X+PTS-1,Y);c.lineTo(X+PTS-1,Y+PTS);}c.stroke();}
  // house marker
  c.fillStyle='rgba(255,255,255,.07)';c.fillRect((M.hx-2)*PTS,(M.hy-1)*PTS,5*PTS,3*PTS);
  // pellets
  for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++){const v=Z.pel[y][x];if(!v)continue;const X=x*PTS+10,Y=y*PTS+10;
    if(v===1){c.fillStyle='#ffb23a';c.beginPath();c.ellipse(X,Y,3.6,2.6,.5,0,7);c.fill();c.fillStyle='#fff3a0';c.fillRect(X-1,Y-1,1.5,1.5);}
    else{const pu=1+Math.sin(Z.t*.15)*.2;glow(c,X,Y,16,'159,232,112',.5);c.beginPath();c.arc(X,Y,6*pu,0,7);fillOL(c,'#9fe870',1.8);}}
  if(Z.treat){const X=Z.treat.x*PTS+10,Y=Z.treat.y*PTS+10;c.save();c.translate(X,Y);c.scale(.8,.8);if(M.treat===0)tpFish(c,0,0,1.3);else if(M.treat===1){c.beginPath();c.rect(-6,-9,12,17);fillOL(c,'#fff',1.8);c.fillStyle='#6ec8ff';c.fillRect(-6,-4,12,5);}else if(M.treat===2){mzTreat(c,0,0,1,0);}else if(M.treat===3){c.beginPath();c.ellipse(0,0,10,6,0,0,7);fillOL(c,'#b9b9c4',2);}else mzTreat(c,0,0,4,0);c.restore();}
  // ghosts
  const ppos=pcPos(Z.p);
  for(const g of Z.gh){const gp=pcPos(g),X=gp[0]*PTS+10,Y=gp[1]*PTS+16,fr=g.mode==='fright',fl=fr&&Z.fr<90&&Math.floor(Z.t/8)%2;
    if(g.mode==='eyes'){c.fillStyle='#fff';[-4,4].forEach(o=>{c.beginPath();c.arc(X+o,Y-9,3.4,0,7);c.fill();c.fillStyle=OL;c.fillRect(X+o-1,Y-9,2,2);c.fillStyle='#fff';});continue;}
    drawCritArt(c,g.v,X,Y,24,22,g.dir||1,Z.t+g.v);
    if(fr){c.globalAlpha=.6;c.fillStyle=fl?'#fff':'#3a5cff';c.beginPath();c.ellipse(X,Y-10,13,12,0,0,7);c.fill();c.globalAlpha=1;c.fillStyle='#fff';c.fillRect(X-5,Y-13,3,3);c.fillRect(X+2,Y-13,3,3);}
    if(g.mode==='house'&&false){}
  }
  // pac cat
  const p=Z.p,cat=CATS[sel],k=.5,w=cat.w*SPR*k,h=cat.h*SPR*k,X=ppos[0]*PTS+10,Y=ppos[1]*PTS+17;
  if(p.dead>0){const a=1-p.dead/70;c.save();c.translate(X,Y-8);c.rotate(a*12);c.scale(1-a*.8,1-a*.8);drawCat(c,cat,-w/2,-h/2,w,h,1,Z.t,{});c.restore();}
  else{if(Z.fr>0)glow(c,X,Y-8,26,'192,139,255',.5);drawCat(c,cat,X-w/2,Y-h,w,h,p.face,Z.t,{run:p.dx||p.dy?1:0});}
  for(const q of Z.parts){c.globalAlpha=q.l/q.m;c.fillStyle=q.c;c.fillRect(q.x-PGX-2,q.y-PGY-2,4,4);}c.globalAlpha=1;
  c.font='bold 13px system-ui';c.textAlign='center';for(const q of Z.txt){c.globalAlpha=1-q.t/55;c.lineWidth=3;c.strokeStyle=OL;c.strokeText(q.s,q.x-PGX,q.y-PGY-q.t*.4);c.fillStyle=q.c;c.fillText(q.s,q.x-PGX,q.y-PGY-q.t*.4);}c.globalAlpha=1;
  if(Z.ready>0&&!Z.over){c.font='900 22px system-ui';c.lineWidth=5;c.strokeStyle=OL;c.strokeText('READY!',M.hx*PTS+10,(M.hy+3)*PTS);c.fillStyle='#ffd84a';c.fillText('READY!',M.hx*PTS+10,(M.hy+3)*PTS);}
  c.restore();
  c.textAlign='left';c.font='900 18px system-ui';c.lineWidth=4;c.strokeStyle=OL;c.fillStyle='#ffd84a';c.strokeText('⭐ '+Z.score,6,34);c.fillText('⭐ '+Z.score,6,34);
  for(let n=0;n<3;n++){c.fillStyle=n<Z.lives?'#ff4d6d':'rgba(255,255,255,.25)';c.strokeText('♥',6+n*20,58);c.fillText('♥',6+n*20,58);}
  c.font='800 11px system-ui';c.fillStyle='#fff';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.7)';c.strokeText('🐟 left '+Z.left,6,82);c.fillText('🐟 left '+Z.left,6,82);
  c.textAlign='right';const nm=pcName(Z.i).split(' · ');c.strokeText(nm[0],794,34);c.fillText(nm[0],794,34);c.strokeText(nm[1],794,50);c.fillText(nm[1],794,50);
  if(Z.fr>0){c.fillStyle='#c08bff';c.fillRect(710,70,6,Math.min(100,Z.fr/M.fright*100));}
}
/* ---------- wiring (pong + pac) ---------- */
const NAMEF={temple:tpName,maze:mzName,pong:pgName,pac:pcName},STARTF={temple:startTemple,maze:startMaze,pong:startPong,pac:startPac};
const TITLEF={temple:'🏛️ KITTY TEMPLE RUN',maze:'🧩 KITTY MAZE',pong:'🏓 KITTY PONG',pac:'🐾 KITTY PAC'};
const _u3=update;update=function(){if(state==='pong'){pgTick();return;}if(state==='pac'){pcTick();return;}if(state==='pgwin'||state==='pcwin'){return;}_u3();};
const _r3=render;render=function(){ctx.setTransform(RK,0,0,RK,0,0);if((state==='pong'||state==='pgwin')&&PG){drawPong();return;}if((state==='pac'||state==='pcwin')&&PC){drawPac();return;}_r3();};
const _sl3=startLevel;startLevel=function(){if(MODE==='pong'&&state!=='gmap'){startPong(PGI);return;}if(MODE==='pac'&&state!=='gmap'){startPac(PCI);return;}_sl3();};
const _sm4=showMenu;showMenu=function(){PG=null;PC=null;_sm4();};
(function(){
  const rect=e=>cv.getBoundingClientRect();
  const mv=e=>{if(state!=='pong'||!PG||e.pointerType==='mouse'&&!e.buttons)return;const r=rect(),y=(e.clientY-r.top)*448/r.height;PG.tgt=y;};
  cv.addEventListener('pointerdown',mv);cv.addEventListener('pointermove',mv);
  addEventListener('keydown',e=>{if(state==='pong'&&PG&&(e.code==='ArrowUp'||e.code==='ArrowDown'||e.code==='KeyW'||e.code==='KeyS'))PG.tgt=null;});
})();
$('pong').onclick=()=>openGM('pong');$('pac').onclick=()=>openGM('pac');


/* ================= PERFORMANCE + TOUCH GESTURES (turn 4) ================= */
const CHK=16,TPAD=40,TCACHE=new Map();let TCL=null;
const _drawTiles0=drawTiles;
drawTiles=function(){
  if(TCL!==L){TCACHE.clear();TCL=L;}
  const c0=Math.max(0,Math.floor(cam/TS)),c1=Math.min(L.W-1,Math.floor((cam+VW)/TS)),rc=Math.round(cam);
  for(let k=Math.floor(c0/CHK);k<=Math.floor(c1/CHK);k++){
    let e=TCACHE.get(k);
    if(!e||(e.W!==L.W&&e.W<(k+1)*CHK)){
      if(!e){e={cv:document.createElement('canvas')};e.cv.width=CHK*TS+TPAD*2;e.cv.height=ROWS*TS+TPAD;TCACHE.set(k,e);}
      e.W=L.W;const g=e.cv.getContext('2d');g.clearRect(0,0,e.cv.width,e.cv.height);
      const sc=cam,sctx=ctx;ctx=g;cam=k*CHK*TS-TPAD;TF=1;TC0=k*CHK;TC1=Math.min(L.W-1,k*CHK+CHK-1);
      g.save();g.translate(0,TPAD);
      try{_drawTiles0();}finally{g.restore();ctx=sctx;cam=sc;TF=0;}
    }
    ctx.drawImage(e.cv,k*CHK*TS-TPAD-rc,-TPAD);
  }
  if(TCACHE.size>12){for(const key of [...TCACHE.keys()]){if(Math.abs(key-c0/CHK)>5)TCACHE.delete(key);}}
  TF=2;try{_drawTiles0();}finally{TF=0;}
};
const _bc2=breakCrate;
breakCrate=function(tx,ty){_bc2(tx,ty);TCACHE.delete(Math.floor(tx/CHK));};
// unified touch gestures: swipe / tap (no on-screen buttons needed)
// platformer + runner: swipe UP = jump (keep finger down for a higher jump), swipe DOWN = slam (any cat, in the air; ACT on the ground)
// runner also: tap or press-and-hold = jump
function slamNow(){const p=P;if(!p||p.onGround||p.slamming||p.dashT>0)return false;p.slamming=true;p.vy=13;p.vx=0;p.buf=0;try{sfx.slam();}catch(_){}return true;}
(function(){
  let s=null;const TH=24,HOLD=160;
  const plat=()=>state==='play'&&!!P;
  const active=()=>!paused&&(plat()||state==='temple'||state==='maze'||state==='pac');
  const jumpOn=()=>{if(s&&!s.j){s.j=true;setKey('j',1);}};
  cv.addEventListener('pointerdown',e=>{
    if(!active()||s)return;audioInit();
    s={id:e.pointerId,x:e.clientX,y:e.clientY,t:performance.now(),done:false,pl:plat(),run:plat()&&RUN,j:false,tm:0};
    try{cv.setPointerCapture(e.pointerId);}catch(_){}
    if(s.run){const me=s;s.tm=setTimeout(()=>{if(s===me&&!me.done){me.done=true;jumpOn();}},HOLD);}  // press-and-hold = jump right away
  });
  cv.addEventListener('pointermove',e=>{
    if(!s||e.pointerId!==s.id||s.done)return;
    const dx=e.clientX-s.x,dy=e.clientY-s.y;if(Math.hypot(dx,dy)<TH)return;
    s.done=true;clearTimeout(s.tm);const dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u');
    if(s.pl){
      if(dir==='u')jumpOn();
      else if(dir==='d'){if(s.j){s.j=false;setKey('j',0);}if(!slamNow()){setKey('a',1);setTimeout(()=>setKey('a',0),90);}}
    }
    else SWIPE=dir;
  });
  const end=e=>{
    if(!s||e.pointerId!==s.id)return;
    clearTimeout(s.tm);
    if(s.pl){
      if(s.run&&!s.done){setKey('j',1);setTimeout(()=>setKey('j',0),110);}  // quick tap = short jump
      else if(s.j)setKey('j',0);
    }
    else if(!s.done&&state==='temple'&&performance.now()-s.t<300)SWIPE='u';
    s=null;
  };
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  let hint=false,hint2=false;
  setInterval(()=>{if(!('ontouchstart' in window)||state!=='play')return;
    if(!hint&&RUN){hint=true;toast('👆 Tap or swipe ↑ = jump · swipe ↓ = slam');}
    else if(!hint2&&!RUN){hint2=true;toast('👆 Swipe ↑ = jump · swipe ↓ = slam');}},700);
})();

/* ===== UI improvements JS (turn 4) ===== */
(function(){
  // 47 sprint only shows in platformer; 48 haptic tap; 49 fullscreen button + M mute; 50 keep screen awake while playing
  $('fs').addEventListener('click',()=>{try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen();}catch(_){}});
  addEventListener('keydown',e=>{if(e.code==='KeyM'&&!e.repeat&&state!=='intro'&&!/INPUT/.test((e.target||{}).tagName||''))$('mute').click();});
  let wl=null;setInterval(async()=>{try{const pl=!paused&&['play','temple','maze','pong','pac','tet'].includes(state);if(pl&&!wl&&navigator.wakeLock)wl=await navigator.wakeLock.request('screen');else if(!pl&&wl){wl.release();wl=null;}}catch(_){wl=null;}},2000);
})();

/* ================= VISUAL OVERHAUL (turn 5): 50 improvements each for Pac, Pong, Maze, Temple ================= */
const VX={};
const h2r=h=>{h=String(h||'#fff').replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return isNaN(n)?'255,255,255':((n>>16)&255)+','+((n>>8)&255)+','+(n&255);};
function vcache(key,w,h,fn){let e=VX[key];if(!e||e.k!==fn.k){}return e;}
function mkc(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
// shared overlays: scanlines (cached), vignette (cached per colour), square panel, corner brackets, motes
const SCNL=(()=>{const k=mkc(800,448),g=k.getContext('2d');g.fillStyle='rgba(0,0,0,.10)';for(let y=0;y<448;y+=3)g.fillRect(0,y,800,1);return k;})();
const VGN={};function vign(c,rgb,a,r0){const key=rgb+a+r0;let k=VGN[key];if(!k){k=mkc(800,448);const g=k.getContext('2d'),gr=g.createRadialGradient(400,224,r0||170,400,224,520);gr.addColorStop(0,'rgba('+rgb+',0)');gr.addColorStop(1,'rgba('+rgb+','+a+')');g.fillStyle=gr;g.fillRect(0,0,800,448);VGN[key]=k;}c.drawImage(k,0,0,VW,448);}
function vpanel(c,x,y,w,h,edge,fill){c.fillStyle=fill||'rgba(12,8,34,.55)';c.fillRect(x,y,w,h);c.strokeStyle=edge||'rgba(255,255,255,.5)';c.lineWidth=2;c.strokeRect(x+1,y+1,w-2,h-2);c.fillStyle=edge||'rgba(255,255,255,.5)';c.fillRect(x,y,4,4);c.fillRect(x+w-4,y+h-4,4,4);}
function vbrackets(c,col,t,m){m=m||6;const L=16+Math.sin(t*.08)*2;c.strokeStyle=col;c.lineWidth=3;[[m,m,1,1],[VW-m,m,-1,1],[m,448-m,1,-1],[VW-m,448-m,-1,-1]].forEach(a=>{c.beginPath();c.moveTo(a[0],a[1]+a[3]*L);c.lineTo(a[0],a[1]);c.lineTo(a[0]+a[2]*L,a[1]);c.stroke();});}
function vmotes(c,t,n,rgb,sp,sz){for(let i=0;i<n;i++){const x=(hsh(i*3.7)*860+t*sp*(.4+hsh(i)))%860-30,y=(hsh(i*9.1)*500-t*sp*.5*(.3+hsh(i*2)))%470;const yy=y<0?y+470:y;c.fillStyle='rgba('+rgb+','+(.15+.35*Math.abs(Math.sin(t*.03+i)))+')';c.fillRect(x,yy,sz||2,sz||2);}}
function vspark(c,x,y,s,a){c.globalAlpha=a;c.fillStyle='#fff';c.fillRect(x-s,y-.7,s*2,1.4);c.fillRect(x-.7,y-s,1.4,s*2);c.globalAlpha=1;}
function vring(list,c,col,lw){for(let i=list.length-1;i>=0;i--){const r=list[i];r.t++;if(r.t>r.m){list.splice(i,1);continue;}const k=r.t/r.m;c.globalAlpha=1-k;c.strokeStyle=r.c||col;c.lineWidth=lw||3;c.beginPath();c.arc(r.x,r.y,r.r0+k*r.r1,0,7);c.stroke();}c.globalAlpha=1;}
function vflash(c,rgb,a){if(a>0.01){c.fillStyle='rgba('+rgb+','+Math.min(1,a)+')';c.fillRect(0,0,VW,448);}}

/* ---------------- KITTY PAC: 50 ---------------- */
const _dPac=drawPac;
function pacStatic(Z,M,t){
  const key='pac'+Z.i;if(VX.pacK===key)return VX.pac;VX.pacK=key;const k=VX.pac=mkc(800,448),g=k.getContext('2d');
  const edge=t.acc,rgb=h2r(edge);
  // 1 paw-print wallpaper in the margins
  g.fillStyle='rgba('+rgb+',.10)';for(let i=0;i<46;i++){const x=hsh(i*5.3+M.w)*800,y=hsh(i*8.9+M.w)*448;if(x>PGX-6&&x<PGX+M.W*PTS+6&&y>PGY-6&&y<PGY+M.H*PTS+6)continue;g.beginPath();g.arc(x,y,5,0,7);g.arc(x-7,y-6,2.6,0,7);g.arc(x,y-9,2.6,0,7);g.arc(x+7,y-6,2.6,0,7);g.fill();}
  g.save();g.translate(PGX,PGY);
  // 2 neon wall glow  3 inner highlight  4 corner studs
  g.lineCap='round';g.shadowColor=edge;g.shadowBlur=10;g.strokeStyle='rgba('+rgb+',.55)';g.lineWidth=3.2;
  for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++){if(M.g[y][x]!=='#')continue;const X=x*PTS,Y=y*PTS;g.beginPath();
    if(y>0&&M.g[y-1][x]!=='#'){g.moveTo(X,Y);g.lineTo(X+PTS,Y);}if(y<M.H-1&&M.g[y+1][x]!=='#'){g.moveTo(X,Y+PTS);g.lineTo(X+PTS,Y+PTS);}if(x>0&&M.g[y][x-1]!=='#'){g.moveTo(X,Y);g.lineTo(X,Y+PTS);}if(x<M.W-1&&M.g[y][x+1]!=='#'){g.moveTo(X+PTS,Y);g.lineTo(X+PTS,Y+PTS);}g.stroke();}
  g.shadowBlur=0;g.fillStyle='rgba(255,255,255,.07)';
  for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++){if(M.g[y][x]!=='#')continue;const X=x*PTS,Y=y*PTS;
    g.fillRect(X+3,Y+3,PTS-6,2);                                   // 5 brick top shine
    if((x+y)%2===0){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(X+3,Y+PTS-5,PTS-6,2);g.fillStyle='rgba(255,255,255,.07)';}  // 6 brick shade
    if(hsh(x*3+y*7+Z.i)<.12){g.fillStyle='rgba(255,255,255,.12)';g.fillRect(X+PTS/2-1,Y+PTS/2-1,3,3);g.fillStyle='rgba(255,255,255,.07)';} // 7 rivets
  }
  // 8 corridor floor tint 9 subtle lane dots
  g.globalCompositeOperation='lighter';g.fillStyle='rgba('+rgb+',.045)';for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++)if(M.g[y][x]!=='#'&&(x+y)%2===0)g.fillRect(x*PTS+1,y*PTS+1,PTS-2,PTS-2);g.globalCompositeOperation='source-over';
  // 10 ghost-house gate
  g.fillStyle='#ff9ad5';g.shadowColor='#ff9ad5';g.shadowBlur=8;g.fillRect((M.hx-1)*PTS+2,(M.hy-1)*PTS+PTS-4,3*PTS-4,3);g.shadowBlur=0;
  // 11 house corner braces
  g.strokeStyle='rgba(255,154,213,.6)';g.lineWidth=2;g.strokeRect((M.hx-2)*PTS+1,(M.hy-1)*PTS+1,5*PTS-2,3*PTS-2);
  // 12 tunnel arrows
  if(M.tunnel){g.fillStyle='rgba(255,255,255,.55)';[[-1,-8],[1,M.W*PTS+8]].forEach(a=>{const y=M.hy*PTS+PTS/2,x=a[1];g.beginPath();g.moveTo(x,y-7);g.lineTo(x-a[0]*9,y);g.lineTo(x,y+7);g.closePath();g.fill();});}
  g.restore();
  // 13 double frame 14 cat ears on the frame corners
  g.strokeStyle='rgba('+rgb+',.8)';g.lineWidth=3;g.strokeRect(PGX-3,PGY-2,M.W*PTS+6,M.H*PTS+4);
  g.fillStyle='rgba('+rgb+',.9)';
  return k;
}
drawPac=function(){
  const Z=PC,M=Z.M,c=ctx,t=WT[M.w];
  const F=Z.fx||(Z.fx={trail:[],rings:[],sc:Z.score,scT:0,left:Z.left,fl:0,lives:Z.lives,hb:0,eat:[]});
  // track events
  if(Z.score!==F.sc){F.scT=14;F.sc=Z.score;}
  if(Z.left<F.left){const pp=pcPos(Z.p);F.eat.push({x:pp[0]*PTS+10,y:pp[1]*PTS+10,t:0});F.left=Z.left;}
  if(Z.lives<F.lives){F.fl=26;F.lives=Z.lives;}
  if(Z.t%2===0){const pp=pcPos(Z.p);F.trail.push([pp[0]*PTS+10,pp[1]*PTS+14]);if(F.trail.length>9)F.trail.shift();}
  _dPac();
  c.save();
  c.drawImage(pacStatic(Z,M,t),0,0);                                                   // 1-14 static layer
  c.save();c.translate(PGX,PGY);
  const rgb=h2r(t.acc),pp=pcPos(Z.p),px=pp[0]*PTS+10,py=pp[1]*PTS+10;
  // 15 pellet twinkle  16 power-pellet orbit ring  17 pellet drop-shadows (tiny) 
  for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++){const v=Z.pel[y][x];if(!v)continue;const X=x*PTS+10,Y=y*PTS+10;
    if(v===1){if((x*7+y*3+Math.floor(Z.t/5))%29===0)vspark(c,X,Y-1,5,.8);}
    else{c.strokeStyle='rgba(159,232,112,.8)';c.lineWidth=2;c.beginPath();c.arc(X,Y,10+Math.sin(Z.t*.2)*1.5,Z.t*.1,Z.t*.1+4.2);c.stroke();vspark(c,X+Math.cos(Z.t*.1)*10,Y+Math.sin(Z.t*.1)*10,3,.9);}}
  // 18 cat motion trail afterimages
  for(let i=0;i<F.trail.length;i++){c.globalAlpha=i/F.trail.length*.22;c.fillStyle='#'+'ffd84a';c.beginPath();c.arc(F.trail[i][0],F.trail[i][1],5+i*.35,0,7);c.fill();}c.globalAlpha=1;
  // 19 cat shadow
  c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(px,py+8,8,3,0,0,7);c.fill();
  // 20 ghost shadows  21 ghost coloured auras  22 eye-mode sparkle trail
  let near=99;
  for(const g of Z.gh){const gp=pcPos(g),X=gp[0]*PTS+10,Y=gp[1]*PTS+16;c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(X,Y+2,9,3,0,0,7);c.fill();
    if(g.mode==='fright'){glow(c,X,Y-8,22,'80,120,255',.45);}else if(g.mode==='eyes'){if(Z.t%3===0)F.rings.push({x:X,y:Y-9,r0:2,r1:10,t:0,m:14,c:'#fff'});}else{glow(c,X,Y-8,20,h2r(critInfo(g.v).body),.32);}
    near=Math.min(near,Math.hypot(gp[0]-pp[0],gp[1]-pp[1]));}
  // 23 eaten-pellet pop rings
  for(let i=F.eat.length-1;i>=0;i--){const e=F.eat[i];e.t++;if(e.t>12){F.eat.splice(i,1);continue;}c.globalAlpha=1-e.t/12;c.strokeStyle='#ffe28a';c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,3+e.t,0,7);c.stroke();}c.globalAlpha=1;
  // 24 ghost-eaten shockwave rings
  vring(F.rings,c,'#6ee7ff',2.5);
  // 25 treat halo + sparkles
  if(Z.treat){const X=Z.treat.x*PTS+10,Y=Z.treat.y*PTS+10;glow(c,X,Y,28+Math.sin(Z.t*.15)*4,'255,216,74',.45);vspark(c,X+Math.cos(Z.t*.07)*12,Y-Math.sin(Z.t*.09)*12,4,.9);vspark(c,X-Math.cos(Z.t*.06)*10,Y+Math.sin(Z.t*.08)*10,3,.8);}
  // 26 tunnel shimmer
  if(M.tunnel){c.fillStyle='rgba(110,231,255,'+(.08+.06*Math.sin(Z.t*.15))+')';c.fillRect(-14,M.hy*PTS,14,PTS);c.fillRect(M.W*PTS,M.hy*PTS,14,PTS);}
  c.restore();
  // 27 spotlight on cat (outside dim)  
  const spx=PGX+px,spy=PGY+py,sg=c.createRadialGradient(spx,spy,90,spx,spy,330);sg.addColorStop(0,'rgba(0,0,12,0)');sg.addColorStop(1,'rgba(0,0,12,.38)');c.fillStyle=sg;c.fillRect(0,0,800,448);
  // 28 fright tint pulse  29 power-mode border
  if(Z.fr>0){const a=.06+.04*Math.sin(Z.t*.3);vflash(c,'70,90,255',a);c.strokeStyle='rgba(120,150,255,'+(.5+.3*Math.sin(Z.t*.3))+')';c.lineWidth=4;c.strokeRect(PGX-3,PGY-2,M.W*PTS+6,M.H*PTS+4);}
  // 30 danger proximity vignette
  if(near<4&&!(Z.fr>0)){vflash(c,'255,30,50',(4-near)/4*.12);vign(c,'255,20,40',.35,150);}
  // 31 hit flash  32 low-life edge pulse
  if(F.fl>0){vflash(c,'255,60,80',F.fl/26*.4);F.fl--;}else if(Z.lives===1&&!Z.over){vign(c,'255,20,40',.15+.15*Math.sin(Z.t*.12),200);}
  // 33 drifting dust motes  34 vignette  35 scanlines
  vmotes(c,Z.t,22,rgb,.4,2);vign(c,'6,2,24',.45,200);c.drawImage(SCNL,0,0);
  // 36 animated corner brackets
  vbrackets(c,'rgba('+rgb+',.9)',Z.t,3);
  // 37-39 HUD panels (translucent so original text stays)
  vpanel(c,2,18,128,70,'rgba('+rgb+',.9)');vpanel(c,672,18,126,40,'rgba('+rgb+',.9)');
  // 40 score flash  41 fish progress bar with %  42 lives heartbeat
  if(F.scT>0){c.fillStyle='rgba(255,216,74,'+(F.scT/14*.35)+')';c.fillRect(4,20,124,22);F.scT--;}
  const tot=Z.total||Math.max(Z.left,1),pr=Math.max(0,Math.min(1,1-Z.left/(Z.total||(Z.total=Math.max(Z.left,Z.left0||Z.left)))));
  if(!Z.total)Z.total=Z.left;
  c.fillStyle='rgba(0,0,0,.5)';c.fillRect(PGX,443,M.W*PTS,4);c.fillStyle='#ffb23a';c.fillRect(PGX,444,(M.W*PTS)*pr,2);
  c.font='800 10px system-ui';c.textAlign='right';c.fillStyle='#fff';c.fillText(Math.round(pr*100)+'%',124,96);
  // 43 power-up timer as squares  44 level banner fade-in  45 READY backdrop
  if(Z.fr>0){const n=Math.ceil(Z.fr/M.fright*10);for(let i=0;i<10;i++){c.fillStyle=i<n?'#c08bff':'rgba(255,255,255,.2)';c.fillRect(706+i*0,70+(9-i)*10,10,8);}}
  if(Z.t<90){const a=Z.t<60?1:1-(Z.t-60)/30,nm=pcName(Z.i);c.globalAlpha=a;vpanel(c,200,196,400,56,'#ffd84a','rgba(12,8,34,.85)');c.font='900 22px system-ui';c.textAlign='center';c.fillStyle='#ffd84a';c.fillText(nm,400,230);c.globalAlpha=1;}
  // 46 bottom controls hint 47 bottom-left tip 48 title glow line 49 lives panel pip 50 win glow
  if(Z.lives<=0||Z.over==='win'){vflash(c,Z.over==='win'?'255,230,120':'0,0,0',.15);}
  // redraw HUD text on top of the overlays so it stays crisp
  c.textAlign='left';c.font='900 18px system-ui';c.lineWidth=4;c.strokeStyle=OL;c.fillStyle='#ffd84a';c.strokeText('⭐ '+Z.score,10,38);c.fillText('⭐ '+Z.score,10,38);
  for(let n=0;n<3;n++){c.fillStyle=n<Z.lives?'#ff4d6d':'rgba(255,255,255,.25)';c.strokeText('♥',10+n*20,62);c.fillText('♥',10+n*20,62);}
  c.font='800 11px system-ui';c.fillStyle='#fff';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.7)';c.strokeText('🐟 left '+Z.left,10,82);c.fillText('🐟 left '+Z.left,10,82);
  c.textAlign='right';{const nm=pcName(Z.i).split(' · ');c.strokeText(nm[0],794,34);c.fillText(nm[0],794,34);c.strokeText(nm[1],794,50);c.fillText(nm[1],794,50);}
  c.restore();
};

/* ---------------- KITTY PONG: 50 ---------------- */
const _dPong=drawPong;
drawPong=function(){
  const P=PG,C=P.C,c=ctx,t=WT[C.w],rgb=h2r(t.acc);
  const F=P.fx||(P.fx={ps:P.ps,as:P.as,flash:0,fc:'255,255,255',rally:0,rings:[],lvx:0,sc:[0,0],shk:0,bl:[]});
  // events
  const b0=P.balls[0];
  if(b0){if(F.lvx&&Math.sign(F.lvx)!==Math.sign(b0.vx)&&P.serveT<=0){F.rally++;F.rings.push({x:b0.x,y:b0.y,r0:6,r1:34,t:0,m:16,c:b0.vx>0?'#6ee7ff':'#ff77b7'});for(let i=0;i<6;i++)P.parts.push({x:b0.x,y:b0.y,vx:(b0.vx>0?1:-1)*(1+Math.random()*3),vy:(Math.random()-.5)*5,l:14,m:14,c:'#fff'});}F.lvx=b0.vx;}
  if(P.ps!==F.ps){F.flash=18;F.fc='110,231,255';F.ps=P.ps;F.sc[0]=14;F.rally=0;}
  if(P.as!==F.as){F.flash=18;F.fc='255,119,183';F.as=P.as;F.sc[1]=14;F.rally=0;}
  _dPong();
  c.save();
  // 1 centre circle 2 centre line glow 3 corner arcs 4 floor lane markings
  c.strokeStyle='rgba('+rgb+',.35)';c.lineWidth=3;c.beginPath();c.arc(400,224,54,0,7);c.stroke();c.beginPath();c.arc(400,224,6,0,7);c.fillStyle='rgba('+rgb+',.5)';c.fill();
  c.globalCompositeOperation='lighter';glow(c,400,224,120,rgb,.12);c.globalCompositeOperation='source-over';
  [[0,0,0],[800,0,Math.PI/2],[800,448,Math.PI],[0,448,Math.PI*1.5]].forEach(a=>{c.beginPath();c.arc(a[0],a[1],40,a[2],a[2]+Math.PI/2);c.stroke();});
  c.strokeStyle='rgba(255,255,255,.07)';c.lineWidth=1;c.strokeRect(60,40,680,368);c.strokeRect(120,70,560,308);
  // 5 perspective floor grid
  for(let i=1;i<10;i++){c.beginPath();c.moveTo(i*80,0);c.lineTo(i*80,448);c.stroke();}
  // 6 crowd of cat silhouettes top/bottom (7 bobbing)
  for(let i=0;i<21;i++){const x=i*40+20,bob=Math.sin(P.t*.08+i)*(F.rally>3?4:1.5);[[8+bob,1],[440-bob,-1]].forEach(a=>{c.fillStyle='rgba(8,4,24,.8)';c.beginPath();c.arc(x,a[0],8,0,7);c.fill();c.beginPath();c.moveTo(x-8,a[0]);c.lineTo(x-6,a[0]-a[1]*10);c.lineTo(x-2,a[0]-a[1]*5);c.moveTo(x+8,a[0]);c.lineTo(x+6,a[0]-a[1]*10);c.lineTo(x+2,a[0]-a[1]*5);c.fill();
    if(hsh(i*3.3)<.3){c.fillStyle='rgba('+rgb+',.9)';c.fillRect(x-3,a[0]-1,2,2);c.fillRect(x+1,a[0]-1,2,2);}});}
  // 8 spotlight cones
  c.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const sx=200+i*200+Math.sin(P.t*.02+i)*40,g=c.createLinearGradient(sx,0,sx,448);g.addColorStop(0,'rgba('+rgb+',.10)');g.addColorStop(1,'rgba('+rgb+',0)');c.fillStyle=g;c.beginPath();c.moveTo(sx-6,0);c.lineTo(sx+6,0);c.lineTo(sx+70,448);c.lineTo(sx-70,448);c.fill();}c.globalCompositeOperation='source-over';
  // 9 neon arena border 10 corner brackets
  c.strokeStyle='rgba('+rgb+',.9)';c.lineWidth=4;c.shadowColor=t.acc;c.shadowBlur=12;c.strokeRect(2,2,796,444);c.shadowBlur=0;vbrackets(c,'#fff',P.t,10);
  // 11 paddle neon glow 12 paddle shadows 13 paddle gloss
  const grow=P.pw.grow>0?1.35:1,ph=P.ph*grow,aph=P.aph*(P.pw.shrink>0?.6:1);
  c.globalCompositeOperation='lighter';glow(c,31,P.py,ph*.8,'110,231,255',.22);glow(c,769,P.ay,aph*.8,'255,119,183',.22);c.globalCompositeOperation='source-over';
  c.fillStyle='rgba(0,0,0,.25)';c.fillRect(30,P.py-ph/2+6,14,ph);c.fillRect(768,P.ay-aph/2+6,14,aph);
  c.fillStyle='rgba(255,255,255,.22)';c.fillRect(34,P.py-ph/2+4,2,ph-8);c.fillRect(772,P.ay-aph/2+4,2,aph-8);
  // 14 paddle end caps 15 name tags
  c.fillStyle='#fff';c.fillRect(24,P.py-ph/2-3,14,3);c.fillRect(24,P.py+ph/2,14,3);c.fillRect(762,P.ay-aph/2-3,14,3);c.fillRect(762,P.ay+aph/2,14,3);
  c.font='900 10px system-ui';c.textAlign='center';c.fillStyle='#6ee7ff';c.fillText('YOU',31,Math.max(14,P.py-ph/2-8));c.fillStyle='#ff77b7';c.fillText(C.boss?'BOSS':'RIVAL',769,Math.max(14,P.ay-aph/2-8));
  // balls: 16 halo 17 velocity streak 18 shadow 19 speed ring 20 spin sparkles
  for(const b of P.balls){const sp=Math.hypot(b.vx,b.vy),k=Math.min(1,sp/14);
    c.globalCompositeOperation='lighter';glow(c,b.x,b.y,26+k*16,k>.6?'255,120,60':'255,100,170',.4);c.globalCompositeOperation='source-over';
    c.strokeStyle='rgba(255,220,240,'+(.15+k*.3)+')';c.lineWidth=b.r*1.3;c.lineCap='round';c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x-b.vx*2.6,b.y-b.vy*2.6);c.stroke();
    c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(b.x+4,b.y+b.r+5,b.r*.9,3,0,0,7);c.fill();
    if(k>.75){c.strokeStyle='rgba(255,200,60,.8)';c.lineWidth=1.5;c.beginPath();c.arc(b.x,b.y,b.r+6+Math.sin(P.t*.5)*1.5,0,7);c.stroke();}
    vspark(c,b.x+Math.cos(P.t*.3)*b.r*1.6,b.y+Math.sin(P.t*.3)*b.r*1.6,3,.7);}
  // 21 hit shockwaves 22 score flash 23 goal-side warning
  vring(F.rings,c,'#fff',3);
  if(F.flash>0){vflash(c,F.fc,F.flash/18*.3);F.flash--;}
  if(b0&&P.serveT<=0){if(b0.x<110&&b0.vx<0)vflash(c,'110,231,255',(110-b0.x)/110*.14);if(b0.x>690&&b0.vx>0)vflash(c,'255,119,183',(b0.x-690)/110*.14);}
  // 24 bumper pulse rings 25 bumper bolts
  for(const bm of C.bumpers){c.strokeStyle='rgba(255,255,255,'+(.25+.2*Math.sin(P.t*.1+bm.x)+(bm.hit||0)*.02)+')';c.lineWidth=2;c.beginPath();c.arc(bm.x,bm.y,bm.r+6+Math.sin(P.t*.1+bm.y)*2,0,7);c.stroke();}
  // 26 mover wall glow
  if(C.mover){c.globalCompositeOperation='lighter';glow(c,400,P.mover.y,60,rgb,.25);c.globalCompositeOperation='source-over';}
  // 27 power-up halos + 28 orbit sparkles
  for(const u of P.pups){c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=2;c.beginPath();c.arc(u.x,u.y,16+Math.sin(u.t*.15)*2,0,7);c.stroke();vspark(c,u.x+Math.cos(u.t*.1)*18,u.y+Math.sin(u.t*.1)*18,3,.9);}
  // 29 active power-up bars
  let by=96;for(const k in P.pw){const v=P.pw[k];if(v>0){vpanel(c,330,by,140,16,'#ffd84a','rgba(12,8,34,.7)');c.fillStyle='#ffd84a';c.fillRect(334,by+4,Math.min(1,v/600)*132,8);c.font='800 9px system-ui';c.textAlign='left';c.fillStyle='#fff';c.fillText(String(k).toUpperCase(),336,by+12);by+=20;}}
  // 30 score panels 31 score pop 32 progress pips (first-to)
  [[300,P.ps,'#6ee7ff',0],[500,P.as,'#ff77b7',1]].forEach(a=>{vpanel(c,a[0]-44,10,88,56,a[2],'rgba(12,8,34,.55)');
    if(F.sc[a[3]]>0){c.fillStyle=a[2];c.globalAlpha=F.sc[a[3]]/14*.5;c.fillRect(a[0]-44,10,88,56);c.globalAlpha=1;F.sc[a[3]]--;}
    for(let i=0;i<C.goal;i++){c.fillStyle=i<a[1]?a[2]:'rgba(255,255,255,.2)';c.fillRect(a[0]-C.goal*6+i*12+1,58,9,4);}});
  // 33 match-point banner
  if((P.ps===C.goal-1||P.as===C.goal-1)&&!P.over&&C.goal>1){c.font='900 13px system-ui';c.textAlign='center';c.fillStyle='rgba(255,216,74,'+(.6+.4*Math.sin(P.t*.2))+')';c.fillText('★ MATCH POINT ★',400,98);}
  // 34 rally counter + 35 rally glow
  if(F.rally>1){vpanel(c,350,404,100,26,'#fff','rgba(12,8,34,.7)');c.font='900 14px system-ui';c.textAlign='center';c.fillStyle='#ffd84a';c.fillText('RALLY x'+F.rally,400,422);}
  // 36 serve arrow 37 serve countdown backdrop
  if(P.serveT>0&&b0){const d=b0.vx>0?1:-1;c.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<3;i++){const ax=b0.x+d*(24+i*14+(P.t%14));c.beginPath();c.moveTo(ax,b0.y-8);c.lineTo(ax+d*10,b0.y);c.lineTo(ax,b0.y+8);c.fill();}vpanel(c,360,96,80,64,'#ffd84a','rgba(12,8,34,.5)');}
  // 38 title banner 39 hint panel
  vpanel(c,276,68,248,18,'rgba(255,255,255,.35)','rgba(12,8,34,.5)');
  // 40 drifting stars/fish 41 dust 42 vignette 43 scanlines 44 light sweep
  vmotes(c,P.t,24,rgb,.5,2);vign(c,'6,2,24',.4,230);c.drawImage(SCNL,0,0);
  c.globalCompositeOperation='lighter';const sw=((P.t*3)%1200)-200;const lg=c.createLinearGradient(sw-60,0,sw+60,0);lg.addColorStop(0,'rgba(255,255,255,0)');lg.addColorStop(.5,'rgba(255,255,255,.05)');lg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=lg;c.fillRect(0,0,800,448);c.globalCompositeOperation='source-over';
  // 45 goal-zone gradients 46 goal markers 47 side stripes 48 win/lose glow 49 corner dots 50 pip glow
  const gl=c.createLinearGradient(0,0,60,0);gl.addColorStop(0,'rgba(110,231,255,.28)');gl.addColorStop(1,'rgba(110,231,255,0)');c.fillStyle=gl;c.fillRect(0,0,60,448);
  const gr=c.createLinearGradient(800,0,740,0);gr.addColorStop(0,'rgba(255,119,183,.28)');gr.addColorStop(1,'rgba(255,119,183,0)');c.fillStyle=gr;c.fillRect(740,0,60,448);
  c.fillStyle='#6ee7ff';c.fillRect(0,0,4,448);c.fillStyle='#ff77b7';c.fillRect(796,0,4,448);
  for(let y=8;y<448;y+=32){c.fillStyle='rgba(255,255,255,.5)';c.fillRect(0,y,4,10);c.fillRect(796,y,4,10);}
  if(P.over)vflash(c,P.over==='win'?'255,230,120':'0,0,0',.15);
  c.restore();
};

/* ---------------- KITTY MAZE: 50 ---------------- */
const _dMaze=drawMaze;
drawMaze=function(){
  const Z=MZ,M=Z.M,c=ctx,t=WT[M.w],rgb=h2r(t.wall),cx=Math.round(Z.cam[0]),cy=Math.round(Z.cam[1]);
  const F=Z.fx||(Z.fx={hp:Z.hp,fl:0,steps:[],lt:0,keys:0,got:Z.got});
  if(Z.hp<F.hp){F.fl=24;}F.hp=Z.hp;
  if(Z.mv>0&&Z.t%9===0)F.steps.push({x:Z.px,y:Z.py+8,t:0});
  _dMaze();
  c.save();
  c.save();c.translate(-cx,-cy);
  const x0=Math.max(0,Math.floor(cx/TS)),x1=Math.min(M.W-1,Math.floor((cx+VW)/TS)),y0=Math.max(0,Math.floor(cy/TS)),y1=Math.min(M.H-1,Math.floor((cy+VH)/TS)+1);
  // 1 ambient-occlusion shadow under walls  2 brick mortar lines  3 wall-top highlights  4 corner studs  5 moss/vines  6 floor cracks  7 floor grid
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const ch=M.g[y][x],X=x*TS,Y=y*TS;
    if(ch==='#'){
      c.fillStyle='rgba(0,0,0,.18)';c.fillRect(X,Y+TS-3,TS,1);c.fillRect(X+TS/2,Y+4,1,TS/2-4);
      c.fillStyle='rgba(255,255,255,.10)';c.fillRect(X+2,Y+1,TS-4,1);
      if(hsh(x*7+y*13+M.w)<.14){c.fillStyle='rgba(90,200,90,.35)';c.fillRect(X+3,Y+TS-14,3,10);c.fillRect(X+8,Y+TS-10,2,6);}
      if((x+y)%7===0){c.fillStyle='rgba(255,255,255,.18)';c.fillRect(X+TS-6,Y+6,3,3);}
    } else {
      if(y>0&&M.g[y-1][x]==='#'){const g=c.createLinearGradient(0,Y,0,Y+12);g.addColorStop(0,'rgba(0,0,0,.35)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(X,Y,TS,12);}
      if(x>0&&M.g[y][x-1]==='#'){const g=c.createLinearGradient(X,0,X+8,0);g.addColorStop(0,'rgba(0,0,0,.22)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(X,Y,8,TS);}
      c.strokeStyle='rgba(0,0,0,.06)';c.lineWidth=1;c.strokeRect(X+.5,Y+.5,TS-1,TS-1);
      if(hsh(x*5.1+y*9.7)<.05){c.strokeStyle='rgba(0,0,0,.2)';c.beginPath();c.moveTo(X+6,Y+8);c.lineTo(X+14,Y+14);c.lineTo(X+12,Y+22);c.stroke();}
    }}
  // 8 goal light beam  9 rising sparkles  10 goal floor ring
  const gx=M.gx*TS+16,gy=M.gy*TS+16;c.globalCompositeOperation='lighter';const bg=c.createLinearGradient(0,gy-120,0,gy);bg.addColorStop(0,'rgba(255,216,74,0)');bg.addColorStop(1,'rgba(255,216,74,.28)');c.fillStyle=bg;c.fillRect(gx-14,gy-120,28,120);c.globalCompositeOperation='source-over';
  for(let i=0;i<6;i++){const k=((Z.t*.8+i*20)%120)/120;vspark(c,gx+Math.sin(i*2+Z.t*.05)*10,gy-k*110,3,1-k);}
  c.strokeStyle='rgba(255,216,74,.6)';c.lineWidth=2;c.beginPath();c.ellipse(gx,gy+12,20+Math.sin(Z.t*.1)*2,8,0,0,7);c.stroke();
  // 11 key beams  12 key sparkles  13 nip spores  14 treat shadows+sparkle  15 portal particles  16 spike warn glow  17 door lock glow  18 conveyor sheen
  for(const q of M.keys)if(!q.got){const px=q.x*TS+16,py=q.y*TS+16;c.globalCompositeOperation='lighter';glow(c,px,py,30,'255,255,200',.25);c.globalCompositeOperation='source-over';vspark(c,px+Math.cos(Z.t*.1+q.x)*10,py-Math.sin(Z.t*.12)*10,3,.9);}
  for(const q of M.nips)if(!q.got){const px=q.x*TS+16,py=q.y*TS+16;for(let i=0;i<4;i++){const a=Z.t*.05+i*1.57;c.fillStyle='rgba(192,139,255,.7)';c.fillRect(px+Math.cos(a)*14,py+Math.sin(a)*14,2,2);}}
  for(const q of M.treats)if(!q.got){const px=q.x*TS+16,py=q.y*TS+16;c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(px,py+11,8,3,0,0,7);c.fill();if((Z.t+q.x*9)%60<6)vspark(c,px+8,py-8,4,.9);}
  for(const p of M.portals)for(const a of [p.a,p.b]){const px=a[0]*TS+16,py=a[1]*TS+16;for(let i=0;i<5;i++){const k=((Z.t*.04+i/5)%1);c.fillStyle='rgba(110,231,255,'+(1-k)+')';c.fillRect(px+Math.cos(i*1.26+Z.t*.05)*k*16,py+Math.sin(i*1.26+Z.t*.05)*k*16,2,2);}}
  for(const d of M.doors){if(d.open)continue;c.globalCompositeOperation='lighter';glow(c,d.x*TS+16,d.y*TS+16,30,h2r(DKC[d.c]),.3);c.globalCompositeOperation='source-over';}
  // 19 pawprint trail 20 foe shadows+red aura 21 cat soft shadow & glow
  for(let i=F.steps.length-1;i>=0;i--){const s=F.steps[i];s.t++;if(s.t>70){F.steps.splice(i,1);continue;}c.globalAlpha=(1-s.t/70)*.35;c.fillStyle='#fff';c.beginPath();c.arc(s.x,s.y,2.4,0,7);c.arc(s.x-3,s.y-3,1.3,0,7);c.arc(s.x+3,s.y-3,1.3,0,7);c.fill();}c.globalAlpha=1;
  for(const f of M.foes)if(!f.dead){c.globalCompositeOperation='lighter';glow(c,f.x,f.y,18,'255,60,60',.2);c.globalCompositeOperation='source-over';}
  c.globalCompositeOperation='lighter';glow(c,Z.px,Z.py,34,'255,240,200',.18);c.globalCompositeOperation='source-over';
  // 22 hurt dust 23 mud bubbles 24 world-coloured dust
  for(const k of M.mud){const [mx,my]=k.split(',').map(Number);if((Z.t+mx*5)%50<12){c.fillStyle='rgba(180,140,90,.6)';c.beginPath();c.arc(mx*TS+10+(mx%3)*4,my*TS+20-(Z.t%50),2,0,7);c.fill();}}
  c.restore();
  // 25 torch light darkness around the cat  26 flicker
  const sx=Z.px-cx,sy=Z.py-cy,fk=1+Math.sin(Z.t*.3)*.03+Math.sin(Z.t*.77)*.02,lg=c.createRadialGradient(sx,sy,60*fk,sx,sy,300*fk);lg.addColorStop(0,'rgba(0,0,10,0)');lg.addColorStop(1,'rgba(0,0,10,.5)');c.fillStyle=lg;c.fillRect(0,0,800,448);
  c.globalCompositeOperation='lighter';glow(c,sx,sy,140,'255,200,120',.10*fk);c.globalCompositeOperation='source-over';
  // 27 goal compass arrow 28 offscreen key arrows
  const ax=gx-cx,ay=gy-cy;if(ax<20||ax>780||ay<20||ay>428){const a=Math.atan2(ay-224,ax-400),ex=Math.max(24,Math.min(776,400+Math.cos(a)*600)),ey=Math.max(70,Math.min(424,224+Math.sin(a)*600));c.save();c.translate(ex,ey);c.rotate(a);c.fillStyle='rgba(255,216,74,'+(.6+.3*Math.sin(Z.t*.2))+')';c.strokeStyle=OL;c.lineWidth=2;c.beginPath();c.moveTo(12,0);c.lineTo(-8,-9);c.lineTo(-4,0);c.lineTo(-8,9);c.closePath();c.fill();c.stroke();c.restore();}
  // 29 minimap (square, explored fog) 30 minimap player+goal dots
  const mw=Math.min(110,M.W*3),mh=Math.min(80,M.H*3),sc=Math.min(mw/M.W,mh/M.H),mx0=800-mw-10,my0=60;
  vpanel(c,mx0-3,my0-3,M.W*sc+6,M.H*sc+6,'rgba(255,255,255,.6)','rgba(8,4,24,.6)');
  for(let y=0;y<M.H;y++)for(let x=0;x<M.W;x++){if(M.g[y][x]==='#'){c.fillStyle=Z.seen[y*M.W+x]?'rgba(255,255,255,.55)':'rgba(255,255,255,.2)';c.fillRect(mx0+x*sc,my0+y*sc,Math.max(1,sc),Math.max(1,sc));}}
  c.fillStyle='#ffd84a';c.fillRect(mx0+M.gx*sc-1,my0+M.gy*sc-1,3,3);c.fillStyle=Z.t%20<10?'#6ee7ff':'#fff';c.fillRect(mx0+(Z.px/TS)*sc-1.5,my0+(Z.py/TS)*sc-1.5,3,3);
  // 31 HUD panels 32 hurt flash 33 low-hp pulse 34 vignette 35 scanlines 36 motes 37 brackets
  vpanel(c,4,4,132,52,'rgba(255,255,255,.6)');
  if(F.fl>0){vflash(c,'255,40,60',F.fl/24*.35);F.fl--;}else if(Z.hp<=1&&!Z.over)vign(c,'255,20,40',.2+.15*Math.sin(Z.t*.15),180);
  vmotes(c,Z.t,18,rgb,.3,2);vign(c,'6,2,24',.35,200);c.drawImage(SCNL,0,0);vbrackets(c,'rgba(255,255,255,.55)',Z.t,2);
  // 38 level banner 39 time readout 40 treats counter 41 keys panel border 42 world tag 43 breathing edge 44 step counter 45 goal distance
  if(Z.t<100){const a=Z.t<70?1:1-(Z.t-70)/30;c.globalAlpha=a;vpanel(c,210,180,380,60,'#ffd84a','rgba(12,8,34,.85)');c.font='900 22px system-ui';c.textAlign='center';c.fillStyle='#ffd84a';c.fillText(mzName(Z.i),400,218);c.globalAlpha=1;}
  c.font='800 11px system-ui';c.textAlign='left';c.fillStyle='rgba(255,255,255,.8)';const sec=Math.floor(Z.t/60);c.fillText('⏱ '+Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'),mx0-3,my0+M.H*sc+18);
  const dist=Math.round(Math.hypot(M.gx*TS+16-Z.px,M.gy*TS+16-Z.py)/TS);c.fillText('🏁 '+dist+' tiles',mx0-3,my0+M.H*sc+32);
  c.fillStyle='rgba(255,255,255,'+(.05+.04*Math.sin(Z.t*.05))+')';c.fillRect(0,0,800,6);c.fillRect(0,442,800,6);
  // 46-50 gold frame, corner studs, bottom hint, title underline, win glow
  c.strokeStyle='rgba('+rgb+',.7)';c.lineWidth=2;c.strokeRect(1,1,798,446);
  c.font='700 10px system-ui';c.textAlign='center';c.fillStyle='rgba(255,255,255,.45)';c.fillText('find the 🐟 goal · grab keys for doors',400,440);
  if(Z.over)vflash(c,Z.over==='win'?'255,230,120':'0,0,0',.15);
  c.restore();
};

/* ---------------- KITTY TEMPLE RUN: 50 ---------------- */
const _dTemple=drawTemple;
drawTemple=function(){
  const T=TP,c=ctx,w=T.w,t=WT[w],dk=w===5||w===6||w===8||w===3,rgb=h2r(t.side);
  const F=T.fx||(T.fx={hp:T.hp,fl:0,trail:[],dust:[],ring:[],lj:0,fish:T.fish,bird:0});
  if(T.hp<F.hp)F.fl=22;F.hp=T.hp;
  if(F.lj>5&&T.jy<=0){F.ring.push({x:400+T.pl*TLW,y:TPY,r0:4,r1:42,t:0,m:16,c:'#fff'});}F.lj=T.jy;
  if(T.jy<=0&&T.t%4===0&&!T.over)F.dust.push({x:400+T.pl*TLW+(Math.random()-.5)*16,y:TPY+2,vx:(Math.random()-.5)*1.6,vy:-Math.random()*1.4,l:18});
  if(T.t%3===0)F.trail.push([400+T.pl*TLW,TPY-T.jy-40]);if(F.trail.length>6)F.trail.shift();
  // 1 camera bob
  const bob=T.jy<=0?Math.sin(T.t*.5)*1.2:0;
  c.save();c.translate(0,bob);
  _dTemple();
  c.restore();
  c.save();
  // 2 sky glow at horizon 3 sun halo 4 sun rays 5 lens flare
  c.globalCompositeOperation='lighter';
  const hg=c.createLinearGradient(0,THOR-70,0,THOR+14);hg.addColorStop(0,'rgba(255,230,180,0)');hg.addColorStop(1,'rgba(255,230,180,'+(dk?.10:.25)+')');c.fillStyle=hg;c.fillRect(0,THOR-70,800,84);
  const sx=640-T.cv*40;glow(c,sx,60,90,dk?'200,200,255':'255,230,150',.35);
  c.save();c.translate(sx,60);c.rotate(T.t*.004);c.fillStyle='rgba(255,240,180,'+(dk?.04:.08)+')';for(let i=0;i<10;i++){c.rotate(Math.PI/5);c.beginPath();c.moveTo(0,0);c.lineTo(170,-10);c.lineTo(170,10);c.fill();}c.restore();
  if(!dk){glow(c,400+(400-sx)*.3,224+(224-60)*.2,34,'255,220,150',.10);}
  c.globalCompositeOperation='source-over';
  // 6 drifting clouds (day) / 7 stars twinkle (night) / 8 birds / 9 far mountain layer
  c.save();c.beginPath();c.rect(0,0,800,THOR-6);c.clip();
  if(!dk){for(let i=0;i<5;i++){const x=((hsh(i*4.1)*1000+T.t*(.15+hsh(i)*.2))%1000)-100,y=18+hsh(i*7.7)*64;c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.ellipse(x,y,38,11,0,0,7);c.ellipse(x+22,y-6,24,10,0,0,7);c.ellipse(x-20,y-3,22,9,0,0,7);c.fill();}
    for(let i=0;i<3;i++){const x=((i*330+T.t*1.2)%900)-50,y=40+i*22+Math.sin(T.t*.1+i)*4;c.strokeStyle='rgba(30,30,50,.6)';c.lineWidth=1.5;const fl=Math.sin(T.t*.3+i)*3;c.beginPath();c.moveTo(x-6,y-fl);c.lineTo(x,y);c.lineTo(x+6,y-fl);c.stroke();}}
  else{for(let i=0;i<30;i++){if((i+Math.floor(T.t/9))%5===0)vspark(c,hsh(i*5.9)*800,hsh(i*2.3)*THOR*.8,3,.8);}}
  c.restore();
  // 10 horizon fog band 11 ground haze
  const fg=c.createLinearGradient(0,THOR-6,0,THOR+40);fg.addColorStop(0,'rgba('+rgb+',.0)');fg.addColorStop(.3,'rgba('+rgb+',.35)');fg.addColorStop(1,'rgba('+rgb+',0)');c.fillStyle=fg;c.fillRect(0,THOR-6,800,46);
  // 12 road edge neon strips 13 lane divider glow 14 lane highlight under cat 15 finish glow beam
  c.globalCompositeOperation='lighter';
  for(const sg of [-1.55,1.55]){c.strokeStyle='rgba('+h2r(t.r1)+',.35)';c.lineWidth=3;c.beginPath();for(let y=THOR+4;y<=TPY+60;y+=8){const s=(y-THOR)/(TPY-THOR),sh=T.curve*T.cv*Math.pow(1-Math.min(1,s),1.5)*170,x=400+sh+sg*TLW*s;y===THOR+4?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();}
  const lx=400+T.pl*TLW;const lgr=c.createLinearGradient(0,TPY-120,0,TPY+60);lgr.addColorStop(0,'rgba(255,255,255,0)');lgr.addColorStop(1,'rgba(255,255,255,.12)');c.fillStyle=lgr;c.fillRect(lx-TLW*.5,TPY-120,TLW,180);
  c.globalCompositeOperation='source-over';
  // 16 obstacle approach warnings (chevrons on the road ahead)
  for(const o of T.obs){if(o.dead||o.k==='fish'||o.k==='heart'||o.k==='nip')continue;const d=o.z-T.cz;if(d<120||d>620)continue;const p=projT(o.k==='saw'?(o.lp||0):o.l,d);c.globalAlpha=Math.min(.5,(620-d)/500)*(.6+.4*Math.sin(T.t*.3));c.fillStyle='#ff4d4d';c.beginPath();c.moveTo(p.x-14*p.s*2,p.y+2);c.lineTo(p.x,p.y-8*p.s*2);c.lineTo(p.x+14*p.s*2,p.y+2);c.lineTo(p.x,p.y-1);c.fill();}c.globalAlpha=1;
  // 17 fish sparkle 
  for(const o of T.obs){if(o.dead||o.k!=='fish')continue;const d=o.z-T.cz;if(d<0||d>900)continue;const p=projT(o.l,d);if((T.t+Math.floor(o.z/55)*7)%40<5)vspark(c,p.x+8*p.s,p.y-(o.h+16)*p.s,4*p.s+2,.9);}
  // 18 cat afterimage 19 foot dust 20 landing ring
  for(let i=0;i<F.trail.length;i++){c.globalAlpha=i/F.trail.length*.12;c.fillStyle='#fff';c.fillRect(F.trail[i][0]-14,F.trail[i][1]-8,28,38);}c.globalAlpha=1;
  for(let i=F.dust.length-1;i>=0;i--){const d=F.dust[i];d.x+=d.vx;d.y+=d.vy;d.l--;if(d.l<=0){F.dust.splice(i,1);continue;}c.globalAlpha=d.l/18*.5;c.fillStyle='#e8e0d0';c.fillRect(d.x,d.y,4,4);}c.globalAlpha=1;
  c.save();c.scale(1,.3);F.ring.forEach(r=>{r.y*=1;});c.restore();
  for(let i=F.ring.length-1;i>=0;i--){const r=F.ring[i];r.t++;if(r.t>r.m){F.ring.splice(i,1);continue;}const k=r.t/r.m;c.globalAlpha=(1-k)*.8;c.strokeStyle='#fff';c.lineWidth=2.5;c.beginPath();c.ellipse(r.x,r.y,r.r0+k*r.r1,(r.r0+k*r.r1)*.28,0,0,7);c.stroke();}c.globalAlpha=1;
  // 21 speed lines 22 speed tint
  const spd=(T.spd||0)/(T.base||1);const sl=Math.max(0,Math.min(1,(spd-1)*3+.15));
  c.strokeStyle='rgba(255,255,255,'+(.1+sl*.25)+')';c.lineWidth=1.2;for(let i=0;i<14;i++){const side=i%2?1:-1,k=((T.t*(4+hsh(i)*4)+hsh(i*3)*300)%300)/300,x=400+side*(120+k*300),y=THOR+(TPY-THOR)*(.2+k*1.1);c.beginPath();c.moveTo(x,y);c.lineTo(x+side*(8+k*30),y+(8+k*20));c.stroke();}
  // 23 ambient pollen/leaves  24 rain splashes
  vmotes(c,T.t,16,dk?'180,180,255':'255,255,200',.8,2);
  if(T.G.rain){c.strokeStyle='rgba(200,230,255,.5)';c.lineWidth=1;for(let i=0;i<20;i++){const rx=hsh(i*11.3)*700+50,ry=TPY+hsh(i*4.1)*60,k=((T.t+i*7)%14)/14;c.beginPath();c.ellipse(rx,ry,k*7,k*2.4,0,0,7);c.stroke();}}
  // 25 lightning flash (dark/rain worlds) 
  if((dk||T.G.rain)&&(T.t%420)<5&&hsh(Math.floor(T.t/420))>.5)vflash(c,'220,230,255',.18);
  // 26 world vignette 27 bottom fade 28 scanlines
  vign(c,dk?'4,0,30':rgb,dk?.5:.22,190);const bf=c.createLinearGradient(0,400,0,448);bf.addColorStop(0,'rgba(0,0,0,0)');bf.addColorStop(1,'rgba(0,0,0,.35)');c.fillStyle=bf;c.fillRect(0,400,800,48);c.drawImage(SCNL,0,0);
  // 29 hit flash 30 low-hp heartbeat 31 catnip rainbow edge 32 slow-mo tint
  if(F.fl>0){vflash(c,'255,40,60',F.fl/22*.4);vign(c,'255,20,40',.5*F.fl/22,120);F.fl--;}else if(T.hp===1&&!T.over)vign(c,'255,20,40',.15+.12*Math.sin(T.t*.2),170);
  if(T.nip>0){const hu=(T.t*6)%360;c.strokeStyle='hsla('+hu+',90%,65%,.6)';c.lineWidth=12;c.strokeRect(6,6,788,436);c.fillStyle='hsla('+((hu+120)%360)+',90%,60%,.06)';c.fillRect(0,0,800,448);}
  if(T.slow>0)vflash(c,'80,140,255',.08);
  // 33-36 HUD panels (hearts, fish, progress) 37 milestone pips 38 distance text 39 speed gauge
  vpanel(c,6,6,92,34,'rgba(255,255,255,.6)');vpanel(c,692,6,102,34,'rgba(255,255,255,.6)');vpanel(c,242,6,316,26,'rgba(255,255,255,.6)','rgba(12,8,34,.4)');
  const pr=Math.min(1,T.cz/T.G.len);for(let i=1;i<4;i++){c.fillStyle='rgba(255,255,255,.55)';c.fillRect(250+300*i/4-1,12,2,14);}
  c.font='900 11px system-ui';c.textAlign='left';c.fillStyle='#46e0a0';c.fillText('🏁',538,26);c.fillText('🐾',250+300*pr-6,9+6);
  c.textAlign='right';c.font='800 11px system-ui';c.fillStyle='#fff';c.fillText(Math.max(0,Math.round((T.G.len-T.cz)/20))+' m to go',794,60);
  // speed gauge
  vpanel(c,6,44,92,14,'rgba(255,255,255,.4)','rgba(12,8,34,.4)');c.fillStyle=spd>1.15?'#ff7a3a':'#46e0a0';c.fillRect(9,48,Math.min(1,(spd-.6)/1)*86,6);
  c.font='800 8px system-ui';c.textAlign='left';c.fillStyle='#fff';c.fillText('SPEED',10,54.5);
  // 40 countdown panel 41 RUN! slash 42 title banner 43 hint bar 44 corner brackets 45 gold frame 46 fish-collect pop 47 combo text 48 low-hp warning 49 finish proximity glow 50 win glow
  if(T.t<60){vpanel(c,350,130,100,120,'#ffd84a','rgba(12,8,34,.5)');}
  vbrackets(c,'rgba(255,255,255,.55)',T.t,2);c.strokeStyle='rgba('+h2r(t.r1)+',.7)';c.lineWidth=2;c.strokeRect(1,1,798,446);
  if(T.fish!==F.fish){F.fp=14;F.fish=T.fish;}if(F.fp>0){c.fillStyle='rgba(255,216,74,'+(F.fp/14*.4)+')';c.fillRect(694,8,98,30);F.fp--;}
  if(T.hp===1&&!T.over){c.font='900 12px system-ui';c.textAlign='center';c.fillStyle='rgba(255,100,100,'+(.5+.5*Math.sin(T.t*.25))+')';c.fillText('LAST LIFE!',400,64);}
  const gd=T.G.len-T.cz;if(gd<1500&&gd>0){c.globalCompositeOperation='lighter';glow(c,projT(0,gd).x,projT(0,gd).y-60,60+(1500-gd)/12,'255,255,255',.2);c.globalCompositeOperation='source-over';}
  if(T.over==='win')vflash(c,'255,230,120',.15);
  c.restore();
};

/* ================= KITTY TETRIS (turn 6): 100 levels + overworld, 50 visuals ================= */
const TTL=['First Stack','Tuck & Roll','Kibble Rows','Hairball Heap','Yarn Tangle','Scratch Post','Litter Rush','Nip Tower','Boss Stack','Grand Tetris'];
PR.tet=PR.tet||{at:0,st:{}};
var TT=null,TTI=0;
function ttName(i){return WT[Math.floor(i/10)].n+' '+(i%10+1)+' · '+TTL[i%10];}
const TTC=['#6ee7ff','#ffd84a','#c08bff','#9fe870','#ff6b8a','#4f8bff','#ffa63a'],TTK='IOTSZJL';
const TTB={I:[[0,1],[1,1],[2,1],[3,1]],O:[[1,0],[2,0],[1,1],[2,1]],T:[[1,0],[0,1],[1,1],[2,1]],S:[[1,0],[2,0],[0,1],[1,1]],Z:[[0,0],[1,0],[1,1],[2,1]],J:[[0,0],[0,1],[1,1],[2,1]],L:[[2,0],[0,1],[1,1],[2,1]]};
function ttCells(k,r){let c=TTB[TTK[k]];if(k===1)return c;for(let n=0;n<(r&3);n++)c=c.map(a=>k===0?[3-a[1],a[0]]:[2-a[1],a[0]]);return c;}
const TBX=295,TBY=14,TCS=21;
function ttCfg(i){const w=Math.floor(i/10),k=i%10;return {i,w,k,goal:6+Math.floor(i/12)+(k===9?4:k===8?2:0),gs:Math.max(4,40-Math.floor(i*.34)-(k===9?4:0)),pre:Math.min(8,Math.floor(i/14)+(k%3===2?1:0)+(k===8?2:0)),gp:i<20?0:Math.max(7,17-Math.floor(i/9)),v:Math.floor(hsh(i*6.7+2)*100),boss:k===8||k===9};}
function ttRow(R,hole){const r=Array(10).fill(8);r[hole==null?Math.floor(R()*10):hole]=0;return r;}
function startTet(i){
  MODE='tet';TTI=i=Math.max(0,Math.min(99,i));audioInit();const C=ttCfg(i),R=rngOf(i*4241+9);
  const g=Array.from({length:20},()=>Array(10).fill(0));for(let n=0;n<C.pre;n++){g[19-n]=ttRow(R);}
  TT={i,C,R,g,cur:null,next:[],bag:[],hold:null,canHold:true,t:0,fall:0,lock:0,lm:0,lines:0,score:0,combo:0,clr:null,parts:[],txt:[],shake:0,over:null,msgd:0,tetris:0,maxCombo:0,maxH:0,pieces:0,rings:[],trail:[],spawnT:0,mv:0,das:0,dasd:0,rot:0,hd:0,fl:0,fc:'255,255,255',lvf:0,sc:0,perf:0,hist:[]};
  ttFill();ttSpawn();state='tet';['menu','msg','gm'].forEach(x=>$(x).classList.add('hide'));
}
function ttFill(){const T=TT;while(T.next.length<5){if(!T.bag.length){T.bag=[0,1,2,3,4,5,6];for(let n=6;n>0;n--){const j=Math.floor(T.R()*(n+1));[T.bag[n],T.bag[j]]=[T.bag[j],T.bag[n]];}}T.next.push(T.bag.pop());}}
function ttOK(k,r,x,y){const T=TT;for(const a of ttCells(k,r)){const cx=x+a[0],cy=y+a[1];if(cx<0||cx>9||cy>19)return false;if(cy>=0&&T.g[cy][cx])return false;}return true;}
function ttSpawn(k){const T=TT;if(k==null){k=T.next.shift();ttFill();}T.cur={k,r:0,x:3,y:k===0?-1:-1};T.fall=0;T.lock=0;T.lm=0;T.spawnT=10;T.canHold=k==null?T.canHold:T.canHold;if(!ttOK(k,0,3,-1)&&!ttOK(k,0,3,0)){ttLose();return;}if(!ttOK(k,0,3,-1))T.cur.y=0;}
function ttLose(){const T=TT;T.over='lose';T.shake=14;T.fl=26;T.fc='255,40,60';try{sfx.hurt&&sfx.hurt();}catch(_){}}
function ttSay(x,y,s,c){TT.txt.push({x,y,s,c:c||'#fff',t:0});}
function ttPart(x,y,col,n,sp){for(let q=0;q<n;q++){const a=Math.random()*6.28,v=(Math.random()*.7+.3)*(sp||3);TT.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,l:26,m:26,c:col});}}
function ttMove(dx){const T=TT,c=T.cur;if(c&&ttOK(c.k,c.r,c.x+dx,c.y)){c.x+=dx;if(T.lm<15)T.lock=0,T.lm++;T.rings.push({x:TBX+(c.x+1.5)*TCS,y:TBY+(c.y+2)*TCS,r0:3,r1:14,t:0,m:9,c:'#fff'});return true;}return false;}
function ttRotate(d){const T=TT,c=T.cur;if(!c||c.k===1)return;const nr=(c.r+d+4)&3;for(const o of [0,-1,1,-2,2]){if(ttOK(c.k,nr,c.x+o,c.y)){c.r=nr;c.x+=o;if(T.lm<15)T.lock=0,T.lm++;try{sfx.meow&&0;}catch(_){}ttPart(TBX+(c.x+1.5)*TCS,TBY+(c.y+1.5)*TCS,'#fff',3,2);return;}if(ttOK(c.k,nr,c.x+o,c.y-1)){c.r=nr;c.x+=o;c.y--;return;}}}
function ttGhostY(){const c=TT.cur;let y=c.y;while(ttOK(c.k,c.r,c.x,y+1))y++;return y;}
function ttHold(){const T=TT,c=T.cur;if(!T.canHold||!c)return;const h=T.hold;T.hold=c.k;T.canHold=false;if(h==null)ttSpawn();else ttSpawn(h);T.canHold=false;}
function ttLock(hard){
  const T=TT,c=T.cur;let top=99;
  for(const a of ttCells(c.k,c.r)){const cx=c.x+a[0],cy=c.y+a[1];if(cy<0){ttLose();return;}T.g[cy][cx]=c.k+1;top=Math.min(top,cy);ttPart(TBX+(cx+.5)*TCS,TBY+(cy+1)*TCS,TTC[c.k],2,2);}
  T.pieces++;T.canHold=true;T.maxH=Math.max(T.maxH,20-top);
  const rows=[];for(let y=0;y<20;y++)if(T.g[y].every(v=>v))rows.push(y);
  if(rows.length){T.clr={rows,t:0};const n=rows.length;T.combo++;T.maxCombo=Math.max(T.maxCombo,T.combo);const pts=[0,100,300,500,800][n]+50*Math.max(0,T.combo-1);T.score+=pts;T.sc=14;
    const nm=['','SINGLE','DOUBLE','TRIPLE','KITTY-TRIS!'][n];if(n===4)T.tetris++;T.shake=n>=3?12:5;T.fl=n>=3?14:8;T.fc=n===4?'255,216,74':'255,255,255';
    ttSay(TBX+105,TBY+rows[0]*TCS,nm+(T.combo>1?'  x'+T.combo:''),n===4?'#ffd84a':'#fff');
    for(const y of rows)for(let x=0;x<10;x++)ttPart(TBX+(x+.5)*TCS,TBY+(y+.5)*TCS,TTC[(T.g[y][x]-1+7)%7]||'#ddd',2,4);
    try{sfx.stomp();}catch(_){}
  } else {T.combo=0;T.shake=hard?4:T.shake;ttNext();}
}
function ttNext(){const T=TT;if(T.C.gp&&T.pieces%T.C.gp===0){ // rising kibble row
  if(T.g[0].some(v=>v)){ttLose();return;}T.g.shift();T.g.push(ttRow(T.R));T.shake=6;ttSay(TBX+105,TBY+19*TCS,'KIBBLE!','#c9b08a');}
  ttSpawn();}
function ttWin(){
  const T=TT,st=1+(T.maxH<=12?1:0)+((T.tetris>0||T.maxCombo>=3)?1:0);T.stars=st;PR.tet.st[T.i]=Math.max(PR.tet.st[T.i]||0,st);PR.tet.at=Math.max(PR.tet.at,T.i+1);savePR();state='ttwin';
  setTimeout(()=>{if(state!=='ttwin'||TT!==T)return;startCut(()=>{state='ttwin';const b=[];if(T.i<99)b.push(['Next stack ▶',()=>startTet(T.i+1),'on']);b.push(['Retry',()=>startTet(T.i)],['Map',()=>openGM('tet')],['Menu',showMenu]);
    showMsg('Stack cleared! 🧱',ttName(T.i)+'\n'+T.lines+' lines · '+T.score+' pts   '+'★'.repeat(st)+'☆'.repeat(3-st),b);},{salt:T.i+9,title:'STACK CLEARED!',big:T.C.boss});},700);
}
function ttTick(){
  const T=TT;if(!T)return;T.t++;
  for(const q of T.parts){q.x+=q.vx;q.y+=q.vy;q.vy+=.12;q.l--;}T.parts=T.parts.filter(q=>q.l>0);for(const q of T.txt)q.t++;T.txt=T.txt.filter(q=>q.t<60);if(T.shake>0)T.shake*=.84;if(T.spawnT>0)T.spawnT--;
  if(state==='ttwin'){jPress=0;aPress=0;SWIPE=null;return;}
  if(T.over){jPress=0;aPress=0;SWIPE=null;T.msgd++;if(T.msgd===50)showMsg('Stack overflow! 😿',ttName(T.i)+'\n'+T.lines+' / '+T.C.goal+' lines',[['Retry',()=>startTet(T.i),'on'],['Map',()=>openGM('tet')],['Menu',showMenu]]);return;}
  if(T.clr){T.clr.t++;if(T.clr.t>=20){const rs=T.clr.rows;const g=T.g.filter((_,y)=>!rs.includes(y));while(g.length<20)g.unshift(Array(10).fill(0));T.g=g;T.lines+=rs.length;T.clr=null;
      if(T.g.every(r=>r.every(v=>!v))){T.score+=1000;T.perf=60;ttSay(TBX+105,TBY+120,'PURR-FECT! +1000','#ffd84a');}
      if(T.lines>=T.C.goal){ttWin();return;}ttNext();}jPress=0;aPress=0;SWIPE=null;return;}
  if(T.t<70){jPress=0;aPress=0;SWIPE=null;return;}
  const c=T.cur;if(!c)return;
  // input
  const sw=SWIPE;SWIPE=null;
  let mv=T.mv;T.mv=0;
  if(sw==='l')mv-=1;if(sw==='r')mv+=1;
  if(keys.l&&!T.wl){mv-=1;T.das=0;}if(keys.r&&!T.wr){mv+=1;T.das=0;}T.wl=keys.l;T.wr=keys.r;
  if(keys.l!==keys.r){T.das++;if(T.das>11&&T.das%3===0)mv+=keys.l?-1:1;}else T.das=0;
  while(mv>0){ttMove(1);mv--;}while(mv<0){ttMove(-1);mv++;}
  if(T.hd||sw==='d'){T.hd=0;jPress=0;let n=0;const gy=ttGhostY();n=gy-c.y;for(let y=c.y;y<gy;y++)T.trail.push({x:c.x,y,k:c.k,r:c.r,l:10});c.y=gy;T.score+=2*n;T.shake=7;T.rings.push({x:TBX+(c.x+1.5)*TCS,y:TBY+(gy+2)*TCS,r0:6,r1:44,t:0,m:14,c:TTC[c.k]});ttLock(true);aPress=0;return;}
  if(sw==='u'){ttHold();jPress=0;aPress=0;return;}
  if(jPress||T.rot){jPress=0;T.rot=0;ttRotate(1);}
  aPress=0;
  // gravity
  const sp=keys.a?2:T.C.gs;T.fall++;
  if(ttOK(c.k,c.r,c.x,c.y+1)){T.lock=0;if(T.fall>=sp){T.fall=0;c.y++;if(keys.a)T.score+=1;}}
  else{T.lock++;if(T.lock>=26){ttLock(false);}}
}
/* ----- draw: 50 visual features (numbered) ----- */
function ttTin(c,x,y,s,col){
  const r=s*0.18;
  c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x+2,y+3,s-2,s-2);
  const bg=c.createLinearGradient(x,0,x+s,0);
  bg.addColorStop(0,shade(col,-0.5));bg.addColorStop(0.35,shade(col,0.2));bg.addColorStop(0.7,col);bg.addColorStop(1,shade(col,-0.55));
  rr(c,x+1,y+1,s-2,s-2,r);c.fillStyle=bg;c.fill();
  c.save();rr(c,x+1,y+1,s-2,s-2,r);c.clip();
  c.fillStyle='#eef2f7';c.fillRect(x,y,s,s*0.16);
  c.fillStyle='#7d8799';c.fillRect(x,y+s*0.9,s,s*0.1);
  c.fillStyle='#fff8ea';c.fillRect(x,y+s*0.36,s,s*0.28);
  c.fillStyle=col;c.fillRect(x,y+s*0.36,s,s*0.07);c.fillRect(x,y+s*0.57,s,s*0.07);
  if(s>=14){c.fillStyle=OL;const fx=x+s*0.5,fy=y+s*0.5;c.beginPath();c.ellipse(fx,fy,s*0.14,s*0.07,0,0,7);c.fill();c.beginPath();c.moveTo(fx+s*0.12,fy);c.lineTo(fx+s*0.24,fy-s*0.07);c.lineTo(fx+s*0.24,fy+s*0.07);c.closePath();c.fill();}
  c.fillStyle='rgba(255,255,255,.5)';c.fillRect(x+s*0.14,y+s*0.18,Math.max(1,s*0.07),s*0.6);
  c.restore();
  c.strokeStyle='rgba(23,18,31,.75)';c.lineWidth=1;rr(c,x+1,y+1,s-2,s-2,r);c.stroke();
}
function ttBlock(c,x,y,s,col,kind){
  if(kind===2){c.strokeStyle=col;c.lineWidth=2;c.globalAlpha=.55+.25*Math.sin(TT.t*.2);c.strokeRect(x+2,y+2,s-4,s-4);c.globalAlpha=1;return;}
  if(kind===1){
    col='#9c8566';
    c.fillStyle='rgba(0,0,0,.3)';c.fillRect(x+2,y+3,s-1,s-1);
    c.fillStyle=col;c.fillRect(x+1,y+1,s-2,s-2);
    c.fillStyle='rgba(255,255,255,.4)';c.fillRect(x+1,y+1,s-2,3);c.fillRect(x+1,y+1,3,s-2);
    c.fillStyle='rgba(0,0,0,.28)';c.fillRect(x+1,y+s-4,s-2,3);c.fillRect(x+s-4,y+1,3,s-2);
    c.fillStyle='#e8dcc0';c.fillRect(x+5,y+9,s-10,3);c.fillRect(x+4,y+7,3,7);c.fillRect(x+s-7,y+7,3,7);
    return;
  }
  ttTin(c,x,y,s,col);
}
function drawSprayDog(c,x,y,s,t,spraying){
  c.save();c.translate(x+s*0.4,y+s);
  const lw=Math.max(1.6,s*0.035),tan='#d99a52',tanD='#9a5f2e',w=s,h=s;
  const bob=spraying?Math.abs(Math.sin(t*0.3))*s*0.02:Math.sin(t*0.08)*s*0.01;
  c.translate(0,-bob);
  c.lineCap='round';
  // tail
  const wag=Math.sin(t*0.25)*s*0.07;
  c.beginPath();c.moveTo(-w*0.28,-h*0.36);c.quadraticCurveTo(-w*0.52,-h*0.5,-w*0.44+wag,-h*0.7);
  c.strokeStyle=OL;c.lineWidth=s*0.13+lw*2;c.stroke();c.strokeStyle=tan;c.lineWidth=s*0.13;c.stroke();
  // legs and paws
  rr(c,-w*0.3,-h*0.18,w*0.13,h*0.18,w*0.05);fillOL(c,tanD,lw);
  rr(c,-w*0.04,-h*0.18,w*0.13,h*0.18,w*0.05);fillOL(c,tan,lw);
  ell(c,-w*0.235,-h*0.02,w*0.075,h*0.03);fillOL(c,'#fff8ec',lw*0.7);
  ell(c,w*0.025,-h*0.02,w*0.075,h*0.03);fillOL(c,'#fff8ec',lw*0.7);
  // body with white chest and dark back patch
  ell(c,0,-h*0.32,w*0.34,h*0.2);fillOL(c,furGrad(c,0,-h*0.32,w*0.34,h*0.2,tan),lw);
  c.save();ell(c,0,-h*0.32,w*0.34,h*0.2);c.clip();
  ell(c,w*0.1,-h*0.2,w*0.2,h*0.13);c.fillStyle='#fff8ec';c.fill();
  ell(c,-w*0.22,-h*0.42,w*0.14,h*0.1);c.fillStyle=tanD;c.fill();
  c.restore();
  // red collar
  ell(c,w*0.17,-h*0.5,w*0.12,h*0.045,-0.25);fillOL(c,'#e63946',lw*0.7);
  // floppy ear (behind head)
  ell(c,w*0.06,-h*0.62+Math.sin(t*0.2)*s*0.01,w*0.075,h*0.15,0.25);fillOL(c,tanD,lw);
  // head, muzzle, nose, smile
  ell(c,w*0.22,-h*0.66,w*0.2,h*0.17);fillOL(c,furGrad(c,w*0.22,-h*0.66,w*0.2,h*0.17,tan),lw);
  ell(c,w*0.4,-h*0.58,w*0.13,h*0.09);fillOL(c,'#fff8ec',lw*0.8);
  ell(c,w*0.5,-h*0.62,w*0.045,h*0.035);c.fillStyle='#1b1018';c.fill();
  c.strokeStyle=OL;c.lineWidth=lw*0.6;c.beginPath();c.moveTo(w*0.4,-h*0.55);c.quadraticCurveTo(w*0.43,-h*0.49,w*0.47,-h*0.54);c.stroke();
  // eye with blink
  const ex=w*0.27,ey=-h*0.7;
  if(t%200<6){c.strokeStyle=OL;c.lineWidth=lw*0.8;c.beginPath();c.moveTo(ex-w*0.045,ey);c.lineTo(ex+w*0.045,ey);c.stroke();}
  else{
    ell(c,ex,ey,w*0.05,h*0.06);fillOL(c,'#ffffff',lw*0.6);
    ell(c,ex+w*0.01,ey+h*0.005,w*0.03,h*0.04);c.fillStyle='#2a1406';c.fill();
    ell(c,ex-w*0.008,ey-h*0.015,w*0.012,h*0.014);c.fillStyle='#ffffff';c.fill();
  }
  // spray bottle: teal body, white cap, pink trigger nozzle, held by the front paw
  ell(c,w*0.36,-h*0.24,w*0.11,h*0.06,-0.5);fillOL(c,tan,lw);
  rr(c,w*0.44,-h*0.4,w*0.12,h*0.28,w*0.05);fillOL(c,'#4fd1c5',lw);
  rr(c,w*0.44,-h*0.27,w*0.12,h*0.09,2);c.fillStyle='#fff8ea';c.fill();
  rr(c,w*0.47,-h*0.45,w*0.06,h*0.06,2);fillOL(c,'#ffffff',lw*0.6);
  rr(c,w*0.46,-h*0.48,w*0.22,h*0.04,2);fillOL(c,'#ff5d8f',lw*0.6);
  ell(c,w*0.45,-h*0.22,w*0.05,h*0.04);fillOL(c,'#fff8ec',lw*0.7);
  // mist from the nozzle
  if(spraying){
    const tx=w*0.7,ty=-h*0.46;
    for(let i=0;i<9;i++){
      const p=(t*0.04+i/9)%1,a=(hsh(i*3.1)-0.5)*0.35,d=p*s*0.7;
      const px=tx+Math.cos(a)*d,py=ty+Math.sin(a)*d+p*p*s*0.12;
      c.globalAlpha=1-p;c.fillStyle='#bff4ff';c.beginPath();c.arc(px,py,lw*(0.6+p*1.4),0,7);c.fill();
    }
    c.globalAlpha=1;
  }
  c.restore();
}
function drawTetris(){
  const T=TT,C=T.C,c=ctx,t=WT[C.w],rgb=h2r(t.acc),tt=T.t;
  c.save();if(T.shake>.5)c.translate((Math.random()-.5)*T.shake,(Math.random()-.5)*T.shake);
  // 1 world gradient bg 2 diagonal paw wallpaper 3 bokeh motes 
  const bg=c.createLinearGradient(0,0,0,448);bg.addColorStop(0,shd(t.side,-.55));bg.addColorStop(1,shd(t.side,-.8));c.fillStyle=bg;c.fillRect(-10,-10,820,470);
  c.fillStyle='rgba('+rgb+',.08)';for(let i=0;i<40;i++){const x=(hsh(i*5.1)*900+tt*.3*(1+hsh(i)))%860-30,y=(hsh(i*8.3)*500+tt*.2)%470;c.beginPath();c.arc(x,y,5,0,7);c.arc(x-7,y-6,2.5,0,7);c.arc(x,y-9,2.5,0,7);c.arc(x+7,y-6,2.5,0,7);c.fill();}
  for(let i=0;i<14;i++){const x=hsh(i*3.3)*800,y=(hsh(i*7.7)*500-tt*.5*(.4+hsh(i)))%470;c.fillStyle='rgba('+rgb+',.12)';c.beginPath();c.arc(x,y<0?y+470:y,8+hsh(i*2)*14,0,7);c.fill();}
  // 4 board neon frame 5 grid 6 inner gradient 44 level-coloured edge glow
  c.fillStyle='rgba(6,3,22,.82)';c.fillRect(TBX-8,TBY-8,TCS*10+16,TCS*20+16);
  const ig=c.createLinearGradient(0,TBY,0,TBY+420);ig.addColorStop(0,'rgba('+rgb+',.10)');ig.addColorStop(1,'rgba(0,0,0,.25)');c.fillStyle=ig;c.fillRect(TBX,TBY,TCS*10,TCS*20);
  c.strokeStyle='rgba(255,255,255,.07)';c.lineWidth=1;for(let x=1;x<10;x++){c.beginPath();c.moveTo(TBX+x*TCS+.5,TBY);c.lineTo(TBX+x*TCS+.5,TBY+420);c.stroke();}for(let y=1;y<20;y++){c.beginPath();c.moveTo(TBX,TBY+y*TCS+.5);c.lineTo(TBX+210,TBY+y*TCS+.5);c.stroke();}
  c.shadowColor=t.acc;c.shadowBlur=14;c.strokeStyle=t.acc;c.lineWidth=4;c.strokeRect(TBX-4,TBY-4,TCS*10+8,TCS*20+8);c.shadowBlur=0;c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=1;c.strokeRect(TBX-8,TBY-8,TCS*10+16,TCS*20+16);
  // 33 danger line + 29 danger pulse
  const danger=T.maxH>0&&T.g.slice(0,6).some(r=>r.some(v=>v));c.strokeStyle='rgba(255,60,60,'+(danger?.4+.4*Math.sin(tt*.3):.25)+')';c.setLineDash([6,5]);c.beginPath();c.moveTo(TBX,TBY+4*TCS);c.lineTo(TBX+210,TBY+4*TCS);c.stroke();c.setLineDash([]);
  // settled blocks (with 15 line-clear flash)
  const cr=T.clr?T.clr.rows:[];
  for(let y=0;y<20;y++)for(let x=0;x<10;x++){const v=T.g[y][x];if(!v)continue;const X=TBX+x*TCS,Y=TBY+y*TCS;
    if(cr.includes(y)){const k=T.clr.t/20;c.fillStyle='rgba(255,255,255,'+(1-k*.6)+')';c.fillRect(X,Y,TCS,TCS);if(T.clr.t>8){c.globalAlpha=1-(T.clr.t-8)/12;c.fillStyle=TTC[(v-1+7)%7];c.fillRect(X+2,Y+2,TCS-4,TCS-4);c.globalAlpha=1;}continue;}
    ttBlock(c,X,Y,TCS,TTC[(v-1)%7],v===8?1:0);}
  // 13 hard-drop trails
  for(let i=T.trail.length-1;i>=0;i--){const q=T.trail[i];q.l--;if(q.l<=0){T.trail.splice(i,1);continue;}c.globalAlpha=q.l/10*.18;for(const a of ttCells(q.k,q.r)){c.fillStyle=TTC[q.k];c.fillRect(TBX+(q.x+a[0])*TCS+4,TBY+(q.y+a[1])*TCS,TCS-8,TCS);}}c.globalAlpha=1;
  // current piece: 10 ghost 11 glow 42 spawn pop 43 soft-drop lines
  const cu=T.cur;if(cu&&!T.over&&!T.clr){const gy=ttGhostY();
    for(const a of ttCells(cu.k,cu.r)){if(gy!==cu.y&&gy+a[1]>=0)ttBlock(c,TBX+(cu.x+a[0])*TCS,TBY+(gy+a[1])*TCS,TCS,TTC[cu.k],2);}
    c.globalCompositeOperation='lighter';for(const a of ttCells(cu.k,cu.r))glow(c,TBX+(cu.x+a[0]+.5)*TCS,TBY+(cu.y+a[1]+.5)*TCS,22,h2r(TTC[cu.k]),.25);c.globalCompositeOperation='source-over';
    const pop=T.spawnT>0?1+T.spawnT*.02:1;
    for(const a of ttCells(cu.k,cu.r)){if(cu.y+a[1]<0)continue;const X=TBX+(cu.x+a[0])*TCS,Y=TBY+(cu.y+a[1])*TCS;c.save();c.translate(X+TCS/2,Y+TCS/2);c.scale(pop,pop);ttBlock(c,-TCS/2,-TCS/2,TCS,TTC[cu.k],0);
      if(T.lock>0){c.fillStyle='rgba(255,255,255,'+(T.lock/26*.5)+')';c.fillRect(-TCS/2,-TCS/2,TCS,TCS);}c.restore();}   // 12 lock flash
    if(keys.a){c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=1.5;for(const a of ttCells(cu.k,cu.r)){const X=TBX+(cu.x+a[0])*TCS+TCS/2,Y=TBY+(cu.y+a[1])*TCS;c.beginPath();c.moveTo(X,Y-4);c.lineTo(X,Y-14-Math.random()*6);c.stroke();}}
  }
  // 14 shock rings 16/17 particles & popups 
  vring(T.rings,c,'#fff',2.5);
  for(const q of T.parts){c.globalAlpha=Math.max(0,q.l/q.m);c.fillStyle=q.c;c.fillRect(q.x-2,q.y-2,4,4);}c.globalAlpha=1;
  c.font='900 15px system-ui';c.textAlign='center';for(const q of T.txt){c.globalAlpha=1-q.t/60;c.lineWidth=4;c.strokeStyle=OL;c.strokeText(q.s,q.x,q.y-q.t*.7);c.fillStyle=q.c;c.fillText(q.s,q.x,q.y-q.t*.7);}c.globalAlpha=1;
  // panels: 21 NEXT queue (3) 45 float bob 22 HOLD 46 dim when used
  const mini=(k,x,y,s,a)=>{c.globalAlpha=a;for(const p of ttCells(k,0))ttBlock(c,x+p[0]*s,y+p[1]*s,s,TTC[k],0);c.globalAlpha=1;};
  vpanel(c,TBX+230,14,100,196,'#fff','rgba(12,8,34,.6)');c.font='900 11px system-ui';c.textAlign='center';c.fillStyle='#fff';c.fillText('NEXT',TBX+280,30);
  for(let i=0;i<3;i++)mini(T.next[i],TBX+246+(T.next[i]===1?6:0)-(T.next[i]===0?4:0),40+i*56+Math.sin(tt*.06+i)*2,i?13:16,i?.7:1);
  vpanel(c,TBX-130,14,100,84,'#fff','rgba(12,8,34,.6)');c.fillStyle='#fff';c.fillText('HOLD',TBX-80,30);
  if(T.hold!=null)mini(T.hold,TBX-112+(T.hold===1?6:0)-(T.hold===0?4:0),44,16,T.canHold?1:.35);
  // 23 score panel (count-up) 47 outlined text 48 time 49 line pips
  vpanel(c,TBX-130,106,100,104,'#fff','rgba(12,8,34,.6)');T.disp=(T.disp||0)+(T.score-(T.disp||0))*.2;
  c.font='800 10px system-ui';c.fillStyle='#aaa';c.fillText('SCORE',TBX-80,122);c.font='900 20px system-ui';c.lineWidth=4;c.strokeStyle=OL;c.fillStyle=T.sc>0?'#fff':'#ffd84a';c.strokeText(String(Math.round(T.disp)),TBX-80,146);c.fillText(String(Math.round(T.disp)),TBX-80,146);if(T.sc>0)T.sc--;
  c.font='800 10px system-ui';c.fillStyle='#aaa';c.fillText('LINES',TBX-80,164);c.font='900 18px system-ui';c.fillStyle='#fff';c.fillText(T.lines+' / '+C.goal,TBX-80,184);
  const sec=Math.floor(tt/60);c.font='700 10px system-ui';c.fillStyle='#aaa';c.fillText('⏱ '+Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0'),TBX-80,202);
  // 24 goal progress bar 49 pips
  vpanel(c,TBX+230,218,100,44,'#fff','rgba(12,8,34,.6)');c.fillStyle='#fff';c.font='800 10px system-ui';c.fillText('GOAL',TBX+280,234);
  for(let i=0;i<C.goal;i++){c.fillStyle=i<T.lines?'#46e0a0':'rgba(255,255,255,.2)';c.fillRect(TBX+236+i*(88/C.goal),242,Math.max(2,88/C.goal-2),10);}
  // 18 combo counter
  if(T.combo>1){vpanel(c,TBX+230,270,100,30,'#ffd84a','rgba(12,8,34,.7)');c.font='900 14px system-ui';c.fillStyle='#ffd84a';c.fillText('COMBO x'+T.combo,TBX+280,291);}
  // 26 opponent critter reacts 27 player cat cheers 
  const crit=critSz(C.v),cs=C.boss?2.6:1.9,hurt=T.clr?1:0;drawCritArt(c,C.v,TBX+280+(hurt?Math.sin(tt)*3:0),410-(hurt?6:0),crit[0]*cs,crit[1]*cs,-1,tt);
  drawSprayDog(c,TBX-140,432-110-(T.clr?Math.abs(Math.sin(tt*.3))*14:0),110,tt,!!T.clr||(tt%240)<40);
  // 25 title banner 
  c.font='800 11px system-ui';c.textAlign='center';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.7)';c.fillStyle='#fff';c.textAlign='left';c.strokeText(ttName(T.i),22,30);c.fillText(ttName(T.i),22,30);c.textAlign='center';
  // 36 fish rain on win 50 game-over crack
  if(state==='ttwin'){for(let i=0;i<14;i++){const x=hsh(i*4.4)*800,y=((tt*3+hsh(i)*500)%500)-30;tpFish(c,x,y,1);}vflash(c,'255,230,120',.12);}
  if(T.over){c.fillStyle='rgba(0,0,0,.35)';c.fillRect(TBX,TBY,210,420);c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=2;c.beginPath();c.moveTo(TBX+30,TBY);c.lineTo(TBX+80,TBY+150);c.lineTo(TBX+60,TBY+300);c.lineTo(TBX+130,TBY+420);c.stroke();}
  if(T.perf>0){T.perf--;vflash(c,'255,230,120',T.perf/60*.2);for(let i=0;i<6;i++)vspark(c,TBX+hsh(i*3+tt*.02)*210,TBY+hsh(i*7)*420,6,.8);}  // 35 perfect clear
  // 37 countdown 
  if(tt<70){const n=3-Math.floor(tt/24);c.font='900 90px system-ui';c.textAlign='center';c.lineWidth=8;c.strokeStyle=OL;const s=n>0?String(n):'GO!';c.strokeText(s,TBX+105,260);c.fillStyle='#ffd84a';c.fillText(s,TBX+105,260);}
  c.restore();
  // 30 vignette 31 scanlines 32 corner brackets 19 flash 29 danger red 39 hint
  if(T.fl>0){vflash(c,T.fc,T.fl/26*.3);T.fl--;}
  if(danger&&!T.over)vign(c,'255,20,40',.2+.15*Math.sin(tt*.25),180);
  vmotes(c,tt,14,rgb,.5,2);vign(c,'6,2,24',.4,220);c.drawImage(SCNL,0,0);vbrackets(c,'rgba('+rgb+',.9)',tt,3);
  c.font='700 10px system-ui';c.textAlign='center';c.fillStyle='rgba(255,255,255,.55)';c.fillText('tap = rotate · drag = move · swipe ↓ drop · swipe ↑ hold',400,442);
}
// wiring
NAMEF.tet=ttName;STARTF.tet=startTet;TITLEF.tet='🧱 KITTY TETRIS';
{const _u=update;update=function(){if(state==='tet'||state==='ttwin'){ttTick();return;}_u();};
 const _r=render;render=function(){ctx.setTransform(RK,0,0,RK,0,0);if((state==='tet'||state==='ttwin')&&TT){drawTetris();return;}_r();};
 const _sl=startLevel;startLevel=function(){if(MODE==='tet'&&state!=='gmap'){startTet(TTI);return;}_sl();};
 const _sm=showMenu;showMenu=function(){TT=null;_sm();};}
$('tet').onclick=()=>{location.href='tetris3d.html';};
addEventListener('keydown',e=>{if(state!=='tet'||!TT||paused)return;if(e.code==='Space'){e.preventDefault();TT.hd=1;}else if(e.code==='KeyC'||e.code==='ShiftLeft'||e.code==='ShiftRight'){TT.rot=0;ttHold();}else if(e.code==='KeyZ'){ttRotate(-1);}},true);
(function(){let s=null;const act=()=>state==='tet'&&TT&&!paused;
  cv.addEventListener('pointerdown',e=>{if(!act())return;audioInit();s={id:e.pointerId,x:e.clientX,y:e.clientY,lx:e.clientX,t:performance.now(),moved:false};try{cv.setPointerCapture(e.pointerId);}catch(_){}});
  cv.addEventListener('pointermove',e=>{if(!s||e.pointerId!==s.id||!act())return;const r=cv.getBoundingClientRect(),cell=TCS*r.width/800;while(e.clientX-s.lx>cell*.9){TT.mv++;s.lx+=cell*.9;s.moved=true;}while(s.lx-e.clientX>cell*.9){TT.mv--;s.lx-=cell*.9;s.moved=true;}});
  const end=e=>{if(!s||e.pointerId!==s.id)return;const dx=e.clientX-s.x,dy=e.clientY-s.y,dt=performance.now()-s.t;
    if(act()){if(dy>60&&Math.abs(dy)>Math.abs(dx)*1.5&&dt<450)TT.hd=1;else if(dy<-60&&Math.abs(dy)>Math.abs(dx)*1.5&&dt<450)SWIPE='u';else if(!s.moved&&Math.hypot(dx,dy)<14&&dt<300)TT.rot=1;}s=null;};
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);})();


/* ================= STORY MODE + RUN MODE VISUALS (turn 6): 50 each ================= */
const _rPlat=render;
const PFX={hp:0,fish:0,fl:0,fp:0,trail:[],dust:[],rings:[],lg:true,zone:-1,zt:0};
render=function(){
  _rPlat();
  if(state!=='play'||!P||!L)return;
  const c=ctx,run=!!RUN,t=tick,F=PFX,px=P.x+P.w/2-cam,py=P.y+P.h/2,vx=P.vx||0,sp=Math.abs(vx);
  if(F.pid!==P){F.pid=P;F.hp=P.hp;F.fish=P.fish||0;F.trail=[];F.dust=[];F.rings=[];F.zone=-1;F.t0=t;}
  if(P.hp<F.hp)F.fl=22;F.hp=P.hp;
  if((P.fish||0)!==F.fish){F.fp=14;F.fish=P.fish||0;}
  if(F.og===false&&P.onGround&&F.lvy>4)F.rings.push({x:px,y:P.y+P.h,r0:3,r1:26,t:0,m:14});F.og=P.onGround;F.lvy=P.vy;
  if(P.onGround&&sp>1.2&&t%4===0)F.dust.push({x:P.x+P.w/2-cam-P.face*6,y:P.y+P.h-2,vx:-P.face*(.5+Math.random()),vy:-Math.random()*1.2,l:16});
  if(t%3===0)F.trail.push([P.x-cam,P.y,P.w,P.h]);if(F.trail.length>6)F.trail.shift();
  c.save();
  // 1 sun glow  2 god-rays  3 horizon haze  4 low mist  (shared)
  c.globalCompositeOperation='lighter';glow(c,690,40,150,'255,230,160',.26);
  for(let i=0;i<4;i++){const x=520+i*90+Math.sin(t*.01+i)*20,g=c.createLinearGradient(x,0,x-120,448);g.addColorStop(0,'rgba(255,240,190,.10)');g.addColorStop(1,'rgba(255,240,190,0)');c.fillStyle=g;c.beginPath();c.moveTo(x,0);c.lineTo(x+40,0);c.lineTo(x-90,448);c.lineTo(x-150,448);c.fill();}
  c.globalCompositeOperation='source-over';
  const mg=c.createLinearGradient(0,330,0,448);mg.addColorStop(0,'rgba(255,255,255,0)');mg.addColorStop(1,'rgba(255,255,255,.10)');c.fillStyle=mg;c.fillRect(0,330,800,118);
  // 5 floating fireflies/pollen  6 drifting leaf shadows
  for(let i=0;i<20;i++){const x=((hsh(i*4.3)*900-cam*.15*(.5+hsh(i))+t*.3*(.3+hsh(i*2)))%860+860)%860-30,y=60+hsh(i*7.9)*330+Math.sin(t*.03+i)*8;c.fillStyle='rgba(255,250,170,'+(.2+.4*Math.abs(Math.sin(t*.04+i)))+')';c.fillRect(x,y,2.4,2.4);}
  // 7 colour grade / 8 vignette
  vign(c,'20,10,50',.38,210);
  // 9 landing rings 10 foot dust 11 cat ground shadow 12 rim glow
  for(let i=F.dust.length-1;i>=0;i--){const d=F.dust[i];d.x+=d.vx;d.y+=d.vy;d.l--;if(d.l<=0){F.dust.splice(i,1);continue;}c.globalAlpha=d.l/16*.5;c.fillStyle='#f0e6d0';c.fillRect(d.x,d.y,4,4);}c.globalAlpha=1;
  vring(F.rings,c,'#fff',2.5);
  c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(px,P.onGround?P.y+P.h+1:py+P.h/2+30,P.w*.5,4,0,0,7);c.fill();
  c.globalCompositeOperation='lighter';glow(c,px,py,50,'255,240,200',.12);c.globalCompositeOperation='source-over';
  // 13 speed afterimages  14 sprint speed lines  15 sprint flame sparks
  const fast=sp>3.4||keys.s&&sp>2;
  if(fast){for(let i=0;i<F.trail.length;i++){const a=F.trail[i];c.globalAlpha=i/F.trail.length*.14;c.fillStyle='#fff';c.fillRect(a[0],a[1],a[2],a[3]);}c.globalAlpha=1;
    c.strokeStyle='rgba(255,255,255,.28)';c.lineWidth=1.2;for(let i=0;i<9;i++){const y=60+hsh(i*3.1)*300,x=((t*14+hsh(i)*VW)%(VW+100))-50;c.beginPath();c.moveTo(x,y);c.lineTo(x-P.face*40,y);c.stroke();}
    if(t%2===0)for(let i=0;i<2;i++)vspark(c,px-P.face*(10+Math.random()*16),P.y+P.h-4-Math.random()*8,3,.8);}
  // 16 shield bubble highlight 17 magnet ring 18 puff aura 19 combo ring 20 nip rainbow edge
  if(P.shield>0){c.strokeStyle='rgba(180,230,255,.8)';c.lineWidth=2;c.beginPath();c.arc(px,py,Math.max(P.w,P.h)*.9,0,7);c.stroke();vspark(c,px+Math.cos(t*.1)*30,py-Math.sin(t*.1)*30,4,.9);}
  if(P.magT>0){c.strokeStyle='rgba(255,90,90,.5)';c.lineWidth=2;c.setLineDash([5,5]);c.beginPath();c.arc(px,py,90+Math.sin(t*.2)*4,t*.05,t*.05+6.28);c.stroke();c.setLineDash([]);}
  if(P.puffT>0){c.globalCompositeOperation='lighter';glow(c,px,py,60+Math.sin(t*.3)*5,'255,120,80',.35);c.globalCompositeOperation='source-over';}
  if(P.combo>1&&P.comboT>0){c.strokeStyle='rgba(255,216,74,'+Math.min(1,P.comboT/60)+')';c.lineWidth=2;c.beginPath();c.arc(px,py-P.h*.8,16+P.combo,0,7);c.stroke();}
  if(P.nipT>0){const hu=(t*6)%360;c.strokeStyle='hsla('+hu+',90%,65%,.55)';c.lineWidth=10;c.strokeRect(5,5,VW-10,438);}
  // 21 hit flash 22 low-hp pulse 23 fish pickup flash 
  if(F.fl>0){vflash(c,'255,40,60',F.fl/22*.35);F.fl--;}else if(P.hp<=1&&P.maxhp>1)vign(c,'255,20,40',.16+.12*Math.sin(t*.15),170);
  if(F.fp>0){c.fillStyle='rgba(255,216,74,'+(F.fp/14*.3)+')';c.fillRect(6,6,150,40);F.fp--;}
  // 24 sparkles on pickups 25 bloom on fish 26 tin glow
  c.globalCompositeOperation='lighter';
  for(const co of L.coins){if(co.got)continue;const x=co.x-cam;if(x<-20||x>VW+20)continue;glow(c,x,co.y,18,'255,200,90',.16);if((t+Math.floor(co.x))%50<4)vspark(c,x+7,co.y-8,4,.9);}
  for(const n of L.nips){if(n.got)continue;const x=n.x-cam;if(x>-30&&x<VW+30)glow(c,x,n.y,26,'192,139,255',.25);}
  c.globalCompositeOperation='source-over';
  // 27 corner brackets 28 HUD frame lines 29 top gloss 30 bottom ground gradient
  vbrackets(c,'rgba(255,255,255,.4)',t,3);
  const tg=c.createLinearGradient(0,0,0,60);tg.addColorStop(0,'rgba(0,0,0,.28)');tg.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=tg;c.fillRect(0,0,VW,60);
  const bg=c.createLinearGradient(0,400,0,448);bg.addColorStop(0,'rgba(0,0,0,0)');bg.addColorStop(1,'rgba(0,0,0,.25)');c.fillStyle=bg;c.fillRect(0,400,VW,48);
  // 31 enemy-near edge warning arrows 32 offscreen goal arrow (story) 
  for(const en of L.enemies){if(en.dead)continue;const x=en.x-cam;if(x>VW&&x<VW+180&&Math.abs(en.y-py)<120||x<0&&x>-180&&Math.abs(en.y-py)<120){c.fillStyle='rgba(255,70,70,'+(.4+.3*Math.sin(t*.3))+')';const ex=x>VW?VW-12:12,d=x>VW?-1:1;c.beginPath();c.moveTo(ex,en.y);c.lineTo(ex+d*12,en.y-8);c.lineTo(ex+d*12,en.y+8);c.fill();}}
  // 33 corner light leak 34 film-warm tint 35 depth fog top 
  c.fillStyle='rgba(255,170,90,.035)';c.fillRect(0,0,VW,448);
  c.globalCompositeOperation='lighter';glow(c,0,0,200,'255,220,160',.06);c.globalCompositeOperation='source-over';
  if(!run){
    // ===== STORY-only: 36 progress bar 37 paw marker 38 milestone pips 39 level banner 40 goal arrow 41 goal glow 42 star-lit night sparkles 43 bottom chapter text 44 fish-count panel 45 hearts panel frame 46 pause hint 47 win glow 48 sprint hint 49 boss vignette 50 time
    const W=L.W*TS,pr=Math.max(0,Math.min(1,P.x/W));
    const nw=VW<640,bw=nw?VW-60:300,bx=nw?30:VW/2-150,by=nw?VH-26:6;
    vpanel(c,bx,by,bw,18,'rgba(255,255,255,.55)','rgba(12,8,34,.5)');c.fillStyle='#46e0a0';c.fillRect(bx+4,by+6,(bw-8)*pr,6);
    for(let i=1;i<4;i++){c.fillStyle='rgba(255,255,255,.5)';c.fillRect(bx+bw*i/4,by+4,2,10);}
    c.font='900 11px system-ui';c.textAlign='left';c.fillText('🐾',bx-2+(bw-8)*pr,by+14);c.fillText('🏁',bx+bw-14,by+14);
    if(t-F.t0<120){const a=Math.min(1,(120-(t-F.t0))/30);c.globalAlpha=a;vpanel(c,VW/2-150,VW<640?176:60,300,34,'#ffd84a','rgba(12,8,34,.8)');c.font='900 15px system-ui';c.textAlign='center';c.fillStyle='#ffd84a';c.fillText('📖 Story · Chapter '+((typeof storyIdx==='number'?storyIdx:0)+1),VW/2,(VW<640?176:60)+22);c.globalAlpha=1;}
    const gx=(L.goal&&L.goal.x!=null?L.goal.x:W-TS*2)-cam;
    if(gx>0&&gx<VW+100){c.globalCompositeOperation='lighter';const gg=c.createLinearGradient(0,0,0,448);gg.addColorStop(0,'rgba(255,216,74,0)');gg.addColorStop(1,'rgba(255,216,74,.22)');c.fillStyle=gg;c.fillRect(gx-16,0,32,448);c.globalCompositeOperation='source-over';}
    else if(gx>=VW+100){c.fillStyle='rgba(255,216,74,'+(.6+.3*Math.sin(t*.2))+')';c.beginPath();c.moveTo(VW-8,224);c.lineTo(VW-24,214);c.lineTo(VW-24,234);c.fill();}
    if(L.boss||L.arena){vign(c,'120,0,40',.25,160);}
    c.font='700 10px system-ui';c.textAlign='center';c.fillStyle='rgba(255,255,255,.5)';if(t-F.t0<400&&!TOUCHY)c.fillText('hold SHIFT / SPRINT to run faster',VW/2,440);
  } else {
    // ===== RUN-only: 36 distance panel 37 speed meter 38 zone banner every 400m 39 pace chevrons 40 ground speed streaks 41 combo flame 42 magnet pulse 43 distance milestones 44 danger scan 45 lane-line glow 46 best marker 47 runner heat tint 48 score tick 49 rush edge blur 50 finish
    const d=runDist(),z=Math.floor(d/400);if(z!==F.zone){F.zone=z;F.zt=110;}
    const rx=VW/2-70;vpanel(c,rx,VW<640?96:60,140,24,'rgba(255,255,255,.55)','rgba(12,8,34,.55)');c.font='900 13px system-ui';c.textAlign='center';c.fillStyle='#fff';c.fillText(d+' m',VW/2,(VW<640?96:60)+17);
    const spd=Math.min(1,(RUNSPD-1)/.5);{const sy=VW<640?124:88;vpanel(c,rx,sy,140,12,'rgba(255,255,255,.4)','rgba(12,8,34,.5)');c.fillStyle=spd>.7?'#ff5a3a':'#46e0a0';c.fillRect(rx+3,sy+4,134*(.15+spd*.85),4);}
    if(F.zt>0){const a=Math.min(1,F.zt/30);c.globalAlpha=a;vpanel(c,VW/2-120,160,240,40,'#ffd84a','rgba(12,8,34,.8)');c.font='900 18px system-ui';c.fillStyle='#ffd84a';c.fillText('ZONE '+(z+1)+(z>0?' · '+(z*400)+' m!':' · GO!'),VW/2,187);c.globalAlpha=1;F.zt--;}
    c.fillStyle='rgba(255,255,255,.22)';for(let i=0;i<4;i++){const x=((t*(6+spd*6)+i*220)%(VW+100))-60;c.beginPath();c.moveTo(x,418);c.lineTo(x+14,426);c.lineTo(x,434);c.lineTo(x+4,426);c.fill();}
    c.strokeStyle='rgba(255,255,255,'+(.08+spd*.2)+')';c.lineWidth=1.5;for(let i=0;i<10;i++){const y=380+hsh(i*3)*60,x=((t*(14+spd*8)+hsh(i)*VW)%(VW+160))-80;c.beginPath();c.moveTo(x,y);c.lineTo(x-50-spd*40,y);c.stroke();}
    if(P.combo>2){c.globalCompositeOperation='lighter';glow(c,px,P.y+P.h,40,'255,140,40',.3);c.globalCompositeOperation='source-over';}
    if(spd>.6)vign(c,'255,80,20',.12+spd*.12,200);
    const best=((RC.best||{})[RS&&RS.g]||[])[0]||0;if(best&&d<best&&best-d<40){c.fillStyle='rgba(255,216,74,.9)';c.font='800 11px system-ui';c.fillText('★ best in '+(best-d)+' m',VW/2,(VW<640?148:112));}
    c.font='900 11px system-ui';c.textAlign='right';c.fillStyle='#ffd84a';c.fillText('SCORE '+(Math.floor(d*2)+(P.bonus||0)),VW-6,VW<640?132:66);
  }
  c.restore();
};

// UI: button ripple
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest('button.b');if(!b)return;const r=b.getBoundingClientRect(),d=document.createElement('i');d.className='rip';d.style.left=(e.clientX-r.left-4)+'px';d.style.top=(e.clientY-r.top-4)+'px';b.appendChild(d);setTimeout(()=>d.remove(),520);},true);

startIntro();
requestAnimationFrame(frame);
/* music: a new random song when a game starts (it stops again in showMenu when you leave the game) */
(()=>{let was='intro';setInterval(()=>{const inGame=state!=='menu'&&state!=='intro',wasGame=was!=='menu'&&was!=='intro';
  if(inGame&&!wasGame){try{if(window.CQMidi){const c=CQMidi.current();if(!c||/hard-knock/.test(c.id))CQMidi.random();}}catch(_){}}
  was=state;},200);})();

// mobile: world map button while playing story mode
(()=>{const b=document.getElementById('mapb');if(!b)return;
  b.onclick=()=>{if(!story||OWM!=='story')return;togglePause(false);openWorld();};
  setInterval(()=>{const on=story&&OWM==='story'&&(state==='play'||state==='dead');b.classList.toggle('on',on);},250);
})();


/* ---------- desktop: click the story / run map, and arrow-key menus ---------- */
(()=>{
  // click a level on the world map to walk there and play it
  cv.addEventListener('click',e=>{
    if(state!=='world'||paused)return;
    const r=cv.getBoundingClientRect(),px=(e.clientX-r.left)*VW/r.width,py=(e.clientY-r.top)*VH/r.height;
    for(let i=0;i<SEQ.length;i++){const X=NX[i]-OW.cam,Y=NY[i];
      if(Math.hypot(X-px,Y-py)<(SEQ[i].boss?27:22)){
        if(i>Math.min(SEQ.length-1,owAt())){toast('🔒 Beat the level before it first');return;}
        OW.u=i;enterNode(i);return;}}
  });
  cv.addEventListener('mousemove',e=>{
    if(state!=='world'||paused){if(cv.style.cursor)cv.style.cursor='';return;}
    const r=cv.getBoundingClientRect(),px=(e.clientX-r.left)*VW/r.width,py=(e.clientY-r.top)*VH/r.height;let on=false;
    for(let i=0;i<SEQ.length;i++){if(Math.hypot(NX[i]-OW.cam-px,NY[i]-py)<22){on=true;break;}}
    cv.style.cursor=on?'pointer':'';
  });
  // mouse wheel pans the world map
  cv.addEventListener('wheel',e=>{if(state!=='world'||paused)return;e.preventDefault();const d=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)>0?1:-1;OW.u=Math.max(0,Math.min(Math.min(SEQ.length-1,owAt()),Math.round(OW.u)+d));},{passive:false});

  // arrow keys move between the buttons of an open menu screen; Enter / Space presses
  const OVS=['#pause','#wm','#runsetup','#msg'];
  const openOv=()=>{for(const q of OVS){const o=document.querySelector(q);if(o&&!o.classList.contains('hide')&&o.getClientRects().length&&getComputedStyle(o).display!=='none')return o;}return null;};
  const items=o=>[...o.querySelectorAll('button,select,input')].filter(b=>!b.disabled&&b.getClientRects().length&&getComputedStyle(b).visibility!=='hidden');
  window.cqNav=function(dir,o){
    o=o||openOv();if(!o)return false;const L=items(o);if(!L.length)return false;
    const a=document.activeElement;
    if(!a||!o.contains(a)){(L.find(b=>!b.classList.contains('lk'))||L[0]).focus();return true;}
    const ra=a.getBoundingClientRect(),ax=ra.left+ra.width/2,ay=ra.top+ra.height/2;let best=null,bd=1e9;
    for(const b of L){if(b===a)continue;const r=b.getBoundingClientRect(),bx=r.left+r.width/2,by=r.top+r.height/2,dx=bx-ax,dy=by-ay;
      let main,side;
      if(dir==='L'){if(dx>-4||Math.abs(dy)>ra.height*.6)continue;main=-dx;side=Math.abs(dy);}
      else if(dir==='R'){if(dx<4||Math.abs(dy)>ra.height*.6)continue;main=dx;side=Math.abs(dy);}
      else if(dir==='U'){if(dy>-8)continue;main=-dy;side=Math.abs(dx);}
      else{if(dy<8)continue;main=dy;side=Math.abs(dx);}
      const sc=main+side*2;if(sc<bd){bd=sc;best=b;}}
    if(!best&&(dir==='L'||dir==='R')){const i=L.indexOf(a);best=L[(i+(dir==='R'?1:-1)+L.length)%L.length];}
    if(best){best.focus({preventScroll:true});best.scrollIntoView({block:'nearest',inline:'nearest'});}
    return true;
  };
  addEventListener('keydown',e=>{
    const o=openOv();if(!o)return;
    const t=e.target;if(t&&t.tagName==='INPUT')return;                                  // typing in a code box
    if(t&&t.tagName==='SELECT'&&/Arrow(Up|Down)/.test(e.code))return;                // ↑↓ change the level list
    const D={ArrowLeft:'L',ArrowRight:'R',ArrowUp:'U',ArrowDown:'D'}[e.code];
    if(D){e.preventDefault();e.stopImmediatePropagation();cqNav(D,o);return;}
    if(o.id==='wm'&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeWM();return;}
    if((e.code==='Enter'||e.code==='Space')&&document.activeElement&&o.contains(document.activeElement)&&document.activeElement.tagName==='BUTTON'){e.preventDefault();e.stopImmediatePropagation();document.activeElement.click();}
  },true);
  // controller: D-pad / stick moves around the Levels & worlds screen too
  let pv=[],ax0='';
  setInterval(()=>{
    const w=$('wm');if(w.classList.contains('hide')){pv=[];return;}
    let gp=null;try{for(const g of navigator.getGamepads?navigator.getGamepads():[])if(g&&g.connected){gp=g;break;}}catch(_){}
    if(!gp)return;const pr=gp.buttons.map(b=>b.pressed),ed=i=>pr[i]&&!pv[i];
    const sx=(gp.axes[0]||0)<-.5?'L':(gp.axes[0]||0)>.5?'R':'',sy=(gp.axes[1]||0)<-.5?'U':(gp.axes[1]||0)>.5?'D':'',st=sx||sy;
    if(ed(14))cqNav('L',w);if(ed(15))cqNav('R',w);if(ed(12))cqNav('U',w);if(ed(13))cqNav('D',w);
    if(st&&st!==ax0)cqNav(st,w);ax0=st;
    if(ed(0)&&document.activeElement&&w.contains(document.activeElement))document.activeElement.click();
    if(ed(1))closeWM();
    pv=pr;
  },60);
})();
