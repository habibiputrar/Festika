import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve('out'),port=Number(process.env.PORT||3000),host=process.env.HOST||'127.0.0.1';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.txt':'text/plain; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.pdf':'application/pdf','.ico':'image/x-icon'};
createServer(async(req,res)=>{
 try{
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
  const raw=decodeURIComponent(new URL(req.url,'http://localhost').pathname),prefix=(process.env.NEXT_PUBLIC_BASE_PATH||'').replace(/\/$/,''),path=prefix&&(raw===prefix||raw.startsWith(prefix+'/'))?raw.slice(prefix.length)||'/':raw,target=resolve(root,'.'+path);
  if(target!==root&&!target.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  let file=target;try{if((await stat(file)).isDirectory())file=resolve(file,'index.html');}catch{file=resolve(root,'404.html');res.statusCode=404;}
  const bytes=await readFile(file);res.setHeader('Content-Type',mime[extname(file)]||'application/octet-stream');res.setHeader('X-Content-Type-Options','nosniff');res.end(req.method==='HEAD'?undefined:bytes);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,host,()=>console.log(`FESTIKA demo: http://${host}:${port}`));
