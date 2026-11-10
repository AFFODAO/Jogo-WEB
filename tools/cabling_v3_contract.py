"""Exact source contract for the explicitly exported industrial cabling reconstruction."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def approved_cabling(relative):
    if relative!='src/maps/06-cabling.js':return False
    fixture=json.loads((ROOT/'tests/fixtures/cabling-v3.json').read_text(encoding='utf-8'))
    source=(ROOT/relative).read_text(encoding='utf-8-sig').replace('\r\n','\n')
    assert hashlib.sha256(source.encode('utf-8')).hexdigest()==fixture['sources'][relative],'Cabling source differs from tested export'
    phase=fixture['definition']
    assert phase['id']=='phase-06' and phase['revision']==5
    assert len(phase['generation']['rooms'])==41 and phase['generation']['architecture']['mode']=='industrial-floorplates-and-service-shafts'
    return True

def cabling_definition():
    assert approved_cabling('src/maps/06-cabling.js')
    return json.loads((ROOT/'tests/fixtures/cabling-v3.json').read_text(encoding='utf-8'))['definition']
