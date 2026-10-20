import {initEquipmentPicker} from './equipment-picker.js?v=20261020-bow16';
// Mobile controls use the same select/change events as the desktop UI.
export function initMobileControls(){
 const mobile=matchMedia('(max-width:760px), (pointer:coarse) and (max-width:1100px)'),wheels=[],pickers=[];
 for(const id of ['hair','hairColor','costumeColor']){
  const select=document.getElementById(id),label=select.closest('label');label.classList.add('palette-field');
  const wheel=document.createElement('div');wheel.className='palette-wheel';wheel.setAttribute('role','group');wheel.setAttribute('aria-label',label.firstChild.textContent.trim());
  const choices=Array.from(select.options),numeric=id.endsWith('Color');
  if(numeric)wheel.classList.add('numeric-wheel');
  const buttons=Array.from({length:3},(_,cycle)=>choices.map(option=>{const b=document.createElement('button');b.type='button';b.dataset.value=option.value;b.dataset.cycle=cycle;b.textContent=option.value.padStart(numeric?3:2,'0');b.classList.toggle('major-tick',Number(option.value)%5===0);b.setAttribute('aria-label',option.textContent);return b;})).flat();
  wheel.append(...buttons);const ruler=document.createElement('div');ruler.className='ruler-shell';ruler.append(wheel);label.append(ruler);
  let timer,positioning=false,committing=false,active;
  const selected=()=>buttons.find(b=>b.dataset.value===select.value&&b.dataset.cycle==='1');
  const highlight=b=>{if(active===b)return;active?.setAttribute('aria-pressed','false');active=b;active?.setAttribute('aria-pressed','true');};
  const nearest=()=>{const first=buttons[0].getBoundingClientRect(),step=buttons[1].getBoundingClientRect().left-first.left,rect=wheel.getBoundingClientRect();return buttons[Math.max(0,Math.min(buttons.length-1,Math.round((rect.left+rect.width/2-first.left-first.width/2)/step)))];};
  const position=()=>{if(!mobile.matches||committing||!wheel.clientWidth)return;clearTimeout(timer);const b=selected();if(!b)return;positioning=true;wheel.scrollLeft+=b.getBoundingClientRect().left+b.offsetWidth/2-wheel.getBoundingClientRect().left-wheel.clientWidth/2;highlight(b);requestAnimationFrame(()=>requestAnimationFrame(()=>positioning=false));};
  const choose=b=>{if(!b)return;committing=true;if(select.value!==b.dataset.value){select.value=b.dataset.value;select.dispatchEvent(new Event('change',{bubbles:true}));}committing=false;position();};
  const settle=()=>{if(!positioning)choose(nearest());};
  wheel.onclick=e=>{const b=e.target.closest('button');if(b){highlight(b);choose(b);}};
  wheel.addEventListener('scroll',()=>{if(positioning)return;highlight(nearest());clearTimeout(timer);timer=setTimeout(settle,90);},{passive:true});
  wheel.addEventListener('scrollend',()=>{clearTimeout(timer);settle();});
  wheel.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const i=buttons.indexOf(selected());choose(buttons[i+(e.key==='ArrowRight'?1:-1)]);}};
  wheels.push({mark:()=>{if(!committing)highlight(selected());},position});highlight(selected());requestAnimationFrame(position);
 }
 const equipmentPicker=initEquipmentPicker();pickers.push(equipmentPicker);
 const tabs=['style','equipment'];
 const activate=name=>{equipmentPicker.close(false);for(const key of tabs){const selected=key===name,tab=document.getElementById(key+'-tab');tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;document.getElementById(key+'-panel').hidden=!selected;}document.querySelector('.controls').scrollTop=0;if(name==='style')requestAnimationFrame(()=>wheels.forEach(w=>w.position()));};
 for(const name of tabs){const tab=document.getElementById(name+'-tab');tab.onclick=()=>activate(name);tab.onkeydown=e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?'style':e.key==='End'?'equipment':tabs[1-tabs.indexOf(name)];activate(next);document.getElementById(next+'-tab').focus();}};}
 document.addEventListener('studio-look-change',()=>{wheels.forEach(w=>{w.mark();w.position();});pickers.forEach(p=>p.sync());});
 mobile.addEventListener('change',()=>wheels.forEach(w=>w.position()));
 let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>wheels.forEach(w=>w.position()),150);});
}
