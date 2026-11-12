# Fase 4 — reparos do roteador

Quatro tarefas substituem as mecânicas antigas sem alterar IDs, ordem dos componentes, mapas, saves ou o fluxo de recompensas de `game.js`.

| Objetivo existente | Nova tarefa |
| --- | --- |
| `gateway-tower:gateway` | Restauração do gateway: volante, ponte externa e três entregas |
| `iface-lan:lan` | Reparo físico das interfaces LAN/WAN |
| `core-main:table` | Núcleo de roteamento: módulos giratórios, vias e CPU |
| `wan-relay:link` | Reconstrução da topologia e teste da rota superior |
| `iface-console:transit` | Reconstrução da topologia e teste da rota alternativa |
| `iface-wan:wan` | Substituição de conectores, módulos e cabos do painel traseiro |

As duas rotas disponíveis são válidas em ambas as bancadas de topologia; a dica inicial varia por objetivo. O enlace vermelho está rompido e não aceita conexões. A confirmação exige três pacotes percorrendo a rota.

O painel de interfaces exige isolamento elétrico antes da retirada. Cada módulo precisa ocupar sua baia e receber o cabo correto antes da ativação. O gateway distingue o destino do pacote e a posição da ponte física; uma saída incorreta devolve o pacote. O núcleo exige os três módulos alinhados e as três vias conectadas antes de iniciar a energização.

Os modelos não escrevem na campanha. Mantêm a transição existente `playing → won → success`; o jogo continua responsável por integridade, corrupção, eventos, XP, objetivos e gravação do progresso. Nenhuma recompensa é emitida durante a animação.

Validação:

- `python tests/run_router_minigames_ui.py`: seis objetivos com mouse, toque emulado e teclado; bloqueios de sequência, pausa, percursos animados, alvos de toque, responsividade e armazenamento isolado. Evidências em `tests/router-minigames-gallery/`.
- `python tests/run_review.py --router-repairs --result-label router-minigames-campaign`: 120 variações, duas rotas válidas, conclusão dos seis objetivos na campanha, XP, saves, prevenção de recompensas duplicadas, pausa, cancelamento, falha e nova tentativa.

O toque é emulado no Chrome; dispositivos físicos não são cobertos.
