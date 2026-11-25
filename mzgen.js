// Maze layouts shared with the 2D maze (same generator, copied from game.js).
const TS=32;
export function rngOf(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function mzGen(i){
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
