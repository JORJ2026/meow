import {ACTIONS,keyOf,setKey,resetKeys,keyLabel} from './controls.js';
import {SCHEMA,cfg,setCfg} from './settings.js';
import {SLOTS,loadoutFor,setLoadout,resolveSpecial,resolveGrab,resolveDive,SPECIAL_VARIANTS,GRAB_VARIANTS,DIVE_VARIANTS} from './moveset.js';
import {roster} from './roster.js';
import {movesFor} from './game.js';

const $=s=>document.querySelector(s);
const fmt=v=>String(+(+v).toFixed(2));
const el=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e};
let onChange=()=>{},tab='controls',fighter=0,listening=null;

// Keep every [data-bind] key hint in the page in sync with the bindings.
export function paintKeys(){document.querySelectorAll('[data-bind]').forEach(e=>{e.textContent=keyLabel(keyOf(e.dataset.bind))})}

function changed(){paintKeys();onChange();render()}

function sliderRow(s){
 const row=el('label','set-row'),input=el('input'),out=el('output');
 const show=()=>{out.textContent=s.bool?(cfg(s.key)?'On':'Off'):fmt(cfg(s.key))};
 if(s.bool){input.type='checkbox';input.checked=cfg(s.key);input.onchange=()=>{setCfg(s.key,input.checked);show();changed()}}
 else{input.type='range';input.min=s.min;input.max=s.max;input.step=s.step;input.value=cfg(s.key);input.oninput=()=>{setCfg(s.key,+input.value);show();paintKeys();onChange()}}
 show();row.append(el('span','',s.label),input,out);return row;
}

function controlsTab(body){
 for(const a of ACTIONS.filter(a=>a.id!=='pause')){
  const row=el('div','set-row'),btn=el('button','outline key-bind',listening===a.id?'press a key…':keyLabel(keyOf(a.id)));
  btn.onclick=()=>{listening=a.id;render()};
  row.append(el('span','',a.label),btn);body.append(row);
 }
 const reset=el('button','outline','Reset keys');reset.onclick=()=>{resetKeys();listening=null;changed()};
 body.append(reset);
}

function sizesTab(body){
 SCHEMA.filter(s=>s.key==='fighterScale'||s.key.startsWith('size_')).forEach(s=>body.append(sliderRow(s)));
}

function movesTab(body){
 const sel=el('select');
 roster.forEach(c=>{const o=el('option','',c.name);o.value=c.id;sel.append(o)});
 sel.value=fighter;sel.onchange=()=>{fighter=+sel.value;render()};
 body.append(sel);
 const c=roster[fighter],lo=loadoutFor(c.id);
 for(const [slot,def] of Object.entries(SLOTS)){
  const row=el('div','set-row'),group=el('div','opt-row');
  for(const [v,label] of Object.entries(def.opts)){
   const b=el('button','outline',label);b.setAttribute('aria-pressed',String(lo[slot]===v));
   b.onclick=()=>{setLoadout(c.id,slot,v);changed()};group.append(b);
  }
  row.append(el('span','',def.label),group);body.append(row);
 }
 const base=movesFor(c),list=el('div','moves');
 const rows=[['Jab',base[0]],['Special',SPECIAL_VARIANTS[resolveSpecial(c)].name+' · '+SPECIAL_VARIANTS[resolveSpecial(c)].detail],['Grab',GRAB_VARIANTS[resolveGrab(c)].name+' · '+GRAB_VARIANTS[resolveGrab(c)].detail],['Dive',DIVE_VARIANTS[resolveDive(c)].name+' · '+DIVE_VARIANTS[resolveDive(c)].detail]];
 rows.forEach(([k,t])=>list.append(el('div','',k+' · '+t)));
 body.append(list);
}

function animTab(body){
 SCHEMA.filter(s=>s.section==='Animation'||s.key==='afterimages'||s.key==='idleMotion').forEach(s=>body.append(sliderRow(s)));
}

const TABS=[['controls','Controls',controlsTab],['sizes','Sizes',sizesTab],['moves','Moves',movesTab],['anim','Animation',animTab]];
function render(){
 const tabs=$('#setupTabs'),body=$('#setupBody');
 tabs.replaceChildren(...TABS.map(([id,label])=>{const b=el('button','outline',label);b.setAttribute('aria-pressed',String(tab===id));b.onclick=()=>{tab=id;listening=null;render()};return b}));
 body.replaceChildren();
 TABS.find(t=>t[0]===tab)[2](body);
}

// Rebinding: while a key button is waiting, the next key press becomes the binding.
window.addEventListener('keydown',e=>{
 if(!listening)return;
 e.preventDefault();e.stopPropagation();
 const k=e.key.toLowerCase();
 if(k!=='escape')setKey(listening,k);
 listening=null;changed();
},true);

export function initSetup(opts={}){
 onChange=opts.onChange||onChange;
 const dlg=$('#setup');
 $('#setupBtn').onclick=()=>{render();dlg.showModal()};
 $('#closeSetup').onclick=()=>dlg.close();
 dlg.addEventListener('close',()=>{listening=null});
 paintKeys();
}
