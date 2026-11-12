# Fase 10 — reparos avançados de servidores

Quatro bancadas finais em pixel art preservam os 12 componentes, sua ordem, as condições de progressão e o combate de VIRUS ZERO. Não há alterações em `game.js` nem no mapa `src/maps/10-servers.js`.

| Objetivos | Tarefa |
| --- | --- |
| `c01`, `c06`, `c11` | Restauração de energia: fontes redundantes, aterramento, cabos e partida |
| `c02`, `c10`, `c12` | Emergência de refrigeração: ventoinhas, ar frio e estabilidade térmica |
| `c05`, `c03`, `c09` | Balanceamento de processamento entre servidores |
| `c07`, `c08`, `c04` | Ativação de relés e restauração do núcleo |

`c04` recebe a ativação do núcleo final; `c05` usa o balanceamento dos módulos de processamento do backbone. Permanecem três objetivos por tarefa, sem mudança nos IDs usados por plataformas, portas, eventos, saves ou escudo do chefe.

## Energia

O rack exige isolamento, aterramento e três fontes. Os canais A/B precisam de 48 V e pelo menos 600 W; o controle precisa de 12 V e pelo menos 120 W. As duas fontes redundantes de 800 W podem trocar de canal, mas uma fonte de tensão incorreta é rejeitada. Cada cabo retorna ao próprio canal. A partida valida fontes, barramentos e serviços em sequência antes de confirmar o reparo.

## Refrigeração

Dois racks têm ventoinhas avariadas; a ventoinha central íntegra precisa ser preservada. A substituição exige isolamento e encaixe na baia correspondente. As venezianas direcionam o ar frio fisicamente para os racks. Podem ser ajustadas durante o funcionamento: a temperatura responde à orientação real. A conclusão exige os três racks até 55 °C, com ar direcionado corretamente e estabilidade contínua. Um fluxo incorreto mantém o aquecimento.

## Processamento

Seis módulos têm pesos de CPU diferentes e ocupam três servidores com capacidades de 10, 12 e 8 unidades. A situação inicial contém sobrecarga. Transferências que sobrecarregariam o destino são rejeitadas; a bancada temporária permite liberar espaço durante trocas. A validação exige atender todos os módulos, reservar pelo menos 15% da capacidade de cada servidor e manter a diferença de utilização em até 25 pontos percentuais. Diferentes distribuições válidas são aceitas. Uma fila de testes animada confirma o equilíbrio.

## Núcleo

Os relés A, B e controle precisam estar reconectados e energizados. A pré-carga antecede refrigeração e relógio; os dois ramos podem ser acionados em qualquer ordem. O sincronismo depende de ambos. Cada mecanismo aguarda a energia terminar de se propagar antes de liberar seus dependentes.

A ativação final só começa após todas as dependências. A sequência apresenta fechamento dos anéis, carregamento central, onda de restauração e estabilidade do núcleo. Anéis, partículas, relés e iluminação permanecem dentro da bancada. A apresentação respeita a preferência de movimento reduzido sem pular as confirmações necessárias.

## VIRUS ZERO e campanha

Os modelos não manipulam o chefe, o estado da campanha ou recompensas. A animação de restauração conclui apenas o minigame. O fluxo existente `playing → won → success` emite o reparo normal, restaura o componente e mantém XP e saves.

VIRUS ZERO continua exigindo todos os componentes para liberar seu escudo. O núcleo não o derrota automaticamente. Permanecem as três fases, os limiares de 67% e 34%, a proteção de transição, os avisos de ataque, o multiplicador do ponto fraco e a pergunta final obrigatória antes da vitória persistida.

## Validação

- `python tests/run_review.py --servers-repairs --result-label servers-minigames-campaign`: 120 variações determinísticas, compatibilidade elétrica, fontes intercambiáveis, refrigeração em tempo de execução, preservação da ventoinha íntegra, capacidade e distribuições equivalentes, dependências ramificadas, sequência completa do núcleo, 12 reparos reais com XP e saves, pausa, cancelamento, falha e nova tentativa. Inclui regressões do escudo, fases, transições, avisos, ponto fraco, pergunta final e conclusão persistida de VIRUS ZERO.
- `python tests/run_servers_minigames_ui.py`: 12 objetivos com mouse, toque emulado e teclado; fontes, cabos, ventoinhas, venezianas, módulos de CPU, bancada temporária, relés e mecanismos. Também verifica rejeições, animações, onda final, alvos de toque, responsividade e armazenamento isolado. Evidências em `tests/servers-minigames-gallery/`.

O toque é emulado no Chrome; aparelhos físicos não são cobertos. Os valores elétricos e térmicos pertencem à simulação do jogo.
