import GroundAura from '../vendor/aura/GroundAura.js';
import SwirlingAura from '../vendor/aura/SwirlingAura.js';
import Level99Bubble from '../vendor/aura/Level99Bubble.js';
import matrix from '../vendor/aura/gl-matrix.js';
import {pending} from './host.js';
const {mat4}=matrix;
export async function createAura(){
 const canvas=document.createElement('canvas');canvas.width=400;canvas.height=320;
 const composited=document.createElement('canvas');composited.width=400;composited.height=320;
 const pixels=composited.getContext('2d',{willReadFrequently:true});
 const gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true,antialias:true});
 if(!gl)throw Error('Level 99 aura requires WebGL 2');
 const classes=[GroundAura,SwirlingAura,Level99Bubble],position=new Float32Array([-.5,-.5,0]);
 const effects=[new GroundAura(position,100,15,'pikapika2.bmp',0),new SwirlingAura(position,'ring_blue.tga',0),new Level99Bubble(position,'whitelight.tga',0,1)];
 classes.forEach((C,i)=>{C.init(gl);effects[i].init(gl);});
 let count=0;while(count<pending.length){const tasks=pending.slice(count);count=pending.length;await Promise.all(tasks);}
 if(!effects.every(e=>e.ready))throw Error('Aura assets could not load');
 const view=mat4.create(),projection=mat4.create(),fog={use:false,exist:false,near:0,far:100,color:[0,0,0]};
 let last=0,lastPlacement='';
 return {draw(ctx,x,y,scale,animate=true){
  // Original RO shaders divide sprite pixels by 35. Restore those units here;
  // the caller applies the same ACT origin and zoom transform as the character.
  const unit=35*scale;mat4.ortho(projection,-400/unit,400/unit,-320/unit,320/unit,-100,100);
  mat4.identity(view);mat4.rotateX(view,view,235*Math.PI/180);
  const now=performance.now();
  const placement=[x,y,scale].join(',');
  if(!last||placement!==lastPlacement||(animate&&now-last>=1000/60)){
   gl.viewport(0,0,400,320);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.BLEND);gl.disable(gl.DEPTH_TEST);
   classes.forEach((C,i)=>{C.beforeRender(gl,view,projection,fog,now);effects[i].render(gl,now);C.afterRender(gl);});
   // Encode additive light as transparent pixels for the 2D sprite canvas/PNG.
   // The original effects assume an opaque game framebuffer; black is zero light.
   pixels.clearRect(0,0,400,320);pixels.drawImage(canvas,0,0);
   const image=pixels.getImageData(0,0,400,320),data=image.data;
   for(let i=0;i<data.length;i+=4){const light=Math.max(data[i],data[i+1],data[i+2]);data[i+3]=light;if(light){data[i]=data[i]*255/light;data[i+1]=data[i+1]*255/light;data[i+2]=data[i+2]*255/light;}}
   pixels.putImageData(image,0,0);last=now;lastPlacement=placement;
  }
  ctx.drawImage(composited,x-400,y-320,800,640);
 },dispose(){effects.forEach(e=>e.free(gl));classes.forEach(C=>C.free(gl));gl.getExtension('WEBGL_lose_context')?.loseContext();}};
}
