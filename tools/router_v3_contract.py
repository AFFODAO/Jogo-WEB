"""Exact source contract for the explicitly exported Router maze reconstruction."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def approved_router(relative):
    if relative!='src/maps/04-router.js':return False
    fixture=json.loads((ROOT/'tests/fixtures/router-v3.json').read_text(encoding='utf-8'))
    source=(ROOT/relative).read_text(encoding='utf-8-sig').replace('\r\n','\n')
    assert hashlib.sha256(source.encode('utf-8')).hexdigest()==fixture['sources'][relative],'Router source differs from tested export'
    phase=fixture['definition']
    assert phase['id']=='phase-04' and phase['revision']==5
    assert len(phase['generation']['rooms'])==27 and phase['generation']['architecture']['mode']=='interlocked-multilevel-tunnel-maze'
    return True

def router_definition():
    assert approved_router('src/maps/04-router.js')
    return json.loads((ROOT/'tests/fixtures/router-v3.json').read_text(encoding='utf-8'))['definition']
