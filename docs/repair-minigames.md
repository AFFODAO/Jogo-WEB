# Diagnósticos interativos

A seção **Finalização dos painéis animados** registra a implementação e os resultados da execução atual. As tabelas de revisões anteriores abaixo são histórico de validação, não resultados reexecutados automaticamente.

Os componentes das dez fases usam desafios modais. Aperte **E uma vez** perto do componente ou toque em REPARAR. Movimentação, gravidade, inimigos, tiros, plataformas, partículas e relógios do mundo ficam congelados. A sessão mantém a velocidade e a posição anteriores; ao fechar, o mundo retoma dali, com as teclas de movimento limpas para evitar comandos presos.

| ID | Interação |
| --- | --- |
| `circuit` | Gire peças para formar um circuito contínuo da entrada à saída. |
| `software` | Monte a sequência de restauração por cliques. Desfaça ações para corrigir a ordem. |
| `ethernet` | Selecione uma porta e encaixe um destino. Mover o destino libera sua conexão anterior. |
| `route` | Trace uma rota por nós adjacentes, evitando ligações bloqueadas. Volte pelo último nó ou reinicie a rota. |
| `wifi` | Ajuste canal e potência com controles deslizantes. A potência admite cinco pontos percentuais de tolerância. |
| `cabling` | Troque dois fios por vez para ordenar os pinos conforme T568A ou T568B. |
| `dhcp` | Atribua concessões respeitando reservas e unicidade. Endereços de rede e broadcast são inválidos. |
| `dns` | Consulte duas tabelas e selecione primeiro o alias e depois o endereço. |
| `firewall` | Decida entre permitir e bloquear cada conexão conforme a política exibida. |
| `servers` | Avance os relógios das réplicas até sincronizá-los e ative o relay. Alterar um relógio desativa o relay. |

As peças embaralhadas, opções, destinos, canal, potência, IPs, domínios, regras e épocas variam conforme o desafio. No roteador, os bloqueios variam fora de uma rota garantida, evitando tabuleiros impossíveis. As pistas contêm todas as informações necessárias; não há limite de tempo nem dependência de conhecimento externo.

## Controles e tentativas

### Painel de circuitos

A bancada usa placas de circuito desenhadas em CSS, com trilhas, chips, terminais de entrada e saída e uma moldura com botões em relevo. Clique, toque ou pressione Enter ou Espaço para girar a placa focada. As setas movem o foco pelo tabuleiro. A última placa girada permanece destacada e as trilhas conectadas à entrada acendem durante a manipulação. O visor informa quando a saída está energizada. Verificar confirma a solução e exibe a animação de restauração, que respeita a preferência por movimento reduzido.

**Reiniciar circuito** restaura as orientações iniciais da tentativa e mantém os erros e as dicas já consumidos. Dica, verificar e fechar continuam disponíveis no painel ou no rodapé do diagnóstico.

### Equipamentos das fases 1 a 5

Cada fase usa quatro tipos na campanha. Os componentes mantêm seus IDs e suas dependências de objetivos, portas e plataformas.

| Fase | Desafios |
| --- | --- |
| Hardware | `circuit` energiza trilhas por rotação. `ram` encaixa DIMMs em slots identificados. `cooling` ajusta a ventoinha até 54 °C. `gpu` conecta a alimentação PCIe e energiza os bancos em ordem. |
| Software | `files` arquiva documentos por extensão. `quarantine` isola assinaturas inválidas. `software` monta a sequência de processos. `boot` ativa blocos encadeados e desliga os dependentes se um bloco anterior for desativado. |
| Switch | `ethernet` conecta portas a destinos. `packets` despacha uma fila conforme a tabela MAC. `vlan` liga contatos em uma matriz de grupos exclusivos. `uplink` negocia velocidades e ativa dois links. |
| Roteador | `route` traça caminhos por nós adjacentes. `interfaces` encaixa conectores por meio físico. `gateway` escolhe a saída padrão e envia uma sonda. `route-table` preenche prefixos e portas em campos independentes. |
| Wi-Fi | `antenna` gira o feixe até o receptor. `channel` escolhe uma faixa sem interferência. `power-signal` regula a margem medida no receptor. `repeaters` cobre três zonas com até dois repetidores. |

