from pathlib import Path
P=Path('C:/Users/admin/OneDrive/Bureau/1_JOINT_WORKSPACE/personal_website/contributions-ledger')
p=P/'build.mjs';s=p.read_text(encoding='utf8')
policy="default-src 'none'; style-src 'self'; font-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
needle="await writeFile(path.join(out,'_headers'),`/*\n  Content-Security-Policy: "+policy+'\n'
assert needle in s
replacement="const seriesPolicy="+repr(policy)+";\nconst seriesPaths=['/','/index.html','/en/*','/ja/*','/fr/*','/zh/*','/ko/*','/404.html','/styles.css','/favicon.svg','/robots.txt','/licenses/*'];\nconst seriesRules=seriesPaths.map(p=>p+'\\n  Content-Security-Policy: '+seriesPolicy+'\\n').join('');\nawait writeFile(path.join(out,'_headers'),`/*\n"
s=s.replace(needle,replacement).replace("/tools/exetatgpa/*\n  Content-Security-Policy:","${seriesRules}/tools/exetatgpa/*\n  Content-Security-Policy:").replace("/fonts/*\n  Cache-Control:","/fonts/*\n  Content-Security-Policy: ${seriesPolicy}\n  Cache-Control:")
p.write_text(s,encoding='utf8')
p=P/'tests/release.test.mjs';s=p.read_text(encoding='utf8');s+='''
test('CSP rules never combine the script-free series policy with the calculator policy',async()=>{const h=await readFile(path.join(root,'_headers'),'utf8'),rules=[];let current;for(const line of h.split('\\n')){if(line&&!line.startsWith(' ')){current={path:line,policy:[]};rules.push(current);}else if(line.trim().startsWith('Content-Security-Policy:'))current.policy.push(line.trim().slice(24).trim());}const matches=(pattern,p)=>pattern.includes('*')?p.startsWith(pattern.split('*')[0]):pattern===p;for(const p of ['/','/en/','/fr/index.html','/ja/','/zh/','/ko/','/404.html','/tools/exetatgpa/','/tools/exetatgpa/app.mjs','/tools/exetatgpa/data/app-data.json']){const csp=rules.filter(r=>matches(r.path,p)).flatMap(r=>r.policy);assert.equal(csp.length,1,p);assert.equal(csp[0].includes("script-src 'self'"),p.startsWith('/tools/exetatgpa/'),p);}});
''';p.write_text(s,encoding='utf8')
print('Non-overlapping explicit CSP policies prepared for every series and app asset route.')
