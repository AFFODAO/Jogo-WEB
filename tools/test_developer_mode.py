"""Test real developer UI, actual page reload and campaign regressions in a disposable copy."""
import base64,functools,hashlib,http.server,json,shutil,subprocess,sys,tempfile,threading,time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUTPUT=ROOT/'tests/developer-mode-results'

def map_hashes():
    return {p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in (ROOT/'src/maps').glob('*.js')}

def capture_ui(target):
    sys.path.insert(0,str(ROOT/'tests'))
    from chrome_cdp import CDP,page_endpoint,close_chrome
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    class Server(http.server.ThreadingHTTPServer):
        def handle_error(self,request,address):
            if not isinstance(sys.exception(),(ConnectionResetError,BrokenPipeError)):super().handle_error(request,address)
    server=Server(('127.0.0.1',0),functools.partial(Quiet,directory=str(target)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    profile=target/'ui-profile'
    process=subprocess.Popen(['C:/Program Files/Google/Chrome/Application/chrome.exe','--headless','--disable-gpu','--no-first-run','--remote-debugging-port=0',f'--user-data-dir={profile}','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    cdp=None;results=[]
    try:
        deadline=time.monotonic()+20
        while not (profile/'DevToolsActivePort').exists():
            if time.monotonic()>deadline:raise TimeoutError('UI Chrome failed to start')
            time.sleep(.1)
        cdp=CDP(page_endpoint(int((profile/'DevToolsActivePort').read_text().splitlines()[0])))
        def evaluate(code):
            value=cdp.call('Runtime.evaluate',{'expression':code,'returnByValue':True})
            if value.get('exceptionDetails'):raise AssertionError(value['exceptionDetails'])
            return value.get('result',{}).get('value')
        for w,h in [(1440,1000),(390,844),(844,390)]:
            cdp.call('Emulation.setDeviceMetricsOverride',{'width':w,'height':h,'deviceScaleFactor':1,'mobile':False})
            cdp.call('Page.navigate',{'url':f'http://127.0.0.1:{server.server_port}/index.html?ui={w}'})
            deadline=time.monotonic()+20
            while True:
                try:
                    if evaluate("document.getElementById('developerPhaseList')?.children.length===10&&!document.getElementById('settingsDialog').open"):break
                except RuntimeError:pass
                if time.monotonic()>deadline:raise TimeoutError('UI failed to load')
                time.sleep(.1)
            evaluate("document.getElementById('settingsButton').click();document.getElementById('developerModeToggle').click();document.getElementById('developerModeToggle').scrollIntoView({block:'center'})")
            for screen in ['settings','selector']:
                if screen=='selector':evaluate("document.getElementById('developerSelectPhase').click()")
                geometry=evaluate("""(()=>{const d=document.querySelector('dialog[open]'),r=d.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,modal:d.id,buttons:[...d.querySelectorAll('button')].filter(b=>!b.hidden).map(b=>({text:b.textContent,height:b.getBoundingClientRect().height}))};})()""")
                assert geometry['x']>=0 and geometry['y']>=0 and geometry['right']<=w+1 and geometry['bottom']<=h+1,geometry
                assert geometry['documentWidth']<=w+1,geometry
                assert all(b['height']>=44 for b in geometry['buttons']),geometry
                shot=cdp.call('Page.captureScreenshot',{'format':'png','captureBeyondViewport':False})
                filename=f'ui-{w}x{h}-{screen}.png';(OUTPUT/filename).write_bytes(base64.b64decode(shot['data']))
                results.append({'viewport':[w,h],'screen':screen,'geometry':geometry,'capture':filename})
            evaluate("document.getElementById('developerPanelBack').scrollIntoView({block:'center'});document.getElementById('developerPanelBack').click()")
            deadline=time.monotonic()+2
            while not evaluate("document.getElementById('settingsDialog').open"):
                if time.monotonic()>deadline:raise AssertionError('back did not restore settings')
                time.sleep(.05)
        (OUTPUT/'ui.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    finally:
        close_chrome(process,cdp);server.shutdown();server.server_close()

def main():
    OUTPUT.mkdir(exist_ok=True);before=map_hashes();records=[]
    with tempfile.TemporaryDirectory(prefix='byte-developer-mode-') as folder:
        target=Path(folder)
        for name in ['index.html','style.css','game.js','README.md']:shutil.copy2(ROOT/name,target/name)
        for name in ['src','assets','tests','tools']:shutil.copytree(ROOT/name,target/name,ignore=shutil.ignore_patterns('__pycache__','*-results','rebuild-v3-baseline','rebuild-v3-architecture'))
        helpers=(ROOT/'tests/repairs.js').read_text(encoding='utf-8').split("test('repairs:",1)[0]
        (target/'tests/parallax-identity.js').write_text(helpers+(ROOT/'tests/developer-mode.js').read_text(encoding='utf-8'),encoding='utf-8')
        # A real reload invalidates an in-flight evaluation; keep polling the new
        # document rather than treating this expected CDP response as a game error.
        runner=target/'tests/run_review.py';source=runner.read_text(encoding='utf-8')
        line=next(line for line in source.splitlines() if "result=cdp.call('Runtime.evaluate'" in line)
        replacement="            try:\n    "+line+"\n            except RuntimeError as error:\n                if any(message in str(error) for message in ['navigated or closed','Cannot find context','Execution context was destroyed']):continue\n                raise"
        runner.write_text(source.replace(line,replacement,1),encoding='utf-8')
        capture_ui(target);print('PASS desktop, portrait and landscape developer UI',flush=True)
        commands=[['tests/run_review.py','--identity-phase','1','--result-label','developer-mode']]
        if '--full' in sys.argv:commands.extend([[f'tools/{name}.py'] for name in ['check_maps','check_environment','check_parallax','check_generation']]+[['tests/run_review.py']])
        for args in commands:
            result=subprocess.run([sys.executable,'-X','utf8',*args],cwd=target,capture_output=True,text=True,encoding='utf-8')
            records.append({'command':['python',*args],'returncode':result.returncode,'stdout':result.stdout,'stderr':result.stderr})
            reportfile=target/'tests'/('review-results.json' if args==['tests/run_review.py'] else 'developer-mode-results.json')
            if reportfile.exists():shutil.copy2(reportfile,OUTPUT/('regression.json' if args==['tests/run_review.py'] else 'developer.json'))
            (OUTPUT/'execution.json').write_text(json.dumps({'commands':records,'mapsBefore':before,'mapsAfter':map_hashes(),'mapsUnchanged':before==map_hashes()},ensure_ascii=False,indent=2),encoding='utf-8')
            print('PASS' if result.returncode==0 else 'FAIL',' '.join(args),flush=True)
            if result.returncode:
                if reportfile.exists():
                    report=json.loads(reportfile.read_text(encoding='utf-8'));print({k:v for k,v in report.get('systems',{}).items() if v!='PASS'});print('runtime',report.get('errors'))
                print(result.stdout[-1600:],result.stderr[-2500:]);raise SystemExit(result.returncode)
    assert before==map_hashes(),'a map changed during developer implementation tests'

if __name__=='__main__':main()