RAM, arquivos e interfaces aceitam arrastar com mouse ou toque. Também é possível selecionar a peça e acionar o destino com clique, toque ou teclado. Os medidores de refrigeração e potência atualizam a leitura durante o ajuste. As pistas e os estados dos equipamentos ficam no próprio painel.

### Equipamentos das fases 6 a 10

| Fase | Desafios |
| --- | --- |
| Cabeamento | `cabling` ordena os fios RJ45 por T568A ou T568B. `continuity` mede trechos e fecha as emendas abertas. `connectors` encaixa cabos nas portas correspondentes. `fiber` alinha dois eixos até atingir 100% e travar o acoplador. |
| DHCP | `ip-distribution` distribui IPs válidos e únicos. `ip-conflicts` reemite a concessão duplicada mais recente. `ip-reservations` associa reservas por MAC. `ip-pool` ajusta os limites do intervalo de concessão. |
| DNS | `dns-records` conecta domínios a endereços. `dns-tree` liga nós aos servidores pai. `dns-cache` remove registros expirados ou com versão antiga. `dns-query` percorre referências até o servidor autoritativo. |
| Firewall | `firewall` decide quais conexões passam. `policy-order` reorganiza regras e mostra a decisão da primeira regra aplicável. `threats` inspeciona capturas e isola fluxos que ultrapassam os limiares. `barriers` restaura um anel de segmentos acoplados. |
| Servidores | `servers` sincroniza relógios de réplicas. `rack-power` liga fontes a barramentos pela etiqueta. `rack-load` distribui processos conforme a capacidade. `core-relays` restaura relays com dependências. `fiber` e `circuit` completam os reparos do backbone. |

Cada tipo aparece no máximo duas vezes por fase. Servidores usa seis tipos para seus 12 componentes. O acoplador óptico tem mais posições de ajuste nessa fase. Os reparos continuam acionando as mesmas condições de objetivos, portas e plataformas. O encontro de VIRUS ZERO continua sob a lógica da campanha.

Nos encaixes, arraste com mouse ou toque, ou acione uma peça e depois seu destino com clique, toque ou teclado. A resposta do medidor óptico acompanha o ajuste. Políticas, barreiras e cargas mostram o efeito das alterações antes da verificação final.

### Padrão visual compartilhado

`.repair-console` reúne a moldura, o LED de estado, as instruções, a área do equipamento, os comandos e o feedback. `data-theme` escolhe o acento da fase e `data-state` controla a indicação de conclusão ou falha. Os equipamentos registrados em `equipmentType` desenham seus controles com as funções do painel. O diagnóstico DHCP original segue disponível no catálogo para extensões e no laboratório.

Use mouse ou toque nos controles. Pelo teclado: **Tab/Shift+Tab** navegam, **Enter/Espaço** acionam botões, setas percorrem peças e ajustam seletores/sliders, **V** verifica, **H** usa uma dica, **Esc** pausa. Há botões de pausa e fechamento para toque. O foco fica dentro do diagnóstico; abrir o menu de pausa preserva o desafio e impede ações durante a pausa.

Uma configuração incorreta recebe feedback e consome uma verificação. Após três erros, a tentativa falha e desconta até **5 pontos de integridade**, preservando no mínimo **1 ponto**. A penalidade acontece uma única vez por tentativa. O mundo continua congelado enquanto o jogador decide entre outra variação ou fechar. Cancelar não consome vida nem concede XP. Não há limite de tentativas.

**Reparo eficiente** concede uma dica adicional por nível e uma verificação adicional a cada dois níveis. As dicas orientam uma peça, mostram uma associação ou o primeiro salto da rota; ainda é necessário resolver e verificar o desafio. A antiga duração permanece no código apenas para compatibilidade com minigames de extensão e testes antigos; os desafios da campanha não usam reparo por tempo segurando E.

Ao vencer, um breve estado de confirmação antecede a conclusão. A integração marca o componente como reparado, restaura sua integridade, elimina corrupção, emite o evento `repair`, concede os 30 XP habituais e salva a campanha. Os caminhos, elevadores, portas, efeitos ambientais e escudos que já dependiam desses componentes continuam ligados às mesmas flags. As perguntas obrigatórias ao final das fases permanecem em sua interface e fluxo próprios.

