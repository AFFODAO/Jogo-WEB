"""Import an explicit JSON map snapshot as classic browser modules (no geometry generation)."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('snapshot', type=Path)
    parser.add_argument('--overwrite', action='store_true')
    args = parser.parse_args()
    phases = json.loads(args.snapshot.read_text(encoding='utf-8'))
    destination = ROOT / 'src/maps'
    destination.mkdir(parents=True, exist_ok=True)
    paths = [destination / f'{index:02}-{phase["theme"]}.js' for index, phase in enumerate(phases, 1)]
    if not args.overwrite and any(path.exists() for path in paths):
        parser.error('Map files already exist; pass --overwrite to replace them explicitly.')
    for phase, path in zip(phases, paths):
        phase['schemaVersion'] = 2
        if phase['id'] == 'phase-10':
            phase['completion'] = {'type': 'boss-question', 'enemyId': 'e08'}
        phase.setdefault('assets', [])
        phase.setdefault('layers', [])
        phase.setdefault('mechanics', [])
        path.write_text('// Explicit geometry; independent of every other phase.\nByteRunner.maps.register(' + json.dumps(phase, ensure_ascii=False, indent=2) + ');\n', encoding='utf-8')
    (destination/'campaign.js').write_text('ByteRunner.campaign = Object.freeze(' + json.dumps([phase['id'] for phase in phases], indent=2) + ');\n', encoding='utf-8')
    print(f'Imported {len(phases)} maps into {destination}')

if __name__ == '__main__':
    main()
