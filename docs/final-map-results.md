# Resultados executados da revisão final

Fontes: `e83024099d896e1297f9f0fcb57373d97592e5e778aa346c4b2d8e01307814ef`. Todos os resultados finais tabelados correspondem a esse hash; os arquivos históricos mantêm suas versões originais.

Validação funcional aprovada. **Orçamento de desempenho não aprovado no benchmark sem GPU**; consulte os tempos abaixo.

| Fase | Tema | Seeds executadas em campanha e salas | Casos aprovados |
| --- | --- | --- | --- |
| 1 | hardware | `phase-01-review-alpha`, `phase-01-review-beta`, `phase-01-review-gamma` | 6/6 |
| 2 | software | `phase-02-review-alpha`, `phase-02-review-beta`, `phase-02-review-gamma` | 6/6 |
| 3 | switch | `phase-03-review-alpha`, `phase-03-review-beta`, `phase-03-review-gamma` | 6/6 |
| 4 | router | `phase-04-review-alpha`, `phase-04-review-beta`, `phase-04-review-gamma` | 6/6 |
| 5 | wifi | `phase-05-review-alpha`, `phase-05-review-beta`, `phase-05-review-gamma` | 6/6 |
| 6 | cabling | `phase-06-review-alpha`, `phase-06-review-beta`, `phase-06-review-gamma` | 6/6 |
| 7 | dhcp | `phase-07-review-alpha`, `phase-07-review-beta`, `phase-07-review-gamma` | 6/6 |
| 8 | dns | `phase-08-review-alpha`, `phase-08-review-beta`, `phase-08-review-gamma` | 6/6 |
| 9 | firewall | `phase-09-review-alpha`, `phase-09-review-beta`, `phase-09-review-gamma` | 6/6 |
| 10 | servers | `phase-10-review-alpha`, `phase-10-review-beta`, `phase-10-review-gamma` | 6/6 |

Total: 60 casos; dez geometrias de campanha distintas. Mesma seed reproduz os mesmos dados. Consulte as assinaturas e cada estado após reparo nos JSON por fase.

| Suíte | Aprovados | Reprovados finais |
| --- | --- | --- |
| review | 190 | 0 |
| map-debug | 6 | 0 |
| final-regressions | 12 | 0 |
| final-performance | 11 | 11 |
| gameplay-demo | 3 | 0 |
| procedural-demo | 4 | 0 |
| environment-art | 43 | 0 |
| final-phase-01 | 7 | 0 |
| final-phase-02 | 7 | 0 |
| final-phase-03 | 7 | 0 |
| final-phase-04 | 7 | 0 |
| final-phase-05 | 7 | 0 |
| final-phase-06 | 7 | 0 |
| final-phase-07 | 7 | 0 |
| final-phase-08 | 7 | 0 |
| final-phase-09 | 7 | 0 |
| final-phase-10 | 7 | 0 |

Interface: 7 tamanhos de tela; 70 cenários e 70 capturas; teclado, toque e recarga com persistência aprovados. Zero falhas de navegador registradas.

| Mapa | p95 update+draw (ms) | Cache (chunks) |
| --- | --- | --- |
| 1 | 53.40 | 32/96 |
| 2 | 56.20 | 26/96 |
| 3 | 38.30 | 39/96 |
| 4 | 28.80 | 41/96 |
| 5 | 38.70 | 39/96 |
| 6 | 54.40 | 62/96 |
| 7 | 40.50 | 36/96 |
| 8 | 35.40 | 60/96 |
| 9 | 31.90 | 43/96 |
| 10 | 54.00 | 32/96 |
| procedural-24 | 46.80 | 59/96 |

Geração e carregamento do mapa de 24 salas: 52.00 ms. Pico observado da cache de terreno: 62/96 chunks.

Medição local: Chrome headless sem GPU, 24 frames de aquecimento e 60 amostras por mapa, nove posições de câmera; triagem p95 ≤ 16,7 ms. Não representa garantia em outros dispositivos.

Reprovações iniciais e execuções incompletas preservadas:

- [`final-audit-initial-failures.json`](../tests/final-audit-initial-failures.json)
- [`final-audit-initial-harness.json`](../tests/final-audit-initial-harness.json)
- [`final-audit-initial-performance.json`](../tests/final-audit-initial-performance.json)
- [`final-audit-initial-phase-05.json`](../tests/final-audit-initial-phase-05.json)
- [`final-audit-initial-phase-06.json`](../tests/final-audit-initial-phase-06.json)
- [`final-audit-initial-phase-07.json`](../tests/final-audit-initial-phase-07.json)
- [`final-audit-initial-phase-08.json`](../tests/final-audit-initial-phase-08.json)
- [`final-audit-initial-phase-09.json`](../tests/final-audit-initial-phase-09.json)
- [`final-audit-initial-phase-10.json`](../tests/final-audit-initial-phase-10.json)
- [`final-audit-initial-return.json`](../tests/final-audit-initial-return.json)
- [`final-validator-initial-failures.json`](../tests/final-validator-initial-failures.json)

As falhas reais de geometria e de validação foram corrigidas e retestadas. As reprovações de desempenho, se indicadas na tabela, permanecem abertas: não foram reclassificadas nem tiveram o limite afrouxado. O teste humano contínuo e o equilíbrio de sobrevivência em dispositivos reais continuam fora da validação automática.

Arquivos, correções, reprodução e demais limites: [relatório técnico](final-map-review.md).