Reparos concluídos são persistidos pelo salvamento existente. O desafio em andamento é mantido durante a pausa, mas é descartado ao fechar ou recarregar a página; o componente continua disponível para um novo diagnóstico. Não se salva a interface nem uma resolução parcial no save.

## Distribuição final da campanha

Inventário extraído dos mapas carregados pelo teste de reparos. A tabela registra o ID do componente, o rótulo no mapa e o ID do minigame.

| Fase | Componentes | Tipos utilizados | Maior repetição |
| --- | --- | --- | --- |
| Hardware | 4 | 4 | 1 |
| Software | 5 | 4 | 2 |
| Switch | 6 | 4 | 2 |
| Roteador | 6 | 4 | 2 |
| Wi-Fi | 6 | 4 | 2 |
| Cabeamento | 7 | 4 | 2 |
| DHCP | 6 | 4 | 2 |
| DNS | 7 | 4 | 2 |
| Firewall | 8 | 4 | 2 |
| Servidores | 12 | 6 | 2 |

São 67 componentes e 40 tipos usados na campanha. Três diagnósticos originais adicionais continuam no catálogo para compatibilidade. As diferenças de interação incluem rotação, encaixe, regulagem, filas, exclusão seletiva, travas de dependência, sondagem, árvores, troca de cartões e distribuição sob limites de capacidade.

RAM, arquivos, interfaces, conectores, reservas, registros e fontes compartilham os controles de encaixe. A variedade foi revisada por famílias de interação e regras, considerando esse reaproveitamento. IPs têm exclusividade e endereços inválidos, cargas usam múltiplos processos por rack e limite de CPU, árvores aceitam vários filhos por servidor pai e os encaixes simples usam uma peça por destino.

A revisão encontrou três relações que precisavam de contexto mais claro. O reparo de paginação usa a cadeia Tabela de páginas → Mapeamento → Arquivo de swap → Retomar processos. O pool DHCP informa que .1 está reservado ao gateway. No servidor com memória corrompida, a distribuição de cargas transfere os processos para racks íntegros. Esses ajustes usam o mesmo contrato de sessão e mantêm os IDs dos componentes.

### 1. Hardware

4 reparos e 4 tipos.

| Componente | Função no mapa | Tipo |
| --- | --- | --- |
| `socket:cpu-relay` | REFRIGERACAO DA CPU | `cooling` |
| `ram-base:ram-relay` | BANCO DE MEMORIA | `ram` |
| `bus-west:bus-relay` | MALHA DOS BARRAMENTOS | `circuit` |
| `gpu-east:gpu-relay` | ALIMENTACAO PRINCIPAL DA GPU | `gpu` |

### 2. Software

5 reparos e 4 tipos.

| Componente | Função no mapa | Tipo |
| --- | --- | --- |
| `root:index` | RESTAURAR INDICE DE ARQUIVOS | `files` |
| `scheduler:scheduler` | RESTAURAR ESCALONADOR | `software` |
| `swap:paging` | RESTAURAR PAGINACAO | `boot` |
| `recovery:recovery` | RECONSTRUIR ARQUIVOS | `quarantine` |
| `kernel-stack:kernel` | RESTAURAR PROCESSOS DO NUCLEO | `software` |

### 3. Switch

6 reparos e 4 tipos.

| Componente | Função no mapa | Tipo |
| --- | --- | --- |
| `matrix-north:table` | RECONSTRUIR TABELA MAC | `packets` |
| `core-guard:fabric` | RESTAURAR CONECTIVIDADE | `packets` |
| `uplink-crown:uplink` | RESTAURAR UPLINK | `uplink` |
| `port04:connector` | REPARAR RJ45 / PORTA 04 | `ethernet` |
| `port01:connector` | REPARAR RJ45 / PORTA 01 | `ethernet` |
| `channel-relay:bus` | SINCRONIZAR CANAIS | `vlan` |

### 4. Roteador

6 reparos e 4 tipos.

| Componente | Função no mapa | Tipo |
| --- | --- | --- |
| `gateway-tower:gateway` | RESTAURAR GATEWAY PADRAO | `gateway` |
| `iface-lan:lan` | CONFIGURAR INTERFACE LAN | `interfaces` |
| `core-main:table` | RESTAURAR TABELA DE ROTEAMENTO | `route-table` |
| `wan-relay:link` | SINCRONIZAR TUNEL WAN | `route` |
| `iface-console:transit` | RECONSTRUIR ROTAS DE TRANSITO | `route` |
| `iface-wan:wan` | CONFIGURAR INTERFACE WAN | `interfaces` |

