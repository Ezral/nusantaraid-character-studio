import {build} from 'vite';
import path from 'node:path';
const base=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const root=decodeURIComponent(base);
const source=process.env.ROBROWSER_SOURCE||path.join(root,'scene-src/robrowser');
const alias=Object.fromEntries(['App','Audio','Controls','Core','DB','Engine','Loaders','Network','Plugins','Preferences','Renderer','UI','Utils','Vendors'].map(n=>[n,path.join(source,n)]));
await build({configFile:false,logLevel:'error',root,base:'./',resolve:{alias},worker:{format:'es'},build:{outDir:'scene',emptyOutDir:true,assetsInlineLimit:1048576,minify:true,rollupOptions:{input:path.join(root,'scene-src/entry.js'),output:{entryFileNames:'scene.js'}}}});
