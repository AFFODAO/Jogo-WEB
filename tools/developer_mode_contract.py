"""Reverse only explicit developer integration edits before running legacy engine guards."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def without_developer_mode(data):
    source=data.decode('utf-8-sig').replace('\r\n','\n')
    edits=json.loads((ROOT/'tests/fixtures/developer-mode-source.json').read_text(encoding='utf-8'))['gameEdits']
    for edit in reversed(edits):
        assert source.count(edit['after'])==edit.get('count',1),'Developer integration differs from reviewed edit: '+edit['after'][:80]
        source=source.replace(edit['after'],edit['before'])
    if b'\r\n' in data:source=source.replace('\n','\r\n')
    return source.encode('utf-8')
