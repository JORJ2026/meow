import {cfg} from './settings.js';
// Per-fighter move loadout: which variant each slot uses. 'auto' keeps the fighter's own move.
export const SLOTS={
 special:{label:'Special',opts:{auto:'Auto',shot:'Shot',dash:'Dash',leap:'Leap'}},
 grab:{label:'Grab',opts:{auto:'Auto',throw:'Throw',pull:'Pull'}},
 dive:{label:'Dive',opts:{auto:'Auto',quake:'Quake',spike:'Spike'}}
};
export const SPECIAL_VARIANTS={
 shot:{name:'Shot',detail:'ranged projectile'},
 dash:{name:'Dash',detail:'lunges forward, briefly invulnerable'},
 leap:{name:'Leap',detail:'hops up, short melee slam'}
};
export const GRAB_VARIANTS={
 throw:{name:'Throw',detail:'launches the rival',dmgMul:1,up:true},
 pull:{name:'Pull',detail:'yanks the rival in',dmgMul:.8,up:false}
};
export const DIVE_VARIANTS={
 quake:{name:'Quake',detail:'wide shock, lighter hit',rMul:1.4,dmgMul:.7},
 spike:{name:'Spike',detail:'narrow blast, heavy hit',rMul:.6,dmgMul:1.6}
};
const KEY='inkbound-loadouts';
let L={};
try{L=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
export function loadoutFor(id){
 const v=L[id]||{},out={};
 for(const s of Object.keys(SLOTS))out[s]=SLOTS[s].opts[v[s]]?v[s]:'auto';
 return out;
}
export function setLoadout(id,slot,value){
 const cur=loadoutFor(id);cur[slot]=value;L[id]=cur;
 try{localStorage.setItem(KEY,JSON.stringify(L))}catch(e){}
}
// Which special behaviour a fighter uses right now (auto follows the fighter's shape).
export function resolveSpecial(c){
 const v=loadoutFor(c.id).special;
 if(v!=='auto')return v;
 return c.shape==='heavy'?'leap':c.shape==='ghost'?'dash':'shot';
}
export function resolveGrab(c){const v=loadoutFor(c.id).grab;return v==='auto'?'throw':v}
export function resolveDive(c){const v=loadoutFor(c.id).dive;return v==='auto'?'quake':v}
// Extra reach (px) for a bigger or smaller body.
export function reachBonus(c){return (cfg('size_'+c.shape)*cfg('fighterScale')-1)*60}
