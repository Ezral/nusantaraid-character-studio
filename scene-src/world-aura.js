import GroundAura from 'Renderer/Effects/GroundAura.js';
import SwirlingAura from 'Renderer/Effects/SwirlingAura.js';
import Level99Bubble from 'Renderer/Effects/Level99Bubble.js';
import matrix from 'Utils/gl-matrix.js';
const {mat4}=matrix;
const classes=[GroundAura,SwirlingAura,Level99Bubble];
export function createWorldAura(gl,position){
 const effects=[new GroundAura(position,100,15,'pikapika2.bmp',0),new SwirlingAura(position,'ring_blue.tga',0),new Level99Bubble(position,'whitelight.tga',0,1)];
 classes.forEach((C,i)=>{C.init(gl);effects[i].init(gl);});
 let animate=true;
 for(const key of ['updatePhases','updateAnchor']){const update=effects[2][key];effects[2][key]=function(...args){if(animate)return update.apply(this,args);};}
 const view=mat4.create();const opacityLocations=new Map();
 return {ready:()=>effects.every(e=>e.ready),draw(modelView,projection,fog,tick,settings){
  if(!effects.every(e=>e.ready)||!settings.aura||settings.opacity<=0)return;
  animate=settings.animate;
  const scale=settings.size/100,origin=[position[0]+.5,-position[2],position[1]+.5];
  mat4.copy(view,modelView);mat4.translate(view,view,origin);mat4.scale(view,view,[scale,scale,scale]);mat4.translate(view,view,origin.map(n=>-n));
  classes.forEach((C,i)=>{
   const frozen=!animate&&i<2?structuredClone(i===0?effects[i].aura:effects[i].bands):null;
   C.beforeRender(gl,view,projection,fog,tick);
   const program=gl.getParameter(gl.CURRENT_PROGRAM);if(!opacityLocations.has(program))opacityLocations.set(program,gl.getUniformLocation(program,'uStudioOpacity'));
   gl.uniform1f(opacityLocations.get(program),settings.opacity/100);
   effects[i].render(gl,tick);C.afterRender(gl);
   if(frozen){if(i===0)effects[i].aura=frozen;else effects[i].bands=frozen;}
  });
 }};
}
