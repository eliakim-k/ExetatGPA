import {position,referenceResults,sessionMatch,format} from './engine.mjs';
import {locales,message,languageOrder} from './locales.mjs';
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const requested=new URL(location.href).searchParams.get('lang');
let data,language=Object.hasOwn(locales,requested)?requested:'en';
const t=(k,args)=>message(language,k,args),n=x=>new Intl.NumberFormat(language).format(x),dec=(x,d=2)=>new Intl.NumberFormat(language,{minimumFractionDigits:d,maximumFractionDigits:d}).format(x),pct=x=>dec(100*x),num=s=>`<bdi dir="ltr">${esc(s)}</bdi>`;
const countryIndex={'United States':0,'France':1,'Japan':2,'South Korea':3,'United Kingdom':4,'Germany':5,'Türkiye':6,'South Africa':7};
const display=(ref,x)=>format(ref,x)==='Not passed'?t('notPassed'):format(ref,x);
function support(){const s=data.sessions[$('year').value];$('support').textContent=t('support',{min:s.histogram[0][0],max:s.histogram.at(-1)[0]});}
function render(){
 support();const p=position(data,$('year').value,$('score').value);
 if(!p){$('results').innerHTML=`<section class="error"><h2>${esc(t('errorTitle'))}</h2><p>${esc(t('errorInput'))}</p></section>`;return;}
 const target=Number($('target-year').value),match=sessionMatch(data,p,target),refs=referenceResults(data,p);
 let html=`<section class="rank-card"><p class="step">${esc(t('cohort'))}</p><div class="rank-header"><p class="rank-value">${esc(t('top'))} ${num(pct(p.p)+'%')}</p><p class="official">${num(p.score+'% · EXETAT '+p.year)}<br>${esc(t('retained'))}</p></div><p class="rank-description">${esc(t('rankDescription'))}</p><p class="rank-details">${esc(t('rankCounts',{a:n(p.a),n:n(p.n),ties:n(p.ties)}))}</p></section>`;
 html+=`<section class="session-card"><h2>${esc(t('matchTitle',{year:target}))}</h2><p class="session-value">${match===null?esc(t('unavailable')):num(dec(match)+'%')}</p><p>${esc(t(match===null?'noExtrap':'matchDescription'))}</p></section>`;
 html+=`<div class="reference-heading"><h2>${esc(t('refs'))}</h2><a href="methods.html">${esc(t('rules'))}</a></div><div class="references">`;
 for(const r of refs){const ref=r.ref,us=ref.country==='United States',strong=display(ref,r.strong),weak=display(ref,r.weak),range=us?`${num(weak)} ${esc(t('to'))} ${num(strong)}`:`${num(display(ref,r.rangeLow))} ${esc(t('to'))} ${num(display(ref,r.rangeHigh))}`;
 html+=`<article class="reference"><h3>${esc(locales[language].countries[countryIndex[ref.country]])}</h3><p class="ref-label" lang="en" dir="ltr">${esc(ref.label)}</p><p class="value">${num(display(ref,r.point))}</p>${ref.country==='South Korea'?`<p class="category">${esc(t('mathGrade'))} ${r.point>=133?1:r.point>=126?2:r.point>=118?3:r.point>=107?4:r.point>=94?5:r.point>=80?6:r.point>=74?7:r.point>=70?8:9}</p>`:''}<p class="ref-range"><strong>${esc(t('bounds'))}</strong>${range}</p>${us?`<p class="ref-note">${esc(t('combined'))}: ${num(r.combinedWeak)} ${esc(t('to'))} ${num(r.combinedStrong)}.</p>`:''}<details><summary>${esc(t('details'))}</summary><div lang="en" dir="ltr"><p>${esc(ref.population)}.</p><p>${esc(ref.scale)}.</p><p>${esc(ref.limitation)}</p></div>${us?`<p>${esc(t('usTarget'))}: ${num(r.targetWeak)} ${esc(t('to'))} ${num(r.targetStrong)}. ${esc(t('usMissing'))}</p>`:''}<a href="${esc(ref.source_url)}" target="_blank" rel="noopener noreferrer">${esc(t('source'))}</a></details></article>`;
 }html+='</div>';
 html+=`<section class="uncertainty"><h2>${esc(t('uncertaintyTitle'))}</h2><p class="interval">${num(pct(p.low)+'%')} ${esc(t('to'))} ${num(pct(p.high)+'%')}</p><p>${esc(t('uncertaintyDescription'))}</p><p>${num(n(p.N))} ${esc(t('participants'))} · ${num(n(p.U))} ${esc(t('unknownScores'))}.</p><p>${esc(t('uncertaintyLimits'))}</p></section><p class="unavailable">${esc(t('noReference'))}</p>`;
 $('results').innerHTML=html;
}
function translate(){
 document.documentElement.lang=language;document.documentElement.dir=locales[language].dir;
 document.querySelectorAll('[data-t]').forEach(el=>{if(el.dataset.t==='version'){el.textContent='1.1.0';return;}el.textContent=t(el.dataset.t);});
 $('language').value=language;$('language').setAttribute('aria-label',t('language'));
 document.title='ExetatGPA | '+t('title').replace('\n',' ');
 if(data)render();
}
for(const code of languageOrder){const l=locales[code],option=document.createElement('option');option.value=code;option.lang=code;option.dir=l.dir;option.textContent=l.name;$('language').append(option);}
$('language').addEventListener('change',()=>{language=$('language').value;const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);translate();});
$('calculator').addEventListener('submit',e=>{e.preventDefault();render();});
function example(year,score,target){$('year').value=year;$('score').value=score;$('target-year').value=target;render();}
$('example-profile').addEventListener('click',()=>example(2023,70,2022));$('example-session').addEventListener('click',()=>example(2021,59,2022));
translate();
try{const response=await fetch('data/app-data.json');if(!response.ok)throw Error('Data unavailable');data=await response.json();for(const year of Object.keys(data.sessions)){for(const id of ['year','target-year']){const option=document.createElement('option');option.value=year;option.textContent=year;$(id).append(option);}}$('year').value='2023';$('target-year').value='2022';$('year').addEventListener('change',support);render();}catch{$('results').innerHTML=`<section class="error"><h2>${esc(t('errorTitle'))}</h2><p>${esc(t('errorReload'))}</p></section>`;}
