# Plano de migração dos minigames de reparo — BYTE RUNNER v2

Data do plano: 11/11/2026. Estado atual: 40 tarefas v2 implementadas em paralelo ao motor anterior, com atribuição dos 67 componentes e ativação na campanha.

### Atualização da fase 1 — Hardware

A fase 1 agora usa quatro tarefas físicas novas: instalação e orientação de CPU, três módulos DIMM compatíveis, cabos de alimentação da fonte e substituição completa de ventoinha. Os modelos estão em `src/engine/repair-hardware-models.js` e a arte original em `src/engine/repair-hardware-art.js`. A cena compartilhada ganhou zonas de encaixe múltiplas e rotação da peça segurada; a sessão aceita atualização de mecanismos por tempo de simulação para travas, ativação e estabilização térmica.

No laboratório, a CPU gira com a roda do mouse, R/setas ou o comando físico de rotação na bandeja. Mouse/toque podem arrastar, e o teclado pode selecionar peça e destino com Enter. Encaixes de CPU, RAM ou alimentação incompatíveis retornam à origem com indicação visual e mensagem acessível, sem penalidade. A alavanca da CPU só fecha depois do encaixe. A RAM tem três slots com entalhes distintos, inserção, presilhas automáticas e LEDs. A alimentação usa três cabos flexíveis com 24, 8 e 6 contatos. A ventoinha exige desconexão, remoção, reposição, quatro fixações e reconexão antes de girar e estabilizar em 54 °C. Todas as tarefas concluem automaticamente; a preferência por movimento reduzido conserva a lógica sem girar pás ou animar encaixes.

| Componente preservado | Tarefa atual | Relação com o objetivo existente |
| --- | --- | --- |
| `socket:cpu-relay` | `v2-fan-replacement` | Restabelece a refrigeração da CPU. |
| `ram-base:ram-relay` | `v2-ram-install` | Restaura o banco de memória. |
| `bus-west:bus-relay` | `v2-cpu-install` | O processador travado reativa a malha dos barramentos. |
| `gpu-east:gpu-relay` | `v2-power-wiring` | Restabelece a alimentação da placa-mãe e do banco da GPU. |

IDs, ordem das entidades, dependências, XP, penalidades, dicas e salvamento continuam sob o controlador existente. Essa etapa de Hardware encerrou-se na fase 1. A nova etapa de Software está registrada a seguir; as fases 3–10 conservam suas atribuições e mecânicas anteriores.

Validação específica: `python tests/run_review.py --hardware-repairs` em desktop e 390 × 844; `python tests/run_hardware_v2_ui.py` resolve as quatro tarefas no laboratório com mouse, toque emulado e teclado (12 execuções). A [galeria de Hardware](../tests/hardware-v2-gallery/index.html) mostra estados inicial, rejeitado, em ativação e concluído. Os relatórios estão em `tests/hardware-v2-desktop-results.json`, `tests/hardware-v2-mobile-results.json` e `tests/hardware-v2-gallery/results.json`. A regressão do catálogo (`tests/hardware-v2-catalog-regression-results.json`) cobre os 67 componentes e 800 variações; a travessia de Hardware (`tests/hardware-v2-stage-progression-results.json`) cobre acesso, checkpoints, salvamento e conclusão da fase. Toque em aparelho físico continua pendente; o teste usa emulação do Chrome.

### Atualização da fase 2 — Software

Quatro tarefas substituem as versões compactas anteriores de Software. `src/engine/repair-software-models.js` contém regras sem DOM ou gravação de arquivos; `src/engine/repair-software-art.js` desenha as quatro cenas originais. Arquivos, desktop, quarentena e sistema operacional são fictícios e pertencem apenas ao minigame.

| Componente preservado | Tarefa atual | Interação e conclusão |
| --- | --- | --- |
| `recovery:recovery` | `v2-virus-cleanup` | Analisar arquivos no desktop; arrastar as três ameaças à quarentena; preservar íntegros; concluir após a remoção animada das assinaturas. |
| `root:index` | `v2-file-recovery` | Arrastar seis fragmentos aos recortes de dois arquivos; imagens se recompõem visualmente antes da conclusão. |
| `scheduler:scheduler` | `v2-process-repair` | Mover módulos na esteira, ordenar carga/validação/execução/liberação e acionar a alavanca; módulos atravessam a CPU. |
| `kernel-stack:kernel` | `v2-process-repair` | Variante com dependências de núcleo, memória, serviços e saída, usando os mesmos controles físicos e outra ordem inicial. |
| `swap:paging` | `v2-system-restore` | Reconectar dois enlaces de inicialização, ligar carregador/memória/sistema nessa ordem e assistir ao reinício. |

Recortes incompatíveis e conectores trocados retornam sem consumir tentativa. Isolar arquivo reconhecidamente íntegro, executar sequência inválida ou forçar inicialização fora de ordem constitui uma tentativa incorreta. As penalidades continuam sendo aplicadas uma vez por tentativa esgotada pelo controlador da campanha. Dicas apenas orientam, não executam a solução. Conclusão e XP permanecem automáticos pelo contrato de reparo existente.

Mouse e toque arrastam os objetos; seleção seguida do destino e Enter permitem resolver pelo teclado. Também é possível selecionar dois módulos para trocá-los na esteira. Análise, exclusão, transporte de processos, reconstrução e reinício usam o relógio pausável da sessão. Resultados assíncronos de análise atualizam os nomes acessíveis sem substituir os elementos do desktop. A retomada pelo botão **Continuar** libera a sessão imediatamente, sem esperar o próximo quadro.

Validação: `python tests/run_review.py --software-repairs` em desktop e 390 × 844 cobre regras, erros, pausa real/explicíta, dicas, penalidades, retry, saves e movimento reduzido. `python tests/run_software_v2_ui.py` resolve os cinco componentes com mouse, toque emulado e teclado: **15 execuções completas**, sem modificar o armazenamento da campanha. A [galeria de Software](../tests/software-v2-gallery/index.html) inclui estados inicial, em análise/operação, falha e conclusão. Evidências: `tests/software-v2-desktop-results.json`, `tests/software-v2-mobile-results.json`, `tests/software-v2-gallery/results.json`, `tests/software-v2-catalog-regression-results.json` e `tests/software-v2-stage-progression-results.json`. A regressão do catálogo resolve 800 variantes e os 67 componentes; a travessia da fase verifica acesso aos reparos, checkpoints, save e progressão. Toque em aparelho físico permanece pendente. Esta atualização termina na fase 2.

## Escopo e decisão de projeto

Criar **40 conceitos distintos, quatro por fase**, para os **67 componentes existentes**. Mecânicas, controles, soluções e layouts antigos podem ser substituídos. Permanecem os componentes, objetivos e contratos da campanha. Toda comunicação ao jogador, incluindo nomes acessíveis, dicas, tutorial, erros e mensagens do laboratório, será em **português brasileiro**. Os identificadores técnicos abaixo não são rótulos de interface.

As tarefas de Among Us servem apenas como referência de manipulação direta e leitura visual. Equipamentos, silhuetas, paletas, efeitos e animações serão originais de BYTE RUNNER. Não copiar recursos, telas ou composição exata de terceiros. As referências locais em `assets/referencias-minigames` orientam escala e composição; não serão usadas como arte final.

O plano original e o catálogo detalhado permanecem abaixo como referência de direção. A implementação atual está descrita nesta seção; a remoção do motor anterior continua fora do escopo.

## Implementação disponível

- `src/engine/repair-v2-models.js`: 40 modelos sem DOM ou dependências de campanha. Cada modelo mantém estado, controles físicos, transições, condições de conclusão/erro e orientação para dicas. Recuperação de disco, filas de processos e despacho de pacotes variam também a quantidade de operações conforme dificuldade.
- `src/engine/repair-v2-renderer.js`: arte original desenhada em canvas de 320 × 280 pixels, apresentada no espaço lógico de 640 × 560. Composições próprias de placa-mãe, disco, esteiras, chassis, ferramentas, antenas, tubulações, árvore, eclusa e racks; nenhuma imagem de terceiros. O canvas desenha o equipamento, enquanto botões transparentes posicionados nas peças oferecem foco e nomes acessíveis.
- `src/engine/repair-v2-manifest.js`: 67 chaves estáveis por fase/componente, tipo novo, dificuldade, tipo anterior e descrição da variante planejada. A descrição da variante é metadado de planejamento; não significa que todas as características adicionais do catálogo já estejam simuladas.
- `src/engine/repair-v2.js`: catálogo, seleção determinística, sessão, dicas, erros, retry e conclusão. A campanha chama o mesmo registro `repairs.create`; apenas a atribuição dos tipos e a sincronização de pausa são novos pontos em `game.js`.
- `src/engine/repair-scene.js`: coordenadas, escala, captura/cancelamento de ponteiro, animações e descarte compartilhados. A cena não controla XP, saves, checkpoints ou chefe.

