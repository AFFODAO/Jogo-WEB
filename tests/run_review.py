"""Run the real game in headless Chrome, with isolated storage and test instrumentation."""
import json
import re
import subprocess
import tempfile
import base64
import sys
import shutil
from pathlib import Path
from html import unescape

ROOT = Path(__file__).resolve().parents[1]
CHROME = Path('C:/Program Files/Google/Chrome/Application/chrome.exe')
def main():
    source = (ROOT / 'game.js').read_text(encoding='utf-8-sig')
    hook = (ROOT / 'tests/review.js').read_text(encoding='utf-8')
    architecture = (ROOT/'tests/architecture.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/first-five.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/last-five.js').read_text(encoding='utf-8')
    architecture += '\n'+(ROOT/'tests/enemies.js').read_text(encoding='utf-8')
    baseline = (ROOT/'tests/map-baseline.json').read_text(encoding='utf-8')
    fixture = (ROOT/'tests/fixtures/room-map.json').read_text(encoding='utf-8')
    first_five = (ROOT/'tests/fixtures/first-five-v2.json').read_text(encoding='utf-8')
    hook = 'const FIRST_FIVE_V2='+first_five+';\nconst MAP_BASELINE='+baseline+';\nconst ARCHITECTURE_FIXTURE='+fixture+';\n'+hook.replace("const output=document.createElement",architecture+"\nconst output=document.createElement")
    if '--capture-map-baseline' in sys.argv:
        hook = 'const mapBaseline = JSON.parse(JSON.stringify(PHASES));\n' + hook.replace('const output=document.createElement', 'report.mapBaseline=mapBaseline;\nconst output=document.createElement')
    with tempfile.TemporaryDirectory(prefix='byte-runner-review-') as folder:
        target = Path(folder)
        (target / 'game.js').write_text(source[:source.rindex('})();')] + hook + '\n})();', encoding='utf-8')
        (target / 'index.html').write_text((ROOT/'index.html').read_text(encoding='utf-8'),encoding='utf-8')
        (target / 'style.css').write_text((ROOT/'style.css').read_text(encoding='utf-8'),encoding='utf-8')
        shutil.copytree(ROOT/'src',target/'src')
        result = subprocess.run([str(CHROME), '--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--window-size=1440,1000', f'--user-data-dir={target / "profile"}', '--dump-dom', (target/'index.html').as_uri()],capture_output=True,timeout=120)
        html=result.stdout.decode('utf-8',errors='replace')
        match=re.search(r'<pre id="review-result">(.*?)</pre>',html,re.S)
        if not match:
            (ROOT/'tests/browser-error.txt').write_text(html+'\n'+result.stderr.decode('utf-8',errors='replace'),encoding='utf-8')
            raise RuntimeError('No test result. See tests/browser-error.txt')
        report=json.loads(unescape(match.group(1)))
        if 'mapBaseline' in report:
            (ROOT/'tests/map-baseline.json').write_text(json.dumps(report.pop('mapBaseline'),ensure_ascii=False,indent=2),encoding='utf-8')
        snapshots=ROOT/'tests/snapshots'
        snapshots.mkdir(exist_ok=True)
        for shot in report.pop('snapshots', []):
            (snapshots/f'phase-{shot["phase"]:02}-{shot["position"]}.png').write_bytes(base64.b64decode(shot['image'].split(',')[1]))
        gallery='<!doctype html><meta charset="utf-8"><style>body{margin:8px;background:#07111c;color:white;font:14px Arial;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}figure{margin:0;height:206px}img{display:block;width:100%;height:183px;object-fit:contain}figcaption{text-align:center}</style>'
        for shot in sorted(snapshots.glob('*.png')):
            gallery+=f'<figure><figcaption>{shot.stem}</figcaption><img src="snapshots/{shot.name}"></figure>'
        (ROOT/'tests/gallery.html').write_text(gallery,encoding='utf-8')
        gallery_height=((len(list(snapshots.glob('*.png')))+2)//3)*214+40
        subprocess.run([str(CHROME),'--headless','--disable-gpu','--hide-scrollbars',f'--user-data-dir={target / "gallery-profile"}',f'--window-size=1320,{gallery_height}',f'--screenshot={ROOT / "tests/review-contact.png"}',(ROOT/'tests/gallery.html').as_uri()],capture_output=True,timeout=45)
        (ROOT/'tests/review-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
        failures=[]
        for phase in report['phases']:
            for key,value in phase.items():
                if key=='error' or (isinstance(value,str) and value!='PASS') or (key=='platformAccess' and value) or (key=='combat' and any(v['result']!='PASS' for v in value)):
                    failures.append(f'Phase {phase["phase"]}: {key} = {value}')
        failures.extend(f'{key}: {value}' for key,value in report['systems'].items() if value!='PASS')
        print(json.dumps({'phases':len(report['phases']),'systems':report['systems'],'failures':failures},ensure_ascii=False,indent=2))
        if failures:
            raise SystemExit(1)
if __name__=='__main__':
    main()