### 5. Wi-Fi

6 reparos e 4 tipos.

| Componente | Função no mapa | Tipo |
| --- | --- | --- |
| `main-array:uplink` | RESTAURAR ANTENA PRINCIPAL | `antenna` |
| `repeater-west:west` | SINCRONIZAR REPETIDOR OESTE | `repeaters` |
| `repeater-east:east` | SINCRONIZAR REPETIDOR LESTE | `repeaters` |
| `noise-center:spectrum` | LIMPAR ESPECTRO DE RADIO | `channel` |
| `transmit-west:carrier` | RESTAURAR PORTADORA | `power-signal` |
| `base-west:association` | CALIBRAR ASSOCIACAO WI-FI | `channel` |

### 6. Cabeamento

7 reparos e 4 tipos.

| Componente | Função no mapa | Tipo |
| --- | --- | --- |
| `roof-controls:antenna` | RECONECTAR COBERTURA | `fiber` |
| `upper-hub:distribution` | RESTAURAR DISTRIBUICAO SUPERIOR | `connectors` |
| `shaft-west-mid:motor` | REPARAR CONTROLE DOS ELEVADORES | `continuity` |
| `maintenance-west:service` | RESTAURAR QUADRO DE MANUTENCAO | `cabling` |
| `central-main:patch` | RECONECTAR PAINEL PRINCIPAL | `connectors` |
| `central-east:trunk` | REPARAR TRONCO DE COBRE | `cabling` |
| `basement-power:power` | RESTAURAR ALIMENTACAO DO SUBSOLO | `continuity` |

### 7. DHCP

6 reparos e 4 tipos.

| Componente | Função no mapa | Tipo |
| --- | --- | --- |
| `gateway-plaza:gateway` | RESTAURAR GATEWAY DA CIDADE | `ip-pool` |
| `address-office:scope` | RECONSTRUIR ESCOPO DE ENDERECOS | `ip-pool` |
| `reserve-main:reservation` | RESTAURAR TABELA DE RESERVAS | `ip-reservations` |
| `central-core:server` | RESTAURAR SERVIDOR DHCP | `ip-distribution` |
| `conflict-core:conflict` | RESOLVER ENDERECOS DUPLICADOS | `ip-conflicts` |
| `distribution-south:relay` | REPARAR DISTRIBUICAO DE CONCESSOES | `ip-distribution` |

### 8. DNS

7 reparos e 4 tipos.

| Componente | Função no mapa | Tipo |
| --- | --- | --- |
| `root-core:hints` | RESTAURAR REFERENCIAS DA RAIZ | `dns-tree` |
| `com-records:records` | RECONSTRUIR REGISTROS A / AAAA | `dns-records` |
| `com-zone:delegation` | RESTAURAR DELEGACAO .COM | `dns-tree` |
| `org-records:records` | RECONSTRUIR REGISTROS .ORG | `dns-records` |
| `cache-crown:ttl` | RENOVAR CACHE / TTL | `dns-cache` |
| `cache-terminal:recursive` | RESTAURAR RESOLVEDOR RECURSIVO | `dns-query` |
| `resolve-core:resolution` | CONCLUIR RESOLUCAO DNS | `dns-query` |

### 9. Firewall

8 reparos e 4 tipos.

| Componente | Função no mapa | Tipo |
| --- | --- | --- |
| `c01` | REGRAS DO PERÍMETRO | `policy-order` |
| `c02` | POLÍTICA DE INSPEÇÃO | `firewall` |
| `c05` | RESTAURAR TRAVAS DA ECLUSA | `barriers` |
| `c06` | ENERGIZAR DUTOS | `barriers` |
| `c03` | REGRAS DO ANEL INTERNO | `policy-order` |
| `c07` | SINCRONIZAR DEFESA DO ANEL | `threats` |
| `c04` | POLÍTICA DA CIDADELA | `firewall` |
| `c08` | RESTAURAR NÚCLEO DE SEGURANÇA | `threats` |

### 10. Servidores

12 reparos e 6 tipos.

