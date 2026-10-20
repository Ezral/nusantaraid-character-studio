import {build} from 'vite';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const adapters=['WebGL','Client','Altitude','SpriteRenderer','Camera'];
const virtual={name:'aura-adapters',resolveId(id){if(['Utils/WebGL.js','Core/Client.js','Renderer/Map/Altitude.js','Renderer/SpriteRenderer.js','Renderer/Camera.js'].includes(id))return '\0'+id;},load(id){if(id.startsWith('\0')){const name=id.split('/').pop().replace('.js','');if(adapters.includes(name))return `export {${name} as default} from ${JSON.stringify(path.join(root,'aura-src/host.js'))};`;}}};
await build({root,configFile:false,plugins:[virtual],resolve:{alias:{'Utils/gl-matrix.js':path.join(root,'vendor/aura/gl-matrix.js'),'Vendors/gl-matrix.js':path.join(root,'vendor/aura/gl-matrix-vendor.js')}},build:{outDir:'aura',emptyOutDir:true,minify:false,lib:{entry:path.join(root,'aura-src/entry.js'),formats:['es'],fileName:()=> 'aura.js'}}});
