import icons from './item-icons.js';
const cache=new Map();
async function loadIcon(name){
 if(!cache.has(name))cache.set(name,(async()=>{
  const path='data/texture/\xc0\xaf\xc0\xfa\xc0\xce\xc5\xcd\xc6\xe4\xc0\xcc\xbd\xba/item/'+name+'.bmp';
  const response=await fetch('https://classicweb.niktoutro.com/client/'+path.split('/').map(encodeURIComponent).join('/'),{signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw Error('Item icon unavailable');
  const bitmap=await createImageBitmap(await response.blob()),canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
  const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0);bitmap.close();
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);for(let i=0;i<pixels.data.length;i+=4)if(pixels.data[i]===255&&pixels.data[i+1]===0&&pixels.data[i+2]===255)pixels.data[i+3]=0;ctx.putImageData(pixels,0,0);
  return canvas.toDataURL();
 })().catch(()=>null));
 return cache.get(name);
}
export function itemThumbnail(id){
 const frame=document.createElement('span');frame.className='item-thumbnail';frame.setAttribute('aria-hidden','true');frame.textContent=id?'?':'—';
 if(icons[id])loadIcon(icons[id]).then(url=>{if(!url){frame.title='Image unavailable';return;}const image=new Image();image.alt='';image.width=24;image.height=24;image.src=url;frame.replaceChildren(image);});
 return frame;
}