A campanha abre v2 por padrão. Para comparação, abrir `index.html?repairs=legacy`; isso usa as fábricas antigas mantidas no projeto. No laboratório `tests/minigames.html`, o seletor **Experiência** alterna entre **Equipamentos interativos** e **Reparos anteriores**. Nenhum desses seletores muda o save da campanha. O laboratório não carrega o controlador de recompensas.

Os controles físicos aceitam arraste, toque e seleção da peça seguida do destino. Rodas e trilhos respondem a gestos e setas; Home/End permitem ajustes por passos. Solda acompanha o percurso horizontal, limpeza exige varredura sobre a face e gravação acompanha um molde conectado. Presilhas, bombas, prensas e portas são acionadas no próprio equipamento. Cabos flexionam durante arraste; peças têm movimento de encaixe/retorno. A íris acopla a rotação de lâminas vizinhas. Não há formulário ou botão genérico de verificação nas cenas novas: ações como prensar, energizar, lançar sonda ou emitir pulso fazem parte da tarefa.

O motor conserva `blocksWorld`, estados públicos, `mount`, `update`, `cancel`, `dispose`, `label`, teclado e dicas. `mode:'failed'` mantém a tentativa aberta, sem repetir a penalidade. O controlador existente continua sendo o único responsável por reparar componentes, emitir eventos, conceder XP e salvar. IDs, ordem das entidades e revisões dos mapas não foram alterados.

### Evidências e limites da entrega

As regras têm teste de 20 seeds por conceito, totalizando 800 variações, e os 67 componentes são resolvidos pelos controles DOM na suíte `tests/repairs-v2.js`. Há testes de pausa, cancelamento de gesto, inserção por toque, erro/penalidade, dicas, retry, unicidade de XP, distribuição procedural e carregamento de save versão 1 anterior ao motor v2.

`tests/run_repair_v2_ui.py` usa eventos nativos do Chrome para mouse, toque emulado e teclado, percorre os 67 componentes em desktop/retrato/paisagem e gera a [galeria dos 40 equipamentos](../tests/repairs-v2-gallery/index.html). A exposição de sessão necessária ao teste é injetada pelo servidor do teste; não é entregue na página de produção. Relatórios: `tests/repairs-v2-desktop-results.json`, `tests/repairs-v2-mobile-results.json` e `tests/repairs-v2-gallery/results.json`.

O catálogo abaixo é a direção completa de arte/mecânica. Esta versão usa mecanismos discretos e operação por passos, sem simulação de força real ou exigência de reflexo. Hardware foi atualizado conforme a seção acima. Nas demais fases, alguns conceitos continuam compactos: prefixos e prismas usam posições de calibração, delegação usa pontos de sustentação guiados e o carrossel avança por decisão. Novas variantes narrativas e calibração humana de dificuldade podem ampliar esses mecanismos sem alterar os contratos. Toque em aparelho físico e desempenho em hardware móvel real ainda precisam de avaliação; o teste automatizado emula o dispositivo no Chrome.

| Validação executada | Resultado | Evidência |
| --- | --- | --- |
| `python tests/run_review.py --repairs-v2 --viewport 1280x720 --result-label repairs-v2-desktop` | 7 verificações, 800 variantes de regras e 67 componentes, sem erros de runtime | `tests/repairs-v2-desktop-results.json` |
| Mesma suíte em `390x844`, rótulo `repairs-v2-mobile` | 7 verificações aprovadas | `tests/repairs-v2-mobile-results.json` |
| `python tests/run_repair_v2_ui.py` | 40 cenas; 67 componentes em três resoluções; alvos de ao menos 44 px; mouse, toque emulado, rotação por teclado, cabo e gravação pelo percurso | `tests/repairs-v2-gallery/results.json` |
| `python tests/run_review.py` | 10 fases, 239 verificações de sistemas, zero erros de runtime; travessia usa v2 e o bloco de testes históricos usa temporariamente o motor antigo | `tests/repairs-v2-campaign-results.json` |
| `python tools/test_developer_mode.py` | 21 verificações; UI em desktop, retrato e paisagem; armazenamento normal preservado | `tests/developer-mode-results/developer.json` e `execution.json` |
| `python tests/run_review.py --repairs-only --result-label repairs-v2-legacy-regression` | 26 verificações aprovadas do motor retido | `tests/repairs-v2-legacy-regression-results.json` |
| Guardas de mapas, ambiente, parallax e geração | Aprovados; guardas de fonte normalizam os pontos explícitos de atribuição, pausa e retomada da integração v2 | `tools/check_maps.py`, `tools/check_environment.py`, `tools/check_parallax.py`, `tools/check_generation.py` |

Os relatórios de navegador registram o hash da fonte usada em cada execução. A regressão geral antecede os últimos ajustes internos de percurso e quantidade de operações; as suítes finais v2 e do Modo Desenvolvedor cobrem esses ajustes. O relatório da campanha é uma cópia sem capturas embutidas da execução geral, conservando seu hash e suas limitações de travessia automatizada.

## Fontes e inventário atual

Foram inspecionados `src/engine/repairs.js`, `src/engine/repair-games.js`, `src/engine/repair-scene.js`, `game.js`, `style.css`, `tests/minigames.html`, `tests/repair-lab.js`, `tests/repairs.js`, o Modo Desenvolvedor e os mapas/contratos relevantes de Servidores. O inventário de componentes abaixo cruza `docs/repair-minigames.md`, as preferências `campaignEquipment` e `repairInventory` de `tests/shared-scene-desktop-results.json`. O relatório é evidência da etapa anterior, não uma execução nova dos futuros minigames.

| Fase | Componentes | Tipos atuais utilizados | Conceitos v2 |
| --- | ---: | --- | --- |
| 1 — Hardware | 4 | `cooling`, `ram`, `circuit`, `gpu` | H1–H4 |
| 2 — Software | 5 | `files`, `software`, `boot`, `quarantine` | S1–S4 |
| 3 — Switch | 6 | `packets`, `uplink`, `ethernet`, `vlan` | W1–W4 |
| 4 — Roteador | 6 | `gateway`, `interfaces`, `route-table`, `route` | R1–R4 |
| 5 — Wi-Fi | 6 | `antenna`, `repeaters`, `channel`, `power-signal` | F1–F4 |
| 6 — Cabeamento | 7 | `fiber`, `connectors`, `continuity`, `cabling` | C1–C4 |
| 7 — DHCP | 6 | `ip-pool`, `ip-reservations`, `ip-distribution`, `ip-conflicts` | D1–D4 |
| 8 — DNS | 7 | `dns-tree`, `dns-records`, `dns-cache`, `dns-query` | N1–N4 |
| 9 — Firewall | 8 | `policy-order`, `firewall`, `barriers`, `threats` | B1–B4 |
| 10 — Servidores | 12 | `rack-power`, `servers`, `fiber`, `rack-load`, `circuit`, `core-relays` | V1–V4 |
| **Total** | **67** | **40 IDs distintos usados na campanha** | **40 conceitos novos** |

O catálogo de desafios registra 43 tipos: os 40 acima e `wifi`, `dhcp`, `dns`, disponíveis para compatibilidade/laboratório. O registro de `repairs.js` também contém as extensões `hold` e `sequence`, fora desses 43. Seu comportamento deve continuar disponível a mapas externos durante a migração.

Há seis tipos atuais em Servidores, incluindo `circuit` e `fiber` compartilhados com outras fases. Na v2 serão quatro conceitos exclusivos de Servidores; a tabela de componentes define a conversão contextual. Não converter um ID antigo globalmente sem considerar a fase e o componente.

### Contagem, repetição e conteúdo procedural

Nas fases 1–9, cada conceito aparece uma ou duas vezes. Em Servidores, quatro conceitos cobrem três componentes cada. **A cota atual de duas ocorrências não comporta 12 componentes com quatro tipos**; a migração alterará essa regra para a fase 10. A repetição terá configuração e composição próprias, sem contar uma skin como conceito adicional.

