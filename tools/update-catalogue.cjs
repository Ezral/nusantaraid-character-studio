const fs=require('fs'),path=require('path');
const repo=path.resolve(__dirname,'..');
(async()=>{
const dir=path.join(repo,'.cache/niktout');fs.mkdirSync(dir,{recursive:true});
for(const file of ['Online.js','data/idnum2itemdisplaynametable.txt','data/idnum2itemdesctable.txt','data/luafiles514/lua files/datainfo/accessoryid.lub','data/luafiles514/lua files/datainfo/accname.lub']){const url='https://classicweb.niktoutro.com/'+(file==='Online.js'?'':'client/')+file.split('/').map(encodeURIComponent).join('/');const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Could not read '+file);fs.writeFileSync(path.join(dir,path.basename(file)),Buffer.from(await response.arrayBuffer()));}

const root=dir+path.sep,bundle=fs.readFileSync(root+'Online.js','utf8');
function pairs(file){const text=fs.readFileSync(root+file,'latin1').split('idnum2itemresnametable')[0].replace(/\/\/[^\r\n]*/g,'');const result={};for(const m of text.matchAll(/(?:^|\r?\n)(\d+)#([\s\S]*?)#/g))result[m[1]]=m[2].replace(/\^[0-9a-f]{6}/gi,'').trim();return result;}
const names=pairs('idnum2itemdisplaynametable.txt'),desc=pairs('idnum2itemdesctable.txt');
const view={};for(const m of bundle.matchAll(/(\d+):\s*\{\s*ClassNum:\s*(\d+)\s*\}/g))view[m[1]]=Number(m[2]);
const ids={};for(const m of fs.readFileSync(root+'accessoryid.lub','latin1').matchAll(/(\w+)\s*=\s*(\d+)/g))ids[m[1]]=Number(m[2]);
function decode(s){return s.replace(/\\x([a-f0-9]{2})|\\(\d{1,3})|\\(.)/gi,(_,h,d,c)=>h?String.fromCharCode(parseInt(h,16)):d?String.fromCharCode(Number(d)):c);}
const hats={};for(const m of fs.readFileSync(root+'accname.lub','latin1').matchAll(/\[ACCESSORY_IDs\.(\w+)\]\s*=\s*"((?:\\.|[^"\\])*)"/g))if(ids[m[1]])hats[ids[m[1]]]=decode(m[2]);
const robeStart=bundle.indexOf("define('DB/Items/RobeTable'"),robeEnd=bundle.indexOf('\n});',robeStart);
const robes={};for(const m of bundle.slice(robeStart,robeEnd).matchAll(/(\d+):\s*'((?:\\.|[^'\\])*)'/g))robes[m[1]]=decode(m[2]);
const items=[];
for(const [id,name] of Object.entries(names)){
 const d=desc[id]||'',v=view[id];if(!v)continue;
 const position=d.match(/(?:Position|Location|Equipped on)\s*:\s*([^\r\n]+)/i)?.[1]||'';
 const slots=['upper','middle','lower'].filter(s=>new RegExp(s,'i').test(position));
 const costume=/Class\s*:\s*Costume/i.test(d)||/^Costume[_ ]/i.test(name);
 const garment=/garment/i.test(position)&&costume;
 if(garment&&robes[v])items.push({id:Number(id),name:name.replaceAll('_',' '),view:v,costume:true,slots:['garment']});
 else if(slots.length&&hats[v]&&(/Class\s*:\s*(?:Headgear|Costume)/i.test(d)||costume))items.push({id:Number(id),name:name.replaceAll('_',' '),view:v,costume,slots});
}
const out={source:'https://classicweb.niktoutro.com/',date:new Date().toISOString().slice(0,10),items,hats,robes};
fs.writeFileSync(path.join(repo,'niktout-items.js'),'// Generated from Niktout Classic public client tables. Item IDs, not view IDs.\nexport default '+JSON.stringify(out)+';\n');
console.log({items:items.length,headgear:items.filter(i=>!i.costume).length,costume:items.filter(i=>i.costume).length,hats:Object.keys(hats).length,robes:Object.keys(robes).length,sample:items.slice(0,5)});

})().catch(error=>{console.error(error.message);process.exitCode=1;});
