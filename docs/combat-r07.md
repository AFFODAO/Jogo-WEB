# Combate do R-07 — contrato atual

Este documento registra o contrato atual dos ataques. Os limites completos de dano, defesa, cura, progressão e resultados da auditoria estão em [Combate V2](combat-v2.md); os ranks e habilidades estão em [Habilidades V2](abilities-v2.md).

- **J / ATACAR:** dano 1, intervalo `0,32 × (1 − 0,05 × potência(Estabilizador))` s; potência 0/1,5/2,4/3. Segurar mantém o disparo. Toques breves têm buffer de 0,12 s; o menor intervalo de habilidade é 0,272 s antes dos modificadores ambientais.
- **K / ESPECIAL:** preparação visível e sonora de 0,28 s, dano 3 e até dois alvos distintos. Custa 25 da reserva compartilhada de 100, sem regeneração; recarga base de 6 s, reduzida conforme Canhão para 5,4/5,04/4,8 s. Exige novo acionamento; segurar não repete. Não multiplica o dano básico.
- **Q / ESCUDO:** proteção manual de 0,45/0,55/0,65 s, recarga de 16 s, custa 50 da mesma reserva de energia. A reserva é salva, não retorna por morte/retry e é recarregada apenas ao entrar em outra fase.
- Movimento, salto e mudança de direção continuam disponíveis durante a preparação. O disparo usa a posição e direção atuais na liberação. O básico fica suspenso durante a preparação; o especial privilegia alinhamento de alvos e janelas de vulnerabilidade.
- Velocidade e intervalo continuam recebendo os modificadores do ambiente; a recarga especial também recebe o modificador de intervalo. Colisões verificam o segmento percorrido contra sólidos, inimigos e interceptadores de pacotes. Paredes vencem empates. Plataformas unidirecionais permanecem transparentes aos tiros.
- Feedback usa os efeitos limitados existentes, clarão de acerto, partículas, sons sintetizados distintos e projétil especial dourado. Não há pausa de física por impacto.

## Persistência e interrupções

O snapshot da campanha preserva os temporizadores básicos/especiais e a energia compartilhada (`combatAttack` v2). Saves antigos sem esse campo recebem a reserva inicial de 100 uma vez; saves atuais restauram o saldo salvo.

A energia do K é gasta ao iniciar a preparação e salva nesse instante. Pausa, perda de foco, diagnóstico, escolha de habilidade, questão, checkpoint e troca de mapa cancelam a preparação e limpam a entrada, preservando o gasto. Carregar não restaura projéteis nem preparação; não há recarga offline. Saves anteriores sem energia recebem a reserva inicial uma vez. A energia e as demais fórmulas atuais estão detalhadas em [Combate V2](combat-v2.md).

## Verificação

`python tests/run_review.py --combat-v2 --result-label combat-v2` executa o controlador e as colisões reais em Chrome isolado, incluindo regressões dos inimigos e VIRUS ZERO. Repetir com `--viewport 390x844` verifica limites do HUD e botões. A suíte cobre cadência em 30/60/120/144 Hz, buffer de entrada, teclado e ponteiros, movimento/salto, paredes finas, perfuração limitada, contatos repetidos, recarga, pausa, mapas, saves antigos/novos, áudio e efeitos reduzidos. Eventos de entrada são despachados no DOM; não substituem uma sessão manual prolongada de equilíbrio.
