# Cenários vivos — evidências e desempenho

[Galeria de capturas](../tests/ambient-gallery.html) | [Registro da etapa](../PROGRESSO_MAPAS.md)

## Verificação visual

61/61 verificações ambientais e 209/209 verificações de regressão aprovadas, sem erros de runtime.
Contraste verificado em 30 posições reais de apoio, distribuídas pelas dez fases. No pior caso, 89.21% dos pixels claros detectados no robô ficaram pelo menos 40 níveis de luminância acima do cenário imediatamente anterior ao desenho do personagem. O teste usa luminância ponderada de 0 a 255.
Na triagem de quatro segundos por fase, com 24 intervalos de 1/6 s, o maior percentual de pixels que mudou foi 0.191%. Mudanças acima de 24 níveis de luminância atingiram no máximo 0.098% do quadro. A triagem verifica a área e a intensidade nesta amostragem de quadros.

## Parallax isolado — antes e depois

Chrome headless, GPU desativada, Canvas 905 × 644; 24 quadros de aquecimento, 120 amostras por fase e modo, nove regiões de câmera, leitura síncrona de um pixel após desenhar. Os componentes continuam danificados, permitindo incluir seus sinais na medição. Valores em milissegundos.

| Fase | Média antes | Média depois | p95 antes | p95 depois | Média reduzida depois |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 4.29 | 5.06 | 7.00 | 8.10 | 2.36 |
| 2 | 2.99 | 3.64 | 3.90 | 5.10 | 2.17 |
| 3 | 3.01 | 4.13 | 4.20 | 6.10 | 2.36 |
| 4 | 3.21 | 4.08 | 5.70 | 6.60 | 2.25 |
| 5 | 3.23 | 3.62 | 5.90 | 5.10 | 1.88 |
| 6 | 3.17 | 3.93 | 5.80 | 6.30 | 2.01 |
| 7 | 3.18 | 3.55 | 5.40 | 5.70 | 2.27 |
| 8 | 3.03 | 3.86 | 5.70 | 6.00 | 1.97 |
| 9 | 3.08 | 2.41 | 5.50 | 4.50 | 1.37 |
| 10 | 2.26 | 2.35 | 4.60 | 4.20 | 1.38 |

Diferença média observada entre as dez fases: +0.52 ms por desenho do fundo. São execuções separadas, sujeitas à variação da máquina; a diferença não isola causalmente o custo de cada efeito. O modo reduzido elimina o novo passe decorativo. Hardware acrescenta 256 KiB de cache para quatro marcos regionais; as outras fases reutilizam seus atlas existentes. O limite total verificado é de 4 MiB por parallax.

## Jogo completo — update + draw

Mesmo navegador sem GPU; 24 quadros de aquecimento e 60 amostras por mapa, com nove posições de câmera. Este benchmark inclui combate e um mapa procedural de 24 salas. Os componentes são marcados como reparados por esse teste preexistente.

| Mapa | Média antes | Média depois | p95 antes | p95 depois |
| --- | ---: | ---: | ---: | ---: |
| 1 | 28.16 | 29.78 | 51.00 | 55.90 |
| 2 | 30.27 | 30.08 | 49.60 | 51.90 |
| 3 | 13.98 | 17.70 | 32.40 | 30.00 |
| 4 | 14.05 | 18.52 | 32.00 | 30.60 |
| 5 | 13.46 | 21.89 | 29.70 | 41.50 |
| 6 | 23.86 | 28.83 | 41.30 | 48.30 |
| 7 | 23.53 | 26.95 | 45.80 | 45.80 |
| 8 | 17.79 | 14.72 | 41.70 | 35.30 |
| 9 | 14.36 | 14.35 | 34.30 | 30.30 |
| 10 | 16.24 | 14.76 | 33.00 | 29.80 |
| procedural-24 | 14.10 | 13.61 | 30.40 | 26.70 |

O orçamento local de p95 ≤ 16,7 ms reprovou em 11 casos antes e 11 depois. Essa reprovação permanece registrada e não foi removida nem teve o limite relaxado. Os caches ficaram dentro do limite. Não há certificação de 60 FPS; uma otimização global e uma medição com GPU em hardware real continuam necessárias para esse objetivo.

## Reprodução

```powershell
python tests/run_review.py --ambient-only
python tests/run_review.py --ambient-performance
python tests/run_review.py --performance-only
python tests/run_review.py
python tests/report_ambient.py
```

`--performance-only` retorna código 1 quando reprova o orçamento de frame; o JSON conserva todas as medidas. As medições anteriores estão em `tests/ambient-before-background-performance.json` e `tests/ambient-before-full-performance.json`. As posteriores estão em `tests/ambient-performance-results.json` e `tests/ambient-after-full-performance.json`. O resumo está em `tests/ambient-summary.json`.
Fontes finais: `f6a2bac4e9cae7df4dbfa0a366faa38716fa2a407023c508a31efd05dd5c78f6`.