Para mapas procedurais, manter seleção determinística por fase/tema, seed, região e ID, independente da ordem de entrada. Quatro conceitos temáticos terão distribuição equilibrada, com limite automático `max(2, ceil(componentesAutomáticos/4))`, ajustado às vagas já ocupadas por especificações explícitas. Antes de implementar, testar também mapas com mais de oito componentes e casos de reserva explícita acima da cota. Não recorrer silenciosamente a um puzzle de outra fase nem lançar erro apenas porque o mapa ultrapassou oito componentes. Especificações explícitas/extensões continuam com precedência.

## Direção visual e controles comuns

Cada tarefa ocupa uma cena grande de equipamento, com profundidade em camadas: carcaça, mecanismo, peças manipuláveis e efeitos. Compartilhar coordenadas, ponteiros e ciclo de vida; cada conceito terá desenho, composição, resposta visual e regra próprios. Não haverá um gerador de painel que desenhe todos os puzzles como cartões, listas ou formulários.

Arraste acompanha o ponteiro sem reconstruir o DOM. Encaixes usam aproximação, atração curta e trava visível; cabo flexiona sem deslocar a âncora oposta; rotação acompanha o gesto e termina em posições legíveis. Arte usa pixels e animação de peças; a posição durante o arraste pode ser interpolada suavemente. Todos os indicadores combinam forma, movimento ou símbolo com cor. A câmera do mundo permanece parada.

Priorizar conclusão automática por estado estável e objetivo alcançado. Uma alavanca de energização, prensa, sonda ou disparador só existe quando faz parte da ação física. Não adicionar botão genérico “Verificar”. Manter dica, pausa, reinício e fechamento discretos e acessíveis. Alvos terão pelo menos 44 px de área útil na tela; reconfigurar a composição para retrato quando a escala simples não permitir esse tamanho. Não ampliar colisões de forma que dois alvos se sobreponham.

Mouse, toque e caneta usam a mesma regra. Tab seleciona objetos; Enter/Espaço segura/solta ou aciona; setas movem/ajustam; comandos acessíveis permitem rotação e inserção sem gesto preciso. Tarefas de movimento terão avanço por passos e janelas amplas, sem exigir reflexo ou áudio. Com movimento reduzido, objetos funcionais continuam legíveis por estados discretos e transporte passo a passo; efeitos decorativos param.

### Dificuldade e erros

Escala proposta: 1 = uma relação evidente; 2 = duas condições; 3 = dependência ou obstáculo; 4 = coordenação de subsistemas; 5 = combinação final. A tabela de cada componente fixa o alvo inicial, a calibrar em teste humano. Não introduzir cronômetro global, perda por inatividade ou precisão de poucos pixels. Variações aumentam restrições, quantidade de peças e trajetos, sem transformar velocidade em dificuldade obrigatória.

Um posicionamento recusado, ponteiro cancelado ou ajuste intermediário não gasta tentativa. Um erro contabilizável nasce de uma ação física deliberada definida no catálogo: energizar circuito inseguro, liberar carga incorreta, enviar sonda por saída errada etc. A cena comunica a consequência antes de permitir repetição. Após `3 + floor(repairRank/2)` erros, chamar `context.onFailure` **uma vez por tentativa**, manter a sessão aberta em estado de falha e oferecer nova variação/fechamento. A campanha continua aplicando até 5 de dano e mínimo de 1 de vida. Dicas disponíveis: `1 + repairRank`; apontam uma relação ou peça sem concluir o desafio. Nenhum custo por quadro, por movimento ou por repetição automática da máquina.

## Catálogo proposto: interação, animação, tema e risco

IDs H1–V4 são referências de planejamento; `v2-*` são IDs de registro propostos. “Êxito/erro” define o evento de conclusão e a ação que pode consumir tentativa. Dificuldade e adaptações por componente constam no inventário posterior. Os riscos T1–T9 são detalhados na seção de integração.

### 1 — Hardware: bancada aberta, cobre, verde de placa e âmbar

| Ref. / ID proposto / nome | Interação e diferença mecânica | Animações obrigatórias e tema próprio | Êxito / erro; risco |
| --- | --- | --- | --- |
| H1 `v2-cpu-install` — Instalação do processador | Pegar e girar a CPU, alinhar o triângulo, encaixar no soquete aberto e fechar a retenção. | Chip gira na mão; inserção, quadro de retenção, alavanca e ativação dos LEDs. Placa-mãe verde com soquete grande. | Conclusão automática após travamento; tentar fechar sem CPU conta erro. Orientação incompatível é recusada sem custo. T1, T2. |
| H2 `v2-ram-install` — Instalação de memória | Levar três módulos físicos aos três slots com entalhes compatíveis. | Inserção, presilhas fechando e LEDs por banco. Placa-mãe com três DIMMs grandes. | Conclusão automática com três bancos travados; slot incompatível ou ocupado é recusado sem custo. T2, T5. |
| H3 `v2-power-wiring` — Ligação da alimentação | Arrastar três cabos ancorados na fonte para soquetes de chave e quantidade de pinos correspondentes. | Cabos flexíveis acompanham ponteiro, conectores entram nas portas e pulsos ativam trilhas/LEDs. Fonte e placa-mãe em grande escala. | Conclusão automática após alimentação estabilizar; conector incompatível retorna sem custo. T1, T2. |
| H4 `v2-fan-replacement` — Troca da ventoinha | Desconectar o cabo antigo, retirar a peça avariada, instalar reposição, apertar quatro apoios e ligar quatro pinos. | Remoção, encaixe, parafusos, pás acelerando, leitura de RPM e temperatura caindo até 54 °C. Conjunto de refrigeração aberto. | Conclusão automática após estabilização; etapas fora de ordem não são confirmadas. T2, T3. |

### 2 — Software: máquinas de dados, fósforo violeta e teal

| Ref. / ID proposto / nome | Interação e diferença mecânica | Animações obrigatórias e tema próprio | Êxito / erro; risco |
| --- | --- | --- | --- |
| S1 `v2-virus-cleanup` — Limpeza de vírus | Analisar arquivos num desktop e arrastar somente infectados para quarentena. | Feixe de análise, selos de integridade, isolamento e desintegração de assinaturas. Desktop BYTEOS original. | Conclusão após remover três ameaças; arquivos íntegros são preservados e uma tentativa de isolá-los conta erro. T2, T4. |
| S2 `v2-file-recovery` — Recuperação de arquivos | Arrastar seis recortes para duas imagens fragmentadas, respeitando forma e conteúdo. | Recortes se encaixam, imagens ganham integridade e feixes percorrem os arquivos reconstruídos. Bancada de recuperação. | Conclusão automática após duas reconstruções; recorte errado retorna sem custo. T2, T5. |
| S3 `v2-process-repair` — Reparo de processos | Mover e trocar módulos físicos na esteira, seguindo dependências, e puxar a alavanca de execução. | Correia, roletes, módulos viajando até a CPU, pulsos de saída e falhas vermelhas visíveis. | Sequência executada conclui; ordem inválida interrompe o fluxo e conta uma tentativa incorreta. T3, T4. |
| S4 `v2-system-restore` — Restauração do sistema | Reconectar dois enlaces e acionar carregador, memória e sistema em sequência. | Cabos flexíveis, conectores, interruptores, energia entre módulos e monitor reiniciando o BYTEOS. | Conclusão após reinício; acionar fora de ordem ou com enlaces abertos conta erro. T2, T8. |

### 3 — Switch: chassis industrial, azul-cobalto e laranja

| Ref. / ID proposto / nome | Interação e diferença mecânica | Animações obrigatórias e tema próprio | Êxito / erro; risco |
| --- | --- | --- | --- |
| W1 `v2-packet-diverter` — Desviadores de pacotes | Virar agulhas em esteiras ramificadas para levar pacotes a saídas de mesmo símbolo/MAC; destinos mudam entre rodadas. | Pacotes em movimento, agulhas com mola, buffers e LEDs de recepção no tecido do switch. | Lote entregue conclui; liberar pacote por destino errado conta um erro e recolhe o pacote. T3, T4. |
| W2 `v2-patch-leads` — Cordões do switch | Pegar ponta livre de cabo ancorado, contornar guias e inserir até o clique na porta correta; respeitar comprimento e portas ocupadas. | Curvas elásticas, conector pressionado, trava e atividade dos pares. | Links corretos concluem; energizar porta com par incompatível conta erro. T2, T5. |
| W3 `v2-vlan-shutters` — Comportas de isolamento | Deslizar divisórias num tanque de sinais para formar câmaras isoladas; entradas do mesmo grupo precisam compartilhar câmara. | Placas metálicas, ondas confinadas, vazamento visual e vedação. | Câmaras isoladas concluem; liberar pulso que cruza grupos conta erro. T3, T6. |
| W4 `v2-uplink-clutch` — Embreagens do uplink | Regular atrito e engatar rodas de transmissão redundantes quando as marcas de fase se encontram. | Volantes, correias, luvas de engate e ponteiro de sincronismo. | Duas transmissões estáveis concluem; engate incompatível conta erro, sem exigência de reflexo. T3, T5. |

