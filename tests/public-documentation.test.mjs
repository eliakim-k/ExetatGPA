import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';

test('public assets exclude internal conversations, project paths and approval records',async()=>{
 const root=new URL('../dist/',import.meta.url);
 async function audit(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
   const url=new URL(entry.name+(entry.isDirectory()?'/':''),dir);
   if(entry.isDirectory()){await audit(url);continue;}
   if(!/\.(?:html|mjs|json|txt|css|svg)$/.test(entry.name))continue;
   const text=await readFile(url,'utf8');
   assert(!/submission_v\d|project_records|TASK_BRIEF|scientific approval|publication authorization|approved on|author (?:approved|selected|requested)|retained worked examples|Loading retained/i.test(text),url.pathname);
  }
 }
 await audit(root);
 const p=JSON.parse(await readFile(new URL('data/PROVENANCE.json',root),'utf8'));
 assert(p.inputs.every(x=>x.path?.startsWith('data/')&&!x.source));
 assert.equal(p.reference_sources.length,8);
 assert(p.reference_sources.every(x=>x.url?.startsWith('https://')&&/^[a-f0-9]{64}$/.test(x.sha256)));
 for(const name of ['RELEASE.json',...(await readdir(new URL('../releases/',import.meta.url))).map(x=>'releases/'+x)]){
  const text=await readFile(new URL('../'+name,import.meta.url),'utf8');
  assert(!/claim approval|scientific work units|manuscript|publication authorization|approved on/i.test(text),name);
 }
});
