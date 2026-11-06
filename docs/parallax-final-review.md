# BYTE RUNNER — revisão final do parallax

Implementação finalizada, com otimizações de desenho e apresentação, auditoria de câmera e pixel art, verificação de memória e regressão dos sistemas existentes. As limitações de alta densidade permanecem registradas abaixo.

[Galeria final](../tests/parallax-final-gallery.html) · [Progresso completo](../PROGRESSO_MAPAS.md)

## Melhorias e problemas corrigidos

- Planos estáticos continuam em cache, agora com limites de pixels não transparentes calculados pelo gerador. O desenho pula variantes vazias e recorta cada trecho ao viewport; nenhum trecho de plano é enviado fora da área visível.
- O gradiente de tela inteira que ficava encoberto pelo fundo opaco foi removido do caminho nativo. O fallback anterior continua disponível quando o atlas não está carregado.
- Ventoinhas reutilizam quatro frames raster em cache. A composição regional usa uma superfície fixa de 256 × 256, atualizada somente quando muda a região, a mistura quantizada em 64 passos ou a imagem. Não são criadas novas superfícies por frame nem durante viagens e redimensionamentos.
- Descritores, recortes, condições de reparo e parâmetros de animação foram preparados fora do loop. Arrays de braços de ventoinha e pares de mistura deixaram de ser montados a cada desenho.
- O índice de monitores passou a usar módulo positivo para evitar deslocamentos incorretos com coordenadas negativas. O culling dos sinais de dano considera a extensão real dos pequenos efeitos nas bordas.
- Em DPR efetivo 1 e dimensões lógicas inteiras, o jogo desenha diretamente no Canvas de saída, eliminando a cópia integral do framebuffer. O buffer intermediário é liberado nesse modo. Em DPR maior ou layout fracionário, o caminho escalado continua ativo, com nearest-neighbor.
- Os dois framebuffers são opacos e o estado básico de fonte/alinhamento/traço é definido explicitamente ao iniciar a cena. Os caminhos direto e intermediário produzem os mesmos pixels na comparação em superfícies equivalentes.
- O descarte zera as dimensões das superfícies e remove referências às imagens. A identidade das dez fases, os efeitos discretos e as opções de conforto foram preservados.

## Arquivos modificados nesta etapa

| Arquivo ou grupo | Finalidade |
| --- | --- |
| `game.js` | Somente construtores de Canvas e caminho de apresentação; lógica de jogo preservada por normalização exata e hashes. |
| `src/engine/parallax.js` | Recortes visíveis, descritores preparados, cache, métricas e descarte. |
| `src/engine/parallax-life.js` | Cache de ventoinhas e mistura regional, menos alocações e correções de borda/índice. |
| `src/engine/background-scene.js` | Remoção do preenchimento redundante no caminho nativo. |
| `tools/build_environment_art.py` | Geração offline de `frameBounds` por variante. Nenhum redesign de sprites ou paletas. |
| `assets/pixelart/manifest.json`, `src/engine/art-manifest.js` | Metadados de recorte dos atlas. |
| `tools/check_environment.py`, `tools/check_parallax.py`, `tools/check_hardware_depth.py` | Guardas das alterações exatas de apresentação e verificação dos limites dos sprites. |
| `tests/run_review.py`, `tests/parallax-final.js` | Auditoria de referência, três resoluções, câmera, descarte, DPR e captura de evidências. |
| `tests/profile-render.js`, `tests/final-performance.js`, `tests/parallax-frame-pacing.js`, `tests/run_parallax_performance_matrix.py` | Perfil de custos, matriz de resoluções e intervalos reais de RAF. |
| `tests/parallax-depth.js`, `tests/parallax-ambient.js` | Offsets verificáveis mesmo sem blits vazios; limite explícito dos novos caches. |
| `tests/fixtures/parallax-before-final.js`, `tests/fixtures/parallax-life-before-final.js` | Código anterior preservado exclusivamente para comparação nos testes. |
| `tests/report_final_parallax.py`, relatórios JSON, capturas PNG e galeria | Evidências reproduzíveis. |
| `PROGRESSO_MAPAS.md`, este relatório | Registro final e limitações. |

## Testes realmente executados