### 4 — Roteador: rotas em relevo, bronze e azul-petróleo

| Ref. / ID proposto / nome | Interação e diferença mecânica | Animações obrigatórias e tema próprio | Êxito / erro; risco |
| --- | --- | --- | --- |
| R1 `v2-route-rail` — Trilhos de encaminhamento | Deslizar segmentos de trilho num espaço limitado, abrindo caminho contínuo para uma sonda; há casas vazias e obstáculos. | Segmentos pesados, rodas da sonda, bifurcações e rastro. | Sonda alcança saída conclui; lançamento em rota interrompida conta erro. T3, T6. |
| R2 `v2-interface-crimp` — Terminação de interface | Desencapar cabo pela distância marcada, alinhar contatos e operar prensa apropriada ao meio físico. | Bainha saindo, contatos descendo, mandíbulas e teste de enlace. | Terminações corretas concluem; prensar fora das marcas conta erro. T2, T5. |
| R3 `v2-gateway-periscope` — Periscópio de saída | Girar visor para seguir beacon entre túneis; levantar bloqueios locais e disparar sonda pela saída com retorno. | Periscópio, obturadores, profundidade dos túneis e eco de resposta. | Retorno da sonda conclui; disparo por túnel sem retorno conta erro. T3, T6. |
| R4 `v2-prefix-cams` — Cames de prefixo | Ajustar anéis concêntricos que recortam faixas de endereço; braço seguidor deve escolher a saída pela faixa mais específica. | Cames girando, dentes de trava, braço mecânico e esferas de teste. | Casos de teste encaminhados concluem; soltar teste com saída incorreta conta erro. T5, T6. |

### 5 — Wi-Fi: equipamentos de telhado, índigo e ondas ciano

| Ref. / ID proposto / nome | Interação e diferença mecânica | Animações obrigatórias e tema próprio | Êxito / erro; risco |
| --- | --- | --- | --- |
| F1 `v2-dish-gimbal` — Gimbal da antena | Arrastar antena em dois eixos; fixar azimute e elevação para maximizar sobreposição com receptor visível. | Gimbal, prato, feixe e cintilação do receptor; parafusos de fixação. | Feixe preso na região útil conclui; travar com receptor fora da região conta erro. T2, T5. |
| F2 `v2-spectrum-tuner` — Sintonia do espectro | Usar roda de sintonia para deslocar faixa e alavanca para alterar largura, evitando picos de interferência. | Espectro oscilante, ponteiro, cremalheira e indicador de ruído. | Faixa limpa e cobertura suficiente concluem; transmitir sobre interferência conta erro. T3, T5. |
| F3 `v2-rf-compressor` — Compressor de sinal | Dosar válvula e reservatório de amplificação para manter pulsos dentro da faixa útil sem saturação. | Fole, válvula, pressão, pulsos achatados quando saturados e dissipador. | Lote de pulsos útil conclui; disparar sobrepressão conta erro. T3, T4. |
| F4 `v2-repeater-mast` — Mastros de repetição | Estender mastros por segmentos telescópicos e orientar rebatedores para cobrir zonas atrás de obstáculos com dois transmissores. | Mastros subindo, sombras de sinal, ondas e zonas reacendendo. | Cobertura conectada conclui; ativar cadeia sem conexão à base conta erro. T2, T6. |

### 6 — Cabeamento: oficina de bancada, borracha, cobre e magenta óptico

| Ref. / ID proposto / nome | Interação e diferença mecânica | Animações obrigatórias e tema próprio | Êxito / erro; risco |
| --- | --- | --- | --- |
| C1 `v2-rj45-comb` — Pente e crimpagem | Passar oito fios por canaletas, cortar pontas na régua e pressionar conector; respeitar padrão ilustrado na ferramenta. | Fios curvados, lâmina, contatos e prensa com retorno. | Conector crimpado correto conclui; prensar pinagem errada conta erro. T2, T5. |
| C2 `v2-continuity-trace` — Rastreamento de ruptura | Arrastar pontas de prova sobre trechos para localizar ruptura e percorrer a falha com ferramenta de emenda. | Cabos sob capa, arco do medidor, teste pulsante e emenda termoencolhível. | Todos os segmentos contínuos concluem; energizar trecho ainda aberto conta erro. T2, T5. |
| C3 `v2-cable-reel` — Carretel e conduítes | Desenrolar cabo, escolher conduítes com curvatura permitida e recolher folga até atingir conector distante. | Carretel, cabo percorrendo curvas, roldanas e trava de chegada. | Cabo íntegro sem excesso de curvatura conclui; tracionar além da marca de tensão conta erro. T2, T6. |
| C4 `v2-fiber-splice` — Fusão de fibra | Limpar duas faces, alinhar núcleos com micromovimentos e acionar arco de fusão; geometria visível em ampliação. | Pano de limpeza, núcleos se aproximando, arco e pulso óptico cruzando emenda. | Emenda transmite pulso conclui; fundir faces sujas/desalinhadas conta erro. T2, T5. |

### 7 — DHCP: central pneumática de endereços, creme e verde-lima

| Ref. / ID proposto / nome | Interação e diferença mecânica | Animações obrigatórias e tema próprio | Êxito / erro; risco |
| --- | --- | --- | --- |
| D1 `v2-lease-pneumatics` — Tubos de concessão | Operar válvulas para conduzir cápsulas de endereço único até clientes solicitantes; recolher concessões expiradas antes de reutilizá-las. | Cápsulas em tubos transparentes, pistões, relógio de validade e recibo. | Todos os clientes atendidos concluem; emitir endereço ocupado/inválido conta erro. T3, T6. |
| D2 `v2-conflict-localizer` — Localizador de colisão | Mover sonda por barramento e comparar ecos para localizar dois emissores do mesmo endereço; desconectar somente a concessão mais recente. | Ecos sobrepostos, cabeça de leitura, disjuntor seletivo e emissão substituta. | Unicidade restaurada conclui; cortar cliente íntegro conta erro. T3, T6. |
| D3 `v2-reservation-drum` — Tambor de reservas | Girar cilindro de identidades e perfurar posições correspondentes no gabarito de reservas; preservar encaixes já fixados. | Cilindro, gabarito, punção e liberação das chaves reservadas. | Reservas vinculadas concluem; perfurar combinação divergente conta erro. T5, T6. |
| D4 `v2-pool-sluice` — Eclusa do pool | Mover batentes numa régua de endereços e introduzir bloqueadores de reservas; testar quantidade disponível com esferas. | Eclusas, régua, esferas parando em reservas e contador mecânico. | Capacidade útil correta conclui; abrir fluxo que inclua rede, broadcast ou gateway conta erro. T6. |

### 8 — DNS: observatório de nomes, azul-noturno e dourado

| Ref. / ID proposto / nome | Interação e diferença mecânica | Animações obrigatórias e tema próprio | Êxito / erro; risco |
| --- | --- | --- | --- |
| N1 `v2-record-engraver` — Gravadora de registros | Seguir molde de nome com braço pantográfico e gravar sua trilha de endereço numa placa; cada nome tem percurso próprio. | Estilete, sulco luminoso, tambor de endereço e placa entrando no leitor. | Leitura do registro correto conclui; gravar conexão fora do molde conta erro. T2, T6. |
| N2 `v2-delegation-hoist` — Guincho de delegação | Suspender ramificações de uma árvore física e prender cada ramo ao nível pai correto sem criar ciclo. | Guincho, contrapesos, ramos articulados e seiva luminosa da raiz às zonas. | Árvore conectada e sem ciclos conclui; liberar guincho com ramo sem sustentação conta erro. T2, T6. |
| N3 `v2-cache-carousel` — Carrossel de cache | Observar idade/versão de cápsulas que passam sob leitor e ejetar apenas entradas vencidas; peças íntegras retornam ao ciclo. | Carrossel, visor de validade, pistão de ejeção e cápsulas novas. | Volta com cache íntegro conclui; ejetar entrada válida conta erro. Movimento pode avançar por passos. T3, T5. |
| N4 `v2-query-courier` — Mensageiro recursivo | Pilotar cápsula por estações de referência, recolhendo delegações; retornar pelo caminho com resposta autoritativa lacrada. | Cápsula, cancelas, selos de zona e trilha de retorno. | Resposta entregue à origem conclui; entregar resposta de zona incorreta conta erro. T3, T6. |

