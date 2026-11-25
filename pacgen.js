// Pac maze layouts shared with the 2D Pac (same generator, copied from game.js).
import { rngOf } from './mzgen.js';
export function pcGen(i){
  const w=Math.floor(i/10),k=i%10,R=rngOf(i*9973+3),d=i/99;
  const PGW=31,PGH=21;
  const W=PGW,H=PGH,cx=8,cy=10;const g=Array.from({length:H},()=>Array(W).fill('#'));
  const vis=Array.from({length:cy},()=>Array(cx).fill(false)),st=[[0,0]];vis[0][0]=true;g[1][1]=' ';
  const carve=(x,y)=>{g[y][x]=' ';g[y][W-1-x]=' ';};carve(1,1);
  while(st.length){const [x,y]=st[st.length-1],nb=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>{const nx=x+a,ny=y+b;return nx>=0&&ny>=0&&nx<cx&&ny<cy&&!vis[ny][nx];});
    if(!nb.length){st.pop();continue;}const [a,b]=nb[Math.floor(R()*nb.length)],nx=x+a,ny=y+b;vis[ny][nx]=true;carve(x*2+1+a,y*2+1+b);carve(nx*2+1,ny*2+1);st.push([nx,ny]);}
  const open=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&g[y][x]!=='#';
  const extra=Math.floor(25+R()*30+k*3);
  for(let n=0;n<extra;n++){const x=1+Math.floor(R()*(cx*2-1)),y=1+Math.floor(R()*(H-2));if(g[y][x]==='#'&&((x%2===0)!==(y%2===0))&&x<W-1)carve(x,y);}
  for(let pass=0;pass<3;pass++)for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(!open(x,y))continue;const ns=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>open(x+a,y+b));if(ns.length<=1){const cand=[[1,0],[-1,0],[0,1],[0,-1]].filter(([a,b])=>{const nx=x+a,ny=y+b;return nx>0&&ny>0&&nx<W-1&&ny<H-1&&g[ny][nx]==='#';});if(cand.length){const [a,b]=cand[Math.floor(R()*cand.length)];carve(x+a,y+b);}}}
  const hx=15,hy=10;for(let y=hy-1;y<=hy+1;y++)for(let x=hx-2;x<=hx+2;x++)g[y][x]=' ';
  const tunnel=k%2===0&&i>2;if(tunnel){g[hy][0]=' ';g[hy][W-1]=' ';g[hy][1]=' ';g[hy][W-2]=' ';}
  const pel=Array.from({length:H},()=>Array(W).fill(0));let total=0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(g[y][x]!=='#'&&!(Math.abs(x-hx)<=2&&Math.abs(y-hy)<=1)&&!(x===15&&y===H-2)){pel[y][x]=1;total++;}
  const pw=[];[[1,1],[W-2,1],[1,H-2],[W-2,H-2]].forEach(([x,y])=>{let best=null,bd=1e9;for(let yy=1;yy<H-1;yy++)for(let xx=1;xx<W-1;xx++)if(pel[yy][xx]===1){const dd=Math.abs(xx-x)+Math.abs(yy-y);if(dd<bd){bd=dd;best=[xx,yy];}}if(best&&pel[best[1]][best[0]]===1){pel[best[1]][best[0]]=2;pw.push(best);}});
  const dist=Array.from({length:H},()=>Array(W).fill(-1)),q=[[hx,hy]];dist[hy][hx]=0;
  for(let h=0;h<q.length;h++){const [x,y]=q[h];for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){let nx=x+a,ny=y+b;if(tunnel&&y===hy){if(nx<0)nx=W-1;if(nx>=W)nx=0;}if(open(nx,ny)&&dist[ny][nx]<0){dist[ny][nx]=dist[y][x]+1;q.push([nx,ny]);}}}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(g[y][x]!=='#'&&dist[y][x]<0){g[y][x]='#';if(pel[y][x]){pel[y][x]=0;total--;}}
  const ng=Math.min(5,2+Math.floor(i/22)+(k===9?1:0)),gh=[];
  for(let n=0;n<ng;n++)gh.push({v:Math.floor(R()*100),kind:n%4,delay:n*140+30});
  return {w,k,g,pel,total,pw,tunnel,hx,hy,dist,gh,sp:.085+d*.03,gsp:.07+d*.045,fright:Math.max(150,430-i*3),treat:i%5,sx:15,sy:H-2,W,H};
}
