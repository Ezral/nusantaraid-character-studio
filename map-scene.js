let frame=null,ready=false,timer,refresh=()=>{};
export function setMapScene(name,draw){
 refresh=draw;clearTimeout(timer);frame?.remove();frame=null;ready=false;
 const stage=document.getElementById('stage');stage.classList.remove('scene-ready');
 let status=document.getElementById('scene-status');if(!status){status=document.createElement('div');status.id='scene-status';status.setAttribute('role','status');stage.append(status);}status.textContent='';
 if(!['prontera','glast_01'].includes(name))return;
 status.textContent='Loading '+(name==='prontera'?'Prontera street':'Glast Heim courtyard')+'…';
 const next=frame=document.createElement('iframe');next.className='map-scene';next.title=name==='prontera'?'Prontera main street':'Glast Heim courtyard';next.src='./scene.html?v=20261020-ground21&map='+name;next.setAttribute('aria-hidden','true');next.tabIndex=-1;stage.prepend(next);
 const fail=()=>{if(frame!==next)return;status.textContent='Map could not load. Select Light or Dark, or choose the map again to retry.';next.remove();frame=null;ready=false;stage.classList.remove('scene-ready');refresh();};
 next.onerror=fail;timer=setTimeout(fail,150000);
 next._ready=()=>{clearTimeout(timer);ready=true;status.textContent='';stage.classList.add('scene-ready');refresh();};next._fail=fail;
}
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame?.contentWindow)return;if(e.data?.type==='studio-scene-ready')frame._ready();if(e.data?.type==='studio-scene-error')frame._fail();});
export function updateMapScene(canvas,direction,zoom,settings){if(!ready)return;const scene=frame?.contentWindow?.studioScene;if(!scene)return;scene.setView(direction,zoom);scene.setCharacter(canvas,settings);}
export function mapSceneActive(){return ready;}