### 9 — Firewall: fortaleza de segurança, grafite e vermelho-alaranjado

| Ref. / ID proposto / nome | Interação e diferença mecânica | Animações obrigatórias e tema próprio | Êxito / erro; risco |
| --- | --- | --- | --- |
| B1 `v2-policy-camshaft` — Comando de políticas | Deslizar cames num eixo para definir onde cada fluxo encontra seu primeiro mecanismo de decisão; testar exemplos físicos. | Eixo, cames, seguidores e marcas de primeira decisão; visão lateral de máquina. | Casos previstos corretamente decididos concluem; lançar caso contraditório conta erro. T6. |
| B2 `v2-inspection-airlock` — Eclusa de inspeção | Ler selos de um veículo de dados e operar portas em sequência, permitindo passagem ou desvio para contenção sem abrir ambas simultaneamente. | Portas pesadas, veículo, luzes, vedação e desvio de quarentena. | Lote triado conclui; liberar fluxo proibido/abrir dupla porta conta erro. T3, T4. |
| B3 `v2-threat-triangulation` — Triangulação de ameaça | Orientar três sensores para cruzar evidências de fluxos; usar garra de contenção apenas no foco confirmado. | Cones dos sensores, assinaturas pulsantes e gaiola fechando sobre ameaça. | Ameaças isoladas e fluxos íntegros preservados concluem; conter alvo inocente conta erro. T5, T6. |
| B4 `v2-shield-iris` — Íris de proteção | Abrir mecanismo, reposicionar lâminas sobrepostas e tensionar mola central para vedar lacunas na barreira. | Lâminas radiais, engrenagem, mola e onda de teste percorrendo vedação. | Íris estanque conclui; liberar mola com lâminas desalinhadas conta erro. T2, T6. |

### 10 — Servidores: data center monumental, aço, gelo e energia violeta

| Ref. / ID proposto / nome | Interação e diferença mecânica | Animações obrigatórias e tema próprio | Êxito / erro; risco |
| --- | --- | --- | --- |
| V1 `v2-rack-busbars` — Barramentos de potência | Isolar seção, posicionar pontes condutoras e apertar contatos com torque visível; distribuir duas fontes sem curto. | Barramentos largos, catraca, isolamento, relés e luzes do rack subindo em cascata. | Rede de potência segura energizada conclui; fechar disjuntor com curto conta erro. T1, T2, T7. |
| V2 `v2-replica-flywheels` — Volantes de sincronismo | Frear/acelerar volantes de réplicas e travar acoplamentos em fase; preservar réplicas já sincronizadas enquanto ajusta a próxima. | Volantes, freios, marcas de fase, acoplamentos e pulsos de confirmação. | Réplicas travadas em fase concluem; acoplar fora de faixa conta erro. Modo por passos obrigatório. T3, T5, T7. |
| V3 `v2-backbone-prisms` — Prismas do backbone | Mover prismas em trilhos e regular divisores para levar feixe a múltiplos racks por caminhos redundantes sem bloquear ramos. | Feixes segmentados, prismas, espelhos, shutters e receptores de potência óptica. | Todos os receptores exigidos energizados concluem; disparar feixe contra seção protegida conta erro. T2, T6, T7. |
| V4 `v2-rack-gantry` — Pórtico de recuperação | Operar ponte rolante para transferir módulos/processos entre racks, usando área intermediária e respeitando capacidade, dependências e isolamento. | Trilhos de pórtico, garra, gavetas, módulos suspensos e réguas de carga. | Plano de recuperação estável conclui; baixar módulo em rack proibido/sobrecarga conta erro. T2, T6, T7, T8. |

Hardware compartilha coordenadas, captura e animação, mas possui quatro sequências distintas: orientação/travamento de CPU, compatibilidade de três DIMMs, conexão elétrica de cabos e desmontagem/reposição com fixação e estabilização térmica. W2 é conexão com comprimento; R2 é fabricação de terminação; C1 é pinagem/crimpagem; C3 é planejamento de conduíte. F1 alinha um receptor por gimbal, C4 funde faces e V3 resolve uma rede de feixes. Essas diferenças devem existir no protótipo jogável, não apenas na descrição ou na arte.

## Inventário completo e atribuição por componente

Cada linha preserva fase, ID e função atual; informa tipo anterior, conceito novo, variação funcional, dificuldade e risco local. Interação, animações e tema da referência fazem parte de cada atribuição. IDs como `c01` só são únicos dentro da fase: usar sempre a chave `(phase.id, component.id)`.

### Fase 1 — Hardware

| ID preservado | Função/objetivo atual | Tipo atual à conceito v2 | Variante de interação/cena | Dificuldade | Risco local |
| --- | --- | --- | --- | ---: | --- |
| `socket:cpu-relay` | REFRIGERACAO DA CPU | `cooling` → **H4** | Substituição da ventoinha, quatro apoios e estabilização em 54 °C. | 2/5 | T3 |
| `ram-base:ram-relay` | BANCO DE MEMORIA | `ram` → **H2** | Três módulos compatíveis com três slots de entalhes distintos. | 1/5 | T2 |
| `bus-west:bus-relay` | MALHA DOS BARRAMENTOS | `circuit` → **H1** | Orientação, inserção e retenção do processador que reativa o barramento. | 2/5 | T1 |
| `gpu-east:gpu-relay` | ALIMENTACAO PRINCIPAL DA GPU | `gpu` → **H3** | Cabos de 24, 8 e 6 pinos entre fonte e banco de alimentação. | 2/5 | T2 |

### Fase 2 — Software

| ID preservado | Função/objetivo atual | Tipo atual à conceito v2 | Variante de interação/cena | Dificuldade | Risco local |
| --- | --- | --- | --- | ---: | --- |
| `root:index` | RESTAURAR INDICE DE ARQUIVOS | `files` → **S2** | Reconstrução de dois arquivos por seis fragmentos visuais. | 2/5 | T8 |
| `scheduler:scheduler` | RESTAURAR ESCALONADOR | `software` → **S3** | Ordenar e executar carga, validação, execução e liberação. | 2/5 | T4 |
| `swap:paging` | RESTAURAR PAGINACAO | `boot` → **S4** | Reconectar e reiniciar carregador, memória e sistema. | 3/5 | T8 |
| `recovery:recovery` | RECONSTRUIR ARQUIVOS | `quarantine` → **S1** | Analisar seis arquivos, preservar íntegros e isolar três ameaças. | 2/5 | T5 |
| `kernel-stack:kernel` | RESTAURAR PROCESSOS DO NUCLEO | `software` → **S3** | Variante de dependências de núcleo, memória, serviços e saída. | 3/5 | T4 |

### Fase 3 à Switch

| ID preservado | Função/objetivo atual | Tipo atual à conceito v2 | Variante de interação/cena | Dificuldade | Risco local |
| --- | --- | --- | --- | ---: | --- |
| `matrix-north:table` | RECONSTRUIR TABELA MAC | `packets` à **W1** | Desviar quatro pacotes conforme símbolos de destino da tabela MAC. | 2/5 | T6 |
| `core-guard:fabric` | RESTAURAR CONECTIVIDADE | `packets` à **W1** | Adicionar buffer intermediário e cruzamento de duas esteiras. | 3/5 | T3 |
| `uplink-crown:uplink` | RESTAURAR UPLINK | `uplink` à **W4** | Dois volantes com ritmos diferentes e transmissão redundante. | 3/5 | T5 |
| `port04:connector` | REPARAR RJ45 / PORTA 04 | `ethernet` à **W2** | Cabo curto precisa passar por uma guia antes da porta 04. | 2/5 | T2 |
| `port01:connector` | REPARAR RJ45 / PORTA 01 | `ethernet` à **W2** | Conector inferior; liberar cabo preso antes de chegar à porta 01. | 2/5 | T2 |
| `channel-relay:bus` | SINCRONIZAR CANAIS | `vlan` à **W3** | Separar três grupos com duas divisórias e fechar vazamento lateral. | 3/5 | T6 |

