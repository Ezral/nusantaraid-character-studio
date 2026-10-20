const $=id=>document.getElementById(id);
let theme='light',aura=false,opacity=100,effect=null,loading=null,refresh=()=>{};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
export function initDisplay(draw){
 refresh=draw;
 try{const saved=JSON.parse(localStorage.getItem('nusantara-display'));theme=saved?.theme==='dark'?'dark':'light';aura=!!saved?.aura;if(saved?.auraProfile==='game'&&Number.isFinite(saved?.opacity))opacity=Math.max(0,Math.min(100,saved.opacity));}catch{}
 $('background').value=theme;$('aura').checked=aura;syncOpacity();applyTheme();
 $('background').onchange=()=>{theme=$('background').value;applyTheme();save();};
 $('aura').onchange=()=>{aura=$('aura').checked;syncOpacity();if(aura)applyAura();else $('display-status').textContent='';save();refresh();};
 $('aura-opacity').oninput=()=>{opacity=Number($('aura-opacity').value);syncOpacity();save();refresh();};
 if(aura)applyAura();
}
function syncOpacity(){$('aura-opacity-control').hidden=!aura;$('aura-opacity').value=opacity;$('aura-opacity-value').value=opacity+'%';}
function save(){try{localStorage.setItem('nusantara-display',JSON.stringify({theme,aura,opacity,auraProfile:'game'}));}catch{}}
function applyTheme(){$('stage').classList.toggle('dark-background',theme==='dark');}
async function applyAura(){
 if(effect||loading)return;
 $('display-status').textContent='Loading RO aura…';
 loading=import('./aura/aura.js?v=20261020-aura10').then(m=>m.createAura()).then(value=>{effect=value;$('display-status').textContent='';refresh();}).catch(e=>{console.error(e);if(aura)$('display-status').textContent='RO aura unavailable. Turn it off and on to retry.';}).finally(()=>loading=null);
}
export function drawAura(ctx,x,y,scale){if(aura&&effect&&opacity>0){ctx.save();ctx.globalAlpha*=opacity/100;effect.draw(ctx,x,y,scale,!reduced.matches);ctx.restore();}}
export function auraActive(){return aura&&opacity>0&&!!effect&&!reduced.matches;}
export function resetDisplay(){theme='light';aura=false;opacity=100;syncOpacity();$('background').value=theme;$('aura').checked=false;$('display-status').textContent='';applyTheme();save();}
