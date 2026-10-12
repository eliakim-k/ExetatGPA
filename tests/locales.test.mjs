import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {locales,message,languageOrder} from '../src/locales.mjs';
const expected=['en','fr','ja','ko','de','tr','zh','es','hi','ar','pt','bn','ru','ur','id','sw','ln','zu','af'];
test('all 19 approved languages have complete, nonempty catalogs and identical scientific interpolation slots',()=>{
 assert.deepEqual(Object.keys(locales),expected);assert.deepEqual(languageOrder,['en','fr','ja','ko','zh','de','tr','ln','sw','es','pt','hi','ar','bn','ru','ur','id','zu','af']);assert.deepEqual([...languageOrder].sort(),[...expected].sort());const base=locales.en.text;
 for(const [code,l]of Object.entries(locales)){assert.deepEqual(Object.keys(l.text),Object.keys(base),code);assert.equal(l.countries.length,8);assert.equal(l.text.scope.split(' · ').length,2,'Account tagline removed');assert.equal(l.dir,['ar','ur'].includes(code)?'rtl':'ltr');
  for(const [k,s]of Object.entries(l.text)){assert(s.trim(),code+'/'+k);assert(!s.includes('—'),code+'/'+k);assert(!/[<>]/.test(s),code+'/'+k);assert.deepEqual([...s.matchAll(/\{\w+\}/g)].map(m=>m[0]).sort(),[...base[k].matchAll(/\{\w+\}/g)].map(m=>m[0]).sort(),code+'/'+k);}
  assert.equal(new Intl.NumberFormat(code).resolvedOptions().style,'decimal');
 }
});
test('locale placeholders retain cohort counts and session identity without English fallback',()=>{
 for(const code of expected){assert(message(code,'rankCounts',{a:19685,n:759819,ties:4615}).includes('19685'));assert(message(code,'matchTitle',{year:2022}).includes('2022'));assert(message(code,'support',{min:50,max:87}).includes('50–87'));assert(locales[code].text.usMissing.includes('127'));}
 assert.throws(()=>message('fr','unregistered'));assert.throws(()=>message('en','matchTitle'));
});
test('language changes cannot mutate numerical data, select scales, or submit scores',async()=>{
 const app=await readFile(new URL('../src/app.mjs',import.meta.url),'utf8'),html=await readFile(new URL('../src/index.html',import.meta.url),'utf8');
 assert(html.includes('<select id="language"'));assert(app.includes("document.documentElement.dir=locales[language].dir"));assert(app.includes("searchParams.set('lang',language)"));assert(!/localStorage|sessionStorage|navigator\.sendBeacon/.test(app));assert.equal((app.match(/fetch\(/g)||[]).length,1);assert(!app.includes('data.references='));assert(app.includes('lang="en" dir="ltr"'));assert(html.includes('data-t="notes"'));
});