### Fase 4 à Roteador

| ID preservado | Função/objetivo atual | Tipo atual à conceito v2 | Variante de interação/cena | Dificuldade | Risco local |
| --- | --- | --- | --- | ---: | --- |
| `gateway-tower:gateway` | RESTAURAR GATEWAY PADRAO | `gateway` à **R3** | Três túneis, dois beacons locais e uma saída com eco externo. | 3/5 | T6 |
| `iface-lan:lan` | CONFIGURAR INTERFACE LAN | `interfaces` à **R2** | Terminação de cobre com medida e prensa de contatos LAN. | 2/5 | T5 |
| `core-main:table` | RESTAURAR TABELA DE ROTEAMENTO | `route-table` à **R4** | Dois anéis de faixa e uma exceção mais específica. | 3/5 | T6 |
| `wan-relay:link` | SINCRONIZAR TUNEL WAN | `route` à **R1** | Trilho de túnel WAN com obstáculo central e duas casas livres. | 3/5 | T6 |
| `iface-console:transit` | RECONSTRUIR ROTAS DE TRANSITO | `route` à **R1** | Duas sondas percorrem caminho de trânsito com bifurcação compartilhada. | 3/5 | T3 |
| `iface-wan:wan` | CONFIGURAR INTERFACE WAN | `interfaces` à **R2** | Terminação WAN com blindagem e ordem de fechamento da prensa. | 3/5 | T2 |

### Fase 5 à Wi-Fi

| ID preservado | Função/objetivo atual | Tipo atual à conceito v2 | Variante de interação/cena | Dificuldade | Risco local |
| --- | --- | --- | --- | ---: | --- |
| `main-array:uplink` | RESTAURAR ANTENA PRINCIPAL | `antenna` à **F1** | Prato grande com azimute e elevação; fixar ambos os eixos. | 3/5 | T5 |
| `repeater-west:west` | SINCRONIZAR REPETIDOR OESTE | `repeaters` à **F4** | Mastro atrás de parede baixa e cobertura de três zonas. | 3/5 | T6 |
| `repeater-east:east` | SINCRONIZAR REPETIDOR LESTE | `repeaters` à **F4** | Dois obstáculos e cadeia com segundo mastro dependente do primeiro. | 4/5 | T6 |
| `noise-center:spectrum` | LIMPAR ESPECTRO DE RADIO | `channel` à **F2** | Evitar dois picos preservando largura mínima de faixa. | 3/5 | T5 |
| `transmit-west:carrier` | RESTAURAR PORTADORA | `power-signal` à **F3** | Reservatório pequeno; manter pulsos dentro da margem do receptor. | 3/5 | T3 |
| `base-west:association` | CALIBRAR ASSOCIACAO WI-FI | `channel` à **F2** | Faixa útil estreita e pico móvel previsível, com avanço por passos. | 3/5 | T3 |

### Fase 6 à Cabeamento

| ID preservado | Função/objetivo atual | Tipo atual à conceito v2 | Variante de interação/cena | Dificuldade | Risco local |
| --- | --- | --- | --- | ---: | --- |
| `roof-controls:antenna` | RECONECTAR COBERTURA | `fiber` à **C4** | Faces contaminadas e alinhamento do enlace de cobertura. | 3/5 | T5 |
| `upper-hub:distribution` | RESTAURAR DISTRIBUICAO SUPERIOR | `connectors` à **C3** | Conduàte superior com duas curvas e limite de folga. | 3/5 | T2 |
| `shaft-west-mid:motor` | REPARAR CONTROLE DOS ELEVADORES | `continuity` à **C2** | Sondar três trechos atà localizar falha do motor do elevador. | 3/5 | T7 |
| `maintenance-west:service` | RESTAURAR QUADRO DE MANUTENCAO | `cabling` à **C1** | Pinagem de oito fios com gabarito T568A ilustrado. | 3/5 | T5 |
| `central-main:patch` | RECONECTAR PAINEL PRINCIPAL | `connectors` à **C3** | Dois conduàtes possàveis; um excede curvatura do cabo. | 4/5 | T6 |
| `central-east:trunk` | REPARAR TRONCO DE COBRE | `cabling` à **C1** | Gabarito T568B e ponta danificada que precisa ser recortada. | 4/5 | T2 |
| `basement-power:power` | RESTAURAR ALIMENTACAO DO SUBSOLO | `continuity` à **C2** | Duas rupturas em ramificaààes e energização somente após isolamento. | 4/5 | T1 |

### Fase 7 à DHCP

| ID preservado | Função/objetivo atual | Tipo atual à conceito v2 | Variante de interação/cena | Dificuldade | Risco local |
| --- | --- | --- | --- | ---: | --- |
| `gateway-plaza:gateway` | RESTAURAR GATEWAY DA CIDADE | `ip-pool` à **D4** | Excluir gateway reservado e extremos de rede/broadcast. | 3/5 | T6 |
| `address-office:scope` | RECONSTRUIR ESCOPO DE ENDERECOS | `ip-pool` à **D4** | Dimensionar capacidade útil com dois endereços reservados internos. | 4/5 | T6 |
| `reserve-main:reservation` | RESTAURAR TABELA DE RESERVAS | `ip-reservations` à **D3** | Três identidades e uma reserva já fixada que nào pode mudar. | 4/5 | T6 |
| `central-core:server` | RESTAURAR SERVIDOR DHCP | `ip-distribution` à **D1** | Atender três clientes por tubos com endereços exclusivos. | 3/5 | T4 |
| `conflict-core:conflict` | RESOLVER ENDERECOS DUPLICADOS | `ip-conflicts` à **D2** | Localizar duplicata e manter a concessão mais antiga. | 4/5 | T6 |
| `distribution-south:relay` | REPARAR DISTRIBUICAO DE CONCESSOES | `ip-distribution` à **D1** | Retorno de càpsula expirada antes de atender novo cliente via relay. | 4/5 | T3 |

### Fase 8 à DNS

| ID preservado | Função/objetivo atual | Tipo atual à conceito v2 | Variante de interação/cena | Dificuldade | Risco local |
| --- | --- | --- | --- | ---: | --- |
| `root-core:hints` | RESTAURAR REFERENCIAS DA RAIZ | `dns-tree` à **N2** | Sustentar raiz e duas ramificaààes de servidores de topo. | 3/5 | T6 |
| `com-records:records` | RECONSTRUIR REGISTROS A / AAAA | `dns-records` à **N1** | Gravar nome e endereço de uma zona .com com duas trilhas pràximas. | 4/5 | T5 |
| `com-zone:delegation` | RESTAURAR DELEGACAO .COM | `dns-tree` à **N2** | Adicionar subzona; impedir vànculo que fecha ciclo. | 4/5 | T6 |
| `org-records:records` | RECONSTRUIR REGISTROS .ORG | `dns-records` à **N1** | Nome de zona .org com trilha de alias antes do endereço final. | 4/5 | T6 |
| `cache-crown:ttl` | RENOVAR CACHE / TTL | `dns-cache` à **N3** | Separar expiração de versão antiga; preservar entradas vàlidas. | 4/5 | T3 |
| `cache-terminal:recursive` | RESTAURAR RESOLVEDOR RECURSIVO | `dns-query` à **N4** | Coletar referências de raiz, topo e autoridade antes de retornar. | 4/5 | T6 |
| `resolve-core:resolution` | CONCLUIR RESOLUCAO DNS | `dns-query` à **N4** | Referància desviada para outra zona; voltar e trazer selo correto. | 4/5 | T6 |

### Fase 9 à Firewall

