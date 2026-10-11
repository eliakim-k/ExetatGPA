"""Retain only aggregate app inputs and numerical verification fixtures."""
from pathlib import Path
import csv, json, hashlib, shutil, ast

APP=Path(__file__).resolve().parents[1]
ROOT=APP.parents[1]
UNITS=ROOT/'submission_v0/04_work_units'
W145=UNITS/'W145_us_gpa_category_reference'
W034=UNITS/'W034_multi_reference_public_score_projections'
def read(p):
    with p.open(encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def main():
    receipt=json.loads((APP/'checks/OPTION_IDENTITY_PREFLIGHT.json').read_text(encoding='utf-8-sig'))
    assert receipt['status']=='PASS' and receipt['mode']=='not_used'
    manifest=json.loads((W145/'inputs/INPUT_MANIFEST.json').read_text())
    for x in manifest['inputs']:assert sha(W145/x['path'])==x['sha256'],x['path']
    sources={
      'annual_successful_score_histogram.csv':UNITS/'W016_published_score_inflation/intermediate/annual_successful_score_histogram.csv',
      'retained_target_distributions.csv':W145/'inputs/retained_target_distributions.csv',
      'target_categories.csv':W145/'intermediate/target_categories.csv',
      'worked_profile_2023_score70.csv':W145/'outputs/worked_profile_2023_score70.csv',
    }
    records=[]
    for name,p in sources.items():
        dest=APP/'data'/name;dest.parent.mkdir(exist_ok=True);shutil.copyfile(p,dest)
        records.append({'path':'data/'+name,'source':p.relative_to(ROOT).as_posix(),'sha256':sha(p)})
    sessions={}
    for row in read(sources['annual_successful_score_histogram.csv']):
        sessions.setdefault(row['year'],{'histogram':[]})['histogram'].append([int(row['score']),int(row['count'])])
    diagnostics=read(W145/'inputs/session_score_diagnostics.csv')
    for year,s in sessions.items():
        r=next(x for x in diagnostics if x['year']==year)
        s['participants']=int(r['participants']);s['unpublished']=int(r['unobserved_scores'])
        s['histogram'].sort();assert sum(n for _,n in s['histogram'])==int(r['known_exact_successful_scores'])
    provenance=read(W034/'outputs/source_and_mapping_provenance.csv')
    # URL constants are read as literal metadata, without executing the producer.
    tree=ast.parse((W034/'scripts/build_w034.py').read_text())
    urls=next(ast.literal_eval(n.value) for n in tree.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='SOURCE_URLS' for t in n.targets))
    refs={}
    for r in read(sources['retained_target_distributions.csv']):
        if not r['reference_id']:continue
        obj=refs.setdefault(r['reference_id'],{'id':r['reference_id'],'country':r['country'],'population':r['population'],'scale':r['scale'],'values':[]})
        obj['values'].append([float(r['source_value']),float(r['count_or_weight'])])
    lookup=read(W145/'outputs/non_us_projections_unchanged.csv')
    for id,r in refs.items():
        x=next(x for x in lookup if x['reference_id']==id);r['label']=x['reference_label'];r['values'].sort()
        r['precision']=int(x['precision']);r['rule']='linear_frequency_interpolation' if r['country']=='France' else 'lower_is_better_step' if r['country']=='Germany' else 'empirical_step'
        pr=next(x for x in provenance if x['layer']==r['country']+' target')
        r['limitation']=pr['limitation'];r['source_sha256']=pr['source_sha256'];r['source_url']=urls[Path(pr['source_path']).name]
    us={'id':'us_2016_sat_reported_gpa_categories','country':'United States','label':'2016 pre-March SAT reported high-school GPA categories','population':'Graduating seniors tested through January 2016, with a reported GPA category; latest questionnaire response, each student counted once','scale':'Reported categories: A+, A, A-minus, B, C, D/E/F','rule':'exact_cumulative_best_category','categories':[[x['category'],int(x['count'])] for x in read(sources['target_categories.csv'])],'missing':127457,'source_url':'https://reports.collegeboard.org/media/pdf/2016-total-group-sat-suite-assessments-annual-report.pdf','source_sha256':next(x['sha256'] for x in manifest['inputs'] if x['path'].endswith('.pdf')),'limitation':'Optional reported GPA categories among SAT-taking graduates, not all US students. No numerical GPA is interpolated. Target nonresponses are bounded separately.'}
    order=['United States','France','Japan','South Korea','United Kingdom','Germany','Türkiye','South Africa']
    allrefs=[us]+list(refs.values());allrefs.sort(key=lambda r:order.index(r['country']))
    dump(APP/'data/app-data.json',{'version':'1.0.0','sessions':sessions,'references':allrefs,'unavailable':['Canada','China','India','Brazil','New Zealand']})
    records.extend({'source':p.relative_to(ROOT).as_posix(),'sha256':sha(p),'role':role} for p,role in [(W145/'inputs/session_score_diagnostics.csv','Aggregate participant and unpublished counts'),(ROOT/'submission_v1/claims/C79/VERDICT.json','Approved eight-reference scientific interpretation'),(ROOT/'project_records/claim_history/C79_W145_COMPOSITE_SCIENTIFIC_APPROVAL_2026-10-03.json','Scientific approval'),(ROOT/'project_records/delegated_draft_campaign/2026-10-07/EXETATGPA_APP_THREAD_20261012/TASK_BRIEF.json','Implementation and publication authorization')])
    dump(APP/'data/PROVENANCE.json',{'inputs':records,'reference_sources':[{'reference':r['label'],'url':r['source_url'],'sha256':r['source_sha256'],'rule':r['rule']} for r in allrefs],'publication_scope':'Aggregate score counts, retained reference distributions and app source only. No person-level records or manuscript/SI drafts.'})
    # Retained results are fixtures, never the calculation engine.
    dump(APP/'tests/retained-results.json',{'us':read(W145/'outputs/us_category_projections.csv'),'nonUS':lookup,'sessions':read(UNITS/'W016_published_score_inflation/outputs/session_pair_conversions.csv')})
    dump(APP/'checks/INPUT_EXPORT.json',{'status':'PASS','sessions':len(sessions),'supported_pairs':sum(len(s['histogram']) for s in sessions.values()),'references':len(allrefs),'data_sha256':sha(APP/'data/app-data.json'),'input_manifest_sha256':sha(W145/'inputs/INPUT_MANIFEST.json')})
    print('Retained aggregate inputs and verification fixtures, with source hashes.')
if __name__=='__main__':main()
