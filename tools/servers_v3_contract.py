"""Source hashes for the reviewed Servers blueprint and shared campaign configuration."""
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SERVERS_SOURCES = {
    'src/maps/10-servers.js': 'dba4ba29e85c90cef2eb42f9fd48eaafb5f806854c5a95b986f774df2a1ff8c0',
    'src/generation/campaign.js': '0d2e6982fe33bfae1f1b292ddeba2e8ac7190c9fd9618291c6adcb6f080ccded',
}


def approved_servers(relative):
    if relative not in SERVERS_SOURCES:
        return False
    source = (ROOT / relative).read_text(encoding='utf-8-sig')
    assert hashlib.sha256(source.encode('utf-8')).hexdigest() == SERVERS_SOURCES[relative], (
        'Servers source differs from reviewed revision: ' + relative
    )
    return True
