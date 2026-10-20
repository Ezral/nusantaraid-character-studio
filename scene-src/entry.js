import {createWorldAura} from './world-aura.js';
import Configs from 'Core/Configs.js';
import Thread from 'Core/Thread.js';
import Client from 'Core/Client.js';
import Renderer from 'Renderer/Renderer.js';
import MapRenderer from 'Renderer/MapRenderer.js';
import Camera from 'Renderer/Camera.js';
import Altitude from 'Renderer/Map/Altitude.js';
import Entity from 'Renderer/Entity/Entity.js';
import EntityManager from 'Renderer/EntityManager.js';
import SpriteRenderer from 'Renderer/SpriteRenderer.js';
import Session from 'Engine/SessionStorage.js';
import BGM from 'Audio/BGM.js';

const map=new URLSearchParams(location.search).get('map');
if(!['prontera','glast_01'].includes(map))throw Error('Unknown scene');
Configs.set('remoteClient','https://classicweb.niktoutro.com/client/');
Configs.set('packetver',20180620);
Configs.set('quality',Math.min(100,100/(devicePixelRatio||1)));
BGM.play=()=>{};
const spot=Session.Entity=new Entity();
let worldAura=null,auraSettings={aura:false,opacity:50,size:100,animate:true};
let ready=false,source=null,dirty=false,texture=null,heading=0,zoom=3;
const notify=(type,extra={})=>parent.postMessage({type,map,...extra},location.origin);
function view(){if(!ready)return;Camera.angle[0]=Camera.angleFinal[0]=235;Camera.angle[1]=Camera.angleFinal[1]=heading*45;Camera.zoom=Camera.zoomFinal=210/zoom;}
// Same-origin bridge: no image serialization, no game connection, one texture per scene.
window.studioScene={setCharacter(canvas,settings){source=canvas;dirty=true;if(settings)auraSettings=settings;},setView(d,z){heading=d;zoom=z;view();},inspect(){return {map,ready,heading,zoom,position:Array.from(spot.position),cameraZoom:Camera.zoom,spritePixelsPerUnit:175/spot.xSize,characterHeightOffset:.2,characterZIndex:150,auraReady:!!worldAura?.ready()};}};
const renderEntities=EntityManager.render;
EntityManager.render=function(gl,mv,projection,fog,effects){
 renderEntities.call(this,gl,mv,projection,fog,effects);
 if(effects||!ready||!source)return;
 if(auraSettings.aura&&!worldAura)worldAura=createWorldAura(gl,spot.position);
 if(worldAura){SpriteRenderer.bind3DContext(gl,mv,projection,fog);SpriteRenderer.unbind(gl);worldAura.draw(mv,projection,fog,Renderer.tick,auraSettings);}
 if(!texture){texture=gl.createTexture();dirty=true;}
 if(dirty){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);dirty=false;}
 SpriteRenderer.bind3DContext(gl,mv,projection,fog);
 // Match the vendored RO player pass: entity scale, ground offset and body depth bias.
 SpriteRenderer.xSize=spot.xSize;SpriteRenderer.ySize=spot.ySize;SpriteRenderer.position.set(spot.position);SpriteRenderer.position[2]+=.2;SpriteRenderer.size.set([source.width,source.height]);SpriteRenderer.offset.set([0,0]);SpriteRenderer.color.set([1,1,1,1]);SpriteRenderer.angle=0;SpriteRenderer.depth=0;SpriteRenderer.zIndex=150;SpriteRenderer.shadow=1;SpriteRenderer.sprite=null;SpriteRenderer.image.texture=texture;SpriteRenderer.image.palette=null;
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 SpriteRenderer.runWithDepth(true,true,false,()=>SpriteRenderer.render(false));SpriteRenderer.unbind(gl);
};
MapRenderer.onLoad=()=>{
 const positions={prontera:[156,180],glast_01:[200,265]};
 const [x,y]=positions[map];spot.position.set([x,y,Altitude.getCellHeight(x,y)]);
 Camera.setTarget(spot);Camera.init();ready=true;view();Camera.lastTick=performance.now();
 Renderer.frameLimit=30;
 requestAnimationFrame(()=>requestAnimationFrame(()=>notify('studio-scene-ready')));
};
window.addEventListener('error',e=>notify('studio-scene-error',{message:e.message}));
Thread.hook('THREAD_READY',()=>{Renderer.init();Client.onFilesLoaded=()=>MapRenderer.setMap(map+'.rsw');Client.init([]);});
Thread.init();
