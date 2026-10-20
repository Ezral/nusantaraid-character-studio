import {setMapScene} from './map-scene.js?v=20261020-ground21';
const $=id=>document.getElementById(id);
let theme='light',aura=false,opacity=50,size=100,effect=null,loading=null,refresh=()=>{};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
export function initDisplay(draw){
 refresh=draw;
 try{const saved=JSON.parse(localStorage.getItem('nusantara-display'));theme=['dark','prontera','glast_01'].includes(saved?.theme)?saved.theme:'light';aura=!!saved?.aura;if(saved?.auraProfile==='adjustable-v1'&&Number.isFinite(saved?.opacity))opacity=Math.max(0,Math.min(100,saved.opacity));if(saved?.auraProfile==='adjustable-v1'&&Number.isFinite(saved?.size))size=Math.max(25,Math.min(200,saved.size));}catch{}
 $('background').value=theme;$('aura').checked=aura;syncAuraControls();applyTheme();
 $('background').onchange=()=>{theme=$('background').value;applyTheme();save();};
 $('aura').onchange=()=>{aura=$('aura').checked;syncAuraControls();if(aura)applyAura();else $('display-status').textContent='';save();refresh();};
 $('aura-opacity').oninput=()=>{opacity=Number($('aura-opacity').value);syncAuraControls();save();refresh();};
 $('aura-size').oninput=()=>{size=Number($('aura-size').value);syncAuraControls();save();refresh();};
 if(aura)applyAura();
}
function syncAuraControls(){$('aura-opacity-control').hidden=!aura;$('aura-opacity').value=opacity;$('aura-opacity-value').value=opacity+'%';$('aura-size-control').hidden=!aura;$('aura-size').value=size;$('aura-size-value').value=size+'%';}
function save(){try{localStorage.setItem('nusantara-display',JSON.stringify({theme,aura,opacity,size,auraProfile:'adjustable-v1'}));}catch{}}
function applyTheme(){$('stage').classList.toggle('dark-background',theme==='dark');setMapScene(theme,refresh);}
async function applyAura(){
 if(effect||loading)return;
 $('display-status').textContent='Loading RO aura…';
 loading=import('./aura/aura.js?v=20261020-bow16').then(m=>m.createAura()).then(value=>{effect=value;$('display-status').textContent='';refresh();}).catch(e=>{console.error(e);if(aura)$('display-status').textContent='RO aura unavailable. Turn it off and on to retry.';}).finally(()=>loading=null);
}
export function drawAura(ctx,x,y,scale){if(aura&&effect&&opacity>0){ctx.save();ctx.globalAlpha*=opacity/100;ctx.translate(x,y);ctx.scale(size/100,size/100);effect.draw(ctx,0,0,scale,!reduced.matches);ctx.restore();}}
export function auraActive(){return aura&&opacity>0&&!!effect&&!reduced.matches;}
export function resetDisplay(){theme='light';aura=false;opacity=50;size=100;syncAuraControls();$('background').value=theme;$('aura').checked=false;$('display-status').textContent='';applyTheme();save();}

export function worldAuraSettings(){return {aura,opacity,size,animate:!reduced.matches};}
