"""Reject stale/failed functional evidence; report timing failures without hiding them."""
import json,subprocess,sys
from pathlib import Path
from chrome_cdp import source_fingerprint

ROOT=Path(__file__).resolve().parents[1]
current=source_fingerprint(ROOT)
checks=[]
for command in [[sys.executable,'tools/check_maps.py'],[sys.executable,'tools/check_generation.py'],[sys.executable,'tools/check_environment.py'],['git','diff','--check']]:
    result=subprocess.run(command,cwd=ROOT,capture_output=True,text=True)
    checks.append({'command':command,'exitCode':result.returncode,'stdout':result.stdout,'stderr':result.stderr})
    assert result.returncode==0,(command,result.stdout,result.stderr)
names=['review','map-debug','final-regressions','final-performance','gameplay-demo','procedural-demo','environment-art']
evidence={}
for name in names+[f'final-phase-{i:02}' for i in range(1,11)]:
    data=json.loads((ROOT/f'tests/{name}-results.json').read_text(encoding='utf-8'))
    assert data['execution']['sourceSha256']==current,'stale evidence: '+name
    failures={k:v for k,v in data['systems'].items() if v!='PASS'}
    assert not data.get('errors'),(name,data.get('errors'))
    if name=='final-performance':
        assert all(k.startswith('performance: local 60Hz frame budget / ') for k in failures),(name,failures)
    else:assert not failures,(name,failures)
    if name=='review':assert not data['summary']['failures'],data['summary']['failures']
    evidence[name]=data
browser=json.loads((ROOT/'tests/browser-audit-results.json').read_text(encoding='utf-8'))
assert browser['sourceSha256']==current,'stale browser evidence'
assert not browser['failures'],browser['failures']
viewport_count=len({(v['width'],v['height']) for v in browser['viewports']})
phases=[]
campaign_signatures=set()
for i in range(1,11):
    data=evidence[f'final-phase-{i:02}']
    assert len(data['cases'])==6 and all(c['status']=='PASS' for c in data['cases'])
    campaign_signatures.add(next(c['signature'] for c in data['cases'] if c['scope']=='campaign'))
    phases.append(dict(phase=i,theme=data['theme'],seeds=data['seeds'],cases=6,
                       structures=data['structuralVariety'],
                       repairStates=sum(len(c['states']) for c in data['cases'])))
assert len(campaign_signatures)==10,'campaign phases share identical collision geometry'
summary={'sourceSha256':current,'sourceChecks':checks,'phases':phases,'distinctCampaignGeometries':len(campaign_signatures),'mapsTested':sum(p['cases'] for p in phases),
         'suites':{name:{'passed':sum(v=='PASS' for v in data['systems'].values()),'failed':sum(v!='PASS' for v in data['systems'].values()),'failures':{k:v for k,v in data['systems'].items() if v!='PASS'},'executedUTC':data['execution']['atUTC']} for name,data in evidence.items()},
         'browser':{'viewports':viewport_count,'scenarios':len(browser['viewports']),'captures':len(browser['captures']),'input':browser['input'],'reload':browser['reloadPersistence'],'failures':browser['failures']},
         'performance':evidence['final-performance']['performance'],
         'largeMapGenerationAndLoadMs':evidence['final-performance']['largeMapGenerationMs'],
         'performanceConditions':evidence['final-performance']['performanceConditions'],
         'initialFailures':[p.name for p in sorted((ROOT/'tests').glob('final-*-initial*.json'))],
         'limitations':['Finite seeds; not a proof for every possible seed.','Frozen debug model excludes moving-platform timing, environmental modifiers and damage.','Actual traversal probes relocate between physically proven edges; no optional skills; damage protection during traversal.','Headless local timing does not certify FPS on other hardware.','Human survival balance and a continuous manual campaign playthrough remain unverified.']}
summary['overallStatus']='functional-checks-pass; performance-budget-not-met' if summary['suites']['final-performance']['failed'] else 'all-executed-checks-pass'
summary['remainingIssues']=list(summary['suites']['final-performance']['failures'].values())
(ROOT/'tests/final-audit-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
lines=['# Resultados executados da revisão final','',f'Fontes: `{current}`. Todos os resultados finais tabelados correspondem a esse hash; os arquivos históricos mantêm suas versões originais.','',
       ('Validação funcional aprovada. **Orçamento de desempenho não aprovado no benchmark sem GPU**; consulte os tempos abaixo.' if summary['remainingIssues'] else 'Todos os testes executados abaixo foram aprovados.'),'',
       '| Fase | Tema | Seeds executadas em campanha e salas | Casos aprovados |',
       '| --- | --- | --- | --- |']
for p in phases:lines.append(f"| {p['phase']} | {p['theme']} | "+', '.join('`'+s+'`' for s in p['seeds'])+' | 6/6 |')
lines+=['',f"Total: {summary['mapsTested']} casos; dez geometrias de campanha distintas. Mesma seed reproduz os mesmos dados. Consulte as assinaturas e cada estado após reparo nos JSON por fase.",'',
        '| Suíte | Aprovados | Reprovados finais |','| --- | --- | --- |']
for name,row in summary['suites'].items():lines.append(f"| {name} | {row['passed']} | {row['failed']} |")
lines+=['',f"Interface: {viewport_count} tamanhos de tela; {len(browser['viewports'])} cenários e {len(browser['captures'])} capturas; teclado, toque e recarga com persistência aprovados. Zero falhas de navegador registradas.",'',
        '| Mapa | p95 update+draw (ms) | Cache (chunks) |','| --- | --- | --- |']
for row in summary['performance']:lines.append(f"| {row['phase']} | {row['p95Ms']:.2f} | {row['cacheSize']}/96 |")
lines+=['',f"Geração e carregamento do mapa de 24 salas: {summary['largeMapGenerationAndLoadMs']:.2f} ms. Pico observado da cache de terreno: {max(r['cacheSize'] for r in summary['performance'])}/96 chunks."]
lines+=['','Medição local: Chrome headless sem GPU, 24 frames de aquecimento e 60 amostras por mapa, nove posições de câmera; triagem p95 ≤ 16,7 ms. Não representa garantia em outros dispositivos.','',
        'Reprovações iniciais e execuções incompletas preservadas:']
lines+=['',*['- [`'+name+'`](../tests/'+name+')' for name in summary['initialFailures']],'',
        'As falhas reais de geometria e de validação foram corrigidas e retestadas. As reprovações de desempenho, se indicadas na tabela, permanecem abertas: não foram reclassificadas nem tiveram o limite afrouxado. O teste humano contínuo e o equilíbrio de sobrevivência em dispositivos reais continuam fora da validação automática.','',
        'Arquivos, correções, reprodução e demais limites: [relatório técnico](final-map-review.md).']
(ROOT/'docs/final-map-results.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
print(json.dumps({'maps':summary['mapsTested'],'suites':summary['suites'],'sourceSha256':current},indent=2))
