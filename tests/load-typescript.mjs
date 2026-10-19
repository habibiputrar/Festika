import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {resolve,dirname,extname} from 'node:path';
import ts from 'typescript';
const cache=new Map();
export function load(file){
 file=resolve(file);if(cache.has(file))return cache.get(file);const module={exports:{}},native=createRequire(file);cache.set(file,module.exports);
 const code=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const require=id=>id.startsWith('.')?(extname(id)==='.json'?native(id):load(resolve(dirname(file),id)+'.ts')):native(id);
 new Function('require','module','exports',code)(require,module,module.exports);return module.exports;
}
