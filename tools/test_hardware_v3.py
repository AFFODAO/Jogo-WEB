"""Isolated real-browser Hardware V3 checks. Never rewrites old baseline reports."""
import hashlib,json,shutil,subprocess,sys,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'tests/hardware-v3-results'
def enrich_report():
    from analyze_rebuild_maps_v3 import metrics
    path=OUTPUT/'hardware.json'
    if not path.exists():return
    report=json.loads(path.read_text(encoding='utf-8'));hw=report['hardware']
    hw['areaEstimates']=metrics(hw,hw['physics'])
    hw['areaEstimates']['baselineRepairedCandidatePx2']=874140.81
    hw['areaEstimates']['candidateRatio']=hw['areaEstimates']['states']['repairedComponentsOnly']['candidateNavigationPx2']/874140.81
    path.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
def hashes():
    return {p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in (ROOT/'src/maps').glob('*.js') if p.name!='01-hardware.js'}
def main():
    before=hashes();OUTPUT.mkdir(exist_ok=True)
    history=OUTPUT/'execution.json';records=json.loads(history.read_text(encoding='utf-8')).get('commands',[]) if history.exists() else []
    with tempfile.TemporaryDirectory(prefix='byte-hardware-v3-') as folder:
        target=Path(folder)
        for name in ['index.html','game.js','style.css','README.md']:shutil.copy2(ROOT/name,target/name)
        for name in ['src','assets','tests','tools']:shutil.copytree(ROOT/name,target/name,ignore=shutil.ignore_patterns('__pycache__','rebuild-v3-architecture','hardware-v3-results'))
        helpers=(ROOT/'tests/repairs.js').read_text(encoding='utf-8').split("test('repairs:",1)[0]
        baseline=json.loads((ROOT/'tests/rebuild-v3-baseline/inventory.json').read_text(encoding='utf-8'))['inventory'][0]['definition']
        prefix='const HARDWARE_V3_BASELINE='+json.dumps(baseline,ensure_ascii=True)+';\n'
        (target/'tests/parallax-identity.js').write_text(prefix+helpers+(ROOT/'tests/hardware-v3.js').read_text(encoding='utf-8'),encoding='utf-8')
        commands=[['tests/run_review.py','--identity-phase','1','--result-label','hardware-v3']]
        if '--full' in sys.argv:commands.extend([[f'tools/{name}.py'] for name in ['check_maps','check_environment','check_parallax','check_generation']]+[['tests/run_review.py']])
        for args in commands:
            result=subprocess.run([sys.executable,'-X','utf8',*args],cwd=target,capture_output=True,text=True,encoding='utf-8')
            records.append({'command':['python',*args],'returncode':result.returncode,'stdout':result.stdout,'stderr':result.stderr})
            for source,name in [('hardware-v3-results.json','hardware.json'),('review-results.json','regression.json')]:
                if source=='review-results.json' and args!=['tests/run_review.py']:continue
                if (target/'tests'/source).exists():shutil.copy2(target/'tests'/source,OUTPUT/name)
            enrich_report()
            if result.returncode==0 and '--identity-phase' in args and '--write-fixture' in sys.argv:
                phase=json.loads((OUTPUT/'hardware.json').read_text(encoding='utf-8'))['hardware']['definition']
                source=(ROOT/'src/maps/01-hardware.js').read_text(encoding='utf-8-sig').replace('\r\n','\n')
                assert source==(target/'src/maps/01-hardware.js').read_text(encoding='utf-8-sig').replace('\r\n','\n'),'source changed during browser export'
                fixture={'sourceSha256':hashlib.sha256(source.encode('utf-8')).hexdigest(),'definition':phase,'note':'Explicit browser export after Hardware V3 checks. Historical fixtures unchanged.'}
                for root in [ROOT,target]:(root/'tests/fixtures/hardware-v3.json').write_text(json.dumps(fixture,ensure_ascii=False,indent=2),encoding='utf-8')
            for p in (target/'tests').glob('identity-phase-01-v3-*.png'):shutil.copy2(p,OUTPUT/p.name)
            (OUTPUT/'execution.json').write_text(json.dumps({'commands':records,'otherMapsBefore':before,'otherMapsAfter':hashes(),'otherMapsUnchanged':before==hashes()},ensure_ascii=False,indent=2),encoding='utf-8')
            print('PASS' if result.returncode==0 else 'FAIL',' '.join(args),flush=True)
            if result.returncode:print(result.stdout[-16000:],result.stderr[-3000:]);raise SystemExit(result.returncode)
    enrich_report()
    assert before==hashes(),'other maps changed'
if __name__=='__main__':main()
