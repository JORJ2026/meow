import {roster} from './roster.js';
import {movesFor} from './game.js';
import {resolveSpecial,resolveGrab,resolveDive,SPECIAL_VARIANTS,GRAB_VARIANTS,DIVE_VARIANTS} from './moveset.js';
import {comboName} from './combos.js';
import {keyOf,keyLabel} from './controls.js';

const CONTROLS=[
 [['left','right'],'Walk (or ← →)'],
 [['up'],'Jump. Jump again in the air for a second jump. Hold to float.'],
 [['attack'],'Jab at close range'],
 [['up','attack'],'Uppercut'],
 [['down','attack'],'Low sweep'],
 [['special'],'Special (each fighter has its own, see the table)'],
 [['combo'],'Signature combo. Press again for the second combo.'],
 [['grab'],'Grab. Short-range throw; a long-arm fighter reaches further.'],
 [['dive'],'Dive. In the air, falls fast and shocks the ground on landing.'],
 [['shield'],'Shield. Drains while held.'],
 [['dodge'],'Dodge. Brief invulnerability.'],
 [['attack'],'Hug finisher: when a rival is at low health and close, attack gives them a hug and wins the round.'],
 [['pause'],'Pause'],
];

export function renderMoves(root){
 root.replaceChildren();
 const section=title=>{const s=document.createElement('section');s.className='move-sec';const h=document.createElement('h3');h.textContent=title;s.append(h);root.append(s);return s};
 const keys=section('Controls'),list=document.createElement('div');list.className='move-keys';keys.append(list);
 for(const [ks,action] of CONTROLS){
  const k=document.createElement('div');
  ks.forEach((t,i)=>{if(i)k.append(' + ');const kb=document.createElement('kbd');kb.textContent=keyLabel(keyOf(t));k.append(kb)});
  const a=document.createElement('span');a.textContent=action;
  list.append(k,a);
 }
 const fighters=section('Fighters · '+roster.length),table=document.createElement('div');table.className='move-table';fighters.append(table);
 for(const h of ['Fighter','Jab','Special','Grab','Dive','Combo','Second combo']){const d=document.createElement('div');d.className='hd';d.textContent=h;table.append(d)}
 const cell=(text,detail)=>{const d=document.createElement('div');d.textContent=text;if(detail){const s=document.createElement('small');s.textContent=detail;d.append(s)}return d};
 roster.forEach((c,id)=>{
  const m=movesFor(c),sv=SPECIAL_VARIANTS[resolveSpecial(c)],gv=GRAB_VARIANTS[resolveGrab(c)],dv=DIVE_VARIANTS[resolveDive(c)];
  const name=document.createElement('div');name.textContent=c.name;
  const jab=document.createElement('div');jab.textContent=m[0];
  const sp=cell(sv.name,sv.detail);
  const gName=gv.name,gDetail=gv.detail,dName=dv.name,dDetail=dv.detail;
  const c1=document.createElement('div');c1.textContent=comboName(id);
  const c2=document.createElement('div');c2.textContent=comboName(id,true);
  table.append(name,jab,sp,cell(gName,gDetail),cell(dName,dDetail),c1,c2);
 });
}
