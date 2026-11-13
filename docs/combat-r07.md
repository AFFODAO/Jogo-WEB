# Combate do R-07 — implementação incremental

Este documento registra a primeira etapa dos ataques. Os limites de habilidades, a cadência aprimorada e a recarga por rank foram atualizados em [Habilidades V2](abilities-v2.md), que descreve o balanceamento atual.

- **J / ATACAR:** dano 1, intervalo base de 0,32 s; segurar mantém o disparo. Toques breves têm buffer de 0,12 s. Disparo rápido reduz 0,008 s por rank, até 0,28 s (3,125–3,571 tiros/s antes dos modificadores ambientais).
- **K / ESPECIAL:** preparação visível e sonora de 0,28 s, dano 3 e até dois alvos distintos. Exige novo acionamento; segurar não repete. Recarga base de 6 s, reduzida em 0,25 s por rank de Canhão, até 4,75 s. Não multiplica o dano básico. Contra um alvo, acrescenta no máximo 0,5–0,632 de dano/s bruto antes dos modificadores e do tempo dedicado à preparação.
- Movimento, salto e mudança de direção continuam disponíveis durante a preparação. O disparo usa a posição e direção atuais na liberação. O básico fica suspenso durante a preparação; o especial privilegia alinhamento de alvos e janelas de vulnerabilidade.
- Velocidade e intervalo continuam recebendo os modificadores do ambiente; a recarga especial também recebe o modificador de intervalo. Colisões verificam o segmento percorrido contra sólidos, inimigos e interceptadores de pacotes. Paredes vencem empates. Plataformas unidirecionais permanecem transparentes aos tiros.
- Feedback usa os efeitos limitados existentes, clarão de acerto, partículas, sons sintetizados distintos e projétil especial dourado. Não há pausa de física por impacto.

## Persistência e interrupções

O save v1 aceita o campo opcional `combatAttack` com versão interna 1 e segundos restantes de recarga básica/especial. Saves antigos iniciam o especial pronto. Ranks existentes permanecem; Canhão passa a melhorar a recarga especial e Disparo rápido usa o novo limite. Os textos das habilidades são reconstruídos ao carregar.

A recarga é gasta ao iniciar a preparação e salva nesse instante. Pausa, perda de foco, diagnóstico, escolha de habilidade, questão, checkpoint e troca de mapa cancelam a preparação e limpam a entrada, preservando a recarga. Carregar não restaura projéteis nem preparação; não há recarga offline. Só uma campanha nova reinicia os temporizadores. Defesa, cura, XP, objetivos, reparos e vida dos inimigos não foram rebalanceados nesta etapa.

## Verificação

`python tests/run_review.py --combat-v2 --result-label combat-v2` executa o controlador e as colisões reais em Chrome isolado, incluindo regressões dos inimigos e VIRUS ZERO. Repetir com `--viewport 390x844` verifica limites do HUD e botões. A suíte cobre cadência em 30/60/120/144 Hz, buffer de entrada, teclado e ponteiros, movimento/salto, paredes finas, perfuração limitada, contatos repetidos, recarga, pausa, mapas, saves antigos/novos, áudio e efeitos reduzidos. Eventos de entrada são despachados no DOM; não substituem uma sessão manual prolongada de equilíbrio.
