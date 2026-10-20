import Configs from 'Core/Configs.js';
import Thread from 'Core/Thread.js';
import Client from 'Core/Client.js';
import Renderer from 'Renderer/Renderer.js';
import MapRenderer from 'Renderer/MapRenderer.js';
import Camera from 'Renderer/Camera.js';
import Altitude from 'Renderer/Map/Altitude.js';
import Entity from 'Renderer/Entity/Entity.js';
import Session from 'Engine/SessionStorage.js';
import BGM from 'Audio/BGM.js';

const map=new URLSearchParams(location.search).get('map');
if(!['prontera','glast_01'].includes(map))throw Error('Unknown scene');
Configs.set('remoteClient','https://grf.robrowser.com/');
Configs.set('packetver',20180620);
BGM.play=()=>{};
const spot=Session.Entity=new Entity();
MapRenderer.onLoad=()=>{
 const positions={prontera:[156,180],glast_01:[200,265]};
 const [x,y]=positions[map];spot.position[0]=x;spot.position[1]=y;spot.position[2]=Altitude.getCellHeight(x,y);
 Camera.setTarget(spot);Camera.init();Camera.angleFinal[0]=235;Camera.angleFinal[1]=0;Camera.zoomFinal=300;
 setTimeout(()=>{Camera.zoom=Camera.zoomFinal=300;Camera.angle[0]=Camera.angleFinal[0]=235;Camera.lastTick=performance.now();},200);
 setTimeout(()=>parent.postMessage({type:'studio-scene-ready',map},location.origin),1500);
};
Thread.hook('THREAD_READY',()=>{Renderer.init();Client.onFilesLoaded=()=>MapRenderer.setMap(map+'.rsw');Client.init([]);});
Thread.init();
