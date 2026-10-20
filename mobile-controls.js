// Mobile controls use the same select/change events as the desktop UI.
export function initMobileControls(){
 const mobile=matchMedia('(max-width:760px)'),wheels=[],pickers=[];
 for(const id of ['hairColor','costumeColor']){
  const select=document.getElementById(id),label=select.closest('label');
  label.classList.add('palette-field');
  const wheel=document.createElement('div');wheel.className='palette-wheel';wheel.setAttribute('role','group');wheel.setAttribute('aria-label',id==='hairColor'?'Hair color palette':'Costume color palette');
  const buttons=Array.from(select.options,option=>{const b=document.createElement('button');b.type='button';b.dataset.value=option.value;b.textContent=option.value==='0'?'Original':option.value;b.setAttribute('aria-label',option.value==='0'?'Original color':'Palette '+option.value);return b;});
  wheel.append(...buttons);label.append(wheel);
  let timer,programmatic=false;
  const selected=()=>buttons.find(b=>b.dataset.value===select.value);
  const position=()=>{if(!mobile.matches)return;const b=selected();if(!b)return;programmatic=true;wheel.scrollLeft+=b.getBoundingClientRect().left+b.offsetWidth/2-wheel.getBoundingClientRect().left-wheel.clientWidth/2;clearTimeout(timer);timer=setTimeout(()=>programmatic=false,200);};
  const mark=()=>buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===select.value)));
  const choose=value=>{if(select.value!==value){select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));}mark();};
  wheel.onclick=e=>{const b=e.target.closest('button');if(b){choose(b.dataset.value);position();}};
  wheel.addEventListener('scroll',()=>{if(programmatic)return;clearTimeout(timer);timer=setTimeout(()=>{const rect=wheel.getBoundingClientRect(),center=rect.left+rect.width/2;let closest=buttons[0],distance=Infinity;for(const b of buttons){const r=b.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-center);if(d<distance){distance=d;closest=b;}}choose(closest.dataset.value);},170);},{passive:true});
  wheel.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const i=buttons.indexOf(selected()),b=buttons[Math.max(0,Math.min(buttons.length-1,i+(e.key==='ArrowRight'?1:-1)))];choose(b.dataset.value);position();b.focus({preventScroll:true});}};
  wheels.push({mark,position});mark();requestAnimationFrame(position);
 }
 for(const id of ['upper','middle','lower','costumeUpper','costumeMiddle','costumeLower','garment']){
  const select=document.getElementById(id),label=select.closest('label');
  const host=document.createElement('div');host.className='mobile-item-picker';
  const input=document.createElement('input');input.type='search';input.autocomplete='off';input.placeholder='Type an item name…';input.setAttribute('role','combobox');input.setAttribute('aria-expanded','false');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-label',label.firstChild.textContent.trim());
  const list=document.createElement('div');list.id=id+'-results';list.className='item-results';list.setAttribute('role','listbox');list.hidden=true;input.setAttribute('aria-controls',list.id);host.append(input,list);label.append(host);
  const text=()=>select.selectedOptions[0]?.textContent||'None';
  const close=()=>{list.hidden=true;input.setAttribute('aria-expanded','false');input.value=select.value==='0'?'':text();};
  function show(query=''){const q=query.trim().toLowerCase();const options=Array.from(select.options).filter(o=>o.value==='0'||o.textContent.toLowerCase().includes(q)).slice(0,30);list.replaceChildren(...options.map(o=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','option');b.setAttribute('aria-selected',String(o.selected));b.dataset.value=o.value;b.textContent=o.textContent;return b;}));list.hidden=false;input.setAttribute('aria-expanded','true');}
  input.onfocus=()=>{input.select();show();};input.oninput=()=>show(input.value);input.onblur=()=>setTimeout(close,150);
  input.onkeydown=e=>{if(e.key==='Escape'){close();input.blur();}if(e.key==='ArrowDown'){e.preventDefault();list.querySelector('button')?.focus();}if(e.key==='Enter'){e.preventDefault();const b=Array.from(list.children).find(b=>b.dataset.value!=='0')||list.firstChild;b?.click();}};
  list.onpointerdown=e=>e.preventDefault();
  list.onclick=e=>{const b=e.target.closest('button');if(!b)return;select.value=b.dataset.value;select.dispatchEvent(new Event('change',{bubbles:true}));close();input.blur();};
  list.onkeydown=e=>{const buttons=Array.from(list.children),i=buttons.indexOf(document.activeElement);if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();buttons[Math.max(0,Math.min(buttons.length-1,i+(e.key==='ArrowDown'?1:-1)))]?.focus();}if(e.key==='Escape'){close();input.focus();}};
  pickers.push({sync:()=>{if(document.activeElement!==input)input.value=select.value==='0'?'':text();}});close();
 }
 document.addEventListener('studio-look-change',()=>{wheels.forEach(w=>{w.mark();w.position();});pickers.forEach(p=>p.sync());});
 const enterMobile=()=>{if(mobile.matches){const search=document.getElementById('equipmentSearch');if(search.value){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));}}wheels.forEach(w=>w.position());};
 mobile.addEventListener('change',enterMobile);enterMobile();
 let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>wheels.forEach(w=>w.position()),150);});
}
