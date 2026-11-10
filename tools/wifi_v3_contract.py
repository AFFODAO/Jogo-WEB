"""Exact source contract for the explicitly exported Wi-Fi tower reconstruction."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def approved_wifi(relative):
    if relative!='src/maps/05-wifi.js':return False
    fixture=json.loads((ROOT/'tests/fixtures/wifi-v3.json').read_text(encoding='utf-8'))
    source=(ROOT/relative).read_text(encoding='utf-8-sig').replace('\r\n','\n')
    assert hashlib.sha256(source.encode('utf-8')).hexdigest()==fixture['sources'][relative],'Wifi source differs from tested export'
    phase=fixture['definition']
    assert phase['id']=='phase-05' and phase['revision']==5
    assert len(phase['generation']['rooms'])==27 and phase['generation']['architecture']['mode']=='open-air-twin-mast-ascent'
    return True

def wifi_definition():
    assert approved_wifi('src/maps/05-wifi.js')
    return json.loads((ROOT/'tests/fixtures/wifi-v3.json').read_text(encoding='utf-8'))['definition']
