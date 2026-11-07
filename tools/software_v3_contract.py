"""Narrow reviewed exceptions: Software V3 and opt-in portal graph compilation."""
import hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def approved_software(relative):
    if relative not in ['src/maps/02-software.js','src/generation/composer.js']:return False
    fixture=json.loads((ROOT/'tests/fixtures/software-v3.json').read_text(encoding='utf-8'))
    text=(ROOT/relative).read_text(encoding='utf-8-sig').replace('\r\n','\n')
    assert hashlib.sha256(text.encode('utf-8')).hexdigest()==fixture['sources'][relative],'Software V3 reviewed source changed: '+relative
    assert fixture['definition']['id']=='phase-02' and fixture['definition']['revision']==5 and len(fixture['definition']['generation']['rooms'])==19
    return True
def software_definition():
    assert approved_software('src/maps/02-software.js')
    return json.loads((ROOT/'tests/fixtures/software-v3.json').read_text(encoding='utf-8'))['definition']
