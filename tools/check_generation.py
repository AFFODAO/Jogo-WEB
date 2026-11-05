"""Guard original authored maps/campaign while procedural generation and engine evolve."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
baseline=json.loads((ROOT/'tests/fixtures/pre-generation-hashes.json').read_text(encoding='utf-8'))
for relative,expected in baseline.items():
    # Part 3 adds shared physics and opt-in falling platform hooks to game.js.
    # This guard now protects authored map content, not the evolving engine.
    if relative=='game.js':continue
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
print('PASS: campaign.js and all 10 authored map files unchanged byte-for-byte; generation script order valid')