| Teste | Resultado executado |
| --- | --- |
| Regressão completa — `python tests/run_review.py` | 209/209; dez fases; 92 capturas; zero erros de runtime. |
| Auditoria final — `--parallax-final` | 43/43 no viewport padrão; 43/43 em 1920 × 1080, DPR 2. |
| Ambiente, conforto e personagem — `--ambient-only` | 61/61; 30 posições de apoio reais. |
| Benchmark de fundo — `--ambient-performance` | Dez fases, modo normal e reduzido, 24 frames de aquecimento e 120 amostras por caso. |
| Matriz de desempenho — `tests/run_parallax_performance_matrix.py` | 33 casos de update + draw e 12 amostragens de RAF, incluindo mapa procedural de 24 salas. Reprovações do orçamento ficam registradas. |
| Integridade | `check_parallax.py`, `check_environment.py`, `check_hardware_depth.py`, `check_maps.py`, `check_generation.py` e `git diff --check` executados. |

Os totais são apresentados por suíte e têm cobertura sobreposta. O benchmark não transforma reprovações de orçamento em testes aprovados.

### Sistemas preservados

A regressão executou as dez fases, física e colisões, câmeras horizontal/vertical, inimigos e seus ataques, plataformas móveis/temporárias, reparos, todos os tipos de minigame, habilidades, compatibilidade de saves, perguntas e vitória, além de ativação, escudo, fases, telegráficos e derrota de VIRUS ZERO. Os módulos de mapas, runtime, física e câmera permanecem protegidos por hashes. Somente os trechos exatos de apresentação em `game.js` são normalizados para permitir a comparação do restante do arquivo.

### Câmera, pixel art e leitura

A comparação contra o renderer e o módulo ambiental anteriores executou 394 amostras por configuração em 320 × 180, 905 × 644 e 1920 × 1080. Incluiu limites específicos de cada camada, deslocamento diagonal, ida e volta, mudanças rápidas de direção e coordenadas negativas. O maior desvio observado por canal foi 2 níveis em 255, compatível com a composição em cache; não houve pixels com desvio acima de cinco. A comparação da cena inteira entre apresentação direta e framebuffer, em superfícies físicas equivalentes, teve desvio máximo 0 em DPR 2.
Nearest-neighbor permaneceu desativando suavização no framebuffer, sprites e caches, inclusive após redimensionar. Os recortes são inteiros e as variantes têm margens transparentes verificadas; nenhum sprite foi suavizado ou substituído por desenho de outra identidade.
No pior dos 30 apoios auditados, 89.21% dos pixels claros detectados no personagem ficaram pelo menos 40 níveis de luminância acima da cena imediatamente anterior ao seu desenho. A inspeção visual das capturas confirmou os contornos mais fortes de plataformas, personagens, inimigos e equipamentos interativos; os elementos decorativos permanecem escuros e em passes anteriores. Essa é uma amostragem, sem alegação de cobrir toda combinação possível de posição, combate e efeitos.

## Desempenho e quedas de FPS

### Fundo isolado, comparação com a etapa anterior

Condições: Chrome headless, GPU desativada, Canvas 905 × 644; nove posições de câmera; conclusão forçada da rasterização com leitura de um pixel. A referência anterior foi preservada no início desta etapa. Execuções separadas têm variação da máquina.

| Fase | Média anterior (ms) | Média final (ms) | p95 anterior (ms) | p95 final (ms) |
| --- | ---: | ---: | ---: | ---: |
| 1 | 5.06 | 2.86 | 8.10 | 4.30 |
| 2 | 3.64 | 2.81 | 5.10 | 4.60 |
| 3 | 4.13 | 2.78 | 6.10 | 4.90 |
| 4 | 4.08 | 3.18 | 6.60 | 5.40 |
| 5 | 3.62 | 2.35 | 5.10 | 4.00 |
| 6 | 3.93 | 2.15 | 6.30 | 3.20 |
| 7 | 3.55 | 2.69 | 5.70 | 4.00 |
| 8 | 3.86 | 3.11 | 6.00 | 5.70 |
| 9 | 2.41 | 2.47 | 4.50 | 4.30 |
| 10 | 2.35 | 2.69 | 4.20 | 4.80 |

Média entre fases: 3.66 → 2.71 ms, diferença observada de 26.1%. O perfil anterior de update + draw nesta etapa mediu 32.01 ms por quadro; o perfil final mediu 10.07 ms. Esses tempos não substituem os intervalos de apresentação abaixo.

### Apresentação real por RAF

Fases amostradas: Hardware, Software, Servidores e mapa procedural de 24 salas. Cada caso teve 12 quadros de aquecimento e 90 intervalos nativos de `requestAnimationFrame`, com a fase iniciada e o menu fechado, passo de simulação 1/60 e deslocamento diagonal sintético da câmera. O teste inclui o compositor do navegador, além do update + draw.