| Componente | Função no mapa | Tipo |
| --- | --- | --- |
| `c01` | RESTAURAR DISTRIBUIÇÃO DE ENTRADA | `rack-power` |
| `c02` | SINCRONIZAR TORRE B | `servers` |
| `c05` | RESTAURAR FIBRA DA TORRE A | `fiber` |
| `c06` | RESTABELECER ENERGIA DA OFICINA | `rack-power` |
| `c07` | RECONECTAR CANAL DE MANUTENÇÃO | `fiber` |
| `c03` | RESTAURAR TRANSMISSÃO CENTRAL | `rack-load` |
| `c08` | ATIVAR ROTA REDUNDANTE | `circuit` |
| `c09` | ISOLAR MEMÓRIA CORROMPIDA | `rack-load` |
| `c10` | ESTABILIZAR CONTENÇÃO | `servers` |
| `c11` | RECUPERAR BARRAMENTO FINAL | `circuit` |
| `c12` | RESTAURAR BACKUP DO NÚCLEO | `core-relays` |
| `c04` | ESCUDO DO NÚCLEO | `core-relays` |

## Organização e extensão

### Laboratório do Modo Desenvolvedor

Ative o Modo Desenvolvedor nas opções e abra **Laboratório de reparos (nova aba)**. A página começa na fase selecionada e permite escolher qualquer componente das dez fases. Os tipos e as seeds vêm do mesmo distribuidor usado pela campanha.

O laboratório usa `tests/minigames.html` e `tests/repair-lab.js`. Ele carrega os mapas e o motor de reparos diretamente. A página mantém as tentativas em memória e permite começar outra tentativa, sem carregar o controlador da campanha. A navegação Tab pode sair do painel para acessar os seletores de fase e componente.

### Recompensas e falhas

O reparo concluído concede 30 XP uma única vez. Completar todos os reparos também pode disparar o bônus de objetivo de 100 XP já existente. O teste calcula as duas parcelas separadamente. Cancelar concede zero XP. Uma tentativa esgotada aplica até cinco pontos de dano, preservando pelo menos um ponto de vida, e aguarda nova tentativa ou fechamento.

O catálogo `ByteRunner.repairChallenges.catalog` expõe ID, mecânica e dificuldade de cada tipo. `assign(phase)` devolve as especificações por ID de componente. As dez fases têm preferências por ID de componente em `campaignEquipment`, sujeitas à cota. A distribuição também favorece o conjunto temático da fase, usa região, ID, rótulo e dificuldade do componente e reduz a prioridade de tipos já usados na mesma região. O mapa, a seed, o ID e a região determinam o desempate. Reordenar a lista de componentes preserva a seleção.

Use `repair: { type: 'dns' }` para fixar um tipo. Omitir `repair` ou usar `repair: { selection: 'auto', difficulty: 3 }` delega a escolha. Definições explícitas, incluindo extensões, são reservadas antes da distribuição e contam na cota. O distribuidor prioriza três mecânicas distintas quando há componentes suficientes e a configuração permite. A seleção automática nunca acrescenta uma terceira ocorrência do mesmo tipo. Definições explícitas têm precedência, portanto os autores de mapas precisam respeitar a cota ao fixar tipos. Se os candidatos da fase esgotarem a capacidade automática, o erro identifica o mapa e o componente sem vaga.

- `src/engine/repairs.js`: registro e contrato de sessão (`status`, `blocksWorld`, `mount`, `update`, `cancel`, `dispose`). Os tipos antigos continuam disponíveis para extensões.
- `src/engine/repair-games.js` concentra o catálogo, a distribuição e as regras. As chamadas existentes de `forPhase()` criam marcadores automáticos que também funcionam no laboratório isolado.
- `game.js` aplica a distribuição na criação dos componentes. `src/generation/gameplay.js` encaminha a dificuldade dos reparos procedurais.
- `style.css`: tabuleiros, marcação de conexões, listas, sliders, feedback e layout rolável para telas pequenas.
- `tests/repairs.js`: solução pelos controles reais, todos os componentes da campanha, variações com sementes, congelamento do mundo, pausa, cancelamento, falha, retry, habilidade, XP único e persistência.

`python tests/run_review.py --repairs-only --result-label repair-catalog` passou nas oito verificações no Chrome, incluindo distribuição nas dez fases, solução dos 67 reparos, regras específicas, pausa, penalidade, dicas, XP e persistência. Também passaram `python tools/check_maps.py`, `python tools/check_environment.py`, `python tools/check_parallax.py` e `python tools/check_generation.py`. Os controles funcionais reutilizam o painel existente para a futura reformulação visual.

