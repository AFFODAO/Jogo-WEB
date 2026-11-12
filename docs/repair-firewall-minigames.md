# Fase 9 — reparos de firewall

Quatro tarefas originais em pixel art preservam os oito objetivos, sua ordem, os mapas e a integração da campanha.

| Objetivos | Tarefa |
| --- | --- |
| `c01`, `c03` | Motor de regras: módulos físicos em prioridades e testes de primeira correspondência |
| `c02`, `c04` | Bloqueio de pacotes: portas de proteção e descarte intertravadas |
| `c05`, `c06` | Barreira de segurança: orientação dos emissores e reconexão elétrica |
| `c07`, `c08` | Scanner de ameaças: assinatura, integridade e quarentena |

## Mecânicas e políticas

No bloqueio de pacotes, o cabeçalho mostra origem, destino, protocolo, porta e estado. A política nega a origem `203.0.113.66` e conexões inválidas antes de considerar permissões. Permite conexões estabelecidas, HTTPS em TCP 443, consultas DNS destinadas a `192.0.2.53` em UDP 53 e SSH em TCP 22 do administrador `10.0.0.10`. O restante é bloqueado. As duas portas precisam formar uma configuração coerente de liberação ou descarte. Pacotes chegam a um posto de espera, sem prazo de reação; a decisão é confirmada pelo percurso animado. Decisões incorretas não avançam a fila.

Na barreira, três emissores giram até as orientações de entrada indicadas. Cada alimentação precisa retornar ao acoplador de seu segmento. A energia só é liberada com os três módulos alinhados e conectados. Os segmentos recebem energia em sequência; a tarefa termina com 100% de proteção. `c06` usa orientações diferentes das de `c05`.

O scanner exige inspeção antes da classificação. A base de assinaturas identifica `MAL-01` e `EXP-02`; integridade inválida também exige quarentena. Pacotes íntegros sem essas assinaturas são liberados. HTTPS não substitui inspeção de conteúdo: um pacote pode passar pela política de transporte e ainda conter uma assinatura maliciosa. `c08` acrescenta um pacote com falha de integridade. O scanner revela o relatório antes de permitir o arraste até a saída limpa ou a câmara de quarentena. Uma classificação incorreta devolve o pacote para correção.

O motor de regras possui quatro módulos: negar origem hostil, permitir HTTPS, permitir SSH administrativo e negar o restante. Os módulos podem ser inseridos, deslocados ou trocados entre prioridades. Cada pacote é avaliado em ordem até a primeira regra correspondente; as regras posteriores não são consultadas. Os testes mostram prioridade, decisão real e resultado esperado. Uma permissão HTTPS anterior ao bloqueio da origem hostil falha; o bloqueio geral anterior às exceções também falha. Mais de uma ordem semanticamente correta é aceita, sem depender da ordem sugerida pela dica.

O motor representa uma única cadeia com decisões terminais. A semântica de avaliação segue os conceitos documentados no [manual do nftables](https://netfilter.org/projects/nftables/manpage.html). As políticas de transporte e do motor de regras são perfis distintos e ficam descritas em cada bancada. Toda a simulação é interna ao jogo.

## Integração e validação

Os modelos não concedem XP nem gravam saves. A campanha mantém o fluxo `playing → won → success`, a restauração da integridade, os eventos de reparo, as recompensas e o salvamento existentes.

- `python tests/run_review.py --firewall-repairs --result-label firewall-minigames-campaign`: 120 variações, políticas por cabeçalho, intertravamento, inspeção de conteúdo, preservação de tráfego legítimo, sequência de energia, primeira correspondência, ordens equivalentes e oito reparos com XP, saves, pausa, cancelamento, falha e nova tentativa.
- `python tests/run_firewall_minigames_ui.py`: oito objetivos com mouse, toque emulado e teclado; portas, emissores, cabos, scanner, quarentena, módulos de regras, rejeições, animações, alvos de toque, responsividade e armazenamento isolado. Evidências em `tests/firewall-minigames-gallery/`.

O toque é emulado no Chrome; aparelhos físicos não são cobertos.
