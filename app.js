import {initMobileControls} from './mobile-controls.js?v=20261020-mobile4';
import {initDisplay,drawAura,auraActive,resetDisplay} from './display.js?v=20261020-mobile4';
import Catalogue from './niktout-items.js';
const Hats=Catalogue.hats,Robes=Catalogue.robes,itemsById=new Map(Catalogue.items.map(item=>[item.id,item]));
import SPR from './vendor/Sprite.js';
import ACT from './vendor/Action.js';
import Jobs from './vendor/JobNameTable.js';
import Palettes from './vendor/PalNameTable.js';
import Hair from './vendor/HairIndexTable.js';
const $=id=>document.getElementById(id), endpoint='https://classicweb.niktoutro.com/client/';
const jobs=[[0,'Novice'],[1,'Swordsman'],[2,'Mage'],[3,'Archer'],[4,'Acolyte'],[5,'Merchant'],[6,'Thief'],[7,'Knight'],[8,'Priest'],[9,'Wizard'],[10,'Blacksmith'],[11,'Hunter'],[12,'Assassin'],[14,'Crusader'],[15,'Monk'],[16,'Sage'],[17,'Rogue'],[18,'Alchemist'],[19,'Bard'],[20,'Dancer'],[23,'Super Novice']];
const equipment=['upper','middle','lower','costumeUpper','costumeMiddle','costumeLower','garment'];
const fields=['gender','job','hair','hairColor','costumeColor',...equipment];
const initial={gender:1,job:3,hair:1,hairColor:0,costumeColor:0,...Object.fromEntries(equipment.map(k=>[k,0]))};let state={...initial},direction=0,zoom=4,current=null,revision=0;
try{const saved=JSON.parse(localStorage.getItem('nusantara-studio-items-v2')||'null');if(saved)for(const key of fields)if(Number.isInteger(saved[key]))state[key]=saved[key];}catch{}
const options=(id,rows)=>$(id).replaceChildren(...rows.map(([value,label])=>new Option(label,value)));
options('job',jobs);options('hair',Array.from({length:30},(_,i)=>[i+1,'Style '+String(i+1).padStart(2,'0')]));options('hairColor',Array.from({length:264},(_,i)=>[i,i?'Palette '+i:'Original color']));options('costumeColor',Array.from({length:700},(_,i)=>[i,i?'Palette '+i:'Original color']));

function choicesFor(key){const costume=key.startsWith('costume')||key==='garment';const slot=key==='garment'?'garment':key.replace('costume','').toLowerCase();return Catalogue.items.filter(item=>item.costume===costume&&item.slots.includes(slot));}
function populateEquipment(){for(const key of equipment){options(key,[[0,'None'],...choicesFor(key).map(item=>[item.id,item.name+' · #'+item.id])]);$(key).value=state[key];}}
function clearConflicts(key){const selected=itemsById.get(state[key]);if(!selected)return;for(const other of equipment){if(other===key)continue;const existing=itemsById.get(state[other]);if(existing&&existing.costume===selected.costume&&existing.slots.some(slot=>selected.slots.includes(slot)))state[other]=0;}}
populateEquipment();for(const key of equipment)if(!choicesFor(key).length)$(key).closest('label').hidden=true;

