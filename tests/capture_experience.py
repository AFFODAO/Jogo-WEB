"""Capture real game presentation with temporary hooks and isolated browser storage."""
from pathlib import Path
import subprocess, tempfile, shutil, re
ROOT=Path(__file__).resolve().parents[1]
CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'
source=(ROOT/'game.js').read_text(encoding='utf-8')
with tempfile.TemporaryDirectory(prefix='byte-experience-preview-') as folder:
    target=Path(folder)
    for name in ['src','assets']:shutil.copytree(ROOT/name,target/name)
    for name in ['index.html','style.css']:shutil.copy2(ROOT/name,target/name)
    for name,width,height,extra in [
        ('intro',1360,960,"beginPhaseIntro();draw();"),
        ('settings',1000,900,"document.getElementById('settingsButton').click();"),
        ('settings-mobile',390,844,"document.body.style.width='390px';document.body.style.margin='0';resize();document.getElementById('settingsButton').click();Object.assign(document.getElementById('settingsDialog').style,{width:'362px',left:'14px',right:'auto',marginLeft:'0',marginRight:'0'});")
    ]:
        hook="window.requestAnimationFrame=()=>0;soundEnabled=false;loadPhase(0,true);campaignStarted=true;running=true;overlay.classList.add('hidden');document.querySelector('.game-shell').classList.add('playing');"+extra
        hook+="document.body.dataset.previewOverflow=String(document.documentElement.scrollWidth>document.documentElement.clientWidth);"
        (target/'game.js').write_text(source[:source.rindex('})();')]+hook+'\n})();',encoding='utf-8')
        result=subprocess.run([CHROME,'--headless','--disable-gpu','--hide-scrollbars','--no-first-run',f'--user-data-dir={target / (name+"-profile")}',f'--window-size={width},{height}','--virtual-time-budget=1000',f'--screenshot={ROOT / "tests" / ("experience-"+name+".png")}', '--dump-dom',(target/'index.html').as_uri()],capture_output=True,timeout=45)
        if result.returncode:raise RuntimeError(result.stderr.decode(errors='replace'))
        match=re.search('data-preview-overflow="(.*?)"',result.stdout.decode(errors='replace'))
        if not match:raise RuntimeError('Preview did not initialize: '+name)
        print(name+': horizontal overflow = '+match.group(1))
