import {SCHEMA,cfg,setCfg,resetCfg} from './settings.js';
const $=s=>document.querySelector(s);
const fmt=v=>String(+(+v).toFixed(2));
export function initSettings(hooks){
 const dlg=$('#settings'),body=$('#settingsBody'),syncs=[];
 for(const sec of [...new Set(SCHEMA.map(s=>s.section))]){
  const items=SCHEMA.filter(s=>s.section===sec),d=document.createElement('details');
  d.open=sec==='Match';
  const sum=document.createElement('summary');sum.textContent=sec+' · '+items.length;d.append(sum);
  for(const s of items){
   const row=document.createElement('label');row.className='set-row';
   const name=document.createElement('span');name.textContent=s.label;
   const input=document.createElement('input'),out=document.createElement('output');
   const show=()=>{out.textContent=s.bool?(cfg(s.key)?'On':'Off'):fmt(cfg(s.key))};
   const sync=()=>{if(s.bool)input.checked=cfg(s.key);else input.value=cfg(s.key);show()};
   if(s.bool){input.type='checkbox';input.onchange=()=>{setCfg(s.key,input.checked);show();hooks.change(s.key)}}
   else{input.type='range';input.min=s.min;input.max=s.max;input.step=s.step;input.oninput=()=>{setCfg(s.key,+input.value);show();hooks.change(s.key)}}
   sync();syncs.push(sync);
   row.append(name,input,out);d.append(row);
  }
  body.append(d);
 }
 $('#settingsCount').textContent=SCHEMA.length+' SETTINGS';
 $('#settingsBtn').onclick=()=>{hooks.open();dlg.showModal()};
 $('#closeSettings').onclick=()=>dlg.close();
 $('#resetSettings').onclick=()=>{resetCfg();syncs.forEach(f=>f());hooks.change('*')};
 dlg.addEventListener('close',()=>hooks.close());
}
