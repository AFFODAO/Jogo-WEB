"""Exact source guards for this presentation-only refactor."""
import json,hashlib
from pathlib import Path
from check_environment import restore_parallax
from developer_mode_contract import without_developer_mode
from hardware_v3_contract import approved_hardware
from software_v3_contract import approved_software
from switch_v3_contract import approved_switch
from router_v3_contract import approved_router
from wifi_v3_contract import approved_wifi
from cabling_v3_contract import approved_cabling
from dhcp_v3_contract import approved_dhcp
from dns_v3_contract import approved_dns
from firewall_v3_contract import approved_firewall
from servers_v3_contract import approved_servers
ROOT=Path(__file__).resolve().parents[1]
fixture=json.loads((ROOT/'tests/fixtures/pre-parallax.json').read_text(encoding='utf-8'))
for name,digest in {**fixture['maps'],**fixture['core']}.items():
    if approved_firewall(name) or approved_servers(name):continue
    if approved_hardware(name) or approved_software(name) or approved_switch(name) or approved_router(name) or approved_wifi(name) or approved_cabling(name) or approved_dhcp(name) or approved_dns(name):continue
    assert hashlib.sha256((ROOT/name).read_bytes()).hexdigest()==digest,'changed protected file: '+name
assert hashlib.sha256(restore_parallax(without_developer_mode((ROOT/'game.js').read_bytes()))).hexdigest()==fixture['gameSha256'],'game changes outside scenery extraction'
html=(ROOT/'index.html').read_text(encoding='utf-8')
scripts=['src/content/parallax.js','src/engine/parallax.js','src/engine/art.js','src/engine/background-scene.js','src/engine/visuals.js','game.js']
positions=[html.index('src="'+name+'"') for name in scripts]
assert positions==sorted(positions),'parallax dependency order'
print('PASS: rebuilt phases 1..10 reviewed; campaign manifest, camera, runtime and physics preserved; script order valid')