`tests/minigames.html` oferece um laboratório isolado para experimentar o catálogo sem alterar a campanha. `python tests/capture_repairs.py` captura as interfaces de hardware em desktop/tela estreita e cabeamento em tela estreita. O laboratório limita explicitamente sua largura nas capturas para compensar a largura mínima de janela do Chrome headless.

A regressão completa com `python tests/run_review.py` percorreu as dez fases e passou em 221 verificações de sistemas, sem erros de runtime. Os modos `--room-gameplay` e `--gameplay-demo` passaram em 11 e 3 verificações, respectivamente.

Para o painel de circuitos, `python tests/run_review.py --repairs-only` passou em nove verificações no Chrome em desktop e com `--viewport 390x844`. O novo teste cobre foco, seleção, energia em tempo real, reinício e conclusão em um circuito 4 × 4. As capturas do laboratório foram conferidas em desktop e largura de 390 px. A validação de toque em aparelho físico segue pendente.

Durante a implementação dos equipamentos, a suíte de reparos foi executada após cada fase. A rodada final passou nas 11 verificações no Chrome em desktop e em 390 × 844. Ela resolveu os 67 reparos da campanha e 128 variantes dos 16 tipos adicionados, verificou a distribuição temática e simulou arrastar por toque e seleção por clique. Também passaram `tools/check_environment.py` e `tools/check_generation.py`.

Para as fases 6 a 10, `python tests/run_review.py --phase N --result-label themed-map-N` passou individualmente em cada fase. Os relatórios verificam acesso aos reparos, saída, salvamento e progressão. O de Servidores também cobre o bloqueio da arena, os limiares do chefe e a vitória contra VIRUS ZERO. A suíte final de reparos passou nas 11 verificações em desktop e em 390 × 844, com os 67 reparos da campanha e oito seeds para cada um dos 17 tipos adicionados nesta etapa. O toque foi simulado no navegador.

## Revisão final de integração

### Escopo dos testes

| Execução | Resultado |
| --- | --- |
| `python tools/test_developer_mode.py --full` | 21 verificações do Modo Desenvolvedor e 224 verificações de sistemas na regressão completa, com dez fases e zero erros de runtime |
| `python tests/run_review.py --repairs-only --result-label repair-integration` | 11 verificações aprovadas |
| Mesma suíte em `--viewport 390x844` | 11 verificações aprovadas |
| Laboratório por CDP | 67 componentes em três resoluções, com armazenamento preservado |
| Verificadores de mapas, ambiente, parallax e geração | Aprovados |
| `python tests/capture_repairs.py` | Cinco capturas geradas e conferidas |

Os relatórios estão em `tests/repair-integration-results.json`, `tests/repair-integration-mobile-results.json` e `tests/developer-mode-results/`. A regressão completa está em `tests/developer-mode-results/regression.json`. A última correção dos textos foi seguida por nova execução da suíte de reparos.

- A suíte de reparos cobre os 67 componentes, o limite de repetição, os tipos esperados por fase e a seleção determinística. São oito seeds para cada um dos 43 tipos registrados, totalizando 344 variantes resolvidas pelos controles DOM.
- As verificações adicionais cobrem bloqueio óptico, IP duplicado e broadcast, inversão dos segmentos vizinhos, desligamento dos relays dependentes e ausência de rolagem horizontal nos painéis reais.
- O teste de laboratório usa eventos de entrada do Chrome DevTools Protocol para arrastar com mouse e toque emulado e girar placas com Enter e Espaço. Percorre os 67 componentes em 1440 × 1000, 390 × 844 e 844 × 390 e compara o armazenamento local antes e depois.
- As capturas de circuitos em desktop e de RAM, RJ45, Firewall e Servidores em tela estreita foram conferidas visualmente. As trilhas e as peças são desenhadas com CSS e bordas de pixels inteiros. Os avisos de estado combinam texto e cor.

### Falhas encontradas e correções

