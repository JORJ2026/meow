// Key bindings for every player action. The game stores held actions by id (left, up, attack...).
const DEF=[
 ['left','Walk left','a'],['right','Walk right','d'],['up','Jump (with Attack: uppercut)','w'],
 ['down','Low sweep (with Attack)','s'],['attack','Attack','j'],['special','Special','k'],
 ['combo','Signature combo','c'],['grab','Grab','g'],['dive','Dive','f'],['shield','Shield','l'],
 ['dodge','Dodge','shift'],['pause','Pause','escape']
];
// Built-in extra keys, used whenever no binding claims them.
const ALIAS={arrowleft:'left',arrowright:'right',arrowup:'up',' ':'up',arrowdown:'down'};
const KEY='inkbound-controls';
let B=Object.fromEntries(DEF.map(([a,,k])=>[a,k]));
try{const s=JSON.parse(localStorage.getItem(KEY)||'{}');for(const [a,k] of Object.entries(s))if(a in B&&typeof k==='string')B[a]=k}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(B))}catch(e){}}
export const ACTIONS=DEF.map(([id,label])=>({id,label}));
export const keyOf=a=>B[a];
export function actionOf(k){for(const a in B)if(B[a]===k)return a;return ALIAS[k]}
export function setKey(a,k){if(!(a in B))return;for(const x in B)if(B[x]===k&&x!==a)B[x]=B[a];B[a]=k;save()}
export function resetKeys(){B=Object.fromEntries(DEF.map(([a,,k])=>[a,k]));save()}
const NAMES={' ':'Space',shift:'Shift',escape:'Esc',arrowleft:'←',arrowright:'→',arrowup:'↑',arrowdown:'↓'};
export function keyLabel(k){return NAMES[k]||(k.length===1?k.toUpperCase():k[0].toUpperCase()+k.slice(1))}
