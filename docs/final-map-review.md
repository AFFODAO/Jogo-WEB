# Revisão técnica final dos mapas

Esta etapa preserva a física, as perguntas, os minigames, as habilidades e o combate de VIRUS ZERO. As seeds e aprovações estão em [resultados executados](final-map-results.md), com evidências em [final-audit-summary.json](../tests/final-audit-summary.json). Cada resultado inclui o SHA-256 das fontes de produção; o agregador rejeita resultados de outra versão ou com falhas.

## Implementação e correções

- `src/engine/map-audit.js`: inspeção de conectividade, apoios físicos, saída, componentes e assinaturas geométricas; modelo discreto sem alterar o jogo.
- `src/engine/map-debug.js`, `index.html`, `game.js`: painel opcional com `?dev=1`; F9 mostra/oculta com foco no jogo. Exibe mapa inteiro, colisões, salas, conexões, objetivos, checkpoints e seed. “Analisar acessibilidade” marca salas sem acesso e apoios ainda não comprovados. Permite exportar PNG.
- `src/engine/environment-art.js`: camadas de parallax pré-escaladas em três faixas repetíveis, preservando composição, partículas e profundidades. Evita reamostrar dezenas de regiões de atlas por frame; usa aproximadamente 4,5 MiB por serviço visual, com referências fracas. Testes comparam todos os pixels com a composição anterior, tolerando até 3 níveis por canal pela composição intermediária do alfa, e confirmam reutilização da cache.
- `src/generation/rooms.js`: espaço para o corpo entre o patamar de manutenção e a verga; degrau obrigatório fora da sombra do primeiro patamar do poço; abertura para retornar pelo lado oeste das salas com patamares superiores.
- `src/generation/structural.js`, `src/generation/gameplay.js`: revisão dos mapas para a migração existente de salvamentos; validação de dependências com a mesma precedência do runtime, orçamento recalculado pelos inimigos reais e checkpoints apoiados em superfícies permanentes incondicionais.
- `src/maps/05-wifi.js`: reposicionamento do inimigo `e02`, que nascia sobre uma plataforma. `tools/build_first_five.py` acompanha a correção.
- `src/maps/06-cabling.js`: três bandejas reparadas preservam um vão de retorno de 72 px no poço; os dois lados continuam conectáveis pelo salto básico. `tools/build_last_five.py` acompanha a correção. `src/generation/campaign.js` identifica essa geometria como revisão 4 para evitar restaurar coordenadas antigas.
- `tools/check_environment.py`, `tools/check_generation.py`, fixtures e expectativas de arquitetura: reconhecem somente as alterações explícitas acima; preservam a comparação do restante da campanha, física, reparos e chefe. `tests/fixtures/pre-final-campaign.json` mantém os dados anteriores às correções de Wi-Fi e Cabeamento.
- Testes acrescentados: `tests/final-maps.js`, `tests/final-regressions.js`, `tests/final-performance.js`, `tests/map-debug.js`, `tests/profile-render.js` e `tests/summarize_final_audit.py`. `tests/run_review.py` ganhou modos focados e identificação das fontes; `tests/review.js` ganhou a busca espacial e a travessia caminhando. `tests/architecture.js`, `tests/campaign-generation.js`, `tests/fixtures/first-five-v2.json` e `tests/fixtures/last-five-v2.json` acompanham somente as correções documentadas; `tests/environment-art.js` verifica a cache de parallax. Os JSON e PNG de resultados são evidências produzidas pelos testes.

## Testes e reprodução

Executar a partir da raiz com Python e Chrome instalados:

```powershell
python tools/check_maps.py
python tools/check_generation.py
python tools/check_environment.py
python tests/run_review.py --final-phase 1
# Repetir --final-phase 2 até --final-phase 10.
python tests/run_review.py
python tests/run_review.py --final-regressions
python tests/run_review.py --debug-only
python tests/run_review.py --gameplay-demo
python tests/run_review.py --procedural-demo
python tests/run_review.py --environment-only
python tests/run_browser_audit.py
# Sem outros testes de navegador concorrentes durante a medição:
python tests/run_review.py --performance-only
python tests/summarize_final_audit.py
```

`tests/final-maps.js` usa, para cada fase NN de 01 a 10, as seeds literais `phase-NN-review-alpha`, `phase-NN-review-beta` e `phase-NN-review-gamma`. Cada seed é executada na receita híbrida da campanha e no gerador de gameplay com 12 salas: 60 casos. Recompila a mesma seed e compara os dados completos; compara geometria entre seeds, sem depender de cor. A seed gamma também ativa portais no gerador.

Em cada caso, a busca executa o movimento e as colisões reais, sem habilidades opcionais. Abre e resolve o minigame nativo pela interface, recalcula caminhos após cada reparo, verifica retorno, saída, todas as salas e plataformas, interativos, portais, sobreposições e checkpoints. Exercita morte, expiração da invulnerabilidade e retorno das plataformas temporárias. O índice espacial de teste preserva a ordem dos colisores e tem teste de equivalência; não substitui a física do jogo.

A campanha conserva macroarquiteturas autorais próprias; suas seeds variam rotas de serviço. Isso não significa gerar uma nova topologia completa a cada seed. O gerador de salas é avaliado separadamente. Os totais e assinaturas por fase estão nos dez arquivos `tests/final-phase-NN-results.json`.

A suíte geral cobre movimento, salto, colisões, plataformas móveis/temporárias/cadentes, inimigos, dano, morte, respawn, reparos, XP, habilidades, perguntas, salvamento, câmera e etapas/ataques de VIRUS ZERO. A auditoria de navegador verifica sete tamanhos de tela, controles por teclado e toque e recarga real com persistência. Os testes focados verificam o modo de desenvolvimento e o isolamento dos salvamentos procedural/campanha.

## Reprovações e limites

As reprovações anteriores foram mantidas em `tests/final-audit-initial-*.json` e `tests/final-validator-initial-failures.json`. Incluem degraus bloqueados, inimigo sobreposto, fechamento do retorno após reparo e falsos positivos dos validadores. Uma execução inicial foi interrompida por lentidão do próprio verificador; não foi classificada como mapa aprovado nem como bug de gameplay. A busca também recebeu uma correção para reconhecer caminhada entre apoios contíguos sob teto baixo; isso não mudou a física.

O painel de debug usa uma fotografia com plataformas congeladas e atributos básicos. Laranja significa “acesso não comprovado”, não prova de impossibilidade. Efeitos ambientais, dano e temporização são verificados em testes de gameplay separados. Há cobertura de três seeds por fase, não de todas as seeds possíveis. A busca física não é uma partida humana contínua; o equilíbrio de sobrevivência ainda merece avaliação manual. O benchmark mede `update+draw` local em Chrome headless sem GPU, com limite declarado de p95 de 16,7 ms e cache de até 96 chunks. A medição inicial reprovou o orçamento de frame nas dez fases e no mapa de 24 salas; o custo dominante estava na rasterização/presentação. A cache de parallax foi acrescentada e retestada. As medições finais, inclusive eventuais reprovações remanescentes, estão na tabela de resultados. Não há garantia de 60 FPS em renderização por software ou em dispositivos reais não medidos.
