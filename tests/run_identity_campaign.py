"""Verify each phase sequentially; stop on failure, then publish a local gallery."""
import json,subprocess,sys
from pathlib import Path
from chrome_cdp import source_fingerprint

ROOT=Path(__file__).resolve().parents[1]
LABELS=['Hardware','Software','Switch','Roteador','Wi-Fi','Cabeamento','DHCP','DNS','Firewall','Servidores']

def main():
    fingerprint=source_fingerprint(ROOT);reports=[]
    for phase,label in enumerate(LABELS,1):
        print(f'Validating {phase:02} — {label}',flush=True)
        subprocess.run([sys.executable,str(ROOT/'tests/run_review.py'),'--identity-phase',str(phase)],cwd=ROOT,check=True,stdout=subprocess.DEVNULL)
        report=json.loads((ROOT/f'tests/identity-phase-{phase:02}-results.json').read_text(encoding='utf-8'))
        assert report['execution']['sourceSha256']==fingerprint,'sources changed during validation'
        assert not report['errors'] and all(value=='PASS' for value in report['systems'].values()),label
        reports.append(report)
        print(f'PASS {label}: {len(report["systems"])} checks, {len(report["snapshots"])} captures',flush=True)
    gallery=['<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>BYTE RUNNER — dez identidades</title><style>body{margin:24px;background:#09131d;color:#e0e9ef;font:16px system-ui}nav{display:flex;gap:16px;flex-wrap:wrap}a{color:#90d8da}section{padding:20px 0;border-bottom:1px solid #283e4b}main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}figure{margin:0}img{width:100%;height:auto;image-rendering:pixelated;background:#071719}figcaption{margin:8px 0;color:#b1c5cf}@media(max-width:760px){main{grid-template-columns:1fr}}</style><h1>BYTE RUNNER — identidades do parallax</h1><p>Capturas reais do jogo: camadas isoladas, início e vistas horizontal/vertical. Escala inteira no jogo; imagens sem interpolação nesta galeria.</p><nav>']
    gallery.extend(f'<a href="#phase-{i}">{i:02} {label}</a>' for i,label in enumerate(LABELS,1));gallery.append('</nav>')
    names={'layers':'Camadas isoladas','start':'Início com personagem','horizontal':'Trecho horizontal','vertical':'Trecho vertical','arena':'Arena de VIRUS ZERO'}
    for i,(label,report) in enumerate(zip(LABELS,reports),1):
        gallery.append(f'<section id="phase-{i}"><h2>{i:02} — {label}</h2><main>')
        for shot in sorted(report['snapshots'],key=lambda s:list(names).index(s['position'])):
            src=Path(shot['file']).name;caption=names[shot['position']]
            gallery.append(f'<figure><a href="{src}"><img loading="lazy" src="{src}" alt="{label}: {caption}"></a><figcaption>{caption}</figcaption></figure>')
        gallery.append('</main></section>')
    gallery.append('</html>');(ROOT/'tests/identity-gallery.html').write_text(''.join(gallery),encoding='utf-8')
    summary={'sourceSha256':fingerprint,'phases':10,'checks':sum(len(r['systems']) for r in reports),'captures':sum(len(r['snapshots']) for r in reports),'runtimeErrors':0,'reports':[f'identity-phase-{i:02}-results.json' for i in range(1,11)],'gallery':'tests/identity-gallery.html'}
    (ROOT/'tests/identity-campaign-results.json').write_text(json.dumps(summary,indent=2),encoding='utf-8');print(json.dumps(summary,indent=2))

if __name__=='__main__':main()