- O laboratório anterior agrupava opções por tipo e usava o diagnóstico original da fase. Agora os seletores de fase e componente usam os mapas e a distribuição real.
- O painel do laboratório aplicava o comportamento de foco de uma janela modal ao conteúdo da página. A navegação Tab agora alcança os seletores e as tentativas.
- A moldura compartilhada mostrava uma instrução de pausa da campanha na bancada isolada. O contexto do laboratório agora omite essa instrução.
- As pistas de alguns diagnósticos antigos exibiam interrogações no lugar de acentos e setas. Os textos de processos, Ethernet, DHCP e DNS foram corrigidos.
- As capturas estreitas ficaram deslocadas pela largura mínima da janela headless. A largura de referência agora começa na margem esquerda.
- A primeira emissão de Enter pelo teste CDP não produziu a ativação esperada. O teste agora emite o retorno de carro com a tecla e verifica também Espaço.
- Houve falhas de permissão no diretório temporário e uma falha de inicialização do debugger do Chrome. As execuções afetadas foram repetidas.

### Arquivos desta revisão

`src/engine/repair-games.js`, `src/engine/developer-mode.js`, `style.css`, `tests/minigames.html`, `tests/repair-lab.js`, `tests/repairs.js`, `tests/run_review.py`, `tests/capture_repairs.py`, `tools/test_developer_mode.py`, `tools/check_environment.py`, este documento e `REBUILD_MAPS_V3.md`. Relatórios e capturas acompanham os testes.

### Limitações restantes

Toque, orientação e tamanhos de tela foram exercitados no Chrome headless. A ergonomia em aparelhos físicos, leitores de tela e partidas humanas contínuas continua pendente. A prova de acesso dos mapas usa saltos simulados e deslocamentos entre apoios alcançáveis. A automação resolve os diagnósticos a partir de seus modelos e não mede dificuldade percebida ou duração de uma partida.

## Finalização dos painéis animados

### Apresentação e ciclo de vida

- Abertura em 180 ms, com deslocamento e escala discretos. Fechamento em 160 ms, sem atrasar o cancelamento, o resultado do reparo ou a retomada do mundo.
- O fechamento usa uma cópia visual temporária, sem IDs, sem eventos copiados, com `inert`, `aria-hidden` e eventos de ponteiro desativados. A cópia é removida ao terminar; abrir outro painel remove imediatamente qualquer fechamento anterior.
- Seleção e foco permanecem nos controles nativos. Interruptores deslocam sua alavanca; encaixes e ativações aceitas produzem quatro pequenas faíscas durante 260 ms. A confirmação ilumina a borda interna do equipamento durante 440 ms.
- Uma verificação incorreta tem um deslocamento curto e uma indicação de erro em texto, borda e LED. A tentativa esgotada usa um cabeçalho de interrupção distinto. Encaixes RAM incompatíveis continuam tendo sua própria rejeição visual, sem consumir uma verificação.
- O sistema operacional (`prefers-reduced-motion`) e a opção **Reduzir efeitos** do jogo desativam esses movimentos, inclusive os efeitos feitos com Web Animations. Cor, texto, foco, estados e controles continuam disponíveis.

As ilustrações de equipamento são originais, em CSS e SVG: módulos DIMM e travas, ventoinha e medidor térmico, GPU e conector PCIe, arquivos e pastas, portas Ethernet, antenas, RJ45, sondas, acoplador óptico, dispositivos DHCP, servidores DNS, portões de segurança e racks com ventilação e carga. Os efeitos refletem as mesmas escolhas e leituras usadas pelos controles. Diagramas decorativos ficam fora da árvore de acessibilidade; instruções, pistas, mensagens e nomes acessíveis continuam em pt-BR. Os estados do Modo Desenvolvedor agora mostram **LIGADO/DESLIGADO**, e os terminais do circuito usam **ENT./SAÍDA**.

### Desempenho e preservação das regras

Não foi acrescentado um ciclo de `requestAnimationFrame`. CSS e Web Animations executam os efeitos; apenas posições de cabos e medidores são atualizadas nos eventos de entrada. A seleção de peças, concessões, nós e processos, a escolha de portas e a rotação de placas mantêm o DOM existente. A rotação atualiza trilhas, LEDs, seleção, descrição acessível e saída no próprio tabuleiro; mudanças que alteram a estrutura do desafio ainda usam o renderizador compartilhado.

