"""Bounded source registration. Preserve CMS state, template IDs and access controls."""
from pathlib import Path
import hashlib,json,shutil
APP=Path(__file__).resolve().parents[1]
SITE=Path('C:/Users/admin/OneDrive/Bureau/1_JOINT_WORKSPACE/personal_website/site')
LEDGER=SITE.parent/'contributions-ledger'
CHECK=APP/'checks'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def put(p,s):p.write_text(s,encoding='utf8')
def main():
    assert (APP/'checks/COMPUTATIONAL_VALIDATION.json').exists()
    before={str(p):sha(p) for p in [SITE/'content/model.json',SITE/'cloudflare/worker.mjs',SITE/'cloudflare/wrangler.jsonc',SITE/'src/security.js',SITE/'src/content-corrections.js']}
    for p in [SITE/'src/contributions.js',SITE/'src/worker.js',LEDGER/'render-locales.mjs',LEDGER/'build.mjs',LEDGER/'tests/release.test.mjs',LEDGER/'src/index.html']:
        backup=CHECK/'website-originals'/p.relative_to(SITE.parent);backup.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,backup)
    p=SITE/'src/contributions.js';s=p.read_text(encoding='utf8')
    assert 'registeredResearchToolCard' not in s
    s+='''
// Source-owned registration for the authorized public research app. Existing
// editable CMS entries and their IDs are preserved; no baseline reseed is used.
export function registeredResearchToolCard(section){
 if(section.id!=='/published-work/block-1')return '';
 return '<article class="research-card software-card" data-tool="exetatgpa"><div class="card-body"><p class="category">Research tool · Education</p><h3><a href="https://github.com/eliakim-k/ExetatGPA">ExetatGPA</a></h3><p>EXETAT cohort standing and eight named reference scales, with bounds for unpublished scores.</p></div><a class="text-link" href="https://github.com/eliakim-k/ExetatGPA">View on GitHub</a><a class="text-link" href="https://contributions-ledger.org/tools/exetatgpa/">Open calculator</a></article>';
}
''';put(p,s)
    p=SITE/'src/worker.js';s=p.read_text(encoding='utf8');s=s.replace('contributionEntry,contributionCard,contributionDetail}', 'contributionEntry,contributionCard,contributionDetail,registeredResearchToolCard}')
    needle="}).join('');}\nasync function api";assert s.count(needle)==1;s=s.replace(needle,"}).join('')+registeredResearchToolCard(section);}\nasync function api");put(p,s)
    put(SITE/'tests/exetatgpa-integration.test.mjs','''import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {registeredResearchToolCard} from '../src/contributions.js';
test('ExetatGPA is registered only in Research tools without editing saved content',()=>{const section={id:'/published-work/block-1'},doc={'/published-work/block-1':[{id:'owner-edit',values:{f1:'Owner text'}}]},original=structuredClone(doc);const h=registeredResearchToolCard(section);assert(h.includes('data-tool="exetatgpa"'));assert(h.includes('https://github.com/eliakim-k/ExetatGPA'));assert.equal((h.match(/<article/g)||[]).length,1);assert.equal(registeredResearchToolCard({id:'/awards/block-0'}),'');assert.deepEqual(doc,original);});
test('collection rendering appends the registration to the unchanged CMS rendering',async()=>{const s=await readFile('src/worker.js','utf8');assert(s.includes("}).join('')+registeredResearchToolCard(section)"));assert(s.includes('contributionCard(item,route)'));assert(s.includes('preview?s.draft:s.published'));});
''')
    appdest=LEDGER/'research-tools/exetatgpa';appdest.mkdir(parents=True,exist_ok=True)
    for p in (APP/'dist').rglob('*'):
        if p.is_file() and p.name!='_headers':dest=appdest/p.relative_to(APP/'dist');dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dest)
    p=LEDGER/'render-locales.mjs';s=p.read_text(encoding='utf8');assert 'toolText' not in s
    s=s.replace("export async function renderLocales",'''const toolText={en:['Research tools','ExetatGPA','Interpret EXETAT cohort standing through eight named reference scales. Official scores are retained and unpublished-score bounds are shown.','Open ExetatGPA'],ja:['研究ツール','ExetatGPA','EXETATの公式得点を保持し、回収された公表合格者群における位置を8つの参照尺度と比較します。未公表得点による範囲も示されます。','ExetatGPAを開く'],zh:['研究工具','ExetatGPA','保留EXETAT官方分数，将其在已恢复公布的合格考生成绩中的位置与八个指定参考尺度进行比较，并显示未公布成绩的界限。','打开ExetatGPA'],ko:['연구 도구','ExetatGPA','EXETAT 공식 점수를 유지하고 복원된 공개 합격자 성적 내 위치를 여덟 개의 지정된 기준 척도와 비교합니다. 미공개 점수에 따른 범위도 표시됩니다.','ExetatGPA 열기'],fr:['Outils de recherche','ExetatGPA','Situez une note EXETAT dans sa cohorte récupérée et sur huit échelles de référence définies. La note officielle est conservée et les bornes liées aux notes non publiées sont présentées.','Ouvrir ExetatGPA']};
export async function renderLocales''')
    needle=" html=html.replace('class=\"wordmark\" href=\"/\"'";assert needle in s
    s=s.replace(needle,''' const tool=toolText[language.code];
 html=html.replace('<section id="about"','<section id="tools" class="section wrap" aria-labelledby="tools-title"><div class="section-heading"><p class="eyebrow">'+escape(tool[0])+'</p><h2 id="tools-title">'+escape(tool[1])+'</h2></div><div class="section-body"><p class="section-lead">'+escape(tool[2])+'</p><a class="text-link" href="/tools/exetatgpa/">'+escape(tool[3])+'</a></div></section><section id="about"');
 html=html.replace('</nav>','<a href="#tools">'+escape(tool[0])+'</a></nav>');
 html=html.replaceAll('https://eliakim-kambale.emk2025.chatgpt.site/','https://eliakimkambale.com/');
'''+needle);put(p,s)
    p=LEDGER/'build.mjs';s=p.read_text(encoding='utf8');needle="const manifest={built_at";assert needle in s
    s=s.replace(needle,"await cp(path.join(root,'research-tools/exetatgpa'),path.join(out,'tools/exetatgpa'),{recursive:true});\n"+needle)
    needle="/fonts/*\n  Cache-Control:";assert needle in s
    s=s.replace(needle,"/tools/exetatgpa/*\n  Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'\n/fonts/*\n  Cache-Control:")
    s=s.replace('No article, CMS, credential, or supplement files copied.','Authorized app and series assets only. No article, CMS, credential, or supplement files copied.');put(p,s)
    p=LEDGER/'tests/release.test.mjs';s=p.read_text(encoding='utf8');s=s.replace('https://eliakim-kambale.emk2025.chatgpt.site/','https://eliakimkambale.com/')
    needle="'robots.txt','styles.css'].sort()";assert needle in s
    s=s.replace(needle,"'robots.txt','styles.css','tools/exetatgpa/index.html','tools/exetatgpa/styles.css','tools/exetatgpa/app.mjs','tools/exetatgpa/engine.mjs','tools/exetatgpa/methods.html','tools/exetatgpa/data/app-data.json','tools/exetatgpa/data/PROVENANCE.json','tools/exetatgpa/data/annual_successful_score_histogram.csv','tools/exetatgpa/data/retained_target_distributions.csv','tools/exetatgpa/data/target_categories.csv','tools/exetatgpa/data/worked_profile_2023_score70.csv'].sort()")
    s+='''\ntest('authorized public tool has its own script policy, source data and link in every locale',async()=>{for(const lang of languages){const page=await readFile(path.join(root,lang.route,'index.html'),'utf8');assert(page.includes('href="/tools/exetatgpa/"'));assert(page.includes('id="tools"'));}const h=await readFile(path.join(root,'_headers'),'utf8');assert(h.includes("/tools/exetatgpa/*\\n  Content-Security-Policy: default-src 'none'; script-src 'self'"));const app=await readFile(path.join(root,'tools/exetatgpa/index.html'),'utf8');assert(app.includes('Official percentage'));assert(!app.includes('localStorage'));});\n''';put(p,s)
    after={p:sha(Path(p)) for p in before};assert before==after,'Protected source or model changed'
    record={'date':'2026-10-12 JST','status':'prepared_pending_checks_and_deployment','app_url':'https://contributions-ledger.org/tools/exetatgpa/','repository':'https://github.com/eliakim-k/ExetatGPA','cv_entry':'Contributions > Research tools','cms_policy':'Source-owned tool registration appended at render time; existing saved entries, template IDs, draft, publication and history are not modified. No baseline reseed or schema migration.','protected_files':before,'scope':'App and necessary aggregate inputs only. No manuscript or SI publication.'}
    put(SITE.parent/'EXETATGPA_INTEGRATION_20261012.json',json.dumps(record,indent=2)+'\n')
    put(CHECK/'WEBSITE_PREPARATION.json',json.dumps(record,indent=2)+'\n')
    print('Bounded app assets, five locale entries and CV tool registration prepared; protected source hashes unchanged.')
if __name__=='__main__':main()
