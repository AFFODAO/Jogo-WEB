"""Audit real repair controls, artwork, motion preferences and disposal in Chrome."""
import base64
import json
from pathlib import Path
import subprocess
import tempfile
import time
from chrome_cdp import CDP, page_endpoint, close_chrome, source_fingerprint

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'tests/animated-equipment'
CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'


def main():
    OUT.mkdir(exist_ok=True)
    report = {'checks': [], 'captures': [], 'errors': [], 'sourceSha256': source_fingerprint(ROOT)}
    with tempfile.TemporaryDirectory(prefix='byte-equipment-audit-', ignore_cleanup_errors=True) as folder:
        profile = Path(folder) / 'profile'
        process = subprocess.Popen([CHROME, '--headless', '--disable-gpu', '--no-first-run',
            '--remote-debugging-port=0', f'--user-data-dir={profile}', 'about:blank'],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        cdp = None
        try:
            deadline = time.monotonic() + 25
            while True:
                if time.monotonic() > deadline or process.poll() is not None:
                    raise TimeoutError('Chrome startup')
                try:
                    port = int((profile / 'DevToolsActivePort').read_text().splitlines()[0])
                    break
                except (OSError, ValueError, IndexError):
                    time.sleep(.1)
            cdp = CDP(page_endpoint(port))
            cdp.call('Page.enable')
            cdp.call('Page.addScriptToEvaluateOnNewDocument', {'source':
                'window.auditErrors=[];addEventListener("error",e=>auditErrors.push(e.message));'
                'addEventListener("unhandledrejection",e=>auditErrors.push(String(e.reason)));'})
            cdp.call('Page.navigate', {'url': (ROOT / 'tests/minigames.html').as_uri()})
            deadline = time.monotonic() + 25
            while not cdp.evaluate('Boolean(window.ByteRunner?.repairChallenges && document.querySelector(".repair-console"))'):
                if time.monotonic() > deadline:
                    raise TimeoutError('Repair laboratory startup')
                time.sleep(.1)
            helpers = (ROOT / 'tests/repairs.js').read_text(encoding='utf-8').split("test('repairs:", 1)[0]
            cdp.evaluate('window.assert=(v,m)=>{if(!v)throw Error(m)};' + helpers)
            cdp.evaluate('''window.openEquipment=(stage,type)=>{
                window.auditSession?.dispose();
                auditSession=ByteRunner.repairs.create({type,stage,seed:'equipment-audit'},{standalone:true});
                document.getElementById('repairPanel').hidden=false;
                document.getElementById('repairPanel').dataset.repairType=type;
                document.getElementById('repairPrompt').textContent=auditSession.label();
                auditSession.mount(document.getElementById('repairContent'));
            };''')
            catalog = cdp.evaluate('ByteRunner.repairChallenges.catalog.map(x=>x.id)')
            for width, reduced in [(1280, False), (390, False), (390, True)]:
                cdp.call('Emulation.setDeviceMetricsOverride', {'width': width, 'height': 844,
                    'deviceScaleFactor': 1, 'mobile': False})
                cdp.call('Emulation.setEmulatedMedia', {'features': [
                    {'name': 'prefers-reduced-motion', 'value': 'reduce' if reduced else 'no-preference'}]})
                for kind in catalog:
                    # Each registered generator chooses its equipment stage when omitted.
                    cdp.evaluate(f'openEquipment(undefined,{json.dumps(kind)})')
                    cdp.evaluate('''(()=>{assert(document.documentElement.scrollWidth<=innerWidth+1,'Page overflow');
                        const host=document.getElementById('repairContent');
                        assert(host.scrollWidth<=host.clientWidth+1,'Panel overflow');
                        solveRepairUI(auditSession);
                        assert(auditSession.mode==='won','Controls failed to solve');
                        assert(auditSession.mistakes===0,'Unexpected penalty');})()''')
                    if reduced:
                        cdp.evaluate('assert(!document.getElementById("repairContent").getAnimations({subtree:true}).some(a=>a.playState==="running"),"Motion preference ignored")')
                    cdp.evaluate('''(()=>{const old=document.getElementById('repairContent').firstElementChild;
                        auditSession.dispose();
                        assert(!old.getAnimations({subtree:true}).length,'Motion survived disposal');
                        openEquipment(2,'boot');
                        assert(!document.querySelector('.repair-exit'),'Rapid reopen leaked closing panel');})()''')
                report['checks'].append({'width': width, 'reducedMotion': reduced,
                    'cases': len(catalog), 'result': 'PASS'})
                print(f'PASS {width}px reduced={reduced}: {len(catalog)} repairs', flush=True)
            for stage, kind in [(2,'files'),(3,'packets'),(4,'gateway'),(5,'antenna'),
                    (6,'fiber'),(7,'ip-conflicts'),(8,'dns-query'),(9,'policy-order'),(10,'rack-load')]:
                cdp.call('Emulation.setEmulatedMedia', {'features': []})
                cdp.evaluate(f'openEquipment({stage},{json.dumps(kind)})')
                for state in ['antes', 'depois']:
                    if state == 'depois':
                        cdp.evaluate('solveRepairUI(auditSession)')
                    time.sleep(.3)
                    name = f'{stage:02}-{kind}-{state}.png'
                    shot = cdp.call('Page.captureScreenshot', {'format': 'png'})
                    (OUT / name).write_bytes(base64.b64decode(shot['data']))
                    report['captures'].append(name)
            report['errors'] = cdp.evaluate('auditErrors')
            assert not report['errors'], report['errors']
            cards = ''.join(f'<figure><img src="{name}"><figcaption>{name}</figcaption></figure>'
                for name in report['captures'])
            (OUT / 'gallery.html').write_text('<!doctype html><html lang="pt-BR"><meta charset="utf-8">'
                '<title>Revisão dos equipamentos</title><style>body{margin:12px;background:#08121c;'
                'color:#dcece9;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}'
                'figure{margin:0;min-width:0}img{width:100%;height:270px;object-fit:contain}'
                'figcaption{font:12px monospace;padding:6px}</style>'+cards+'</html>', encoding='utf-8')
            cdp.call('Emulation.setDeviceMetricsOverride', {'width': 1400, 'height': 1900,
                'deviceScaleFactor': 1, 'mobile': False})
            cdp.call('Page.navigate', {'url': (OUT / 'gallery.html').as_uri()})
            time.sleep(.7)
            shot = cdp.call('Page.captureScreenshot', {'format': 'png'})
            (OUT / 'gallery.png').write_bytes(base64.b64decode(shot['data']))
        except Exception as error:
            report['errors'].append(str(error))
            raise
        finally:
            close_chrome(process, cdp)
            (OUT / 'results.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
