# Fase 3: reparos do switch

Os seis objetivos existentes preservam suas identidades e usam quatro tarefas:

| Objetivo | Tarefa |
| --- | --- |
| matrix-north:table | Roteamento de pacotes |
| core-guard:fabric | Roteamento de pacotes |
| uplink-crown:uplink | Troca de modulo |
| port04:connector | Painel de conexoes RJ45 |
| port01:connector | Painel de conexoes RJ45 |
| channel-relay:bus | Ativacao de portas |

Regras: cabos aceitam somente a porta numerada; pacotes completam o percurso antes da entrega; o modulo exige desligar, abrir, retirar, inserir, fixar e religar; portas exigem pontes nas trilhas e somente as chaves solicitadas. LEDs e conclusao aguardam a energizacao.

Validacao: `python tests/run_switch_minigames_ui.py`. Executa os seis objetivos com mouse, toque emulado e teclado, incluindo rejeicoes, tamanho dos controles, ausencia de transbordamento e preservacao do armazenamento da campanha. Evidencias em `tests/switch-minigames-gallery/`.
