import {build} from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const source=process.env.ROBROWSER_SOURCE||path.join(root,'scene-src/robrowser');
const alias=Object.fromEntries(['App','Audio','Controls','Core','DB','Engine','Loaders','Network','Plugins','Preferences','Renderer','UI','Utils','Vendors'].map(n=>[n,path.join(source,n)]));
// Preserve upstream effect geometry; add only a preview opacity multiplier.
const opacity={name:'studio-aura-opacity',enforce:'pre',load(id){
 if(!/(GroundAura|SwirlingAura|Level99Bubble)\.fs\?raw$/.test(id))return;
 const source=fs.readFileSync(id.slice(0,-4),'utf8');
 const shader=source.replace('void main(void)','uniform float uStudioOpacity;\nvoid main(void)').replace(/}\s*$/,'fragColor.a *= uStudioOpacity;\n}');
 return 'export default '+JSON.stringify(shader)+';';
}};
await build({plugins:[opacity],configFile:false,logLevel:'error',root,base:'./',resolve:{alias},worker:{format:'es'},build:{outDir:'scene',emptyOutDir:true,assetsInlineLimit:1048576,minify:true,rollupOptions:{input:path.join(root,'scene-src/entry.js'),output:{entryFileNames:'scene.js'}}}});
