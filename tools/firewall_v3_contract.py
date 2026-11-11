"""Source hash for the reviewed Firewall blueprint."""
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIREWALL_SOURCES = {
    'src/maps/09-firewall.js': '2ee3302282654fa71c4cda9ea1aa4a48044bbb19c6643a6fbea69d2f23814219',
}


def approved_firewall(relative):
    if relative not in FIREWALL_SOURCES:
        return False
    source = (ROOT / relative).read_text(encoding='utf-8-sig')
    assert hashlib.sha256(source.encode('utf-8')).hexdigest() == FIREWALL_SOURCES[relative], (
        'Firewall source differs from reviewed revision: ' + relative
    )
    return True