| Configuração | Canvas lógico / DPR efetivo | FPS observados nos quatro cenários | Intervalo p95 (ms) | Orçamento CPU p95 ≤ 16,7 ms |
| --- | --- | --- | --- | --- |
| desktop | 905 × 644 / 1 | 59.3, 55.7, 59.3, 58.1 | 16.7, 33.3, 16.7, 16.7 | 10/11 aprovados |
| mobile | 454 × 438 / 1 | 60.0, 60.0, 60.0, 60.0 | 16.8, 16.7, 16.7, 16.7 | 11/11 aprovados |
| retina | 1179 × 819 / 1.5 | 41.9, 38.9, 42.2, 36.7 | 33.4, 33.4, 33.4, 33.4 | 0/11 aprovados |

O desktop ainda teve quedas pontuais e um caso acima do orçamento de CPU; o modo de alta densidade manteve quedas mais fortes e reprovou o orçamento nas onze cargas sem GPU. O mobile medido atingiu aproximadamente 60 FPS nessa simulação. Não há garantia universal de 60 FPS. Uma medição com GPU habilitada, hardware real e sessões humanas longas permanece necessária para concluir sobre dispositivos específicos.

## Memória e reaproveitamento

Pico de superfícies do parallax: 4,200,704 bytes (4.006 MiB), dentro do limite auditado de 4,25 MiB. O descarte deixou 0 bytes nessas superfícies, mesmo com o objeto de serviço ainda referenciado. O quadro regional adicional ocupa 256 KiB; cada atlas de quatro ventoinhas ocupa 6.400 bytes. Esse pequeno custo fixo de memória reduz operações e reconstruções de desenho.
Após aquecimento, sessenta desenhos na mesma câmera criaram zero novos canvases, mantiveram os mesmos strips e não reconstruíram a mistura regional. Viagens longas e redimensionamentos não aumentaram esses caches. O mapa grande auditado tem 14.592 × 2.304 pixels; o parallax não aloca texturas do tamanho do mundo.
As contagens são das superfícies RGBA gerenciadas, não do RSS total do processo, heap completo ou VRAM. O pool compartilhado de PNGs e os caches de terreno têm limites próprios; a matriz também registra bytes dos framebuffers e limite de 96 chunks. Em apresentação direta, o framebuffer intermediário tem dimensão zero.

## Correções de metodologia e limites

A auditoria inicial em Retina comparava uma superfície física maior com uma menor ao forçar DPR 1; isso permitia que efeitos fora da borda lógica entrassem na comparação. A câmera também começava fora do envelope normal de acompanhamento. Os fixtures foram corrigidos, sem relaxar o limite de pixels ou alterar a física/câmera. A reprovação inicial está em `tests/parallax-final-initial-retina.json`.
A primeira medição por RAF deixava o menu com blur sobre o Canvas. O teste passou a iniciar efetivamente a fase e verificar que o menu está oculto. A matriz inicial foi preservada em `tests/parallax-final-initial-matrix.json`; as medições finais acima são do jogo iniciado.
A equivalência numérica permite arredondamento de composição do cache, não alterações de silhueta. Os testes de leitura e emendas cobrem posições e tempos definidos, sem substituir inspeção em todos os monitores, zooms, drivers ou estados possíveis. A matriz foi executada em Chrome headless com GPU desativada; não houve teste humano contínuo nem medição de bateria.

## Reprodução e evidências

```powershell
python tools/build_environment_art.py --parallax-all
python tests/run_review.py --parallax-final
python tests/run_review.py --parallax-final --viewport 1920x1080 --dpr 2 --result-label parallax-final-retina
python tests/run_review.py --ambient-only
python tests/run_review.py --ambient-performance --result-label parallax-final-background-performance
python tests/run_review.py --profile-render --result-label parallax-final-profile
python tests/run_parallax_performance_matrix.py
python tests/run_review.py
python tests/report_final_parallax.py
```

Os cinco scripts de integridade e `git diff --check` completam a verificação. `--performance-only` mantém retorno 1 quando há reprovações de orçamento; a matriz conserva essas reprovações, completando a medição se não houver erro de runtime, cache ou fonte.
Fontes finais: `ddf1cacc2559935f83f9194b2f29951effe78bca08ec7a1b268b511dd0b246da`. Resumo: `tests/parallax-final-summary.json`. Resultados completos: `tests/parallax-final-results.json`, `tests/parallax-final-retina-results.json`, `tests/parallax-ambient-results.json`, `tests/review-results.json` e `tests/parallax-final-performance-matrix.json`.
