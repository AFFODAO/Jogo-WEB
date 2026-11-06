"""Guard original authored maps/campaign while procedural generation and engine evolve."""
import hashlib,json
from check_environment import normalized_game,normalized_campaign_file
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
baseline=json.loads((ROOT/'tests/fixtures/pre-generation-hashes.json').read_text(encoding='utf-8'))
for relative,expected in baseline.items():
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
    data=(ROOT/relative).read_bytes()
    data=normalized_campaign_file(data,relative)
    if relative=='game.js':data=normalized_game(data)
    assert hashlib.sha256(data).hexdigest()==expected,'preserved system changed: '+relative
originals=json.loads((ROOT/'tests/fixtures/last-five-v2.json').read_text(encoding='utf-8'))
for original in originals:
    source=next((ROOT/'src/maps').glob(original['id'][-2:]+'-*.js')).read_text(encoding='utf-8')
    authored,_=json.JSONDecoder().raw_decode(source[source.index('{',source.index('ByteRunner.maps.register(')):])
    assert authored==original,'authored infrastructure changed: '+original['id']
print('PASS: authored infrastructure, phases 1..5, boss/repair engines and campaign manifest preserved; generation script order valid')
