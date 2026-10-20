// Standalone adapters for unchanged roBrowser effect classes.
import Targa from '../vendor/Targa.js';
export const pending=[];
export const Camera={angle:[235,0]};
export const Altitude={getCellHeight:()=>0};
export const SpriteRenderer={runWithDepth(_test,_write,_unused,draw){draw();}};
export const Client={loadFile(path,callback){
 const work=fetch('https://classicweb.niktoutro.com/client/'+path.split('/').map(encodeURIComponent).join('/'),{signal:AbortSignal.timeout(20000)})
 .then(r=>{if(!r.ok)throw Error('Aura asset unavailable');return r.arrayBuffer();}).then(callback);
 pending.push(work);return work;
}};
export const WebGL={
 createShaderProgram(gl,vertex,fragment){
  const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
  const p=gl.createProgram(),vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);
  gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
  p.uniform={};p.attribute={};
  for(let i=0;i<gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);i++){const n=gl.getActiveUniform(p,i).name;p.uniform[n]=gl.getUniformLocation(p,n);}
  for(let i=0;i<gl.getProgramParameter(p,gl.ACTIVE_ATTRIBUTES);i++){const n=gl.getActiveAttrib(p,i).name;p.attribute[n]=gl.getAttribLocation(p,n);}
  return p;
 },
 texture(gl,buffer,callback){
  const task=(async()=>{
   let source;const bytes=new Uint8Array(buffer);
   if(bytes[0]===66&&bytes[1]===77){source=await createImageBitmap(new Blob([buffer],{type:'image/bmp'}));}
   else {const tga=new Targa();tga.load(bytes);source=tga.getCanvas();}
   const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   source.close?.();callback(texture);
  })();pending.push(task);return task;
 }
};
