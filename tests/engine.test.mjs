import test from 'node:test';import assert from 'node:assert/strict';import {readFile,writeFile,mkdir} from 'node:fs/promises';import {createHash} from 'node:crypto';
import {position,referenceResults,sessionMatch,categoryAt,format,inverse} from '../src/engine.mjs';
const data=JSON.parse(await readFile(new URL('../data/app-data.json',import.meta.url))),old=JSON.parse(await readFile(new URL('retained-results.json',import.meta.url)));
let maxExternal=0,maxSession=0,externalChecks=0,sessionChecks=0;
test('public retained input bytes match their source hashes',async()=>{const manifest=JSON.parse(await readFile(new URL('../data/PROVENANCE.json',import.meta.url)));for(const x of manifest.inputs.filter(x=>x.path)){const bytes=await readFile(new URL('../'+x.path,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),x.sha256,x.path);}});
test('all 676 source pairs reproduce exact US category assignments and both missingness bounds',()=>{
 for(const row of old.us){const pos=position(data,row.year,Number(row.score),{thresholdOnly:true});assert(pos);const r=referenceResults(data,pos)[0];
  for(const [key,expected]of [['point','respondent_reference_category'],['strong','source_bound_strongest_category'],['weak','source_bound_weakest_category'],['combinedStrong','source_and_target_missing_strongest_category'],['combinedWeak','source_and_target_missing_weakest_category']])assert.equal(r[key],row[expected],`${row.year}/${row.score}/${key}`);
  assert(Math.abs(pos.p*100-Number(row.published_success_top_percent))<1e-8);
 }
});
test('all seven retained reference scales reproduce 14,196 numerical cells and published display resolution',()=>{
 for(const row of old.nonUS){const r=referenceResults(data,position(data,row.year,Number(row.score),{thresholdOnly:true})).find(r=>r.ref.id===row.reference_id);
  for(const [key,k]of [['point','point'],['rangeLow','range_low'],['rangeHigh','range_high']]){const err=Math.abs(r[key]-Number(row[k]));maxExternal=Math.max(maxExternal,err);assert(err<1e-6,`${row.year}/${row.score}/${row.country}/${key}: ${err}`);externalChecks++;}
  const normalize=s=>s.replaceAll('–','-');assert.equal(normalize(format(r.ref,r.point)),normalize(row.display_value));
 }
});
test('all retained session matches reproduce values and no-extrapolation decisions',()=>{
 for(const row of old.sessions){const pos=position(data,row.source_year,Number(row.source_score)),value=sessionMatch(data,pos,row.target_year);
  if(row.available==='True'){assert.notEqual(value,null);const e=Math.abs(value-Number(row.equivalent_score));maxSession=Math.max(maxSession,e);assert(e<1e-7,`${row.source_year}/${row.source_score}/${row.target_year}`);}
  else assert.equal(value,null);sessionChecks++;
 }
});
test('exact rational category boundaries belong to the category ending there',()=>{
 const cats=data.references[0].categories,N=cats.reduce((s,[,n])=>s+n,0);let cum=0;
 for(let i=0;i<cats.length;i++){cum+=cats[i][1];assert.equal(categoryAt(cum,N,cats),cats[i][0]);if(cum<N)assert.equal(categoryAt(cum+1,N,cats),cats[i+1][0]);}
 assert.equal(categoryAt(0,N,cats),'A+');assert.equal(categoryAt(N,N,cats),'D/E/F');
});
test('unsupported sessions, unobserved scores, decimals and invalid ranks are withheld',()=>{
 for(const [y,s]of [[2024,70],[2007,70],[2023,49],[2023,101],[2023,70.5],[2023,NaN]])assert.equal(position(data,y,s),null);
 for(const [year,s]of Object.entries(data.sessions))for(let score=50;score<=100;score++)if(!s.histogram.some(([v,n])=>v===score&&n>0))assert.equal(position(data,year,score),null);
 assert.throws(()=>inverse(data.references[1],1.01));assert.throws(()=>categoryAt(-1,10,data.references[0].categories));
});
test('ties include all equal scores; every session identity and mapping is monotone',()=>{
 for(const [y,s]of Object.entries(data.sessions)){let prev=Infinity;
  for(const [score,count]of s.histogram){const p=position(data,y,score);assert.equal(p.ties,count);assert.equal(p.a,s.histogram.filter(([v])=>v>=score).reduce((a,[,n])=>a+n,0));assert(p.p<=prev);prev=p.p;assert(Math.abs(sessionMatch(data,p,y)-score)<1e-10);assert.equal(p.N,p.n+p.U);}
 }
});
test('worked examples: 70/2023 eight references and 59/2021 to 2022',()=>{
 const pos=position(data,2023,70),r=referenceResults(data,pos);
 assert.equal(pos.a,19685);assert.equal(pos.n,759819);
 assert.deepEqual(r.map(r=>format(r.ref,r.point)),['A+','17.4 / 20','91 / 100','136','A*','1.0','400–419','80–89%']);
 assert.equal(sessionMatch(data,position(data,2021,59),2022).toFixed(2),'61.38');
});
test('write numerical evidence',async()=>{
 assert.equal(externalChecks,14196);assert.equal(sessionChecks,old.sessions.length);assert(maxExternal<1e-6);assert(maxSession<1e-7);
 await mkdir(new URL('../checks/',import.meta.url),{recursive:true});await writeFile(new URL('../checks/COMPUTATIONAL_VALIDATION.json',import.meta.url),JSON.stringify({status:'PASS',retainedThresholdPairs:old.us.length,observedAppPairs:648,unobservedThresholdInputsWithheld:28,usCategoryComparisons:old.us.length*5,externalChecks,maxExternalResidual:maxExternal,sessionChecks,maxSessionResidual:maxSession,ties:'inclusive',usBoundaries:'exact_integer_cross_products',source:'Expected outputs for aggregate score distributions and reference mappings'},null,2)+'\n');
});
