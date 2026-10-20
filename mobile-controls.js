// Mobile controls use the same select/change events as the desktop UI.
export function initMobileControls(){
 const mobile=matchMedia('(max-width:760px), (pointer:coarse) and (max-width:1100px)'),wheels=[],pickers=[];
 for(const id of ['hair','hairColor','costumeColor']){
  const select=document.getElementById(id),label=select.closest('label');label.classList.add('palette-field');
  const wheel=document.createElement('div');wheel.className='palette-wheel';wheel.setAttribute('role','group');wheel.setAttribute('aria-label',label.firstChild.textContent.trim());
  const choices=Array.from(select.options),numeric=id.endsWith('Color');
  if(numeric)wheel.classList.add('numeric-wheel');
  const buttons=Array.from({length:3},(_,cycle)=>choices.map(option=>{const b=document.createElement('button');b.type='button';b.dataset.value=option.value;b.dataset.cycle=cycle;b.textContent=numeric?option.value.padStart(3,'0'):option.textContent;b.setAttribute('aria-label',option.textContent);return b;})).flat();
  wheel.append(...buttons);label.append(wheel);
  let timer,positioning=false,committing=false,active;
  const selected=()=>buttons.find(b=>b.dataset.value===select.value&&b.dataset.cycle==='1');
  const highlight=b=>{if(active===b)return;active?.setAttribute('aria-pressed','false');active=b;active?.setAttribute('aria-pressed','true');};
  const nearest=()=>{const first=buttons[0].getBoundingClientRect(),step=buttons[1].getBoundingClientRect().left-first.left,rect=wheel.getBoundingClientRect();return buttons[Math.max(0,Math.min(buttons.length-1,Math.round((rect.left+rect.width/2-first.left-first.width/2)/step)))];};
  const position=()=>{if(!mobile.matches||committing)return;clearTimeout(timer);const b=selected();if(!b)return;positioning=true;wheel.scrollLeft+=b.getBoundingClientRect().left+b.offsetWidth/2-wheel.getBoundingClientRect().left-wheel.clientWidth/2;highlight(b);requestAnimationFrame(()=>requestAnimationFrame(()=>positioning=false));};
  const choose=b=>{if(!b)return;committing=true;if(select.value!==b.dataset.value){select.value=b.dataset.value;select.dispatchEvent(new Event('change',{bubbles:true}));}committing=false;position();};
  const settle=()=>{if(!positioning)choose(nearest());};
  wheel.onclick=e=>{const b=e.target.closest('button');if(b){highlight(b);choose(b);}};
  wheel.addEventListener('scroll',()=>{if(positioning)return;highlight(nearest());clearTimeout(timer);timer=setTimeout(settle,90);},{passive:true});
  wheel.addEventListener('scrollend',()=>{clearTimeout(timer);settle();});
  wheel.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const i=buttons.indexOf(selected());choose(buttons[i+(e.key==='ArrowRight'?1:-1)]);}};
  wheels.push({mark:()=>{if(!committing)highlight(selected());},position});highlight(selected());requestAnimationFrame(position);
 }
 for(const id of ['upper','middle','lower','costumeUpper','costumeMiddle','costumeLower','garment']){
  const select=document.getElementById(id),label=select.closest('label');
  const host=document.createElement('div');host.className='mobile-item-picker';
  const input=document.createElement('input');input.type='search';input.autocomplete='off';input.placeholder='Type an item name…';input.setAttribute('role','combobox');input.setAttribute('aria-expanded','false');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-label',label.firstChild.textContent.trim());
  const list=document.createElement('div');list.id=id+'-results';list.className='item-results';list.setAttribute('role','listbox');list.hidden=true;input.setAttribute('aria-controls',list.id);host.append(input,list);label.append(host);
  const text=()=>select.selectedOptions[0]?.textContent||'None';
  let searchTimer;const close=()=>{clearTimeout(searchTimer);list.hidden=true;input.setAttribute('aria-expanded','false');input.value=select.value==='0'?'':text();};
  function show(query=''){const q=query.trim().toLowerCase();const options=Array.from(select.options).filter(o=>o.value==='0'||o.textContent.toLowerCase().includes(q)).slice(0,30);list.replaceChildren(...options.map(o=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','option');b.setAttribute('aria-selected',String(o.selected));b.dataset.value=o.value;b.textContent=o.textContent;return b;}));list.hidden=false;input.setAttribute('aria-expanded','true');}
  input.onfocus=()=>input.select();input.oninput=()=>{clearTimeout(searchTimer);list.hidden=true;input.setAttribute('aria-expanded','false');searchTimer=setTimeout(()=>show(input.value),250);};host.addEventListener('focusout',()=>setTimeout(()=>{if(!host.contains(document.activeElement))close();},150));
  input.onkeydown=e=>{if(list.hidden&&e.key==='ArrowDown'){clearTimeout(searchTimer);show(input.value);}if(e.key==='Escape'){close();input.blur();}if(e.key==='ArrowDown'){e.preventDefault();list.querySelector('button')?.focus();}if(e.key==='Enter'){e.preventDefault();const b=Array.from(list.children).find(b=>b.dataset.value!=='0')||list.firstChild;b?.click();}};
  list.onpointerdown=e=>e.preventDefault();
  list.onclick=e=>{const b=e.target.closest('button');if(!b)return;select.value=b.dataset.value;select.dispatchEvent(new Event('change',{bubbles:true}));close();input.blur();};
  list.onkeydown=e=>{const buttons=Array.from(list.children),i=buttons.indexOf(document.activeElement);if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();buttons[Math.max(0,Math.min(buttons.length-1,i+(e.key==='ArrowDown'?1:-1)))]?.focus();}if(e.key==='Escape'){close();input.focus();}};
  pickers.push({sync:()=>{if(document.activeElement!==input)input.value=select.value==='0'?'':text();}});close();
 }
 document.addEventListener('studio-look-change',()=>{wheels.forEach(w=>{w.mark();w.position();});pickers.forEach(p=>p.sync());});
 mobile.addEventListener('change',()=>wheels.forEach(w=>w.position()));
 let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>wheels.forEach(w=>w.position()),150);});
}