Durante o arraste, o SVG acompanha o ponteiro sem reconstrução. As coordenadas são convertidas para o espaço local do painel, para manter a outra ponta ancorada mesmo durante a escala da abertura. `AbortController` remove os eventos da renderização anterior; observadores de tamanho são desconectados e animações programáticas são canceladas ao descartar a sessão. A única apresentação restante ao fechar é a cópia inerte de 160 ms.

Distribuição, sementes, soluções e dificuldade foram preservadas. Não há mudanças em XP, penalidades, dicas, dados salvos, objetivos, checkpoints ou progressão. A comparação com o código versionado confirmou a distribuição e a geração dos modelos, descontando apenas os ajustes de texto em pt-BR. A proteção de fonte em `tools/check_environment.py` foi atualizada para o hash exato da revisão visual; ela continua rejeitando outras alterações. Nenhum módulo de mapa foi refeito.

### Validação desta finalização

| Execução atual | Resultado confirmado |
| --- | --- |
| `python tests/run_review.py --repairs-only --viewport 1280x720 --result-label repairs-polish-desktop` | 25 verificações aprovadas; zero erros de runtime. |
| `python tests/run_review.py --repairs-only --viewport 390x844 --result-label repairs-polish-mobile` | Nova execução impedida por falta de espaço (WinError 112); o relatório anterior não conta como reexecução aprovada. |
| `python tests/audit_equipment.py` | Nova execução interrompida ao gravar capturas por falta de espaço (Errno 28). Relatório e galeria anteriores são históricos e não comprovam aprovação desta execução. |
| `python tools/test_developer_mode.py --full` | Interface em três tamanhos, 21 verificações do Modo Desenvolvedor e verificadores de mapas, ambiente, parallax e geração aprovados. Suíte geral da campanha ainda em execução. |

Os relatórios desta versão estão em `tests/repairs-polish-desktop-results.json`, `tests/repairs-polish-mobile-results.json`, `tests/animated-equipment/results.json` e `tests/developer-mode-results/`. O campo `sourceSha256` identifica o código exercitado. As capturas antes/depois estão em `tests/animated-equipment/gallery.html` e `gallery.png`.

A suíte de reparos exercita sucesso e falha, XP concedido uma só vez, penalidades, dicas, persistência, pausa do mundo, distribuição dos 67 componentes e variantes de todos os tipos do catálogo. Os novos testes também verificam estabilidade do DOM, ausência de ouvintes ativos após descarte e respeito à opção de redução de efeitos.

Foram encontradas e corrigidas duas incompatibilidades dos testes antigos: o teste do laboratório tentava instalar qualquer DIMM em qualquer slot, e o verificador de ambiente exigia o hash anterior a esta sequência de melhorias visuais. O arraste agora escolhe o módulo pelo rótulo público de entalhes e considera a rolagem; o verificador mantém a proteção por hash exato. Um teste de desktop também detectou a variação indevida das coordenadas locais de cabos durante a abertura; a conversão de escala corrigiu a ancoragem. Os relatórios reprovados intermediários não são usados como aprovação final.

### Arquivos da finalização

- Apresentação e idioma: `src/engine/repair-games.js`, `style.css`, `index.html`, `src/engine/developer-mode.js`.
- Testes e proteção de escopo: `tests/repairs.js`, `tests/developer-mode.js`, `tests/audit_equipment.py`, `tools/test_developer_mode.py`, `tools/check_environment.py`.
- Documentação: `docs/repair-minigames.md`.
- Evidências geradas: `tests/repairs-polish-*-results.json`, `tests/animated-equipment/` e `tests/developer-mode-results/`. As alterações anteriores em `tests/minigames.html` e `tests/capture_hardware.py` continuam fazendo parte da sequência de melhorias.

### Limites da validação

Os controles nativos são exercitados pelo Chrome DevTools Protocol. Toque é emulado; aparelhos físicos, outros navegadores, leitores de tela e avaliação humana de ergonomia e dificuldade continuam pendentes. Os solucionadores usam as respostas dos modelos para acionar os controles, sem atribuir sucesso diretamente. A regressão de percurso usa a simulação de saltos existente, não uma partida humana contínua.

A espera de inicialização do Chrome em `tools/test_developer_mode.py` agora tolera arquivo temporariamente bloqueado ou incompleto, com prazo e verificação de encerramento do processo. Isso corrige a falha de infraestrutura observada antes dos testes da interface.
