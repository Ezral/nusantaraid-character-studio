import {itemThumbnail} from './item-thumbnails.js?v=20261020-costumes15';
export function initEquipmentPicker(){
 const drawer=document.createElement('section');drawer.id='equipment-drawer';drawer.className='equipment-drawer';drawer.hidden=true;drawer.setAttribute('role','dialog');drawer.setAttribute('aria-labelledby','equipment-drawer-title');
 drawer.innerHTML='<div class="drawer-heading"><strong id="equipment-drawer-title"></strong><button type="button" class="drawer-close" aria-label="Close equipment picker">×</button></div><input class="drawer-filter" type="search" placeholder="Filter by name or item ID…" aria-label="Filter equipment" autocomplete="off"><div class="drawer-count" role="status"></div><div class="drawer-list" aria-label="Equipment choices"></div>';
 document.body.append(drawer);
 const filter=drawer.querySelector('input'),list=drawer.querySelector('.drawer-list'),count=drawer.querySelector('.drawer-count'),slots=[];
 let active=null,opener=null,timer,observer;
 const position=()=>{if(drawer.hidden)return;const rect=document.querySelector('.controls').getBoundingClientRect(),bottom=window.visualViewport?visualViewport.offsetTop+visualViewport.height:innerHeight,top=Math.min(Math.max(0,rect.top),Math.max(0,bottom-260));drawer.style.left=rect.left+'px';drawer.style.top=top+'px';drawer.style.width=rect.width+'px';drawer.style.height=Math.min(rect.height,bottom-top)+'px';};
 function close(restore=true){clearTimeout(timer);observer?.disconnect();drawer.hidden=true;opener?.setAttribute('aria-expanded','false');if(restore)opener?.focus({preventScroll:true});active=null;}
 function render(){
  observer?.disconnect();const q=filter.value.trim().toLowerCase();const choices=Array.from(active.options).filter(o=>o.value==='0'||o.textContent.toLowerCase().includes(q));
  list.replaceChildren();list.scrollTop=0;count.textContent=(choices.length-1)+' items';
  observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const row=entry.target;row.firstChild.replaceChildren(itemThumbnail(Number(row.dataset.value)));observer.unobserve(row);}},{root:list,rootMargin:'100px'});
  const fragment=document.createDocumentFragment();for(const option of choices){const button=document.createElement('button');button.type='button';button.className='drawer-item';button.dataset.value=option.value;button.setAttribute('aria-pressed',String(option.selected));const image=document.createElement('span');image.className='drawer-icon';const name=document.createElement('span');name.textContent=option.textContent;button.append(image,name);fragment.append(button);}list.append(fragment);for(const row of list.children)observer.observe(row);
  if(choices.length===1&&q){const empty=document.createElement('p');empty.className='drawer-empty';empty.textContent='No matching items';list.append(empty);}
 }
 function open(select,button,title){active=select;opener=button;drawer.querySelector('strong').textContent=title;filter.value='';drawer.hidden=false;position();button.setAttribute('aria-expanded','true');render();drawer.querySelector('.drawer-close').focus({preventScroll:true});}
 for(const id of ['upper','middle','lower','costumeUpper','costumeMiddle','costumeLower','garment']){
  const select=document.getElementById(id),label=select.closest('label'),title=label.firstChild.textContent.trim();const button=document.createElement('button');button.type='button';button.className='equipment-slot';button.dataset.slot=id;button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls',drawer.id);button.setAttribute('aria-expanded','false');button.onclick=()=>open(select,button,title);label.append(button);slots.push({select,button,title});
 }
 function sync(){for(const {select,button,title} of slots){const name=document.createElement('span');name.textContent=select.selectedOptions[0]?.textContent||'None';const arrow=document.createElement('span');arrow.textContent='›';arrow.setAttribute('aria-hidden','true');button.replaceChildren(itemThumbnail(Number(select.value)),name,arrow);button.setAttribute('aria-label',title+': '+name.textContent);}}
 filter.oninput=()=>{clearTimeout(timer);timer=setTimeout(()=>{if(active)render();},200);};
 list.onclick=e=>{const row=e.target.closest('button[data-value]');if(!row||!active)return;active.value=row.dataset.value;active.dispatchEvent(new Event('change',{bubbles:true}));close();};
 drawer.querySelector('.drawer-close').onclick=()=>close();drawer.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();close();}if((e.key==='ArrowDown'||e.key==='ArrowUp')&&e.target.closest('.drawer-list')){e.preventDefault();const rows=Array.from(list.querySelectorAll('button')),i=rows.indexOf(document.activeElement);rows[Math.max(0,Math.min(rows.length-1,i+(e.key==='ArrowDown'?1:-1)))]?.focus();}};
 window.addEventListener('resize',position);window.visualViewport?.addEventListener('resize',position);window.addEventListener('scroll',position,{passive:true});sync();return {sync,close};
}
