"""Capture the three hardware equipment panels in the real repair laboratory."""
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
CASES = [('ram', 'ram-base:ram-relay'), ('cooling', 'socket:cpu-relay'), ('gpu', 'gpu-east:gpu-relay')]

with tempfile.TemporaryDirectory(prefix='byte-hardware-') as folder:
    for width, label in [(390, 'mobile'), (1000, 'desktop')]:
        for name, component in CASES:
            output = ROOT / 'tests' / f'hardware-animated-{name}-{label}.png'
            url = (ROOT / 'tests/minigames.html').as_uri() + f'?phase=0&component={component}&width={width}'
            subprocess.run([CHROME, '--headless', '--disable-gpu', '--hide-scrollbars',
                '--no-first-run', f'--user-data-dir={folder}/{name}-{label}',
                f'--window-size={width},1500', '--virtual-time-budget=1500',
                f'--screenshot={output}', url], capture_output=True, check=True, timeout=45)
            print(output.name)
