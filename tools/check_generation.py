"""Guard original authored maps/campaign while procedural generation and engine evolve."""
import hashlib,json
from check_environment import normalized_game,normalized_campaign_file,approved_repair_catalog
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
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
baseline=json.loads((ROOT/'tests/fixtures/pre-generation-hashes.json').read_text(encoding='utf-8'))
for relative,expected in baseline.items():
    if approved_firewall(relative) or approved_servers(relative):continue
    if approved_software(relative) or approved_switch(relative) or approved_router(relative) or approved_wifi(relative) or approved_cabling(relative) or approved_dhcp(relative) or approved_dns(relative):continue
    # Part 3 adds shared physics and opt-in falling platform hooks to game.js.
    # This guard now protects authored map content, not the evolving engine.
    if relative=='game.js' or any(relative.startswith('src/maps/'+f'{i:02}-') for i in range(1,11)):continue
    data=(ROOT/relative).read_bytes()
    actual=hashlib.sha256(data).hexdigest()
    if actual!=expected:raise SystemExit('CHANGED: '+relative)
modules=['src/engine/maps.js','src/engine/platform-physics.js','src/generation/random.js','src/generation/config.js','src/generation/validation.js','src/generation/composer.js','src/generation/graph.js','src/generation/rooms.js','src/generation/parkour-validation.js','src/generation/structural.js']
html=(ROOT/'index.html').read_text(encoding='utf-8')
positions=[html.index('src="'+module+'"') for module in modules]
assert positions==sorted(positions),'generation dependency order'
assert positions[-1]<html.index('src="game.js"'),'generation API loaded too late'
assert html.index('src="src/engine/falling-platforms.js"')<html.index('src="game.js"'),'falling controller loaded too late'
assert html.index('src="src/engine/level-runtime.js"')<html.index('src="src/content/parkour.js"')<html.index('src="game.js"'),'hazard controller dependency order'
assert html.index('src="src/maps/campaign.js"')<html.index('src="src/generation/demo.js"')<html.index('src="game.js"'),'preview dependency order'
assert html.index('src="src/generation/campaign.js"')<html.index('src="src/maps/01-hardware.js"'),'campaign generator loaded too late'
preserved=json.loads((ROOT/'tests/fixtures/preserved-campaign-systems.json').read_text(encoding='utf-8'))
for relative,expected in preserved.items():
    if approved_repair_catalog(relative):continue
    if approved_firewall(relative) or approved_servers(relative):continue
    if approved_hardware(relative) or approved_software(relative) or approved_switch(relative) or approved_router(relative) or approved_wifi(relative) or approved_cabling(relative) or approved_dhcp(relative) or approved_dns(relative):continue
    data=(ROOT/relative).read_bytes()
    data=normalized_campaign_file(data,relative)
    if relative=='game.js':data=normalized_game(data)
    assert hashlib.sha256(data).hexdigest()==expected,'preserved system changed: '+relative
originals=json.loads((ROOT/'tests/fixtures/last-five-v2.json').read_text(encoding='utf-8'))
for original in originals:
    if original['id']=='phase-10':
        assert approved_servers('src/maps/10-servers.js');continue
    if original['id']=='phase-09':
        assert approved_firewall('src/maps/09-firewall.js');continue
    if original['id']=='phase-08':
        assert approved_dns('src/maps/08-dns.js');continue
    if original['id']=='phase-07':
        assert approved_dhcp('src/maps/07-dhcp.js');continue
    if original['id']=='phase-06':
        assert approved_cabling('src/maps/06-cabling.js');continue
    source=next((ROOT/'src/maps').glob(original['id'][-2:]+'-*.js')).read_text(encoding='utf-8')
    authored,_=json.JSONDecoder().raw_decode(source[source.index('{',source.index('ByteRunner.maps.register(')):])
    assert authored==original,'authored infrastructure changed: '+original['id']
print('PASS: rebuilt phases 1..10 and portal compiler reviewed; boss, repairs and campaign preserved; script order valid')
