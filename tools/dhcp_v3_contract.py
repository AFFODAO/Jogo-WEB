"""Exact source contract for the explicitly exported DHCP digital city."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def approved_dhcp(relative):
    if relative!='src/maps/07-dhcp.js':return False
    fixture=json.loads((ROOT/'tests/fixtures/dhcp-v3.json').read_text(encoding='utf-8'))
    source=(ROOT/relative).read_text(encoding='utf-8-sig').replace('\r\n','\n')
    assert hashlib.sha256(source.encode('utf-8')).hexdigest()==fixture['sources'][relative],'Dhcp source differs from tested export'
    phase=fixture['definition']
    assert phase['id']=='phase-07' and phase['revision']==5
    assert len(phase['generation']['rooms'])==25 and phase['generation']['architecture']['mode']=='digital-city-districts-and-data-bridges'
    return True

def dhcp_definition():
    assert approved_dhcp('src/maps/07-dhcp.js')
    return json.loads((ROOT/'tests/fixtures/dhcp-v3.json').read_text(encoding='utf-8'))['definition']
