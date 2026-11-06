"""Run the real game in headless Chrome, with isolated storage and test instrumentation."""
import json
import re
import subprocess
import tempfile
import base64
import sys
import shutil
import http.server
import threading
import functools
import datetime
import time
from pathlib import Path
from html import unescape
from chrome_cdp import source_fingerprint,CDP,page_endpoint,close_chrome

ROOT = Path(__file__).resolve().parents[1]
CHROME = Path('C:/Program Files/Google/Chrome/Application/chrome.exe')
def run_page(target,url):
    """Use real browser time: virtual-time dump-dom can stall PNG image onload."""
    profile=target/'profile'
    process=subprocess.Popen([str(CHROME),'--headless','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=0',f'--user-data-dir={profile}','--window-size=1440,1000','about:blank'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    cdp=None
    try:
        deadline=time.monotonic()+20;portfile=profile/'DevToolsActivePort'
        while True:
            if time.monotonic()>deadline or process.poll() is not None:raise RuntimeError('Chrome debugger did not start')
            try:
                debug_port=int(portfile.read_text().splitlines()[0]);break
            except (OSError,ValueError,IndexError):time.sleep(.1)
        cdp=CDP(page_endpoint(debug_port))
        cdp.call('Page.enable');cdp.call('Page.navigate',{'url':url});deadline=time.monotonic()+600
        while time.monotonic()<deadline:
            result=cdp.call('Runtime.evaluate',{'expression':'document.getElementById("review-result")?.textContent || null','returnByValue':True},timeout=600)
            value=result.get('result',{}).get('value')
            if value:return json.loads(value)
            time.sleep(.1)
        raise TimeoutError('Review page did not finish')
    finally:
        close_chrome(process,cdp)

def capture_structures(profile):
    result=subprocess.run([str(CHROME),'--headless','--disable-gpu','--hide-scrollbars',f'--user-data-dir={profile}','--window-size=1600,2850',f'--screenshot={ROOT / "tests/structures-contact.png"}',(ROOT/'tests/structures.html').as_uri()],capture_output=True,timeout=45)
    if result.returncode or not (ROOT/'tests/structures-contact.png').exists():raise RuntimeError('Failed geometry contact sheet')

def main():
    if '--capture-structures' in sys.argv:
        with tempfile.TemporaryDirectory(prefix='byte-structure-contact-') as folder:capture_structures(Path(folder)/'profile')
        print('Captured tests/structures-contact.png');return
    source_hash=source_fingerprint(ROOT)
    source = (ROOT / 'game.js').read_text(encoding='utf-8-sig')
    hook = (ROOT / 'tests/review.js').read_text(encoding='utf-8')
    final_phase=int(sys.argv[sys.argv.index('--final-phase')+1]) if '--final-phase' in sys.argv else None
    focused='profile-render' if '--profile-render' in sys.argv else 'final-performance' if '--performance-only' in sys.argv else 'final-regressions' if '--final-regressions' in sys.argv else 'map-debug' if '--debug-only' in sys.argv else 'final-maps' if final_phase is not None else 'gameplay-demo' if '--gameplay-demo' in sys.argv else 'room-gameplay' if '--room-gameplay' in sys.argv else 'environment-art' if '--environment-only' in sys.argv or '--environment-hardware' in sys.argv else 'infrastructure-generation' if '--infrastructure-generation' in sys.argv else 'campaign-generation' if '--campaign-generation' in sys.argv else 'pixelart' if '--pixel-only' in sys.argv else 'generation' if '--generation-only' in sys.argv else 'procedural' if '--procedural-only' in sys.argv else 'procedural-demo' if '--procedural-demo' in sys.argv else 'parkour' if '--parkour-only' in sys.argv else None
    if final_phase is not None:assert 1<=final_phase<=10
    phase_number=int(sys.argv[sys.argv.index('--phase')+1]) if '--phase' in sys.argv else None
    if phase_number is not None:
        assert 1<=phase_number<=10
        focused='phase-%02d'%phase_number
        hook=hook[:hook.index("test('skills and pending choice'")]
        repair_helpers=(ROOT/'tests/repairs.js').read_text(encoding='utf-8').split("test('repairs:",1)[0]
        hook=repair_helpers+hook
        hook=hook.replace('for(let i=0;i<10;i++) {',f'for(let i={phase_number-1};i<{phase_number};i++) {{')
        hook+='\nreport.errors=window.__reviewErrors;const output=document.createElement("pre");output.id="review-result";output.textContent=JSON.stringify(report);document.body.replaceChildren(output);'
    elif focused:
        hook=hook[:hook.index('for(let i=0;i<10;i++) {')]+(ROOT/('tests/'+focused+'.js')).read_text(encoding='utf-8')+'\nawait new Promise(resolve=>setTimeout(resolve,0));\nreport.errors=window.__reviewErrors;const output=document.createElement("pre");output.id="review-result";output.textContent=JSON.stringify(report);document.body.replaceChildren(output);'
    if focused in ['room-gameplay','gameplay-demo','final-maps']:
        hook=(ROOT/'tests/repairs.js').read_text(encoding='utf-8').split("test('repairs:",1)[0]+hook
    architecture = (ROOT/'tests/architecture.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/first-five.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/last-five.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/enemies.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/art.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/repairs.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/experience.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/audit.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/pixelart.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/generation.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/procedural.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/parkour.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/campaign-generation.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/infrastructure-generation.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/environment-art.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/room-gameplay.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/map-debug.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/final-regressions.js').read_text(encoding='utf-8')
    baseline = (ROOT/'tests/map-baseline.json').read_text(encoding='utf-8')
    fixture = (ROOT/'tests/fixtures/room-map.json').read_text(encoding='utf-8')
    first_five = (ROOT/'tests/fixtures/first-five-v2.json').read_text(encoding='utf-8')
    final_marker='await new Promise(resolve=>setTimeout(resolve,0));'
    last_five=(ROOT/'tests/fixtures/last-five-v2.json').read_text(encoding='utf-8')
    hook = 'const LAST_FIVE_V2='+last_five+';\nconst FIRST_FIVE_V2='+first_five+';\nconst MAP_BASELINE='+baseline+';\nconst ARCHITECTURE_FIXTURE='+fixture+';\n'+hook.replace(final_marker,('' if focused else architecture+'\n')+final_marker,1)
    hook = 'const FINAL_PHASE='+str(final_phase or 0)+';\n'+hook
    hook = 'const ENVIRONMENT_HARDWARE_ONLY='+str('--environment-hardware' in sys.argv).lower()+';\n'+hook
    hook = '(async()=>{\n' + hook + '\n})().catch(error=>{document.body.innerHTML="<pre id=review-result>"+JSON.stringify({phases:[],systems:{fatal:error.stack}})+"</pre>";});'
    if '--capture-map-baseline' in sys.argv:
        hook = 'const mapBaseline = JSON.parse(JSON.stringify(PHASES));\n' + hook.replace('const output=document.createElement', 'report.mapBaseline=mapBaseline;\nconst output=document.createElement')
    with tempfile.TemporaryDirectory(prefix='byte-runner-review-',ignore_cleanup_errors=True) as folder:
        target = Path(folder)
        (target / 'game.js').write_text(source[:source.rindex('})();')] + hook + '\n})();', encoding='utf-8')
        bootstrap=(ROOT/'tests/audit-bootstrap.js').read_text(encoding='utf-8')
        page=(ROOT/'index.html').read_text(encoding='utf-8').replace('<head>','<head><script>'+bootstrap+'</script>')
        (target / 'index.html').write_text(page,encoding='utf-8')
        (target / 'style.css').write_text((ROOT/'style.css').read_text(encoding='utf-8'),encoding='utf-8')
        shutil.copytree(ROOT/'src',target/'src')
        shutil.copytree(ROOT/'assets',target/'assets')
        class QuietHandler(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *args): pass
            def do_POST(self):
                size=int(self.headers.get('Content-Length','0'))
                label=self.rfile.read(size).decode('utf-8',errors='replace')
                print(label,flush=True);self.send_response(204);self.end_headers()
            def do_GET(self):
                if self.path=='/favicon.ico':
                    self.send_response(204);self.end_headers();return
                super().do_GET()
        server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(QuietHandler,directory=str(target)))
        threading.Thread(target=server.serve_forever,daemon=True).start()
        try:
            query='?procedural=pcb-alpha&rooms=12&difficulty=2&optional=0.4&gameplay=0' if focused=='procedural-demo' else ''
            if focused=='map-debug':query='?dev=1'
            if focused=='gameplay-demo':query='?procedural=gameplay-save&rooms=12&difficulty=3&theme=hardware'
            report=run_page(target,f'http://127.0.0.1:{server.server_port}/index.html'+query)
        finally:
            server.shutdown()
            server.server_close()
        if focused:
            if focused=='map-debug':
                for shot in report.get('snapshots',[]):
                    (ROOT/'tests/map-debug.png').write_bytes(base64.b64decode(shot.pop('image').split(',',1)[1]))
                    shot['file']='tests/map-debug.png'
            if focused=='room-gameplay':
                for shot in report.get('snapshots',[]):
                    filename=shot['position']+'.png'
                    (ROOT/'tests'/filename).write_bytes(base64.b64decode(shot.pop('image').split(',',1)[1]))
                    shot['file']='tests/'+filename
            if focused=='environment-art':
                for shot in report.get('snapshots',[]):
                    filename=f"phase-{shot['phase']:02}-environment.png"
                    (ROOT/'tests'/filename).write_bytes(base64.b64decode(shot.pop('image').split(',',1)[1]))
                    shot['file']='tests/'+filename
            if focused=='procedural':
                for snapshot in report.get('snapshots',[]):
                    image=snapshot.pop('image')
                    filename='procedural-'+snapshot['seed']+'.png'
                    (ROOT/'tests'/filename).write_bytes(base64.b64decode(image.split(',',1)[1]))
                    snapshot['file']='tests/'+filename
            if phase_number is not None:
                for phase in report.get('phases',[]):
                    for key,value in phase.items():
                        if key=='error' or (isinstance(value,str) and value!='PASS') or (key=='platformAccess' and value) or (key=='combat' and any(v['result']!='PASS' for v in value)):
                            report['systems']['phase '+str(phase_number)+' '+key]=str(value)
                report['snapshots']=[]
            report['execution']={'sourceSha256':source_hash,'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'instrumented':True,'isolatedStorage':True}
            result_name=('final-phase-%02d'%final_phase) if final_phase is not None else focused
            (ROOT/('tests/'+result_name+'-results.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
            print(json.dumps(report,ensure_ascii=False,indent=2))
            if report.get('errors') or any(value!='PASS' for value in report['systems'].values()):raise SystemExit(1)
            return
        report['execution']={'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'browser':str(CHROME),'transport':'localhost HTTP','isolatedStorage':True,'instrumented':True,'optionalSkillsDuringTraversal':False,'damageProtectionDuringTraversal':True,'limitations':['Graph search relocates R-07 between proven jump/portal edges; this is not an uninterrupted human playthrough.','Combat is tested separately with damage protection; survival balance still needs manual play.','Minigame solvers use generated answers through real DOM controls.']}
        report['execution']['sourceSha256']=source_hash
        if 'mapBaseline' in report:
            (ROOT/'tests/map-baseline.json').write_text(json.dumps(report.pop('mapBaseline'),ensure_ascii=False,indent=2),encoding='utf-8')
        snapshots=ROOT/'tests/snapshots'
        snapshots.mkdir(exist_ok=True)
        captures=report.pop('snapshots', [])
        report['captures']=[f'snapshots/phase-{shot["phase"]:02}-{shot["position"]}.png' for shot in captures]
        for shot in captures:
            (snapshots/f'phase-{shot["phase"]:02}-{shot["position"]}.png').write_bytes(base64.b64decode(shot['image'].split(',')[1]))
        gallery='<!doctype html><meta charset="utf-8"><style>body{margin:8px;background:#07111c;color:white;font:14px Arial;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}figure{margin:0;height:206px}img{display:block;width:100%;height:183px;object-fit:contain}figcaption{text-align:center}</style>'
        for shot in sorted(ROOT/'tests'/name for name in report['captures']):
            gallery+=f'<figure><figcaption>{shot.stem}</figcaption><img src="snapshots/{shot.name}"></figure>'
        (ROOT/'tests/gallery.html').write_text(gallery,encoding='utf-8')
        geometry='<!doctype html><meta charset="utf-8"><title>BYTE RUNNER · comparação geométrica</title><style>body{background:#080d17;color:#e6f2ff;font:14px monospace;margin:16px}main{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0}img{width:100%;display:block}p{line-height:1.6}</style><h1>Estruturas dos dez mapas</h1><p>Sem arte de fundo. Cinza: colisões. Azul: plataformas. Linhas verdes: interfaces. Verde: entrada. Amarelo: saída. Vermelho: componentes. Escala uniforme dentro de cada mapa; dimensões indicadas.</p><main>'
        for entry in report.get('audit',{}).get('geometry',[]):
            number=entry['phase'];geometry+=f'<figure><img src="snapshots/phase-{number:02}-structure.png"><figcaption>{entry["layout"]}: {entry["ground"]} pisos, {entry["platforms"]} plataformas, {entry["connections"]} conexões.</figcaption></figure>'
        (ROOT/'tests/structures.html').write_text(geometry+'</main>',encoding='utf-8')
        capture_structures(target/'structure-profile')
        gallery_height=((len(captures)+2)//3)*214+40
        subprocess.run([str(CHROME),'--headless','--disable-gpu','--hide-scrollbars',f'--user-data-dir={target / "gallery-profile"}',f'--window-size=1320,{gallery_height}',f'--screenshot={ROOT / "tests/review-contact.png"}',(ROOT/'tests/gallery.html').as_uri()],capture_output=True,timeout=45)
        (ROOT/'tests/review-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
        failures=[]
        for phase in report['phases']:
            for key,value in phase.items():
                if key=='error' or (isinstance(value,str) and value!='PASS') or (key=='platformAccess' and value) or (key=='combat' and any(v['result']!='PASS' for v in value)):
                    failures.append(f'Phase {phase["phase"]}: {key} = {value}')
        failures.extend(f'{key}: {value}' for key,value in report['systems'].items() if value!='PASS')
        failures.extend('Runtime: '+str(error) for error in report.get('errors',[]))
        if len(report['phases'])!=10:failures.append('Expected exactly ten tested phases')
        report['summary']={'phases':len(report['phases']),'systems':len(report['systems']),'passedSystems':sum(value=='PASS' for value in report['systems'].values()),'captures':len(captures),'runtimeErrors':len(report.get('errors',[])),'failures':failures}
        (ROOT/'tests/review-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
        print(json.dumps({'phases':len(report['phases']),'systems':report['systems'],'failures':failures},ensure_ascii=False,indent=2))
        if failures:
            raise SystemExit(1)
if __name__=='__main__':
    main()
