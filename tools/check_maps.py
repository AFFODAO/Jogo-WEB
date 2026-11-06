"""Audit the explicit map modules and their campaign/script manifest using only Python."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main():
    maps = {}
    paths = sorted((ROOT/'src/maps').glob('[0-9][0-9]-*.js'))
    for path in paths:
        source = path.read_text(encoding='utf-8')
        definition, _ = json.JSONDecoder().raw_decode(source[source.index('{',source.index('ByteRunner.maps.register(')):])
        if definition['id'] in maps:
            raise ValueError(f'Duplicate map {definition["id"]}')
        maps[definition['id']] = definition
        assert definition['schemaVersion'] == 2, path.name
        assert definition['map']['width'] > 0, path.name
        ids = [entity['id'] for group in definition['entities'].values() for entity in group]
        assert len(ids) == len(set(ids)), f'Duplicate entity IDs in {path.name}'
        html = (ROOT/'index.html').read_text(encoding='utf-8')
        assert path.relative_to(ROOT).as_posix() in html, f'Missing script: {path.name}'
        geometry = definition['entities']
        print(f'{definition["id"]}: {definition["map"]["layout"]}, '
              f'{len(geometry["platforms"])} platforms, {len(geometry["enemies"])} enemies, '
              f'{len(geometry["components"])} repairs')
    campaign = (ROOT/'src/maps/campaign.js').read_text(encoding='utf-8')
    order, _ = json.JSONDecoder().raw_decode(campaign.split('Object.freeze(',1)[1])
    assert len(order) == len(set(order)) == len(maps), 'Campaign manifest mismatch'
    assert all(phase_id in maps for phase_id in order), 'Unknown campaign map'
    print(f'PASS: {len(maps)} independent map modules; browser validation runs in tests/run_review.py')

if __name__ == '__main__':
    main()
