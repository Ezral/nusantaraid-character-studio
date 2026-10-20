import Targa from './vendor/Targa.js';
const $=id=>document.getElementById(id);
let scene='none',aura=false,texture=null,ring=null,frame=null,timer=null;
let refresh=()=>{};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
export function initDisplay(draw){
 refresh=draw;
 try{const saved=JSON.parse(localStorage.getItem('nusantara-display'));scene=['prontera','glast_01'].includes(saved?.scene)?saved.scene:'none';aura=!!saved?.aura;}catch{}
 $('background').value=scene;$('aura').checked=aura;
 $('background').onchange=()=>{scene=$('background').value;applyScene();save();};
 $('aura').onchange=()=>{aura=$('aura').checked;applyAura();save();refresh();};

 applyScene();applyAura();
}
function save(){try{localStorage.setItem('nusantara-display',JSON.stringify({scene,aura}));}catch{}}
function applyScene(){frame?.remove();frame=null;$('display-status').textContent='';$('stage').classList.toggle('has-scene',scene!=='none');if(scene==='none')return;
 const im=new Image();frame=im;im.className='map-scene';im.alt=scene==='prontera'?'Prontera town scene':'Glast Heim ruins scene';im.onload=()=>{if(frame===im)$('display-status').textContent='';};im.onerror=()=>{if(frame===im)$('display-status').textContent='Background unavailable. Please retry.';};im.src='backgrounds/'+scene+'.png';$('stage').prepend(im);
}
async function applyAura(){if(!aura||texture)return;try{const im=new Image();im.crossOrigin='anonymous';im.src='https://grf.robrowser.com/data/texture/effect/pikapika2.bmp';await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);const data=ctx.getImageData(0,0,c.width,c.height);for(let i=0;i<data.data.length;i+=4){const r=data.data[i],g=data.data[i+1],b=data.data[i+2];const alpha=r>220&&b>220&&g<70?0:Math.max(r,g,b);data.data[i]=100;data.data[i+1]=205;data.data[i+2]=255;data.data[i+3]=alpha;}ctx.putImageData(data,0,0);texture=c;const response=await fetch('https://grf.robrowser.com/data/texture/effect/ring_blue.tga',{signal:AbortSignal.timeout(15000)});if(response.ok){const tga=new Targa();tga.load(new Uint8Array(await response.arrayBuffer()));ring=tga.getCanvas();}refresh();}catch{$('display-status').textContent='Aura texture unavailable. Turn aura off and on to retry.';}}
export function drawAura(ctx,x,y,scale){if(!aura||!texture)return;const t=reduced.matches?0:performance.now()/1000;ctx.save();ctx.translate(x,y);ctx.scale(scale,scale*.42);ctx.globalAlpha=.8;ctx.rotate(t*.45);ctx.drawImage(texture,-25,-25,50,50);ctx.rotate(-t*.8);ctx.globalAlpha=.45;ctx.drawImage(texture,-30,-30,60,60);ctx.restore();if(ring){ctx.save();ctx.globalAlpha=.65;for(let band=0;band<2;band++){for(let i=0;i<24;i++){const a=t*(1+band*.3)+i/24*Math.PI*1.75,b=a+Math.PI*1.75/24;const radius=(19+band*3)*scale;const ax=x+Math.cos(a)*radius,ay=y+Math.sin(a)*radius*.38-Math.sin(i/24*Math.PI)*12*scale;const bx=x+Math.cos(b)*radius,by=y+Math.sin(b)*radius*.38-Math.sin((i+1)/24*Math.PI)*12*scale;ctx.save();ctx.translate(ax,ay);ctx.rotate(Math.atan2(by-ay,bx-ax));ctx.drawImage(ring,i/24*ring.width,0,ring.width/24,ring.height,0,-1.5*scale,Math.hypot(bx-ax,by-ay)+1,3*scale);ctx.restore();}}ctx.restore();}ctx.save();ctx.fillStyle='#c2f2ff';ctx.shadowColor='#63d8ff';ctx.shadowBlur=9*scale;for(let i=0;i<7;i++){const p=(t*.23+i/7)%1,angle=i*2.4+t*.6;const sx=x+Math.cos(angle)*(14+5*p)*scale,sy=y-p*40*scale;ctx.globalAlpha=Math.sin(p*Math.PI)*.75;ctx.beginPath();ctx.moveTo(sx,sy-2.1*scale);ctx.lineTo(sx+scale,sy);ctx.lineTo(sx,sy+2.1*scale);ctx.lineTo(sx-scale,sy);ctx.fill();}ctx.restore();}
export function auraActive(){return aura&&!!texture&&!reduced.matches;}
export function resetDisplay(){scene='none';aura=false;$('background').value=scene;$('aura').checked=false;applyScene();save();}
