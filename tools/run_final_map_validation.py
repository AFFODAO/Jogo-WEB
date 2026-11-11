"""Run the final campaign validation in a disposable checkout."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
SUITES = {
    'comparison': [('--final-map-comparison', 'final-map-comparison-results.json')],
    'campaign': [('', 'review-results.json')],
    'architecture': [('--rebuild-v3-architecture', 'rebuild-v3-architecture-results.json')],
    'browser-ui': [('', 'browser-audit-results.json')],
    'visual': [('--visual-finish', 'visual-finish-results.json'),
               ('--parallax-final', 'parallax-final-results.json'),
               ('--ambient-only', 'parallax-ambient-results.json')],
    'seeds': [('--procedural-only', 'procedural-results.json'),
              ('--room-gameplay', 'room-gameplay-results.json'),
              ('--gameplay-demo', 'gameplay-demo-results.json')],
    'seeds-deep': [(f'--final-phase {phase}', f'final-phase-{phase:02d}-results.json')
                   for phase in range(1, 11)],
    'pacing': [('--frame-pacing', 'parallax-frame-pacing-results.json')],
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('suites', nargs='*', choices=SUITES, default=None)
    parser.add_argument('--viewport')
    parser.add_argument('--dpr')
    parser.add_argument('--phase', type=int, choices=range(1, 11), action='append')
    args = parser.parse_args()
    output = ROOT / 'tests' / 'final-map-validation'
    output.mkdir(exist_ok=True)
    failed = False
    with tempfile.TemporaryDirectory(prefix='byte-final-map-validation-') as folder:
        checkout = Path(folder)
        for name in ('index.html', 'style.css', 'game.js'):
            shutil.copy2(ROOT / name, checkout / name)
        for name in ('src', 'assets', 'tests'):
            shutil.copytree(ROOT / name, checkout / name, ignore=shutil.ignore_patterns(
                'final-map-validation', '__pycache__'))
        for suite in args.suites or SUITES:
            for flag, report in SUITES[suite]:
                if suite=='seeds-deep' and args.phase and int(flag.split()[-1]) not in args.phase:
                    continue
                target = checkout / 'tests' / report
                target.unlink(missing_ok=True)
                flags = flag.split()
                for name in ('viewport', 'dpr'):
                    if value := getattr(args, name):
                        flags.extend(['--' + name, value])
                script = 'tests/run_browser_audit.py' if suite=='browser-ui' else 'tests/run_review.py'
                process = subprocess.run([sys.executable, '-X', 'utf8', script, *flags],
                                         cwd=checkout, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                         text=True, encoding='utf-8', errors='replace')
                suffix = '-dpr' + args.dpr if args.dpr else ''
                destination = output / report.replace('-results', suffix)
                if target.is_file():
                    data = json.loads(target.read_text(encoding='utf-8'))
                    destination.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
                if process.returncode or not target.is_file():
                    failed = True
                    (output / destination.with_suffix('.log').name).write_text(process.stdout, encoding='utf-8')
                    print(f'FAIL {suite}: {flag or "full"}', flush=True)
                else:
                    print(f'PASS {suite}: {flag or "full"}', flush=True)
    return int(failed)


if __name__ == '__main__':
    sys.exit(main())