| ID preservado | Função/objetivo atual | Tipo atual à conceito v2 | Variante de interação/cena | Dificuldade | Risco local |
| --- | --- | --- | --- | ---: | --- |
| `c01` | REGRAS DO PERÍMETRO | `policy-order` à **B1** | Perímetro com exceção anterior à regra geral; testar três fluxos. | 4/5 | T6 |
| `c02` | POLÍTICA DE INSPEÇÃO | `firewall` à **B2** | Inspecionar dois selos por fluxo e manter intertravamento da eclusa. | 4/5 | T4 |
| `c05` | RESTAURAR TRAVAS DA ECLUSA | `barriers` à **B4** | Reposicionar três lâminas e recompor vedação da eclusa. | 4/5 | T7 |
| `c06` | ENERGIZAR DUTOS | `barriers` à **B4** | Mola com dois pontos de tensão e teste de estanqueidade dos dutos. | 4/5 | T6 |
| `c03` | REGRAS DO ANEL INTERNO | `policy-order` à **B1** | Anel interno com regras parcialmente sobrepostas e primeiro acionamento. | 5/5 | T6 |
| `c07` | SINCRONIZAR DEFESA DO ANEL | `threats` à **B3** | Triangular ameaça entre três sinais de referência conhecidos. | 4/5 | T5 |
| `c04` | POLÍTICA DA CIDADELA | `firewall` à **B2** | Cidadela com fluxo de retorno e desvio de contenàào obrigatório. | 5/5 | T4 |
| `c08` | RESTAURAR NÚCLEO DE SEGURANÇA | `threats` à **B3** | Duas ameaças com evidàncias complementares; poupar emissor íntegro. | 5/5 | T6 |

### Fase 10 à Servidores

| ID preservado | Função/objetivo atual | Tipo atual à conceito v2 | Variante de interação/cena | Dificuldade | Risco local |
| --- | --- | --- | --- | ---: | --- |
| `c01` | RESTAURAR DISTRIBUIÇÃO DE ENTRADA | `rack-power` à **V1** | Entrada do data center: duas fontes e três contatos de torque. | 4/5 | T1, T7 |
| `c02` | SINCRONIZAR TORRE B | `servers` à **V2** | Sincronizar dois volantes da torre B e acoplar réplica. | 4/5 | T3, T7 |
| `c05` | RESTAURAR FIBRA DA TORRE A | `fiber` à **V3** | Fibra da torre A: dois receptores e um prisma divisor. | 4/5 | T7 |
| `c06` | RESTABELECER ENERGIA DA OFICINA | `rack-power` à **V1** | Oficina: isolar ramificação avariada antes de religar alimentação. | 4/5 | T7 |
| `c07` | RECONECTAR CANAL DE MANUTENÇÃO | `fiber` à **V3** | Canal de manutenção: contornar obstrução e preservar feixe de retorno. | 5/5 | T7 |
| `c03` | RESTAURAR TRANSMISSÃO CENTRAL | `rack-load` à **V4** | Transmissão: distribuir módulos entre racks com limites de capacidade. | 4/5 | T6, T7 |
| `c08` | ATIVAR ROTA REDUNDANTE | `circuit` à **V3** | Rota redundante: alimentar receptores por dois caminhos independentes. | 5/5 | T7 |
| `c09` | ISOLAR MEMÓRIA CORROMPIDA | `rack-load` à **V4** | Memória corrompida: retirar módulos do banco isolado sem reutilizá-lo. | 5/5 | T7, T8 |
| `c10` | ESTABILIZAR CONTENÇÃO | `servers` à **V2** | Contenção: sincronizar três volantes sem destravar os já acoplados. | 5/5 | T7 |
| `c11` | RECUPERAR BARRAMENTO FINAL | `circuit` à **V1** | Barramento final: duas fontes, seção protegida e ordem de isolamento. | 5/5 | T7 |
| `c12` | RESTAURAR BACKUP DO NÚCLEO | `core-relays` à **V2** | Backup do núcleo: acoplar réplicas seguindo referência mestre estável. | 5/5 | T7 |
| `c04` | ESCUDO DO NÚCLEO | `core-relays` à **V4** | Escudo do núcleo: reorganizar módulos de controle, respeitando dependências de relés; apenas emitir reparo normal. | 5/5 | T1, T7, T8 |


## Contratos de integração e riscos

| Risco | Evidência atual e tratamento planejado | Validação que bloqueia a migração |
| --- | --- | --- |
| T1 — Recompensa e conclusão duplicadas | `updateRepair` em `game.js` detecta `status === 'success'`, repara componente, zera corrupção, emite `repair`, concede 30 XP, verifica objetivos e salva. Apenas esse controlador produz efeitos de campanha. A cena sinaliza sucesso uma vez; nunca concede XP diretamente. | Repetir entrada/saída, concluir no mesmo quadro, cancelar durante animação final; 30 XP por componente, bônus de 100 XP do objetivo contado separadamente. |
| T2 — Ponteiros, pausa e descarte | `blocksWorld:true`, `mount`, `update`, `cancel`, `dispose`, `handleKey` e `label` continuam. Usar `repairScene` para captura, escala, cancelamento e animação. Cancelamento/perda de captura desfaz prévia sem confirmar. Pausa precisa cancelar gesto e congelar animações mesmo quando `update` deixa de executar. | Mouse/toque/caneta, segundo ponteiro, blur, ocultação, Esc/menu, reinício, troca de fase e fechamento; sem captura, listener ou animação residual. |
| T3 — Tempo de simulação | A campanha passa `dt * .65` se componente estiver infectado. Tempos dos mecanismos devem depender da sessão; não usar tempo real, CSS ou áudio como autoridade da regra. Separar relógio funcional de efeito decorativo. | Pausa longa, retorno de aba, delta alto, infecção e taxas de 30/60/120 Hz; resultado e dificuldade funcional consistentes. |
| T4 — Falha e habilidade | Preservar contagem de erros/dicas e `onFailure` único. Separar `mode:'failed'` interno de `status:'failed'`: este último faz o controlador fechar a sessão. Após esgotar tentativa, manter `status:'running'` e mundo bloqueado até retry/fechar, como atualmente. | Integridade 100 e 3; dano máximo 5, mínimo 1; repetir ação falha não repete dano; cancelar não repara; rank 0–5 altera recursos sem resolver. |
| T5 — Acessibilidade e tela pequena | Coordenadas lógicas não garantem alvos utilizáveis. Criar composição específica quando necessário, controles por passos, alternativa a arraste e feedback sem depender de cores. Nenhuma regra exige leitura de texto miúdo. | 360×640, 390×844, 844×390, 1280×720, zoom e DPR 1/2; teclado completo, toque real e movimento reduzido. Teste em aparelho real ainda necessário na implementação. |
| T6 — Geradores impossíveis e conversão de tipos | Catálogo/distribuidor atuais misturam preferências, cota, dificuldade e seed. Criar manifesto v2 explícito dos 67 componentes; gerar a partir de uma configuração solucionável e embaralhar ações reversíveis. Manter `repairChallenges.assign`, `catalog`, `forPhase`, `names` e `types` disponíveis aos consumidores. | Cobertura completa, determinismo, entrada reordenada, pelo menos 20 seeds por conceito e extremos de dificuldade; prova de solução sem introduzir resposta no estado da campanha. |
| T7 — Objetivos e VIRUS ZERO | Preservar IDs, ordem das entidades, eventos e requisitos dos mapas. `c04` continua sendo ESCUDO DO NÚCLEO, não um comando direto para derrotar/alterar chefe. `c12` restaura backup; `c08`, `c07`, `c09` mantêm atalhos/portais associados. | Travessia da fase 10 com cofres, arena, escudo, transições do chefe e vitória; Modo Desenvolvedor entrando diretamente na fase 10; chefe não avança enquanto reparo bloqueia mundo. |
| T8 — Saves e checkpoints | Snapshot atual versão 1 guarda `repaired` e `componentIntegrity` por posição, além de `phaseId`, revisão, `levelState`, checkpoint, XP, habilidades e inimigos. Preservar IDs **e ordem**; não alterar mapa/revisão só para trocar minigame. Sessão parcial não é persistida. | Carregar fixtures anteriores com reparos mistos, integridade baixa, checkpoint e transição pendente; mesmas flags e coordenadas, sem repetir XP, reaparecer reparos concluídos ou reiniciar objetivo. |
| T9 — Laboratório e modo desenvolvedor | `tests/minigames.html` carrega motor/mapas sem `game.js`; contextos podem não ter jogador, `isActive` ou `onFailure`. O laboratório deverá comparar antigo/v2 com mesmo componente/seed durante transição, sem escrever no save. | Abrir 67 componentes em ambos os motores; armazenamento local idêntico antes/depois; navegação Tab alcança seletores; toggles/reload do Modo Desenvolvedor preservam campanha normal. |

### Registro paralelo e compatibilidade de tipos

