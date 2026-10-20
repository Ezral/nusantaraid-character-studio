const $=id=>document.getElementById(id);
let theme='light',aura=false,effect=null,loading=null,refresh=()=>{};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
export function initDisplay(draw){
 refresh=draw;
 try{const saved=JSON.parse(localStorage.getItem('nusantara-display'));theme=saved?.theme==='dark'?'dark':'light';aura=!!saved?.aura;}catch{}
 $('background').value=theme;$('aura').checked=aura;applyTheme();
 $('background').onchange=()=>{theme=$('background').value;applyTheme();save();};
 $('aura').onchange=()=>{aura=$('aura').checked;if(aura)applyAura();else $('display-status').textContent='';save();refresh();};
 if(aura)applyAura();
}
function save(){try{localStorage.setItem('nusantara-display',JSON.stringify({theme,aura}));}catch{}}
function applyTheme(){$('stage').classList.toggle('dark-background',theme==='dark');}
async function applyAura(){
 if(effect||loading)return;
 $('display-status').textContent='Loading RO aura…';
 loading=import('./aura/aura.js').then(m=>m.createAura()).then(value=>{effect=value;$('display-status').textContent='';refresh();}).catch(e=>{console.error(e);if(aura)$('display-status').textContent='RO aura unavailable. Turn it off and on to retry.';}).finally(()=>loading=null);
}
export function drawAura(ctx,x,y,scale){if(aura&&effect)effect.draw(ctx,x,y,scale,!reduced.matches);}
export function auraActive(){return aura&&!!effect&&!reduced.matches;}
export function resetDisplay(){theme='light';aura=false;$('background').value=theme;$('aura').checked=false;$('display-status').textContent='';applyTheme();save();}
