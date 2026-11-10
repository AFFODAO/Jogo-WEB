"""Exact source contract for the explicitly exported Switch radial reconstruction."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def approved_switch(relative):
    if relative!='src/maps/03-switch.js':return False
    fixture=json.loads((ROOT/'tests/fixtures/switch-v3.json').read_text(encoding='utf-8'))
    source=(ROOT/relative).read_text(encoding='utf-8-sig').replace('\r\n','\n')
    assert hashlib.sha256(source.encode('utf-8')).hexdigest()==fixture['sources'][relative],'Switch source differs from tested export'
    phase=fixture['definition']
    assert phase['id']=='phase-03' and phase['revision']==5
    assert len(phase['generation']['rooms'])==25 and phase['generation']['architecture']['mode']=='radial-physical-backplane'
    return True

def switch_definition():
    assert approved_switch('src/maps/03-switch.js')
    return json.loads((ROOT/'tests/fixtures/switch-v3.json').read_text(encoding='utf-8'))['definition']