Criar módulos v2 separados, por exemplo `src/engine/repair-games-v2.js`, `src/engine/repair-catalog-v2.js` e renderizadores por fase em `src/repairs-v2/`. Registrar fábricas como `v2-*`; não sobrescrever tipos existentes, pois `repairs.register` rejeita duplicatas. Seleção de motor será temporária e explícita no distribuidor/laboratório, mantendo o mesmo `repairs.create(spec, context)` para o controlador.

O catálogo v2 manterá metadados de nome pt-BR, ID, mecânica, dificuldade e fase. O manifesto terá ID antigo, ID novo, variante, dificuldade e seed por chave de componente; os IDs de registro propostos não substituem IDs de componentes. A sessão mantém `status`, `blocksWorld`, `progress` e métodos esperados; `verify()` pode existir como método interno de compatibilidade, sem botão na cena. `hint()` e os atalhos existentes continuam funcionando. O modelo e `solution` antigos não são contrato público da campanha: os testes de solução serão reescritos para ações físicas reais.

Para especificações explícitas antigas, resolver por tipo + fase + componente antes de criar a fábrica. A tabela deste documento cobre a campanha fixa. Chamadas sem componente recebem um conceito temático determinístico: `circuit→H3`, `software→S2`, `ethernet→W2`, `route→R1`, `wifi→F2`, `cabling→C1`, `dhcp→D1`, `dns→N4`, `firewall→B2`, `servers→V2`; os demais tipos têm a correspondência temática do inventário. `hold` e `sequence` permanecem extensões independentes. Fixar esses comportamentos em testes antes de remover fábricas antigas. Não fazer alias recursivo nem registrar duas vezes o mesmo ID.

Os três tipos sem componente atual (`wifi`, `dhcp`, `dns`) ficam inventariados e testados durante a transição. Após remover suas telas antigas, seus IDs podem sobreviver como adaptadores para F2/D1/N4. Compatibilidade de saves não exige armazenar motor ou estado de puzzle: manter o esquema e os fatos da campanha. Compatibilidade de extensões exige conservar resolução dos tipos antigos ou declarar uma migração específica; não remover silenciosamente.

### Uso da infraestrutura existente

Reutilizar `ByteRunner.repairScene` para espaço lógico, `point`, `hitTest`, captura de ponteiro, `angle`, `angleDelta`, `snap`, `cablePath`, animações e descarte. Acrescentar apenas utilitários necessários aos protótipos: transformação de objetos, colisão de encaixe, rollback de gesto, avanço por passos e propriedade de recursos por tentativa. Cada modelo será independente de DOM; cada renderizador desenhará seu mecanismo. Evitar um esquema universal que transforme diferenças em opções do mesmo puzzle.

A orientação antiga em `docs/repair-scene-architecture.md` de preservar geradores/validadores será superada para a v2 pela autorização atual. Preservar o contrato externo e a economia do jogo; regras internas podem ser inteiramente novas. Não editar nem remover a documentação histórica nesta etapa.

## Sequência de migração e critérios de saída

| Etapa futura | Entrega | Critério para avançar |
| --- | --- | --- |
| 0 — Inventário e plano | Este documento, 67 atribuições, 40 conceitos e riscos explícitos. | Conferência de unicidade, contagens e correspondência com inventário atual. Nenhuma remoção de código. |
| 1 — Manifesto e roteamento paralelo | Registro `v2-*`, manifesto, adaptadores e seleção antigo/v2 somente para desenvolvimento/laboratório. | Todos os componentes resolvem uma fábrica; campanha padrão continua antiga; saves existentes carregam sem alteração. |
| 2 — Protótipos de risco | H2 (gesto/inserção), W1 (transporte), C4 (precisão), V4 (restrições/chefe). | Manipulação convincente, pausa real, teclado/toque, tamanho legível e conclusão/falha corretos antes de expandir catálogo. |
| 3 — Fases 1–3 | 12 conceitos com arte final e variações por componente. | Cena própria para cada conceito; solução por eventos de entrada reais; regressões de recompensa, falha e save aprovadas em ambos os motores. |
| 4 — Fases 4–6 | 12 conceitos adicionais, total 24. | Rede de caminhos, alinhamento, ferramentas e geradores verificáveis; nenhuma dependência em formulário ou verificação genérica. |
| 5 — Fases 7–9 | 12 conceitos adicionais, total 36. | Semântica de endereço/nome/política legível sem conhecimento externo; as 36 tarefas têm regra e interação próprias. |
| 6 — Servidores | Quatro conceitos finais e 12 variantes; cota 3 por conceito. | Arena/portais/escudo/backup e combate final passam com todos os reparos v2. |
| 7 — Virada da campanha | Distribuidor passa a emitir v2; antigo continua acessível apenas para comparação/rollback. | Cobertura 67/67, 40/40 conceitos e regressão completa nas dez fases; save anterior e checkpoints passam; revisão humana de qualidade aprovada. |
| 8 — Remoção controlada | Remover renderizadores/modelos/CSS/solvers obsoletos; conservar adaptadores/extensões necessários. | Só após etapa 7 aprovada; busca de consumidores/imports/seletores antigos vazia ou justificada, mesmos testes passam após limpeza. |

O rollback de implementação mantém o distribuidor antigo disponível até a etapa 8. Nenhum teste deve misturar a ação de um motor com o modelo do outro. Não ativar v2 parcialmente na campanha normal enquanto uma seed ou componente cair em uma tela antiga sem indicação no laboratório.

## Plano de validação e evidências exigidas

1. **Cobertura estática:** manifesto com 67 chaves de componente únicas, 40 IDs novos, quatro por fase e ocorrências previstas; comparar tipos antigos/objetivos com baseline e verificar que nenhum componente foi renomeado, reordenado ou removido.
2. **Regras por conceito:** solução gerada, estado inválido, erro deliberado, dica, retry, cancelamento e sucesso único. Pelo menos 20 seeds por conceito (800 variantes), mais dificuldade mínima/máxima. Não reutilizar `model.answer` para forçar `status` nem testar apenas função contra cópia de si mesma.
3. **Interação no navegador:** resolver todos os 67 pelo DOM/ponteiro/teclado com coordenadas da cena. Exercitar arraste incompleto, alvo vazio, multitouch, captura perdida, rotação, inserção e conexão; DOM estável durante movimento. Para automação, usar demonstração/solução conhecida do gerador apenas para planejar ações, nunca gravar flags de sucesso.
4. **Integração:** adaptar `tests/repairs.js` e executar `python tests/run_review.py --repairs-only` em desktop, retrato e paisagem. Verificar XP único, bônus de objetivo separado, dicas, penalidade uma vez, infecção, mundo congelado e retomada com teclas limpas.
5. **Save/load:** fixtures de saves versão 1 antes da migração, com progresso parcial em cada fase, checkpoint ativo, recompensas já concedidas, transição pendente e chefe em andamento. Comparar valores antes/depois e reabrir apenas reparos pendentes.
6. **Campanha e chefe:** executar regressão completa `python tests/run_review.py`, verificar checkpoints, portas, plataformas, objetivos e saída das dez fases; conferir fase 10/chefe e `python tools/test_developer_mode.py --full`. Não tratar acesso direto por modo desenvolvedor como substituto de travessia da campanha.
7. **Arte e usabilidade:** galeria dos 40 conceitos em estado inicial, manipulado, falho e concluído; capturas nas resoluções T5. Revisão humana verifica se cada tarefa é reconhecível sem título, se não parece formulário/cartões e se as quatro mecânicas de uma fase não são o mesmo encaixe. Testar toque em aparelho real.
8. **Desempenho e limpeza:** medir cena mais carregada em desktop e dispositivo móvel de referência, alvo de 60 fps sem saltos de arraste; repetir 100 ciclos abrir/fechar e comparar listeners, animações e memória após coleta. Mundo sem atualização durante sessão; nenhuma animação persistente após descarte. Ajustar partículas/camadas antes de reduzir legibilidade ou responsividade.
9. **Idioma e compatibilidade:** revisar todos os textos visíveis e acessíveis em pt-BR, incluindo alternativas de teclado, erros e modo reduzido. Testar IDs legados e especificações explícitas; verificar armazenamento isolado do laboratório e do Modo Desenvolvedor.

Salvar relatórios novos com rótulos `repairs-v2-*`, fonte/seed/resolução e limitações do teste; não interpretar evidência do motor anterior como validação dos conceitos novos. A seção de implementação registra os testes já executados; os demais itens desta lista continuam critérios de expansão e revisão de qualidade, não resultados presumidos.
