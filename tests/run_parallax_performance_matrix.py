"""Run resolution/DPR workloads sequentially; retain frame-budget failures."""
import json,subprocess,sys
from pathlib import Path
from chrome_cdp import source_fingerprint

ROOT=Path(__file__).resolve().parents[1]
CASES=[('desktop',[]),('mobile',['--viewport','480x800','--dpr','1']),('retina',['--viewport','1920x1080','--dpr','2'])]

def main():
    fingerprint=source_fingerprint(ROOT);rows=[]
    for label,extra in CASES:
        print('Benchmark '+label,flush=True);result_label='parallax-final-'+label+'-performance'
        result=None if '--pacing-only' in sys.argv else subprocess.run([sys.executable,str(ROOT/'tests/run_review.py'),'--performance-only','--result-label',result_label,*extra],cwd=ROOT,stdout=subprocess.DEVNULL)
        report=json.loads((ROOT/f'tests/{result_label}-results.json').read_text(encoding='utf-8'))
        assert report['execution']['sourceSha256']==fingerprint and not report['errors'],'source/runtime mismatch'
        failures={k:v for k,v in report['systems'].items() if v!='PASS'}
        assert all(k.startswith('performance: local 60Hz frame budget') for k in failures),'non-budget performance regression'
        assert len(report['performance'])==11 and (result is None or result.returncode==(1 if failures else 0)),'incomplete benchmark'
        row={'case':label,'report':f'tests/{result_label}-results.json','budgetFailures':failures,'conditions':report['performanceConditions'],'performance':report['performance']};rows.append(row)
        print(f'{label}: {11-len(failures)}/11 frame budgets; 11/11 bounded terrain caches; '+str(report['performanceConditions']['viewport'])+', DPR '+str(report['performanceConditions']['dpr']),flush=True)
        pacing_label='parallax-final-'+label+'-pacing'
        subprocess.run([sys.executable,str(ROOT/'tests/run_review.py'),'--frame-pacing','--result-label',pacing_label,*extra],cwd=ROOT,check=True,stdout=subprocess.DEVNULL)
        pacing=json.loads((ROOT/f'tests/{pacing_label}-results.json').read_text(encoding='utf-8'))
        assert pacing['execution']['sourceSha256']==fingerprint and not pacing['errors'],'pacing source/runtime mismatch'
        row['framePacingReport']=f'tests/{pacing_label}-results.json';row['framePacing']=pacing['framePacing']
        print(label+' native RAF FPS: '+str([round(r['observedFPS'],1) for r in pacing['framePacing']]),flush=True)
    result={'sourceSha256':fingerprint,'cases':rows,'certifies60FPS':False,'note':'Frame-budget failures are retained; script success means measurement completed without runtime/cache/source failures.'}
    (ROOT/'tests/parallax-final-performance-matrix.json').write_text(json.dumps(result,indent=2),encoding='utf-8');print('Saved performance matrix',flush=True)

if __name__=='__main__':main()
