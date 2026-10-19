import {readdirSync,readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,join,dirname,extname} from 'node:path';
const root=resolve('.'),skip=new Set(['node_modules','.git','.next','out','validation','playwright-report','test-results']),textExtensions=new Set(['.ts','.tsx','.mjs','.json','.md','.yml','.toml','.css','.svg','.txt']);
const files=[];function walk(folder){for(const entry of readdirSync(folder,{withFileTypes:true})){if(skip.has(entry.name))continue;const path=join(folder,entry.name);if(entry.isDirectory())walk(path);else files.push(path);}}walk(root);
const failures=[];
for(const path of files){
 const name=path.slice(root.length+1).replaceAll('\\','/');
 if(name.startsWith('.env')&&name!=='.env.example'||name.startsWith('supabase/')||name.includes('admin-access'))failures.push(name+': private or production file');
 if(textExtensions.has(extname(path))){
  const source=readFileSync(path,'utf8');
  for(const pattern of [/sb_secret_[A-Za-z0-9_-]{12,}/,/https:\/\/[a-z0-9]{15,}\.supabase\.co/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/\bre_[A-Za-z0-9]{24,}\b/])if(pattern.test(source))failures.push(name+': credential or production endpoint pattern');
  if(extname(path)==='.md')for(const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)){
   const target=match[1].split('#')[0];if(!target||/^[a-z]+:/i.test(target)||target.startsWith('/'))continue;
   if(!existsSync(resolve(dirname(path),target)))failures.push(name+': broken link '+target);
  }
 }
}
for(const file of ['.env.local','supabase','validation/admin-access.txt'])if(existsSync(resolve(root,file)))failures.push(file+': must not be included');
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}else console.log(JSON.stringify({filesChecked:files.length,sourceBytes:files.reduce((sum,file)=>sum+statSync(file).size,0),documentationLinks:'valid',credentialPatterns:'none'}));
