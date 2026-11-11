"""Run architecture and campaign regressions in a disposable copy, preserving reports."""
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'tests/rebuild-v3-architecture'

def protected():
    paths = [ROOT/'game.js', * (ROOT/'src/maps').rglob('*.js')]
    return {p.relative_to(ROOT).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}

def main():
    before = protected()
    OUTPUT.mkdir(exist_ok=True)
    records = []
    with tempfile.TemporaryDirectory(prefix='byte-v3-architecture-') as folder:
        target = Path(folder)
        for filename in ['index.html', 'style.css', 'game.js', 'README.md']:
            shutil.copy2(ROOT/filename, target/filename)
        for directory in ['src', 'assets', 'tools', 'tests']:
            shutil.copytree(ROOT/directory, target/directory, ignore=shutil.ignore_patterns('__pycache__','rebuild-v3-architecture'))
        commands = [
            ['tools/check_maps.py'], ['tools/check_generation.py'], ['tools/check_parallax.py'], ['tools/check_environment.py'],
            ['tests/run_review.py','--rebuild-v3-architecture'],
            ['tests/run_review.py'],
        ]
        outputs = {
            ('tests/run_review.py','--rebuild-v3-architecture'): ('rebuild-v3-architecture-results.json','architecture-results.json'),
            ('tests/run_review.py',): ('review-results.json','regression-results.json'),
        }
        for args in commands:
            artifact=outputs.get(tuple(args))
            if artifact:
                source=target/'tests'/artifact[0]
                source.unlink(missing_ok=True)
            result = subprocess.run([sys.executable,'-X','utf8',*args],cwd=target,capture_output=True,text=True,encoding='utf-8')
            records.append({'command':['python',*args],'returncode':result.returncode,'stdout':result.stdout,'stderr':result.stderr})
            print('PASS' if result.returncode==0 else 'FAIL', ' '.join(args), flush=True)
            if artifact and source.is_file():
                shutil.copy2(source,OUTPUT/artifact[1])
            (OUTPUT/'execution.json').write_text(json.dumps({'commands':records,'protectedBefore':before,'protectedAfter':protected(),'campaignUnchanged':before==protected()},ensure_ascii=False,indent=2),encoding='utf-8')
            if result.returncode:
                print(result.stdout[-7000:],result.stderr[-3000:])
                raise SystemExit(result.returncode)
    assert before==protected(), 'campaign changed during tests'

if __name__ == '__main__':
    main()
