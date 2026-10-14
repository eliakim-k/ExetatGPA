import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
test('public release contains only calculator inputs, presentation and passive licensed image assets',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../checks/BUILD_MANIFEST.json',import.meta.url)));
 const base=['_headers','index.html','styles.css','app.mjs','locales.mjs','language-picker.mjs','engine.mjs','methods.html','data/app-data.json','data/PROVENANCE.json','data/annual_successful_score_histogram.csv','data/retained_target_distributions.csv','data/target_categories.csv','data/worked_profile_2023_score70.csv','assets/drc-flag-map.svg','assets/ATTRIBUTION.txt','assets/flag-icons-LICENSE.txt'];
 const flags=['gb','fr','jp','kr','cn','de','tr','cd','tz','es','pt','in','sa','bd','ru','pk','id','za'].map(code=>'assets/flags/'+code+'.svg');
 assert.deepEqual(manifest.files.map(x=>x.path).sort(),[...base,...flags].sort());
 const csp=await readFile(new URL('../dist/_headers',import.meta.url),'utf8');assert(csp.includes("script-src 'self'"));assert(!csp.includes('unsafe-inline'));assert(csp.includes("frame-ancestors 'none'"));
 for(const path of [...flags,'assets/drc-flag-map.svg']){const svg=await readFile(new URL('../dist/'+path,import.meta.url),'utf8');assert(!/<script\b|<foreignObject\b|\son\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|\/\/)/i.test(svg),path);}
});
