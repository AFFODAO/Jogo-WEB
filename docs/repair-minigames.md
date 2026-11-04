# Diagnósticos interativos

Os componentes das dez fases usam desafios modais. Aperte **E uma vez** perto do componente ou toque em REPARAR. Movimentação, gravidade, inimigos, tiros, plataformas, partículas e relógios do mundo ficam congelados. A sessão mantém a velocidade e a posição anteriores; ao fechar, o mundo retoma dali, com as teclas de movimento limpas para evitar comandos presos.

| Fase | Diagnóstico |
| --- | --- |
| Hardware | Gire peças com conexões norte/leste/sul/oeste. A validação percorre as conexões reais, de IN até OUT. Os primeiros componentes têm 3 × 3 peças; o terceiro tem 4 × 4. |
| Software | Restaure as quatro etapas de carregamento, verificação, isolamento e execução. |
| Switch | Associe portas Ethernet aos destinos das etiquetas. |
| Roteador | Construa uma rota por nós adjacentes, evitando as conexões bloqueadas. Clique no último nó para desfazer ou reinicie a rota. |
| Wi-Fi | Ajuste canal e potência com controles deslizantes. A tolerância da potência é de cinco pontos percentuais. |
| Cabeamento | Organize os oito pinos de um cabo segundo a referência T568A ou T568B apresentada. |
| DHCP | Respeite reservas de IP, sem duplicações e sem atribuir endereço de rede/broadcast. |
| DNS | Relacione domínios aos IPs indicados pelas pistas dos registros. |
| Firewall | Permita ou bloqueie cada conexão conforme a política apresentada. |
| Servidores | Sincronize as épocas dos servidores e ative o relay do núcleo. |

As peças embaralhadas, opções, destinos, canal, potência, IPs, domínios, regras e épocas variam conforme o desafio. No roteador, os bloqueios variam fora de uma rota garantida, evitando tabuleiros impossíveis. As pistas contêm todas as informações necessárias; não há limite de tempo nem dependência de conhecimento externo.

## Controles e tentativas

Use mouse ou toque nos controles. Pelo teclado: **Tab/Shift+Tab** navegam, **Enter/Espaço** acionam botões, setas percorrem peças e ajustam seletores/sliders, **V** verifica, **H** usa uma dica, **Esc** pausa. Há botões de pausa e fechamento para toque. O foco fica dentro do diagnóstico; abrir o menu de pausa preserva o desafio e impede ações durante a pausa.

Uma configuração incorreta recebe feedback e consome uma verificação. Após três erros, a tentativa falha e desconta até **5 pontos de integridade**, preservando no mínimo **1 ponto**. A penalidade acontece uma única vez por tentativa. O mundo continua congelado enquanto o jogador decide entre outra variação ou fechar. Cancelar não consome vida nem concede XP. Não há limite de tentativas.

**Reparo eficiente** concede uma dica adicional por nível e uma verificação adicional a cada dois níveis. As dicas orientam uma peça, mostram uma associação ou o primeiro salto da rota; ainda é necessário resolver e verificar o desafio. A antiga duração permanece no código apenas para compatibilidade com minigames de extensão e testes antigos; os desafios da campanha não usam reparo por tempo segurando E.

Ao vencer, um breve estado de confirmação antecede a conclusão. A integração marca o componente como reparado, restaura sua integridade, elimina corrupção, emite o evento `repair`, concede os 30 XP habituais e salva a campanha. Os caminhos, elevadores, portas, efeitos ambientais e escudos que já dependiam desses componentes continuam ligados às mesmas flags. As perguntas obrigatórias ao final das fases permanecem em sua interface e fluxo próprios.

Reparos concluídos são persistidos pelo salvamento existente. O desafio em andamento é mantido durante a pausa, mas é descartado ao fechar ou recarregar a página; o componente continua disponível para um novo diagnóstico. Não se salva a interface nem uma resolução parcial no save.

## Organização e extensão

- `src/engine/repairs.js`: registro e contrato de sessão (`status`, `blocksWorld`, `mount`, `update`, `cancel`, `dispose`). Os tipos antigos continuam disponíveis para extensões.
- `src/engine/repair-games.js`: modelos dos dez desafios, geradores de variações, validação, renderização DOM, dicas, tentativas e navegação de teclado. `repairChallenges.forPhase()` seleciona o tipo por fase.
- `game.js`: abertura por E/toque, pausa do mundo, vantagem da habilidade, penalidade e integração com os efeitos e saves existentes. Um `repair` explícito de extensão é respeitado; componentes sem definição e antigos `hold` recebem o desafio da fase.
- `style.css`: tabuleiros, marcação de conexões, listas, sliders, feedback e layout rolável para telas pequenas.
- `tests/repairs.js`: solução pelos controles reais, todos os componentes da campanha, variações com sementes, congelamento do mundo, pausa, cancelamento, falha, retry, habilidade, XP único e persistência.

Execute `python tools/check_maps.py` e `python tests/run_review.py`. O segundo usa Chrome e um perfil temporário, sem tocar no salvamento real do jogador. A navegação por toque usa Pointer Events e controles HTML nativos; a ergonomia deve ser conferida também em aparelhos físicos.

`tests/minigames.html` oferece um laboratório isolado para experimentar os dez desafios sem alterar a campanha. `python tests/capture_repairs.py` captura as interfaces de hardware em desktop/tela estreita e cabeamento em tela estreita. O laboratório limita explicitamente sua largura nas capturas para compensar a largura mínima de janela do Chrome headless.
