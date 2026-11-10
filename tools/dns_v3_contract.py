"""Exact source contract for the explicitly exported DNS domain complex."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def approved_dns(relative):
    if relative!='src/maps/08-dns.js':return False
    fixture=json.loads((ROOT/'tests/fixtures/dns-v3.json').read_text(encoding='utf-8'))
    source=(ROOT/relative).read_text(encoding='utf-8-sig').replace('\r\n','\n')
    assert hashlib.sha256(source.encode('utf-8')).hexdigest()==fixture['sources'][relative],'Dns source differs from tested export'
    phase=fixture['definition']
    assert phase['id']=='phase-08' and phase['revision']==5
    assert len(phase['generation']['rooms'])==33 and phase['generation']['architecture']['mode']=='domain-campuses-and-recursive-portals'
    return True

def dns_definition():
    assert approved_dns('src/maps/08-dns.js')
    return json.loads((ROOT/'tests/fixtures/dns-v3.json').read_text(encoding='utf-8'))['definition']
