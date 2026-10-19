import {readdirSync,copyFileSync,writeFileSync} from 'node:fs';
import {resolve,join,dirname,relative,sep} from 'node:path';
const root=resolve('out');let aliases=0;
// Next 16 segment-prefetch URLs use dotted names. Preserve the original
// export and add flat aliases so plain static hosts can serve those URLs.
function visit(folder,segmentRoot=null){
 for(const entry of readdirSync(folder,{withFileTypes:true})){
  const path=join(folder,entry.name);
  if(entry.isDirectory())visit(path,segmentRoot||(entry.name.startsWith('__next.')?path:null));
  else if(segmentRoot&&entry.name.endsWith('.txt')){
   const alias=join(dirname(segmentRoot),relative(dirname(segmentRoot),path).split(sep).join('.'));
   if(alias!==path){copyFileSync(path,alias);aliases++;}
  }
 }
}
visit(root);writeFileSync(join(root,'.nojekyll'),'');console.log(JSON.stringify({staticPrefetchAliases:aliases}));
