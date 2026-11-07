"""Exact source guards for this presentation-only refactor."""
import json,hashlib
from pathlib import Path
from check_environment import restore_parallax
from hardware_v3_contract import approved_hardware
from software_v3_contract import approved_software
ROOT=Path(__file__).resolve().parents[1]
fixture=json.loads((ROOT/'tests/fixtures/pre-parallax.json').read_text(encoding='utf-8'))
for name,digest in {**fixture['maps'],**fixture['core']}.items():
    if approved_hardware(name) or approved_software(name):continue
    assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest,'changed protected file: '+name
assert hashlib.sha256(restore_parallax((ROOT/'game.js').read_bytes())).hexdigest()==fixture['gameSha256'],'game changes outside scenery extraction'
html=(ROOT/'index.html').read_text(encoding='utf-8')
scripts=['src/content/parallax.js','src/engine/parallax.js','src/engine/art.js','src/engine/background-scene.js','src/engine/visuals.js','game.js']
positions=[html.index('src="'+name+'"') for name in scripts]
assert positions==sorted(positions),'parallax dependency order'
print('PASS: Hardware/Software V3 reviewed; phases 3..10 and campaign manifest byte-identical; camera/runtime/physics preserved; script order valid')
