# Geração híbrida das fases 1 a 5

As cinco fases da campanha passam pelo compositor existente (`mapGeneration.compile`). Cada tema possui seu próprio gerador, seed, configuração, arquitetura autoral e rotas de serviço. A campanha usa seeds fixas: reiniciar, morrer ou recarregar não sorteia outra geometria.

Esta implementação usa **um macrotemplate autoral por mundo**, com acréscimos procedurais limitados às rotas de serviço. Não usa o grafo genérico de Hardware para preencher todos os temas. A receita contém o blueprint completo e pode ser recompilada sem estado externo; as larguras das plataformas adicionais usam o RNG recebido. Não há sorteio de topologia durante a partida.

| Fase | Arquitetura e configuração | Arquivo integrado | Teste isolado executado |
| --- | --- | --- | --- |
| 1 — Hardware | Placa-mãe com setores CPU/RAM/GPU, circuitos, pontes por reparo e rota adicional de barramento; seed `motherboard-v3`, layout `horizontal` | `src/maps/01-hardware.js` | `python tests/run_review.py --phase 1` — aprovado |
| 2 — Software | Hub Desktop, salas de processos/arquivos/escalonador, janelas, oito atalhos de diretório, caches e rota adicional de manutenção; seed `desktop-v3`, layout `hub` | `src/maps/02-software.js` | `python tests/run_review.py --phase 2` — aprovado |
| 3 — Switch | Backplane central, quatro ramais Ethernet, portas acionáveis, conexões reparáveis, rota de pacotes e elevador de transmissão; seed `backplane-v3`, layout `multi-route` | `src/maps/03-switch.js` | `python tests/run_review.py --phase 3` — aprovado |
| 4 — Roteador | Túneis LAN/trânsito/WAN, bifurcações, falhas contornáveis, interfaces e rota reserva após reparos, caminho adicional de diagnóstico; seed `routing-v3`, layout `maze` | `src/maps/04-router.js` | `python tests/run_review.py --phase 4` — aprovado |
| 5 — Wi-Fi | Subida entre antenas e repetidor, sinais móveis/temporários, zonas de interferência, canal limpo por reparo e plataformas adicionais; seed `radio-v3`, layout `vertical` | `src/maps/05-wifi.js` | `python tests/run_review.py --phase 5` — aprovado |

Cada arquivo de fase foi integrado e testado antes da integração do seguinte. Os cinco relatórios ficam em `tests/phase-01-results.json` até `tests/phase-05-results.json`.

Os testes isolados verificaram carregamento de arte, renderização, câmera, acesso aos reparos com resolução dos minigames pelos controles DOM, plataformas, coletas, interativos, atalhos, saída, combate, checkpoints, respawn, limites, save, perguntas com erro/repetição/acerto e transição. A travessia usa salto e velocidade básicos, sem habilidades opcionais. O elevador é adicional; a espinha fixa do Switch permanece disponível.

## Arquivos compartilhados alterados

- `src/generation/campaign.js`: cinco geradores, configurações e adaptação das receitas ao contrato de campanha; preserva IDs, flags e ordem das entidades. Revisão 3 aciona a migração existente de saves da geometria anterior.
- `index.html`: carrega os geradores antes dos cinco módulos de fase.
- `tests/run_review.py`: modos `--phase 1` a `--phase 5` e `--campaign-generation`.
- `tests/campaign-generation.js`: reprodução e pureza das receitas, preservação de objetivos e entidades, configurações distintas, limites de salto e transporte pelo elevador.
- `tests/architecture.js` e `tests/generation.js`: contratos atualizados para a ativação explícita dos cinco geradores, mantendo a comparação com os blueprints anteriores.
- `tools/check_maps.py`: lê também definições envolvidas pela compilação híbrida.
- `tools/check_generation.py`: mantém proteção byte a byte do manifesto e das fases 6–10; confere ordem de dependências da integração nova.
- `tools/build_first_five.py`: mantém a chamada de compilação ao exportar os blueprints.

Verificações adicionais executadas: `python tools/check_maps.py`, `python tools/check_generation.py`, `python tests/run_review.py --campaign-generation` e `git diff --check`. O relatório específico da geração é `tests/campaign-generation-results.json`. A regressão completa usa `python tests/run_review.py` e grava `tests/review-results.json` e capturas em `tests/snapshots/`.

Objetivos, componentes, inimigos, coletas, perguntas, minigames e assets permanecem no contrato anterior. O renderer continua usando os tilesets pixel art. Os arquivos de mapa das fases 6–10 não foram alterados.

Limitação dos testes: a busca de alcançabilidade usa a física real entre superfícies, com reposicionamento entre arestas comprovadas e proteção contra dano. Não representa uma partida humana contínua nem mede o equilíbrio de sobrevivência.

Resultado final da regress?o completa: 10 fases verificadas, 114/114 verifica??es de sistemas aprovadas, 71 capturas e zero erros de runtime. O fingerprint do relat?rio corresponde ao c?digo final.