for(const key of fields){$(key).value=state[key];if($(key).selectedIndex<0)state[key]=initial[key],$(key).value=state[key];$(key).addEventListener('change',()=>{state[key]=Number($(key).value);if(equipment.includes(key))clearConflicts(key);if(key==='job'&&state.job===19)state.gender=1;if(key==='job'&&state.job===20)state.gender=0;if(key==='gender'&&state.job===19&&state.gender===0)state.job=20;if(key==='gender'&&state.job===20&&state.gender===1)state.job=19;sync();load();});}
function sync(){for(const key of fields)$(key).value=state[key];try{localStorage.setItem('nusantara-studio-items-v2',JSON.stringify(state));}catch{}document.dispatchEvent(new Event('studio-look-change'));}
const cache=new Map();async function file(path){if(!cache.has(path)){const promise=fetch((path.startsWith('data/palette/')?'https://classicweb.niktoutro.com/client/':endpoint)+path.split('/').map(encodeURIComponent).join('/'),{signal:AbortSignal.timeout(20000)}).then(async r=>{if(!r.ok)throw Error('Asset not available');const data=await r.arrayBuffer();if(data.byteLength<4||r.headers.get('content-type')?.includes('text/html'))throw Error('Asset not available');return data;}).catch(e=>{cache.delete(path);throw e;});cache.set(path,promise);}return cache.get(path);}
async function part(path){const [spr,act]=await Promise.all([file(path+'.spr'),file(path+'.act')]);return {spr:new SPR(spr),act:new ACT(act)};}
async function load(){const id=++revision;current=null;$('export').disabled=true;$('status').textContent='Loading your character…';draw();const look={...state};const sex=look.gender?'\xb3\xb2':'\xbf\xa9',head=Hair[look.gender][look.hair]||look.hair;const root='data/sprite/\xc0\xce\xb0\xa3\xc1\xb7/';try{const [body,hair]=await Promise.all([part(root+'\xb8\xf6\xc5\xeb/'+sex+'/'+Jobs[look.job]+'_'+sex),part(root+'\xb8\xd3\xb8\xae\xc5\xeb/'+sex+'/'+head+'_'+sex)]);const warnings=[];for(const [p,color,path,label] of [[body,look.costumeColor,'data/palette/\xb8\xf6/'+Palettes[look.job]+'_'+sex+'_'+look.costumeColor+'.pal','Costume'],[hair,look.hairColor,'data/palette/\xb8\xd3\xb8\xae/\xb8\xd3\xb8\xae'+head+'_'+sex+'_'+look.hairColor+'.pal','Hair']]){if(color){try{const data=await file(path);if(data.byteLength!==1024)throw Error('Invalid palette');p.palette=new Uint8Array(data);}catch{warnings.push(label+' palette '+color+' unavailable; showing original.');}}p.images=new Map();}
const hats=[],seen=new Set();
const selected=equipment.filter(key=>key!=='garment').map(key=>itemsById.get(look[key])).filter(Boolean);
const covered=new Set(selected.filter(item=>item.costume).flatMap(item=>item.slots));
const visible=selected.filter(item=>item.costume||!item.slots.some(slot=>covered.has(slot))).sort((a,b)=>Math.max(...a.slots.map(slot=>['middle','upper','lower'].indexOf(slot)))-Math.max(...b.slots.map(slot=>['middle','upper','lower'].indexOf(slot))));
for(const item of visible){const visual=item.view;if(seen.has(visual))continue;seen.add(visual);try{const p=await part('data/sprite/\xbe\xc7\xbc\xbc\xbb\xe7\xb8\xae/'+sex+'/'+sex+Hats[visual]);p.images=new Map();hats.push(p);}catch{warnings.push(item.name+' unavailable for this look.');}}
let robe=null;if(look.garment){const item=itemsById.get(look.garment),name=Robes[item.view],base='data/sprite/\xb7\xce\xba\xea/'+name+'/';try{try{robe=await part(base+sex+'/'+Jobs[look.job]+'_'+sex);}catch{robe=await part(base+name);}robe.images=new Map();}catch{warnings.push(item.name+' unavailable for this look.');}}
if(id!==revision)return;current={body,hair,hats,robe,look};$('look-name').textContent=jobs.find(j=>j[0]===look.job)[1]+' · '+(look.gender?'Male':'Female');$('status').textContent=warnings.join(' ');$('export').disabled=warnings.length>0;draw();}catch(e){if(id===revision){$('status').textContent='This look could not load. Try another style or check your connection.';current=null;draw();}}}
function frameImage(part,index){if(part.images.has(index))return part.images.get(index);const f=part.spr.frames[index];if(!f||!f.width||!f.height)return null;const c=document.createElement('canvas');c.width=f.width;c.height=f.height;const ctx=c.getContext('2d'),image=ctx.createImageData(f.width,f.height),pal=part.palette||part.spr.palette;for(let y=0;y<f.height;y++)for(let x=0;x<f.width;x++){const i=y*f.width+x,j=i*4;if(f.type===0){const n=f.data[i];image.data[j]=pal[n*4];image.data[j+1]=pal[n*4+1];image.data[j+2]=pal[n*4+2];image.data[j+3]=n?255:0;}else{const k=((f.height-1-y)*f.width+x)*4;image.data[j]=f.data[k+3];image.data[j+1]=f.data[k+2];image.data[j+2]=f.data[k+1];image.data[j+3]=f.data[k];}}ctx.putImageData(image,0,0);part.images.set(index,c);return c;}
function layers(){
 if(!current)return [];
 const anim=p=>p.act.actions[direction%p.act.actions.length]?.animations[0];
 const body=anim(current.body),hair=anim(current.hair);if(!body||!hair)return [];
 const anchor=body.pos[0]||{x:0,y:0};
 const attached=p=>{const a=anim(p);if(!a)return null;const h=a.pos[0];return [p,a,h?anchor.x-h.x:0,h?anchor.y-h.y:0];};
 const parts=[[current.body,body,0,0],attached(current.hair),...current.hats.map(attached)].filter(Boolean);
 if(current.robe){const a=anim(current.robe);if(a){const row=[current.robe,a,0,0];if(direction>2&&direction<6)parts.push(row);else parts.unshift(row);}}
 return parts.flatMap(([part,a,ox,oy])=>a.layers.filter(l=>l.index>=0).map(l=>({part,l,x:l.pos[0]+ox,y:l.pos[1]+oy})));
}
function render(ctx,scale,cx,cy){const list=layers();if(!list.length)return;let minY=Infinity,maxY=-Infinity,minX=Infinity,maxX=-Infinity;for(const row of list){const im=frameImage(row.part,row.l.index+(row.l.spr_type?row.part.spr.rgba_index:0));if(!im)continue;row.im=im;minY=Math.min(minY,row.y-im.height*Math.abs(row.l.scale[1])/2);maxY=Math.max(maxY,row.y+im.height*Math.abs(row.l.scale[1])/2);minX=Math.min(minX,row.x-im.width*Math.abs(row.l.scale[0])/2);maxX=Math.max(maxX,row.x+im.width*Math.abs(row.l.scale[0])/2);}
ctx.save();ctx.translate(cx,cy);ctx.scale(scale,scale);ctx.translate(-(minX+maxX)/2,-(minY+maxY)/2);drawAura(ctx,0,0,1);ctx.imageSmoothingEnabled=false;for(const {im,l,x,y} of list){if(!im)continue;ctx.save();ctx.translate(x,y);ctx.rotate(l.angle*Math.PI/180);ctx.scale(l.scale[0]*(l.is_mirror?-1:1),l.scale[1]);ctx.globalAlpha=l.color[3];ctx.drawImage(im,-im.width/2,-im.height/2);ctx.restore();}ctx.restore();}
function draw(){const c=$('character'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);render(ctx,zoom,400,295);$('direction').textContent=['South','Southwest','West','Northwest','North','Northeast','East','Southeast'][direction];$('zoom').value=zoom;$('zoom-label').value=zoom+'×';}
function rotate(delta){direction=(direction+delta+8)%8;draw();}
$('left').onclick=()=>rotate(-1);$('right').onclick=()=>rotate(1);let wheelAt=0;$('stage').addEventListener('wheel',e=>{e.preventDefault();if(Date.now()-wheelAt<110)return;wheelAt=Date.now();rotate(e.deltaY>0?1:-1);},{passive:false});$('stage').onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();rotate(e.key==='ArrowLeft'?-1:1);}};
const setZoom=z=>{zoom=Math.max(1,Math.min(8,z));draw();};$('zoom').oninput=e=>setZoom(Number(e.target.value));$('plus').onclick=()=>setZoom(zoom+.5);$('minus').onclick=()=>setZoom(zoom-.5);$('reset').onclick=()=>{resetDisplay();state={...initial};populateEquipment();direction=0;zoom=4;sync();load();};$('export').onclick=()=>{if(!current)return;const c=document.createElement('canvas');c.width=800;c.height=640;render(c.getContext('2d'),zoom,400,320);c.toBlob(blob=>{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='nusantara-look-'+state.job+'-'+state.hair+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});};sync();load();

initDisplay(draw);let lastAuraFrame=0;function animateAura(t){if(auraActive()&&t-lastAuraFrame>16&&!document.hidden){draw();lastAuraFrame=t;}requestAnimationFrame(animateAura);}requestAnimationFrame(animateAura);

let swipe=null;
$('stage').addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'||e.target.closest('button'))return;swipe={id:e.pointerId,x:e.clientX,y:e.clientY};});
$('stage').addEventListener('pointermove',e=>{if(!swipe||swipe.id!==e.pointerId)return;const dx=e.clientX-swipe.x,dy=e.clientY-swipe.y;if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>12){swipe=null;return;}if(Math.abs(dx)>=36){rotate(dx>0?1:-1);swipe.x=e.clientX;swipe.y=e.clientY;}});
for(const name of ['pointerup','pointercancel','pointerleave'])$('stage').addEventListener(name,()=>swipe=null);

initMobileControls();
