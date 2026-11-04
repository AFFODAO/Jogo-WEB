"""Capture the actual diagnostic DOM at desktop and narrow touch viewport sizes."""
from pathlib import Path
import tempfile, subprocess
ROOT=Path(__file__).resolve().parents[1]
CHROME='C:/Program Files/Google/Chrome/Application/chrome.exe'
with tempfile.TemporaryDirectory(prefix='byte-diagnostics-') as folder:
    for name,width,height,phase in [('hardware-desktop',1000,960,0),('hardware-mobile',390,844,0),('cabling-mobile',390,844,5)]:
        result=subprocess.run([CHROME,'--headless','--disable-gpu','--hide-scrollbars','--no-first-run',f'--user-data-dir={folder}/{name}',f'--window-size={width},{height}','--virtual-time-budget=1500',f'--screenshot={ROOT / "tests" / ("repair-"+name+".png")}',(ROOT/'tests/minigames.html').as_uri()+f'?phase={phase}&width={width}'],capture_output=True,timeout=45)
        if result.returncode: raise RuntimeError(result.stderr.decode(errors='replace'))
        print('Captured '+name)
