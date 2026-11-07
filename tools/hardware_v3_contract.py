"""Explicit exception for the approved Hardware rebuild; historical guards stay intact."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def approved_hardware(relative):
    if relative!='src/maps/01-hardware.js':return False
    fixture=json.loads((ROOT/'tests/fixtures/hardware-v3.json').read_text(encoding='utf-8'))
    source=(ROOT/relative).read_text(encoding='utf-8-sig').replace('\r\n','\n')
    assert hashlib.sha256(source.encode('utf-8')).hexdigest()==fixture['sourceSha256'],'Hardware V3 source differs from reviewed browser snapshot'
    phase=fixture['definition']
    assert phase['id']=='phase-01' and phase['revision']==5 and len(phase['generation']['rooms'])==22
    return True
def hardware_definition():
    assert approved_hardware('src/maps/01-hardware.js')
    return json.loads((ROOT/'tests/fixtures/hardware-v3.json').read_text(encoding='utf-8'))['definition']
