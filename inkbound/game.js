import {roster} from './roster.js';
import {environments,stageKey} from './stage-data.js';
import {ArenaFx} from './arena-fx.js';
import {comboFor,poseAt} from './combos.js';
import {actionOf} from './controls.js';
import {resolveSpecial,resolveGrab,resolveDive,GRAB_VARIANTS,DIVE_VARIANTS,reachBonus} from './moveset.js';
import {cfg} from './settings.js';
function drawWavy(ctx,im,w,h,t,ph,amp){const sw=im.naturalWidth,sh=im.naturalHeight,n=22,seg=sh/n,dh=h/n;for(let k=0;k<n;k++){const off=Math.sin(t*3.3+k*.5+ph)*amp*(k/n);ctx.drawImage(im,0,k*seg,sw,seg+.5,-w/2+off,-h+k*dh,w,dh+.6)}}
const W=1280,H=720,WW=2560,FL=200,FR=WW-200,SPAWN=[760,1800],FALL=1100;
const FACES_LEFT=new Set([21]);
const sp=p=>cfg('moveSpeed')*cfg('speed_'+roster[p.id].shape);
const KINDS=['solid','move','spin','bounce','crumble','vert'];
const BASE_MOVES={heavy:['Heavy ink jab','Earthshaker · close-range launch'],ghost:['Phantom touch','Spectral rush · aerial recovery'],rabbit:['Quick jab','Lucky shot · fast projectile'],tall:['Long-reach jab','Reel shot · ranged ink'],duo:['Double trouble','Reel shot · ranged ink']};
// Per-shape moveset for the G (grab) and F (dive) buttons: [name, detail, damage, launch-or-radius]
const NEWM={
 heavy:{g:['Bear hug throw','Launches rivals high',12,1],d:['Belly splash','Heavy crash landing',13,160]},
 ghost:{g:['Spectral pull','Quick toss',8,0],d:['Phantom drop','Ghostly shockwave',9,150]},
 rabbit:{g:['Bunny toss','Quick, light fling',7,0],d:['Hop bomb','Bounces off the landing',8,150]},
 tall:{g:['Long-arm grab','Reaches far',9,0],d:['Tower stomp','Wide shockwave',11,200]},
 duo:{g:['Tag-team toss','Two-part throw',9,1],d:['Double dive','Crash landing',9,150]},
 cat:{g:['Claw snatch','Fast, sharp grab',8,0],d:['Pounce drop','Lands hard',10,150]},
 dog:{g:['Tug toss','Strong throw',10,1],d:['Belly bounce','Crash landing',10,150]},
 mouse:{g:['Pocket pull','Quick snatch',7,0],d:['Crumb drop','Small shockwave',8,120]},
 human:{g:['Suplex','Launches rivals high',11,1],d:['Hammer drop','Heavy landing',12,160]},
 bird:{g:['Talon grab','Tugs rivals in',8,0],d:['Swoop dive','Swift shockwave',9,150]},
 frog:{g:['Tongue flick','Long reach',8,0],d:['Belly flop','Splash landing',10,150]},
 def:{g:['Grab throw','Close-range toss',9,0],d:['Dive bomb','Crash landing',10,150]}
};
export function mkMoves(c){const m=NEWM[c.shape]||NEWM.def;return {g:{name:m.g[0],detail:m.g[1],dmg:m.g[2],up:!!m.g[3]},d:{name:m.d[0],detail:m.d[1],dmg:m.d[2],r:m.d[3]}}}
export function movesFor(c){const b=BASE_MOVES[c.shape]||['Ink jab','Reel shot · ranged ink'],m=mkMoves(c);return [b[0],b[1],m.g.name+' · '+m.g.detail,m.d.name+' · '+m.d.detail]}
function seeded(key){let s=7;for(const ch of key)s=(s*31+ch.charCodeAt(0))%2147483647;return()=>{s=(s*16807)%2147483647;return s/2147483647}}
export function buildLayout(key,ground){
 const r=seeded(key),plats=[{kind:'floor',x:FL,w:FR-FL,y:ground}];
 for(const sx of SPAWN)plats.push({kind:'pad',x:sx-85,w:170,y:ground});
 const kinds=KINDS.map(k=>[r(),k]).sort((a,b)=>a[0]-b[0]).slice(0,cfg('platCount')).map(a=>a[1]);
 kinds.forEach((kind,i)=>{
  const w=kind==='spin'?240:kind==='bounce'?120:kind==='solid'?200:170;
  const cx=480+i*400+(r()-.5)*120,y=ground-(120+r()*150);
  plats.push({kind,x:cx-w/2,w,y,base:{x:cx-w/2,y},amp:kind==='vert'?60:130+r()*90,spd:.6+r()*.5,ph:r()*6.28,dir:r()<.5?-1:1,dx:0,dy:0,stand:0,gone:false,respawn:0,touched:false});
 });
 return plats;
}
export class Game{
 constructor(canvas,onUpdate,onEnd){this.c=canvas;this.ctx=canvas.getContext('2d');this.onUpdate=onUpdate;this.onEnd=onEnd;this.keys=new Set();this.mode='ready';this.images=new Map();this.frames=new Map();this.particles=[];this.projectiles=[];this.clock=180;this.t=0;this.shake=0;this.freeze=0;this.last=0;this.announce='';this.active=true;this.bg=null;this.fx=null;this.ground=558;this.stageOverride=null;this.items=[];this.spawnT=5;this.cam=0;this.demo=false;this.plats=[];
 roster.forEach(c=>this.img(c.image));for(const n of ['apple','bomb','anvil','spring'])this.img('img/items/'+n+'.png');for(const id of [0,3,8,11])this.frames.set(id,Array.from({length:8},(_,i)=>this.img('img/frames/'+id+'-'+i+'.png')));this.select(0,3);
 document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||e.target.tagName==='INPUT')return;let k=e.key.toLowerCase(),a=actionOf(k);if(a||k==='escape')e.preventDefault();if(k==='escape'||a==='pause'){this.pause();return}if(!a)return;if(!this.keys.has(a))this.press(a);this.keys.add(a)});document.addEventListener('keyup',e=>{const a=actionOf(e.key.toLowerCase());if(a)this.keys.delete(a)});window.addEventListener('blur',()=>{this.keys.clear();if(this.mode==='playing'||this.mode==='countdown')this.pause()});requestAnimationFrame(t=>this.loop(t));
 }
 img(src){if(this.images.has(src))return this.images.get(src);let i=new Image();i.src=src;this.images.set(src,i);return i}
 fighter(id,x,dir){return {id,x,y:this.ground,vx:0,vy:0,dir,health:cfg('health'),jumps:0,cd:0,specialCD:0,attack:0,attackType:'jab',hit:false,stun:0,inv:0,shield:false,shieldEnergy:1,dodge:0,grounded:true,walk:0,aiJump:0,trail:[],onPlat:null,float:cfg('floatTime'),grabCD:0,diveCD:0,diving:false}}
 applyStage(k){const s=environments[k];this.stage=k;this.bg=this.img(s.image);this.fx=new ArenaFx(s.effect,s.accent);this.ground=s.ground;this.plats=buildLayout(k,s.ground)}
 setStage(k){this.stageOverride=k;if(this.mode==='ready')this.select(this.a,this.b)}
 camTarget(){const f=this.f;const mid=f?(f[0].x+f[1].x)/2:(SPAWN[0]+SPAWN[1])/2;return Math.max(0,Math.min(WW-W,mid-W/2))}
 updateCam(dt){this.cam+=(this.camTarget()-this.cam)*Math.min(1,dt*cfg('camFollow'))}
 select(a,b){this.a=a;this.b=b;this.applyStage(this.stageOverride||stageKey(a));this.f=[this.fighter(a,SPAWN[0],1),this.fighter(b,SPAWN[1],-1)];this.projectiles=[];this.particles=[];this.items=[];this.clock=cfg('time');this.cam=this.camTarget();this.onUpdate(this.f,this.clock)}
 start(a=this.a,b=this.b){this.select(a,b);this.introFrom=[SPAWN[0]-700,SPAWN[1]+700];this.introTo=[SPAWN[0],SPAWN[1]];this.f.forEach((p,i)=>{p.x=this.introFrom[i];p.dir=i===0?1:-1;p.y=this.ground-150});this.introT=0;this.spawnT=5;this.mode='intro';this.announce='';this.keys.clear();if(!cfg('introOn'))this.stepIntro(99)}
 stepIntro(dt){
 const D=3.1,S=1.2;this.introT+=dt;const t=this.introT,k=Math.min(1,t/S),e=1-Math.pow(1-k,3);
 this.f.forEach((p,i)=>{const from=this.introFrom[i],to=this.introTo[i];
  p.x=from+(to-from)*e;p.dir=i===0?1:-1;
  p.y=this.ground-(k<1?110+Math.abs(Math.sin(t*Math.PI*1.6+i))*50:14+Math.sin(t*2.6+i)*4);
  p.grounded=false;p.vx=k<1?(to-from)*2.5:0;
 });
 if(t>=D){this.f.forEach((p,i)=>{p.x=this.introTo[i];p.y=this.ground;p.vx=0;p.vy=0;p.grounded=true;p.onPlat=null});this.mode='countdown';this.count=cfg('countdown');this.keys.clear()}
 this.onUpdate(this.f,this.clock,this.mode,this.count);
}
drawIntro(ctx){
 const t=this.introT;
 this.f.forEach((p,i)=>{const c=roster[p.id];
  const inA=Math.min(1,Math.max(0,(t-1.1)/.4)),outA=t>2.5?Math.max(0,1-(t-2.5)/.5):1,a=inA*outA;
  if(a<=0)return;
  const x=p.x,y=this.ground-200+(1-a)*14;
  ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';ctx.shadowColor='#000d';ctx.shadowBlur=10;
  ctx.fillStyle='#fff';ctx.font='700 30px system-ui, sans-serif';ctx.fillText(c.name,x,y);
  ctx.fillStyle='#f3dca0';ctx.font='500 16px system-ui, sans-serif';ctx.fillText(c.years+' · '+c.source.split(';')[0],x,y+26);
  ctx.restore();
 });
}
pause(){if(this.mode==='playing'||this.mode==='countdown'){this.beforePause=this.mode;this.mode='paused';this.keys.clear()}else if(this.mode==='paused')this.mode=this.beforePause||'playing';this.onUpdate(this.f,this.clock,this.mode,this.count)}
 press(k){if(this.mode!=='playing'||this.demo)return;const p=this.f[0];if(k==='combo')this.startCombo(p);if(k==='up')this.jump(p);if(k==='attack')this.attack(p,this.keys.has('up')?'upper':this.keys.has('down')?'sweep':'jab');if(k==='special')this.special(p);if(k==='grab')this.grab(p);if(k==='dive')this.dive(p);if(k==='dodge'&&p.dodge<=0){p.dodge=cfg('dodgeTime');p.inv=cfg('dodgeInv');p.vx=p.dir*cfg('dodgeSpeed');this.burst(p.x,p.y-45,'#89cee1',8)}}
 jump(p){if(p.stun>0||p.jumps>=cfg('maxJumps'))return;p.vy=-(p.jumps===0?cfg('jump1'):cfg('jump2'));p.jumps++;p.grounded=false;p.onPlat=null;this.burst(p.x,p.y,'#eee0c1',8)}
 attack(p,type='jab'){if(this.canHug(p)){this.startHug(p);return}if(p.cd>0||p.stun>0||p.shield)return;p.attack=.32;p.cd=.39;p.attackType=type;p.hit=false;p.swingId=(p.swingId||0)+1;}
 startCombo(p){if(p.combo||p.hug||p.stun>0||p.shield||this.mode!=='playing')return;const alt=(p.comboN=(p.comboN||0)+1)%2===0,c=comboFor(p.id,alt);p.combo={c,t:0,done:c.strikes.map(()=>false)};p.attack=0;p.hit=false;this.announce=c.name.toUpperCase();this.announceTime=1.3}
 canHug(p){const q=this.f.find(v=>v!==p);return cfg('hugEnabled')&&this.mode==='playing'&&!p.hug&&!q.hug&&p.stun<=0&&!p.shield&&q.health>0&&q.health<=cfg('hugBelow')&&Math.abs(q.x-p.x)<200&&Math.abs(q.y-p.y)<100}
 startHug(p){p.hug={t:0,hit:false,last:-1};p.attack=0;p.combo=null;p.cd=.6;p.hit=false;this.announce='GIVE EM A HUG!!!';this.announceTime=1.6;this.burst(p.x,p.y-80,'#ff7aa2',18)}
 stepHug(p,dt){const q=this.f.find(v=>v!==p),h=p.hug;h.t+=dt;const tx=q.x-p.dir*46;p.x+=(tx-p.x)*Math.min(1,dt*10);p.y+=(q.y-p.y)*Math.min(1,dt*10);p.vx=0;p.vy=0;p.grounded=false;p.onPlat=null;p.dir=q.x>=p.x?1:-1;
  const k=Math.floor(h.t*9);if(k!==h.last){h.last=k;this.burst((p.x+q.x)/2,Math.min(p.y,q.y)-95,'#ff7aa2',3)}
  if(!h.hit&&h.t>=.45){h.hit=true;q.shield=false;q.inv=0;q.stun=0;this.hit(p,q,q.health,p.dir,true);this.announce='GIVE EM A HUG!!!';this.announceTime=1.6}
  if(h.t>=1.0)p.hug=null}
 grab(p){if(p.grabCD>0||p.stun>0||p.shield||p.hug||p.diving)return;p.grabCD=.9;p.swingId=(p.swingId||0)+1;p.attack=.36;p.attackType='grab';p.hit=false;p.vx+=p.dir*160;this.burst(p.x+p.dir*50,p.y-60,'#fff5d9',6)}
 dive(p){if(p.grounded||p.diveCD>0||p.stun>0||p.shield||p.hug||p.diving)return;p.diving=true;p.diveCD=1.2;p.vy=Math.max(p.vy,650);p.float=0;this.burst(p.x,p.y-30,'#89cee1',8)}
 shockwave(p){const m0=mkMoves(roster[p.id]).d,dv=DIVE_VARIANTS[resolveDive(roster[p.id])],m={r:m0.r*dv.rMul,dmg:Math.round(m0.dmg*dv.dmgMul)};this.shake=Math.max(this.shake,12);this.burst(p.x,p.y,'#eac586',30);for(const q of this.f){if(q===p||this.mode!=='playing')continue;if(Math.abs(q.x-p.x)<m.r&&Math.abs(q.y-p.y)<120)this.hit(p,q,m.dmg,q.x>=p.x?1:-1,true)}}
 special(p){if(p.specialCD>0||p.stun>0||p.shield)return;p.specialCD=1.25;p.swingId=(p.swingId||0)+1;p.attack=.43;p.attackType='special';p.hit=false;let c=roster[p.id],kind=resolveSpecial(c);p.specialKind=kind;if(kind==='leap'){p.vy=-140;this.burst(p.x+p.dir*65,p.y-30,'#eac586',24)}else if(kind==='dash'){p.vx=p.dir*750;p.vy=-430;p.inv=.35;p.jumps=Math.min(1,p.jumps)}else{this.projectiles.push({x:p.x+p.dir*45,y:p.y-60,vx:p.dir*(c.shape==='rabbit'?790:650),life:1.35,owner:p,r:13});this.burst(p.x+p.dir*50,p.y-60,'#eac586',8)}}
 burst(x,y,color,n=12){n=Math.round(n*cfg('particles'));for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=70+Math.random()*270;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-50,life:.25+Math.random()*.4,max:.65,size:2+Math.random()*5,color})}}
 hit(att,def,power,dir,upper=false){if(def.inv>0)return;def.diving=false;if(def.shield&&def.shieldEnergy>.05){def.shieldEnergy=Math.max(0,def.shieldEnergy-cfg('shieldDrain'));def.vx+=dir*cfg('shieldPush');this.burst(def.x,def.y-50,'#89cee1',12);return}def.health=Math.max(0,def.health-power);const taken=cfg('health')-def.health;const weight=cfg('weight_'+roster[def.id].shape),kb=cfg('knockback');def.vx=dir*(210+taken*5.8+power*8)*kb/weight;def.vy=-(250+taken*2.2+(upper?cfg('upperLift'):0))*kb/weight;def.stun=cfg('hitStun')+taken*cfg('hitStunPct');def.inv=.15;def.grounded=false;def.onPlat=null;this.shake=7+power*.3;this.freeze=cfg('hitFreeze');this.burst(def.x,def.y-60,'#fff1c7',20);this.burst(def.x,def.y-60,att===this.f[0]?'#8dd8ee':'#ffac87',8);if(def.health<=0&&this.mode==='playing')this.koWin(this.f.indexOf(def)===0?1:0,def)}
 ko(p){const i=this.f.indexOf(p);this.shake=18;this.burst(Math.max(25,Math.min(WW-25,p.x)),Math.min(680,p.y),'#eac586',60);p.health=Math.max(0,p.health-cfg('koDamage'));if(p.health<=0){this.koWin(i===0?1:0,p);return}p.x=SPAWN[i];p.y=this.ground-260;p.vx=0;p.vy=0;p.inv=cfg('respawnInv');p.jumps=0;p.stun=0;p.onPlat=null;p.trail.length=0;this.announce='RE-INK!';this.announceTime=1}
 koWin(w,p){this.mode='ko';this.koWinner=w;this.koT=cfg('koDelay');this.announce='K.O.!';this.announceTime=1.6;this.shake=24;this.freeze=0;this.burst(Math.max(25,Math.min(WW-25,p.x)),Math.min(680,p.y-60),'#fff1c7',70)}
 end(w){this.mode='over';this.onEnd(this.f[w],w)}
 aiFor(p,q,dt){const dx=q.x-p.x;p.aiJump-=dt;p.aiUp=q.y<p.y-40;if(p.stun>0)return;p.dir=dx>=0?1:-1;const L=FL+60,R=FR-60;const unsafe=cfg('cpuEdge')&&(p.x<L||p.x>R);if(unsafe&&p.y>this.ground-40&&p.aiJump<=0){this.jump(p);p.aiJump=.28}if(unsafe)p.vx+=(p.x<WW/2?1:-1)*1800*dt;else if(Math.abs(dx)>cfg('cpuSpacing'))p.vx+=(p.dir*355*cfg('cpuSpeed')*sp(p)-p.vx)*Math.min(1,dt*9);else p.vx*=Math.pow(.015,dt);if(q.y<p.y-95&&p.aiJump<=0&&Math.abs(dx)<280){this.jump(p);p.aiJump=.65/cfg('cpuJump')}if(!p.combo&&Math.abs(dx)<200&&Math.abs(q.y-p.y)<100&&Math.random()<dt*.35*cfg('cpuCombo'))this.startCombo(p);if(Math.abs(dx)<125&&Math.abs(q.y-p.y)<100&&Math.random()<dt*3.8*cfg('cpuAttack'))this.attack(p,Math.random()<.25?'upper':'jab');if(Math.abs(dx)>170&&Math.abs(q.y-p.y)<70&&Math.random()<dt*.6*cfg('cpuSpecial'))this.special(p);if(Math.abs(dx)<130&&Math.abs(q.y-p.y)<100&&Math.random()<dt*.5*cfg('cpuAttack'))this.grab(p);if(!p.grounded&&q.y>p.y+60&&Math.abs(dx)<140&&Math.random()<dt*2)this.dive(p);if(q.swingId!==p.seenSwing){p.seenSwing=q.swingId;p.willBlock=Math.random()<.35}p.shield=cfg('cpuShield')&&!!p.willBlock&&q.attack>0&&Math.abs(dx)<140&&p.shieldEnergy>.4;}
 playerMove(dt){const a=this.f[0];a.shield=this.keys.has('shield')&&a.shieldEnergy>.04&&a.stun<=0;let move=(this.keys.has('right')?1:0)-(this.keys.has('left')?1:0);if(a.stun<=0&&a.dodge<.45){if(move&&!a.shield){a.dir=move;let speed=(roster[a.id].shape==='heavy'?285:roster[a.id].shape==='rabbit'?410:355)*sp(a);a.vx+=(move*speed-a.vx)*Math.min(1,dt*12)}else a.vx*=Math.pow(.0008,dt)}}
 stepPlats(dt){
 for(const p of this.plats){
  if(p.kind==='move'){const x0=p.x;p.x=p.base.x+Math.sin(this.t*p.spd*cfg('movePlatSpeed')+p.ph)*p.amp*cfg('movePlatAmp');p.dx=p.x-x0}
  else if(p.kind==='vert'){const y0=p.y;p.y=p.base.y+Math.sin(this.t*p.spd*cfg('movePlatSpeed')+p.ph)*p.amp*cfg('movePlatAmp');p.dy=p.y-y0}
  else if(p.kind==='crumble'){
   if(p.gone){p.respawn-=dt;if(p.respawn<=0){p.gone=false;p.stand=0}}
   else{p.stand=p.touched?p.stand+dt:Math.max(0,p.stand-dt*2);if(p.stand>cfg('crumbleTime')){p.gone=true;p.respawn=cfg('crumbleRespawn');p.stand=0}}
   p.touched=false;
  }
 }
 }
 step(dt){this.t+=dt;this.shake*=Math.pow(.001,dt);if(this.announceTime>0){this.announceTime-=dt;if(this.announceTime<=0)this.announce=''}this.particles=this.particles.filter(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=420*dt;return p.life>0});
 this.stepPlats(dt);this.updateCam(dt);
 if(this.mode==='intro'){this.stepIntro(dt);return}if(this.mode==='ko'){this.koT-=dt;if(this.koT<=0){this.end(this.koWinner);return}this.onUpdate(this.f,this.clock,this.mode);return}if(this.mode==='countdown'){this.count-=dt;if(this.count<=0){this.mode='playing';this.announce='ACTION!';this.announceTime=.8}this.onUpdate(this.f,this.clock,this.mode,this.count);return}if(this.mode!=='playing')return;if(this.freeze>0){this.freeze-=dt;return}this.clock-=dt;if(this.clock<=0){let [a,b]=this.f;this.end(a.health>=b.health?0:1);return}
 if(this.demo){this.aiFor(this.f[0],this.f[1],dt);this.aiFor(this.f[1],this.f[0],dt)}else{this.aiFor(this.f[1],this.f[0],dt);this.playerMove(dt)}
 for(const p of this.f){
  if(p.hug){this.stepHug(p,dt);continue}
  const carry=p.grounded?p.onPlat:null;
  if(carry&&!carry.gone){p.x+=carry.dx||0;p.y+=carry.dy||0}
  const oldY=p.y;p.cd-=dt;p.specialCD-=dt;p.grabCD-=dt;p.diveCD-=dt;p.attack=Math.max(0,p.attack-dt*cfg('attackSpeed'));p.stun=Math.max(0,p.stun-dt);p.inv=Math.max(0,p.inv-dt);p.dodge=Math.max(0,p.dodge-dt);p.shieldEnergy=Math.min(1,Math.max(0,p.shieldEnergy+(p.shield?-.35:cfg('shieldRegen'))*dt));if(p.shieldEnergy<=0)p.shield=false;p.walk+=Math.abs(p.vx)*dt*.035;
  const up=p===this.f[0]?this.keys.has('up'):p.aiUp;if(!p.grounded&&p.float>0&&p.vy>0&&up){p.float-=dt;p.vy=Math.min(cfg('terminalVel'),p.vy+cfg('gravity')*dt*cfg('floatGravity'))}else p.vy=Math.min(cfg('terminalVel'),p.vy+cfg('gravity')*dt);p.x+=p.vx*dt;p.y+=p.vy*dt;p.grounded=false;p.onPlat=null;if(p.stun>0)p.vx*=Math.pow(cfg('stunFriction'),dt);
  for(const f of this.plats){if(f.gone)continue;if(p.vy>=0&&oldY<=f.y+2&&p.y>=f.y&&p.x>f.x&&p.x<f.x+f.w){p.y=f.y;p.vy=0;p.jumps=0;p.grounded=true;p.onPlat=f;p.float=cfg('floatTime');if(f.kind==='crumble')f.touched=true;break}}
  if(p.grounded&&p.onPlat&&p.onPlat.kind==='bounce'){p.vy=-cfg('bounceBoost');p.grounded=false;p.onPlat=null;p.jumps=1;this.burst(p.x,p.y,'#b8f0a0',10)}
  if(p.grounded&&p.onPlat&&p.onPlat.kind==='spin')p.vx+=p.onPlat.dir*cfg('spinSpeed')*dt;
  if(p.diving&&p.grounded){p.diving=false;this.shockwave(p)}const EK=cfg('edgeKill');if(p.x<-EK||p.x>WW+EK||p.y>900||p.y<-700){this.ko(p);if(this.mode!=='playing')break}
  const q=this.f.find(v=>v!==p);let range=(roster[p.id].shape==='tall'?cfg('reachTall'):cfg('reachNormal'))+reachBonus(roster[p.id]);if(p.attackType==='special'&&p.specialKind==='leap')range=180;
  if(p.attack>.05&&p.attack<.25&&!p.hit&&p.attackType!=='grab'&&(p.attackType!=='special'||['leap','dash'].includes(p.specialKind))){if(Math.abs(q.x-p.x)<range&&Math.abs(q.y-p.y)<100&&(q.x-p.x)*p.dir>-20){p.hit=true;this.hit(p,q,p.attackType==='special'?cfg('specialDmg'):p.attackType==='upper'?cfg('upperDmg'):cfg('jabDmg'),p.dir,p.attackType==='upper')}}
  if(p.attack>.05&&p.attack<.25&&!p.hit&&p.attackType==='grab'){const m=mkMoves(roster[p.id]).g,gv=GRAB_VARIANTS[resolveGrab(roster[p.id])],gr=(roster[p.id].shape==='tall'?150:120)+reachBonus(roster[p.id]);if(Math.abs(q.x-p.x)<gr&&Math.abs(q.y-p.y)<100&&(q.x-p.x)*p.dir>-20){p.hit=true;this.hit(p,q,Math.round(m.dmg*gv.dmgMul),gv.up?p.dir:-p.dir,gv.up)}}
  if(p.combo){const cb=p.combo;if(p.stun>0){p.combo=null}else{cb.t+=dt;const q=this.f.find(v=>v!==p);cb.c.strikes.forEach((s,si)=>{if(!cb.done[si]&&cb.t>=s.at&&cb.t<s.at+s.dur+.05){const dx=(q.x-p.x)*p.dir;if(dx>-30&&dx<s.reach&&Math.abs(q.y-p.y)<100){cb.done[si]=true;this.hit(p,q,s.pow*cfg('comboDmgMul'),p.dir,s.up)}}});if(cb.t>=cb.c.dur)p.combo=null}}
  p.trail.unshift({x:p.x,y:p.y});if(p.trail.length>8)p.trail.length=8;
 }
 this.projectiles=this.projectiles.filter(b=>{b.life-=dt;b.x+=b.vx*dt;let q=this.f.find(p=>p!==b.owner);if(Math.abs(b.x-q.x)<39&&Math.abs(b.y-(q.y-55))<58){this.hit(b.owner,q,cfg('projDmg'),Math.sign(b.vx));b.life=0}return b.life>0});this.stepItems(dt);this.onUpdate(this.f,this.clock,this.mode)
 }
 spawnItem(){
 const kinds=['apple','bomb','anvil','spring'],wts=kinds.map(k=>cfg('w_'+k)),tot=wts.reduce((a,b)=>a+b,0);if(tot<=0)return;let rr=Math.random()*tot,kind=kinds[0];for(let i=0;i<kinds.length;i++){rr-=wts[i];if(rr<0){kind=kinds[i];break}}
 const h={apple:70,bomb:86,anvil:60,spring:56}[kind]*cfg('itemScale');
 const im=this.images.get('img/items/'+kind+'.png');
 const w=im&&im.naturalWidth?h*im.naturalWidth/im.naturalHeight:h;
 const it={kind,w,h,vx:0,vy:0,landed:false,plat:null,fuse:0,cool:0,squash:0,life:{apple:14,bomb:12,anvil:10,spring:9}[kind]};
 if(kind==='spring'){it.x=FL+100+Math.random()*(FR-FL-200);it.y=this.ground-h/2;it.landed=true}
 else{it.x=FL+60+Math.random()*(FR-FL-120);it.y=-h}
 this.items.push(it);
}
stepItems(dt){
 this.spawnT-=dt;
 if(this.spawnT<=0){this.spawnT=Math.max(.5,cfg('gapMin')+Math.random()*(cfg('gapMax')-cfg('gapMin')));if(this.items.length<cfg('itemMax'))this.spawnItem()}
 const plats=this.plats.filter(f=>!f.gone);
 this.items=this.items.filter(it=>{
  it.life-=dt;
  if(it.kind==='spring'){
   it.cool=Math.max(0,it.cool-dt);it.squash=Math.max(0,it.squash-dt);
   for(const p of this.f){if(it.cool<=0&&p.grounded&&Math.abs(p.x-it.x)<it.w*.45&&p.y>this.ground-6){p.vy=-cfg('springBoost');p.jumps=1;p.grounded=false;p.onPlat=null;it.cool=.4;it.squash=.18;this.burst(it.x,it.y-it.h/2,'#ffe27a',14)}}
   return it.life>0;
  }
  const oldY=it.y;
  if(it.landed&&it.plat){if(it.plat.gone){it.landed=false;it.plat=null;it.vy=0}else{it.x+=it.plat.dx||0;it.y=it.plat.y-it.h/2}}
  if(!it.landed){
   it.vy+=cfg('anvilGravity')*dt;it.y+=it.vy*dt;
   const ob=oldY+it.h/2,nb=it.y+it.h/2;
   for(const f of plats){if(it.vy>=0&&ob<=f.y+2&&nb>=f.y&&it.x>f.x&&it.x<f.x+f.w){it.y=f.y-it.h/2;it.vy=0;it.landed=true;it.plat=f;it.fuse=cfg('bombFuse');if(it.kind==='anvil')it.life=Math.min(it.life,1.2);break}}
  }
  if(it.kind==='bomb'&&it.landed){it.fuse-=dt;if(it.fuse<=0){this.explode(it);return false}}
  if(it.life<=0)return false;
  for(const p of this.f){
   if(this.mode!=='playing')break;
   if(Math.abs(p.x-it.x)>it.w/2+36||it.y<p.y-140||it.y>p.y+12)continue;
   if(it.kind==='apple'){p.health=Math.min(cfg('health'),p.health+cfg('heal'));this.burst(it.x,it.y,'#7bd36a',18);return false}
   if(it.kind==='bomb'&&it.landed){it.fuse=Math.min(it.fuse,.3);continue}
   if(it.kind==='anvil'&&!it.landed){this.hit(this.f[0],p,cfg('anvilDmg'),p.x>=it.x?1:-1,false);this.burst(it.x,it.y,'#8a8f94',24);return false}
  }
  return true;
 });
}
explode(it){
 this.burst(it.x,it.y,'#ffb347',60);this.burst(it.x,it.y,'#fff1c7',30);this.shake=16;
 for(const p of this.f){if(this.mode!=='playing')break;const dx=p.x-it.x,dy=p.y-60-it.y;if(Math.hypot(dx,dy)<cfg('bombRadius'))this.hit(this.f[0],p,cfg('bombDmg'),dx>=0?1:-1,true)}
}
drawItems(ctx){
 for(const it of this.items){
  const im=this.images.get('img/items/'+it.kind+'.png');
  if(!im||!im.complete||!im.naturalWidth)continue;
  ctx.save();
  ctx.globalAlpha=Math.min(1,it.life);
  ctx.translate(it.x,it.y);
  if(it.kind==='spring')ctx.scale(1,1-it.squash*2.2);
  if(it.kind==='bomb'&&it.landed&&it.fuse<1&&Math.floor(this.t*12)%2===0){ctx.shadowColor='#ff5a2a';ctx.shadowBlur=24}
  ctx.drawImage(im,-it.w/2,-it.h/2,it.w,it.h);
  ctx.restore();
 }
}
drawBg(ctx){
 if(!(this.bg&&this.bg.complete&&this.bg.naturalWidth)){ctx.fillStyle='#253440';ctx.fillRect(0,0,W,H);return}
 const ih=740,iw=ih*this.bg.naturalWidth/this.bg.naturalHeight,u=this.cam,n=Math.floor(u/iw),off=u-n*iw,sw=Math.sin(this.t*.2)*10;
 for(let j=-1;j<=Math.ceil(W/iw)+1;j++){
  const x=-off+j*iw+sw,m=j+n;
  ctx.save();
  if(((m%2)+2)%2===1){ctx.translate(x+iw,0);ctx.scale(-1,1);ctx.drawImage(this.bg,0,-10,iw,ih)}
  else ctx.drawImage(this.bg,x,-10,iw,ih);
  ctx.restore();
 }
}
drawEdges(ctx){if(!cfg('platEdgeWarn'))return;
 // red warning glow where a fighter can step off the stage
 const pulse=.55+.3*Math.sin(this.t*6);
 const ledge=(x,y,dir)=>{ctx.save();ctx.globalAlpha=pulse;const g=ctx.createLinearGradient(0,y,0,y+46);g.addColorStop(0,'#ff3b3b');g.addColorStop(1,'rgba(255,59,59,0)');ctx.fillStyle=g;ctx.fillRect(dir>0?x-6:x-2,y,8,46);ctx.restore()};
 ledge(FL,this.ground,1);ledge(FR,this.ground,-1);
 for(const p of this.plats){if(p.gone||p.kind==='floor'||p.kind==='pad')continue;
  ledge(p.x,p.y-2,1);ledge(p.x+p.w,p.y-2,-1)}
}
 drawPlats(ctx){
 const acc=this.fx?this.fx.accent:'#e8c79d',t=this.t;
 ctx.save();ctx.strokeStyle='#eac58644';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(FL,this.ground+2);ctx.lineTo(FR,this.ground+2);ctx.stroke();ctx.restore();this.drawEdges(ctx);
 for(const p of this.plats){
  if(p.gone||p.kind==='floor'||(p.kind==='pad'&&!cfg('spawnPads')))continue;
  ctx.save();
  if(p.kind==='pad'){
   ctx.globalAlpha=.3;ctx.fillStyle=acc;ctx.beginPath();ctx.ellipse(p.x+p.w/2,p.y+3,p.w/2+10,12,0,0,7);ctx.fill();
   ctx.globalAlpha=1;ctx.fillStyle='#2b2a25';ctx.fillRect(p.x,p.y-8,p.w,10);ctx.fillStyle=acc;ctx.fillRect(p.x+8,p.y-8,p.w-16,3);
  }else if(p.kind==='move'||p.kind==='vert'){
   ctx.shadowColor=acc;ctx.shadowBlur=10;ctx.fillStyle='#3a4650';ctx.fillRect(p.x,p.y,p.w,14);ctx.shadowBlur=0;ctx.fillStyle=acc;ctx.fillRect(p.x,p.y,p.w,3);
   for(let i=0;i<6;i++){ctx.fillStyle=Math.floor(t*4+i)%2?acc:'#222';ctx.fillRect(p.x+12+i*(p.w-24)/5-2,p.y+7,4,4)}
  }else if(p.kind==='spin'){
   const cx=p.x+p.w/2;ctx.fillStyle='#4a3f5c';ctx.beginPath();ctx.ellipse(cx,p.y,p.w/2,11,0,0,7);ctx.fill();
   ctx.strokeStyle=acc;ctx.lineWidth=3;for(let k=0;k<4;k++){const a=t*2.4*p.dir+k*Math.PI/2;ctx.beginPath();ctx.moveTo(cx,p.y);ctx.lineTo(cx+Math.cos(a)*p.w/2*.9,p.y+Math.sin(a)*10);ctx.stroke()}
   ctx.fillStyle=acc;ctx.beginPath();ctx.arc(cx,p.y,5,0,7);ctx.fill();
  }else if(p.kind==='bounce'){
   const cx=p.x+p.w/2;ctx.fillStyle='#e9e0c0';ctx.fillRect(cx-9,p.y,18,8);
   ctx.fillStyle='#9fe08a';ctx.beginPath();ctx.ellipse(cx,p.y-2,p.w/2,10,0,Math.PI,0);ctx.fill();
   ctx.fillStyle='#ffffffaa';ctx.beginPath();ctx.arc(cx-p.w/4,p.y-8,4,0,7);ctx.arc(cx+p.w/5,p.y-10,3,0,7);ctx.fill();
  }else if(p.kind==='crumble'){
   const sh=p.stand>0?Math.sin(t*60)*p.stand*2:0;ctx.globalAlpha=Math.max(.35,1-Math.max(0,p.stand-.6)*1.5);
   ctx.fillStyle='#7a5b3a';ctx.fillRect(p.x+sh,p.y-10,p.w,12);ctx.fillStyle='#c09a64';ctx.fillRect(p.x+sh,p.y-10,p.w,3);
   ctx.strokeStyle='#2b1d10';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p.x+sh+p.w*.3,p.y-10);ctx.lineTo(p.x+sh+p.w*.38,p.y+2);ctx.lineTo(p.x+sh+p.w*.5,p.y-10);ctx.stroke();
  }else{
   ctx.shadowColor='#eac58666';ctx.shadowBlur=12;ctx.fillStyle='#302f28';ctx.fillRect(p.x,p.y-10,p.w,12);ctx.shadowBlur=0;ctx.fillStyle='#c8aa6c';ctx.fillRect(p.x,p.y-10,p.w,3);ctx.fillStyle='#716447';for(let i=6;i<p.w-6;i+=14)ctx.fillRect(p.x+i,p.y-4,7,3);
  }
  ctx.restore();
 }
}
hugZoom(){let z=1;for(const p of this.f){const h=p.hug;if(!h)continue;const w=Math.max(0,Math.min(1,h.t/.25,(1-h.t)/.25));z=Math.max(z,1+.6*w*w*(3-2*w))}return z}
draw(){const ctx=this.ctx;ctx.clearRect(0,0,W,H);ctx.save();const sk=this.shake*cfg('shakeMul');if(this.shake>.2)ctx.translate((Math.random()-.5)*sk,(Math.random()-.5)*sk);const hz=this.hugZoom();if(hz>1){const [a,b]=this.f,hx=(a.x+b.x)/2-this.cam,hy=(a.y+b.y)/2-70;ctx.translate(W/2,H/2);ctx.scale(hz,hz);ctx.translate(-hx,-hy)}this.drawBg(ctx);const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#07142112');g.addColorStop(.65,'#07142100');g.addColorStop(1,'#08121de6');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 if(this.fx)this.fx.draw(ctx,this.t);
 ctx.save();ctx.translate(-Math.round(this.cam),0);
 this.drawPlats(ctx);this.drawItems(ctx);for(const p of this.f)this.drawFighter(p);if(this.mode==='intro')this.drawIntro(ctx);
 for(const b of this.projectiles){ctx.save();ctx.shadowColor='#ffd18a';ctx.shadowBlur=25;ctx.fillStyle='#fff0c5';ctx.translate(b.x,b.y);ctx.rotate(this.t*15);ctx.beginPath();for(let i=0;i<8;i++){let a=i*Math.PI/4,r=i%2?7:18;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.restore()}
 for(const p of this.particles){ctx.globalAlpha=Math.min(1,p.life/.2);ctx.fillStyle=p.color;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.life*12);ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size);ctx.restore()}
 ctx.globalAlpha=1;ctx.restore();ctx.restore();}
 drawFighter(p){
 const ctx=this.ctx,i=this.f.indexOf(p),color=i===0?'#8dd8ee':'#f0a18a';
 const height=(roster[p.id].shape==='heavy'?169:151)*cfg('fighterScale')*cfg('size_'+roster[p.id].shape),width=height*256/288;
 const pose=p.combo?p.combo.c.pose(p.combo.t):null;
 if(p.hug&&p.hug.t>.15){const q=this.f.find(v=>v!==p),a=Math.min(1,(p.hug.t-.15)*5),mx=(p.x+q.x)/2,my=Math.min(p.y,q.y)-70;ctx.save();ctx.globalAlpha=a;ctx.strokeStyle='#ff7aa2';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(p.x,p.y-80);ctx.quadraticCurveTo(mx,my-40,q.x,q.y-80);ctx.stroke();ctx.restore()}
 let frame=0;const frames=this.frames.get(p.id);
 if(p.stun>0)frame=7;else if(p.attack>0)frame=p.attack>.24?4:p.attackType==='special'||p.attackType==='sweep'?6:5;else if(!p.grounded)frame=3;else if(Math.abs(p.vx)>45)frame=1+Math.floor(p.walk)%2;
 if(pose)frame=p.combo.t<.9?0:2;
 const im=frames?frames[frame]:this.images.get(roster[p.id].image);const ok=im&&im.complete&&im.naturalWidth;
 // idle motion never stops: breathing, sway and a ghostly rolling bob
 const moving=Math.min(1,Math.abs(p.vx)/300),breath=Math.sin(this.t*2.2+i*1.1)*cfg('idleMotion'),sway=Math.sin(this.t*1.7+i*2.3)*cfg('idleMotion');
 const bob=Math.sin(this.t*2.6+i*2.1)*6*(1-moving*.5)*cfg('idleMotion'),fy=p.y-6+bob;
 ctx.save();ctx.globalAlpha=.35;ctx.fillStyle='#0008';ctx.beginPath();ctx.ellipse(p.x,p.y+4,Math.max(12,40-(this.ground-p.y)*.03),6,0,0,7);ctx.fill();ctx.restore();
 if(cfg('afterimages')&&ok&&p.trail.length>2&&Math.hypot(p.vx,p.vy)>300){for(let k=2;k<p.trail.length;k+=2){const tp=p.trail[k];ctx.save();ctx.globalAlpha=.2*(1-k/p.trail.length);ctx.translate(tp.x,tp.y-6);ctx.scale(p.dir*(FACES_LEFT.has(p.id)?-1:1),1);ctx.drawImage(im,-width/2,-height,width,height);ctx.restore()}}
 ctx.save();
 if(p.inv>0&&Math.floor(this.t*15)%2===0)ctx.globalAlpha=.8;
 ctx.translate(p.x,fy);
 ctx.save();ctx.globalAlpha*=.32;const g=ctx.createLinearGradient(0,-10,0,52);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-width*.22,-10);
 for(let k=0;k<=6;k++){const x=-width*.22+k*width*.44/6;ctx.lineTo(x,30+(k%2?10:0)+Math.sin(this.t*7+k+i*2)*4)}
 ctx.lineTo(width*.22,-10);ctx.closePath();ctx.fill();ctx.restore();
 ctx.scale(p.dir*(FACES_LEFT.has(p.id)?-1:1),1);
 let sx=1+breath*.025,sy=1-breath*.025,angle=sway*.035+Math.max(-.16,Math.min(.16,p.vx*p.dir*.0007));
 if(p.stun>0)angle=-.25;else if(p.attack>0){angle=p.attack>.24?-.15:.24;sx*=1.14;sy*=.94}else if(!p.grounded){sx*=.97;sy*=1.04}
 if(pose){ctx.translate(pose.dx,pose.dy);angle+=pose.rot;sx*=pose.sx;sy*=pose.sy}
 if(p.hug){const k=Math.min(1,p.hug.t*4);sx*=1+.1*k;sy*=1-.06*k}
 ctx.rotate(angle);ctx.scale(sx,sy);
 if(ok)drawWavy(ctx,im,width,height,this.t,i,pose?0:2.2+moving*2);
 if(p.attack>0&&p.attack<.25){ctx.strokeStyle=p.attackType==='special'?'#f8d799':'#fff5d9';ctx.lineWidth=6;ctx.globalAlpha=p.attack/.25;ctx.beginPath();ctx.ellipse(34,-75,65*cfg('swingSize'),45*cfg('swingSize'),-.3,-1.2,1.1);ctx.stroke();ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(34,-75,78*cfg('swingSize'),53*cfg('swingSize'),-.3,-1,.9);ctx.stroke();ctx.globalAlpha=1}
 ctx.restore();
 if(p.shield){ctx.save();ctx.strokeStyle=color;ctx.lineWidth=3;ctx.shadowColor=color;ctx.shadowBlur=18;ctx.fillStyle=i===0?'#89cee122':'#f0a18a22';ctx.beginPath();ctx.arc(p.x,fy-65,68*(.8+.2*p.shieldEnergy),0,7);ctx.fill();ctx.stroke();ctx.restore()}
 ctx.save();ctx.fillStyle=color;ctx.font='bold 12px sans-serif';ctx.textAlign='center';if(cfg('nameTags'))ctx.fillText(i===0?'▼ P1':'▼ CPU',p.x,fy-height-11);ctx.restore();
 }
 loop(t){if(!this.active)return;let dt=Math.min((t-(this.last||t))/1000,.034);this.last=t;if(!document.hidden){this.step(dt);this.draw()}requestAnimationFrame(t=>this.loop(t))}
}
