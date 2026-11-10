"""Wifi V3 validation in a disposable checkout; no player storage or old reports changed."""
import hashlib,json,shutil,subprocess,sys,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'tests/wifi-v3-results'
def hashes():
    paths=[ROOT/'game.js',*(ROOT/'src/maps').glob('*.js')]
    return {p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in paths if p.name!='05-wifi.js'}
def enrich():
    from analyze_rebuild_maps_v3 import metrics
    p=OUTPUT/'wifi.json'
    if not p.exists():return
    report=json.loads(p.read_text(encoding='utf-8'))
    if 'wifi' not in report:return
    s=report['wifi'];s['areaEstimates']=metrics(s,s['physics'])
    p.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
def main():
    OUTPUT.mkdir(exist_ok=True);before=hashes();history=OUTPUT/'execution.json';records=json.loads(history.read_text(encoding='utf-8')).get('commands',[]) if history.exists() else []
    with tempfile.TemporaryDirectory(prefix='byte-wifi-v3-') as folder:
        target=Path(folder)
        for name in ['index.html','style.css','game.js','README.md']:shutil.copy2(ROOT/name,target/name)
        for name in ['src','assets','tests','tools']:shutil.copytree(ROOT/name,target/name,ignore=shutil.ignore_patterns('__pycache__','rebuild-v3-baseline','rebuild-v3-architecture','*-results','wifi-v3-results'))
        # Fail fast on startup errors; the normal hook cannot run if a map throws.
        runner=target/'tests/run_review.py';text=runner.read_text(encoding='utf-8')
        marker='            if value:return json.loads(value)'
        failure="\n            failure=cdp.call('Runtime.evaluate',{'expression':'JSON.stringify(window.__reviewErrors || [])','returnByValue':True})\n            errors=json.loads(failure.get('result',{}).get('value','[]'))\n            if errors:return {'phases':[],'systems':{'browser runtime':'FAIL'},'errors':errors,'snapshots':[]}"
        assert marker in text;runner.write_text(text.replace(marker,marker+failure),encoding='utf-8')
        baseline=json.loads((ROOT/'tests/rebuild-v3-baseline/inventory.json').read_text(encoding='utf-8'))['inventory'][4]['definition']
        helpers=(ROOT/'tests/repairs.js').read_text(encoding='utf-8').split("test('repairs:",1)[0]
        (target/'tests/parallax-identity.js').write_text('const WIFI_V3_BASELINE='+json.dumps(baseline,ensure_ascii=True)+';\n'+helpers+(ROOT/'tests/wifi-v3.js').read_text(encoding='utf-8'),encoding='utf-8')
        commands=[['tests/run_review.py','--identity-phase','5','--result-label','wifi-v3']]
        if '--full' in sys.argv:commands.extend([[f'tools/{name}.py'] for name in ['check_maps','check_environment','check_parallax','check_generation']]+[['tests/run_review.py']])
        for args in commands:
            result=subprocess.run([sys.executable,'-X','utf8',*args],cwd=target,capture_output=True,text=True,encoding='utf-8');records.append({'command':['python',*args],'returncode':result.returncode,'stdout':result.stdout,'stderr':result.stderr})
            if '--identity-phase' in args and (target/'tests/wifi-v3-results.json').exists():shutil.copy2(target/'tests/wifi-v3-results.json',OUTPUT/'wifi.json');enrich()
            if args==['tests/run_review.py'] and (target/'tests/review-results.json').exists():shutil.copy2(target/'tests/review-results.json',OUTPUT/'regression.json')
            if result.returncode==0 and '--identity-phase' in args and '--write-fixture' in sys.argv:
                sources={}
                for name in ['src/maps/05-wifi.js']:
                    source=(ROOT/name).read_text(encoding='utf-8-sig').replace('\r\n','\n');assert source==(target/name).read_text(encoding='utf-8-sig').replace('\r\n','\n');sources[name]=hashlib.sha256(source.encode('utf-8')).hexdigest()
                fixture={'sources':sources,'definition':json.loads((OUTPUT/'wifi.json').read_text(encoding='utf-8'))['wifi']['definition'],'note':'Explicit Wifi V3 browser export; historical fixtures and Hardware unchanged.'}
                for root in [ROOT,target]:(root/'tests/fixtures/wifi-v3.json').write_text(json.dumps(fixture,ensure_ascii=False,indent=2),encoding='utf-8')
            for p in (target/'tests').glob('identity-phase-05-wifi-v3-*.png'):shutil.copy2(p,OUTPUT/p.name)
            history.write_text(json.dumps({'commands':records,'protectedBefore':before,'protectedAfter':hashes(),'protectedUnchanged':before==hashes()},ensure_ascii=False,indent=2),encoding='utf-8')
            print('PASS' if result.returncode==0 else 'FAIL',' '.join(args),flush=True)
            if result.returncode:
                if (OUTPUT/'wifi.json').exists():
                    report=json.loads((OUTPUT/'wifi.json').read_text(encoding='utf-8'));print({k:v for k,v in report['systems'].items() if v!='PASS'});print('runtime',report.get('errors'))
                print(result.stdout[-2000:],result.stderr[-3000:]);raise SystemExit(result.returncode)
    assert before==hashes(),'protected map/game file changed'
if __name__=='__main__':main()
